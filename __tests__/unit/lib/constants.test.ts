import { describe, expect, it } from 'vitest'
import {
  AppRoles,
  MS_PER_DAY,
  NotificationType,
  OrderStatus,
  PLAN_LABEL,
  PLAN_MONTHS,
  PLAN_PRICE,
  PlanId,
  RefundStatus,
  TicketStatus,
  VIETNAM_TIMEZONE_OFFSET,
  getPlanLabel,
  getPlanMonths,
} from '@/lib/constants'

describe('constants', () => {
  it('should expose stable base constants', () => {
    expect(MS_PER_DAY).toBe(86_400_000)
    expect(VIETNAM_TIMEZONE_OFFSET).toBe(7 * 3600_000)
    expect(AppRoles.ADMIN).toBe('ADMIN')
    expect(AppRoles.USER).toBe('USER')
  })

  it('should expose plan metadata maps', () => {
    expect(PLAN_PRICE[PlanId.THREE_MONTHS]).toBe(299_000)
    expect(PLAN_PRICE[PlanId.SIX_MONTHS]).toBe(399_000)
    expect(PLAN_PRICE[PlanId.ONE_YEAR]).toBe(499_000)
    expect(PLAN_MONTHS[PlanId.THREE_MONTHS]).toBe(3)
    expect(PLAN_MONTHS[PlanId.SIX_MONTHS]).toBe(6)
    expect(PLAN_MONTHS[PlanId.ONE_YEAR]).toBe(12)
    expect(PLAN_LABEL[PlanId.THREE_MONTHS]).toContain('3')
    expect(PLAN_LABEL[PlanId.ONE_YEAR]).toContain('1')
  })

  it('should resolve labels from plan keys and legacy keys', () => {
    expect(getPlanLabel('3_MONTHS')).toBe(PLAN_LABEL[PlanId.THREE_MONTHS])
    expect(getPlanLabel('SOME_6_MONTHS_PLAN')).toBe(PLAN_LABEL[PlanId.SIX_MONTHS])
    expect(getPlanLabel('PLAN_12')).toBe(PLAN_LABEL[PlanId.ONE_YEAR])
    expect(getPlanLabel('GOLD_YEAR_PACK')).toBe(PLAN_LABEL[PlanId.ONE_YEAR])
    expect(getPlanLabel('ADMIN_GRANTED_9M')).toBe('ADMIN cấp 9 tháng')
    expect(getPlanLabel('UNKNOWN')).toBe('Đã nâng cấp')
    expect(getPlanLabel(null)).toBe('Đã nâng cấp')
  })

  it('should resolve months from plan keys and admin grants', () => {
    expect(getPlanMonths('3_MONTHS')).toBe(3)
    expect(getPlanMonths('6_MONTHS')).toBe(6)
    expect(getPlanMonths('1_YEAR')).toBe(12)
    expect(getPlanMonths('contains_12')).toBe(12)
    expect(getPlanMonths('contains_YEAR_suffix')).toBe(12)
    expect(getPlanMonths('ADMIN_GRANTED_18M')).toBe(18)
    expect(getPlanMonths('UNKNOWN')).toBe(0)
    expect(getPlanMonths(undefined)).toBe(0)
  })

  it('should expose status and notification enums', () => {
    expect(OrderStatus.PENDING).toBe('PENDING')
    expect(OrderStatus.SUCCESS).toBe('SUCCESS')
    expect(RefundStatus.APPROVED).toBe('APPROVED')
    expect(TicketStatus.RESOLVED).toBe('RESOLVED')
    expect(NotificationType.PURCHASE_SUCCESS).toBe('PURCHASE_SUCCESS')
    expect(NotificationType.SYSTEM).toBe('SYSTEM')
  })
})
