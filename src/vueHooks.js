import { getCurrentInstance, ref } from 'vue'

// Lightweight composables for JSX function components running on Vue.
const componentHooks = new WeakMap()
const sameDeps = (a, b) => a && b && a.length === b.length && a.every((value, index) => Object.is(value, b[index]))

function hookKey(name) {
  const caller = new Error().stack?.split('\n').find((line) => line.includes('/src/') && !line.includes('vueHooks'))
  return `${name}:${caller || Math.random()}`
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
