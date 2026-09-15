export default function SystemSettings({
  vehicles, setVehicles, workers, setWorkers, routeOrigin, setRouteOrigin,
  googleDriveEnabled, setGoogleDriveEnabled, googleDriveWebAppUrl, setGoogleDriveWebAppUrl,
  loading, message, onSave,
}) {
  const updateVehicle = (index, field, value) => setVehicles(vehicles.map((item, i) => i === index ? { ...item, [field]: value } : item))
  return <main className="mx-auto max-w-5xl p-4 sm:p-6">
    <div className="mb-5"><p className="text-sm font-black text-emerald-700">系統設定</p><h2 className="mt-1 text-2xl font-black">派車資料與清運人員名單</h2><p className="mt-2 text-sm text-slate-500">儲存後，排班選單、路線規劃與照片同步會立即套用新設定。</p></div>
    {message && <div className="mb-4 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">{message}</div>}
    <section className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="text-lg font-black">清運車出發點</h3><p className="mt-1 text-xs text-slate-500">用於自動路線計算及整批導航；格式為「緯度,經度」。</p>
      <label className="mt-4 block max-w-md text-xs font-bold text-slate-600">出發點座標<input value={routeOrigin} onInput={(event) => setRouteOrigin(event.target.value)} placeholder="24.380891,120.734372" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"/></label>
    </section>
    <section className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="text-lg font-black">Google Drive 照片同步</h3><p className="mt-1 text-xs text-slate-500">控制案件照片是否同步至 Google Drive，並設定 Apps Script Web App 網址。</p>
      <label className="mt-4 flex max-w-md cursor-pointer items-center justify-between gap-4 rounded-xl border p-4"><span><span className="block text-sm font-black text-slate-700">啟用 Google Drive 同步</span><span className="mt-1 block font-mono text-xs text-slate-500">google_drive_enabled</span></span><input type="checkbox" checked={googleDriveEnabled} onChange={(event) => setGoogleDriveEnabled(event.target.checked)} className="h-5 w-5 accent-emerald-700"/></label>
      <label className="mt-4 block text-xs font-bold text-slate-600">Google Apps Script Web App 網址<span className="ml-2 font-mono font-normal text-slate-400">google_drive_web_app_url</span><input type="url" value={googleDriveWebAppUrl} onInput={(event) => setGoogleDriveWebAppUrl(event.target.value)} placeholder="留白時使用 Supabase Secret 的設定" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"/><span className="mt-2 block font-normal leading-5 text-slate-500">此欄留白時，系統會採用 Supabase Secret 的 <span className="font-mono">GOOGLE_DRIVE_WEB_APP_URL</span>；只有需要改用其他 Web App 網址時才自行輸入。</span></label>
    </section>
    <div className="grid gap-5 lg:grid-cols-2">
      <SettingsCard title="派車資料" subtitle="車號、平均油耗與碳排係數" addAction={() => setVehicles([...vehicles, { vehicle_no: '', fuel_efficiency: 5, co2_per_liter: 2.69 }])} addLabel="新增車輛">
        {vehicles.map((item, index) => <div key={index} className="grid gap-2 rounded-xl border p-3 sm:grid-cols-[1fr_90px_90px_auto]"><Field label="車號" value={item.vehicle_no || ''} updateValue={(value) => updateVehicle(index, 'vehicle_no', value)} placeholder="KAA-1234"/><Field label="公里／公升" type="number" value={item.fuel_efficiency ?? 5} updateValue={(value) => updateVehicle(index, 'fuel_efficiency', value)}/><Field label="kg CO₂／L" type="number" value={item.co2_per_liter ?? 2.69} updateValue={(value) => updateVehicle(index, 'co2_per_liter', value)}/><DeleteButton action={() => setVehicles(vehicles.filter((_, i) => i !== index))}/></div>)}
      </SettingsCard>
      <SettingsCard title="清運人員名單" subtitle="排班時可選擇的人員" addAction={() => setWorkers([...workers, ''])} addLabel="新增人員">
        {workers.map((name, index) => <div key={index} className="flex gap-2 rounded-xl border p-3"><input value={name} onChange={(event) => setWorkers(workers.map((item, i) => i === index ? event.target.value : item))} placeholder="輸入清運人員姓名" className="min-w-0 flex-1 rounded-lg border px-3 py-2"/><DeleteButton action={() => setWorkers(workers.filter((_, i) => i !== index))}/></div>)}
      </SettingsCard>
    </div>
    <div className="mt-5 flex justify-end border-t border-slate-200 pt-5"><button type="button" disabled={loading} onClick={onSave} className="inline-flex min-w-44 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 font-black text-white transition-colors hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60">{loading && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true"/>}<span>{loading ? '設定儲存中…' : '儲存全部設定'}</span></button></div>
  </main>
}

function SettingsCard({ title, subtitle, addAction, addLabel }, { slots }) { return <section className="rounded-2xl bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div><h3 className="text-lg font-black">{title}</h3><p className="text-xs text-slate-500">{subtitle}</p></div><button type="button" onClick={addAction} className="rounded-xl bg-emerald-700 px-3 py-2 text-sm font-black text-white">＋ {addLabel}</button></div><div className="mt-4 space-y-3">{slots.default?.()}</div></section> }
function Field({ label, value, updateValue, type = 'text', placeholder = '' }) { return <label className="text-xs font-bold text-slate-600">{label}<input type={type} min={type === 'number' ? '0.1' : undefined} step={type === 'number' ? '0.01' : undefined} value={value} placeholder={placeholder} onInput={(event) => updateValue(event.target.value)} className="mt-1 w-full rounded-lg border px-2 py-2"/></label> }
function DeleteButton({ action }) { return <button type="button" onClick={action} className="self-end rounded-lg border border-rose-200 px-3 py-2 text-rose-700">刪除</button> }
