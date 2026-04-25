import { OrderRepository } from '@/repositories/order.repository'
import { UserRepository } from '@/repositories/user.repository'

export async function loadUserPaymentReport(userId: string) {
  const [user, orders] = await Promise.all([
    UserRepository.findBasicIdentityById(userId),
    OrderRepository.findForAdminUserHistory(userId, 100),
  ])

  if (!user) return null

  const successOrders = orders.filter((o) => o.status === 'SUCCESS')
  const pendingOrders = orders.filter((o) => o.status === 'PENDING')
  const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED')
  const totalPaid = successOrders.reduce((sum, o) => sum + o.amount, 0)

  return {
    user,
    orders,
    summary: {
      totalOrders: orders.length,
      successOrders: successOrders.length,
      pendingOrders: pendingOrders.length,
      cancelledOrders: cancelledOrders.length,
      totalPaid,
    },
  }
}
