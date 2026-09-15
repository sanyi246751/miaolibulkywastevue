import { useEffect, useState } from '../../vueHooks.js'
import { adminPost } from '../../api.js'

const caseColumns = [['case_no','預約單號'],['applicant','申請人姓名'],['phone','聯絡電話'],['email','電子郵件'],['address','清運地址'],['waste_type','申報清運品項'],['quantity','申報件數'],['status','案件狀態'],['requested_scheduled_at','民眾希望清運日期'],['scheduled_at','管理端排定清運日期'],['dispatch_period','清運時段'],['dispatch_trip','班次'],['vehicle_no','派車車號'],['worker_name','清運人員'],['dispatch_origin','清運車出發點'],['dispatch_note','派車／現場備註'],['quantity_review_status','人工覆核狀態'],['confirmed_items','人工確認品項明細'],['review_note','人工覆核說明'],['chargeable_quantity','計費件數'],['fee_amount','應收費用'],['annual_count','年度申請次數'],['photo_paths','待清運照片'],['completion_photo_paths','結案照片'],['ai_result','AI 判讀結果'],['latitude','緯度'],['longitude','經度'],['completion_distance_km','結案里程'],['completion_carbon_kg','結案碳排量'],['report_source','申請來源'],['created_at','建立時間'],['updated_at','最後更新時間']]
const defaults = ['case_no','applicant','address','waste_type','quantity','status','requested_scheduled_at','dispatch_period','vehicle_no','completion_photo_paths']
const tables = [['cases','案件資料'],['vehicles','車輛資料'],['workers','清運人員資料'],['system_settings','系統設定'],['case_history','案件歷程'],['photo_sync_jobs','照片同步紀錄']]
const labels = {id:'資料識別碼',case_no:'預約單號',applicant:'申請人姓名',phone:'聯絡電話',email:'電子郵件',address:'清運地址',waste_type:'申報清運品項',quantity:'申報件數',status:'案件狀態',vehicle_no:'派車車號',fuel_efficiency:'公里／公升',co2_per_liter:'kg CO₂／L',active:'啟用狀態',name:'姓名',setting_key:'設定名稱',setting_value:'設定值',case_id:'案件識別碼',action:'動作',detail:'內容',actor_id:'操作人識別碼',created_at:'建立時間',updated_at:'最後更新時間'}

const photoList = (value) => Array.isArray(value) ? value : (() => { try { const parsed = JSON.parse(value || '[]'); return Array.isArray(parsed) ? parsed : [] } catch { return [] } })()
function PhotoCell({ value }) {
  const [loadingId, setLoadingId] = useState('')
  const ids = photoList(value).map((photo) => typeof photo === 'string' ? photo : photo?.fileId || photo?.path).filter(Boolean)
  if (!ids.length) return <span>—</span>
  const openPhoto = async (fileId, index) => {
    const popup = window.open('', '_blank')
    if (!popup) return window.alert('瀏覽器已封鎖新分頁，請允許此網站開啟彈出式視窗。')
    popup.opener = null
    popup.document.write('<title>照片讀取中</title><p style="font-family:sans-serif;text-align:center;padding:2rem">照片讀取中…</p>')
    try {
      setLoadingId(fileId)
      if (fileId.startsWith('drive:')) {
        try {
          const directResult = await adminPost('getDriveImageUrl', { fileId })
          popup.location.replace(directResult.url)
          return
        } catch { /* 舊 GAS 尚未部署 share 時改用安全的 Base64 轉送。 */ }
      }
      const result = await adminPost('getImage', { fileId })
      const src = `data:${result.mimeType || 'image/jpeg'};base64,${result.base64}`
      popup.document.open()
      popup.document.write(`<title>案件照片 ${index + 1}</title><body style="margin:0;background:#111"><img src="${src}" alt="案件照片 ${index + 1}" style="max-width:100%;height:auto;display:block;margin:auto"></body>`)
      popup.document.close()
    } catch {
      popup.document.open()
      popup.document.write('<title>照片讀取失敗</title><p style="font-family:sans-serif;text-align:center;padding:2rem">照片讀取失敗，請關閉此頁後重試。</p>')
      popup.document.close()
    } finally {
      setLoadingId('')
    }
  }
  return <div className="flex min-w-[96px] flex-col items-start gap-1">{ids.map((fileId, index) => <button key={`${fileId}-${index}`} type="button" disabled={Boolean(loadingId)} onClick={() => openPhoto(fileId, index)} className="text-sm font-bold text-emerald-700 underline underline-offset-2 hover:text-emerald-900 disabled:cursor-wait disabled:text-slate-400">{loadingId === fileId ? '照片讀取中…' : `查看照片 ${index + 1}`}</button>)}</div>
}

export default function DatabaseViewer({ cases, getMinguoTime }) {
  const [selected, setSelected] = useState(() => { try { const saved = JSON.parse(localStorage.getItem('miaoli_database_columns') || '[]'); return saved.length ? [...saved, ...defaults.filter((key) => key === 'completion_photo_paths' && !saved.includes(key))] : defaults } catch { return defaults } })
  const [table, setTable] = useState('cases'), [database, setDatabase] = useState({ cases }), [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState(''), [period, setPeriod] = useState('all'), [dateFrom, setDateFrom] = useState(''), [dateTo, setDateTo] = useState('')
  const [draggingKey, setDraggingKey] = useState('')
  const persist = (next) => { localStorage.setItem('miaoli_database_columns', JSON.stringify(next)); setSelected(next) }
  const toggle = (key) => persist(selected.includes(key) ? selected.filter((x) => x !== key) : [...selected, key])
  const move = (key, offset) => { const index = selected.indexOf(key), target = index + offset; if (index < 0 || target < 0 || target >= selected.length) return; const next = [...selected]; [next[index], next[target]] = [next[target], next[index]]; persist(next) }
  useEffect(() => { let cancelled = false; setLoading(true); adminPost('databaseView').then((result) => { if (!cancelled) setDatabase(result.database || { cases }) }).catch(() => { if (!cancelled) setDatabase({ cases }) }).finally(() => { if (!cancelled) setLoading(false) }); return () => { cancelled = true } }, [cases])
  const now = new Date(), today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`, monthStart = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`, quarterStart = `${now.getFullYear()}-${String(Math.floor(now.getMonth()/3)*3+1).padStart(2,'0')}-01`, yearStart = `${now.getFullYear()}-01-01`
  const source = table === 'cases' ? (database.cases || cases) : (database[table] || [])
  const columns = table === 'cases' ? selected.map((key) => caseColumns.find(([k]) => k === key)).filter(Boolean) : (source[0] ? Object.keys(source[0]).map((key) => [key, labels[key] || key]) : [])
  const records = source.filter((item) => { const date = String(item.created_at || '').slice(0,10), inPeriod = table !== 'cases' || period === 'all' || period === 'year' && date >= yearStart && date <= today || period === 'quarter' && date >= quarterStart && date <= today || period === 'month' && date >= monthStart && date <= today || period === 'custom' && (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo); return inPeriod && Object.values(item).join(' ').toLowerCase().includes(keyword.trim().toLowerCase()) })
  useEffect(() => {
    if (table !== 'cases') return
    const headers = [...document.querySelectorAll('thead th')].slice(1)
    const removers = headers.map((header, index) => {
      const targetKey = columns[index]?.[0]
      if (!targetKey) return () => {}
      header.draggable = true; header.style.cursor = 'grab'; header.title = '可拖曳此欄位左右移動'
      const start = () => setDraggingKey(targetKey)
      const over = (event) => event.preventDefault()
      const drop = (event) => { event.preventDefault(); if (!draggingKey || draggingKey === targetKey) return; const from = selected.indexOf(draggingKey), to = selected.indexOf(targetKey); if (from < 0 || to < 0) return; const next = [...selected]; next.splice(from, 1); next.splice(to, 0, draggingKey); setSelected(next); if (window.confirm('確認儲存拖曳後的欄位順序嗎？')) localStorage.setItem('miaoli_database_columns', JSON.stringify(next)); setDraggingKey('') }
      header.addEventListener('dragstart', start); header.addEventListener('dragover', over); header.addEventListener('drop', drop)
      return () => { header.removeEventListener('dragstart', start); header.removeEventListener('dragover', over); header.removeEventListener('drop', drop); header.draggable = false; header.style.cursor = '' }
    })
    return () => removers.forEach((remove) => remove())
  }, [table, selected, draggingKey])
  const value = (item, key) => { if (['requested_scheduled_at','scheduled_at','created_at','updated_at'].includes(key)) return getMinguoTime(item[key]); if (key === 'fee_amount') return `NT$ ${Number(item[key] || 0).toLocaleString()}`; if (key === 'photo_paths' || key === 'completion_photo_paths') return <PhotoCell value={item[key]}/>; const raw = item[key]; return raw == null ? '—' : typeof raw === 'object' ? JSON.stringify(raw) : raw }
  const exportCsv = () => { if (!columns.length) return; const cell = (v) => `"${String(v ?? '').replaceAll('"','""')}"`, csv = '\ufeff' + [columns.map(([,label]) => cell(label)).join(','),...records.map((item) => columns.map(([key]) => cell(value(item,key))).join(','))].join('\r\n'), url = URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})), link = document.createElement('a'); link.href=url; link.download=`${tables.find(([key])=>key===table)?.[1]}_${today}.csv`; link.click(); URL.revokeObjectURL(url) }
  const remove = async (item) => { const keyValue = table === 'cases' ? item.case_no : table === 'system_settings' ? item.setting_key : item.id; if (!keyValue || !window.confirm('確定刪除這筆資料嗎？此動作無法復原。')) return; try { await adminPost('databaseDelete',{table,keyValue}); setDatabase((old) => ({...old,[table]:(old[table] || []).filter((row) => (table === 'cases' ? row.case_no : table === 'system_settings' ? row.setting_key : row.id) !== keyValue)})) } catch (error) { window.alert(`刪除失敗：${error.message}`) } }
  return <main className="mx-auto max-w-[1600px] p-4 sm:p-6"><header className="mb-5"><p className="text-sm font-black text-emerald-700">資料庫檢視</p><h2 className="mt-1 text-2xl font-black">Supabase 資料庫</h2><p className="mt-2 text-sm text-slate-500">可切換所有系統資料表；案件資料可自訂欄位、時間與照片。</p></header><nav className="mb-5 flex flex-wrap gap-2">{tables.map(([key,label]) => <button key={key} onClick={() => setTable(key)} className={'rounded-xl px-4 py-2.5 text-sm font-black '+(table===key?'bg-emerald-700 text-white':'bg-white text-slate-600 shadow-sm')}>{label}{table===key&&loading?'（讀取中）':''}</button>)}</nav><section className="rounded-2xl bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:justify-between"><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold text-slate-600">搜尋資料<input value={keyword} onInput={(e)=>setKeyword(e.target.value)} className="mt-1 w-full rounded-xl border px-4 py-2.5 font-normal"/></label>{table==='cases'&&<label className="text-sm font-bold text-slate-600">時間區隔<select value={period} onChange={(e)=>setPeriod(e.target.value)} className="mt-1 w-full rounded-xl border px-4 py-2.5 font-normal"><option value="all">全部時間</option><option value="year">今年度</option><option value="quarter">本季</option><option value="month">本月</option><option value="custom">自訂區間</option></select></label>}{table==='cases'&&period==='custom'&&<div className="sm:col-span-2 grid grid-cols-2 gap-3"><label>開始日期<input type="date" value={dateFrom} onInput={(e)=>setDateFrom(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2"/></label><label>結束日期<input type="date" value={dateTo} onInput={(e)=>setDateTo(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2"/></label></div>}</div>{table==='cases'&&<div className="lg:max-w-3xl"><p className="mb-2 text-sm font-black">顯示項目（已選欄位可用 ← → 調整左右順序）</p><div className="flex flex-wrap gap-2">{caseColumns.map(([key,label]) => <span key={key} className={'inline-flex items-center rounded-full border text-xs font-bold '+(selected.includes(key)?'border-emerald-600 bg-emerald-700 text-white':'border-slate-300 bg-white text-slate-600')}><label className="cursor-pointer px-3 py-1.5"><input type="checkbox" checked={selected.includes(key)} onChange={()=>toggle(key)} className="sr-only"/>{label}</label>{selected.includes(key)&&<><button onClick={()=>move(key,-1)} className="border-l border-white/30 px-2 py-1.5">←</button><button onClick={()=>move(key,1)} className="border-l border-white/30 px-2 py-1.5">→</button></>}</span>)}</div></div>}</div></section><section className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm"><div className="flex items-center justify-between gap-3 border-b px-5 py-4"><h3 className="font-black">{tables.find(([key])=>key===table)?.[1]}</h3><div className="flex gap-3"><span className="text-sm font-bold text-slate-500">{records.length} 筆</span><button disabled={!columns.length} onClick={exportCsv} className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-black text-white disabled:opacity-40">⇩ 匯出 CSV</button></div></div>{columns.length?<div className="max-h-[65vh] overflow-auto"><table className="min-w-max w-full text-left text-sm"><thead className="sticky top-0 bg-slate-100 text-xs text-slate-600"><tr><th className="px-3 py-3">刪除</th>{columns.map(([key,label])=><th key={key} className="whitespace-nowrap px-4 py-3">{label}</th>)}</tr></thead><tbody className="divide-y">{records.map((item,index)=><tr key={item.case_no||item.id||index} className="hover:bg-emerald-50"><td className="px-3 py-3"><button onClick={()=>remove(item)} className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-black text-rose-700">刪除</button></td>{columns.map(([key])=><td key={key} className="max-w-xs whitespace-nowrap px-4 py-3">{key==='case_no'?<strong className="text-emerald-700">{value(item,key)}</strong>:<span className="block max-w-xs truncate" title={String(value(item,key))}>{value(item,key)}</span>}</td>)}</tr>)}{!records.length&&<tr><td colSpan={columns.length+1} className="py-14 text-center font-bold text-slate-400">沒有符合的資料</td></tr>}</tbody></table></div>:<p className="p-12 text-center font-bold text-slate-400">目前沒有資料</p>}</section></main>
}
