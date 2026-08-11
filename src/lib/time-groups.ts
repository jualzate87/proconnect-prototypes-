/** Human-centric time bucket keys — ordered newest → oldest */
export const TIME_GROUP_KEYS = [
  'today',
  'yesterday',
  'past_7_days',
  'past_2_weeks',
  'past_30_days',
  'past_90_days',
  'earlier_this_year',
  'last_year',
  'older',
] as const

export type TimeGroupKey = typeof TIME_GROUP_KEYS[number]

const DAY = 86400000

function startOfDay(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function daysAgoFrom(timestamp: number, now = new Date()): number {
  const todayStart = startOfDay(now)
  const entryStart = startOfDay(new Date(timestamp))
  return Math.floor((todayStart - entryStart) / DAY)
}

/** Assign a version timestamp to a stable bucket key */
export function getTimeGroupKey(timestamp: number, now = new Date()): TimeGroupKey {
  const daysAgo = daysAgoFrom(timestamp, now)
  const entryYear = new Date(timestamp).getFullYear()
  const currentYear = now.getFullYear()

  if (daysAgo === 0) return 'today'
  if (daysAgo === 1) return 'yesterday'
  if (daysAgo >= 2 && daysAgo <= 7) return 'past_7_days'
  if (daysAgo >= 8 && daysAgo <= 14) return 'past_2_weeks'
  if (daysAgo >= 15 && daysAgo <= 30) return 'past_30_days'
  if (daysAgo >= 31 && daysAgo <= 90) return 'past_90_days'
  if (entryYear === currentYear) return 'earlier_this_year'
  if (entryYear === currentYear - 1) return 'last_year'
  return 'older'
}

function fmtDate(d: Date, includeYear = true): string {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(includeYear ? { year: 'numeric' } : {}),
  })
}

function fmtRange(start: Date, end: Date, now = new Date()): string {
  const currentYear = now.getFullYear()
  const sameYear = start.getFullYear() === end.getFullYear()
  const inCurrentYear = sameYear && start.getFullYear() === currentYear
  const startStr = fmtDate(start, !inCurrentYear)
  const endStr = fmtDate(end, !inCurrentYear)
  return `${startStr} – ${endStr}`
}

/**
 * Intuit human-centric group label — anchor + explicit date qualifier.
 * e.g. "Past 7 days · Jul 27 – Aug 1"
 */
export function getTimeGroupLabel(key: TimeGroupKey, now = new Date()): string {
  const todayStart = startOfDay(now)
  const year = now.getFullYear()

  switch (key) {
    case 'today':
      return `Today · ${fmtDate(new Date(todayStart))}`
    case 'yesterday':
      return `Yesterday · ${fmtDate(new Date(todayStart - DAY))}`
    case 'past_7_days':
      return `Past 7 days · ${fmtRange(
        new Date(todayStart - 7 * DAY),
        new Date(todayStart - 2 * DAY),
        now,
      )}`
    case 'past_2_weeks':
      return `2 weeks ago · ${fmtRange(
        new Date(todayStart - 14 * DAY),
        new Date(todayStart - 8 * DAY),
        now,
      )}`
    case 'past_30_days':
      return `Past 30 days · ${fmtRange(
        new Date(todayStart - 30 * DAY),
        new Date(todayStart - 15 * DAY),
        now,
      )}`
    case 'past_90_days':
      return `Past 90 days · ${fmtRange(
        new Date(todayStart - 90 * DAY),
        new Date(todayStart - 31 * DAY),
        now,
      )}`
    case 'earlier_this_year':
      return `Earlier in ${year} · ${fmtRange(
        new Date(year, 0, 1),
        new Date(todayStart - 91 * DAY),
        now,
      )}`
    case 'last_year':
      return `Last year · ${year - 1}`
    case 'older':
      return `Prior to ${year - 1} · Archival logs`
    default:
      return key
  }
}

export function groupVersionsByTime<T extends { timestamp: number }>(
  items: T[],
  now = new Date(),
): { key: TimeGroupKey; label: string; items: T[] }[] {
  const buckets: Partial<Record<TimeGroupKey, T[]>> = {}

  for (const item of items) {
    const key = getTimeGroupKey(item.timestamp, now)
    if (!buckets[key]) buckets[key] = []
    buckets[key]!.push(item)
  }

  return TIME_GROUP_KEYS
    .filter(key => buckets[key]?.length)
    .map(key => ({
      key,
      label: getTimeGroupLabel(key, now),
      items: buckets[key]!,
    }))
}

/** Human-readable date range for filter chips — e.g. "Jul 22 – Aug 3, 2026" or "Jan 12 – 15, 2027" */
export function formatFilterDateRange(dateFrom?: number, dateTo?: number): string | null {
  if (!dateFrom && !dateTo) return null

  const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
    d.toLocaleDateString('en-US', opts)

  if (dateFrom && dateTo) {
    const start = new Date(dateFrom)
    const end = new Date(dateTo)
    const sameMonthYear =
      start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()

    if (sameMonthYear) {
      const month = fmt(start, { month: 'short' })
      return `${month} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`
    }

    const sameYear = start.getFullYear() === end.getFullYear()
    return `${fmt(start, { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) })} – ${fmt(end, { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  if (dateFrom) return `From ${fmt(new Date(dateFrom), { month: 'short', day: 'numeric', year: 'numeric' })}`
  if (dateTo) return `Until ${fmt(new Date(dateTo), { month: 'short', day: 'numeric', year: 'numeric' })}`
  return null
}
