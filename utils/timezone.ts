import { toZonedTime, formatInTimeZone } from 'date-fns-tz'

export const TIMEZONE_VN = 'Asia/Ho_Chi_Minh'

/**
 * Gets the current time in Vietnam.
 */
export function getVNTime(date?: Date | number | string) {
  return toZonedTime(date ?? new Date(), TIMEZONE_VN)
}

/**
 * Formats a date into a VN string manually if preferred.
 * @example formatVNTime(new Date(), 'dd/MM/yyyy HH:mm:ss')
 */
export function formatVNTime(date: Date | number | string, formatStr: string) {
  return formatInTimeZone(date, TIMEZONE_VN, formatStr)
}

/**
 * Gets the start of the current day in Vietnam Standard Time (Midnight in VN converted to UTC).
 */
export function getVNStartOfDay(date?: Date | number | string) {
  const vnTime = getVNTime(date)
  vnTime.setHours(0, 0, 0, 0)
  return vnTime
}
