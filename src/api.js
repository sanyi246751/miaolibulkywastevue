const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
const CASE_API_URL = `${SUPABASE_URL}/functions/v1/case-api`
export const GAS_URL = ''

const request = async (action, payload = {}, token = '') => {
  const response = await fetch(CASE_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${token || PUBLISHABLE_KEY}` }, body: JSON.stringify({ action, ...payload }) })
  const result = await response.json().catch(() => ({}))
  if (!response.ok || !result.ok) throw new Error(result.message || `連線失敗（HTTP ${response.status}）`)
  return result
}

const fromDb = (item) => ({ ...item, case_no: item.case_no, scheduled_at: item.scheduled_at, requested_scheduled_at: item.requested_scheduled_at })
const dbCase = (item) => ({ case_no: item.case_no || item.caseNo, applicant: item.applicant, phone: item.phone, address: item.address, waste_type: item.waste_type || item.wasteType, quantity: Number(item.quantity || 1), status: item.status, scheduled_at: item.scheduled_at || item.scheduledAt || null, requested_scheduled_at: item.requested_scheduled_at || item.requestedScheduledAt || null, fee_amount: Number(item.fee_amount || item.feeAmount || 0), vehicle_no: item.vehicle_no || item.vehicleNo || null, worker_name: item.worker_name || item.workerName || null, dispatch_period: item.dispatch_period || item.dispatchPeriod || null, dispatch_trip: Number(item.dispatch_trip || item.dispatchTrip || 1), dispatch_note: item.dispatch_note || item.dispatchNote || null, quantity_review_status: item.quantity_review_status || item.quantityReviewStatus || '待人工核可', confirmed_items: item.confirmed_items ? (typeof item.confirmed_items === 'string' ? JSON.parse(item.confirmed_items) : item.confirmed_items) : [], review_note: item.review_note || item.reviewNote || null, chargeable_quantity: Number(item.chargeable_quantity || item.chargeableQuantity || 0), annual_count: Number(item.annual_count || item.annualCount || 0), completion_distance_km: Number(item.completion_distance_km || item.completionDistanceKm || 0), completion_carbon_kg: Number(item.completion_carbon_kg || item.completionCarbonKg || 0), report_source: item.report_source || item.reportSource || '網路申請' })

export const adminLogin = async (email, password) => {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: PUBLISHABLE_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
  const result = await response.json(); if (!response.ok || !result.access_token) throw new Error(result.error_description || '登入失敗')
  return { token: result.access_token }
}
export const adminPost = async (action, payload = {}) => {
  const result = await request(action, action === 'upsert' ? { case: dbCase(payload.case) } : payload, sessionStorage.getItem('admin_api_token') || '')
  return action === 'list' ? { ...result, cases: result.cases.map(fromDb) } : result
}
export const createPublicCase = async (values) => (await request('publicCreate', values)).caseNo
export const queryCase = async (caseNo, phone) => ({ case: (await request('query', { caseNo, phone })).case })
export const workerGet = async (action, parameters = {}) => {
  const result = await request(action === 'workerList' ? 'workerList' : action, parameters)
  return action === 'workerList' ? { ...result, cases: (result.cases || []).map((item) => ({ ...item, caseId: item.case_id, caseNo: item.case_no, scheduledAt: item.scheduled_at, vehicleNo: item.vehicle_no, workerName: item.worker_name, wasteType: item.waste_type, reportNote: item.dispatch_note })) } : result
}
export const workerPost = async (action, payload = {}) => request(action === 'completeWithPhoto' ? 'workerComplete' : action, { ...payload, caseId: payload.id, files: payload.files || [] })
export const toCasePayload = (item) => item
