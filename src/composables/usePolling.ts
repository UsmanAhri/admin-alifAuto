import { onBeforeUnmount, onMounted } from 'vue'

export interface PollingOptions {
  /** Interval between background refreshes, in ms. */
  intervalMs?: number
  /** Run the callback once immediately on mount (pages usually load themselves, so default false). */
  immediate?: boolean
  /** Refresh as soon as the tab regains focus after being hidden. */
  refreshOnFocus?: boolean
}

/**
 * Periodically invokes `fn` to keep a view in sync with data created elsewhere
 * (client orders, partner vehicles, status changes) without a manual reload.
 *
 * Overlapping runs are skipped, the timer pauses while the tab is hidden, and
 * callback errors are swallowed so a transient network blip never surfaces as a
 * page error. `fn` should perform a *silent* refresh (no loading spinner) so the
 * poll stays invisible to the user.
 */
export function usePolling(fn: () => void | Promise<void>, options: PollingOptions = {}) {
  const { intervalMs = 15000, immediate = false, refreshOnFocus = true } = options

  let timer: ReturnType<typeof setInterval> | null = null
  let running = false

  async function tick(): Promise<void> {
    if (running) return
    if (typeof document !== 'undefined' && document.hidden) return
    running = true
    try {
      await fn()
    } catch {
      // Background refresh: never surface transient failures to the user.
    } finally {
      running = false
    }
  }

  function onVisibility(): void {
    if (!document.hidden) void tick()
  }

  function start(): void {
    stop()
    timer = setInterval(() => void tick(), intervalMs)
  }

  function stop(): void {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }

  onMounted(() => {
    if (immediate) void tick()
    start()
    if (refreshOnFocus && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibility)
    }
  })

  onBeforeUnmount(() => {
    stop()
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', onVisibility)
    }
  })

  return { start, stop, refresh: tick }
}
