// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import { withSupabase } from "@supabase/server"

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" }
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: cors })
const error = (message: string, status = 400) => reply({ ok: false, message }, status)
const caseNo = async (supabase: { rpc: (name: string) => Promise<{ data: string | null, error: { message: string } | null }> }) => {
  const { data, error: rpcError } = await supabase.rpc("next_case_no")
  if (rpcError || !data) throw new Error(rpcError?.message || "無法產生預約單號")
  return data
}
const driveRequest = async (supabase: { from: (table: string) => any }, payload: Record<string, unknown>) => {
  const { data: settings, error: settingsError } = await supabase.from("system_settings").select("setting_key,setting_value").in("setting_key", ["google_drive_enabled", "google_drive_web_app_url"])
  if (settingsError) throw new Error("無法讀取 Google Drive 設定")
  const config = Object.fromEntries((settings || []).map((item: { setting_key: string, setting_value: string }) => [item.setting_key, item.setting_value]))
  if (config.google_drive_enabled !== "true") throw new Error("Google Drive 照片服務尚未啟用")
  const url = String(config.google_drive_web_app_url || Deno.env.get("GOOGLE_DRIVE_WEB_APP_URL") || "").trim()
  const token = String(Deno.env.get("GOOGLE_DRIVE_WEB_APP_TOKEN") || "").trim()
  if (!url || !token) throw new Error("Google Drive 照片服務尚未設定")
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ ...payload, token }) })
  const result = await response.json().catch(() => ({}))
  if (!response.ok || !result.ok) throw new Error(String(result.message || "Google Drive 照片服務發生錯誤"))
  return result as { fileId?: string, base64?: string, mimeType?: string }
}
const uploadDrivePhoto = async (supabase: { from: (table: string) => any }, caseNo: string, fileName: string, mimeType: string, base64: string) => {
  const result = await driveRequest(supabase, { action: "upload", caseNo, fileName, mimeType, base64 })
  if (!result.fileId) throw new Error("Google Drive 未回傳檔案識別碼")
  return `drive:${result.fileId}`
}
const syncCasePhotos = async (supabase: any, caseNo: string) => {
  const { data: jobs } = await supabase.from("photo_sync_jobs").select("*").eq("case_no", caseNo).in("status", ["pending", "failed", "syncing"]).order("id")
  for (const job of jobs || []) {
    try {
      await supabase.from("photo_sync_jobs").update({ status: "syncing", attempts: Number(job.attempts || 0) + 1, updated_at: new Date().toISOString(), last_error: null }).eq("id", job.id)
      const { data: file, error: downloadError } = await supabase.storage.from("case-photos").download(job.storage_path)
      if (downloadError || !file) throw new Error(downloadError?.message || "找不到 Supabase 暫存照片")
      const bytes = new Uint8Array(await file.arrayBuffer())
      let binary = ""; for (const byte of bytes) binary += String.fromCharCode(byte)
      const drivePath = await uploadDrivePhoto(supabase, job.case_no, job.target_file_name, file.type || "image/jpeg", btoa(binary))
      const column = job.photo_kind === "completion" ? "completion_photo_paths" : "photo_paths"
      const { data: currentCase, error: caseError } = await supabase.from("cases").select(column).eq("case_no", caseNo).single()
      if (caseError || !currentCase) throw new Error(caseError?.message || "找不到案件資料")
      const currentPaths = Array.isArray(currentCase[column]) ? currentCase[column].map(String) : []
      const nextPaths = currentPaths.map((path) => path === job.storage_path ? drivePath : path)
      const { error: updateError } = await supabase.from("cases").update({ [column]: nextPaths }).eq("case_no", caseNo)
      if (updateError) throw new Error(updateError.message)
      const { error: removeError } = await supabase.storage.from("case-photos").remove([job.storage_path])
      if (removeError) throw new Error(removeError.message)
      await supabase.from("photo_sync_jobs").update({ status: "completed", drive_file_id: drivePath.slice("drive:".length), updated_at: new Date().toISOString() }).eq("id", job.id)
    } catch (syncError) {
      await supabase.from("photo_sync_jobs").update({ status: "failed", last_error: syncError instanceof Error ? syncError.message : "同步失敗", updated_at: new Date().toISOString() }).eq("id", job.id)
    }
  }
}
// `ADMIN_EMAILS` 支援以逗號或分號設定多位管理員；保留舊的
// `ADMIN_EMAIL`，讓既有部署不必立刻調整。
const adminEmails = () => String(Deno.env.get("ADMIN_EMAILS") || Deno.env.get("ADMIN_EMAIL") || "")
  .split(/[,;\n]/)
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)
const geocoderUserAgent = () => `MiaoliBulkyWaste/1.0 (contact: ${String(Deno.env.get("NOMINATIM_CONTACT") || "admin")})`

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: cors })
    if (req.method !== "POST") return error("只接受 POST 請求", 405)
    let body: Record<string, unknown>; try { body = await req.json() } catch { return error("請求格式不正確") }
    const action = String(body.action || "")
    if (action === "health") return reply({ ok: true, service: "case-api" })

    if (action === "publicPrepareUploads") {
      const photos = Array.isArray(body.photos) ? body.photos : []
      if (!photos.length || photos.length > 8) return error("待清運照片數量不正確")
      const sessionId = crypto.randomUUID(), no = await caseNo(ctx.supabaseAdmin)
      const paths: string[] = []
      for (const [index, photo] of photos.entries()) {
        const mimeType = String((photo as Record<string, unknown>).mimeType || "")
        const size = Number((photo as Record<string, unknown>).size || 0)
        if (!mimeType.startsWith("image/") || !Number.isFinite(size) || size < 1 || size > 8 * 1024 * 1024) return error("照片格式或大小不正確")
        paths.push(`staging/${sessionId}/${no}-${index + 1}.jpg`)
      }
      const { error: sessionError } = await ctx.supabaseAdmin.from("photo_upload_sessions").insert({ id: sessionId, case_no: no, photo_paths: paths, expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() })
      if (sessionError) return error(sessionError.message, 500)
      const uploads = await Promise.all(paths.map(async (path) => {
        const { data, error: uploadError } = await ctx.supabaseAdmin.storage.from("case-photos").createSignedUploadUrl(path)
        if (uploadError || !data?.signedUrl) throw new Error(uploadError?.message || "無法建立照片上傳網址")
        return { path, signedUrl: data.signedUrl }
      })).catch((uploadError) => ({ error: uploadError }))
      if (!Array.isArray(uploads)) return error(uploads.error instanceof Error ? uploads.error.message : "無法建立照片上傳網址", 500)
      return reply({ ok: true, sessionId, caseNo: no, uploads })
    }

    if (action === "publicCreate") {
      const applicant = String(body.applicant || "").trim(), phone = String(body.phone || "").trim(), county = String(body.county || "").trim(), district = String(body.district || "").trim(), addressDetail = String(body.addressDetail || "").trim(), wasteType = String(body.wasteType || "").trim()
      const suppliedAddress = String(body.address || "").trim()
      const address = suppliedAddress || `${county}${district}${addressDetail}`
      if (!applicant || !phone || !county || !district || !addressDetail || !address || !wasteType) return error("請完整填寫申請資料")
      const uploadSessionId = String(body.uploadSessionId || "")
      let no: string, photoPaths: string[] = []
      if (uploadSessionId) {
        const { data: session, error: sessionError } = await ctx.supabaseAdmin.from("photo_upload_sessions").select("case_no,photo_paths,expires_at").eq("id", uploadSessionId).single()
        if (sessionError || !session || new Date(session.expires_at).getTime() < Date.now()) return error("照片上傳工作階段已失效，請重新送出", 400)
        no = session.case_no
        photoPaths = Array.isArray(session.photo_paths) ? session.photo_paths.map(String) : []
        if (!photoPaths.length) return error("找不到已上傳照片", 400)
      } else {
        try { no = await caseNo(ctx.supabaseAdmin) } catch (numberError) { return error(numberError instanceof Error ? numberError.message : "無法產生預約單號", 500) }
      }
      // 民眾照片由 Edge Function 轉送至 Google Drive；資料庫只保存 Drive 檔案 ID。
      const inputs = Array.isArray(body.photos) ? body.photos : body.photo ? [body.photo] : []
      if (inputs.length > 8) return error("待清運照片最多上傳 8 張")
      for (const [index, input] of uploadSessionId ? [].entries() : inputs.entries()) {
        const photo = input as Record<string, unknown>
        const mimeType = String(photo.mimeType || "image/jpeg")
        const base64 = String(photo.base64 || "")
        if (!mimeType.startsWith("image/") || !base64) return error("待清運照片格式不正確")
        let bytes: Uint8Array
        try { bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0)) } catch { return error("待清運照片內容不正確") }
        if (!bytes.length || bytes.length > 8 * 1024 * 1024) return error("每張待清運照片須介於 1 B 至 8 MB")
        try { photoPaths.push(await uploadDrivePhoto(ctx.supabaseAdmin, no, `${no}-${index + 1}.jpg`, mimeType, base64)) } catch (uploadError) { return error(`待清運照片上傳失敗：${uploadError instanceof Error ? uploadError.message : "未知錯誤"}`, 500) }
      }
      const { error: dbError } = await ctx.supabaseAdmin.from("cases").insert({ case_no: no, applicant, phone, address, waste_type: wasteType, quantity: Math.max(1, Number(body.quantity || 1)), status: "待處理", requested_scheduled_at: body.preferredDate ? `${body.preferredDate}T00:00:00+08:00` : null, dispatch_period: String(body.preferredTimeSlot || ""), dispatch_note: String(body.locationNote || ""), email: String(body.email || "") || null, photo_paths: photoPaths })
      if (!dbError && uploadSessionId) {
        await ctx.supabaseAdmin.from("photo_sync_jobs").insert(photoPaths.map((storagePath, index) => ({ case_no: no, storage_path: storagePath, target_file_name: `${no}-${index + 1}.jpg`, photo_kind: "pending" })))
        await ctx.supabaseAdmin.from("photo_upload_sessions").delete().eq("id", uploadSessionId)
        EdgeRuntime.waitUntil(syncCasePhotos(ctx.supabaseAdmin, no))
      }
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
    if (action === "workerPrepareUploads") {
      const pin = String(body.pin || ""), caseId = String(body.caseId || ""), photos = Array.isArray(body.photos) ? body.photos : []
      const { data: validPin, error: pinError } = await ctx.supabaseAdmin.rpc("verify_worker_pin", { p_pin: pin })
      if (pinError || !validPin || !caseId) return error("工作人員驗證碼不正確", 401)
      const { data: caseRecord, error: caseError } = await ctx.supabaseAdmin.from("cases").select("case_no").eq("id", caseId).single()
      if (caseError || !caseRecord?.case_no || !photos.length || photos.length > 2) return error("結案照片資料不正確")
      const sessionId = crypto.randomUUID(), paths: string[] = []
      for (const [index, photo] of photos.entries()) {
        const info = photo as Record<string, unknown>, mimeType = String(info.mimeType || ""), size = Number(info.size || 0)
        if (!mimeType.startsWith("image/") || !Number.isFinite(size) || size < 1 || size > 8 * 1024 * 1024) return error("結案照片格式或大小不正確")
        paths.push(`staging/${sessionId}/${caseRecord.case_no}-finish-${index + 1}.jpg`)
      }
      const uploads = await Promise.all(paths.map(async (path) => {
        const { data, error: uploadError } = await ctx.supabaseAdmin.storage.from("case-photos").createSignedUploadUrl(path)
        if (uploadError || !data?.signedUrl) throw new Error(uploadError?.message || "無法建立結案照片上傳網址")
        return { path, signedUrl: data.signedUrl }
      })).catch((uploadError) => ({ error: uploadError }))
      if (!Array.isArray(uploads)) return error(uploads.error instanceof Error ? uploads.error.message : "無法建立結案照片上傳網址", 500)
      return reply({ ok: true, uploads })
    }
    if (action === "workerComplete") {
      const pin = String(body.pin || ""), caseId = String(body.caseId || "")
      const { data: validPin, error: pinError } = await ctx.supabaseAdmin.rpc("verify_worker_pin", { p_pin: pin })
      if (pinError || !validPin) return error("工作人員驗證碼不正確", 401)
      const { data: caseRecord, error: caseError } = await ctx.supabaseAdmin.from("cases").select("case_no").eq("id", caseId).single()
      if (caseError || !caseRecord?.case_no) return error("找不到案件資料", 404)
      const stagedPhotoPaths = Array.isArray(body.stagedPhotoPaths) ? body.stagedPhotoPaths.map(String) : []
      const photoPaths: string[] = [...stagedPhotoPaths]
      if (stagedPhotoPaths.some((path) => !path.startsWith("staging/")) || stagedPhotoPaths.length > 2) return error("結案照片暫存路徑不正確")
      const files = Array.isArray(body.files) ? body.files.slice(0, 2) : []
      for (const [index, input] of stagedPhotoPaths.length ? [].entries() : files.entries()) {
        const file = input as Record<string, unknown>, base64 = String(file.fileBase64 || ""), mimeType = String(file.mimeType || "image/jpeg")
        if (!base64 || !mimeType.startsWith("image/")) return error("結案照片格式不正確")
        let bytes: Uint8Array; try { bytes = Uint8Array.from(atob(base64), (value) => value.charCodeAt(0)) } catch { return error("結案照片內容不正確") }
        if (!bytes.length || bytes.length > 8 * 1024 * 1024) return error("每張結案照片須介於 1 B 至 8 MB")
        try { photoPaths.push(await uploadDrivePhoto(ctx.supabaseAdmin, caseRecord.case_no, `${caseRecord.case_no}-finish-${index + 1}.jpg`, mimeType, base64)) } catch (uploadError) { return error(`結案照片上傳失敗：${uploadError instanceof Error ? uploadError.message : "未知錯誤"}`, 500) }
      }
      const { error: dbError } = await ctx.supabaseAdmin.rpc("worker_complete_case", { p_pin: pin, p_case_id: caseId, p_note: String(body.note || ""), p_photo_paths: photoPaths })
      if (!dbError && stagedPhotoPaths.length) {
        await ctx.supabaseAdmin.from("photo_sync_jobs").insert(stagedPhotoPaths.map((storagePath, index) => ({ case_no: caseRecord.case_no, storage_path: storagePath, target_file_name: `${caseRecord.case_no}-finish-${index + 1}.jpg`, photo_kind: "completion" })))
        await syncCasePhotos(ctx.supabaseAdmin, caseRecord.case_no)
      }
      return dbError ? error(dbError.message, 400) : reply({ ok: true })
    }

    // 其餘操作皆需要登入的 Supabase 管理員。
    const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || ""
    const { data: userResult, error: authError } = await ctx.supabaseAdmin.auth.getUser(bearer)
    const permittedAdminEmails = adminEmails()
    if (!permittedAdminEmails.length || authError || !permittedAdminEmails.includes(userResult.user?.email?.toLowerCase() || "")) return error("管理員權限不足", 403)
    if (action === "adminPrepareCompletionUploads") {
      const caseNo = String(body.caseNo || ""), photos = Array.isArray(body.photos) ? body.photos : []
      if (!caseNo || !photos.length || photos.length > 2) return error("結案照片資料不正確")
      const sessionId = crypto.randomUUID(), paths: string[] = []
      for (const [index, photo] of photos.entries()) {
        const info = photo as Record<string, unknown>, mimeType = String(info.mimeType || ""), size = Number(info.size || 0)
        if (!mimeType.startsWith("image/") || !Number.isFinite(size) || size < 1 || size > 8 * 1024 * 1024) return error("結案照片格式或大小不正確")
        paths.push(`staging/${sessionId}/${caseNo}-finish-${index + 1}.jpg`)
      }
      const uploads = await Promise.all(paths.map(async (path) => {
        const { data, error: uploadError } = await ctx.supabaseAdmin.storage.from("case-photos").createSignedUploadUrl(path)
        if (uploadError || !data?.signedUrl) throw new Error(uploadError?.message || "無法建立結案照片上傳網址")
        return { path, signedUrl: data.signedUrl }
      })).catch((uploadError) => ({ error: uploadError }))
      if (!Array.isArray(uploads)) return error(uploads.error instanceof Error ? uploads.error.message : "無法建立結案照片上傳網址", 500)
      return reply({ ok: true, uploads })
    }
    if (action === "adminQueueCompletionPhotos") {
      const caseNo = String(body.caseNo || ""), stagedPhotoPaths = Array.isArray(body.stagedPhotoPaths) ? body.stagedPhotoPaths.map(String) : []
      if (!caseNo || !stagedPhotoPaths.length || stagedPhotoPaths.length > 2 || stagedPhotoPaths.some((path) => !path.startsWith("staging/"))) return error("結案照片暫存路徑不正確")
      const { error: jobError } = await ctx.supabaseAdmin.from("photo_sync_jobs").insert(stagedPhotoPaths.map((storagePath, index) => ({ case_no: caseNo, storage_path: storagePath, target_file_name: `${caseNo}-finish-${index + 1}.jpg`, photo_kind: "completion" })))
      if (jobError) return error(jobError.message, 500)
      await syncCasePhotos(ctx.supabaseAdmin, caseNo)
      return reply({ ok: true })
    }
    if (action === "createPhoneCase") {
      const applicant = String(body.applicant || "").trim(), phone = String(body.phone || "").trim(), address = String(body.address || "").trim(), wasteType = String(body.wasteType || "").trim()
      if (!applicant || !phone || !address || !wasteType) return error("請完整填寫申請人、電話、地址與清運品項")
      const uploadSessionId = String(body.uploadSessionId || "")
      let no: string, photoPaths: string[] = []
      if (uploadSessionId) {
        const { data: session, error: sessionError } = await ctx.supabaseAdmin.from("photo_upload_sessions").select("case_no,photo_paths,expires_at").eq("id", uploadSessionId).single()
        if (sessionError || !session || new Date(session.expires_at).getTime() < Date.now()) return error("照片上傳工作階段已失效，請重新送出", 400)
        no = session.case_no
        photoPaths = Array.isArray(session.photo_paths) ? session.photo_paths.map(String) : []
      } else {
        try { no = await caseNo(ctx.supabaseAdmin) } catch (numberError) { return error(numberError instanceof Error ? numberError.message : "無法產生預約單號", 500) }
      }
      const inputs = Array.isArray(body.photos) ? body.photos : []
      if (inputs.length > 8) return error("待清運照片最多上傳 8 張")
      for (const [index, input] of uploadSessionId ? [].entries() : inputs.entries()) {
        const photo = input as Record<string, unknown>, mimeType = String(photo.mimeType || "image/jpeg"), base64 = String(photo.base64 || "")
        if (!mimeType.startsWith("image/") || !base64) return error("待清運照片格式不正確")
        let bytes: Uint8Array
        try { bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0)) } catch { return error("待清運照片內容不正確") }
        if (!bytes.length || bytes.length > 8 * 1024 * 1024) return error("每張待清運照片須介於 1 B 至 8 MB")
        try { photoPaths.push(await uploadDrivePhoto(ctx.supabaseAdmin, no, `${no}-${index + 1}.jpg`, mimeType, base64)) } catch (uploadError) { return error(`待清運照片上傳失敗：${uploadError instanceof Error ? uploadError.message : "未知錯誤"}`, 500) }
      }
      const { error: dbError } = await ctx.supabaseAdmin.from("cases").insert({ case_no: no, applicant, phone, email: String(body.email || "") || null, address, waste_type: wasteType, quantity: Math.max(1, Number(body.quantity || 1)), status: "待處理", requested_scheduled_at: body.preferredDate ? `${body.preferredDate}T00:00:00+08:00` : null, dispatch_period: String(body.preferredTimeSlot || ""), dispatch_note: String(body.note || ""), photo_paths: photoPaths, report_source: "電話申請" })
      if (!dbError && uploadSessionId) {
        await ctx.supabaseAdmin.from("photo_sync_jobs").insert(photoPaths.map((storagePath, index) => ({ case_no: no, storage_path: storagePath, target_file_name: `${no}-${index + 1}.jpg`, photo_kind: "pending" })))
        await ctx.supabaseAdmin.from("photo_upload_sessions").delete().eq("id", uploadSessionId)
        EdgeRuntime.waitUntil(syncCasePhotos(ctx.supabaseAdmin, no))
      }
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
      if (path.startsWith("drive:")) {
        try {
          const result = await driveRequest(ctx.supabaseAdmin, { action: "get", fileId: path.slice("drive:".length) })
          if (!result.base64) return error("Google Drive 未回傳照片內容", 404)
          return reply({ ok: true, base64: result.base64, mimeType: result.mimeType || "image/jpeg" })
        } catch (driveError) { return error(driveError instanceof Error ? driveError.message : "無法讀取 Google Drive 照片", 404) }
      }
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
    if (action === "databaseView") {
      // 開啟資料庫檢視時，順便重試先前被中斷的照片同步工作。
      const { data: pendingJobs } = await ctx.supabaseAdmin.from("photo_sync_jobs").select("case_no").in("status", ["pending", "failed", "syncing"]).limit(20)
      for (const caseNo of [...new Set((pendingJobs || []).map((job) => String(job.case_no)))]) await syncCasePhotos(ctx.supabaseAdmin, caseNo)
      const [casesResult, vehiclesResult, workersResult, settingsResult, historyResult, photoSyncResult] = await Promise.all([
        ctx.supabaseAdmin.from("cases").select("*").order("created_at", { ascending: false }),
        ctx.supabaseAdmin.from("vehicles").select("*").order("vehicle_no"),
        ctx.supabaseAdmin.from("workers").select("*").order("name"),
        ctx.supabaseAdmin.from("system_settings").select("*").order("setting_key"),
        ctx.supabaseAdmin.from("case_history").select("*").order("created_at", { ascending: false }),
        ctx.supabaseAdmin.from("photo_sync_jobs").select("*").order("created_at", { ascending: false }),
      ])
      const dbError = casesResult.error || vehiclesResult.error || workersResult.error || settingsResult.error || historyResult.error || photoSyncResult.error
      return dbError ? error(dbError.message, 500) : reply({ ok: true, database: { cases: casesResult.data || [], vehicles: vehiclesResult.data || [], workers: workersResult.data || [], system_settings: settingsResult.data || [], case_history: historyResult.data || [], photo_sync_jobs: photoSyncResult.data || [] } })
    }
    if (action === "databaseDelete") {
      const table = String(body.table || ""), allowed = ["cases", "vehicles", "workers", "system_settings", "case_history"]
      if (!allowed.includes(table)) return error("不允許刪除此資料表")
      const key = table === "cases" ? "case_no" : table === "system_settings" ? "setting_key" : "id"
      const value = String(body.keyValue || "")
      if (!value) return error("缺少刪除資料識別碼")
      const { error: dbError } = await ctx.supabaseAdmin.from(table).delete().eq(key, value)
      return dbError ? error(dbError.message, 500) : reply({ ok: true })
    }
    if (action === "dispatchOptions") {
      const [{ data: vehicles, error: vehicleError }, { data: workers, error: workerError }, { data: settings, error: settingsError }] = await Promise.all([ctx.supabaseAdmin.from("vehicles").select("vehicle_no,fuel_efficiency,co2_per_liter").eq("active", true).order("vehicle_no"), ctx.supabaseAdmin.from("workers").select("name").eq("active", true).order("name"), ctx.supabaseAdmin.from("system_settings").select("setting_key,setting_value").in("setting_key", ["route_origin", "google_drive_enabled", "google_drive_web_app_url"])])
      const config = Object.fromEntries((settings || []).map((item) => [item.setting_key, item.setting_value]))
      return vehicleError || workerError || settingsError ? error(vehicleError?.message || workerError?.message || settingsError?.message || "讀取系統設定失敗", 500) : reply({ ok: true, dispatch: { vehicles: vehicles || [], workers: (workers || []).map((item) => item.name), route_origin: config.route_origin || "24.380891,120.734372", google_drive_enabled: config.google_drive_enabled === "true", google_drive_web_app_url: config.google_drive_web_app_url || "" } })
    }
    if (action === "updateDispatchOptions") {
      const vehicles = Array.isArray(body.vehicles) ? body.vehicles : []
      const workers = Array.isArray(body.workers) ? body.workers : []
      const routeOrigin = String(body.routeOrigin || "24.380891,120.734372").trim()
      const googleDriveEnabled = body.googleDriveEnabled === true ? "true" : "false"
      const googleDriveWebAppUrl = String(body.googleDriveWebAppUrl || "").trim()
      const originValues = routeOrigin.split(",").map(Number)
      if (originValues.length !== 2 || originValues.some((value) => !Number.isFinite(value)) || Math.abs(originValues[0]) > 90 || Math.abs(originValues[1]) > 180) return error("出發點請填寫正確的緯度,經度")
      const vehicleRows = vehicles.map((item: any) => ({ vehicle_no: String(item.vehicle_no || item).trim(), fuel_efficiency: Number(item.fuel_efficiency || 5), co2_per_liter: Number(item.co2_per_liter || 2.69), active: true })).filter((item) => item.vehicle_no)
      const workerRows = workers.map((name) => ({ name: String(name).trim(), active: true })).filter((item) => item.name)
      const { error: disableVehicleError } = await ctx.supabaseAdmin.from("vehicles").update({ active: false }).eq("active", true)
      const { error: disableWorkerError } = await ctx.supabaseAdmin.from("workers").update({ active: false }).eq("active", true)
      const vehicleResult = vehicleRows.length ? await ctx.supabaseAdmin.from("vehicles").upsert(vehicleRows, { onConflict: "vehicle_no" }) : { error: null }
      const workerResult = workerRows.length ? await ctx.supabaseAdmin.from("workers").upsert(workerRows, { onConflict: "name" }) : { error: null }
      if (googleDriveEnabled && !/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(googleDriveWebAppUrl)) return error("請輸入有效的 Google Apps Script Web App /exec 網址")
      const settingsResult = await ctx.supabaseAdmin.from("system_settings").upsert([{ setting_key: "route_origin", setting_value: routeOrigin, updated_at: new Date().toISOString() }, { setting_key: "google_drive_enabled", setting_value: googleDriveEnabled, updated_at: new Date().toISOString() }, { setting_key: "google_drive_web_app_url", setting_value: googleDriveWebAppUrl, updated_at: new Date().toISOString() }], { onConflict: "setting_key" })
      const saveError = disableVehicleError || disableWorkerError || vehicleResult.error || workerResult.error || settingsResult.error
      return saveError ? error(saveError.message || "儲存派車設定失敗", 500) : reply({ ok: true })
    }
    if (action === "calculateRoute") {
      const caseNos = Array.isArray(body.caseNos) ? body.caseNos.map(String).filter(Boolean).slice(0, 20) : []
      if (!caseNos.length) return error("請提供至少一筆已排班案件")
      const originValues = String(body.origin || "24.380891,120.734372").split(",").map(Number)
      if (originValues.length !== 2 || originValues.some(Number.isNaN)) return error("出發點座標格式不正確")
      const [originLat, originLon] = originValues
      const validCoordinate = (latitude: number, longitude: number) => Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180 && !(latitude === 0 && longitude === 0)
      if (!validCoordinate(originLat, originLon)) return error("出發點座標無效")
      const { data: cases, error: casesError } = await ctx.supabaseAdmin.from("cases").select("case_no,address,latitude,longitude").in("case_no", caseNos)
      if (casesError) return error(casesError.message, 500)
      const points: Array<{ case_no: string; latitude: number; longitude: number }> = []
      for (const item of cases || []) {
        let latitude = Number(item.latitude), longitude = Number(item.longitude)
        // 0,0 是過去資料中的預設值，並非台灣地址；一律重新定位。
        if (!validCoordinate(latitude, longitude)) {
          const rawAddress = String(item.address || "").trim()
          const scopedAddress = rawAddress.includes("苗栗") ? rawAddress : `苗栗縣三義鄉${rawAddress}`
          // OSM 有時僅收錄道路、未收錄單一門牌；最後改查同一條道路，仍可供清運路線規劃使用。
          const roadAddress = scopedAddress.replace(/(?:\d+[\d-]*號(?:之\d+)?(?:\d+樓)?).*$/, "").trim()
          const geocodeQueries = [...new Set([rawAddress, scopedAddress, roadAddress].filter(Boolean))]
          let match: any = null
          for (const query of geocodeQueries) {
            const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=tw&q=${encodeURIComponent(query)}`
            const geocodeResponse = await fetch(geocodeUrl, { headers: { "User-Agent": geocoderUserAgent(), "Accept-Language": "zh-TW" } })
            const matches = await geocodeResponse.json().catch(() => [])
            if (geocodeResponse.ok && Array.isArray(matches) && matches[0]) { match = matches[0]; break }
            await new Promise((resolve) => setTimeout(resolve, 1100))
          }
          if (!match) return error(`找不到地址座標：${rawAddress}。請於案件資料補上完整的縣市與鄉鎮地址。`, 422)
          latitude = Number(match.lat); longitude = Number(match.lon)
          if (!validCoordinate(latitude, longitude)) return error(`地址座標格式錯誤：${item.address}`, 422)
          const { error: saveCoordinateError } = await ctx.supabaseAdmin.from("cases").update({ latitude, longitude }).eq("case_no", item.case_no)
          if (saveCoordinateError) return error(saveCoordinateError.message, 500)
          await new Promise((resolve) => setTimeout(resolve, 1100))
        }
        points.push({ case_no: item.case_no, latitude, longitude })
      }
      const distance = (a: [number, number], b: [number, number]) => { const r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r, h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) ** 2; return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)) }
      const requestedOrder = new Map(caseNos.map((caseNo, index) => [caseNo, index]))
      const remaining = [...points], ordered: typeof points = []
      if (body.preserveOrder) ordered.push(...remaining.sort((first, second) => (requestedOrder.get(first.case_no) || 0) - (requestedOrder.get(second.case_no) || 0)))
      else {
        let current: [number, number] = [originLat, originLon]
        while (remaining.length) { remaining.sort((first, second) => distance(current, [first.latitude, first.longitude]) - distance(current, [second.latitude, second.longitude])); const next = remaining.shift()!; ordered.push(next); current = [next.latitude, next.longitude] }
      }
      const coordinates = [[originLon, originLat], ...ordered.map((item) => [item.longitude, item.latitude])].map((point) => point.join(",")).join(";")
      const radiuses = Array(ordered.length + 1).fill("20000").join(";")
      const routeUrls = [
        `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=false&steps=false&radiuses=${radiuses}`,
        `https://routing.openstreetmap.de/routed-car/route/v1/driving/${coordinates}?overview=false&steps=false&radiuses=${radiuses}`,
      ]
      let route: any = null, routeError = ""
      for (const routeUrl of routeUrls) {
        try {
          const routeResponse = await fetch(routeUrl, { headers: { "User-Agent": geocoderUserAgent() } })
          const routeData = await routeResponse.json().catch(() => ({}))
          if (routeResponse.ok && routeData?.routes?.[0]) { route = routeData.routes[0]; break }
          routeError = `${routeData?.code || `HTTP ${routeResponse.status}`}${routeData?.message ? `：${routeData.message}` : ''}`
        } catch (cause) { routeError = cause instanceof Error ? cause.message : "網路連線失敗" }
      }
      const fallbackDistanceKm = ordered.reduce((total, point, index) => total + distance(index ? [ordered[index - 1].latitude, ordered[index - 1].longitude] : [originLat, originLon], [point.latitude, point.longitude]), 0) * 1.35
      const distanceKm = route ? Number(route.distance || 0) / 1000 : fallbackDistanceKm, durationMinutes = route ? Math.round(Number(route.duration || 0) / 60) : 0
      const fuelEfficiency = Math.max(0.1, Number(body.fuelEfficiency || 5)), co2PerLiter = Math.max(0, Number(body.co2PerLiter || 2.69))
      return reply({ ok: true, ordered, distanceKm, durationMinutes, carbonKg: distanceKm / fuelEfficiency * co2PerLiter, estimated: !route, routeWarning: route ? '' : `無法取得道路路線（${routeError}），已改用直線距離 × 1.35 的預估值` })
    }
    if (action === "upsert") {
      const item = body.case as Record<string, unknown>
      if (!item?.case_no) return error("案件編號不可空白")
      // 同一地址、同一建立年度最多有 3 次申請機會與合計 6 件免費額度。
      // 已取消案件不計入；免費額度以先前人工核可（或已完成）的件數累計。
      let caseToSave = item
      if (item.quantity_review_status === "人工已核可") {
        const address = String(item.address || "").trim()
        const year = new Date(String(item.created_at || Date.now())).getFullYear()
        const { data: addressCases, error: countError } = await ctx.supabaseAdmin.from("cases").select("case_no,created_at,status,quantity,quantity_review_status").eq("address", address)
        if (countError) return error(countError.message, 500)
        const annualCases = (addressCases || []).filter((entry) => entry.status !== "已取消" && new Date(entry.created_at || Date.now()).getFullYear() === year).sort((first, second) => String(first.created_at || "").localeCompare(String(second.created_at || "")) || String(first.case_no || "").localeCompare(String(second.case_no || "")))
        const annualCount = Math.max(1, annualCases.findIndex((entry) => entry.case_no === item.case_no) + 1)
        const quantity = Math.max(0, Number(item.quantity || 0))
        const currentIndex = annualCases.findIndex((entry) => entry.case_no === item.case_no)
        const freeUsed = annualCases.slice(0, currentIndex < 0 ? annualCases.length : currentIndex)
          .filter((entry) => entry.quantity_review_status === "人工已核可" || entry.status === "清運完成")
          .reduce((total, entry) => total + Math.max(0, Number(entry.quantity || 0)), 0)
        const freeQuantity = annualCount <= 3 ? Math.min(quantity, Math.max(0, 6 - freeUsed)) : 0
        const chargeableQuantity = quantity - freeQuantity
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
