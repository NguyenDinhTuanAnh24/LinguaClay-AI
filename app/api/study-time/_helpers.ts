export const STUDY_GOAL_SECONDS = 3 * 60 * 60

export function getVNDayStartDate(date = new Date()): Date {
  const vnDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
  return new Date(`${vnDate}T00:00:00+07:00`)
}

export function clampSeconds(value: number): number {
  if (!Number.isFinite(value)) return 0
  const raw = Math.floor(value)
  if (raw < 0) return 0
  if (raw > 30) return 30
  return raw
}
