import { formatMinguoDate } from '../utils/formatters.js'
import { useEffect, useState } from '../vueHooks.js'

export default function MinguoDatePicker({ value, setSelectedDate, min = '', disabled = false, className = '' }) {
  const parsed = value ? new Date(`${value}T00:00:00`) : new Date()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState({ year: parsed.getFullYear(), month: parsed.getMonth() })
  useEffect(() => {
    if (!value) return
    const date = new Date(`${value}T00:00:00`)
    if (!Number.isNaN(date.getTime())) setView({ year: date.getFullYear(), month: date.getMonth() })
  }, [value])

  const shift = (amount) => {
    const date = new Date(view.year, view.month + amount, 1)
    setView({ year: date.getFullYear(), month: date.getMonth() })
  }
  const choose = (day) => {
    const next = `${view.year}-${String(view.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (min && next < min) return
    setSelectedDate(next)
    setOpen(false)
  }
  const first = new Date(view.year, view.month, 1).getDay()
  const total = new Date(view.year, view.month + 1, 0).getDate()

  return <div className="relative z-30">
    <button type="button" disabled={disabled} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)} className={className}>
      <span>{value ? formatMinguoDate(value) : '請選擇日期'}</span><span aria-hidden="true">📅</span>
    </button>
    {open && <div className="minguo-calendar-overlay" onClick={() => setOpen(false)}><div role="dialog" aria-modal="true" aria-label="選擇希望清運日期" onClick={(event) => event.stopPropagation()} className="minguo-calendar-dialog rounded-xl border border-emerald-200 bg-white p-3 text-slate-800 shadow-2xl">
      <div className="mb-2 flex items-center justify-between"><button type="button" onClick={() => shift(-1)} className="rounded px-2 py-1 hover:bg-emerald-50" aria-label="上個月">‹</button><span className="font-black">民國 {view.year - 1911} 年 {view.month + 1} 月</span><button type="button" onClick={() => shift(1)} className="rounded px-2 py-1 hover:bg-emerald-50" aria-label="下個月">›</button></div>
      <div className="grid grid-cols-7 text-center text-xs">{['日', '一', '二', '三', '四', '五', '六'].map((item) => <span key={item} className="py-1 text-slate-400">{item}</span>)}{Array.from({ length: first }, (_, index) => <span key={`blank-${index}`}/>)}{Array.from({ length: total }, (_, index) => { const day = index + 1; const iso = `${view.year}-${String(view.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; const active = iso === value; return <button type="button" disabled={Boolean(min && iso < min)} key={day} onClick={() => choose(day)} className={'m-0.5 rounded-full py-1.5 font-bold disabled:cursor-not-allowed disabled:text-slate-300 ' + (active ? 'bg-emerald-700 text-white' : 'hover:bg-emerald-50')}>{day}</button> })}</div>
    </div></div>}
  </div>
}
