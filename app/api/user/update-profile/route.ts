import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { normalizeCefrLevel } from '@/lib/levels'
import { z } from 'zod'

const UpdateProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional().nullable(),
    imageUrl: z.string().trim().url().max(2048).optional().nullable(),
    targetLanguage: z.string().trim().min(1).max(40).optional(),
    proficiencyLevel: z.string().trim().min(1).max(20).optional(),
    phoneNumber: z
      .string()
      .trim()
      .max(30)
      .regex(/^[+0-9\s\-().]*$/, 'Invalid phone number format')
      .optional()
      .nullable(),
    birthday: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Birthday must be in YYYY-MM-DD format')
      .optional()
      .nullable(),
  })
  .strict()

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let bodyRaw: unknown
    try {
      bodyRaw = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    const parseResult = UpdateProfileSchema.safeParse(bodyRaw)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const { name, imageUrl, targetLanguage, proficiencyLevel, phoneNumber, birthday } = parseResult.data
    const updateData: Prisma.UserUpdateInput = {}

    if (name !== undefined && name !== null) updateData.name = name
    if (imageUrl !== undefined && imageUrl !== null) updateData.image = imageUrl
    if (targetLanguage) updateData.targetLanguage = targetLanguage
    if (proficiencyLevel) updateData.proficiencyLevel = normalizeCefrLevel(proficiencyLevel)
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber
    if (birthday !== undefined) updateData.birthday = birthday ? new Date(birthday) : null

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    })

    return NextResponse.json({ ok: true, user: updatedUser })
  } catch (error) {
    logger.error('Update profile error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
