import { c as createVNode, a as createTextVNode, i as isVNode, u as useState, b as useMemo, p as preparePublicUploads, d as uploadSignedPhoto, e as adminPost, f as useEffect, F as Fragment, g as useRef, h as adminLogin, t as toCasePayload, j as createApp } from "./registerServiceWorker-WOepRXXS.js";
import { f as formatTaiwanPhone, C as COUNTIES, D as DISTRICTS_BY_COUNTY, a as CATEGORIES, M as MinguoDatePicker, b as formatMinguoDate, g as getUnavailableBookingReason } from "./MinguoDatePicker-CVoJk8tb.js";
function getMinguoTime(d) {
  if (!d) d = /* @__PURE__ */ new Date();
  if (!(d instanceof Date)) {
    var raw = String(d).trim();
    var parts = raw.match(/\d+/g);
    if ((raw.indexOf("民國") === 0 || /^\d{2,3}\/\d{1,2}\/\d{1,2}/.test(raw)) && parts && parts.length >= 3) {
      if (/^\d{2,3}\/\d{1,2}\/\d{1,2}/.test(raw)) return raw;
      d = new Date(Number(parts[0]) + 1911, Number(parts[1]) - 1, Number(parts[2]), Number(parts[3] || 0), Number(parts[4] || 0));
    } else {
      d = new Date(raw);
    }
    if (isNaN(d.getTime())) return raw;
  }
  var year = d.getFullYear() - 1911;
  var month = d.getMonth() + 1;
  var day = d.getDate();
  var period = d.getHours() < 12 ? "上午" : "下午";
  var hours = ("0" + (d.getHours() % 12 || 12)).slice(-2);
  var minutes = ("0" + d.getMinutes()).slice(-2);
  return year + "/" + month + "/" + day + period + hours + ":" + minutes;
}
function _isSlot(s) {
  return typeof s === "function" || Object.prototype.toString.call(s) === "[object Object]" && !isVNode(s);
}
function SystemSettings({
  vehicles,
  setVehicles,
  workers,
  setWorkers,
  routeOrigin,
  setRouteOrigin,
  loading,
  message,
  onSave
}) {
  let _slot, _slot2;
  const updateVehicle = (index, field, value) => setVehicles(vehicles.map((item, i) => i === index ? {
    ...item,
    [field]: value
  } : item));
  return createVNode("main", {
    "className": "mx-auto max-w-5xl p-4 sm:p-6"
  }, [createVNode("div", {
    "className": "mb-5"
  }, [createVNode("p", {
    "className": "text-sm font-black text-emerald-700"
  }, [createTextVNode("系統設定")]), createVNode("h2", {
    "className": "mt-1 text-2xl font-black"
  }, [createTextVNode("派車資料與清運人員名單")]), createVNode("p", {
    "className": "mt-2 text-sm text-slate-500"
  }, [createTextVNode("儲存後，排班選單與路線規劃會立即套用新設定。")])]), message && createVNode("div", {
    "className": "mb-4 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800"
  }, [message]), createVNode("section", {
    "className": "mb-5 rounded-2xl bg-white p-5 shadow-sm"
  }, [createVNode("h3", {
    "className": "text-lg font-black"
  }, [createTextVNode("清運車出發點")]), createVNode("p", {
    "className": "mt-1 text-xs text-slate-500"
  }, [createTextVNode("用於自動路線計算及整批導航；格式為「緯度,經度」。")]), createVNode("label", {
    "className": "mt-4 block max-w-md text-xs font-bold text-slate-600"
  }, [createTextVNode("出發點座標"), createVNode("input", {
    "value": routeOrigin,
    "onInput": (event) => setRouteOrigin(event.target.value),
    "placeholder": "24.380891,120.734372",
    "className": "mt-1 w-full rounded-lg border px-3 py-2 text-sm"
  }, null)])]), createVNode("div", {
    "className": "grid gap-5 lg:grid-cols-2"
  }, [createVNode(SettingsCard, {
    "title": "派車資料",
    "subtitle": "車號、平均油耗與碳排係數",
    "addAction": () => setVehicles([...vehicles, {
      vehicle_no: "",
      fuel_efficiency: 5,
      co2_per_liter: 2.69
    }]),
    "addLabel": "新增車輛"
  }, _isSlot(_slot = vehicles.map((item, index) => createVNode("div", {
    "key": index,
    "className": "grid gap-2 rounded-xl border p-3 sm:grid-cols-[1fr_90px_90px_auto]"
  }, [createVNode(Field$2, {
    "label": "車號",
    "value": item.vehicle_no || "",
    "updateValue": (v) => updateVehicle(index, "vehicle_no", v),
    "placeholder": "KAA-1234"
  }, null), createVNode(Field$2, {
    "label": "公里／公升",
    "type": "number",
    "value": item.fuel_efficiency ?? 5,
    "updateValue": (v) => updateVehicle(index, "fuel_efficiency", v)
  }, null), createVNode(Field$2, {
    "label": "kg CO₂／L",
    "type": "number",
    "value": item.co2_per_liter ?? 2.69,
    "updateValue": (v) => updateVehicle(index, "co2_per_liter", v)
  }, null), createVNode(DeleteButton, {
    "action": () => setVehicles(vehicles.filter((_, i) => i !== index))
  }, null)]))) ? _slot : {
    default: () => [_slot]
  }), createVNode(SettingsCard, {
    "title": "清運人員名單",
    "subtitle": "排班時可選擇的人員",
    "addAction": () => setWorkers([...workers, ""]),
    "addLabel": "新增人員"
  }, _isSlot(_slot2 = workers.map((name, index) => createVNode("div", {
    "key": index,
    "className": "flex gap-2 rounded-xl border p-3"
  }, [createVNode("input", {
    "value": name,
    "onInput": (e) => setWorkers(workers.map((item, i) => i === index ? e.target.value : item)),
    "placeholder": "輸入清運人員姓名",
    "className": "min-w-0 flex-1 rounded-lg border px-3 py-2"
  }, null), createVNode(DeleteButton, {
    "action": () => setWorkers(workers.filter((_, i) => i !== index))
  }, null)]))) ? _slot2 : {
    default: () => [_slot2]
  })]), createVNode("div", {
    "className": "sticky bottom-4 mt-5 flex justify-end rounded-2xl border bg-white/95 p-4 shadow-lg"
  }, [createVNode("button", {
    "disabled": loading,
    "onClick": onSave,
    "className": "rounded-xl bg-sky-700 px-6 py-3 font-black text-white disabled:opacity-50"
  }, [loading ? "儲存中…" : "儲存系統設定"])])]);
}
function SettingsCard({
  title,
  subtitle,
  addAction,
  addLabel
}, {
  slots
}) {
  var _a;
  return createVNode("section", {
    "className": "rounded-2xl bg-white p-5 shadow-sm"
  }, [createVNode("div", {
    "className": "flex items-center justify-between gap-3"
  }, [createVNode("div", null, [createVNode("h3", {
    "className": "text-lg font-black"
  }, [title]), createVNode("p", {
    "className": "text-xs text-slate-500"
  }, [subtitle])]), createVNode("button", {
    "onClick": addAction,
    "className": "rounded-xl bg-emerald-700 px-3 py-2 text-sm font-black text-white"
  }, [createTextVNode("＋ "), addLabel])]), createVNode("div", {
    "className": "mt-4 space-y-3"
  }, [(_a = slots.default) == null ? void 0 : _a.call(slots)])]);
}
function Field$2({
  label,
  value,
  updateValue,
  type = "text",
  placeholder = ""
}) {
  return createVNode("label", {
    "className": "text-xs font-bold text-slate-600"
  }, [label, createVNode("input", {
    "type": type,
    "min": type === "number" ? "0.1" : void 0,
    "step": type === "number" ? "0.01" : void 0,
    "value": value,
    "placeholder": placeholder,
    "onInput": (event) => updateValue(event.target.value),
    "className": "mt-1 w-full rounded-lg border px-2 py-2"
  }, null)]);
}
function DeleteButton({
  action
}) {
  return createVNode("button", {
    "onClick": action,
    "className": "self-end rounded-lg border border-rose-200 px-3 py-2 text-rose-700"
  }, [createTextVNode("刪除")]);
}
const statusColors = {
  "待處理": "bg-amber-500",
  "已排班": "bg-sky-500",
  "清運中": "bg-violet-500",
  "清運完成": "bg-emerald-500",
  "已取消": "bg-slate-400"
};
const amount = (value) => Number(value || 0);
function SupabaseDashboard({
  cases,
  loading,
  reload
}) {
  const [period, setPeriod] = useState("all");
  const [keyword, setKeyword] = useState("");
  const filtered = useMemo(() => {
    const now = /* @__PURE__ */ new Date();
    return cases.filter((item) => {
      const date = new Date(item.created_at);
      const periodMatch = period === "all" || period === "year" && date.getFullYear() === now.getFullYear() || period === "month" && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
      return periodMatch && [item.case_no, item.applicant, item.address, item.status, item.waste_type].join(" ").toLowerCase().includes(keyword.trim().toLowerCase());
    });
  }, [cases, period, keyword]);
  const stats = useMemo(() => ({
    total: filtered.length,
    completed: filtered.filter((item) => item.status === "清運完成").length,
    quantity: filtered.reduce((sum, item) => sum + amount(item.quantity), 0),
    receivable: filtered.filter((item) => item.status !== "已取消").reduce((sum, item) => sum + amount(item.fee_amount), 0),
    collected: filtered.filter((item) => item.status === "清運完成").reduce((sum, item) => sum + amount(item.fee_amount), 0),
    distance: filtered.filter((item) => item.status === "清運完成").reduce((sum, item) => sum + amount(item.completion_distance_km), 0),
    carbon: filtered.filter((item) => item.status === "清運完成").reduce((sum, item) => sum + amount(item.completion_carbon_kg), 0)
  }), [filtered]);
  const statuses2 = ["待處理", "已排班", "清運中", "清運完成", "已取消"].map((status) => ({
    status,
    count: filtered.filter((item) => item.status === status).length
  }));
  const maxStatus = Math.max(1, ...statuses2.map((item) => item.count));
  return createVNode("main", {
    "className": "mx-auto max-w-7xl space-y-5 p-4 sm:p-6"
  }, [createVNode("section", {
    "className": "flex flex-col gap-4 rounded-3xl border border-sky-200 bg-gradient-to-br from-white to-sky-50 p-5 shadow-sm sm:p-7 lg:flex-row lg:items-end lg:justify-between"
  }, [createVNode("div", null, [createVNode("p", {
    "className": "text-xs font-black tracking-widest text-sky-700"
  }, [createTextVNode("SUPABASE 即時統計")]), createVNode("h2", {
    "className": "mt-1 text-3xl font-black"
  }, [createTextVNode("清運案件 Dashboard")]), createVNode("p", {
    "className": "mt-2 text-sm text-slate-500"
  }, [createTextVNode("依目前案件資料彙整營運概況。")])]), createVNode("div", {
    "className": "flex flex-wrap gap-2"
  }, [[["all", "全部期間"], ["year", "今年"], ["month", "本月"]].map(([value, label]) => createVNode("button", {
    "key": value,
    "onClick": () => setPeriod(value),
    "className": "rounded-xl px-4 py-2 text-sm font-black " + (period === value ? "bg-sky-700 text-white" : "border bg-white text-slate-600")
  }, [label])), createVNode("button", {
    "disabled": loading,
    "onClick": reload,
    "className": "rounded-xl bg-emerald-700 px-4 py-2 text-sm font-black text-white disabled:opacity-50"
  }, [loading ? "更新中…" : "↻ 更新資料"])])]), createVNode("section", {
    "className": "grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
  }, [createVNode(Metric, {
    "label": "案件總數",
    "value": stats.total.toLocaleString(),
    "unit": "筆",
    "tone": "slate"
  }, null), createVNode(Metric, {
    "label": "清運完成",
    "value": stats.completed.toLocaleString(),
    "unit": "筆",
    "tone": "emerald"
  }, null), createVNode(Metric, {
    "label": "確認總件數",
    "value": stats.quantity.toLocaleString(),
    "unit": "件",
    "tone": "amber"
  }, null), createVNode(Metric, {
    "label": "應收金額",
    "value": `NT$ ${stats.receivable.toLocaleString()}`,
    "tone": "rose"
  }, null), createVNode(Metric, {
    "label": "已完成收費",
    "value": `NT$ ${stats.collected.toLocaleString()}`,
    "tone": "emerald"
  }, null), createVNode(Metric, {
    "label": "結案里程",
    "value": stats.distance.toLocaleString(void 0, {
      maximumFractionDigits: 1
    }),
    "unit": "km",
    "tone": "sky"
  }, null), createVNode(Metric, {
    "label": "結案碳排量",
    "value": stats.carbon.toLocaleString(void 0, {
      maximumFractionDigits: 2
    }),
    "unit": "kgCO₂e",
    "tone": "violet"
  }, null), createVNode(Metric, {
    "label": "完成率",
    "value": `${stats.total ? Math.round(stats.completed / stats.total * 100) : 0}%`,
    "tone": "slate"
  }, null)]), createVNode("div", {
    "className": "grid gap-5 lg:grid-cols-[360px_1fr]"
  }, [createVNode("section", {
    "className": "rounded-2xl bg-white p-5 shadow-sm"
  }, [createVNode("h3", {
    "className": "text-lg font-black"
  }, [createTextVNode("案件狀態分布")]), createVNode("div", {
    "className": "mt-5 space-y-4"
  }, [statuses2.map((item) => createVNode("div", {
    "key": item.status
  }, [createVNode("div", {
    "className": "mb-1 flex justify-between text-sm font-bold"
  }, [createVNode("span", null, [item.status]), createVNode("span", null, [item.count, createTextVNode(" 筆")])]), createVNode("div", {
    "className": "h-3 overflow-hidden rounded-full bg-slate-100"
  }, [createVNode("div", {
    "className": "h-full rounded-full " + statusColors[item.status],
    "style": {
      width: `${item.count / maxStatus * 100}%`
    }
  }, null)])]))])]), createVNode("section", {
    "className": "overflow-hidden rounded-2xl bg-white shadow-sm"
  }, [createVNode("div", {
    "className": "flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between"
  }, [createVNode("div", null, [createVNode("h3", {
    "className": "text-lg font-black"
  }, [createTextVNode("案件明細")]), createVNode("p", {
    "className": "text-xs text-slate-500"
  }, [createTextVNode("目前顯示 "), filtered.length, createTextVNode(" 筆")])]), createVNode("input", {
    "type": "search",
    "value": keyword,
    "onInput": (event) => setKeyword(event.target.value),
    "placeholder": "搜尋單號、姓名、地址、狀態或品項",
    "className": "rounded-xl border px-4 py-2.5 text-sm sm:w-80"
  }, null)]), createVNode("div", {
    "className": "max-h-[520px] overflow-auto"
  }, [createVNode("table", {
    "className": "min-w-[760px] w-full text-left text-sm"
  }, [createVNode("thead", {
    "className": "sticky top-0 bg-slate-100 text-xs text-slate-600"
  }, [createVNode("tr", null, [createVNode("th", {
    "className": "px-4 py-3"
  }, [createTextVNode("案件／日期")]), createVNode("th", {
    "className": "px-4 py-3"
  }, [createTextVNode("申請人／地址")]), createVNode("th", {
    "className": "px-4 py-3"
  }, [createTextVNode("品項")]), createVNode("th", {
    "className": "px-4 py-3"
  }, [createTextVNode("狀態")]), createVNode("th", {
    "className": "px-4 py-3 text-right"
  }, [createTextVNode("費用")])])]), createVNode("tbody", {
    "className": "divide-y"
  }, [filtered.map((item) => createVNode("tr", {
    "key": item.case_no,
    "className": "hover:bg-sky-50"
  }, [createVNode("td", {
    "className": "px-4 py-3"
  }, [createVNode("strong", {
    "className": "block text-emerald-700"
  }, [item.case_no]), createVNode("span", {
    "className": "text-xs text-slate-500"
  }, [getMinguoTime(item.created_at)])]), createVNode("td", {
    "className": "px-4 py-3"
  }, [createVNode("strong", null, [item.applicant]), createVNode("span", {
    "className": "block max-w-56 truncate text-xs text-slate-500"
  }, [item.address])]), createVNode("td", {
    "className": "px-4 py-3"
  }, [item.waste_type]), createVNode("td", {
    "className": "px-4 py-3"
  }, [createVNode("span", {
    "className": "rounded-full bg-slate-100 px-2 py-1 text-xs font-bold"
  }, [item.status])]), createVNode("td", {
    "className": "px-4 py-3 text-right font-black"
  }, [createTextVNode("NT$ "), amount(item.fee_amount).toLocaleString()])])), !filtered.length && createVNode("tr", null, [createVNode("td", {
    "colSpan": "5",
    "className": "py-14 text-center font-bold text-slate-400"
  }, [createTextVNode("目前沒有符合條件的案件")])])])])])])])]);
}
function Metric({
  label,
  value,
  unit = "",
  tone
}) {
  const colors = {
    slate: "border-slate-200 bg-white text-slate-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    rose: "border-rose-200 bg-rose-50 text-rose-900",
    sky: "border-sky-200 bg-sky-50 text-sky-900",
    violet: "border-violet-200 bg-violet-50 text-violet-900"
  };
  return createVNode("div", {
    "className": "rounded-2xl border p-5 shadow-sm " + colors[tone]
  }, [createVNode("span", {
    "className": "text-xs font-bold opacity-70"
  }, [label]), createVNode("strong", {
    "className": "mt-2 block text-2xl font-black"
  }, [value, createTextVNode(" "), unit && createVNode("small", {
    "className": "text-xs"
  }, [unit])])]);
}
const dateText = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const defaultDate = () => {
  const d = /* @__PURE__ */ new Date();
  d.setDate(d.getDate() + 3);
  while (getUnavailableBookingReason(dateText(d))) d.setDate(d.getDate() + 1);
  return dateText(d);
};
const initial = () => ({
  applicant: "",
  phone: "",
  email: "",
  county: "苗栗縣",
  district: "三義鄉",
  address: "",
  items: [],
  photos: [],
  preferredDate: defaultDate(),
  preferredTimeSlot: "上午8點至12點",
  note: ""
});
function PhoneApplication({
  createdAction
}) {
  const [form, setForm] = useState(initial), [saving, setSaving] = useState(false), [errors, setErrors] = useState([]);
  const update = (field, value) => setForm((old) => ({
    ...old,
    [field]: value
  })), qty = (id) => {
    var _a;
    return ((_a = form.items.find((x) => x.id === id)) == null ? void 0 : _a.quantity) || 0;
  };
  const change = (cat, delta) => update("items", qty(cat.id) + delta <= 0 ? form.items.filter((x) => x.id !== cat.id) : form.items.some((x) => x.id === cat.id) ? form.items.map((x) => x.id === cat.id ? {
    ...x,
    quantity: x.quantity + delta
  } : x) : [...form.items, {
    id: cat.id,
    name: cat.name,
    quantity: 1,
    note: ""
  }]);
  const photos = (event) => {
    const added = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"));
    setForm((old) => {
      const next = [...old.photos, ...added.map((file) => ({
        name: file.name,
        mimeType: file.type || "image/jpeg",
        file,
        url: URL.createObjectURL(file)
      }))];
      return {
        ...old,
        photos: next.slice(0, 8)
      };
    });
    event.target.value = "";
  };
  const submit = async (event) => {
    event.preventDefault();
    const e = [];
    if (!form.applicant.trim()) e.push("請輸入申請人姓名");
    if (!/^09\d{2}-?\d{6}$/.test(form.phone.trim()) && !/^0\d{1,2}-?\d{6,8}$/.test(form.phone.trim())) e.push("請輸入正確格式電話");
    if (!form.address.trim()) e.push("請輸入詳細地址");
    if (!form.items.length) e.push("請至少選擇一項清運品項");
    const de = !form.preferredDate ? "請選擇日期" : form.preferredDate < dateText(/* @__PURE__ */ new Date()) ? "日期不可早於今天" : getUnavailableBookingReason(form.preferredDate);
    if (de) e.push(de);
    setErrors(e);
    if (e.length) return;
    setSaving(true);
    try {
      const uploadSession = form.photos.length ? await preparePublicUploads(form.photos.map((p) => ({
        mimeType: p.mimeType,
        size: p.file.size
      }))) : null;
      if (uploadSession) await Promise.all(uploadSession.uploads.map((upload, index) => uploadSignedPhoto(upload.signedUrl, form.photos[index].file, form.photos[index].mimeType)));
      const wasteType = form.items.map((x) => `${x.id === "other" && x.note ? x.note : x.name}×${x.quantity}`).join("、");
      const {
        photos: photos2,
        ...phoneForm
      } = form;
      const r = await adminPost("createPhoneCase", {
        ...phoneForm,
        phone: formatTaiwanPhone(form.phone),
        address: `${form.county}${form.district}${form.address}`,
        wasteType,
        quantity: form.items.reduce((s, x) => s + x.quantity, 0),
        uploadSessionId: uploadSession == null ? void 0 : uploadSession.sessionId
      });
      form.photos.forEach((p) => URL.revokeObjectURL(p.url));
      setForm(initial());
      await createdAction(r.caseNo);
    } catch (error) {
      setErrors([error.message]);
    } finally {
      setSaving(false);
    }
  };
  return createVNode("main", {
    "className": "mx-auto max-w-4xl p-4 sm:p-6"
  }, [createVNode("header", {
    "className": "mb-5"
  }, [createVNode("p", {
    "className": "text-sm font-black text-emerald-700"
  }, [createTextVNode("承辦人員代為建案")]), createVNode("h2", {
    "className": "text-2xl font-black"
  }, [createTextVNode("大型廢棄傢俱電話申請")]), createVNode("p", {
    "className": "text-sm text-slate-500"
  }, [createTextVNode("欄位與民眾端申請內容一致。")])]), errors.length > 0 && createVNode("div", {
    "className": "mb-4 rounded-xl bg-rose-50 p-4 font-bold text-rose-700"
  }, [errors.map((x) => createVNode("p", {
    "key": x
  }, [createTextVNode("• "), x]))]), createVNode("form", {
    "onSubmit": submit,
    "className": "space-y-5"
  }, [createVNode(Card, {
    "n": "1",
    "title": "申請人基本資料"
  }, {
    default: () => [createVNode("div", {
      "className": "grid gap-4 sm:grid-cols-2"
    }, [createVNode(Field$1, {
      "label": "申請人姓名 *",
      "value": form.applicant,
      "changeValue": (v) => update("applicant", v)
    }, null), createVNode(Field$1, {
      "label": "聯絡電話 *",
      "value": form.phone,
      "changeValue": (v) => update("phone", v),
      "blurAction": () => update("phone", formatTaiwanPhone(form.phone))
    }, null), createVNode("div", {
      "className": "sm:col-span-2"
    }, [createVNode(Field$1, {
      "label": "電子郵件 Email（選填）",
      "type": "email",
      "value": form.email,
      "changeValue": (v) => update("email", v)
    }, null)]), createVNode(Select, {
      "label": "縣市",
      "value": form.county,
      "values": COUNTIES,
      "changeValue": (v) => {
        update("county", v);
        update("district", DISTRICTS_BY_COUNTY[v][0]);
      }
    }, null), createVNode(Select, {
      "label": "行政區",
      "value": form.district,
      "values": DISTRICTS_BY_COUNTY[form.county],
      "changeValue": (v) => update("district", v)
    }, null), createVNode("div", {
      "className": "sm:col-span-2"
    }, [createVNode(Field$1, {
      "label": "詳細清運地址 *",
      "value": form.address,
      "changeValue": (v) => update("address", v)
    }, null)])])]
  }), createVNode(Card, {
    "n": "2",
    "title": "清運項目及數量選擇"
  }, {
    default: () => [createVNode("p", {
      "className": "mb-3 text-right font-black text-emerald-700"
    }, [createTextVNode("已選 "), form.items.reduce((s, x) => s + x.quantity, 0), createTextVNode(" 件")]), createVNode("div", {
      "className": "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
    }, [CATEGORIES.map((cat) => {
      var _a;
      return createVNode("div", {
        "key": cat.id,
        "className": "rounded-xl border p-4 " + (qty(cat.id) ? "border-emerald-500 bg-emerald-50" : "")
      }, [createVNode("div", {
        "className": "flex gap-2"
      }, [createVNode("span", {
        "className": "text-2xl"
      }, [cat.icon]), createVNode("div", null, [createVNode("b", null, [cat.name]), createVNode("p", {
        "className": "text-xs text-slate-500"
      }, [cat.desc])])]), createVNode("div", {
        "className": "mt-3 flex items-center justify-end gap-3"
      }, [createVNode("span", {
        "className": "text-sm font-bold text-slate-600"
      }, [createTextVNode("選擇數量：")]), createVNode("button", {
        "type": "button",
        "disabled": !qty(cat.id),
        "onClick": () => change(cat, -1),
        "className": "rounded bg-slate-200 px-3"
      }, [createTextVNode("−")]), createVNode("b", null, [qty(cat.id)]), createVNode("button", {
        "type": "button",
        "onClick": () => change(cat, 1),
        "className": "rounded bg-emerald-700 px-3 text-white"
      }, [createTextVNode("＋")])]), cat.id === "other" && qty(cat.id) > 0 && createVNode("input", {
        "placeholder": "其他品項名稱",
        "value": ((_a = form.items.find((x) => x.id === "other")) == null ? void 0 : _a.note) || "",
        "onInput": (e) => update("items", form.items.map((x) => x.id === "other" ? {
          ...x,
          note: e.target.value
        } : x)),
        "className": "mt-3 w-full rounded border p-2"
      }, null)]);
    })])]
  }), createVNode(Card, {
    "n": "3",
    "title": "上傳待清運照片數張"
  }, {
    default: () => [createVNode("input", {
      "id": "phonePhotos",
      "type": "file",
      "accept": "image/*",
      "multiple": true,
      "onInput": photos,
      "className": "hidden"
    }, null), createVNode("div", {
      "className": "grid grid-cols-2 gap-3 sm:grid-cols-4"
    }, [form.photos.map((p, i) => createVNode("div", {
      "key": i,
      "className": "relative"
    }, [createVNode("img", {
      "src": p.url,
      "className": "h-24 w-full rounded-xl object-cover"
    }, null), createVNode("button", {
      "type": "button",
      "onClick": () => update("photos", form.photos.filter((_, j) => j !== i)),
      "className": "absolute right-1 top-1 rounded bg-black/70 px-2 text-white"
    }, [createTextVNode("×")])])), createVNode("label", {
      "htmlFor": "phonePhotos",
      "className": "flex h-24 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed font-bold text-emerald-700"
    }, [createTextVNode("📷 上傳照片")])])]
  }), createVNode(Card, {
    "n": "4",
    "title": "希望清運時間與放置地點說明"
  }, {
    default: () => [createVNode("div", {
      "className": "grid gap-4 sm:grid-cols-2"
    }, [createVNode("label", {
      "className": "font-bold"
    }, [createTextVNode("希望清運日期"), createVNode(MinguoDatePicker, {
      "min": dateText(/* @__PURE__ */ new Date()),
      "value": form.preferredDate,
      "setSelectedDate": (v) => update("preferredDate", v),
      "className": "mt-1 flex w-full justify-between rounded-xl border p-3"
    }, null), createVNode("small", {
      "className": "text-slate-500"
    }, [createTextVNode("民國日期："), formatMinguoDate(form.preferredDate)])]), createVNode(Select, {
      "label": "希望清運時段",
      "value": form.preferredTimeSlot,
      "values": ["上午8點至12點", "下午1點至5點"],
      "changeValue": (v) => update("preferredTimeSlot", v)
    }, null), createVNode("label", {
      "className": "sm:col-span-2 font-bold"
    }, [createTextVNode("放置地點詳細說明"), createVNode("textarea", {
      "value": form.note,
      "onInput": (e) => update("note", e.target.value),
      "className": "mt-1 w-full rounded-xl border p-3"
    }, null)])])]
  }), createVNode("div", {
    "className": "text-right"
  }, [createVNode("button", {
    "disabled": saving,
    "className": "rounded-xl bg-emerald-700 px-8 py-4 font-black text-white"
  }, [saving ? "建立案件中…" : "建立電話申請案件"])])])]);
}
function Card({
  n,
  title
}, {
  slots
}) {
  var _a;
  return createVNode("section", {
    "className": "rounded-2xl bg-white p-5 shadow-sm"
  }, [createVNode("h3", {
    "className": "mb-5 text-lg font-black"
  }, [createVNode("span", {
    "className": "mr-2 rounded-lg bg-emerald-100 px-3 py-2 text-emerald-800"
  }, [n]), title]), (_a = slots.default) == null ? void 0 : _a.call(slots)]);
}
function Field$1({
  label,
  value,
  changeValue,
  blurAction,
  type = "text"
}) {
  return createVNode("label", {
    "className": "font-bold"
  }, [label, createVNode("input", {
    "type": type,
    "value": value,
    "onInput": (e) => changeValue(e.target.value),
    "onBlur": blurAction,
    "className": "mt-1 w-full rounded-xl border p-3"
  }, null)]);
}
function Select({
  label,
  value,
  values,
  changeValue
}) {
  return createVNode("label", {
    "className": "font-bold"
  }, [label, createVNode("select", {
    "value": value,
    "onInput": (e) => changeValue(e.target.value),
    "className": "mt-1 w-full rounded-xl border p-3"
  }, [values.map((x) => createVNode("option", {
    "key": x
  }, [x]))])]);
}
const caseColumns = [["case_no", "預約單號"], ["applicant", "申請人姓名"], ["phone", "聯絡電話"], ["email", "電子郵件"], ["address", "清運地址"], ["waste_type", "申報清運品項"], ["quantity", "申報件數"], ["status", "案件狀態"], ["requested_scheduled_at", "民眾希望清運日期"], ["scheduled_at", "管理端排定清運日期"], ["dispatch_period", "清運時段"], ["dispatch_trip", "班次"], ["vehicle_no", "派車車號"], ["worker_name", "清運人員"], ["dispatch_origin", "清運車出發點"], ["dispatch_note", "派車／現場備註"], ["quantity_review_status", "人工覆核狀態"], ["confirmed_items", "人工確認品項明細"], ["review_note", "人工覆核說明"], ["chargeable_quantity", "計費件數"], ["fee_amount", "應收費用"], ["annual_count", "年度申請次數"], ["photo_paths", "待清運照片"], ["completion_photo_paths", "結案照片"], ["ai_result", "AI 判讀結果"], ["latitude", "緯度"], ["longitude", "經度"], ["completion_distance_km", "結案里程"], ["completion_carbon_kg", "結案碳排量"], ["report_source", "申請來源"], ["created_at", "建立時間"], ["updated_at", "最後更新時間"]];
const defaults = ["case_no", "applicant", "address", "waste_type", "quantity", "status", "requested_scheduled_at", "dispatch_period", "vehicle_no"];
const tables = [["cases", "案件資料"], ["vehicles", "車輛資料"], ["workers", "清運人員資料"], ["system_settings", "系統設定"], ["case_history", "案件歷程"], ["photo_sync_jobs", "照片同步紀錄"]];
const labels = {
  id: "資料識別碼",
  case_no: "預約單號",
  applicant: "申請人姓名",
  phone: "聯絡電話",
  email: "電子郵件",
  address: "清運地址",
  waste_type: "申報清運品項",
  quantity: "申報件數",
  status: "案件狀態",
  vehicle_no: "派車車號",
  fuel_efficiency: "公里／公升",
  co2_per_liter: "kg CO₂／L",
  active: "啟用狀態",
  name: "姓名",
  setting_key: "設定名稱",
  setting_value: "設定值",
  case_id: "案件識別碼",
  action: "動作",
  detail: "內容",
  actor_id: "操作人識別碼",
  created_at: "建立時間",
  updated_at: "最後更新時間"
};
function DatabaseViewer({
  cases,
  getMinguoTime: getMinguoTime2
}) {
  var _a;
  const [selected, setSelected] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("miaoli_database_columns") || "[]");
      return saved.length ? saved : defaults;
    } catch {
      return defaults;
    }
  });
  const [table, setTable] = useState("cases"), [database, setDatabase] = useState({
    cases
  }), [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState(""), [period, setPeriod] = useState("all"), [dateFrom, setDateFrom] = useState(""), [dateTo, setDateTo] = useState("");
  const [draggingKey, setDraggingKey] = useState("");
  const persist = (next) => {
    localStorage.setItem("miaoli_database_columns", JSON.stringify(next));
    setSelected(next);
  };
  const toggle = (key) => persist(selected.includes(key) ? selected.filter((x) => x !== key) : [...selected, key]);
  const move = (key, offset) => {
    const index = selected.indexOf(key), target = index + offset;
    if (index < 0 || target < 0 || target >= selected.length) return;
    const next = [...selected];
    [next[index], next[target]] = [next[target], next[index]];
    persist(next);
  };
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminPost("databaseView").then((result) => {
      if (!cancelled) setDatabase(result.database || {
        cases
      });
    }).catch(() => {
      if (!cancelled) setDatabase({
        cases
      });
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [cases]);
  const now = /* @__PURE__ */ new Date(), today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`, monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`, quarterStart = `${now.getFullYear()}-${String(Math.floor(now.getMonth() / 3) * 3 + 1).padStart(2, "0")}-01`, yearStart = `${now.getFullYear()}-01-01`;
  const source = table === "cases" ? database.cases || cases : database[table] || [];
  const columns = table === "cases" ? selected.map((key) => caseColumns.find(([k]) => k === key)).filter(Boolean) : source[0] ? Object.keys(source[0]).map((key) => [key, labels[key] || key]) : [];
  const records = source.filter((item) => {
    const date = String(item.created_at || "").slice(0, 10), inPeriod = table !== "cases" || period === "all" || period === "year" && date >= yearStart && date <= today || period === "quarter" && date >= quarterStart && date <= today || period === "month" && date >= monthStart && date <= today || period === "custom" && (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo);
    return inPeriod && Object.values(item).join(" ").toLowerCase().includes(keyword.trim().toLowerCase());
  });
  useEffect(() => {
    if (table !== "cases") return;
    const headers = [...document.querySelectorAll("thead th")].slice(1);
    const removers = headers.map((header, index) => {
      var _a2;
      const targetKey = (_a2 = columns[index]) == null ? void 0 : _a2[0];
      if (!targetKey) return () => {
      };
      header.draggable = true;
      header.style.cursor = "grab";
      header.title = "可拖曳此欄位左右移動";
      const start = () => setDraggingKey(targetKey);
      const over = (event) => event.preventDefault();
      const drop = (event) => {
        event.preventDefault();
        if (!draggingKey || draggingKey === targetKey) return;
        const from = selected.indexOf(draggingKey), to = selected.indexOf(targetKey);
        if (from < 0 || to < 0) return;
        const next = [...selected];
        next.splice(from, 1);
        next.splice(to, 0, draggingKey);
        setSelected(next);
        if (window.confirm("確認儲存拖曳後的欄位順序嗎？")) localStorage.setItem("miaoli_database_columns", JSON.stringify(next));
        setDraggingKey("");
      };
      header.addEventListener("dragstart", start);
      header.addEventListener("dragover", over);
      header.addEventListener("drop", drop);
      return () => {
        header.removeEventListener("dragstart", start);
        header.removeEventListener("dragover", over);
        header.removeEventListener("drop", drop);
        header.draggable = false;
        header.style.cursor = "";
      };
    });
    return () => removers.forEach((remove2) => remove2());
  }, [table, selected, draggingKey]);
  useEffect(() => {
    if (table !== "cases") return;
    const photoColumns = columns.map(([key], index) => ["photo_paths", "completion_photo_paths"].includes(key) ? index + 1 : -1).filter((index) => index > 0);
    if (!photoColumns.length) return;
    const rows = [...document.querySelectorAll("tbody tr")];
    rows.forEach((row, rowIndex) => {
      const item = records[rowIndex];
      if (!item) return;
      photoColumns.forEach(async (cellIndex) => {
        var _a2;
        const key = (_a2 = columns[cellIndex - 1]) == null ? void 0 : _a2[0], cell = row.children[cellIndex];
        if (!cell || !key) return;
        const photoIds = Array.isArray(item[key]) ? item[key] : (() => {
          try {
            return JSON.parse(item[key] || "[]");
          } catch {
            return [];
          }
        })();
        cell.replaceChildren();
        if (!photoIds.length) {
          cell.textContent = "—";
          return;
        }
        const gallery = document.createElement("div");
        gallery.className = "flex min-w-[72px] gap-1";
        cell.append(gallery);
        for (const photo of photoIds) {
          const fileId = typeof photo === "string" ? photo : (photo == null ? void 0 : photo.fileId) || (photo == null ? void 0 : photo.path);
          if (!fileId) continue;
          try {
            const result = await adminPost("getImage", {
              fileId
            });
            const image = document.createElement("img");
            image.src = `data:${result.mimeType || "image/jpeg"};base64,${result.base64}`;
            image.className = "h-12 w-12 cursor-zoom-in rounded-md border object-cover";
            image.title = "點選放大照片";
            image.onclick = () => {
              const popup = window.open("", "_blank", "noopener,noreferrer");
              if (popup) popup.document.write(`<title>案件照片</title><img src="${image.src}" style="max-width:100%;height:auto;display:block;margin:auto">`);
            };
            gallery.append(image);
          } catch {
            const failed = document.createElement("span");
            failed.className = "text-xs text-rose-600";
            failed.textContent = "讀取失敗";
            gallery.append(failed);
          }
        }
      });
    });
  }, [table, database, keyword, period, dateFrom, dateTo, selected]);
  const value = (item, key) => {
    if (["requested_scheduled_at", "scheduled_at", "created_at", "updated_at"].includes(key)) return getMinguoTime2(item[key]);
    if (key === "fee_amount") return `NT$ ${Number(item[key] || 0).toLocaleString()}`;
    if (key === "photo_paths" || key === "completion_photo_paths") {
      try {
        return `${JSON.parse(item[key] || "[]").length} 張`;
      } catch {
        return "0 張";
      }
    }
    const raw = item[key];
    return raw == null ? "—" : typeof raw === "object" ? JSON.stringify(raw) : raw;
  };
  const exportCsv = () => {
    var _a2;
    if (!columns.length) return;
    const cell = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`, csv = "\uFEFF" + [columns.map(([, label]) => cell(label)).join(","), ...records.map((item) => columns.map(([key]) => cell(value(item, key))).join(","))].join("\r\n"), url = URL.createObjectURL(new Blob([csv], {
      type: "text/csv;charset=utf-8"
    })), link = document.createElement("a");
    link.href = url;
    link.download = `${(_a2 = tables.find(([key]) => key === table)) == null ? void 0 : _a2[1]}_${today}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const remove = async (item) => {
    const keyValue = table === "cases" ? item.case_no : table === "system_settings" ? item.setting_key : item.id;
    if (!keyValue || !window.confirm("確定刪除這筆資料嗎？此動作無法復原。")) return;
    try {
      await adminPost("databaseDelete", {
        table,
        keyValue
      });
      setDatabase((old) => ({
        ...old,
        [table]: (old[table] || []).filter((row) => (table === "cases" ? row.case_no : table === "system_settings" ? row.setting_key : row.id) !== keyValue)
      }));
    } catch (error) {
      window.alert(`刪除失敗：${error.message}`);
    }
  };
  return createVNode("main", {
    "className": "mx-auto max-w-[1600px] p-4 sm:p-6"
  }, [createVNode("header", {
    "className": "mb-5"
  }, [createVNode("p", {
    "className": "text-sm font-black text-emerald-700"
  }, [createTextVNode("資料庫檢視")]), createVNode("h2", {
    "className": "mt-1 text-2xl font-black"
  }, [createTextVNode("Supabase 資料庫")]), createVNode("p", {
    "className": "mt-2 text-sm text-slate-500"
  }, [createTextVNode("可切換所有系統資料表；案件資料可自訂欄位、時間與照片。")])]), createVNode("nav", {
    "className": "mb-5 flex flex-wrap gap-2"
  }, [tables.map(([key, label]) => createVNode("button", {
    "key": key,
    "onClick": () => setTable(key),
    "className": "rounded-xl px-4 py-2.5 text-sm font-black " + (table === key ? "bg-emerald-700 text-white" : "bg-white text-slate-600 shadow-sm")
  }, [label, table === key && loading ? "（讀取中）" : ""]))]), createVNode("section", {
    "className": "rounded-2xl bg-white p-5 shadow-sm"
  }, [createVNode("div", {
    "className": "flex flex-col gap-4 lg:flex-row lg:justify-between"
  }, [createVNode("div", {
    "className": "grid gap-3 sm:grid-cols-2"
  }, [createVNode("label", {
    "className": "text-sm font-bold text-slate-600"
  }, [createTextVNode("搜尋資料"), createVNode("input", {
    "value": keyword,
    "onInput": (e) => setKeyword(e.target.value),
    "className": "mt-1 w-full rounded-xl border px-4 py-2.5 font-normal"
  }, null)]), table === "cases" && createVNode("label", {
    "className": "text-sm font-bold text-slate-600"
  }, [createTextVNode("時間區隔"), createVNode("select", {
    "value": period,
    "onInput": (e) => setPeriod(e.target.value),
    "className": "mt-1 w-full rounded-xl border px-4 py-2.5 font-normal"
  }, [createVNode("option", {
    "value": "all"
  }, [createTextVNode("全部時間")]), createVNode("option", {
    "value": "year"
  }, [createTextVNode("今年度")]), createVNode("option", {
    "value": "quarter"
  }, [createTextVNode("本季")]), createVNode("option", {
    "value": "month"
  }, [createTextVNode("本月")]), createVNode("option", {
    "value": "custom"
  }, [createTextVNode("自訂區間")])])]), table === "cases" && period === "custom" && createVNode("div", {
    "className": "sm:col-span-2 grid grid-cols-2 gap-3"
  }, [createVNode("label", null, [createTextVNode("開始日期"), createVNode("input", {
    "type": "date",
    "value": dateFrom,
    "onInput": (e) => setDateFrom(e.target.value),
    "className": "mt-1 w-full rounded-xl border px-3 py-2"
  }, null)]), createVNode("label", null, [createTextVNode("結束日期"), createVNode("input", {
    "type": "date",
    "value": dateTo,
    "onInput": (e) => setDateTo(e.target.value),
    "className": "mt-1 w-full rounded-xl border px-3 py-2"
  }, null)])])]), table === "cases" && createVNode("div", {
    "className": "lg:max-w-3xl"
  }, [createVNode("p", {
    "className": "mb-2 text-sm font-black"
  }, [createTextVNode("顯示項目（已選欄位可用 ← → 調整左右順序）")]), createVNode("div", {
    "className": "flex flex-wrap gap-2"
  }, [caseColumns.map(([key, label]) => createVNode("span", {
    "key": key,
    "className": "inline-flex items-center rounded-full border text-xs font-bold " + (selected.includes(key) ? "border-emerald-600 bg-emerald-700 text-white" : "border-slate-300 bg-white text-slate-600")
  }, [createVNode("label", {
    "className": "cursor-pointer px-3 py-1.5"
  }, [createVNode("input", {
    "type": "checkbox",
    "checked": selected.includes(key),
    "onInput": () => toggle(key),
    "className": "sr-only"
  }, null), label]), selected.includes(key) && createVNode(Fragment, null, [createVNode("button", {
    "onClick": () => move(key, -1),
    "className": "border-l border-white/30 px-2 py-1.5"
  }, [createTextVNode("←")]), createVNode("button", {
    "onClick": () => move(key, 1),
    "className": "border-l border-white/30 px-2 py-1.5"
  }, [createTextVNode("→")])])]))])])])]), createVNode("section", {
    "className": "mt-5 overflow-hidden rounded-2xl bg-white shadow-sm"
  }, [createVNode("div", {
    "className": "flex items-center justify-between gap-3 border-b px-5 py-4"
  }, [createVNode("h3", {
    "className": "font-black"
  }, [(_a = tables.find(([key]) => key === table)) == null ? void 0 : _a[1]]), createVNode("div", {
    "className": "flex gap-3"
  }, [createVNode("span", {
    "className": "text-sm font-bold text-slate-500"
  }, [records.length, createTextVNode(" 筆")]), createVNode("button", {
    "disabled": !columns.length,
    "onClick": exportCsv,
    "className": "rounded-xl bg-emerald-700 px-4 py-2 text-sm font-black text-white disabled:opacity-40"
  }, [createTextVNode("⇩ 匯出 CSV")])])]), columns.length ? createVNode("div", {
    "className": "max-h-[65vh] overflow-auto"
  }, [createVNode("table", {
    "className": "min-w-max w-full text-left text-sm"
  }, [createVNode("thead", {
    "className": "sticky top-0 bg-slate-100 text-xs text-slate-600"
  }, [createVNode("tr", null, [createVNode("th", {
    "className": "px-3 py-3"
  }, [createTextVNode("刪除")]), columns.map(([key, label]) => createVNode("th", {
    "key": key,
    "className": "whitespace-nowrap px-4 py-3"
  }, [label]))])]), createVNode("tbody", {
    "className": "divide-y"
  }, [records.map((item, index) => createVNode("tr", {
    "key": item.case_no || item.id || index,
    "className": "hover:bg-emerald-50"
  }, [createVNode("td", {
    "className": "px-3 py-3"
  }, [createVNode("button", {
    "onClick": () => remove(item),
    "className": "rounded-lg border border-rose-200 px-2 py-1 text-xs font-black text-rose-700"
  }, [createTextVNode("刪除")])]), columns.map(([key]) => createVNode("td", {
    "key": key,
    "className": "max-w-xs whitespace-nowrap px-4 py-3"
  }, [key === "case_no" ? createVNode("strong", {
    "className": "text-emerald-700"
  }, [value(item, key)]) : createVNode("span", {
    "className": "block max-w-xs truncate",
    "title": String(value(item, key))
  }, [value(item, key)])]))])), !records.length && createVNode("tr", null, [createVNode("td", {
    "colSpan": columns.length + 1,
    "className": "py-14 text-center font-bold text-slate-400"
  }, [createTextVNode("沒有符合的資料")])])])])]) : createVNode("p", {
    "className": "p-12 text-center font-bold text-slate-400"
  }, [createTextVNode("目前沒有資料")])])]);
}
const statuses = ["全部", "待處理", "已排班", "清運完成", "已取消"];
const statusPageMeta = {
  "全部": {
    title: "全部案件",
    description: "檢視所有案件與目前進度。"
  },
  "待處理": {
    title: "待處理案件",
    description: "完成人工逐項覆核後，才可核可排班。"
  },
  "已排班": {
    title: "已排班案件",
    description: "確認清運日期、時段、車號與清運人員後，可開始清運。"
  },
  "清運完成": {
    title: "清運完成案件",
    description: "已完成的案件紀錄，保留供查詢與列印。"
  },
  "已取消": {
    title: "已取消案件",
    description: "已撤案或取消的案件紀錄。"
  }
};
const periods = ["", "上午8點至12點", "下午1點至5點"];
const categories = ["床墊", "櫃子", "桌子", "椅子", "電視", "冰箱", "其他"];
const pageTabs = ["案件清單與進度", "待處理", "已排班", "清運完成", "已取消", "電話申請", "Dashboard", "資料庫檢視", "系統設定"];
const tabStatus = {
  "案件清單與進度": "全部",
  "待處理": "待處理",
  "已排班": "已排班",
  "清運完成": "清運完成",
  "已取消": "已取消"
};
const dispatchDateKey = (value) => {
  const text = String(value || "").trim();
  const match = text.match(/^(\d{2,4})[\/.\-](\d{1,2})[\/.\-](\d{1,2})/);
  if (!match) return text.slice(0, 10);
  const year = Number(match[1]) < 1911 ? Number(match[1]) + 1911 : Number(match[1]);
  return `${year}-${String(match[2]).padStart(2, "0")}-${String(match[3]).padStart(2, "0")}`;
};
const dispatchGroupKey = (item) => [dispatchDateKey(item.scheduled_at), String(item.vehicle_no || "").trim(), String(item.dispatch_period || ""), Number(item.dispatch_trip || 1)].join("|");
const splitCrewMembers = (value) => String(value || "").split(/[、，,\n]+/).map((member) => member.trim()).filter(Boolean);
const parseItems = (value) => {
  try {
    const result = JSON.parse(value || "[]");
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
};
const declaredCounts = (wasteType) => Object.fromEntries(categories.map((name) => {
  const match = String(wasteType || "").match(new RegExp(`${name}\\s*(?:×|x|X)\\s*(\\d+)`));
  return [name, match ? Number(match[1]) : String(wasteType || "").includes(name) ? 1 : 0];
}));
function AdminApp() {
  const [token, setToken] = useState(() => sessionStorage.getItem("admin_api_token") || "");
  const [emailInput, setEmailInput] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [cases, setCases] = useState([]);
  const [selectedNo, setSelectedNo] = useState("");
  const [filter, setFilter] = useState("待處理");
  const [page, setPage] = useState("待處理");
  const [keyword, setKeyword] = useState("");
  const [useDateRange, setUseDateRange] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState(null);
  const [reviewCounts, setReviewCounts] = useState({});
  const [dispatchOptions, setDispatchOptions] = useState({
    vehicles: [],
    workers: [],
    route_origin: "24.380891,120.734372"
  });
  const [vehicleSettings, setVehicleSettings] = useState([]);
  const [workerSettings, setWorkerSettings] = useState([]);
  const [routeOriginSettings, setRouteOriginSettings] = useState("24.380891,120.734372");
  const [googleDriveEnabled, setGoogleDriveEnabled] = useState(false);
  const [googleDriveWebAppUrl, setGoogleDriveWebAppUrl] = useState("");
  const [routeCache, setRouteCache] = useState({});
  const [workerSelections, setWorkerSelections] = useState([""]);
  const [scheduleEditing, setScheduleEditing] = useState(false);
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [pendingPhotoPreview, setPendingPhotoPreview] = useState(null);
  const completionInput = useRef(null);
  const loadCases = async (selectStatus = "") => {
    var _a, _b, _c, _d;
    setLoading(true);
    setMessage("");
    try {
      const result = await adminPost("list");
      setCases(result.cases || []);
      if (selectStatus) setSelectedNo(((_b = (_a = result.cases) == null ? void 0 : _a.find((item) => item.status === selectStatus)) == null ? void 0 : _b.case_no) || "");
      else if (!selectedNo && ((_c = result.cases) == null ? void 0 : _c.length)) setSelectedNo(((_d = result.cases.find((item) => item.status === "待處理")) == null ? void 0 : _d.case_no) || result.cases[0].case_no);
    } catch (error) {
      setMessage(error.message);
      if (/Token/.test(error.message)) logout();
    } finally {
      setLoading(false);
    }
  };
  const loadDispatchOptions = async () => {
    const result = await adminPost("dispatchOptions");
    const options = result.dispatch || result;
    const vehicles = Array.isArray(options.vehicles) ? options.vehicles : [];
    const workers = Array.isArray(options.workers) ? options.workers : [];
    const routeOrigin = String(options.route_origin || "24.380891,120.734372");
    setDispatchOptions({
      vehicles,
      workers,
      route_origin: routeOrigin
    });
    setVehicleSettings(vehicles.map((item) => ({
      ...item
    })));
    setWorkerSettings([...workers]);
    setRouteOriginSettings(routeOrigin);
    setGoogleDriveEnabled(Boolean(options.google_drive_enabled));
    setGoogleDriveWebAppUrl(String(options.google_drive_web_app_url || ""));
  };
  useEffect(() => {
    if (!token) return;
    loadCases();
    loadDispatchOptions().catch((error) => setMessage(`派車設定載入失敗：${error.message}`));
  }, [token]);
  useEffect(() => {
    const item = cases.find((entry) => entry.case_no === selectedNo) || null;
    setDraft(item ? {
      ...item
    } : null);
    setScheduleEditing(false);
    setWorkerSelections(item ? splitCrewMembers(item.worker_name).length ? splitCrewMembers(item.worker_name) : [""] : [""]);
    if (item) {
      const counts = Object.fromEntries(categories.map((name) => [name, 0]));
      const confirmedItems = parseItems(item.confirmed_items);
      confirmedItems.forEach((entry) => {
        const name = categories.includes(entry.type) ? entry.type : categories.includes(entry.name) ? entry.name : "其他";
        counts[name] += Number(entry.quantity ?? entry.count ?? 0);
      });
      setReviewCounts(confirmedItems.length ? counts : declaredCounts(item.waste_type));
    }
  }, [cases, selectedNo]);
  useEffect(() => {
    const selected = cases.find((item) => item.case_no === selectedNo);
    const completionMatch = String((selected == null ? void 0 : selected.dispatch_note) || "").match(/結案照片 Google Drive ID：(\[[^\n]*\])/);
    let notePhotoPaths = [];
    try {
      notePhotoPaths = completionMatch ? JSON.parse(completionMatch[1]) : [];
    } catch {
      notePhotoPaths = [];
    }
    const photoPaths = page === "清運完成" ? Array.isArray(selected == null ? void 0 : selected.completion_photo_paths) && selected.completion_photo_paths.length ? selected.completion_photo_paths : notePhotoPaths : Array.isArray(selected == null ? void 0 : selected.photo_paths) ? selected.photo_paths : [];
    let cancelled = false;
    setPendingPhotos([]);
    if (!["待處理", "已排班", "清運完成"].includes(page) || !photoPaths.length) return () => {
      cancelled = true;
    };
    Promise.all(photoPaths.map(async (photo, index) => {
      const fileId = typeof photo === "string" ? photo : (photo == null ? void 0 : photo.fileId) || (photo == null ? void 0 : photo.path);
      if (!fileId) return null;
      try {
        const result = await adminPost("getImage", {
          fileId
        });
        return {
          id: fileId,
          index,
          src: `data:${result.mimeType || "image/jpeg"};base64,${result.base64}`
        };
      } catch {
        return {
          id: fileId,
          index,
          error: true
        };
      }
    })).then((photos) => {
      if (!cancelled) setPendingPhotos(photos.filter(Boolean));
    });
    return () => {
      cancelled = true;
    };
  }, [cases, selectedNo, page]);
  const visibleCases = useMemo(() => {
    const filtered = cases.filter((item) => {
      const statusMatch = filter === "全部" || item.status === filter;
      const text = [item.case_no, item.applicant, item.phone, item.address, item.waste_type, item.vehicle_no].join(" ").toLowerCase();
      const created = String(item.created_at || "").slice(0, 10);
      const dateMatch = !useDateRange || (!dateFrom || created >= dateFrom) && (!dateTo || created <= dateTo);
      return statusMatch && dateMatch && text.includes(keyword.trim().toLowerCase());
    });
    return filter === "已排班" ? filtered.sort((first, second) => dispatchGroupKey(first).localeCompare(dispatchGroupKey(second), "zh-Hant")) : filtered;
  }, [cases, filter, keyword, useDateRange, dateFrom, dateTo]);
  useEffect(() => {
    var _a;
    const selectedIsVisible = visibleCases.some((item) => item.case_no === selectedNo);
    if (!selectedIsVisible) setSelectedNo(((_a = visibleCases[0]) == null ? void 0 : _a.case_no) || "");
  }, [visibleCases, selectedNo]);
  const pageTabCounts = useMemo(() => Object.fromEntries(pageTabs.map((tab) => [tab, ["電話申請", "Dashboard", "資料庫檢視", "系統設定"].includes(tab) ? null : tab === "案件清單與進度" ? cases.length : cases.filter((item) => item.status === tabStatus[tab]).length])), [cases]);
  const scheduledGroupStyles = useMemo(() => {
    const counts = cases.filter((item) => ["已排班", "清運中", "清運完成"].includes(item.status)).reduce((result, item) => {
      const key = dispatchGroupKey(item);
      result[key] = (result[key] || 0) + 1;
      return result;
    }, {});
    return Object.fromEntries(Object.keys(counts).filter((key) => counts[key] > 1).map((key) => {
      const hue = Array.from(key).reduce((sum, char, index) => sum + (index + 1) * char.charCodeAt(0), 0) % 360;
      return [key, {
        backgroundColor: `hsl(${hue} 78% 92%)`,
        borderColor: `hsl(${hue} 55% 48%)`
      }];
    }));
  }, [cases]);
  const dispatchTripChoices = useMemo(() => {
    if (!(draft == null ? void 0 : draft.vehicle_no) || !(draft == null ? void 0 : draft.scheduled_at) || !(draft == null ? void 0 : draft.dispatch_period)) return [{
      trip: 1,
      label: "建立第 1 班",
      mode: "new"
    }];
    const date = dispatchDateKey(draft.scheduled_at);
    const used = [...new Set(cases.filter((item) => item.case_no !== draft.case_no && item.status === "已排班" && dispatchDateKey(item.scheduled_at) === date && String(item.vehicle_no || "").trim() === String(draft.vehicle_no || "").trim() && item.dispatch_period === draft.dispatch_period).map((item) => Number(item.dispatch_trip || 1)))].sort((first, second) => first - second);
    if (!used.length) return [{
      trip: 1,
      label: "建立第 1 班",
      mode: "new"
    }];
    const lastTrip = used[used.length - 1];
    return [{
      trip: lastTrip,
      label: `併入第 ${lastTrip} 班`,
      mode: "merge"
    }, {
      trip: lastTrip + 1,
      label: `新增第 ${lastTrip + 1} 班`,
      mode: "new"
    }];
  }, [cases, draft == null ? void 0 : draft.case_no, draft == null ? void 0 : draft.scheduled_at, draft == null ? void 0 : draft.vehicle_no, draft == null ? void 0 : draft.dispatch_period]);
  const setDispatchWorkers = (members) => {
    const cleaned = [...new Set(members.map((member) => String(member || "").trim()).filter(Boolean))];
    setWorkerSelections(cleaned.length ? cleaned : [""]);
    setDraft({
      ...draft,
      worker_name: cleaned.join("、")
    });
  };
  const selectDispatchTrip = (value) => {
    const trip = Number(value);
    const date = dispatchDateKey(draft.scheduled_at);
    const mergedCase = cases.find((item) => item.case_no !== draft.case_no && item.status === "已排班" && dispatchDateKey(item.scheduled_at) === date && String(item.vehicle_no || "").trim() === String(draft.vehicle_no || "").trim() && item.dispatch_period === draft.dispatch_period && Number(item.dispatch_trip || 1) === trip);
    if (mergedCase == null ? void 0 : mergedCase.worker_name) {
      setDispatchWorkers(splitCrewMembers(mergedCase.worker_name));
      setDraft((current) => ({
        ...current,
        dispatch_trip: trip,
        worker_name: mergedCase.worker_name
      }));
    } else setDraft({
      ...draft,
      dispatch_trip: trip
    });
  };
  const updateDispatchContext = (changes) => {
    const next = {
      ...draft,
      ...changes
    };
    if (!next.vehicle_no || !next.scheduled_at || !next.dispatch_period) return setDraft({
      ...next,
      dispatch_trip: 1
    });
    const date = dispatchDateKey(next.scheduled_at);
    const used = [...new Set(cases.filter((item) => item.case_no !== next.case_no && item.status === "已排班" && dispatchDateKey(item.scheduled_at) === date && String(item.vehicle_no || "").trim() === String(next.vehicle_no || "").trim() && item.dispatch_period === next.dispatch_period).map((item) => Number(item.dispatch_trip || 1)))].sort((first, second) => first - second);
    setDraft({
      ...next,
      dispatch_trip: used.length ? used[used.length - 1] + 1 : 1
    });
  };
  const login = async (event) => {
    event.preventDefault();
    const value = tokenInput.trim();
    if (!value) return;
    setLoading(true);
    setMessage("");
    try {
      const result = await adminLogin(emailInput.trim(), value);
      sessionStorage.setItem("admin_api_token", result.token);
      setToken(result.token);
      setTokenInput("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };
  const logout = () => {
    sessionStorage.removeItem("admin_api_token");
    setToken("");
    setCases([]);
  };
  const save = async (changes = {}, success = "案件已更新", selectStatus = "") => {
    if (!draft) return;
    const next = {
      ...draft,
      ...changes
    };
    setLoading(true);
    setMessage("");
    try {
      await adminPost("upsert", {
        case: toCasePayload(next)
      });
      setMessage(success);
      await loadCases(selectStatus);
      if (!selectStatus) setSelectedNo(next.case_no);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };
  const approveReview = async () => {
    const items = categories.map((type) => ({
      type,
      quantity: Math.max(0, Number(reviewCounts[type] || 0))
    })).filter((item) => item.quantity > 0);
    const total = items.reduce((sum, item) => sum + item.quantity, 0);
    if (!total) return setMessage("請至少填寫一項人工確認品項");
    const chargeable = total - (annualApplicationCount <= 3 ? Math.min(total, annualFreeRemaining) : 0);
    const previousDraft = draft;
    const approvedDraft = {
      ...draft,
      quantity: total,
      annual_count: annualApplicationCount,
      quantity_review_status: "人工已核可",
      confirmed_items: JSON.stringify(items),
      chargeable_quantity: chargeable,
      fee_amount: chargeable * 200
    };
    setDraft(approvedDraft);
    setCases((current) => current.map((item) => item.case_no === approvedDraft.case_no ? approvedDraft : item));
    setLoading(true);
    setMessage("人工已核可，正在同步…");
    try {
      await adminPost("upsert", {
        case: toCasePayload(approvedDraft)
      });
      setMessage("人工覆核已完成");
    } catch (error) {
      setDraft(previousDraft);
      setCases((current) => current.map((item) => item.case_no === previousDraft.case_no ? previousDraft : item));
      setMessage(`覆核同步失敗，已還原：${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  const schedule = async () => {
    if (draft.quantity_review_status !== "人工已核可") return setMessage("核可排班前，必須先完成逐項人工確認");
    if (!draft.scheduled_at || !draft.vehicle_no || !draft.worker_name || !draft.dispatch_period) return setMessage("請填寫管理端排定的清運日期、清運時段、車號及班組");
    if (!dispatchOptions.vehicles.some((item) => item.vehicle_no === draft.vehicle_no)) return setMessage("請由派車設定選擇有效車號");
    if (!splitCrewMembers(draft.worker_name).every((member) => dispatchOptions.workers.includes(member))) return setMessage("請由清運人員設定選擇有效姓名");
    const selectedTrip = dispatchTripChoices.some((choice) => choice.trip === Number(draft.dispatch_trip || 1)) ? Number(draft.dispatch_trip || 1) : dispatchTripChoices[dispatchTripChoices.length - 1].trip;
    await save({
      status: "已排班",
      dispatch_status: "已排班",
      dispatch_trip: selectedTrip
    }, "案件已核可排班", "待處理");
  };
  const withdrawCase = async () => {
    if (!draft) return;
    const input = window.prompt(`請輸入案件「${draft.case_no}」的撤案原因（必填）：`);
    if (input === null) return;
    const reason = input.trim();
    if (!reason) return setMessage("撤案原因為必填，案件尚未撤案");
    if (!window.confirm(`確定將案件「${draft.case_no}」撤案？

撤案原因：${reason}`)) return;
    const note = String(draft.dispatch_note || "").trim();
    await save({
      status: "已取消",
      dispatch_status: "已取消",
      dispatch_note: `${note}${note ? "\n" : ""}撤案原因：${reason}`
    }, "案件已撤案");
  };
  const saveScheduledChanges = async () => {
    if (!draft.scheduled_at || !draft.dispatch_period || !draft.vehicle_no || !draft.worker_name) return setMessage("請填寫清運日期、時段、車號及清運人員");
    if (!dispatchOptions.vehicles.some((item) => item.vehicle_no === draft.vehicle_no)) return setMessage("請選擇有效派車車號");
    if (!splitCrewMembers(draft.worker_name).every((member) => dispatchOptions.workers.includes(member))) return setMessage("請選擇有效清運人員");
    await save({}, "排班資料已更新");
    setScheduleEditing(false);
  };
  const selectPage = (nextPage) => {
    setPage(nextPage);
    if (tabStatus[nextPage]) setFilter(tabStatus[nextPage]);
  };
  const saveSystemSettings = async () => {
    const vehicles = vehicleSettings.map((item) => ({
      vehicle_no: String(item.vehicle_no || "").trim(),
      fuel_efficiency: Number(item.fuel_efficiency || 5),
      co2_per_liter: Number(item.co2_per_liter || 2.69)
    })).filter((item) => item.vehicle_no);
    const workers = workerSettings.map((name) => String(name || "").trim()).filter(Boolean);
    if (new Set(vehicles.map((item) => item.vehicle_no)).size !== vehicles.length) return setMessage("派車資料有重複的車號");
    if (new Set(workers).size !== workers.length) return setMessage("清運人員名單有重複姓名");
    setLoading(true);
    setMessage("");
    try {
      await adminPost("updateDispatchOptions", {
        vehicles,
        workers,
        routeOrigin: routeOriginSettings,
        googleDriveEnabled,
        googleDriveWebAppUrl
      });
      await loadDispatchOptions();
      setMessage("系統設定已儲存，排班選單、出發點與照片儲存設定已同步更新");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };
  const handlePhoneCreated = async (caseNo) => {
    await loadCases();
    setSelectedNo(caseNo);
    selectPage("待處理");
    setMessage(`電話申請已建立，案件編號：${caseNo}`);
  };
  const restoreCaseStatus = async () => {
    if (!draft || draft.status !== "已取消" || !window.confirm(`確定恢復案件「${draft.case_no}」為待處理嗎？`)) return;
    await save({
      status: "待處理",
      dispatch_status: "待處理"
    }, "案件狀態已恢復為待處理");
    selectPage("待處理");
  };
  const deleteCase = async () => {
    if (!draft || !window.confirm(`確定刪除案件「${draft.case_no}」嗎？此動作會同步刪除雲端資料，無法復原。`)) return;
    setLoading(true);
    setMessage("");
    try {
      await adminPost("delete", {
        caseNo: draft.case_no
      });
      setSelectedNo("");
      setMessage("案件已刪除");
      await loadCases();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };
  const completeWithPhoto = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length || !draft) return;
    if (files.some((file) => !file.type.startsWith("image/"))) return setMessage("請選擇圖片檔案");
    if (files.some((file) => file.size > 8 * 1024 * 1024)) return setMessage("每張結案照片不可超過 8 MB");
    setLoading(true);
    setMessage(`正在上傳結案照片（0/${files.length}）…`);
    try {
      const uploadSession = await adminPost("adminPrepareCompletionUploads", {
        caseNo: draft.case_no,
        photos: files.map((file) => ({
          mimeType: file.type,
          size: file.size
        }))
      });
      await Promise.all(uploadSession.uploads.map((upload, index) => uploadSignedPhoto(upload.signedUrl, files[index], files[index].type)));
      const photoIds = uploadSession.uploads.map((upload) => upload.path);
      const note = String(draft.dispatch_note || "").trim();
      const routeKey = `${dispatchOptions.route_origin}|${scheduledRouteCases.map((item) => item.case_no).sort().join("|")}`;
      const route = routeCache[routeKey];
      const alreadyRecorded = cases.some((item) => item.case_no !== draft.case_no && dispatchGroupKey(item) === dispatchGroupKey(draft) && item.status === "清運完成" && Number(item.completion_distance_km || 0) > 0);
      const metrics = route && !alreadyRecorded ? {
        completion_distance_km: Number(route.distanceKm || 0),
        completion_carbon_kg: Number(route.carbonKg || 0)
      } : {};
      const next = {
        ...draft,
        status: "清運完成",
        dispatch_status: "清運完成",
        completion_photo_paths: photoIds,
        dispatch_note: note,
        ...metrics
      };
      await adminPost("upsert", {
        case: toCasePayload(next)
      });
      await adminPost("adminQueueCompletionPhotos", {
        caseNo: draft.case_no,
        stagedPhotoPaths: photoIds
      });
      setMessage(`已上傳 ${photoIds.length} 張結案照片，案件已標記為清運完成${route && !alreadyRecorded ? "，班次里程與碳排量已計入" : ""}`);
      await loadCases();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };
  const reviewApproved = (draft == null ? void 0 : draft.quantity_review_status) === "人工已核可";
  const reviewYear = new Date((draft == null ? void 0 : draft.created_at) || Date.now()).getFullYear();
  const annualAddressCases = draft ? cases.filter((item) => String(item.address || "").trim() === String(draft.address || "").trim() && item.status !== "已取消" && new Date(item.created_at || Date.now()).getFullYear() === reviewYear).sort((first, second) => String(first.created_at || "").localeCompare(String(second.created_at || "")) || String(first.case_no || "").localeCompare(String(second.case_no || ""))) : [];
  const annualApplicationCount = draft ? Math.max(1, annualAddressCases.findIndex((item) => item.case_no === draft.case_no) + 1) : 0;
  const reviewTotal = categories.reduce((total, name) => total + Math.max(0, Number(reviewCounts[name] || 0)), 0);
  const annualFreeUsed = annualAddressCases.slice(0, Math.max(0, annualAddressCases.findIndex((item) => item.case_no === (draft == null ? void 0 : draft.case_no)))).filter((item) => item.quantity_review_status === "人工已核可" || item.status === "清運完成").reduce((total, item) => total + Math.max(0, Number(item.quantity || 0)), 0);
  const annualFreeRemaining = Math.max(0, 6 - annualFreeUsed);
  const reviewFreeQuantity = annualApplicationCount <= 3 ? Math.min(annualFreeRemaining, reviewTotal) : 0;
  const reviewChargeableQuantity = Math.max(0, reviewTotal - reviewFreeQuantity);
  const reviewFeeAmount = reviewChargeableQuantity * 200;
  const dispatchFieldsDisabled = (draft == null ? void 0 : draft.status) === "已排班" && !scheduleEditing;
  const isMergingDispatch = dispatchTripChoices.some((choice) => choice.mode === "merge" && choice.trip === Number((draft == null ? void 0 : draft.dispatch_trip) || 1));
  const scheduledRouteCases = (draft == null ? void 0 : draft.status) === "已排班" ? cases.filter((item) => item.status === "已排班" && dispatchGroupKey(item) === dispatchGroupKey(draft)) : [];
  if (!token) return createVNode("div", {
    "className": "min-h-screen bg-emerald-950 px-5 py-14"
  }, [createVNode("form", {
    "onSubmit": login,
    "className": "mx-auto max-w-sm rounded-3xl bg-white p-8 shadow-2xl"
  }, [createVNode("p", {
    "className": "text-sm font-bold text-emerald-700"
  }, [createTextVNode("三義鄉巨大廢棄物")]), createVNode("h1", {
    "className": "mt-2 text-2xl font-black"
  }, [createTextVNode("管理端登入")]), createVNode("p", {
    "className": "mt-2 text-sm text-slate-500"
  }, [createTextVNode("請使用已授權的管理員帳號與密碼登入。")]), message && createVNode("p", {
    "className": "mt-4 rounded-lg bg-rose-50 p-3 text-sm font-bold text-rose-700"
  }, [message]), createVNode("label", {
    "className": "mt-6 block text-sm font-bold text-slate-700"
  }, [createTextVNode("管理員帳號（Email）"), createVNode("input", {
    "required": true,
    "type": "email",
    "autoComplete": "username",
    "value": emailInput,
    "onInput": (e) => setEmailInput(e.target.value),
    "placeholder": "name@example.com",
    "className": "mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
  }, null)]), createVNode("label", {
    "className": "mt-3 block text-sm font-bold text-slate-700"
  }, [createTextVNode("密碼"), createVNode("input", {
    "required": true,
    "type": "password",
    "autoComplete": "current-password",
    "value": tokenInput,
    "onInput": (e) => setTokenInput(e.target.value),
    "placeholder": "請輸入密碼",
    "className": "mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
  }, null)]), createVNode("button", {
    "disabled": loading,
    "className": "mt-4 w-full rounded-xl bg-emerald-700 py-3 font-black text-white disabled:opacity-60"
  }, [loading ? "登入中…" : "登入管理端"])])]);
  return createVNode("div", {
    "className": "min-h-screen bg-slate-100 text-slate-900"
  }, [createVNode("header", {
    "className": "sticky top-0 z-50 bg-emerald-950 px-3 py-2 text-white shadow-md sm:px-5"
  }, [createVNode("div", {
    "className": "mx-auto flex min-h-16 flex-wrap items-center gap-3 xl:flex-nowrap"
  }, [createVNode("h1", {
    "className": "shrink-0 text-xl font-black"
  }, [createTextVNode("案件管理與排班")]), createVNode("nav", {
    "className": "order-3 flex w-full flex-wrap gap-2 xl:order-none xl:ml-3 xl:w-auto",
    "aria-label": "案件管理頁面"
  }, [pageTabs.map((tab) => createVNode("button", {
    "key": tab,
    "type": "button",
    "onClick": () => selectPage(tab),
    "className": "rounded-xl px-4 py-2.5 text-sm font-black transition-colors " + (page === tab ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-emerald-50")
  }, [createVNode("span", null, [tab]), createVNode("span", {
    "className": "ml-2 inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-xs " + (page === tab ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700")
  }, [pageTabCounts[tab]])]))]), createVNode("div", {
    "className": "ml-auto flex shrink-0 gap-2"
  }, [createVNode("button", {
    "onClick": loadCases,
    "disabled": loading,
    "aria-busy": loading,
    "className": "rounded-xl px-4 py-2 text-sm font-bold transition-all disabled:cursor-wait " + (loading ? "bg-amber-400 text-emerald-950 shadow-lg shadow-amber-400/30" : "bg-white/10 text-white hover:bg-white/20")
  }, [createVNode("span", {
    "className": "inline-flex items-center gap-2"
  }, [loading && createVNode("span", {
    "className": "inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-950/30 border-t-emerald-950",
    "aria-hidden": "true"
  }, null), createVNode("span", null, [loading ? "整理中…" : "重新整理"])])]), createVNode("button", {
    "onClick": logout,
    "className": "rounded-xl bg-white/10 px-4 py-2 text-sm font-bold"
  }, [createTextVNode("登出")])])])]), page === "系統設定" ? createVNode(SystemSettings, {
    "vehicles": vehicleSettings,
    "setVehicles": setVehicleSettings,
    "workers": workerSettings,
    "setWorkers": setWorkerSettings,
    "routeOrigin": routeOriginSettings,
    "setRouteOrigin": setRouteOriginSettings,
    "loading": loading,
    "message": message,
    "onSave": saveSystemSettings
  }, null) : page === "資料庫檢視" ? createVNode(DatabaseViewer, {
    "cases": cases,
    "getMinguoTime": getMinguoTime
  }, null) : page === "電話申請" ? createVNode(PhoneApplication, {
    "createdAction": handlePhoneCreated
  }, null) : page === "Dashboard" ? createVNode(SupabaseDashboard, {
    "cases": cases,
    "loading": loading,
    "reload": loadCases
  }, null) : createVNode("main", {
    "className": "mx-auto max-w-7xl p-4"
  }, [createVNode("div", {
    "className": "grid gap-5 lg:grid-cols-[390px_1fr]"
  }, [createVNode("section", {
    "className": "rounded-2xl bg-white p-4 shadow-sm"
  }, [createVNode("div", null, [createVNode("h2", {
    "className": "text-lg font-black text-slate-900"
  }, [statusPageMeta[filter].title]), createVNode("p", {
    "className": "mt-1 text-xs font-bold text-slate-500"
  }, [statusPageMeta[filter].description])]), createVNode("input", {
    "value": keyword,
    "onInput": (e) => setKeyword(e.target.value),
    "placeholder": "案件編號、申請人、電話、地址或車號",
    "className": "mt-4 w-full rounded-xl border border-slate-300 px-3 py-2.5"
  }, null), page === "案件清單與進度" && createVNode(Fragment, null, [createVNode("div", {
    "className": "mt-3 flex flex-wrap gap-2",
    "aria-label": "案件狀態篩選"
  }, [statuses.map((status) => createVNode("button", {
    "key": status,
    "onClick": () => {
      setFilter(status);
      setPage("案件清單與進度");
    },
    "className": `rounded-full px-3 py-1.5 text-xs font-bold ${filter === status ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600"}`
  }, [status]))]), createVNode("label", {
    "className": "mt-4 flex items-center gap-2 text-xs font-bold text-slate-600"
  }, [createVNode("input", {
    "type": "checkbox",
    "checked": useDateRange,
    "onInput": (e) => setUseDateRange(e.target.checked)
  }, null), createTextVNode(" 建立時間範圍")]), useDateRange && createVNode("div", {
    "className": "mt-2 grid grid-cols-2 gap-2"
  }, [createVNode("input", {
    "type": "date",
    "value": dateFrom,
    "onInput": (e) => setDateFrom(e.target.value),
    "aria-label": "開始日期",
    "className": "rounded-lg border border-slate-300 p-2 text-xs"
  }, null), createVNode("input", {
    "type": "date",
    "value": dateTo,
    "onInput": (e) => setDateTo(e.target.value),
    "aria-label": "結束日期",
    "className": "rounded-lg border border-slate-300 p-2 text-xs"
  }, null)])]), createVNode("p", {
    "className": "mt-4 text-xs font-bold text-slate-500"
  }, [createTextVNode("共 "), visibleCases.length, createTextVNode(" 件")]), createVNode("div", {
    "className": "mt-2 max-h-[68vh] space-y-2 overflow-auto"
  }, [visibleCases.map((item) => {
    const groupStyle = page === "已排班" ? scheduledGroupStyles[dispatchGroupKey(item)] : null;
    return createVNode("button", {
      "key": item.case_no,
      "onClick": () => setSelectedNo(item.case_no),
      "style": groupStyle || void 0,
      "className": `w-full rounded-xl border p-3 text-left ${groupStyle ? "border-2" : selectedNo === item.case_no ? "border-emerald-600 bg-emerald-50" : "border-slate-200"}`
    }, [createVNode("div", {
      "className": "flex justify-between gap-2"
    }, [createVNode("strong", null, [item.case_no]), page === "案件清單與進度" && createVNode("span", {
      "className": "text-xs font-bold text-emerald-700"
    }, [item.status])]), createVNode("p", {
      "className": "mt-1 text-sm"
    }, [item.applicant, createTextVNode("｜"), item.waste_type]), createVNode("p", {
      "className": "mt-1 truncate text-xs text-slate-500"
    }, [item.address]), groupStyle && createVNode("p", {
      "className": "mt-1 text-[10px] font-black text-slate-600"
    }, [createTextVNode("同班次｜"), item.vehicle_no, createTextVNode(" 車・"), item.dispatch_period, createTextVNode("・第 "), item.dispatch_trip || 1, createTextVNode(" 班")])]);
  }), !loading && !visibleCases.length && createVNode("p", {
    "className": "rounded-xl border-2 border-dashed border-slate-200 px-4 py-10 text-center text-sm font-bold text-slate-400"
  }, [createTextVNode("目前無案件")])])]), createVNode("section", {
    "className": "rounded-2xl bg-white p-5 shadow-sm"
  }, [message && createVNode("div", {
    "className": "mb-4 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800"
  }, [message]), !visibleCases.length ? createVNode("p", {
    "className": "py-20 text-center font-bold text-slate-400"
  }, [createTextVNode("目前無案件")]) : !draft ? createVNode("p", {
    "className": "py-20 text-center text-slate-400"
  }, [createTextVNode("請選擇案件")]) : createVNode("div", {
    "className": "space-y-6"
  }, [createVNode("div", {
    "className": "flex flex-wrap items-start justify-between gap-3"
  }, [createVNode("div", null, [createVNode("p", {
    "className": "text-sm font-bold text-emerald-700"
  }, [draft.report_source]), createVNode("h2", {
    "className": "text-2xl font-black"
  }, [draft.case_no]), createVNode("p", {
    "className": "mt-1 text-sm text-slate-500"
  }, [draft.applicant, createTextVNode("｜"), draft.phone])]), page === "案件清單與進度" && createVNode("span", {
    "className": "rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-800"
  }, [draft.status])]), createVNode("div", {
    "className": "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
  }, [createVNode(Info, {
    "label": "地址",
    "value": draft.address
  }, null), createVNode(Info, {
    "label": "申報內容",
    "value": `${draft.waste_type}，${draft.quantity} 件`
  }, null), createVNode(Info, {
    "label": "年度免費額度",
    "value": page === "待處理" ? `本次為本年度第 ${annualApplicationCount} 次申請，尚餘 ${annualFreeRemaining} 件免費額度` : `${annualApplicationCount} 次（${annualApplicationCount <= 3 && annualFreeRemaining > 0 ? `尚餘 ${annualFreeRemaining} 件免費` : "免費額度已用完"}）`
  }, null), createVNode(Info, {
    "label": "費用",
    "value": `${Number(draft.fee_amount || 0).toLocaleString()} 元`
  }, null), page === "待處理" ? createVNode(Info, {
    "label": "民眾希望清運日期／時段",
    "value": `${getMinguoTime(draft.requested_scheduled_at || draft.scheduled_at)}／${draft.dispatch_period || "—"}`
  }, null) : createVNode(Fragment, null, [page !== "已排班" && createVNode(Fragment, null, [createVNode(Info, {
    "label": "建立時間",
    "value": getMinguoTime(draft.created_at)
  }, null), createVNode(Info, {
    "label": "最後更新",
    "value": getMinguoTime(draft.updated_at)
  }, null)]), createVNode(Info, {
    "label": draft.status === "已排班" ? "排定清運日期與時間" : "民眾希望日期",
    "value": getMinguoTime(draft.status === "已排班" ? draft.scheduled_at || draft.requested_scheduled_at : draft.requested_scheduled_at || draft.scheduled_at)
  }, null), createVNode(Info, {
    "label": draft.status === "已排班" ? "排定清運時段／第幾班" : "民眾希望時段",
    "value": `${draft.dispatch_period || "—"}／第 ${draft.dispatch_trip || 1} 班`
  }, null), createVNode(Info, {
    "label": "派車車號／清運人員",
    "value": `${draft.vehicle_no || "—"}／${draft.worker_name || "—"}`
  }, null)]), createTextVNode(" "), draft.status === "已取消" && createVNode(Info, {
    "label": "撤案原因／備註",
    "value": draft.dispatch_note
  }, null)]), ["待處理", "已排班"].includes(page) && createVNode("section", {
    "className": "rounded-2xl border border-sky-200 bg-sky-50 p-4"
  }, [createVNode("h3", {
    "className": "font-black text-sky-950"
  }, [page === "已排班" ? "未清運照片" : "待清運照片"]), pendingPhotos.length ? createVNode("div", {
    "className": "mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
  }, [pendingPhotos.map((photo) => createVNode("button", {
    "type": "button",
    "key": photo.id,
    "disabled": photo.error,
    "onClick": () => setPendingPhotoPreview(photo),
    "className": "overflow-hidden rounded-xl border border-sky-200 bg-white text-left transition-shadow hover:shadow-md disabled:cursor-default"
  }, [photo.error ? createVNode("span", {
    "className": "flex h-24 items-center justify-center p-3 text-center text-xs font-bold text-rose-700"
  }, [createTextVNode("照片載入失敗")]) : createVNode("img", {
    "src": photo.src,
    "alt": `${page === "已排班" ? "未清運" : "待清運"}照片 ${photo.index + 1}`,
    "className": "h-24 w-full object-cover"
  }, null), createVNode("span", {
    "className": "block p-2 text-center text-xs font-bold text-sky-800"
  }, [createTextVNode("照片 "), photo.index + 1])]))]) : createVNode("p", {
    "className": "mt-2 text-sm font-bold text-slate-500"
  }, [createTextVNode("尚未上傳"), page === "已排班" ? "未清運" : "待清運", createTextVNode("照片。")])]), page === "清運完成" && createVNode("section", {
    "className": "rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
  }, [createVNode("h3", {
    "className": "font-black text-emerald-950"
  }, [createTextVNode("結案照片")]), pendingPhotos.length ? createVNode("div", {
    "className": "mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
  }, [pendingPhotos.map((photo) => createVNode("button", {
    "type": "button",
    "key": photo.id,
    "disabled": photo.error,
    "onClick": () => setPendingPhotoPreview(photo),
    "className": "overflow-hidden rounded-xl border border-emerald-200 bg-white text-left transition-shadow hover:shadow-md disabled:cursor-default"
  }, [photo.error ? createVNode("span", {
    "className": "flex h-24 items-center justify-center p-3 text-center text-xs font-bold text-rose-700"
  }, [createTextVNode("照片載入失敗")]) : createVNode("img", {
    "src": photo.src,
    "alt": `結案照片 ${photo.index + 1}`,
    "className": "h-24 w-full object-cover"
  }, null), createVNode("span", {
    "className": "block p-2 text-center text-xs font-bold text-emerald-800"
  }, [createTextVNode("結案照片 "), photo.index + 1])]))]) : createVNode("p", {
    "className": "mt-2 text-sm font-bold text-slate-500"
  }, [createTextVNode("尚未上傳結案照片。")])]), pendingPhotoPreview && createVNode("div", {
    "className": "fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 p-4",
    "role": "dialog",
    "aria-modal": "true",
    "aria-label": `${page === "已排班" ? "未清運" : "待清運"}照片 ${pendingPhotoPreview.index + 1}`,
    "onClick": () => setPendingPhotoPreview(null)
  }, [createVNode("div", {
    "className": "max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white p-4 shadow-2xl",
    "onClick": (event) => event.stopPropagation()
  }, [createVNode("div", {
    "className": "mb-3 flex items-center justify-between gap-3"
  }, [createVNode("h3", {
    "className": "font-black"
  }, [page === "已排班" ? "未清運" : "待清運", createTextVNode("照片 "), pendingPhotoPreview.index + 1]), createVNode("button", {
    "type": "button",
    "onClick": () => setPendingPhotoPreview(null),
    "className": "rounded-lg bg-slate-100 px-3 py-1.5 font-black text-slate-700"
  }, [createTextVNode("✕ 關閉")])]), createVNode("img", {
    "src": pendingPhotoPreview.src,
    "alt": `${page === "已排班" ? "未清運" : "待清運"}照片 ${pendingPhotoPreview.index + 1}`,
    "className": "max-h-[76vh] w-full object-contain"
  }, null)])]), page === "已排班" && createVNode(RoutePlanner, {
    "cases": scheduledRouteCases,
    "vehicle": dispatchOptions.vehicles.find((item) => item.vehicle_no === draft.vehicle_no),
    "origin": dispatchOptions.route_origin,
    "routeCache": routeCache,
    "setRouteCache": setRouteCache
  }, null), ["案件清單與進度", "待處理"].includes(page) && createVNode("div", {
    "className": "rounded-2xl border p-4 " + (reviewApproved ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50")
  }, [createVNode("div", {
    "className": "flex flex-wrap items-center justify-between gap-3"
  }, [createVNode("div", null, [createVNode("h3", {
    "className": "font-black"
  }, [createTextVNode("人工逐項覆核")]), createVNode("p", {
    "className": "text-xs text-slate-600"
  }, [createTextVNode("僅於待處理頁進行人工確認與計費。")])]), createVNode("div", {
    "className": "rounded-xl px-3 py-2 text-sm font-black " + (reviewApproved ? "bg-emerald-600 text-white" : "bg-amber-200 text-amber-900")
  }, [reviewApproved ? "✓ 人工已核可" : "⚠ 待人工核可"])]), createVNode("div", {
    "className": "mt-3 rounded-xl border p-3 text-sm font-bold " + (reviewApproved ? "border-emerald-200 bg-white/70 text-emerald-900" : "border-amber-200 bg-white/70 text-amber-900")
  }, [createVNode("div", {
    "className": "grid gap-2 sm:grid-cols-4"
  }, [createVNode("span", null, [createTextVNode("確認總件數："), reviewApproved ? draft.quantity : reviewTotal, createTextVNode(" 件")]), createVNode("span", null, [createTextVNode("免費件數："), reviewApproved ? Math.max(0, Number(draft.quantity || 0) - Number(draft.chargeable_quantity || 0)) : reviewFreeQuantity, createTextVNode(" 件")]), createVNode("span", null, [createTextVNode("計費件數："), reviewApproved ? draft.chargeable_quantity || 0 : reviewChargeableQuantity, createTextVNode(" 件")]), createVNode("span", null, [createTextVNode("應收費用：NT$ "), Number(reviewApproved ? draft.fee_amount : reviewFeeAmount).toLocaleString()])]), !reviewApproved && createVNode("p", {
    "className": "mt-2 text-xs"
  }, [createTextVNode("試算："), reviewTotal, createTextVNode(" 件 − 免費 "), reviewFreeQuantity, createTextVNode(" 件 ＝ 計費 "), reviewChargeableQuantity, createTextVNode(" 件 × NT$ 200 ＝ NT$ "), reviewFeeAmount.toLocaleString(), annualApplicationCount > 3 ? "（同地址本年度免費額度已用完）" : "（同地址本年度第 " + annualApplicationCount + " 次申請）"])]), createVNode("div", {
    "className": "mt-4 grid grid-cols-7 gap-2 overflow-x-auto"
  }, [categories.map((name) => createVNode("label", {
    "key": name,
    "className": "min-w-20 text-xs font-bold text-slate-600"
  }, [name, createVNode("input", {
    "disabled": reviewApproved,
    "type": "number",
    "min": "0",
    "value": reviewCounts[name] || 0,
    "onInput": (e) => setReviewCounts((old) => ({
      ...old,
      [name]: e.target.value
    })),
    "className": "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-100"
  }, null)]))]), createVNode("label", {
    "className": "mt-3 block text-xs font-bold text-slate-600"
  }, [createTextVNode("人工判斷依據（選填）"), createVNode("textarea", {
    "disabled": reviewApproved,
    "rows": "2",
    "value": draft.review_note || "",
    "onInput": (e) => setDraft({
      ...draft,
      review_note: e.target.value
    }),
    "className": "mt-1 w-full rounded-lg border border-slate-300 p-3 disabled:bg-slate-100"
  }, null)]), page === "待處理" && (reviewApproved ? createVNode("button", {
    "disabled": loading,
    "onClick": () => setDraft({
      ...draft,
      quantity_review_status: "待人工核可",
      chargeable_quantity: 0,
      fee_amount: 0
    }),
    "className": "mt-3 rounded-xl border border-emerald-600 bg-white px-4 py-2.5 text-sm font-black text-emerald-700"
  }, [createTextVNode("修改人工確認")]) : createVNode("button", {
    "disabled": loading,
    "onClick": approveReview,
    "className": "mt-3 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-black text-white"
  }, [createTextVNode("人工核可並試算費用")]))]), (["案件清單與進度", "待處理"].includes(page) || page === "已排班" && scheduleEditing) && createVNode("div", {
    "className": "rounded-2xl border p-4 " + (page === "待處理" ? "border-amber-300 bg-amber-50" : "border-slate-200")
  }, [createVNode("div", {
    "className": "flex flex-wrap items-center justify-between gap-3"
  }, [createVNode("div", null, [createVNode("h3", {
    "className": "font-black"
  }, [page === "已排班" ? "修改已排班案件" : "待處理案件排班"]), page === "待處理" && createVNode("p", {
    "className": "text-xs text-slate-600"
  }, [createTextVNode("車號與姓名一律以「派車設定」為準；請先在桌面端完成設定，再由此處選擇。")])]), page === "待處理" && createVNode("div", {
    "className": "rounded-xl bg-amber-200 px-3 py-2 text-sm font-black text-amber-900"
  }, [reviewApproved ? "待核可排班" : "⚠ 等待人工核可"])]), createVNode("div", {
    "className": "mt-3 grid gap-3 sm:grid-cols-2"
  }, [createVNode(Field, {
    "label": "管理端排定清運日期與時間（民國）"
  }, {
    default: () => [createVNode(MinguoDateTimePicker, {
      "disabled": dispatchFieldsDisabled,
      "value": draft.scheduled_at,
      "onCommit": (scheduled_at) => updateDispatchContext({
        scheduled_at
      })
    }, null)]
  }), createVNode(Field, {
    "label": "管理端排定清運時段"
  }, {
    default: () => [createVNode("select", {
      "disabled": dispatchFieldsDisabled,
      "value": draft.dispatch_period || "",
      "onInput": (e) => updateDispatchContext({
        dispatch_period: e.target.value
      })
    }, [periods.map((item) => createVNode("option", {
      "key": item,
      "value": item
    }, [item || "請選擇"]))])]
  }), createVNode(Field, {
    "label": "派車車號"
  }, {
    default: () => [createVNode("select", {
      "disabled": dispatchFieldsDisabled,
      "value": draft.vehicle_no || "",
      "onInput": (e) => updateDispatchContext({
        vehicle_no: e.target.value
      })
    }, [createVNode("option", {
      "value": ""
    }, [createTextVNode("請選擇車號")]), dispatchOptions.vehicles.map((item) => createVNode("option", {
      "key": item.vehicle_no,
      "value": item.vehicle_no
    }, [item.vehicle_no]))])]
  }), createVNode(Field, {
    "label": "清運人員"
  }, {
    default: () => [createVNode("div", {
      "className": "space-y-2"
    }, [workerSelections.map((selected, index) => createVNode("div", {
      "key": index,
      "className": "flex gap-2"
    }, [createVNode("select", {
      "disabled": dispatchFieldsDisabled || isMergingDispatch,
      "value": selected,
      "onInput": (e) => {
        const next = [...workerSelections];
        next[index] = e.target.value;
        setDispatchWorkers(next);
      }
    }, [createVNode("option", {
      "value": ""
    }, [createTextVNode("請選擇清運人員")]), dispatchOptions.workers.filter((item) => item === selected || !workerSelections.includes(item)).map((item) => createVNode("option", {
      "key": item,
      "value": item
    }, [item]))]), workerSelections.length > 1 && createVNode("button", {
      "type": "button",
      "disabled": dispatchFieldsDisabled || isMergingDispatch,
      "onClick": () => setDispatchWorkers(workerSelections.filter((_, memberIndex) => memberIndex !== index)),
      "className": "rounded-lg border border-rose-300 px-3 text-rose-700"
    }, [createTextVNode("－")])])), createVNode("button", {
      "type": "button",
      "disabled": dispatchFieldsDisabled || isMergingDispatch,
      "onClick": () => setWorkerSelections([...workerSelections, ""]),
      "className": "rounded-lg border border-emerald-700 px-3 py-2 text-sm font-black text-emerald-800"
    }, [createTextVNode("＋ 新增清運人員")])])]
  }), createVNode(Field, {
    "label": "合併／新增班次"
  }, {
    default: () => [createVNode("select", {
      "disabled": dispatchFieldsDisabled,
      "value": dispatchTripChoices.some((choice) => choice.trip === Number(draft.dispatch_trip || 1)) ? Number(draft.dispatch_trip || 1) : dispatchTripChoices[dispatchTripChoices.length - 1].trip,
      "onInput": (e) => selectDispatchTrip(e.target.value)
    }, [dispatchTripChoices.map((choice) => createVNode("option", {
      "key": choice.trip,
      "value": choice.trip
    }, [choice.label]))])]
  }), createVNode(Field, {
    "label": "派車備註"
  }, {
    default: () => [createVNode("input", {
      "disabled": dispatchFieldsDisabled,
      "value": draft.dispatch_note || "",
      "onInput": (e) => setDraft({
        ...draft,
        dispatch_note: e.target.value
      })
    }, null)]
  })])]), createVNode("div", {
    "className": "flex flex-wrap gap-3"
  }, [page === "案件清單與進度" && createVNode(Fragment, null, [createVNode("button", {
    "type": "button",
    "onClick": () => {
      window.location.href = "./index.html";
    },
    "className": "rounded-xl border border-emerald-700 px-5 py-3 font-black text-emerald-800"
  }, [createTextVNode("新增案件")]), createVNode("button", {
    "disabled": loading || draft.status !== "已取消",
    "onClick": restoreCaseStatus,
    "className": "rounded-xl bg-emerald-700 px-5 py-3 font-black text-white disabled:opacity-40"
  }, [createTextVNode("恢復案件狀態")]), createVNode("button", {
    "disabled": loading,
    "onClick": deleteCase,
    "className": "rounded-xl border border-rose-300 px-5 py-3 font-black text-rose-700"
  }, [createTextVNode("刪除案件")])]), page === "待處理" && createVNode(Fragment, null, [createVNode("button", {
    "disabled": loading || !reviewApproved,
    "onClick": schedule,
    "className": "rounded-xl bg-emerald-700 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
  }, [reviewApproved ? "核可排班" : "請先完成人工核可"]), createVNode("button", {
    "disabled": loading,
    "onClick": withdrawCase,
    "className": "rounded-xl bg-rose-600 px-5 py-3 font-black text-white"
  }, [createTextVNode("撤案")]), createVNode("button", {
    "disabled": loading,
    "onClick": () => save(),
    "className": "ml-auto rounded-xl border border-emerald-700 px-5 py-3 font-black text-emerald-800"
  }, [createTextVNode("儲存調度變更")])]), page === "已排班" && createVNode(Fragment, null, [createVNode("button", {
    "disabled": loading,
    "onClick": () => {
      var _a;
      return (_a = completionInput.current) == null ? void 0 : _a.click();
    },
    "className": "rounded-xl bg-sky-700 px-5 py-3 font-black text-white disabled:opacity-40"
  }, [createTextVNode("📸 拍照結案")]), createVNode("button", {
    "disabled": loading,
    "onClick": () => save({
      status: "待處理",
      dispatch_status: "待處理"
    }, "已取消排班，案件回到待處理"),
    "className": "rounded-xl bg-amber-600 px-5 py-3 font-black text-white disabled:opacity-40"
  }, [createTextVNode("取消排班")]), createVNode("button", {
    "disabled": loading || scheduleEditing,
    "onClick": () => setScheduleEditing(true),
    "className": "rounded-xl bg-emerald-700 px-5 py-3 font-black text-white disabled:opacity-40"
  }, [createTextVNode("修改")]), scheduleEditing && createVNode("button", {
    "disabled": loading,
    "onClick": saveScheduledChanges,
    "className": "rounded-xl bg-sky-700 px-5 py-3 font-black text-white disabled:opacity-40"
  }, [createTextVNode("儲存排班變更")]), createVNode("button", {
    "disabled": loading,
    "onClick": withdrawCase,
    "className": "rounded-xl bg-rose-600 px-5 py-3 font-black text-white disabled:opacity-40"
  }, [createTextVNode("撤案")])]), page === "清運完成" && createVNode("button", {
    "type": "button",
    "onClick": () => window.print(),
    "className": "rounded-xl bg-slate-700 px-5 py-3 font-black text-white"
  }, [createTextVNode("預覽列印")]), page === "已取消" && createVNode(Fragment, null, [createVNode("button", {
    "disabled": loading,
    "onClick": restoreCaseStatus,
    "className": "rounded-xl bg-emerald-700 px-5 py-3 font-black text-white"
  }, [createTextVNode("恢復案件狀態")]), createVNode("button", {
    "disabled": loading,
    "onClick": deleteCase,
    "className": "rounded-xl border border-rose-300 px-5 py-3 font-black text-rose-700"
  }, [createTextVNode("刪除案件")])]), createVNode("input", {
    "ref": completionInput,
    "type": "file",
    "accept": "image/*",
    "multiple": true,
    "className": "hidden",
    "onInput": completeWithPhoto
  }, null)]), page === "待處理" && (!dispatchOptions.vehicles.length || !dispatchOptions.workers.length) && createVNode("p", {
    "className": "-mt-5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs font-bold text-amber-800"
  }, [createTextVNode("尚未取得可選的派車車號或清運人員。請先在桌面版「派車設定」儲存設定並確認雲端同步成功，再按網頁右上角「重新整理」。")])])])])])]);
}
function Info({
  label,
  value
}) {
  return createVNode("div", {
    "className": "rounded-xl bg-slate-50 p-3"
  }, [createVNode("p", {
    "className": "text-xs font-bold text-slate-500"
  }, [label]), createVNode("p", {
    "className": "mt-1 font-bold"
  }, [value || "—"])]);
}
function RoutePlanner({
  cases,
  vehicle,
  origin = "24.380891,120.734372",
  routeCache,
  setRouteCache
}) {
  const [stops, setStops] = useState(cases);
  const [distanceKm, setDistanceKm] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [calculating, setCalculating] = useState(false);
  const [routeMessage, setRouteMessage] = useState("");
  const fuelEfficiency = Number((vehicle == null ? void 0 : vehicle.fuel_efficiency) || 5);
  const co2PerLiter = Number((vehicle == null ? void 0 : vehicle.co2_per_liter) || 2.69);
  const routeKey = `${origin}|${cases.map((item) => item.case_no).sort().join("|")}`;
  const calculatingKey = useRef("");
  const calculateAutomatically = async (items = stops, preserveOrder = false) => {
    if (!items.length || calculatingKey.current === routeKey) return;
    calculatingKey.current = routeKey;
    setCalculating(true);
    setRouteMessage("正在定位地址並計算道路路線…");
    try {
      const result = await adminPost("calculateRoute", {
        caseNos: items.map((item) => item.case_no),
        origin,
        fuelEfficiency,
        co2PerLiter,
        preserveOrder
      });
      const byNo = Object.fromEntries(items.map((item) => [item.case_no, item]));
      setStops(result.ordered.map((item) => ({
        ...byNo[item.case_no],
        latitude: item.latitude,
        longitude: item.longitude
      })));
      setDistanceKm(Number(result.distanceKm || 0).toFixed(1));
      setDurationMinutes(Number(result.durationMinutes || 0));
      setRouteCache((old) => ({
        ...old,
        [routeKey]: {
          ...result
        }
      }));
      setRouteMessage(result.estimated ? `路線預估：${Number(result.distanceKm || 0).toFixed(1)} km／${Number(result.carbonKg || 0).toFixed(2)} kg CO₂e。${result.routeWarning || "道路路線暫時無法取得，已使用估算里程。"}` : `此班次路線${Number(result.distanceKm || 0).toFixed(1)}km／時程${Number(result.durationMinutes || 0)} 分鐘／碳排量${Number(result.carbonKg || 0).toFixed(2)} kg CO₂e`);
    } catch (error) {
      setRouteMessage(`自動計算失敗：${error.message}`);
    } finally {
      calculatingKey.current = "";
      setCalculating(false);
    }
  };
  useEffect(() => {
    const cached = routeCache[routeKey];
    if (cached) {
      const byNo = Object.fromEntries(cases.map((item) => [item.case_no, item]));
      setStops(cached.ordered.map((item) => ({
        ...byNo[item.case_no],
        latitude: item.latitude,
        longitude: item.longitude
      })));
      setDistanceKm(Number(cached.distanceKm || 0).toFixed(1));
      setDurationMinutes(Number(cached.durationMinutes || 0));
      setRouteMessage(cached.estimated ? `路線預估：${Number(cached.distanceKm || 0).toFixed(1)} km／${Number(cached.carbonKg || 0).toFixed(2)} kg CO₂e。${cached.routeWarning || ""}` : `此班次路線${Number(cached.distanceKm || 0).toFixed(1)}km／時程${Number(cached.durationMinutes || 0)} 分鐘／碳排量${Number(cached.carbonKg || 0).toFixed(2)} kg CO₂e`);
    } else {
      setStops(cases);
      calculateAutomatically(cases);
    }
  }, [routeKey]);
  const moveStop = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= stops.length) return;
    const next = [...stops];
    [next[index], next[target]] = [next[target], next[index]];
    setStops(next);
    calculateAutomatically(next, true);
  };
  const navigationUrl = stops.length ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(stops[stops.length - 1].address)}${stops.length > 1 ? `&waypoints=${encodeURIComponent(stops.slice(0, -1).map((item) => item.address).join("|"))}` : ""}` : "#";
  const stopNavigationUrl = (item) => {
    const latitude = Number(item.latitude), longitude = Number(item.longitude);
    const destination = Number.isFinite(latitude) && Number.isFinite(longitude) && !(latitude === 0 && longitude === 0) ? `${latitude},${longitude}` : item.address;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  };
  return createVNode("section", {
    "className": "rounded-2xl border border-violet-200 bg-violet-50 p-4"
  }, [createVNode("div", {
    "className": "flex flex-wrap items-center justify-between gap-3"
  }, [createVNode("h3", {
    "className": "font-black text-violet-950"
  }, [createTextVNode("路線設計與碳排估算")]), createVNode("a", {
    "href": navigationUrl,
    "target": "_blank",
    "rel": "noreferrer",
    "className": "rounded-xl bg-violet-700 px-4 py-2 text-sm font-black text-white"
  }, [createTextVNode("🧭 開啟導航")])]), routeMessage && createVNode("p", {
    "className": "mt-3 rounded-xl border border-violet-200 bg-white p-3 text-xs font-bold text-violet-900"
  }, [routeMessage]), createVNode("div", {
    "className": "mt-3 space-y-2"
  }, [stops.map((item, index) => createVNode("div", {
    "key": item.case_no,
    "className": "flex items-center gap-3 rounded-xl border border-violet-200 bg-white p-3"
  }, [createVNode("span", {
    "className": "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-700 text-sm font-black text-white"
  }, [index + 1]), createVNode("div", {
    "className": "min-w-0 flex-1"
  }, [createVNode("strong", {
    "className": "text-sm"
  }, [item.applicant]), createVNode("p", {
    "className": "truncate text-xs text-slate-500"
  }, [item.address])]), createVNode("a", {
    "href": stopNavigationUrl(item),
    "target": "_blank",
    "rel": "noreferrer",
    "className": "rounded-lg border border-violet-300 bg-violet-50 px-3 py-1.5 text-sm font-black text-violet-800"
  }, [createTextVNode("🧭 導航")]), createVNode("button", {
    "type": "button",
    "disabled": index === 0 || calculating,
    "onClick": () => moveStop(index, -1),
    "className": "rounded-lg border px-3 py-1.5 text-sm font-black disabled:opacity-30"
  }, [createTextVNode("↑")]), createVNode("button", {
    "type": "button",
    "disabled": index === stops.length - 1 || calculating,
    "onClick": () => moveStop(index, 1),
    "className": "rounded-lg border px-3 py-1.5 text-sm font-black disabled:opacity-30"
  }, [createTextVNode("↓")])]))])]);
}
function Field({
  label
}, {
  slots
}) {
  const controls = slots.default ? slots.default() : [];
  return createVNode("div", {
    "className": "dispatch-field text-xs font-bold text-slate-600"
  }, [createVNode("label", {
    "className": "block"
  }, [label]), createVNode("div", {
    "className": "dispatch-field-control mt-1"
  }, [controls])]);
}
function MinguoDateTimePicker({
  disabled,
  value,
  onCommit
}) {
  const initial2 = value && !Number.isNaN(new Date(value).getTime()) ? new Date(value) : /* @__PURE__ */ new Date();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => ({
    year: initial2.getFullYear(),
    month: initial2.getMonth()
  }));
  useEffect(() => {
    if (value && !Number.isNaN(new Date(value).getTime())) {
      const date = new Date(value);
      setView({
        year: date.getFullYear(),
        month: date.getMonth()
      });
    }
  }, [value]);
  const selected = value && !Number.isNaN(new Date(value).getTime()) ? new Date(value) : /* @__PURE__ */ new Date();
  const commit = (date) => onCommit(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`);
  const shiftMonth = (amount2) => {
    const next = new Date(view.year, view.month + amount2, 1);
    setView({
      year: next.getFullYear(),
      month: next.getMonth()
    });
  };
  const firstDay = new Date(view.year, view.month, 1).getDay();
  const days = new Date(view.year, view.month + 1, 0).getDate();
  return createVNode("div", {
    "className": "relative"
  }, [createVNode("button", {
    "type": "button",
    "disabled": disabled,
    "onClick": () => setOpen((current) => !current),
    "className": "flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left font-bold disabled:bg-slate-100"
  }, [createVNode("span", null, [value ? getMinguoTime(value) : "請選擇日期與時間"]), createVNode("span", {
    "aria-hidden": "true"
  }, [createTextVNode("📅")])]), open && createVNode("div", {
    "className": "absolute z-20 mt-1 w-80 rounded-xl border border-emerald-200 bg-white p-3 shadow-xl"
  }, [createVNode("div", {
    "className": "mb-3 flex items-center justify-between"
  }, [createVNode("button", {
    "type": "button",
    "onClick": () => shiftMonth(-1),
    "className": "rounded px-2 py-1 hover:bg-slate-100"
  }, [createTextVNode("‹")]), createVNode("div", {
    "className": "flex gap-1"
  }, [createVNode("select", {
    "value": view.year - 1911,
    "onInput": (e) => setView({
      ...view,
      year: Number(e.target.value) + 1911
    })
  }, [Array.from({
    length: 21
  }, (_, index) => (/* @__PURE__ */ new Date()).getFullYear() - 1911 - 10 + index).map((year) => createVNode("option", {
    "key": year,
    "value": year
  }, [year, createTextVNode(" 年")]))]), createVNode("select", {
    "value": view.month,
    "onInput": (e) => setView({
      ...view,
      month: Number(e.target.value)
    })
  }, [Array.from({
    length: 12
  }, (_, index) => createVNode("option", {
    "key": index,
    "value": index
  }, [index + 1, createTextVNode(" 月")]))])]), createVNode("button", {
    "type": "button",
    "onClick": () => shiftMonth(1),
    "className": "rounded px-2 py-1 hover:bg-slate-100"
  }, [createTextVNode("›")])]), createVNode("div", {
    "className": "grid grid-cols-7 text-center text-xs text-slate-500"
  }, [["日", "一", "二", "三", "四", "五", "六"].map((day) => createVNode("span", {
    "key": day,
    "className": "py-1"
  }, [day])), Array.from({
    length: firstDay
  }, (_, index) => createVNode("span", {
    "key": `blank-${index}`
  }, null)), Array.from({
    length: days
  }, (_, index) => {
    const day = index + 1;
    const active = selected.getFullYear() === view.year && selected.getMonth() === view.month && selected.getDate() === day;
    return createVNode("button", {
      "type": "button",
      "key": day,
      "onClick": () => {
        const next = new Date(selected);
        next.setFullYear(view.year, view.month, day);
        commit(next);
        setOpen(false);
      },
      "className": "m-0.5 rounded-full py-1.5 font-bold " + (active ? "bg-emerald-700 text-white" : "hover:bg-emerald-50")
    }, [day]);
  })]), createVNode("div", {
    "className": "mt-3 flex items-center gap-2 border-t pt-3 text-xs font-bold"
  }, [createVNode("span", null, [createTextVNode("時間")]), createVNode("select", {
    "value": selected.getHours(),
    "onInput": (e) => {
      const next = new Date(selected);
      next.setHours(Number(e.target.value));
      commit(next);
    }
  }, [Array.from({
    length: 24
  }, (_, hour) => createVNode("option", {
    "key": hour,
    "value": hour
  }, [String(hour).padStart(2, "0"), createTextVNode(" 時")]))]), createVNode("select", {
    "value": selected.getMinutes(),
    "onInput": (e) => {
      const next = new Date(selected);
      next.setMinutes(Number(e.target.value));
      commit(next);
    }
  }, [[0, 10, 20, 30, 40, 50].map((minute) => createVNode("option", {
    "key": minute,
    "value": minute
  }, [String(minute).padStart(2, "0"), createTextVNode(" 分")]))])])])]);
}
createApp(AdminApp).mount("#root");
