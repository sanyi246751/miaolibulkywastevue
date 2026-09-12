import { useState } from '../../vueHooks.js'

const columns = [
  ['case_no', '預約單號'], ['applicant', '申請人'], ['phone', '聯絡電話'], ['address', '清運地址'], ['waste_type', '申報品項'], ['quantity', '件數'], ['status', '案件狀態'], ['requested_scheduled_at', '希望日期'], ['dispatch_period', '時段'], ['vehicle_no', '車號'], ['worker_name', '清運人員'], ['fee_amount', '費用'], ['created_at', '建立時間'], ['updated_at', '最後更新'],
]
const defaults = ['case_no', 'applicant', 'address', 'waste_type', 'quantity', 'status', 'requested_scheduled_at', 'dispatch_period', 'vehicle_no']

export default function DatabaseViewer({ cases, getMinguoTime }) {
  const [selected, setSelected] = useState(() => { try { const saved = JSON.parse(localStorage.getItem('miaoli_database_columns') || '[]'); return Array.isArray(saved) && saved.length ? saved : defaults } catch { return defaults } })
  const [keyword, setKeyword] = useState('')
  const [period, setPeriod] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const toggle = (key) => setSelected((old) => { const next = old.includes(key) ? old.filter((item) => item !== key) : [...old, key]; localStorage.setItem('miaoli_database_columns', JSON.stringify(next)); return next })
  const visibleColumns = columns.filter(([key]) => selected.includes(key))
  const today = new Date()
  const todayText = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3
  const quarterStart = `${today.getFullYear()}-${String(quarterStartMonth + 1).padStart(2, '0')}-01`
  const yearStart = `${today.getFullYear()}-01-01`
  const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
  const records = cases.filter((item) => {
    const created = String(item.created_at || '').slice(0, 10)
    const inPeriod = period === 'all' || (period === 'year' && created >= yearStart && created <= todayText) || (period === 'month' && created >= monthStart && created <= todayText) || (period === 'quarter' && created >= quarterStart && created <= todayText) || (period === 'custom' && (!dateFrom || created >= dateFrom) && (!dateTo || created <= dateTo))
    return inPeriod && Object.values(item).join(' ').toLowerCase().includes(keyword.trim().toLowerCase())
  })
  const value = (item, key) => {
    if (key === 'requested_scheduled_at' || key === 'created_at' || key === 'updated_at') return getMinguoTime(item[key])
    if (key === 'fee_amount') return `NT$ ${Number(item[key] || 0).toLocaleString()}`
    return item[key] ?? '—'
  }
  const exportCsv = () => {
    if (!visibleColumns.length) return
    const escape = (cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`
    const csv = '\ufeff' + [visibleColumns.map(([, label]) => escape(label)).join(','), ...records.map((item) => visibleColumns.map(([key]) => escape(value(item, key))).join(','))].join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a'); link.href = url; link.download = `清運案件資料_${todayText}.csv`; link.click(); URL.revokeObjectURL(url)
  }
  return <main className="mx-auto max-w-[1600px] p-4 sm:p-6"><header className="mb-5"><p className="text-sm font-black text-emerald-700">資料庫檢視</p><h2 className="mt-1 text-2xl font-black">案件資料表</h2><p className="mt-2 text-sm text-slate-500">可勾選要顯示的欄位；欄位選擇會保留在此瀏覽器。</p></header><section className="rounded-2xl bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold text-slate-600">搜尋案件資料<input value={keyword} onInput={(event) => setKeyword(event.target.value)} placeholder="單號、姓名、地址、狀態…" className="mt-1 w-full rounded-xl border px-4 py-2.5 font-normal"/></label><label className="text-sm font-bold text-slate-600">時間區隔<select value={period} onChange={(event) => setPeriod(event.target.value)} className="mt-1 w-full rounded-xl border px-4 py-2.5 font-normal"><option value="all">全部時間</option><option value="year">今年度</option><option value="quarter">本季</option><option value="month">本月</option><option value="custom">自訂區間</option></select></label>{period === 'custom' && <div className="sm:col-span-2 grid grid-cols-2 gap-3"><label className="text-sm font-bold text-slate-600">開始日期<input type="date" value={dateFrom} onInput={(event) => setDateFrom(event.target.value)} className="mt-1 w-full rounded-xl border px-4 py-2.5 font-normal"/></label><label className="text-sm font-bold text-slate-600">結束日期<input type="date" value={dateTo} onInput={(event) => setDateTo(event.target.value)} className="mt-1 w-full rounded-xl border px-4 py-2.5 font-normal"/></label></div>}</div><div className="lg:max-w-3xl"><p className="mb-2 text-sm font-black">顯示項目</p><div className="flex flex-wrap gap-2">{columns.map(([key, label]) => <label key={key} className={'cursor-pointer rounded-full border px-3 py-1.5 text-xs font-bold ' + (selected.includes(key) ? 'border-emerald-600 bg-emerald-700 text-white' : 'border-slate-300 bg-white text-slate-600')}><input type="checkbox" checked={selected.includes(key)} onChange={() => toggle(key)} className="sr-only"/>{label}</label>)}</div></div></div></section><section className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm"><div className="flex items-center justify-between gap-3 border-b px-5 py-4"><h3 className="font-black">案件資料</h3><div className="flex items-center gap-3"><span className="text-sm font-bold text-slate-500">{records.length} 筆</span><button type="button" disabled={!visibleColumns.length} onClick={exportCsv} className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-black text-white disabled:opacity-40">⇩ 匯出 CSV</button></div></div>{visibleColumns.length ? <div className="max-h-[65vh] overflow-auto"><table className="min-w-max w-full text-left text-sm"><thead className="sticky top-0 bg-slate-100 text-xs text-slate-600"><tr>{visibleColumns.map(([key, label]) => <th key={key} className="whitespace-nowrap px-4 py-3">{label}</th>)}</tr></thead><tbody className="divide-y">{records.map((item) => <tr key={item.case_no} className="hover:bg-emerald-50">{visibleColumns.map(([key]) => <td key={key} className="max-w-xs whitespace-nowrap px-4 py-3">{key === 'case_no' ? <strong className="text-emerald-700">{value(item, key)}</strong> : key === 'address' || key === 'waste_type' ? <span className="block max-w-xs truncate" title={String(value(item, key))}>{value(item, key)}</span> : value(item, key)}</td>)}</tr>)}{!records.length && <tr><td colSpan={visibleColumns.length} className="py-14 text-center font-bold text-slate-400">沒有符合的資料</td></tr>}</tbody></table></div> : <p className="p-12 text-center font-bold text-slate-400">請至少選擇一個顯示項目</p>}</section></main>
}
