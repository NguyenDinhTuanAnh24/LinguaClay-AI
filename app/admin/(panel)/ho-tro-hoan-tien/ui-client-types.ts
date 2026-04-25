export type AdminTab = 'support' | 'refund'
export type RefundMode = 'FULL' | 'PARTIAL'

export type SupportTicketView = {
  id: string
  userId: string
  userName: string
  userEmail: string
  subject: string
  message: string
  attachmentUrl: string
  createdAt: string
  status: string
  autoTag: string
  packageStatus: string
  device: string
  lastActiveAt: string
  blockedLesson: string
  history: Array<{ id: string; createdAt: string; reason: string; status: string }>
  internalNote: string
  adminReply: string
}

export type RefundQueueItemView = {
  id: string
  userId: string
  userName: string
  userEmail: string
  reason: string
  bankName: string
  accountNumber: string
  accountName: string
  requestedAt: string
  planId: string
  amount: number
  eligibilityLabel: string
  eligibilityReason: string
  usageSignal: string
  suggestedPartialAmount: number
}

export type RefundHistoryItemView = {
  id: string
  userName: string
  userEmail: string
  planId: string
  reason: string
  requestedAmount: number
  refundedAmount: number | null
  requestedAt: string
  processedAt: string | null
  status: string
  processedBy: string | null
  note: string | null
}

export type ChurnPlanView = {
  planId: string
  count: number
}

export type ChurnReasonView = {
  reason: string
  count: number
}
