import { UserRepository } from '@/repositories/user.repository'
import { Prisma } from '@prisma/client'

export class UserService {
  /**
   * Retrieves a user's safe profile representation.
   */
  static async getUserProfile(id: string) {
    const user = await UserRepository.findById(id)
    if (!user) throw new Error('User not found')
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image,
      joinedAt: user.createdAt,
    }
  }

  /**
   * Updates basic user info securely.
   */
  static async updateBasicInfo(id: string, partialData: { name?: string; image?: string }) {
    if (partialData.name && partialData.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long')
    }
    
    return UserRepository.update(id, partialData)
  }
}
