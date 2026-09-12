import { useEffect, useMemo, useRef, useState } from '../vueHooks.js'
import { adminLogin, adminPost, toCasePayload } from '../api.js'
import { getMinguoTime } from './utils/formatters.js'
import SystemSettings from './components/SystemSettings.jsx'
import SupabaseDashboard from './components/SupabaseDashboard.jsx'
import PhoneApplication from './components/PhoneApplication.jsx'

const statuses = ['全部', '待處理', '已排班', '清運完成', '已取消']
const statusPageMeta = {
  '全部': { title: '全部案件', description: '檢視所有案件與目前進度。' },
  '待處理': { title: '待處理案件', description: '完成人工逐項覆核後，才可核可排班。' },
  '已排班': { title: '已排班案件', description: '確認清運日期、時段、車號與清運人員後，可開始清運。' },
  '清運完成': { title: '清運完成案件', description: '已完成的案件紀錄，保留供查詢與列印。' },
  '已取消': { title: '已取消案件', description: '已撤案或取消的案件紀錄。' },
}
const periods = ['', '上午8點至12點', '下午1點至5點']
const categories = ['床墊', '櫃子', '桌子', '椅子', '電視', '冰箱', '其他']
const pageTabs = ['案件清單與進度', '待處理', '已排班', '清運完成', '已取消', '電話申請', 'Dashboard', '系統設定']
const tabStatus = { '案件清單與進度': '全部', '待處理': '待處理', '已排班': '已排班', '清運完成': '清運完成', '已取消': '已取消' }
const dispatchDateKey = (value) => {
  const text = String(value || '').trim()
  const match = text.match(/^(\d{2,4})[\/.\-](\d{1,2})[\/.\-](\d{1,2})/)
  if (!match) return text.slice(0, 10)
  const year = Number(match[1]) < 1911 ? Number(match[1]) + 1911 : Number(match[1])
  return `${year}-${String(match[2]).padStart(2, '0')}-${String(match[3]).padStart(2, '0')}`
}
const dispatchGroupKey = (item) => [dispatchDateKey(item.scheduled_at), String(item.vehicle_no || '').trim(), String(item.dispatch_period || ''), Number(item.dispatch_trip || 1)].join('|')
const splitCrewMembers = (value) => String(value || '').split(/[、，,\n]+/).map((member) => member.trim()).filter(Boolean)

const dateTimeLocal = (value) => {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return String(value).slice(0, 16).replace(' ', 'T')
  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

const parseMinguoDateTime = (value) => {
  const match = String(value || '').trim().match(/^(\d{2,3})\s*[\/.-]\s*(\d{1,2})\s*[\/.-]\s*(\d{1,2})(?:\s*(上午|下午)?\s*(\d{1,2})?(?::(\d{1,2}))?)?$/)
  if (!match) return ''
  const [, rocYear, month, day, period, hourText, minuteText] = match
  let hour = Number(hourText || 0)
  if (hour > 23 || Number(minuteText || 0) > 59) return ''
  if (period === '下午' && hour < 12) hour += 12
  if (period === '上午' && hour === 12) hour = 0
  const parsed = new Date(Number(rocYear) + 1911, Number(month) - 1, Number(day), hour, Number(minuteText || 0))
  if (parsed.getFullYear() !== Number(rocYear) + 1911 || parsed.getMonth() !== Number(month) - 1 || parsed.getDate() !== Number(day)) return ''
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}T${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`
}

const parseItems = (value) => {
  try {
    const result = JSON.parse(value || '[]')
    return Array.isArray(result) ? result : []
  } catch {
    return []
  }
}

const declaredCounts = (wasteType) => Object.fromEntries(categories.map((name) => {
  const match = String(wasteType || '').match(new RegExp(`${name}\\s*(?:×|x|X)\\s*(\\d+)`))
  return [name, match ? Number(match[1]) : String(wasteType || '').includes(name) ? 1 : 0]
}))

export default function AdminApp() {
  const [token, setToken] = useState(() => sessionStorage.getItem('admin_api_token') || '')
  const [emailInput, setEmailInput] = useState('')
  const [tokenInput, setTokenInput] = useState('')
  const [cases, setCases] = useState([])
  const [selectedNo, setSelectedNo] = useState('')
  const [filter, setFilter] = useState('待處理')
  const [page, setPage] = useState('待處理')
  const [keyword, setKeyword] = useState('')
  const [useDateRange, setUseDateRange] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [draft, setDraft] = useState(null)
  const [reviewCounts, setReviewCounts] = useState({})
  const [dispatchOptions, setDispatchOptions] = useState({ vehicles: [], workers: [], route_origin: '24.380891,120.734372' })
  const [vehicleSettings, setVehicleSettings] = useState([])
  const [workerSettings, setWorkerSettings] = useState([])
  const [routeOriginSettings, setRouteOriginSettings] = useState('24.380891,120.734372')
  const [workerSelections, setWorkerSelections] = useState([''])
  const [scheduleEditing, setScheduleEditing] = useState(false)
  const [pendingPhotos, setPendingPhotos] = useState([])
  const [pendingPhotoPreview, setPendingPhotoPreview] = useState(null)
  const completionInput = useRef(null)

  const loadCases = async (selectStatus = '') => {
    setLoading(true); setMessage('')
    try {
      const result = await adminPost('list')
      setCases(result.cases || [])
      if (selectStatus) setSelectedNo(result.cases?.find((item) => item.status === selectStatus)?.case_no || '')
      else if (!selectedNo && result.cases?.length) setSelectedNo(result.cases.find((item) => item.status === '待處理')?.case_no || result.cases[0].case_no)
    } catch (error) {
      setMessage(error.message)
      if (/Token/.test(error.message)) logout()
    } finally { setLoading(false) }
  }

  const loadDispatchOptions = async () => {
    const result = await adminPost('dispatchOptions')
    // 相容已部署的舊版 Apps Script（直接回傳 vehicles／workers）與新版巢狀 dispatch 格式。
    const options = result.dispatch || result
    const vehicles = Array.isArray(options.vehicles) ? options.vehicles : []
    const workers = Array.isArray(options.workers) ? options.workers : []
    const routeOrigin = String(options.route_origin || '24.380891,120.734372')
    setDispatchOptions({ vehicles, workers, route_origin: routeOrigin })
    setVehicleSettings(vehicles.map((item) => ({ ...item })))
    setWorkerSettings([...workers])
    setRouteOriginSettings(routeOrigin)
  }

  useEffect(() => {
    if (!token) return
    loadCases()
    loadDispatchOptions().catch((error) => setMessage(`派車設定載入失敗：${error.message}`))
  }, [token])
  useEffect(() => {
    const item = cases.find((entry) => entry.case_no === selectedNo) || null
    setDraft(item ? { ...item } : null)
    setScheduleEditing(false)
    setWorkerSelections(item ? (splitCrewMembers(item.worker_name).length ? splitCrewMembers(item.worker_name) : ['']) : [''])
    if (item) {
      const counts = Object.fromEntries(categories.map((name) => [name, 0]))
      const confirmedItems = parseItems(item.confirmed_items)
      confirmedItems.forEach((entry) => {
        const name = categories.includes(entry.type) ? entry.type : categories.includes(entry.name) ? entry.name : '其他'
        counts[name] += Number(entry.quantity ?? entry.count ?? 0)
      })
      // 尚未有人工作業時，直接帶入民眾申報量作為覆核起始值。
      setReviewCounts(confirmedItems.length ? counts : declaredCounts(item.waste_type))
    }
  }, [cases, selectedNo])

  useEffect(() => {
    const selected = cases.find((item) => item.case_no === selectedNo)
    const completionMatch = String(selected?.dispatch_note || '').match(/結案照片 Google Drive ID：(\[[^\n]*\])/)
    let notePhotoPaths = []
    try { notePhotoPaths = completionMatch ? JSON.parse(completionMatch[1]) : [] } catch { notePhotoPaths = [] }
    const photoPaths = page === '清運完成' ? (Array.isArray(selected?.completion_photo_paths) && selected.completion_photo_paths.length ? selected.completion_photo_paths : notePhotoPaths) : Array.isArray(selected?.photo_paths) ? selected.photo_paths : []
    let cancelled = false
    setPendingPhotos([])
    if (!['待處理', '已排班', '清運完成'].includes(page) || !photoPaths.length) return () => { cancelled = true }

    Promise.all(photoPaths.map(async (photo, index) => {
      const fileId = typeof photo === 'string' ? photo : photo?.fileId || photo?.path
      if (!fileId) return null
      try {
        const result = await adminPost('getImage', { fileId })
        return { id: fileId, index, src: `data:image/jpeg;base64,${result.base64}` }
      } catch {
        return { id: fileId, index, error: true }
      }
    })).then((photos) => { if (!cancelled) setPendingPhotos(photos.filter(Boolean)) })
    return () => { cancelled = true }
  }, [cases, selectedNo, page])

  const visibleCases = useMemo(() => {
    const filtered = cases.filter((item) => {
    const statusMatch = filter === '全部' || item.status === filter
    const text = [item.case_no, item.applicant, item.phone, item.address, item.waste_type, item.vehicle_no].join(' ').toLowerCase()
    const created = String(item.created_at || '').slice(0, 10)
    const dateMatch = !useDateRange || ((!dateFrom || created >= dateFrom) && (!dateTo || created <= dateTo))
    return statusMatch && dateMatch && text.includes(keyword.trim().toLowerCase())
    })
    return filter === '已排班' ? filtered.sort((first, second) => dispatchGroupKey(first).localeCompare(dispatchGroupKey(second), 'zh-Hant')) : filtered
  }, [cases, filter, keyword, useDateRange, dateFrom, dateTo])

  useEffect(() => {
    const selectedIsVisible = visibleCases.some((item) => item.case_no === selectedNo)
    if (!selectedIsVisible) setSelectedNo(visibleCases[0]?.case_no || '')
  }, [visibleCases, selectedNo])

  const pageTabCounts = useMemo(() => Object.fromEntries(pageTabs.map((tab) => [
    tab,
    ['電話申請', 'Dashboard', '系統設定'].includes(tab) ? null : tab === '案件清單與進度' ? cases.length : cases.filter((item) => item.status === tabStatus[tab]).length,
  ])), [cases])

  const scheduledGroupStyles = useMemo(() => {
    // 結案案件不會再顯示於已排班頁，但仍是原班次的一員；以完整班次
    // 計數並固定由班次鍵決定顏色，避免同班案件結案後留存案件失去色框。
    const counts = cases.filter((item) => ['已排班', '清運中', '清運完成'].includes(item.status)).reduce((result, item) => {
      const key = dispatchGroupKey(item); result[key] = (result[key] || 0) + 1; return result
    }, {})
    return Object.fromEntries(Object.keys(counts).filter((key) => counts[key] > 1).map((key) => {
      const hue = Array.from(key).reduce((sum, char, index) => sum + (index + 1) * char.charCodeAt(0), 0) % 360
      return [key, { backgroundColor: `hsl(${hue} 78% 92%)`, borderColor: `hsl(${hue} 55% 48%)` }]
    }))
  }, [cases])

  const dispatchTripChoices = useMemo(() => {
    if (!draft?.vehicle_no || !draft?.scheduled_at || !draft?.dispatch_period) return [{ trip: 1, label: '建立第 1 班', mode: 'new' }]
    const date = dispatchDateKey(draft.scheduled_at)
    const used = [...new Set(cases.filter((item) => item.case_no !== draft.case_no && item.status === '已排班' && dispatchDateKey(item.scheduled_at) === date && String(item.vehicle_no || '').trim() === String(draft.vehicle_no || '').trim() && item.dispatch_period === draft.dispatch_period).map((item) => Number(item.dispatch_trip || 1)))].sort((first, second) => first - second)
    if (!used.length) return [{ trip: 1, label: '建立第 1 班', mode: 'new' }]
    const lastTrip = used[used.length - 1]
    return [{ trip: lastTrip, label: `併入第 ${lastTrip} 班`, mode: 'merge' }, { trip: lastTrip + 1, label: `新增第 ${lastTrip + 1} 班`, mode: 'new' }]
  }, [cases, draft?.case_no, draft?.scheduled_at, draft?.vehicle_no, draft?.dispatch_period])

  const setDispatchWorkers = (members) => {
    const cleaned = [...new Set(members.map((member) => String(member || '').trim()).filter(Boolean))]
    setWorkerSelections(cleaned.length ? cleaned : [''])
    setDraft({ ...draft, worker_name: cleaned.join('、') })
  }

  const selectDispatchTrip = (value) => {
    const trip = Number(value)
    const date = dispatchDateKey(draft.scheduled_at)
    const mergedCase = cases.find((item) => item.case_no !== draft.case_no && item.status === '已排班' && dispatchDateKey(item.scheduled_at) === date && String(item.vehicle_no || '').trim() === String(draft.vehicle_no || '').trim() && item.dispatch_period === draft.dispatch_period && Number(item.dispatch_trip || 1) === trip)
    // 併入既有班次時，清運人員必須沿用該班的同一組人員。
    if (mergedCase?.worker_name) {
      setDispatchWorkers(splitCrewMembers(mergedCase.worker_name))
      setDraft((current) => ({ ...current, dispatch_trip: trip, worker_name: mergedCase.worker_name }))
    } else setDraft({ ...draft, dispatch_trip: trip })
  }

  const updateDispatchContext = (changes) => {
    const next = { ...draft, ...changes }
    if (!next.vehicle_no || !next.scheduled_at || !next.dispatch_period) return setDraft({ ...next, dispatch_trip: 1 })
    const date = dispatchDateKey(next.scheduled_at)
    const used = [...new Set(cases.filter((item) => item.case_no !== next.case_no && item.status === '已排班' && dispatchDateKey(item.scheduled_at) === date && String(item.vehicle_no || '').trim() === String(next.vehicle_no || '').trim() && item.dispatch_period === next.dispatch_period).map((item) => Number(item.dispatch_trip || 1)))].sort((first, second) => first - second)
    // 與桌面版一致：調整日期、時段或車號後，預設建立下一班，而非誤併舊班次。
    setDraft({ ...next, dispatch_trip: used.length ? used[used.length - 1] + 1 : 1 })
  }

  const login = async (event) => {
    event.preventDefault()
    const value = tokenInput.trim()
    if (!value) return
    setLoading(true); setMessage('')
    try {
      const result = await adminLogin(emailInput.trim(), value)
      sessionStorage.setItem('admin_api_token', result.token)
      setToken(result.token); setTokenInput('')
    } catch (error) { setMessage(error.message) } finally { setLoading(false) }
  }
  const logout = () => { sessionStorage.removeItem('admin_api_token'); setToken(''); setCases([]) }

  const save = async (changes = {}, success = '案件已更新', selectStatus = '') => {
    if (!draft) return
    const next = { ...draft, ...changes }
    setLoading(true); setMessage('')
    try {
      await adminPost('upsert', { case: toCasePayload(next) })
      setMessage(success)
      await loadCases(selectStatus)
      if (!selectStatus) setSelectedNo(next.case_no)
    } catch (error) { setMessage(error.message) } finally { setLoading(false) }
  }

  const approveReview = async () => {
    const items = categories.map((type) => ({ type, quantity: Math.max(0, Number(reviewCounts[type] || 0)) })).filter((item) => item.quantity > 0)
    const total = items.reduce((sum, item) => sum + item.quantity, 0)
    if (!total) return setMessage('請至少填寫一項人工確認品項')
    const chargeable = annualApplicationCount <= 3 ? Math.max(0, total - 2) : total
    // 立即反映覆核結果，避免使用者必須等候雲端寫入及完整清單重新載入。
    const previousDraft = draft
    const approvedDraft = { ...draft, quantity: total, annual_count: annualApplicationCount, quantity_review_status: '人工已核可', confirmed_items: JSON.stringify(items), chargeable_quantity: chargeable, fee_amount: chargeable * 200 }
    setDraft(approvedDraft)
    setCases((current) => current.map((item) => item.case_no === approvedDraft.case_no ? approvedDraft : item))
    setLoading(true); setMessage('人工已核可，正在同步…')
    try {
      await adminPost('upsert', { case: toCasePayload(approvedDraft) })
      setMessage('人工覆核已完成')
    } catch (error) {
      setDraft(previousDraft)
      setCases((current) => current.map((item) => item.case_no === previousDraft.case_no ? previousDraft : item))
      setMessage(`覆核同步失敗，已還原：${error.message}`)
    } finally { setLoading(false) }
  }

  const schedule = async () => {
    if (draft.quantity_review_status !== '人工已核可') return setMessage('核可排班前，必須先完成逐項人工確認')
    if (!draft.scheduled_at || !draft.vehicle_no || !draft.worker_name || !draft.dispatch_period) return setMessage('請填寫管理端排定的清運日期、清運時段、車號及班組')
    if (!dispatchOptions.vehicles.some((item) => item.vehicle_no === draft.vehicle_no)) return setMessage('請由派車設定選擇有效車號')
    if (!splitCrewMembers(draft.worker_name).every((member) => dispatchOptions.workers.includes(member))) return setMessage('請由清運人員設定選擇有效姓名')
    const selectedTrip = dispatchTripChoices.some((choice) => choice.trip === Number(draft.dispatch_trip || 1)) ? Number(draft.dispatch_trip || 1) : dispatchTripChoices[dispatchTripChoices.length - 1].trip
    await save({ status: '已排班', dispatch_status: '已排班', dispatch_trip: selectedTrip }, '案件已核可排班', '待處理')
  }
  const withdrawCase = async () => {
    if (!draft) return
    const input = window.prompt(`請輸入案件「${draft.case_no}」的撤案原因（必填）：`)
    if (input === null) return
    const reason = input.trim()
    if (!reason) return setMessage('撤案原因為必填，案件尚未撤案')
    if (!window.confirm(`確定將案件「${draft.case_no}」撤案？\n\n撤案原因：${reason}`)) return
    const note = String(draft.dispatch_note || '').trim()
    await save({
      status: '已取消',
      dispatch_status: '已取消',
      dispatch_note: `${note}${note ? '\n' : ''}撤案原因：${reason}`,
    }, '案件已撤案')
  }

  const saveScheduledChanges = async () => {
    if (!draft.scheduled_at || !draft.dispatch_period || !draft.vehicle_no || !draft.worker_name) return setMessage('請填寫清運日期、時段、車號及清運人員')
    if (!dispatchOptions.vehicles.some((item) => item.vehicle_no === draft.vehicle_no)) return setMessage('請選擇有效派車車號')
    if (!splitCrewMembers(draft.worker_name).every((member) => dispatchOptions.workers.includes(member))) return setMessage('請選擇有效清運人員')
    await save({}, '排班資料已更新')
    setScheduleEditing(false)
  }

  const selectPage = (nextPage) => {
    setPage(nextPage)
    if (tabStatus[nextPage]) setFilter(tabStatus[nextPage])
  }

  const saveSystemSettings = async () => {
    const vehicles = vehicleSettings.map((item) => ({ vehicle_no: String(item.vehicle_no || '').trim(), fuel_efficiency: Number(item.fuel_efficiency || 5), co2_per_liter: Number(item.co2_per_liter || 2.69) })).filter((item) => item.vehicle_no)
    const workers = workerSettings.map((name) => String(name || '').trim()).filter(Boolean)
    if (new Set(vehicles.map((item) => item.vehicle_no)).size !== vehicles.length) return setMessage('派車資料有重複的車號')
    if (new Set(workers).size !== workers.length) return setMessage('清運人員名單有重複姓名')
    setLoading(true); setMessage('')
    try { await adminPost('updateDispatchOptions', { vehicles, workers, routeOrigin: routeOriginSettings }); await loadDispatchOptions(); setMessage('系統設定已儲存，排班選單與清運出發點已同步更新') }
    catch (error) { setMessage(error.message) } finally { setLoading(false) }
  }

  const handlePhoneCreated = async (caseNo) => {
    await loadCases()
    setSelectedNo(caseNo)
    selectPage('待處理')
    setMessage(`電話申請已建立，案件編號：${caseNo}`)
  }

  const restoreCaseStatus = async () => {
    if (!draft || draft.status !== '已取消' || !window.confirm(`確定恢復案件「${draft.case_no}」為待處理嗎？`)) return
    await save({ status: '待處理', dispatch_status: '待處理' }, '案件狀態已恢復為待處理')
    selectPage('待處理')
  }

  const deleteCase = async () => {
    if (!draft || !window.confirm(`確定刪除案件「${draft.case_no}」嗎？此動作會同步刪除雲端資料，無法復原。`)) return
    setLoading(true); setMessage('')
    try {
      await adminPost('delete', { caseNo: draft.case_no })
      setSelectedNo(''); setMessage('案件已刪除'); await loadCases()
    } catch (error) { setMessage(error.message) } finally { setLoading(false) }
  }

  const completeWithPhoto = async (event) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length || !draft) return
    if (files.some((file) => !file.type.startsWith('image/'))) return setMessage('請選擇圖片檔案')
    if (files.some((file) => file.size > 8 * 1024 * 1024)) return setMessage('每張結案照片不可超過 8 MB')
    setLoading(true); setMessage(`正在上傳結案照片（0/${files.length}）…`)
    try {
      const photoIds = []
      for (const [index, file] of files.entries()) {
        setMessage(`正在上傳結案照片（${index + 1}/${files.length}）…`)
        const base64 = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.onerror = reject; reader.readAsDataURL(file) })
        const extension = (file.name.split('.').pop() || 'jpg').replace(/[^a-z0-9]/gi, '') || 'jpg'
        const upload = await adminPost('upload', { fileName: `${draft.case_no}-finish-${index + 1}.${extension}`, mimeType: file.type, base64 })
        photoIds.push(upload.fileId)
      }
      const note = String(draft.dispatch_note || '').trim()
      await save({ status: '清運完成', dispatch_status: '清運完成', dispatch_note: `${note}${note ? '\n' : ''}結案照片 Google Drive ID：${JSON.stringify(photoIds)}` }, `已上傳 ${photoIds.length} 張結案照片，案件已標記為清運完成`)
    } catch (error) { setMessage(error.message) } finally { setLoading(false) }
  }

  const reviewApproved = draft?.quantity_review_status === '人工已核可'
  const reviewYear = new Date(draft?.created_at || Date.now()).getFullYear()
  const annualAddressCases = draft ? cases.filter((item) => String(item.address || '').trim() === String(draft.address || '').trim() && item.status !== '已取消' && new Date(item.created_at || Date.now()).getFullYear() === reviewYear).sort((first, second) => String(first.created_at || '').localeCompare(String(second.created_at || '')) || String(first.case_no || '').localeCompare(String(second.case_no || ''))) : []
  const annualApplicationCount = draft ? Math.max(1, annualAddressCases.findIndex((item) => item.case_no === draft.case_no) + 1) : 0
  const reviewTotal = categories.reduce((total, name) => total + Math.max(0, Number(reviewCounts[name] || 0)), 0)
  const reviewFreeQuantity = annualApplicationCount <= 3 ? Math.min(2, reviewTotal) : 0
  const reviewChargeableQuantity = Math.max(0, reviewTotal - reviewFreeQuantity)
  const reviewFeeAmount = reviewChargeableQuantity * 200
  // 待處理案件一定可填寫；唯有案件本身已排班且尚未按「修改」才鎖定欄位。
  const dispatchFieldsDisabled = draft?.status === '已排班' && !scheduleEditing
  const isMergingDispatch = dispatchTripChoices.some((choice) => choice.mode === 'merge' && choice.trip === Number(draft?.dispatch_trip || 1))
  const scheduledRouteCases = draft?.status === '已排班' ? cases.filter((item) => item.status === '已排班' && dispatchGroupKey(item) === dispatchGroupKey(draft)) : []

  if (!token) return <div className="min-h-screen bg-emerald-950 px-5 py-14"><form onSubmit={login} className="mx-auto max-w-sm rounded-3xl bg-white p-8 shadow-2xl"><p className="text-sm font-bold text-emerald-700">三義鄉巨大廢棄物</p><h1 className="mt-2 text-2xl font-black">管理端登入</h1><p className="mt-2 text-sm text-slate-500">使用 Supabase 管理員 Email 與密碼登入。</p>{message && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm font-bold text-rose-700">{message}</p>}<input required type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="管理員 Email" className="mt-6 w-full rounded-xl border border-slate-300 px-4 py-3"/><input required type="password" value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} placeholder="密碼" className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3"/><button disabled={loading} className="mt-4 w-full rounded-xl bg-emerald-700 py-3 font-black text-white disabled:opacity-60">{loading ? '登入中…' : '登入管理端'}</button></form></div>

  return <div className="min-h-screen bg-slate-100 text-slate-900">
    <header className="sticky top-0 z-50 bg-emerald-950 px-3 py-2 text-white shadow-md sm:px-5"><div className="mx-auto flex min-h-16 flex-wrap items-center gap-3 xl:flex-nowrap"><h1 className="shrink-0 text-xl font-black">案件管理與排班</h1><nav className="order-3 flex w-full flex-wrap gap-2 xl:order-none xl:ml-3 xl:w-auto" aria-label="案件管理頁面">{pageTabs.map((tab) => <button key={tab} type="button" onClick={() => selectPage(tab)} className={'rounded-xl px-4 py-2.5 text-sm font-black transition-colors ' + (page === tab ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-emerald-50')}><span>{tab}</span><span className={'ml-2 inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-xs ' + (page === tab ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700')}>{pageTabCounts[tab]}</span></button>)}</nav><div className="ml-auto flex shrink-0 gap-2"><button onClick={loadCases} disabled={loading} aria-busy={loading} className={'rounded-xl px-4 py-2 text-sm font-bold transition-all disabled:cursor-wait ' + (loading ? 'bg-amber-400 text-emerald-950 shadow-lg shadow-amber-400/30' : 'bg-white/10 text-white hover:bg-white/20')}><span className="inline-flex items-center gap-2">{loading && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-950/30 border-t-emerald-950" aria-hidden="true"/>}<span>{loading ? '整理中…' : '重新整理'}</span></span></button><button onClick={logout} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold">登出</button></div></div></header>
    {page === '系統設定' ? <SystemSettings vehicles={vehicleSettings} setVehicles={setVehicleSettings} workers={workerSettings} setWorkers={setWorkerSettings} routeOrigin={routeOriginSettings} setRouteOrigin={setRouteOriginSettings} loading={loading} message={message} onSave={saveSystemSettings}/> : page === '電話申請' ? <PhoneApplication createdAction={handlePhoneCreated}/> : page === 'Dashboard' ? <SupabaseDashboard cases={cases} loading={loading} reload={loadCases}/> : <main className="mx-auto max-w-7xl p-4"><div className="grid gap-5 lg:grid-cols-[390px_1fr]">
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <div><h2 className="text-lg font-black text-slate-900">{statusPageMeta[filter].title}</h2><p className="mt-1 text-xs font-bold text-slate-500">{statusPageMeta[filter].description}</p></div>
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="案件編號、申請人、電話、地址或車號" className="mt-4 w-full rounded-xl border border-slate-300 px-3 py-2.5"/>
        {page === '案件清單與進度' && <><div className="mt-3 flex flex-wrap gap-2" aria-label="案件狀態篩選">{statuses.map((status) => <button key={status} onClick={() => { setFilter(status); setPage('案件清單與進度') }} className={`rounded-full px-3 py-1.5 text-xs font-bold ${filter === status ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>{status}</button>)}</div><label className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-600"><input type="checkbox" checked={useDateRange} onChange={(e) => setUseDateRange(e.target.checked)}/> 建立時間範圍</label>{useDateRange && <div className="mt-2 grid grid-cols-2 gap-2"><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="開始日期" className="rounded-lg border border-slate-300 p-2 text-xs"/><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="結束日期" className="rounded-lg border border-slate-300 p-2 text-xs"/></div>}</>}
        <p className="mt-4 text-xs font-bold text-slate-500">共 {visibleCases.length} 件</p>
        <div className="mt-2 max-h-[68vh] space-y-2 overflow-auto">{visibleCases.map((item) => { const groupStyle = page === '已排班' ? scheduledGroupStyles[dispatchGroupKey(item)] : null; return <button key={item.case_no} onClick={() => setSelectedNo(item.case_no)} style={groupStyle || undefined} className={`w-full rounded-xl border p-3 text-left ${groupStyle ? 'border-2' : selectedNo === item.case_no ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200'}`}><div className="flex justify-between gap-2"><strong>{item.case_no}</strong>{page === '案件清單與進度' && <span className="text-xs font-bold text-emerald-700">{item.status}</span>}</div><p className="mt-1 text-sm">{item.applicant}｜{item.waste_type}</p><p className="mt-1 truncate text-xs text-slate-500">{item.address}</p>{groupStyle && <p className="mt-1 text-[10px] font-black text-slate-600">同班次｜{item.vehicle_no} 車・{item.dispatch_period}・第 {item.dispatch_trip || 1} 班</p>}</button>})}{!loading && !visibleCases.length && <p className="rounded-xl border-2 border-dashed border-slate-200 px-4 py-10 text-center text-sm font-bold text-slate-400">目前無案件</p>}</div>
      </section>
      <section className="rounded-2xl bg-white p-5 shadow-sm">{message && <div className="mb-4 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">{message}</div>}{!visibleCases.length ? <p className="py-20 text-center font-bold text-slate-400">目前無案件</p> : !draft ? <p className="py-20 text-center text-slate-400">請選擇案件</p> : <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-bold text-emerald-700">{draft.report_source}</p><h2 className="text-2xl font-black">{draft.case_no}</h2><p className="mt-1 text-sm text-slate-500">{draft.applicant}｜{draft.phone}</p></div>{page === '案件清單與進度' && <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-800">{draft.status}</span>}</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Info label="地址" value={draft.address}/><Info label="申報內容" value={`${draft.waste_type}，${draft.quantity} 件`}/><Info label="年度申請次數" value={page === '待處理' ? `本次為本年度第 ${annualApplicationCount} 次申請` : `${annualApplicationCount} 次（${annualApplicationCount <= 3 ? '本次前 2 件免費' : '免費額度已用完'}）`}/><Info label="費用" value={`${Number(draft.fee_amount || 0).toLocaleString()} 元`}/>{page === '待處理' ? <Info label="民眾希望清運日期／時段" value={`${getMinguoTime(draft.requested_scheduled_at || draft.scheduled_at)}／${draft.dispatch_period || '—'}`}/> : <>{page !== '已排班' && <><Info label="建立時間" value={getMinguoTime(draft.created_at)}/><Info label="最後更新" value={getMinguoTime(draft.updated_at)}/></>}<Info label={draft.status === '已排班' ? '排定清運日期與時間' : '民眾希望日期'} value={getMinguoTime(draft.status === '已排班' ? (draft.scheduled_at || draft.requested_scheduled_at) : (draft.requested_scheduled_at || draft.scheduled_at))}/><Info label={draft.status === '已排班' ? '排定清運時段／第幾班' : '民眾希望時段'} value={`${draft.dispatch_period || '—'}／第 ${draft.dispatch_trip || 1} 班`}/><Info label="派車車號／清運人員" value={`${draft.vehicle_no || '—'}／${draft.worker_name || '—'}`}/></>} {draft.status === '已取消' && <Info label="撤案原因／備註" value={draft.dispatch_note}/>}</div>
        {['待處理', '已排班'].includes(page) && <section className="rounded-2xl border border-sky-200 bg-sky-50 p-4"><h3 className="font-black text-sky-950">{page === '已排班' ? '未清運照片' : '待清運照片'}</h3>{pendingPhotos.length ? <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{pendingPhotos.map((photo) => <button type="button" key={photo.id} disabled={photo.error} onClick={() => setPendingPhotoPreview(photo)} className="overflow-hidden rounded-xl border border-sky-200 bg-white text-left transition-shadow hover:shadow-md disabled:cursor-default">{photo.error ? <span className="flex h-24 items-center justify-center p-3 text-center text-xs font-bold text-rose-700">照片載入失敗</span> : <img src={photo.src} alt={`${page === '已排班' ? '未清運' : '待清運'}照片 ${photo.index + 1}`} className="h-24 w-full object-cover"/>}<span className="block p-2 text-center text-xs font-bold text-sky-800">照片 {photo.index + 1}</span></button>)}</div> : <p className="mt-2 text-sm font-bold text-slate-500">尚未上傳{page === '已排班' ? '未清運' : '待清運'}照片。</p>}</section>}
        {page === '清運完成' && <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><h3 className="font-black text-emerald-950">結案照片</h3>{pendingPhotos.length ? <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{pendingPhotos.map((photo) => <button type="button" key={photo.id} disabled={photo.error} onClick={() => setPendingPhotoPreview(photo)} className="overflow-hidden rounded-xl border border-emerald-200 bg-white text-left transition-shadow hover:shadow-md disabled:cursor-default">{photo.error ? <span className="flex h-24 items-center justify-center p-3 text-center text-xs font-bold text-rose-700">照片載入失敗</span> : <img src={photo.src} alt={`結案照片 ${photo.index + 1}`} className="h-24 w-full object-cover"/>}<span className="block p-2 text-center text-xs font-bold text-emerald-800">結案照片 {photo.index + 1}</span></button>)}</div> : <p className="mt-2 text-sm font-bold text-slate-500">尚未上傳結案照片。</p>}</section>}
        {pendingPhotoPreview && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 p-4" role="dialog" aria-modal="true" aria-label={`${page === '已排班' ? '未清運' : '待清運'}照片 ${pendingPhotoPreview.index + 1}`} onClick={() => setPendingPhotoPreview(null)}><div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-black">{page === '已排班' ? '未清運' : '待清運'}照片 {pendingPhotoPreview.index + 1}</h3><button type="button" onClick={() => setPendingPhotoPreview(null)} className="rounded-lg bg-slate-100 px-3 py-1.5 font-black text-slate-700">✕ 關閉</button></div><img src={pendingPhotoPreview.src} alt={`${page === '已排班' ? '未清運' : '待清運'}照片 ${pendingPhotoPreview.index + 1}`} className="max-h-[76vh] w-full object-contain"/></div></div>}
        {page === '已排班' && <RoutePlanner cases={scheduledRouteCases} vehicle={dispatchOptions.vehicles.find((item) => item.vehicle_no === draft.vehicle_no)} origin={dispatchOptions.route_origin}/>}
        {['案件清單與進度', '待處理'].includes(page) && <div className={'rounded-2xl border p-4 ' + (reviewApproved ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50')}><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-black">人工逐項覆核</h3><p className="text-xs text-slate-600">僅於待處理頁進行人工確認與計費。</p></div><div className={'rounded-xl px-3 py-2 text-sm font-black ' + (reviewApproved ? 'bg-emerald-600 text-white' : 'bg-amber-200 text-amber-900')}>{reviewApproved ? '✓ 人工已核可' : '⚠ 待人工核可'}</div></div><div className={'mt-3 rounded-xl border p-3 text-sm font-bold ' + (reviewApproved ? 'border-emerald-200 bg-white/70 text-emerald-900' : 'border-amber-200 bg-white/70 text-amber-900')}><div className="grid gap-2 sm:grid-cols-4"><span>確認總件數：{reviewApproved ? draft.quantity : reviewTotal} 件</span><span>免費件數：{reviewApproved ? Math.max(0, Number(draft.quantity || 0) - Number(draft.chargeable_quantity || 0)) : reviewFreeQuantity} 件</span><span>計費件數：{reviewApproved ? draft.chargeable_quantity || 0 : reviewChargeableQuantity} 件</span><span>應收費用：NT$ {Number(reviewApproved ? draft.fee_amount : reviewFeeAmount).toLocaleString()}</span></div>{!reviewApproved && <p className="mt-2 text-xs">試算：{reviewTotal} 件 − 免費 {reviewFreeQuantity} 件 ＝ 計費 {reviewChargeableQuantity} 件 × NT$ 200 ＝ NT$ {reviewFeeAmount.toLocaleString()}{annualApplicationCount > 3 ? '（同地址本年度免費額度已用完）' : '（同地址本年度第 ' + annualApplicationCount + ' 次申請）'}</p>}</div><div className="mt-4 grid grid-cols-7 gap-2 overflow-x-auto">{categories.map((name) => <label key={name} className="min-w-20 text-xs font-bold text-slate-600">{name}<input disabled={reviewApproved} type="number" min="0" value={reviewCounts[name] || 0} onChange={(e) => setReviewCounts((old) => ({ ...old, [name]: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-100"/></label>)}</div><label className="mt-3 block text-xs font-bold text-slate-600">人工判斷依據（選填）<textarea disabled={reviewApproved} rows="2" value={draft.review_note || ''} onChange={(e) => setDraft({ ...draft, review_note: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 p-3 disabled:bg-slate-100"/></label>{page === '待處理' && (reviewApproved ? <button disabled={loading} onClick={() => setDraft({ ...draft, quantity_review_status: '待人工核可', chargeable_quantity: 0, fee_amount: 0 })} className="mt-3 rounded-xl border border-emerald-600 bg-white px-4 py-2.5 text-sm font-black text-emerald-700">修改人工確認</button> : <button disabled={loading} onClick={approveReview} className="mt-3 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-black text-white">人工核可並試算費用</button>)}</div>}
        {(['案件清單與進度', '待處理'].includes(page) || (page === '已排班' && scheduleEditing)) && <div className={'rounded-2xl border p-4 ' + (page === '待處理' ? 'border-amber-300 bg-amber-50' : 'border-slate-200')}><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-black">{page === '已排班' ? '修改已排班案件' : '待處理案件排班'}</h3>{page === '待處理' && <p className="text-xs text-slate-600">車號與姓名一律以「派車設定」為準；請先在桌面端完成設定，再由此處選擇。</p>}</div>{page === '待處理' && <div className="rounded-xl bg-amber-200 px-3 py-2 text-sm font-black text-amber-900">{reviewApproved ? '待核可排班' : '⚠ 等待人工核可'}</div>}</div><div className="mt-3 grid gap-3 sm:grid-cols-2"><Field label="管理端排定清運日期與時間（民國）"><MinguoDateTimePicker disabled={dispatchFieldsDisabled} value={draft.scheduled_at} onCommit={(scheduled_at) => updateDispatchContext({ scheduled_at })}/></Field><Field label="管理端排定清運時段"><select disabled={dispatchFieldsDisabled} value={draft.dispatch_period || ''} onChange={(e) => updateDispatchContext({ dispatch_period: e.target.value })}>{periods.map((item) => <option key={item} value={item}>{item || '請選擇'}</option>)}</select></Field><Field label="派車車號"><select disabled={dispatchFieldsDisabled} value={draft.vehicle_no || ''} onChange={(e) => updateDispatchContext({ vehicle_no: e.target.value })}><option value="">請選擇車號</option>{dispatchOptions.vehicles.map((item) => <option key={item.vehicle_no} value={item.vehicle_no}>{item.vehicle_no}</option>)}</select></Field><Field label="清運人員"><div className="space-y-2">{workerSelections.map((selected, index) => <div key={index} className="flex gap-2"><select disabled={dispatchFieldsDisabled || isMergingDispatch} value={selected} onChange={(e) => { const next = [...workerSelections]; next[index] = e.target.value; setDispatchWorkers(next) }}><option value="">請選擇清運人員</option>{dispatchOptions.workers.filter((item) => item === selected || !workerSelections.includes(item)).map((item) => <option key={item} value={item}>{item}</option>)}</select>{workerSelections.length > 1 && <button type="button" disabled={dispatchFieldsDisabled || isMergingDispatch} onClick={() => setDispatchWorkers(workerSelections.filter((_, memberIndex) => memberIndex !== index))} className="rounded-lg border border-rose-300 px-3 text-rose-700">－</button>}</div>)}<button type="button" disabled={dispatchFieldsDisabled || isMergingDispatch} onClick={() => setWorkerSelections([...workerSelections, ''])} className="rounded-lg border border-emerald-700 px-3 py-2 text-sm font-black text-emerald-800">＋ 新增清運人員</button></div></Field><Field label="合併／新增班次"><select disabled={dispatchFieldsDisabled} value={dispatchTripChoices.some((choice) => choice.trip === Number(draft.dispatch_trip || 1)) ? Number(draft.dispatch_trip || 1) : dispatchTripChoices[dispatchTripChoices.length - 1].trip} onChange={(e) => selectDispatchTrip(e.target.value)}>{dispatchTripChoices.map((choice) => <option key={choice.trip} value={choice.trip}>{choice.label}</option>)}</select></Field><Field label="派車備註"><input disabled={dispatchFieldsDisabled} value={draft.dispatch_note || ''} onChange={(e) => setDraft({ ...draft, dispatch_note: e.target.value })}/></Field></div></div>}
        <div className="flex flex-wrap gap-3">{page === '案件清單與進度' && <><button type="button" onClick={() => { window.location.href = './index.html' }} className="rounded-xl border border-emerald-700 px-5 py-3 font-black text-emerald-800">新增案件</button><button disabled={loading || draft.status !== '已取消'} onClick={restoreCaseStatus} className="rounded-xl bg-emerald-700 px-5 py-3 font-black text-white disabled:opacity-40">恢復案件狀態</button><button disabled={loading} onClick={deleteCase} className="rounded-xl border border-rose-300 px-5 py-3 font-black text-rose-700">刪除案件</button></>}{page === '待處理' && <><button disabled={loading || !reviewApproved} onClick={schedule} className="rounded-xl bg-emerald-700 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300">{reviewApproved ? '核可排班' : '請先完成人工核可'}</button><button disabled={loading} onClick={withdrawCase} className="rounded-xl bg-rose-600 px-5 py-3 font-black text-white">撤案</button><button disabled={loading} onClick={() => save()} className="ml-auto rounded-xl border border-emerald-700 px-5 py-3 font-black text-emerald-800">儲存調度變更</button></>}{page === '已排班' && <><button disabled={loading} onClick={() => completionInput.current?.click()} className="rounded-xl bg-sky-700 px-5 py-3 font-black text-white disabled:opacity-40">📸 拍照結案</button><button disabled={loading} onClick={() => save({ status: '待處理', dispatch_status: '待處理' }, '已取消排班，案件回到待處理')} className="rounded-xl bg-amber-600 px-5 py-3 font-black text-white disabled:opacity-40">取消排班</button><button disabled={loading || scheduleEditing} onClick={() => setScheduleEditing(true)} className="rounded-xl bg-emerald-700 px-5 py-3 font-black text-white disabled:opacity-40">修改</button>{scheduleEditing && <button disabled={loading} onClick={saveScheduledChanges} className="rounded-xl bg-sky-700 px-5 py-3 font-black text-white disabled:opacity-40">儲存排班變更</button>}<button disabled={loading} onClick={withdrawCase} className="rounded-xl bg-rose-600 px-5 py-3 font-black text-white disabled:opacity-40">撤案</button></>}{page === '清運完成' && <button type="button" onClick={() => window.print()} className="rounded-xl bg-slate-700 px-5 py-3 font-black text-white">預覽列印</button>}{page === '已取消' && <><button disabled={loading} onClick={restoreCaseStatus} className="rounded-xl bg-emerald-700 px-5 py-3 font-black text-white">恢復案件狀態</button><button disabled={loading} onClick={deleteCase} className="rounded-xl border border-rose-300 px-5 py-3 font-black text-rose-700">刪除案件</button></>}<input ref={completionInput} type="file" accept="image/*" multiple className="hidden" onChange={completeWithPhoto}/></div>
        {page === '待處理' && (!dispatchOptions.vehicles.length || !dispatchOptions.workers.length) && <p className="-mt-5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs font-bold text-amber-800">尚未取得可選的派車車號或清運人員。請先在桌面版「派車設定」儲存設定並確認雲端同步成功，再按網頁右上角「重新整理」。</p>}
      </div>}</section>
    </div></main>}
  </div>
}

function Info({ label, value }) { return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-1 font-bold">{value || '—'}</p></div> }
function RoutePlanner({ cases, vehicle, origin = '24.380891,120.734372' }) {
  const [stops, setStops] = useState(cases)
  const [distanceKm, setDistanceKm] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(0)
  const [calculating, setCalculating] = useState(false)
  const [routeMessage, setRouteMessage] = useState('')
  useEffect(() => { setStops(cases); setDistanceKm('') }, [cases])
  const fuelEfficiency = Number(vehicle?.fuel_efficiency || 5)
  const co2PerLiter = Number(vehicle?.co2_per_liter || 2.69)
  const carbon = Number(distanceKm) > 0 ? Number(distanceKm) / fuelEfficiency * co2PerLiter : 0
  const moveStop = (index, direction) => setStops((items) => { const target = index + direction; if (target < 0 || target >= items.length) return items; const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; return next })
  const calculateAutomatically = async () => {
    setCalculating(true); setRouteMessage('正在定位地址並計算道路路線…')
    try {
      const result = await adminPost('calculateRoute', { caseNos: stops.map((item) => item.case_no), origin, fuelEfficiency, co2PerLiter })
      const byNo = Object.fromEntries(stops.map((item) => [item.case_no, item]))
      setStops(result.ordered.map((item) => ({ ...byNo[item.case_no], latitude: item.latitude, longitude: item.longitude })))
      setDistanceKm(Number(result.distanceKm || 0).toFixed(1)); setDurationMinutes(Number(result.durationMinutes || 0))
      setRouteMessage(result.estimated
        ? `路線預估：${Number(result.distanceKm || 0).toFixed(1)} km／${Number(result.carbonKg || 0).toFixed(2)} kg CO₂e。${result.routeWarning || '道路路線暫時無法取得，已使用估算里程。'}`
        : `已完成道路路線：${Number(result.distanceKm || 0).toFixed(1)} km／約 ${Number(result.durationMinutes || 0)} 分鐘／${Number(result.carbonKg || 0).toFixed(2)} kg CO₂e`)
    } catch (error) { setRouteMessage(`自動計算失敗：${error.message}`) } finally { setCalculating(false) }
  }
  const navigationUrl = stops.length ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(stops[stops.length - 1].address)}${stops.length > 1 ? `&waypoints=${encodeURIComponent(stops.slice(0, -1).map((item) => item.address).join('|'))}` : ''}` : '#'
  const stopNavigationUrl = (item) => {
    const latitude = Number(item.latitude), longitude = Number(item.longitude)
    const destination = Number.isFinite(latitude) && Number.isFinite(longitude) && !(latitude === 0 && longitude === 0) ? `${latitude},${longitude}` : item.address
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
  }
  return <section className="rounded-2xl border border-violet-200 bg-violet-50 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-black text-violet-950">路線設計與碳排估算</h3><p className="text-xs font-bold text-violet-700">預設出發點：24.380891, 120.734372；同車、同日期、同時段、同班次案件可調整清運順序。</p></div><div className="flex gap-2"><button type="button" disabled={calculating || !stops.length} onClick={calculateAutomatically} className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-black text-white disabled:opacity-50">{calculating ? '定位與計算中…' : '⚡ 自動定位與計算'}</button><a href={navigationUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-violet-700 px-4 py-2 text-sm font-black text-white">🧭 開啟導航</a></div></div>{routeMessage && <p className="mt-3 rounded-xl border border-violet-200 bg-white p-3 text-xs font-bold text-violet-900">{routeMessage}</p>}<div className="mt-3 space-y-2">{stops.map((item, index) => <div key={item.case_no} className="flex items-center gap-3 rounded-xl border border-violet-200 bg-white p-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-700 text-sm font-black text-white">{index + 1}</span><div className="min-w-0 flex-1"><strong className="text-sm">{item.applicant}</strong><p className="truncate text-xs text-slate-500">{item.address}</p></div><a href={stopNavigationUrl(item)} target="_blank" rel="noreferrer" className="rounded-lg border border-violet-300 bg-violet-50 px-3 py-1.5 text-sm font-black text-violet-800">🧭 導航</a><button type="button" disabled={index === 0} onClick={() => moveStop(index, -1)} className="rounded-lg border px-3 py-1.5 text-sm font-black disabled:opacity-30">↑</button><button type="button" disabled={index === stops.length - 1} onClick={() => moveStop(index, 1)} className="rounded-lg border px-3 py-1.5 text-sm font-black disabled:opacity-30">↓</button></div>)}</div><div className="mt-3 grid gap-3 rounded-xl border border-violet-200 bg-white p-3 sm:grid-cols-3"><label className="text-xs font-bold text-slate-600">路線公里數<input type="number" min="0" step="0.1" value={distanceKm} onInput={(event) => setDistanceKm(event.target.value)} placeholder="輸入導航里程" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"/></label><Info label={`車輛油耗（${vehicle?.vehicle_no || '預設'}）`} value={`${fuelEfficiency} km/L`}/><Info label="預估碳排量" value={distanceKm ? `${carbon.toFixed(2)} kg CO₂e${durationMinutes ? `／約 ${durationMinutes} 分` : ''}` : '輸入里程後計算'}/></div></section>
}
function Field({ label }, { slots }) {
  // Vue JSX 將元件子內容放在 slots.default，而非 React 的 children prop。
  // 未讀取 slot 時只會顯示欄位名稱，日期、下拉選單及輸入框都不會渲染。
  const controls = slots.default ? slots.default() : []
  return <div className="dispatch-field text-xs font-bold text-slate-600"><label className="block">{label}</label><div className="dispatch-field-control mt-1">{controls}</div></div>
}
function MinguoDateTimePicker({ disabled, value, onCommit }) {
  const initial = value && !Number.isNaN(new Date(value).getTime()) ? new Date(value) : new Date()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => ({ year: initial.getFullYear(), month: initial.getMonth() }))
  useEffect(() => { if (value && !Number.isNaN(new Date(value).getTime())) { const date = new Date(value); setView({ year: date.getFullYear(), month: date.getMonth() }) } }, [value])
  const selected = value && !Number.isNaN(new Date(value).getTime()) ? new Date(value) : new Date()
  const commit = (date) => onCommit(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`)
  const shiftMonth = (amount) => { const next = new Date(view.year, view.month + amount, 1); setView({ year: next.getFullYear(), month: next.getMonth() }) }
  const firstDay = new Date(view.year, view.month, 1).getDay()
  const days = new Date(view.year, view.month + 1, 0).getDate()
  return <div className="relative"><button type="button" disabled={disabled} onClick={() => setOpen((current) => !current)} className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left font-bold disabled:bg-slate-100"><span>{value ? getMinguoTime(value) : '請選擇日期與時間'}</span><span aria-hidden="true">📅</span></button>{open && <div className="absolute z-20 mt-1 w-80 rounded-xl border border-emerald-200 bg-white p-3 shadow-xl"><div className="mb-3 flex items-center justify-between"><button type="button" onClick={() => shiftMonth(-1)} className="rounded px-2 py-1 hover:bg-slate-100">‹</button><div className="flex gap-1"><select value={view.year - 1911} onChange={(e) => setView({ ...view, year: Number(e.target.value) + 1911 })}>{Array.from({ length: 21 }, (_, index) => new Date().getFullYear() - 1911 - 10 + index).map((year) => <option key={year} value={year}>{year} 年</option>)}</select><select value={view.month} onChange={(e) => setView({ ...view, month: Number(e.target.value) })}>{Array.from({ length: 12 }, (_, index) => <option key={index} value={index}>{index + 1} 月</option>)}</select></div><button type="button" onClick={() => shiftMonth(1)} className="rounded px-2 py-1 hover:bg-slate-100">›</button></div><div className="grid grid-cols-7 text-center text-xs text-slate-500">{['日','一','二','三','四','五','六'].map((day) => <span key={day} className="py-1">{day}</span>)}{Array.from({ length: firstDay }, (_, index) => <span key={`blank-${index}`}/>) }{Array.from({ length: days }, (_, index) => { const day = index + 1; const active = selected.getFullYear() === view.year && selected.getMonth() === view.month && selected.getDate() === day; return <button type="button" key={day} onClick={() => { const next = new Date(selected); next.setFullYear(view.year, view.month, day); commit(next); setOpen(false) }} className={'m-0.5 rounded-full py-1.5 font-bold ' + (active ? 'bg-emerald-700 text-white' : 'hover:bg-emerald-50')}>{day}</button> })}</div><div className="mt-3 flex items-center gap-2 border-t pt-3 text-xs font-bold"><span>時間</span><select value={selected.getHours()} onChange={(e) => { const next = new Date(selected); next.setHours(Number(e.target.value)); commit(next) }}>{Array.from({ length: 24 }, (_, hour) => <option key={hour} value={hour}>{String(hour).padStart(2, '0')} 時</option>)}</select><select value={selected.getMinutes()} onChange={(e) => { const next = new Date(selected); next.setMinutes(Number(e.target.value)); commit(next) }}>{[0, 10, 20, 30, 40, 50].map((minute) => <option key={minute} value={minute}>{String(minute).padStart(2, '0')} 分</option>)}</select></div></div>}</div>
}
