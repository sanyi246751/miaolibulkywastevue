import { u as useState, f as useEffect, b as useMemo, c as createVNode, a as createTextVNode, w as workerGet, l as prepareWorkerUploads, d as uploadSignedPhoto, m as workerPost, j as createApp } from "./registerServiceWorker-BpZ2tgbu.js";
const PIN_KEY = "worker_pin";
const formatMinguoDateTime = (value) => {
  const text = String(value || "").trim();
  const roc = text.match(/^0?(\d{2,3})\/(\d{1,2})\/(\d{1,2})(.*)$/);
  if (roc) return `${Number(roc[1])}/${Number(roc[2])}/${Number(roc[3])}${roc[4]}`;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return `${date.getFullYear() - 1911}/${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};
function WorkApp() {
  const [pin, setPin] = useState(() => sessionStorage.getItem(PIN_KEY) || "");
  const [pinInput, setPinInput] = useState("");
  const [cases, setCases] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [vehicle, setVehicle] = useState("全部");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [active, setActive] = useState(null);
  const [note, setNote] = useState("");
  const [completionPhotos, setCompletionPhotos] = useState([]);
  const load = async () => {
    setLoading(true);
    setMessage("");
    try {
      const result = await workerGet("workerList", {
        pin,
        keyword
      });
      setCases(result.cases || []);
    } catch (error) {
      setMessage(error.message);
      if (/驗證碼/.test(error.message)) logout();
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (pin) load();
  }, [pin]);
  const vehicles = useMemo(() => [...new Set(cases.map((item) => item.vehicleNo).filter(Boolean))].sort(), [cases]);
  const visible = useMemo(() => cases.filter((item) => {
    const activeStatus = ["已排班", "清運中"].includes(item.status);
    const vehicleMatch = vehicle === "全部" || item.vehicleNo === vehicle;
    const text = [item.caseNo, item.applicant, item.phone, item.address, item.wasteType, item.workerName].join(" ").toLowerCase();
    return activeStatus && vehicleMatch && text.includes(keyword.trim().toLowerCase());
  }), [cases, keyword, vehicle]);
  const login = (event) => {
    event.preventDefault();
    const value = pinInput.trim();
    if (!value) return;
    sessionStorage.setItem(PIN_KEY, value);
    setPin(value);
    setPinInput("");
  };
  const logout = () => {
    sessionStorage.removeItem(PIN_KEY);
    setPin("");
    setCases([]);
  };
  const submit = async () => {
    if (!active) return;
    if (!completionPhotos.length) {
      setMessage("拍照結案至少需要一張現場完成照片");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const files = await Promise.all(completionPhotos.map((file, index) => prepareCompletionPhoto(file, index, active.caseNo)));
      const uploadSession = await prepareWorkerUploads({
        pin,
        caseId: active.caseId || active.id || active.caseNo,
        photos: files.map((file) => ({
          mimeType: file.mimeType,
          size: file.file.size
        }))
      });
      await Promise.all(uploadSession.uploads.map((upload, index) => uploadSignedPhoto(upload.signedUrl, files[index].file, files[index].mimeType)));
      await workerPost("completeWithPhoto", {
        id: active.caseId || active.id || active.caseNo,
        pin,
        note: note.trim() || "隊員已現場載運完畢並拍照結案",
        stagedPhotoPaths: uploadSession.uploads.map((upload) => upload.path)
      });
      setActive(null);
      setNote("");
      setCompletionPhotos([]);
      setMessage(`案件 ${active.caseNo} 已更新為「清運完成」`);
      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };
  if (!pin) return createVNode("div", {
    "className": "min-h-screen bg-emerald-950 px-5 py-14"
  }, [createVNode("form", {
    "onSubmit": login,
    "className": "mx-auto max-w-sm rounded-3xl bg-white p-8 shadow-2xl"
  }, [createVNode("p", {
    "className": "text-sm font-bold text-emerald-700"
  }, [createTextVNode("三義鄉巨大廢棄物")]), createVNode("h1", {
    "className": "mt-2 text-2xl font-black"
  }, [createTextVNode("工作端登入")]), createVNode("p", {
    "className": "mt-2 text-sm text-slate-500"
  }, [createTextVNode("請輸入工作人員驗證碼。")]), createVNode("input", {
    "autoFocus": true,
    "required": true,
    "type": "password",
    "inputMode": "numeric",
    "value": pinInput,
    "onInput": (e) => setPinInput(e.target.value),
    "placeholder": "WORKER PIN",
    "className": "mt-6 w-full rounded-xl border border-slate-300 px-4 py-3"
  }, null), createVNode("button", {
    "className": "mt-4 w-full rounded-xl bg-emerald-700 py-3 font-black text-white"
  }, [createTextVNode("登入工作端")])])]);
  return createVNode("div", {
    "className": "min-h-screen bg-slate-100 pb-20 text-slate-900"
  }, [createVNode("header", {
    "className": "sticky top-0 z-20 bg-emerald-950 px-4 py-4 text-white shadow"
  }, [createVNode("div", {
    "className": "mx-auto flex max-w-4xl items-center justify-between"
  }, [createVNode("div", null, [createVNode("h1", {
    "className": "text-lg font-black"
  }, [createTextVNode("清運工作端")]), createVNode("p", {
    "className": "text-xs text-emerald-200"
  }, [createTextVNode("已排班與清運中案件")])]), createVNode("div", {
    "className": "flex gap-2"
  }, [createVNode("button", {
    "onClick": load,
    "disabled": loading,
    "className": "rounded-xl bg-white/10 px-3 py-2 text-sm font-bold"
  }, [createTextVNode("重新整理")]), createVNode("button", {
    "onClick": logout,
    "className": "rounded-xl bg-white/10 px-3 py-2 text-sm font-bold"
  }, [createTextVNode("登出")])])])]), createVNode("main", {
    "className": "mx-auto max-w-4xl p-4"
  }, [createVNode("section", {
    "className": "grid gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-[1fr_180px]"
  }, [createVNode("input", {
    "value": keyword,
    "onInput": (e) => setKeyword(e.target.value),
    "placeholder": "搜尋案件、姓名、地址或班組",
    "className": "rounded-xl border border-slate-300 px-3 py-2.5"
  }, null), createVNode("select", {
    "value": vehicle,
    "onInput": (e) => setVehicle(e.target.value),
    "className": "rounded-xl border border-slate-300 px-3 py-2.5"
  }, [createVNode("option", null, [createTextVNode("全部")]), vehicles.map((item) => createVNode("option", {
    "key": item
  }, [item]))])]), message && createVNode("div", {
    "className": "mt-3 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800"
  }, [message]), createVNode("p", {
    "className": "mt-5 text-sm font-bold text-slate-500"
  }, [createTextVNode("待執行 "), visible.length, createTextVNode(" 件")]), createVNode("section", {
    "className": "mt-3 grid gap-4 md:grid-cols-2"
  }, [visible.map((item) => createVNode("article", {
    "key": item.caseNo,
    "className": "rounded-2xl bg-white p-5 shadow-sm"
  }, [createVNode("div", {
    "className": "flex items-start justify-between gap-3"
  }, [createVNode("div", null, [createVNode("p", {
    "className": "font-mono text-xs font-bold text-slate-500"
  }, [item.caseNo]), createVNode("h2", {
    "className": "mt-1 text-xl font-black"
  }, [item.applicant])]), createVNode("span", {
    "className": "rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800"
  }, [item.status])]), createVNode("p", {
    "className": "mt-4 text-sm leading-6"
  }, [item.address]), createVNode("div", {
    "className": "mt-3 grid grid-cols-2 gap-2 text-sm"
  }, [createVNode(Info, {
    "label": "申報內容",
    "value": `${item.wasteType}｜${item.quantity} 件`
  }, null), createVNode(Info, {
    "label": "排班",
    "value": formatMinguoDateTime(item.scheduledAt) || "未填寫"
  }, null), createVNode(Info, {
    "label": "車號",
    "value": item.vehicleNo || "未填寫"
  }, null), createVNode(Info, {
    "label": "班組",
    "value": item.workerName || "未填寫"
  }, null)]), createVNode("div", {
    "className": "mt-4 grid grid-cols-2 gap-2"
  }, [createVNode("a", {
    "href": `tel:${item.phone}`,
    "className": "rounded-xl border border-sky-200 py-3 text-center text-sm font-black text-sky-700"
  }, [createTextVNode("聯絡民眾")]), createVNode("a", {
    "target": "_blank",
    "rel": "noreferrer",
    "href": `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.address)}`,
    "className": "rounded-xl border border-emerald-200 py-3 text-center text-sm font-black text-emerald-700"
  }, [createTextVNode("開啟導航")])]), createVNode("button", {
    "onClick": () => {
      setActive(item);
      setNote(item.reportNote || "");
      setCompletionPhotos([]);
    },
    "className": "mt-2 w-full rounded-xl bg-emerald-700 py-3 font-black text-white"
  }, [createTextVNode("拍照結案")])])), !loading && !visible.length && createVNode("div", {
    "className": "col-span-full rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center text-sm font-bold text-slate-400"
  }, [createTextVNode("目前沒有符合條件的清運案件")])])]), active && createVNode("div", {
    "className": "fixed inset-0 z-50 flex items-end bg-slate-950/60 sm:items-center sm:justify-center"
  }, [createVNode("div", {
    "className": "w-full rounded-t-3xl bg-white p-6 sm:max-w-lg sm:rounded-3xl"
  }, [createVNode("h2", {
    "className": "text-xl font-black"
  }, [createTextVNode("更新作業回報")]), createVNode("p", {
    "className": "mt-1 text-sm text-slate-500"
  }, [active.caseNo, createTextVNode("｜"), active.applicant]), createVNode("label", {
    "className": "mt-4 block rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-4 text-sm font-black text-emerald-900"
  }, [createTextVNode("拍照結案 "), createVNode("span", {
    "className": "text-rose-600"
  }, [createTextVNode("*")]), createVNode("input", {
    "type": "file",
    "accept": "image/*",
    "capture": "environment",
    "multiple": true,
    "onInput": (e) => setCompletionPhotos([...e.target.files].filter((file) => file.type.startsWith("image/")).slice(0, 2)),
    "className": "mt-3 block w-full text-sm font-normal"
  }, null), createVNode("p", {
    "className": "mt-2 text-xs font-bold text-emerald-800"
  }, [createTextVNode("請拍攝現場完成照片（至少 1 張，最多 2 張）。")]), completionPhotos.length > 0 && createVNode("p", {
    "className": "mt-2 text-xs font-bold text-emerald-800"
  }, [createTextVNode("已選取 "), completionPhotos.length, createTextVNode(" 張："), completionPhotos.map((file) => file.name).join("、")])]), createVNode("label", {
    "className": "mt-4 block text-sm font-bold"
  }, [createTextVNode("作業回報備註"), createVNode("textarea", {
    "rows": "4",
    "value": note,
    "onInput": (e) => setNote(e.target.value),
    "placeholder": "可填寫現場情況或完成說明",
    "className": "mt-1 w-full rounded-xl border border-slate-300 p-3 font-normal"
  }, null)]), createVNode("div", {
    "className": "mt-5 grid grid-cols-2 gap-3"
  }, [createVNode("button", {
    "onClick": () => {
      setActive(null);
      setCompletionPhotos([]);
    },
    "className": "rounded-xl border border-slate-300 py-3 font-black text-slate-600"
  }, [createTextVNode("返回")]), createVNode("button", {
    "disabled": loading,
    "onClick": submit,
    "className": "rounded-xl bg-emerald-700 py-3 font-black text-white disabled:opacity-50"
  }, [createTextVNode("上傳照片並結案")])])])])]);
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
  }, [value])]);
}
async function prepareCompletionPhoto(file, index, caseNo) {
  const image = await createImageBitmap(file);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
  const output = blob || file;
  return {
    file: output,
    fileName: `${caseNo}-finish-${index + 1}.jpg`,
    mimeType: "image/jpeg"
  };
}
createApp(WorkApp).mount("#root");
