import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, imageUrl, targetLanguage, proficiencyLevel } = await request.json()

    const updateData: any = {}
    if (name !== undefined && name !== null) updateData.name = name
    if (imageUrl !== undefined && imageUrl !== null) updateData.image = imageUrl
    if (targetLanguage) updateData.targetLanguage = targetLanguage
    if (proficiencyLevel) updateData.proficiencyLevel = proficiencyLevel

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    })

    return NextResponse.json({ ok: true, user: updatedUser })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
