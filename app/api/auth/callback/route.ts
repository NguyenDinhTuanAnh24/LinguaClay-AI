import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Lấy thông tin user vừa đăng nhập từ Supabase Auth
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Đồng bộ user sang Prisma DB (upsert: tạo mới nếu chưa có, bỏ qua nếu đã có)
        await prisma.user.upsert({
          where: { id: user.id },
          update: {
            email: user.email!,
            name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            image: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          },
          create: {
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            image: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            targetLanguage: 'EN',
            proficiencyLevel: 'Beginner',
          },
        })
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?message=Could not authenticate user`)
}
