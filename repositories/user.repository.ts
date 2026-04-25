import { prisma } from '@/lib/prisma'
import { Prisma, User, UserRole } from '@prisma/client'

export class UserRepository {
  static async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    })
  }

  static async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    })
  }

  static async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    })
  }

  static async upsertFromAuth(data: {
    id: string
    email: string
    role?: UserRole
    name?: string | null
    image?: string | null
    targetLanguage?: string
    proficiencyLevel?: string
  }) {
    return prisma.user.upsert({
      where: { id: data.id },
      update: {
        email: data.email,
        ...(data.role ? { role: data.role } : {}),
      },
      create: {
        id: data.id,
        email: data.email,
        role: data.role ?? UserRole.USER,
        name: data.name ?? null,
        image: data.image ?? null,
        targetLanguage: data.targetLanguage ?? 'EN',
        proficiencyLevel: data.proficiencyLevel ?? 'A1',
      },
    })
  }

  static async countAll(where?: Prisma.UserWhereInput): Promise<number> {
    return prisma.user.count({ where })
  }

  static async findProfileById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        targetLanguage: true,
        proficiencyLevel: true,
        isPro: true,
        proType: true,
        proStartDate: true,
        proEndDate: true,
        phoneNumber: true,
        birthday: true,
        createdAt: true,
        updatedAt: true,
        themePreference: true,
      },
    })
  }

  static async findBasicIdentityById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })
  }

  static async findLatestRefundRequestByOrderId(orderId: string) {
    const rows = await prisma.$queryRaw<Array<{ id: string; status: string; createdAt: Date }>>`
      SELECT id, status, "createdAt"
      FROM "RefundRequest"
      WHERE "orderId" = ${orderId}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `

    if (!rows[0]) return null
    return {
      id: rows[0].id,
      status: rows[0].status,
      createdAt: rows[0].createdAt,
    }
  }
}
