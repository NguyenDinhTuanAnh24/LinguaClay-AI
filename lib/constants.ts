/**
 * @fileoverview Centralised application constants and enums.
 *
 * Import from this file instead of using raw string/number literals
 * scattered across the codebase.
 */

// ─── Time ──────────────────────────────────────────────────────────────────

export const MS_PER_DAY = 86_400_000
export const VIETNAM_TIMEZONE_OFFSET = 7 * 3600_000

// ─── Auth / Roles ──────────────────────────────────────────────────────────

export const AppRoles = {
  ADMIN: 'ADMIN',
  USER:  'USER',
} as const

export type AppRole = (typeof AppRoles)[keyof typeof AppRoles]

// ─── Payment / Order Status ────────────────────────────────────────────────

export const OrderStatus = {
  PENDING:   'PENDING',
  SUCCESS:   'SUCCESS',
  CANCELLED: 'CANCELLED',
  EXPIRED:   'EXPIRED',
} as const

export type OrderStatusValue = (typeof OrderStatus)[keyof typeof OrderStatus]

// ─── Refund Status ─────────────────────────────────────────────────────────

export const RefundStatus = {
  PENDING:  'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const

export type RefundStatusValue = (typeof RefundStatus)[keyof typeof RefundStatus]

// ─── Support Ticket Status ─────────────────────────────────────────────────

export const TicketStatus = {
  OPEN:     'OPEN',
  CLOSED:   'CLOSED',
  RESOLVED: 'RESOLVED',
} as const

export type TicketStatusValue = (typeof TicketStatus)[keyof typeof TicketStatus]

// ─── Plan IDs ──────────────────────────────────────────────────────────────

export const PlanId = {
  THREE_MONTHS: '3_MONTHS',
  SIX_MONTHS:   '6_MONTHS',
  ONE_YEAR:     '1_YEAR',
} as const

export type PlanIdValue = (typeof PlanId)[keyof typeof PlanId]

/** Price (VND) for each plan */
export const PLAN_PRICE: Record<PlanIdValue, number> = {
  [PlanId.THREE_MONTHS]: 299_000,
  [PlanId.SIX_MONTHS]:   399_000,
  [PlanId.ONE_YEAR]:     499_000,
}

/** Duration in months for each plan */
export const PLAN_MONTHS: Record<PlanIdValue, number> = {
  [PlanId.THREE_MONTHS]: 3,
  [PlanId.SIX_MONTHS]:   6,
  [PlanId.ONE_YEAR]:     12,
}

/** Human-readable Vietnamese label for each plan */
export const PLAN_LABEL: Record<PlanIdValue, string> = {
  [PlanId.THREE_MONTHS]: 'Bản tiêu chuẩn (3 tháng)',
  [PlanId.SIX_MONTHS]:   'Bản chuyên sâu (6 tháng)',
  [PlanId.ONE_YEAR]:     'Bản toàn diện (1 năm)',
}

/**
 * Returns a human-readable plan label from a proType key.
 * Works with legacy keys containing '3_MONTHS', '6_MONTHS', '1_YEAR', etc.
 */
export function getPlanLabel(key: string | null | undefined): string {
  if (!key) return 'Đã nâng cấp'
  if (key.includes(PlanId.THREE_MONTHS))                                    return PLAN_LABEL[PlanId.THREE_MONTHS]
  if (key.includes(PlanId.SIX_MONTHS))                                      return PLAN_LABEL[PlanId.SIX_MONTHS]
  if (key.includes(PlanId.ONE_YEAR) || key.includes('12') || key.includes('YEAR')) return PLAN_LABEL[PlanId.ONE_YEAR]
  const adminMatch = key.match(/^ADMIN_GRANTED_(\d+)M$/)
  if (adminMatch) return `ADMIN cấp ${adminMatch[1]} tháng`
  return 'Đã nâng cấp'
}

/**
 * Returns duration in months from a planId or proType key.
 */
export function getPlanMonths(key: string | null | undefined): number {
  if (!key) return 0
  if (key.includes(PlanId.THREE_MONTHS)) return 3
  if (key.includes(PlanId.SIX_MONTHS))  return 6
  if (key.includes(PlanId.ONE_YEAR) || key.includes('12') || key.includes('YEAR')) return 12
  const adminMatch = key.match(/^ADMIN_GRANTED_(\d+)M$/)
  if (adminMatch) return Number(adminMatch[1])
  return 0
}

// ─── Notification Types ────────────────────────────────────────────────────

export const NotificationType = {
  PURCHASE_SUCCESS:   'PURCHASE_SUCCESS',
  REFUND_APPROVED:    'REFUND_APPROVED',
  SUPPORT_REPLY:      'SUPPORT_REPLY',
  SYSTEM:             'SYSTEM',
} as const

export type NotificationTypeValue = (typeof NotificationType)[keyof typeof NotificationType]
