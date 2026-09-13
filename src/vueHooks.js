import { getCurrentInstance, ref } from 'vue'

// Lightweight composables for JSX function components running on Vue.
const componentHooks = new WeakMap()
const sameDeps = (a, b) => a && b && a.length === b.length && a.every((value, index) => Object.is(value, b[index]))

function hookKey(name) {
  // 開發版堆疊會帶有 /src/，但 Vite 正式版只會留下 assets/*.js。
  // 原先找不到 /src/ 時改用 Math.random()，使每次重繪都建立全新 hook：
  // useEffect 內 setState 會因此無限重繪，頁面看起來像卡住。
  const caller = new Error().stack?.split('\n').find((line) => {
    const text = String(line)
    return text.trim() !== 'Error' && !/hookKey|useState|useRef|useMemo|useEffect|vueHooks/.test(text)
  })
  return `${name}:${caller || name}`
}

function hooks() {
  const instance = getCurrentInstance()
  if (!instance) throw new Error('A compatibility hook was called outside a Vue component.')
  if (!componentHooks.has(instance)) componentHooks.set(instance, new Map())
  return componentHooks.get(instance)
}

export function useState(initialValue) {
  const values = hooks()
  const key = hookKey('state')
  if (!values.has(key)) values.set(key, ref(typeof initialValue === 'function' ? initialValue() : initialValue))
  const state = values.get(key)
  return [state.value, (next) => { state.value = typeof next === 'function' ? next(state.value) : next }]
}

export function useRef(initialValue) {
  const values = hooks()
  const key = hookKey('ref')
  if (!values.has(key)) {
    const value = ref(initialValue)
    Object.defineProperty(value, 'current', { get: () => value.value, set: (next) => { value.value = next } })
    values.set(key, value)
  }
  return values.get(key)
}

export function useMemo(factory, dependencies) {
  const values = hooks()
  const key = hookKey('memo')
  const previous = values.get(key)
  if (!previous || !sameDeps(previous.dependencies, dependencies)) {
    const next = { dependencies: dependencies?.slice(), value: factory() }
    values.set(key, next)
    return next.value
  }
  return previous.value
}

export function useEffect(effect, dependencies) {
  const values = hooks()
  const key = hookKey('effect')
  const previous = values.get(key)
  if (previous && sameDeps(previous.dependencies, dependencies)) return
  const current = { dependencies: dependencies?.slice(), cleanup: previous?.cleanup }
  values.set(key, current)
  queueMicrotask(() => {
    if (values.get(key) !== current) return
    if (typeof current.cleanup === 'function') current.cleanup()
    current.cleanup = effect()
  })
}

export default {}
