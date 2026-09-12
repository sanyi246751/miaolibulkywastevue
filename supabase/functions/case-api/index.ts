// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import { withSupabase } from "@supabase/server"

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" }
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: cors })
const error = (message: string, status = 400) => reply({ ok: false, message }, status)
const caseNo = () => { const d = new Date(); return `${d.getFullYear() - 1911}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}` }

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: cors })
    if (req.method !== "POST") return error("只接受 POST 請求", 405)
    let body: Record<string, unknown>; try { body = await req.json() } catch { return error("請求格式不正確") }
    const action = String(body.action || "")
    if (action === "health") return reply({ ok: true, service: "case-api" })

    if (action === "publicCreate") {
      const applicant = String(body.applicant || "").trim(), phone = String(body.phone || "").trim(), address = String(body.address || body.addressDetail || "").trim(), wasteType = String(body.wasteType || "").trim()
      if (!applicant || !phone || !address || !wasteType) return error("請完整填寫申請資料")
      const no = caseNo()
      // 民眾照片經 Edge Function 寫入私有 Storage，只在案件資料保存路徑，不公開原始檔。
      const inputs = Array.isArray(body.photos) ? body.photos : body.photo ? [body.photo] : []
      if (inputs.length > 8) return error("待清運照片最多上傳 8 張")
      const photoPaths: string[] = []
      for (const [index, input] of inputs.entries()) {
        const photo = input as Record<string, unknown>
        const mimeType = String(photo.mimeType || "image/jpeg")
        const base64 = String(photo.base64 || "")
        if (!mimeType.startsWith("image/") || !base64) return error("待清運照片格式不正確")
        let bytes: Uint8Array
        try { bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0)) } catch { return error("待清運照片內容不正確") }
        if (!bytes.length || bytes.length > 8 * 1024 * 1024) return error("每張待清運照片須介於 1 B 至 8 MB")
        const name = String(photo.name || `photo-${index + 1}.jpg`).replace(/[^\w.-]/g, "_")
        const path = `public/${no}-${index + 1}-${name}`
        const { error: uploadError } = await ctx.supabaseAdmin.storage.from("case-photos").upload(path, bytes, { contentType: mimeType, upsert: false })
        if (uploadError) return error(`待清運照片上傳失敗：${uploadError.message}`, 500)
        photoPaths.push(path)
      }
      const { error: dbError } = await ctx.supabaseAdmin.from("cases").insert({ case_no: no, applicant, phone, address, waste_type: wasteType, quantity: Math.max(1, Number(body.quantity || 1)), status: "待處理", requested_scheduled_at: body.preferredDate ? `${body.preferredDate}T00:00:00+08:00` : null, dispatch_period: String(body.preferredTimeSlot || ""), dispatch_note: String(body.locationNote || ""), email: String(body.email || "") || null, photo_paths: photoPaths })
      return dbError ? error(dbError.message, 500) : reply({ ok: true, caseNo: no })
    }
    if (action === "query") {
      const { data, error: dbError } = await ctx.supabaseAdmin.rpc("query_case", { p_case_no: String(body.caseNo || ""), p_phone: String(body.phone || "") })
      return dbError ? error(dbError.message, 500) : reply({ ok: true, case: data?.[0] || null })
    }
    if (action === "workerList") {
      const { data, error: dbError } = await ctx.supabaseAdmin.rpc("worker_list", { p_pin: String(body.pin || ""), p_keyword: String(body.keyword || "") })
      return dbError ? error("工作人員驗證碼不正確", 401) : reply({ ok: true, cases: data || [] })
    }
    if (action === "workerComplete") {
      const { error: dbError } = await ctx.supabaseAdmin.rpc("worker_complete_case", { p_pin: String(body.pin || ""), p_case_id: String(body.caseId || ""), p_note: String(body.note || ""), p_photo_paths: body.photoPaths || [] })
      return dbError ? error(dbError.message, 400) : reply({ ok: true })
    }

    // 其餘操作皆需要登入的 Supabase 管理員。
    const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || ""
    const { data: userResult, error: authError } = await ctx.supabaseAdmin.auth.getUser(bearer)
    if (authError || userResult.user?.email?.toLowerCase() !== "sanyi246751@gmail.com") return error("管理員權限不足", 403)
    if (action === "createPhoneCase") {
      const applicant = String(body.applicant || "").trim(), phone = String(body.phone || "").trim(), address = String(body.address || "").trim(), wasteType = String(body.wasteType || "").trim()
      if (!applicant || !phone || !address || !wasteType) return error("請完整填寫申請人、電話、地址與清運品項")
      const no = caseNo()
      const { error: dbError } = await ctx.supabaseAdmin.from("cases").insert({ case_no: no, applicant, phone, email: String(body.email || "") || null, address, waste_type: wasteType, quantity: Math.max(1, Number(body.quantity || 1)), status: "待處理", requested_scheduled_at: body.preferredDate ? `${body.preferredDate}T00:00:00+08:00` : null, dispatch_period: String(body.preferredTimeSlot || ""), dispatch_note: String(body.note || ""), photo_paths: Array.isArray(body.photoPaths) ? body.photoPaths : [], report_source: "電話申請" })
      return dbError ? error(dbError.message, 500) : reply({ ok: true, caseNo: no })
    }
    if (action === "upload") {
      const name = String(body.fileName || "photo.jpg").replace(/[^\w.-]/g, "_")
      const bytes = Uint8Array.from(atob(String(body.base64 || "")), (c) => c.charCodeAt(0))
      const path = `desktop/${Date.now()}-${name}`
      const { error: uploadError } = await ctx.supabaseAdmin.storage.from("case-photos").upload(path, bytes, { contentType: String(body.mimeType || "image/jpeg"), upsert: false })
      return uploadError ? error(uploadError.message, 500) : reply({ ok: true, fileId: path })
    }
    if (action === "analyzeImage") {
      // 桌面版先將照片安全寫入私有 Storage；未設定 AI 服務時仍可由承辦人逐項人工核可。
      const name = String(body.fileName || "photo.jpg").replace(/[^\w.-]/g, "_")
      const bytes = Uint8Array.from(atob(String(body.base64 || "")), (c) => c.charCodeAt(0))
      if (!bytes.length) return error("照片內容不可空白")
      const path = `desktop/${Date.now()}-${name}`
      const { error: uploadError } = await ctx.supabaseAdmin.storage.from("case-photos").upload(path, bytes, { contentType: String(body.mimeType || "image/jpeg"), upsert: false })
      if (uploadError) return error(uploadError.message, 500)
      return reply({ ok: true, fileId: path, analysis: { items: [], totalCount: 0, needsReview: true, summary: "照片已上傳，請人工確認品項與數量" } })
    }
    if (action === "getImage") {
      const path = String(body.fileId || "")
      if (!path || path.includes("..")) return error("照片路徑不正確")
      const { data, error: downloadError } = await ctx.supabaseAdmin.storage.from("case-photos").download(path)
      if (downloadError || !data) return error(downloadError?.message || "找不到照片", 404)
      const bytes = new Uint8Array(await data.arrayBuffer())
      let binary = ""; for (const byte of bytes) binary += String.fromCharCode(byte)
      return reply({ ok: true, base64: btoa(binary) })
    }
    if (action === "deleteImage") {
      const path = String(body.fileId || "")
      if (!path || path.includes("..") || !path.startsWith("desktop/")) return error("照片路徑不正確")
      const { error: removeError } = await ctx.supabaseAdmin.storage.from("case-photos").remove([path])
      return removeError ? error(removeError.message, 500) : reply({ ok: true })
    }
    if (action === "list") { const { data, error: dbError } = await ctx.supabaseAdmin.from("cases").select("*").order("created_at", { ascending: false }); return dbError ? error(dbError.message, 500) : reply({ ok: true, cases: data || [] }) }
    if (action === "dispatchOptions") {
      const [{ data: vehicles, error: vehicleError }, { data: workers, error: workerError }] = await Promise.all([ctx.supabaseAdmin.from("vehicles").select("vehicle_no,fuel_efficiency,co2_per_liter").eq("active", true).order("vehicle_no"), ctx.supabaseAdmin.from("workers").select("name").eq("active", true).order("name")])
      return vehicleError || workerError ? error(vehicleError?.message || workerError?.message || "讀取派車設定失敗", 500) : reply({ ok: true, dispatch: { vehicles: vehicles || [], workers: (workers || []).map((item) => item.name) } })
    }
    if (action === "updateDispatchOptions") {
      const vehicles = Array.isArray(body.vehicles) ? body.vehicles : []
      const workers = Array.isArray(body.workers) ? body.workers : []
      const vehicleRows = vehicles.map((item: any) => ({ vehicle_no: String(item.vehicle_no || item).trim(), fuel_efficiency: Number(item.fuel_efficiency || 5), co2_per_liter: Number(item.co2_per_liter || 2.69), active: true })).filter((item) => item.vehicle_no)
      const workerRows = workers.map((name) => ({ name: String(name).trim(), active: true })).filter((item) => item.name)
      const { error: disableVehicleError } = await ctx.supabaseAdmin.from("vehicles").update({ active: false }).eq("active", true)
      const { error: disableWorkerError } = await ctx.supabaseAdmin.from("workers").update({ active: false }).eq("active", true)
      const vehicleResult = vehicleRows.length ? await ctx.supabaseAdmin.from("vehicles").upsert(vehicleRows, { onConflict: "vehicle_no" }) : { error: null }
      const workerResult = workerRows.length ? await ctx.supabaseAdmin.from("workers").upsert(workerRows, { onConflict: "name" }) : { error: null }
      const saveError = disableVehicleError || disableWorkerError || vehicleResult.error || workerResult.error
      return saveError ? error(saveError.message || "儲存派車設定失敗", 500) : reply({ ok: true })
    }
    if (action === "calculateRoute") {
      const caseNos = Array.isArray(body.caseNos) ? body.caseNos.map(String).filter(Boolean).slice(0, 20) : []
      if (!caseNos.length) return error("請提供至少一筆已排班案件")
      const originValues = String(body.origin || "24.380891,120.734372").split(",").map(Number)
      if (originValues.length !== 2 || originValues.some(Number.isNaN)) return error("出發點座標格式不正確")
      const [originLat, originLon] = originValues
      const { data: cases, error: casesError } = await ctx.supabaseAdmin.from("cases").select("case_no,address,latitude,longitude").in("case_no", caseNos)
      if (casesError) return error(casesError.message, 500)
      const points: Array<{ case_no: string; latitude: number; longitude: number }> = []
      for (const item of cases || []) {
        let latitude = Number(item.latitude), longitude = Number(item.longitude)
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=tw&q=${encodeURIComponent(item.address)}`
          const geocodeResponse = await fetch(geocodeUrl, { headers: { "User-Agent": "MiaoliBulkyWaste/1.0 (contact: sanyi246751@gmail.com)", "Accept-Language": "zh-TW" } })
          const matches = await geocodeResponse.json().catch(() => [])
          if (!geocodeResponse.ok || !Array.isArray(matches) || !matches[0]) return error(`找不到地址座標：${item.address}`, 422)
          latitude = Number(matches[0].lat); longitude = Number(matches[0].lon)
          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return error(`地址座標格式錯誤：${item.address}`, 422)
          const { error: saveCoordinateError } = await ctx.supabaseAdmin.from("cases").update({ latitude, longitude }).eq("case_no", item.case_no)
          if (saveCoordinateError) return error(saveCoordinateError.message, 500)
          await new Promise((resolve) => setTimeout(resolve, 1100))
        }
        points.push({ case_no: item.case_no, latitude, longitude })
      }
      const distance = (a: [number, number], b: [number, number]) => { const r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r, h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) ** 2; return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)) }
      const remaining = [...points], ordered: typeof points = []
      let current: [number, number] = [originLat, originLon]
      while (remaining.length) { remaining.sort((first, second) => distance(current, [first.latitude, first.longitude]) - distance(current, [second.latitude, second.longitude])); const next = remaining.shift()!; ordered.push(next); current = [next.latitude, next.longitude] }
      const coordinates = [[originLon, originLat], ...ordered.map((item) => [item.longitude, item.latitude])].map((point) => point.join(",")).join(";")
      const routeResponse = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=false&steps=false`, { headers: { "User-Agent": "MiaoliBulkyWaste/1.0" } })
      const routeData = await routeResponse.json().catch(() => ({}))
      const route = routeData?.routes?.[0]
      if (!routeResponse.ok || !route) return error("OSRM 無法取得道路路線", 502)
      const distanceKm = Number(route.distance || 0) / 1000, durationMinutes = Math.round(Number(route.duration || 0) / 60)
      const fuelEfficiency = Math.max(0.1, Number(body.fuelEfficiency || 5)), co2PerLiter = Math.max(0, Number(body.co2PerLiter || 2.69))
      return reply({ ok: true, ordered, distanceKm, durationMinutes, carbonKg: distanceKm / fuelEfficiency * co2PerLiter })
    }
    if (action === "upsert") {
      const item = body.case as Record<string, unknown>
      if (!item?.case_no) return error("案件編號不可空白")
      // 以同一地址、同一建立年度的非取消案件為準：前 3 次申請各有前 2 件免費。
      let caseToSave = item
      if (item.quantity_review_status === "人工已核可") {
        const address = String(item.address || "").trim()
        const year = new Date(String(item.created_at || Date.now())).getFullYear()
        const { data: addressCases, error: countError } = await ctx.supabaseAdmin.from("cases").select("case_no,created_at,status").eq("address", address)
        if (countError) return error(countError.message, 500)
        const annualCases = (addressCases || []).filter((entry) => entry.status !== "已取消" && new Date(entry.created_at || Date.now()).getFullYear() === year).sort((first, second) => String(first.created_at || "").localeCompare(String(second.created_at || "")) || String(first.case_no || "").localeCompare(String(second.case_no || "")))
        const annualCount = Math.max(1, annualCases.findIndex((entry) => entry.case_no === item.case_no) + 1)
        const quantity = Math.max(0, Number(item.quantity || 0))
        const chargeableQuantity = annualCount <= 3 ? Math.max(0, quantity - 2) : quantity
        caseToSave = { ...item, annual_count: annualCount, chargeable_quantity: chargeableQuantity, fee_amount: chargeableQuantity * 200 }
      }
      const { error: dbError } = await ctx.supabaseAdmin.from("cases").upsert(caseToSave, { onConflict: "case_no" })
      return dbError ? error(dbError.message, 500) : reply({ ok: true })
    }
    if (action === "delete") { const { error: dbError } = await ctx.supabaseAdmin.from("cases").delete().eq("case_no", String(body.caseNo || "")); return dbError ? error(dbError.message, 500) : reply({ ok: true }) }
    return error("不支援的操作")
  }),
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/case-api' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
