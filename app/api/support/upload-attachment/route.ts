import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ảnh quá lớn, tối đa 4MB' }, { status: 400 })
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Chỉ chấp nhận file ảnh' }, { status: 400 })
    }

    const ext = file.type.split('/')[1] || 'png'
    const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const storageClient =
      serviceKey && serviceKey !== 'your-service-role-key-here'
        ? createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
            auth: { persistSession: false },
          })
        : supabase

    const { data, error } = await storageClient.storage.from('support-attachments').upload(filePath, buffer, {
      upsert: false,
      contentType: file.type,
    })

    if (error) {
      console.error('Support attachment upload error:', error)
      return NextResponse.json(
        { error: `Lỗi tải ảnh đính kèm: ${error.message}` },
        { status: 500 }
      )
    }

    const { data: urlData } = storageClient.storage.from('support-attachments').getPublicUrl(data.path)
    return NextResponse.json({
      ok: true,
      url: `${urlData.publicUrl}?t=${Date.now()}`,
    })
  } catch (error: unknown) {
    console.error('Support attachment route error:', error)
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

