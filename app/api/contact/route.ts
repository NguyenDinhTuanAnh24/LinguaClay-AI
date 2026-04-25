import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json()

    // Gửi email qua Resend (Cực nhanh qua HTTP)
    const { data, error } = await resend.emails.send({
      from: 'LinguaClay System <onboarding@resend.dev>', // Mặc định của Resend khi chưa verify domain
      to: 'anh249205@gmail.com',
      subject: `🏺 [CUSTOMER] Tin nhắn mới từ ${name}`,
      html: `
        <div style="background-color: #FDFBF7; padding: 40px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 40px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.05); border: 4px solid #ffffff;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #7BA3D0, #A8D5BA); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: -0.5px;">🏺 LinguaClay AI</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px;">Xử lý bởi Resend API (Siêu tốc ⚡)</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px;">
              <div style="margin-bottom: 30px;">
                <label style="display: block; color: #A0A0A0; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Người gửi</label>
                <div style="background: #F8F9FA; padding: 15px 20px; border-radius: 18px; font-weight: 700; color: #2D3436; border: 2px solid #F1F2F6;">
                  ${name}
                </div>
              </div>

              <div style="margin-bottom: 30px;">
                <label style="display: block; color: #A0A0A0; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Email liên hệ</label>
                <div style="background: #F8F9FA; padding: 15px 20px; border-radius: 18px; font-weight: 700; color: #7BA3D0; border: 2px solid #F1F2F6;">
                  <a href="mailto:${email}" style="color: #7BA3D0; text-decoration: none;">${email}</a>
                </div>
              </div>

              <div style="margin-bottom: 10px;">
                <label style="display: block; color: #A0A0A0; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Nội dung tin nhắn</label>
                <div style="background: #FFF9F2; padding: 25px; border-radius: 25px; color: #4A4A4A; min-height: 100px; border: 2px dashed #E5B77E;">
                  ${message.replace(/\n/g, '<br>')}
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #FDFBF7; padding: 20px; text-align: center; border-top: 1px solid #F1F2F6;">
              <p style="color: #B2BEC3; font-size: 12px; margin: 0;">© 2026 LinguaClay AI Dashboard. Powered by Resend.</p>
            </div>
          </div>
        </div>
      `,
    })

    if (error) {
      logger.error('Resend Error:', error)
      return NextResponse.json({ message: 'Failed to send via Resend' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Success', data }, { status: 200 })
  } catch (error) {
    logger.error('API Error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
