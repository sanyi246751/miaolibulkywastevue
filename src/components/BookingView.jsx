import MinguoDatePicker from './MinguoDatePicker.jsx';

export default function BookingView(props) {
  const { activeTab, applicantName, setApplicantName, phone, setPhone, email, setEmail, county, setCounty, district, setDistrict, detailAddress, setDetailAddress, selectedItems, photos, setPhotos, preferredDate, setPreferredDate, getUnavailableBookingReason, preferredTimeSlot, setPreferredTimeSlot, locationNote, setLocationNote, setAgreedTerms, errors, setErrors, isSubmitting, submitSecondsLeft, handleItemQtyChange, getItemQty, getItemNote, handleItemNoteChange, handleFileUpload, isAllTermsAgreed, handleFormSubmit, CATEGORIES, COUNTIES, DISTRICTS_BY_COUNTY, TERMS_LIST, formatMinguoDate, formatTaiwanPhone } = props;
  // 不使用 toLocaleDateString：部分瀏覽器會回傳 2026/9/10，造成字串比較時所有
  // YYYY-MM-DD 日曆日期都被誤判為早於今天而無法點選。
  const today = new Date();
  const minBookingDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <>
      {/* TAB 1: Booking Wizard Form */}
            {activeTab === 'booking' && (
              <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto space-y-5 sm:space-y-8">
                
                {/* Validation Warnings */}
                {Object.keys(errors).length > 0 && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs space-y-1">
                    <strong className="text-sm block">⚠️ 請修正以下未填寫或格式不符欄位：</strong>
                    <ul className="list-disc list-inside">
                      {Object.values(errors).map((e, idx) => <li key={idx}>{e}</li>)}
                    </ul>
                  </div>
                )}

                {/* Step 1: Applicant Info */}
                <div className="glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 flex items-center">
                      <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mr-2 text-sm border border-emerald-500/30">1</span>
                      申請人基本資料
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 ml-10">標記 <span className="text-rose-400 font-bold">*</span> 為必填欄位</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        申請人姓名 <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="請輸入姓名 (例: 王大明)"
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        行動電話 / 聯絡電話 <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="0912-345678 或 037-123456"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onBlur={() => setPhone(formatTaiwanPhone(phone))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        電子郵件 Email (選填)
                      </label>
                      <input
                        type="email"
                        placeholder="example@mail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          縣市 <span className="text-rose-400">*</span>
                        </label>
                        <select
                          value={county}
                          onChange={(e) => { const next = e.target.value; setCounty(next); setDistrict(DISTRICTS_BY_COUNTY[next][0]); }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                        >
                          {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          行政區域 <span className="text-rose-400">*</span>
                        </label>
                        <select
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                        >{DISTRICTS_BY_COUNTY[county].map((d) => <option key={d} value={d}>{d}</option>)}</select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          詳細清運地址 <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="例如: 廣盛村復興路69號"
                          value={detailAddress}
                          onChange={(e) => setDetailAddress(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Waste Items Selection */}
                <div className="glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-100 flex items-center">
                      <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mr-2 text-sm border border-emerald-500/30">2</span>
                      清運項目及數量選擇
                    </h3>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      已選總數: {selectedItems.reduce((acc, cur) => acc + cur.quantity, 0)} 件｜每戶每年最多 3 次、合計 6 件免費；超過額度每件 200 元
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {CATEGORIES.map((cat) => {
                      const qty = getItemQty(cat.id);
                      const isSelected = qty > 0;
                      return (
                        <div
                          key={cat.id}
                          className={`rounded-2xl border p-6 transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-300'
                              : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <span className="mt-0.5 text-3xl">{cat.icon}</span>
                            <div>
                              <h4 className="text-xl font-black text-slate-950">{cat.name}</h4>
                              <p className="mt-1 text-base leading-snug text-slate-500">{cat.desc}</p>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-end gap-3">
                            <span className="text-base font-bold text-slate-700">選擇數量：</span>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleItemQtyChange(cat.id, -1)}
                                disabled={qty === 0}
                                aria-label={`減少${cat.name}數量`}
                                className="h-8 w-10 rounded-md bg-slate-200 text-base font-bold text-slate-900 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                −
                              </button>
                              <span className="w-4 text-center text-base font-black text-slate-950">{qty}</span>
                              <button
                                type="button"
                                onClick={() => handleItemQtyChange(cat.id, 1)}
                                aria-label={`增加${cat.name}數量`}
                                className="h-8 w-10 rounded-md bg-emerald-700 text-lg font-light text-white transition hover:bg-emerald-800"
                              >
                                ＋
                              </button>
                            </div>
                          </div>
                          {isSelected && cat.id === 'other' && <input type="text" value={getItemNote(cat.id)} onChange={(e) => handleItemNoteChange(cat.id, e.target.value)} placeholder="請填寫其他清運項目內容" className="mt-4 w-full rounded-lg border border-emerald-400 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Photo Upload */}
                <div className="glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-100 flex items-center">
                      <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mr-2 text-sm border border-emerald-500/30">3</span>
                      上傳待清運照片數張
                    </h3>
                    <span className="text-xs text-slate-400">已上傳 <strong className="text-emerald-400">{photos.length}</strong> 張</span>
                  </div>

                  <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" id="photo-input" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {photos.map((p) => (
                        <div key={p.id} className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-700 group">
                          <img src={p.url} className="w-full h-24 object-cover" />
                          <button
                            type="button"
                            onClick={() => setPhotos(photos.filter((i) => i.id !== p.id))}
                            className="absolute top-1 right-1 p-1 rounded-full bg-slate-950/80 text-rose-400"
                          >
                            ✕
                          </button>
                          <span className="block p-1 text-[10px] truncate text-slate-300 bg-slate-950/80">{p.name}</span>
                        </div>
                      ))}
                    <label htmlFor="photo-input" className="h-24 rounded-xl border-2 border-dashed border-emerald-500/50 bg-slate-900/40 hover:bg-emerald-500/10 cursor-pointer flex flex-col items-center justify-center gap-1 transition-all">
                      <span className="text-xl">📷</span>
                      <span className="text-xs font-bold text-slate-200">上傳照片</span>
                      <span className="text-[10px] text-slate-400">可選多張</span>
                    </label>
                  </div>
                </div>

                {/* Step 4: Schedule & Location */}
                <div className="glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-6">
                  <h3 className="text-lg font-bold text-slate-100 flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mr-2 text-sm border border-emerald-500/30">4</span>
                    希望清運時間與放置地點說明
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">希望清運日期</label>
                      <MinguoDatePicker
                        min={minBookingDate}
                        value={preferredDate}
                        setSelectedDate={(nextDate) => {
                          const reason = getUnavailableBookingReason(nextDate);
                          if (reason) {
                            setErrors((current) => ({ ...current, preferredDate: reason }));
                            return;
                          }
                          setPreferredDate(nextDate);
                          setErrors((current) => ({ ...current, preferredDate: '' }));
                        }}
                        className={`flex w-full items-center justify-between bg-slate-900 border rounded-xl px-4 py-2.5 text-sm text-slate-100 ${errors.preferredDate ? 'border-rose-500' : 'border-slate-700'}`}
                      />
                      <p className="mt-1 text-[11px] text-slate-400">民國日期：{formatMinguoDate(preferredDate)}；例假日及國定假日不開放預約。</p>
                      {errors.preferredDate && <p className="mt-1 text-[11px] font-bold text-rose-400">{errors.preferredDate}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">希望清運時段</label>
                      <select
                        value={preferredTimeSlot}
                        onChange={(e) => setPreferredTimeSlot(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100"
                      >
                        <option value="上午8點至12點">上午8點至12點</option>
                        <option value="下午1點至5點">下午1點至5點</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1">放置地點詳細說明</label>
                      <textarea
                        rows={2}
                        placeholder="例如: 放在一樓社區後門消防通道旁，避免阻礙交通"
                        value={locationNote}
                        onChange={(e) => setLocationNote(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 5: Terms Consent */}
                <div className="glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 flex items-center">
                      <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mr-2 text-sm border border-emerald-500/30">5</span>
                      申請聲明與同意事項 (必填)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 ml-10">
                      送出申請前，請確認服務範圍、年度免費額度、計費及物品放置規定，並完整閱讀後勾選同意。
                    </p>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-700/60">
                    <table className="w-full min-w-[640px] text-left text-xs">
                      <thead className="bg-emerald-50 text-emerald-900">
                        <tr>
                          <th className="w-14 px-4 py-3 text-center font-bold">項次</th>
                          <th className="w-44 px-4 py-3 font-bold">聲明事項</th>
                          <th className="px-4 py-3 font-bold">內容說明</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {TERMS_LIST.map((t) => (
                          <tr key={t.id} className="align-top">
                            <td className="px-4 py-3 text-center font-black text-emerald-700">{t.id}</td>
                            <td className="px-4 py-3 font-bold text-slate-200">{t.title}</td>
                            <td className="px-4 py-3 leading-relaxed text-slate-300">{t.content}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isAllTermsAgreed}
                    onClick={() => setAgreedTerms(isAllTermsAgreed ? [] : TERMS_LIST.map(t => t.id))}
                    className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                      isAllTermsAgreed
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-800'
                        : 'border-slate-700/60 bg-white/60 text-slate-700 hover:border-emerald-400'
                    }`}
                  >
                    <span className="text-lg font-bold text-emerald-600">{isAllTermsAgreed ? '☑' : '☐'}</span>
                    <span className="text-sm font-bold">我已詳讀並同意配合以上事項 (閱讀後，請勾選)</span>
                  </button>
                </div>
                {/* Submit button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-base shadow-xl hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center justify-center space-x-2 disabled:cursor-wait disabled:opacity-70"
                  >
                    <span>{isSubmitting ? `⏳ 送出處理中${photos.length > 0 && submitSecondsLeft > 0 ? `，預估還有 ${submitSecondsLeft} 秒` : '…'}` : '✅ 送出大型廢棄傢俱預約清運申請'}</span>
                  </button>
                </div>

              </form>
            )}
    </>
  );
}
