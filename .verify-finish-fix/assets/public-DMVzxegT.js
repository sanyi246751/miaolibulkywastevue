import { c as createVNode, F as Fragment, a as createTextVNode, g as useRef, f as useEffect, u as useState, G as GAS_URL, p as preparePublicUploads, d as uploadSignedPhoto, k as createPublicCase, q as queryCase, j as createApp } from "./registerServiceWorker-BpZ2tgbu.js";
import { M as MinguoDatePicker, T as TERMS_LIST, c as getMinguoTime, f as formatTaiwanPhone, b as formatMinguoDate, D as DISTRICTS_BY_COUNTY, C as COUNTIES, a as CATEGORIES, g as getUnavailableBookingReason } from "./MinguoDatePicker-DbsmuONf.js";
function Header(props) {
  const {
    activeTab,
    setActiveTab
  } = props;
  return createVNode(Fragment, null, [createVNode("header", {
    "className": "sticky top-0 z-40 border-b border-emerald-900/10 bg-white/90 text-slate-800 shadow-[0_8px_30px_-24px_rgba(6,78,59,.45)] backdrop-blur-xl no-print"
  }, [createVNode("div", {
    "className": "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
  }, [createVNode("div", {
    "className": "flex min-h-16 items-center justify-between gap-2 py-2 sm:min-h-20 sm:gap-3 sm:py-3"
  }, [createVNode("button", {
    "className": "group flex min-w-0 items-center gap-3 text-left",
    "onClick": () => setActiveTab("booking"),
    "aria-label": "回到線上預約首頁"
  }, [createVNode("span", {
    "className": "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-lg text-white shadow-lg transition-transform group-hover:-translate-y-0.5 sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl"
  }, [createTextVNode("🚚")]), createVNode("span", {
    "className": "min-w-0"
  }, [createVNode("span", {
    "className": "truncate text-base font-black tracking-tight text-emerald-950 sm:text-xl"
  }, [createTextVNode("大型傢俱清運")]), createVNode("span", {
    "className": "mt-0.5 hidden text-xs font-medium text-slate-400 sm:block"
  }, [createTextVNode("民眾線上申請、進度查詢與清運管理")])])]), createVNode("nav", {
    "className": "flex shrink-0 items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1",
    "aria-label": "市民服務"
  }, [[["booking", "📝", "線上預約"], ["query", "🔍", "進度查詢"]].map(([id, icon, label]) => createVNode("button", {
    "key": id,
    "onClick": () => setActiveTab(id),
    "aria-current": activeTab === id ? "page" : void 0,
    "className": "flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold transition-all sm:px-4 " + (activeTab === id ? "bg-emerald-700 text-white shadow-md shadow-emerald-900/10" : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800")
  }, [createVNode("span", null, [icon]), createVNode("span", {
    "className": "hidden sm:inline"
  }, [label])]))])])])])]);
}
function BookingView(props) {
  const {
    activeTab,
    applicantName,
    setApplicantName,
    phone,
    setPhone,
    email,
    setEmail,
    county,
    setCounty,
    district,
    setDistrict,
    detailAddress,
    setDetailAddress,
    selectedItems,
    photos,
    setPhotos,
    preferredDate,
    setPreferredDate,
    getUnavailableBookingReason: getUnavailableBookingReason2,
    preferredTimeSlot,
    setPreferredTimeSlot,
    locationNote,
    setLocationNote,
    setAgreedTerms,
    errors,
    setErrors,
    isSubmitting,
    submitSecondsLeft,
    handleItemQtyChange,
    getItemQty,
    getItemNote,
    handleItemNoteChange,
    handleFileUpload,
    isAllTermsAgreed,
    handleFormSubmit,
    CATEGORIES: CATEGORIES2,
    COUNTIES: COUNTIES2,
    DISTRICTS_BY_COUNTY: DISTRICTS_BY_COUNTY2,
    TERMS_LIST: TERMS_LIST2,
    formatMinguoDate: formatMinguoDate2,
    formatTaiwanPhone: formatTaiwanPhone2
  } = props;
  const today = /* @__PURE__ */ new Date();
  const minBookingDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return createVNode(Fragment, null, [activeTab === "booking" && createVNode("form", {
    "onSubmit": handleFormSubmit,
    "className": "max-w-4xl mx-auto space-y-5 sm:space-y-8"
  }, [Object.keys(errors).length > 0 && createVNode("div", {
    "className": "p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs space-y-1"
  }, [createVNode("strong", {
    "className": "text-sm block"
  }, [createTextVNode("⚠️ 請修正以下未填寫或格式不符欄位：")]), createVNode("ul", {
    "className": "list-disc list-inside"
  }, [Object.values(errors).map((e, idx) => createVNode("li", {
    "key": idx
  }, [e]))])]), createVNode("div", {
    "className": "glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-6"
  }, [createVNode("div", null, [createVNode("h3", {
    "className": "text-lg font-bold text-slate-100 flex items-center"
  }, [createVNode("span", {
    "className": "w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mr-2 text-sm border border-emerald-500/30"
  }, [createTextVNode("1")]), createTextVNode("申請人基本資料")]), createVNode("p", {
    "className": "text-xs text-slate-400 mt-1 ml-10"
  }, [createTextVNode("標記 "), createVNode("span", {
    "className": "text-rose-400 font-bold"
  }, [createTextVNode("*")]), createTextVNode(" 為必填欄位")])]), createVNode("div", {
    "className": "grid grid-cols-1 sm:grid-cols-2 gap-5"
  }, [createVNode("div", null, [createVNode("label", {
    "className": "block text-xs font-bold text-slate-300 mb-1"
  }, [createTextVNode("申請人姓名 "), createVNode("span", {
    "className": "text-rose-400"
  }, [createTextVNode("*")])]), createVNode("input", {
    "type": "text",
    "placeholder": "請輸入姓名 (例: 王大明)",
    "value": applicantName,
    "onInput": (e) => setApplicantName(e.target.value),
    "className": "w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
  }, null)]), createVNode("div", null, [createVNode("label", {
    "className": "block text-xs font-bold text-slate-300 mb-1"
  }, [createTextVNode("行動電話 / 聯絡電話 "), createVNode("span", {
    "className": "text-rose-400"
  }, [createTextVNode("*")])]), createVNode("input", {
    "type": "tel",
    "placeholder": "0912-345678 或 037-123456",
    "value": phone,
    "onInput": (e) => setPhone(e.target.value),
    "onBlur": () => setPhone(formatTaiwanPhone2(phone)),
    "className": "w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
  }, null)]), createVNode("div", {
    "className": "sm:col-span-2"
  }, [createVNode("label", {
    "className": "block text-xs font-bold text-slate-300 mb-1"
  }, [createTextVNode("電子郵件 Email (選填)")]), createVNode("input", {
    "type": "email",
    "placeholder": "example@mail.com",
    "value": email,
    "onInput": (e) => setEmail(e.target.value),
    "className": "w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
  }, null)]), createVNode("div", {
    "className": "sm:col-span-2 grid grid-cols-1 sm:grid-cols-4 gap-3"
  }, [createVNode("div", null, [createVNode("label", {
    "className": "block text-xs font-bold text-slate-300 mb-1"
  }, [createTextVNode("縣市 "), createVNode("span", {
    "className": "text-rose-400"
  }, [createTextVNode("*")])]), createVNode("select", {
    "value": county,
    "onInput": (e) => {
      const next = e.target.value;
      setCounty(next);
      setDistrict(DISTRICTS_BY_COUNTY2[next][0]);
    },
    "className": "w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
  }, [COUNTIES2.map((c) => createVNode("option", {
    "key": c,
    "value": c
  }, [c]))])]), createVNode("div", null, [createVNode("label", {
    "className": "block text-xs font-bold text-slate-300 mb-1"
  }, [createTextVNode("行政區域 "), createVNode("span", {
    "className": "text-rose-400"
  }, [createTextVNode("*")])]), createVNode("select", {
    "value": district,
    "onInput": (e) => setDistrict(e.target.value),
    "className": "w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
  }, [DISTRICTS_BY_COUNTY2[county].map((d) => createVNode("option", {
    "key": d,
    "value": d
  }, [d]))])]), createVNode("div", {
    "className": "sm:col-span-2"
  }, [createVNode("label", {
    "className": "block text-xs font-bold text-slate-300 mb-1"
  }, [createTextVNode("詳細清運地址 "), createVNode("span", {
    "className": "text-rose-400"
  }, [createTextVNode("*")])]), createVNode("input", {
    "type": "text",
    "placeholder": "例如: 廣盛村復興路69號",
    "value": detailAddress,
    "onInput": (e) => setDetailAddress(e.target.value),
    "className": "w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
  }, null)])])])]), createVNode("div", {
    "className": "glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-6"
  }, [createVNode("div", {
    "className": "flex items-center justify-between"
  }, [createVNode("h3", {
    "className": "text-lg font-bold text-slate-100 flex items-center"
  }, [createVNode("span", {
    "className": "w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mr-2 text-sm border border-emerald-500/30"
  }, [createTextVNode("2")]), createTextVNode("清運項目及數量選擇")]), createVNode("span", {
    "className": "text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
  }, [createTextVNode("已選總數: "), selectedItems.reduce((acc, cur) => acc + cur.quantity, 0), createTextVNode(" 件｜每戶每年最多 3 次、合計 6 件免費；超過額度每件 200 元")])]), createVNode("div", {
    "className": "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
  }, [CATEGORIES2.map((cat) => {
    const qty = getItemQty(cat.id);
    const isSelected = qty > 0;
    return createVNode("div", {
      "key": cat.id,
      "className": `rounded-2xl border p-6 transition-all ${isSelected ? "border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-300" : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm"}`
    }, [createVNode("div", {
      "className": "flex items-start gap-4"
    }, [createVNode("span", {
      "className": "mt-0.5 text-3xl"
    }, [cat.icon]), createVNode("div", null, [createVNode("h4", {
      "className": "text-xl font-black text-slate-950"
    }, [cat.name]), createVNode("p", {
      "className": "mt-1 text-base leading-snug text-slate-500"
    }, [cat.desc])])]), createVNode("div", {
      "className": "mt-4 flex items-center justify-end gap-3"
    }, [createVNode("span", {
      "className": "text-base font-bold text-slate-700"
    }, [createTextVNode("選擇數量：")]), createVNode("div", {
      "className": "flex items-center gap-3"
    }, [createVNode("button", {
      "type": "button",
      "onClick": () => handleItemQtyChange(cat.id, -1),
      "disabled": qty === 0,
      "aria-label": `減少${cat.name}數量`,
      "className": "h-8 w-10 rounded-md bg-slate-200 text-base font-bold text-slate-900 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
    }, [createTextVNode("−")]), createVNode("span", {
      "className": "w-4 text-center text-base font-black text-slate-950"
    }, [qty]), createVNode("button", {
      "type": "button",
      "onClick": () => handleItemQtyChange(cat.id, 1),
      "aria-label": `增加${cat.name}數量`,
      "className": "h-8 w-10 rounded-md bg-emerald-700 text-lg font-light text-white transition hover:bg-emerald-800"
    }, [createTextVNode("＋")])])]), isSelected && cat.id === "other" && createVNode("input", {
      "type": "text",
      "value": getItemNote(cat.id),
      "onInput": (e) => handleItemNoteChange(cat.id, e.target.value),
      "placeholder": "請填寫其他清運項目內容",
      "className": "mt-4 w-full rounded-lg border border-emerald-400 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400"
    }, null)]);
  })])]), createVNode("div", {
    "className": "glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-4"
  }, [createVNode("div", {
    "className": "flex items-center justify-between"
  }, [createVNode("h3", {
    "className": "text-lg font-bold text-slate-100 flex items-center"
  }, [createVNode("span", {
    "className": "w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mr-2 text-sm border border-emerald-500/30"
  }, [createTextVNode("3")]), createTextVNode("上傳待清運照片數張")]), createVNode("span", {
    "className": "text-xs text-slate-400"
  }, [createTextVNode("已上傳 "), createVNode("strong", {
    "className": "text-emerald-400"
  }, [photos.length]), createTextVNode(" 張")])]), createVNode("input", {
    "type": "file",
    "accept": "image/*",
    "multiple": true,
    "onInput": handleFileUpload,
    "className": "hidden",
    "id": "photo-input"
  }, null), createVNode("div", {
    "className": "grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2"
  }, [photos.map((p) => createVNode("div", {
    "key": p.id,
    "className": "relative rounded-xl overflow-hidden bg-slate-900 border border-slate-700 group"
  }, [createVNode("img", {
    "src": p.url,
    "className": "w-full h-24 object-cover"
  }, null), createVNode("button", {
    "type": "button",
    "onClick": () => setPhotos(photos.filter((i) => i.id !== p.id)),
    "className": "absolute top-1 right-1 p-1 rounded-full bg-slate-950/80 text-rose-400"
  }, [createTextVNode("✕")]), createVNode("span", {
    "className": "block p-1 text-[10px] truncate text-slate-300 bg-slate-950/80"
  }, [p.name])])), createVNode("label", {
    "htmlFor": "photo-input",
    "className": "h-24 rounded-xl border-2 border-dashed border-emerald-500/50 bg-slate-900/40 hover:bg-emerald-500/10 cursor-pointer flex flex-col items-center justify-center gap-1 transition-all"
  }, [createVNode("span", {
    "className": "text-xl"
  }, [createTextVNode("📷")]), createVNode("span", {
    "className": "text-xs font-bold text-slate-200"
  }, [createTextVNode("上傳照片")]), createVNode("span", {
    "className": "text-[10px] text-slate-400"
  }, [createTextVNode("可選多張")])])])]), createVNode("div", {
    "className": "glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-6"
  }, [createVNode("h3", {
    "className": "text-lg font-bold text-slate-100 flex items-center"
  }, [createVNode("span", {
    "className": "w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mr-2 text-sm border border-emerald-500/30"
  }, [createTextVNode("4")]), createTextVNode("希望清運時間與放置地點說明")]), createVNode("div", {
    "className": "grid grid-cols-1 sm:grid-cols-2 gap-5"
  }, [createVNode("div", null, [createVNode("label", {
    "className": "block text-xs font-bold text-slate-300 mb-1"
  }, [createTextVNode("希望清運日期")]), createVNode(MinguoDatePicker, {
    "min": minBookingDate,
    "value": preferredDate,
    "setSelectedDate": (nextDate) => {
      const reason = getUnavailableBookingReason2(nextDate);
      if (reason) {
        setErrors((current) => ({
          ...current,
          preferredDate: reason
        }));
        return;
      }
      setPreferredDate(nextDate);
      setErrors((current) => ({
        ...current,
        preferredDate: ""
      }));
    },
    "className": `flex w-full items-center justify-between bg-slate-900 border rounded-xl px-4 py-2.5 text-sm text-slate-100 ${errors.preferredDate ? "border-rose-500" : "border-slate-700"}`
  }, null), createVNode("p", {
    "className": "mt-1 text-[11px] text-slate-400"
  }, [createTextVNode("民國日期："), formatMinguoDate2(preferredDate), createTextVNode("；例假日及國定假日不開放預約。")]), errors.preferredDate && createVNode("p", {
    "className": "mt-1 text-[11px] font-bold text-rose-400"
  }, [errors.preferredDate])]), createVNode("div", null, [createVNode("label", {
    "className": "block text-xs font-bold text-slate-300 mb-1"
  }, [createTextVNode("希望清運時段")]), createVNode("select", {
    "value": preferredTimeSlot,
    "onInput": (e) => setPreferredTimeSlot(e.target.value),
    "className": "w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100"
  }, [createVNode("option", {
    "value": "上午8點至12點"
  }, [createTextVNode("上午8點至12點")]), createVNode("option", {
    "value": "下午1點至5點"
  }, [createTextVNode("下午1點至5點")])])]), createVNode("div", {
    "className": "sm:col-span-2"
  }, [createVNode("label", {
    "className": "block text-xs font-bold text-slate-300 mb-1"
  }, [createTextVNode("放置地點詳細說明")]), createVNode("textarea", {
    "rows": 2,
    "placeholder": "例如: 放在一樓社區後門消防通道旁，避免阻礙交通",
    "value": locationNote,
    "onInput": (e) => setLocationNote(e.target.value),
    "className": "w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100"
  }, null)])])]), createVNode("div", {
    "className": "glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-5"
  }, [createVNode("div", null, [createVNode("h3", {
    "className": "text-lg font-bold text-slate-100 flex items-center"
  }, [createVNode("span", {
    "className": "w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mr-2 text-sm border border-emerald-500/30"
  }, [createTextVNode("5")]), createTextVNode("申請聲明與同意事項 (必填)")]), createVNode("p", {
    "className": "text-xs text-slate-400 mt-1 ml-10"
  }, [createTextVNode("送出申請前，請確認服務範圍、年度免費額度、計費及物品放置規定，並完整閱讀後勾選同意。")])]), createVNode("div", {
    "className": "overflow-x-auto rounded-xl border border-slate-700/60"
  }, [createVNode("table", {
    "className": "w-full min-w-[640px] text-left text-xs"
  }, [createVNode("thead", {
    "className": "bg-emerald-50 text-emerald-900"
  }, [createVNode("tr", null, [createVNode("th", {
    "className": "w-14 px-4 py-3 text-center font-bold"
  }, [createTextVNode("項次")]), createVNode("th", {
    "className": "w-44 px-4 py-3 font-bold"
  }, [createTextVNode("聲明事項")]), createVNode("th", {
    "className": "px-4 py-3 font-bold"
  }, [createTextVNode("內容說明")])])]), createVNode("tbody", {
    "className": "divide-y divide-slate-800"
  }, [TERMS_LIST2.map((t) => createVNode("tr", {
    "key": t.id,
    "className": "align-top"
  }, [createVNode("td", {
    "className": "px-4 py-3 text-center font-black text-emerald-700"
  }, [t.id]), createVNode("td", {
    "className": "px-4 py-3 font-bold text-slate-200"
  }, [t.title]), createVNode("td", {
    "className": "px-4 py-3 leading-relaxed text-slate-300"
  }, [t.content])]))])])]), createVNode("button", {
    "type": "button",
    "role": "checkbox",
    "aria-checked": isAllTermsAgreed,
    "onClick": () => setAgreedTerms(isAllTermsAgreed ? [] : TERMS_LIST2.map((t) => t.id)),
    "className": `flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${isAllTermsAgreed ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-800" : "border-slate-700/60 bg-white/60 text-slate-700 hover:border-emerald-400"}`
  }, [createVNode("span", {
    "className": "text-lg font-bold text-emerald-600"
  }, [isAllTermsAgreed ? "☑" : "☐"]), createVNode("span", {
    "className": "text-sm font-bold"
  }, [createTextVNode("我已詳讀並同意配合以上事項 (閱讀後，請勾選)")])])]), createVNode("div", {
    "className": "flex justify-end"
  }, [createVNode("button", {
    "type": "submit",
    "disabled": isSubmitting,
    "className": "w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-base shadow-xl hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center justify-center space-x-2 disabled:cursor-wait disabled:opacity-70"
  }, [createVNode("span", null, [isSubmitting ? `⏳ 送出處理中${photos.length > 0 && submitSecondsLeft > 0 ? `，預估還有 ${submitSecondsLeft} 秒` : "…"}` : "✅ 送出大型廢棄傢俱預約清運申請"])])])])]);
}
function BookingQueryView(props) {
  const {
    activeTab,
    formatMinguoDate: formatMinguoDate2,
    getMinguoTime: getMinguoTime2,
    setPrintableBooking,
    searchQuery,
    setSearchQuery,
    searchPhone,
    setSearchPhone,
    searchResults,
    hasSearched,
    handleSearchSubmit
  } = props;
  return createVNode(Fragment, null, [activeTab === "query" && createVNode("div", {
    "className": "max-w-4xl mx-auto space-y-8"
  }, [createVNode("div", {
    "className": "glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-2xl space-y-6"
  }, [createVNode("h2", {
    "className": "text-2xl font-black text-white"
  }, [createTextVNode("🔍 廢棄傢俱預約進度查詢")]), createVNode("form", {
    "onSubmit": handleSearchSubmit,
    "className": "grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
  }, [createVNode("input", {
    "type": "text",
    "placeholder": "案件編號（如 1150902001）",
    "value": searchQuery,
    "onInput": (e) => setSearchQuery(e.target.value),
    "className": "flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100"
  }, null), createVNode("input", {
    "type": "tel",
    "placeholder": "申請時的完整聯絡電話",
    "value": searchPhone,
    "onInput": (e) => setSearchPhone(e.target.value),
    "className": "bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100"
  }, null), createVNode("button", {
    "type": "submit",
    "className": "w-full px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm sm:w-auto"
  }, [createTextVNode("查詢")])]), createVNode("p", {
    "className": "text-[11px] text-slate-400"
  }, [createTextVNode("為保護個人資料，必須同時輸入案件編號與申請時的完整聯絡電話。")])]), hasSearched && createVNode("div", {
    "className": "space-y-4"
  }, [createVNode("h3", {
    "className": "text-lg font-bold"
  }, [createTextVNode("查詢結果 ("), searchResults.length, createTextVNode(" 筆)")]), searchResults.map((b) => {
    var _a, _b;
    return createVNode("div", {
      "key": b.id,
      "className": "glass-card rounded-2xl p-6 border border-slate-700 shadow-xl space-y-4"
    }, [createVNode("div", {
      "className": "flex justify-between items-center pb-3 border-b border-slate-700"
    }, [createVNode("div", null, [createVNode("span", {
      "className": "text-lg font-mono font-black text-emerald-400"
    }, [b.id]), createVNode("span", {
      "className": "ml-3 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
    }, [b.status])]), createVNode("button", {
      "onClick": () => setPrintableBooking(b),
      "className": "px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs font-bold border border-emerald-500/30"
    }, [createTextVNode("🖨️ 列印標籤/QR Code")])]), createVNode("div", {
      "className": "grid grid-cols-1 gap-3 text-xs sm:grid-cols-2"
    }, [createVNode("div", null, [createVNode("span", {
      "className": "text-slate-400"
    }, [createTextVNode("查詢電話：")]), createVNode("strong", null, [b.phone])]), createVNode("div", null, [createVNode("span", {
      "className": "text-slate-400"
    }, [createTextVNode("希望日期：")]), createVNode("strong", null, [formatMinguoDate2(b.preferredDate), createTextVNode(" ("), String(b.preferredTimeSlot || "未指定").split(" ")[0], createTextVNode(")")])]), createVNode("div", {
      "className": "col-span-2"
    }, [createVNode("span", {
      "className": "text-slate-400"
    }, [createTextVNode("地址：")]), createVNode("strong", null, [b.address])]), createVNode("div", {
      "className": "col-span-2"
    }, [createVNode("span", {
      "className": "text-slate-400"
    }, [createTextVNode("品項：")]), createVNode("strong", {
      "className": "text-emerald-400"
    }, [b.itemsChinese || ((_a = b.items) == null ? void 0 : _a.map((i) => `${i.name}x${i.quantity}`).join(", "))])])]), createVNode("div", {
      "className": "pt-2 border-t border-slate-800 space-y-2"
    }, [createVNode("span", {
      "className": "text-xs font-bold text-slate-400"
    }, [createTextVNode("處理時間軸：")]), (_b = b.statusTimeline) == null ? void 0 : _b.map((t, idx) => createVNode("div", {
      "key": idx,
      "className": "text-xs text-slate-300 flex items-start space-x-2"
    }, [createVNode("span", {
      "className": "text-emerald-400"
    }, [createTextVNode("•")]), createVNode("div", null, [createVNode("span", {
      "className": "font-bold"
    }, [t.status]), createTextVNode(" ("), getMinguoTime2(t.time), createTextVNode(")"), t.note && createVNode("p", {
      "className": "text-slate-400 text-[11px]"
    }, [t.note]), t.drivePhotoUrl && createVNode("div", {
      "className": "mt-1 space-y-1"
    }, [createVNode("span", {
      "className": "text-amber-400 text-[11px] font-bold block"
    }, [createTextVNode("📷 清潔隊現場結案照：")]), createVNode("div", {
      "className": "flex items-center space-x-2"
    }, [createVNode("img", {
      "src": t.drivePhotoUrl,
      "className": "w-24 h-24 object-cover rounded border border-slate-700 shadow"
    }, null), createVNode("a", {
      "href": t.drivePhotoUrl,
      "target": "_blank",
      "rel": "noopener noreferrer",
      "className": "px-3 py-1 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500 hover:text-slate-950 text-xs font-bold border border-teal-500/30 transition-all inline-flex items-center space-x-1"
    }, [createVNode("span", null, [createTextVNode("🔗 在 Google Drive 開啟照片")])])])])])]))])]);
  })])])]);
}
function BookingSuccessModal(props) {
  var _a;
  const {
    setActiveTab,
    formatMinguoDate: formatMinguoDate2,
    setPrintableBooking,
    gasUrl,
    successBooking,
    setSuccessBooking
  } = props;
  return createVNode(Fragment, null, [successBooking && createVNode("div", {
    "className": "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
  }, [createVNode("div", {
    "className": "w-full max-w-lg bg-slate-900 rounded-3xl border border-emerald-500/40 p-6 space-y-4 text-center"
  }, [createVNode("div", {
    "className": "w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 text-3xl flex items-center justify-center mx-auto"
  }, [createTextVNode("✅")]), createVNode("h3", {
    "className": "text-2xl font-black text-white"
  }, [createTextVNode("大型廢棄傢俱預約成功！")]), createVNode("p", {
    "className": "text-xs text-slate-300"
  }, [createTextVNode("預約單號："), createVNode("strong", {
    "className": "text-emerald-400 font-mono text-lg"
  }, [successBooking.id])]), gasUrl && createVNode("p", {
    "className": "text-[11px] text-emerald-300"
  }, [createTextVNode("雲端同步狀態：已自動同步寫入至您的 Google 試算表！")]), createVNode("div", {
    "className": "success-summary bg-slate-950 p-4 rounded-xl text-left text-xs space-y-1 text-white border border-slate-800"
  }, [createVNode("p", null, [createVNode("strong", null, [createTextVNode("希望清運日期：")]), formatMinguoDate2(successBooking.preferredDate), createTextVNode(" ("), successBooking.preferredTimeSlot.split(" ")[0], createTextVNode(")")]), createVNode("p", null, [createVNode("strong", null, [createTextVNode("一樓放置地點：")]), successBooking.address]), createVNode("p", null, [createVNode("strong", null, [createTextVNode("清運品項：")]), (_a = successBooking.items) == null ? void 0 : _a.map((i) => `${i.name}x${i.quantity}`).join("、")])]), createVNode("button", {
    "onClick": () => {
      setPrintableBooking(successBooking);
      setSuccessBooking(null);
    },
    "className": "w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm"
  }, [createTextVNode("🖨️ 立即列印「已預約清運標籤」與 QR Code")]), createVNode("button", {
    "onClick": () => {
      setSuccessBooking(null);
      setActiveTab("booking");
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    },
    "className": "text-xs font-bold text-emerald-300"
  }, [createTextVNode("回到申請頁面")])])])]);
}
function PrintableTagModal(props) {
  var _a;
  const {
    formatMinguoDate: formatMinguoDate2,
    setPrintableBooking,
    printableBooking,
    QRCodeBox: QRCodeBox2
  } = props;
  return createVNode(Fragment, null, [printableBooking && createVNode("div", {
    "className": "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
  }, [createVNode("div", {
    "className": "w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-700 p-6 space-y-4 max-h-[90vh] overflow-y-auto"
  }, [createVNode("div", {
    "className": "flex justify-between items-center border-b border-slate-800 pb-3"
  }, [createVNode("h3", {
    "className": "text-lg font-bold"
  }, [createTextVNode("🖨️ 預約清運標籤列印預覽")]), createVNode("button", {
    "onClick": () => setPrintableBooking(null),
    "className": "text-slate-400 text-lg font-bold"
  }, [createTextVNode("✕")])]), createVNode("div", {
    "id": "printable-tag",
    "className": "bg-white text-slate-900 text-center rounded-xl p-6 border-4 border-dashed border-slate-900 space-y-4 mx-auto"
  }, [createVNode("div", {
    "className": "flex flex-col items-center border-b-2 border-slate-900 pb-3 gap-3"
  }, [createVNode("div", {
    "className": "text-center"
  }, [createVNode("span", {
    "className": "bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded"
  }, [createTextVNode("家戶免費清運專案")]), createVNode("h2", {
    "className": "text-xl font-black mt-1"
  }, [createTextVNode("大型廢棄傢俱已預約清運標籤")]), createVNode("p", {
    "className": "text-xs text-slate-600 font-bold"
  }, [createTextVNode("請貼於搬出傢俱外觀明顯處 ‧ 清潔隊現場掃碼核對")])]), createVNode(QRCodeBox2, {
    "value": `${window.location.origin}${window.location.pathname}?booking=${encodeURIComponent(printableBooking.id)}`,
    "size": 80
  }, null)]), createVNode("div", {
    "className": "grid grid-cols-2 gap-3 bg-slate-100 p-3 rounded-lg border border-slate-300 text-xs"
  }, [createVNode("div", null, [createVNode("span", {
    "className": "text-slate-500 block"
  }, [createTextVNode("預約單號")]), createVNode("strong", {
    "className": "text-emerald-800 text-base font-mono"
  }, [printableBooking.id])]), createVNode("div", null, [createVNode("span", {
    "className": "text-slate-500 block"
  }, [createTextVNode("希望清運日期")]), createVNode("strong", {
    "className": "text-slate-900 text-sm"
  }, [formatMinguoDate2(printableBooking.preferredDate)])]), createVNode("div", null, [createVNode("span", {
    "className": "text-slate-500 block"
  }, [createTextVNode("申請人姓名")]), createVNode("strong", {
    "className": "text-slate-900"
  }, [printableBooking.applicantName])]), createVNode("div", null, [createVNode("span", {
    "className": "text-slate-500 block"
  }, [createTextVNode("聯絡電話")]), createVNode("strong", {
    "className": "text-slate-900 font-mono"
  }, [printableBooking.phone])])]), createVNode("div", {
    "className": "text-xs bg-amber-50 p-3 rounded-lg border border-amber-200"
  }, [createVNode("span", {
    "className": "text-slate-500 block font-bold"
  }, [createTextVNode("一樓放置地點")]), createVNode("strong", {
    "className": "text-slate-900 text-sm"
  }, [printableBooking.address]), printableBooking.locationNote && createVNode("p", {
    "className": "text-slate-600 mt-1"
  }, [createTextVNode("備註: "), printableBooking.locationNote])]), createVNode("div", {
    "className": "text-xs space-y-1"
  }, [createVNode("span", {
    "className": "text-slate-500 font-bold block"
  }, [createTextVNode("待清運品項清單")]), createVNode("div", {
    "className": "grid grid-cols-2 gap-2"
  }, [(_a = printableBooking.items) == null ? void 0 : _a.map((i, idx) => createVNode("div", {
    "key": idx,
    "className": "bg-slate-100 p-1.5 rounded border border-slate-300 font-bold flex justify-between"
  }, [createVNode("span", null, [i.name]), createVNode("span", null, [createTextVNode("x "), i.quantity])]))])]), createVNode("div", {
    "className": "pt-2 border-t border-slate-300 text-[10px] text-slate-500 flex justify-between"
  }, [createVNode("span", null, [createTextVNode("※ 請勿夾雜事業廢棄物或危險物品 ‧ 清潔隊電話: (037) 878457")]), createVNode("span", null, [createTextVNode("列印日期: "), formatMinguoDate2(/* @__PURE__ */ new Date())])])]), createVNode("div", {
    "className": "flex justify-end space-x-3 pt-2"
  }, [createVNode("button", {
    "onClick": () => setPrintableBooking(null),
    "className": "px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
  }, [createTextVNode("關閉")]), createVNode("button", {
    "onClick": () => window.print(),
    "className": "px-6 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs"
  }, [createTextVNode("列印標籤")])])])])]);
}
function Footer() {
  return createVNode(Fragment, null, [createVNode("footer", {
    "className": "mt-16 bg-emerald-950 border-t border-emerald-900 text-emerald-100/70 py-9 no-print text-xs text-center space-y-2"
  }, [createVNode("p", null, [createTextVNode("大型廢棄傢俱預約清運管理系統 ‧ 縣民熱線 1999 ‧ 清潔隊服務專線 (037)878457")]), createVNode("p", {
    "className": "text-slate-500"
  }, [createTextVNode("© 2026 苗栗縣三義鄉大型廢棄物清運專區. All rights reserved.")])])]);
}
function QRCodeBox({
  value,
  size = 96
}) {
  const qrRef = useRef(null);
  useEffect(() => {
    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      if (window.QRCode) {
        new window.QRCode(qrRef.current, {
          text: value,
          width: size,
          height: size,
          colorDark: "#0f172a",
          colorLight: "#ffffff",
          correctLevel: window.QRCode.CorrectLevel.H
        });
      }
    }
  }, [value, size]);
  return createVNode("div", {
    "ref": qrRef,
    "className": "inline-block p-1 bg-white rounded border border-slate-300"
  }, null);
}
function App() {
  const [activeTab, setActiveTab] = useState("booking");
  const gasUrl = GAS_URL;
  const [successBooking, setSuccessBooking] = useState(null);
  const [printableBooking, setPrintableBooking] = useState(null);
  const [applicantName, setApplicantName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [county, setCounty] = useState("苗栗縣");
  const [district, setDistrict] = useState("三義鄉");
  const [detailAddress, setDetailAddress] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [photos, setPhotos] = useState([]);
  const toLocalDateString = (date) => date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  const getDefaultBookingDate = () => {
    const date = /* @__PURE__ */ new Date();
    date.setDate(date.getDate() + 3);
    while (getUnavailableBookingReason(toLocalDateString(date))) date.setDate(date.getDate() + 1);
    return toLocalDateString(date);
  };
  const defaultDate = getDefaultBookingDate();
  const [preferredDate, setPreferredDate] = useState(defaultDate);
  const [preferredTimeSlot, setPreferredTimeSlot] = useState("上午8點至12點");
  const [locationNote, setLocationNote] = useState("");
  const [agreedTerms, setAgreedTerms] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSecondsLeft, setSubmitSecondsLeft] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const handleItemQtyChange = (catId, delta) => {
    setSelectedItems((prev) => {
      const found = prev.find((i) => i.categoryId === catId);
      if (found) {
        const nextQty = found.quantity + delta;
        if (nextQty <= 0) return prev.filter((i) => i.categoryId !== catId);
        return prev.map((i) => i.categoryId === catId ? {
          ...i,
          quantity: nextQty
        } : i);
      } else if (delta > 0) {
        const catObj = CATEGORIES.find((c) => c.id === catId);
        return [...prev, {
          categoryId: catId,
          categoryName: catObj.name,
          name: catObj.name,
          quantity: 1,
          note: ""
        }];
      }
      return prev;
    });
  };
  const getItemQty = (catId) => {
    const found = selectedItems.find((i) => i.categoryId === catId);
    return found ? found.quantity : 0;
  };
  const getItemNote = (catId) => {
    var _a;
    return ((_a = selectedItems.find((i) => i.categoryId === catId)) == null ? void 0 : _a.note) || "";
  };
  const handleItemNoteChange = (catId, note) => setSelectedItems((prev) => prev.map((i) => i.categoryId === catId ? {
    ...i,
    note,
    name: catId === "other" ? note || "其他" : i.name
  } : i));
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const image = new Image();
        image.onload = () => {
          const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);
          canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (!blob) return;
            setPhotos((prev) => [...prev, {
              id: Date.now() + Math.random(),
              name: file.name.replace(/\.[^.]+$/, "") + ".jpg",
              file: blob,
              url: URL.createObjectURL(blob)
            }]);
          }, "image/jpeg", 0.84);
        };
        image.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  };
  const isAllTermsAgreed = TERMS_LIST.every((t) => agreedTerms.includes(t.id));
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    const errs = {};
    if (!applicantName.trim()) errs.applicantName = "請輸入申請人姓名";
    if (!phone.trim()) errs.phone = "請輸入聯絡電話";
    else if (!/^09\d{2}-?\d{6}$/.test(phone.trim()) && !/^0\d{1,2}-?\d{6,8}$/.test(phone.trim())) {
      errs.phone = "請輸入正確格式電話（如 0912-345678 或 037-123456）";
    }
    if (!detailAddress.trim()) errs.detailAddress = "請填寫詳細清運地址";
    if (!preferredDate) errs.preferredDate = "請從日曆選擇希望清運日期";
    else if (preferredDate < toLocalDateString(/* @__PURE__ */ new Date())) errs.preferredDate = "希望清運日期不可早於今天";
    else {
      const unavailableReason = getUnavailableBookingReason(preferredDate);
      if (unavailableReason) errs.preferredDate = unavailableReason;
    }
    if (selectedItems.length === 0) errs.items = "請至少選擇一項待清運傢俱項目";
    if (agreedTerms.length < TERMS_LIST.length) errs.terms = "需全數同意 5 項申請聲明與規定";
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      window.scrollTo({
        top: 120,
        behavior: "smooth"
      });
      return;
    }
    const estimatedSeconds = photos.length > 0 ? Math.min(10, 2 + photos.length * 2) : 1;
    setIsSubmitting(true);
    setSubmitSecondsLeft(estimatedSeconds);
    const countdownTimer = setInterval(() => setSubmitSecondsLeft((seconds) => Math.max(0, seconds - 1)), 1e3);
    await new Promise((resolve) => setTimeout(resolve, 50));
    try {
      const totalQuantity = selectedItems.reduce((total, item) => total + Number(item.quantity || 0), 0);
      const wasteType = selectedItems.map((item) => `${item.name}×${item.quantity}`).join("、");
      const uploadSession = photos.length ? await preparePublicUploads(photos.map((photo) => {
        var _a, _b;
        return {
          mimeType: ((_a = photo.file) == null ? void 0 : _a.type) || "image/jpeg",
          size: ((_b = photo.file) == null ? void 0 : _b.size) || 0
        };
      })) : null;
      if (uploadSession) await Promise.all(uploadSession.uploads.map((upload, index) => {
        var _a;
        return uploadSignedPhoto(upload.signedUrl, photos[index].file, ((_a = photos[index].file) == null ? void 0 : _a.type) || "image/jpeg");
      }));
      const fullAddress = `${county}${district}${detailAddress.trim()}`;
      const bookingId = await createPublicCase({
        applicant: applicantName.trim(),
        phone: formatTaiwanPhone(phone),
        county,
        district,
        address: fullAddress,
        addressDetail: detailAddress.trim(),
        wasteType,
        quantity: totalQuantity,
        preferredDate,
        preferredTimeSlot,
        locationNote,
        email: email.trim(),
        uploadSessionId: uploadSession == null ? void 0 : uploadSession.sessionId
      });
      const newBooking = {
        id: bookingId,
        applicantName,
        phone: formatTaiwanPhone(phone),
        email,
        county,
        district,
        address: fullAddress,
        preferredDate,
        preferredTimeSlot,
        locationNote,
        items: selectedItems,
        photos: photos.map((item) => item.url),
        status: "待處理",
        statusTimeline: [{
          status: "待處理",
          time: (/* @__PURE__ */ new Date()).toISOString()
        }],
        createdAt: getMinguoTime(),
        agreedToTerms: true
      };
      setSuccessBooking(newBooking);
      setApplicantName("");
      setPhone("");
      setEmail("");
      setCounty("苗栗縣");
      setDistrict("三義鄉");
      const nextDefaultDate = getDefaultBookingDate();
      setDetailAddress("");
      setSelectedItems([]);
      setPhotos([]);
      setPreferredDate(nextDefaultDate);
      setPreferredTimeSlot("上午8點至12點");
      setLocationNote("");
      setAgreedTerms([]);
      setErrors({});
      setActiveTab("booking");
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    } catch (error) {
      setErrors({
        submit: error.message || "申請送出失敗，請稍後再試"
      });
      window.scrollTo({
        top: 120,
        behavior: "smooth"
      });
    } finally {
      clearInterval(countdownTimer);
      setSubmitSecondsLeft(0);
      setIsSubmitting(false);
    }
  };
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !searchPhone.trim()) return;
    setHasSearched(false);
    try {
      const result = (await queryCase(searchQuery.trim(), formatTaiwanPhone(searchPhone))).case;
      setSearchResults([{
        id: result.caseNo,
        phone: formatTaiwanPhone(searchPhone),
        status: result.status,
        preferredDate: result.scheduledAt,
        preferredTimeSlot: "",
        address: "基於個資保護不顯示地址",
        itemsChinese: result.wasteType,
        items: [],
        quantity: result.quantity,
        statusTimeline: [{
          status: result.status,
          time: (/* @__PURE__ */ new Date()).toISOString()
        }]
      }]);
    } catch (_error) {
      setSearchResults([]);
    } finally {
      setHasSearched(true);
    }
  };
  const viewProps = {
    activeTab,
    setActiveTab,
    applicantName,
    setApplicantName,
    phone,
    setPhone,
    email,
    setEmail,
    county,
    setCounty,
    district,
    setDistrict,
    detailAddress,
    setDetailAddress,
    selectedItems,
    photos,
    setPhotos,
    preferredDate,
    setPreferredDate,
    getUnavailableBookingReason,
    preferredTimeSlot,
    setPreferredTimeSlot,
    locationNote,
    setLocationNote,
    setAgreedTerms,
    errors,
    setErrors,
    isSubmitting,
    submitSecondsLeft,
    handleItemQtyChange,
    getItemQty,
    getItemNote,
    handleItemNoteChange,
    handleFileUpload,
    isAllTermsAgreed,
    handleFormSubmit,
    CATEGORIES,
    COUNTIES,
    DISTRICTS_BY_COUNTY,
    TERMS_LIST,
    formatMinguoDate,
    formatTaiwanPhone,
    getMinguoTime,
    setPrintableBooking,
    searchQuery,
    setSearchQuery,
    searchPhone,
    setSearchPhone,
    searchResults,
    hasSearched,
    handleSearchSubmit,
    gasUrl,
    successBooking,
    setSuccessBooking,
    printableBooking,
    QRCodeBox
  };
  return createVNode("div", {
    "className": "civic-shell min-h-screen flex flex-col"
  }, [createVNode(Header, viewProps, null), createVNode("main", {
    "className": "relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-12 no-print"
  }, [createVNode(BookingView, viewProps, null), createVNode(BookingQueryView, viewProps, null)]), createVNode(BookingSuccessModal, viewProps, null), createVNode(PrintableTagModal, viewProps, null), createVNode(Footer, null, null)]);
}
createApp(App).mount("#root");
