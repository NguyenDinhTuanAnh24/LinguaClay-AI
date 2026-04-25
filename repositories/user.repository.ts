import { prisma } from '@/lib/prisma'
import { Prisma, User } from '@prisma/client'

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

  static async countAll(where?: Prisma.UserWhereInput): Promise<number> {
    return prisma.user.count({ where })
  }
}
