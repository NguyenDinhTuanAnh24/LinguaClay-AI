import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Xác thực user qua session cookie
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ảnh quá lớn, tối đa 2MB' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Chỉ chấp nhận file ảnh' }, { status: 400 })
    }

    const filePath = `${user.id}/avatar.png`
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Dùng admin client (service role) nếu có key - bypass RLS hoàn toàn
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const storageClient = (serviceKey && serviceKey !== 'your-service-role-key-here')
      ? createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceKey,
          { auth: { persistSession: false } }
        )
      : supabase // fallback: dùng user session (cần bucket policy đúng)

    const { data, error } = await storageClient.storage
      .from('avatars')
      .upload(filePath, buffer, {
        upsert: true,
        contentType: file.type,
      })

    if (error) {
      console.error('Storage upload error:', error)

      // Hướng dẫn cụ thể nếu lỗi RLS
      if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
        return NextResponse.json(
          {
            error: 'Bucket chưa được cấu hình. Vui lòng:\n1. Vào Supabase → Storage → Tạo bucket "avatars" (Public)\n2. Thêm SUPABASE_SERVICE_ROLE_KEY vào .env'
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { error: `Lỗi tải ảnh: ${error.message}` },
        { status: 500 }
      )
    }

    // Lấy public URL
    const { data: urlData } = storageClient.storage
      .from('avatars')
      .getPublicUrl(data.path)

    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`

    // Lưu vào Prisma
    await prisma.user.update({
      where: { id: user.id },
      data: { image: publicUrl },
    })

    return NextResponse.json({ ok: true, url: publicUrl })
  } catch (error: any) {
    console.error('Upload avatar error:', error)
    return NextResponse.json(
      { error: error.message || 'Lỗi server' },
      { status: 500 }
    )
  }
}
