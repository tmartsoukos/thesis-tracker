// Date helpers. Dates are "YYYY-MM-DD" strings; "today" is the calendar day in Europe/Athens.

const TZ = 'Europe/Athens'
const DAY_MS = 86_400_000

const ymdFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Current calendar day in Athens as YYYY-MM-DD. `now` is injectable for tests. */
export function todayAthens(now: Date = new Date()): string {
  return ymdFormatter.format(now)
}

function toUtcMs(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

/** Whole days from a to b (b - a). */
export function diffDays(a: string, b: string): number {
  return Math.round((toUtcMs(b) - toUtcMs(a)) / DAY_MS)
}

export function addDays(ymd: string, n: number): string {
  return new Date(toUtcMs(ymd) + n * DAY_MS).toISOString().slice(0, 10)
}

/** YYYY-MM-DD -> dd/mm/yyyy. Empty/invalid input gives an empty string. */
export function formatDate(ymd?: string): string {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ''
  const [y, m, d] = ymd.split('-')
  return `${d}/${m}/${y}`
}

/** Monday..Sunday range containing the given day. */
export function weekRange(ymd: string): { start: string; end: string } {
  const dow = new Date(toUtcMs(ymd)).getUTCDay() // 0 = Sunday
  const sinceMonday = (dow + 6) % 7
  const start = addDays(ymd, -sinceMonday)
  return { start, end: addDays(start, 6) }
}

export function isValidYmd(s: unknown): s is string {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  return new Date(toUtcMs(s)).toISOString().slice(0, 10) === s
}
