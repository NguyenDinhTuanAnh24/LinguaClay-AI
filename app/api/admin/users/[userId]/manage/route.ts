import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'
import { ensureAdminActor } from '@/lib/admin-auth'
import { isAdminEmail, isAdminUser } from '@/lib/admin'
import { createUserNotification } from '@/lib/user-notifications'

type ActionType = 'activate_pro' | 'cancel_pro' | 'ban' | 'unban'

type BanEmailResult = {
  sent: boolean
  provider: 'resend' | 'gmail' | null
  error?: string
}

async function sendAccountStatusEmail(userEmail: string, status: 'banned' | 'unbanned'): Promise<BanEmailResult> {
  const zaloSupportLink = process.env.NEXT_PUBLIC_ZALO_SUPPORT_URL || 'https://zalo.me/0866555468'
  const telegramSupportLink = process.env.NEXT_PUBLIC_TELEGRAM_SUPPORT_URL || 'https://t.me/tzora24'

  const isBanned = status === 'banned'
  const subject = isBanned 
    ? 'Thông báo: Tài khoản của bạn đã bị khóa truy cập'
    : 'Thông báo: Tài khoản của bạn đã được mở khóa'

  const textMessage = isBanned
    ? 'Tài khoản của bạn đã vi phạm chính sách và điều khoản của hệ thống. Vui lòng liên hệ ADMIN để được giải quyết.'
    : 'Tài khoản của bạn đã được mở khóa truy cập. Bắt đầu quá trình học tập của bạn trên LinguaClay ngay hôm nay!'

  const text = [
    textMessage,
    ...(isBanned ? [
      `Zalo: ${zaloSupportLink}`,
      `Telegram: ${telegramSupportLink}`,
    ] : [
      'Truy cập website LinguaClay để tiếp tục trải nghiệm học tập của bạn.'
    ])
  ].join('\n')

  const htmlBody = isBanned
    ? `
      <p style="margin:0 0 12px">
        Tài khoản của bạn đã vi phạm chính sách và điều khoản của hệ thống. Vui lòng liên hệ ADMIN để được giải quyết.
      </p>
      <p style="margin:0 0 6px"><a href="${zaloSupportLink}" target="_blank" rel="noopener noreferrer">Liên hệ Zalo</a></p>
      <p style="margin:0 0 16px"><a href="${telegramSupportLink}" target="_blank" rel="noopener noreferrer">Liên hệ Telegram</a></p>
      `
    : `
      <p style="margin:0 0 12px">
        Tài khoản của bạn đã được mở khóa truy cập. Bắt đầu quá trình học tập của bạn trên LinguaClay ngay hôm nay!
      </p>
      <p style="margin:0 0 16px">Cảm ơn bạn đã đồng hành cùng LinguaClay.</p>
      `

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;line-height:1.6">
      <h2 style="margin:0 0 12px;font-size:20px">Thông báo từ LinguaClay</h2>
      ${htmlBody}
    </div>
  `

  const resendApiKey = process.env.RESEND_API_KEY
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey)
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'LinguaClay System <onboarding@resend.dev>'
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: userEmail,
        subject,
        html,
        text,
      })
      if (!error) {
        return { sent: true, provider: 'resend' }
      }
      logger.error(`Resend email error [${status}]:`, error)
    } catch (error) {
      logger.error(`Resend email exception [${status}]:`, error)
    }
  }

  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_PASS
  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      })

      await transporter.sendMail({
        from: `LinguaClay Support <${gmailUser}>`,
        to: userEmail,
        subject,
        html,
        text,
      })

      return { sent: true, provider: 'gmail' }
    } catch (error) {
      logger.error(`Gmail email error [${status}]:`, error)
      return { sent: false, provider: null, error: 'Gmail send failed' }
    }
  }

  return { sent: false, provider: null, error: 'Missing RESEND_API_KEY and GMAIL_USER/GMAIL_PASS' }
}

export async function POST(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const admin = await ensureAdminActor()

    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId } = await params
    const body = (await req.json()) as { action?: ActionType; months?: number }
    const action = body.action

    if (!action || !['activate_pro', 'cancel_pro', 'ban', 'unban'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, isPro: true, proType: true },
    })
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    if (isAdminEmail(target.email)) {
      return NextResponse.json({ error: 'Cannot modify admin account' }, { status: 400 })
    }

    if (action === 'activate_pro' && target.isPro) {
      const key = (target.proType || '').toUpperCase()
      const adminMatch = key.match(/ADMIN_GRANTED_(\d+)M/)
      const isYearPlan =
        key.includes('1_YEAR') || key.includes('YEAR') || key.includes('12_MONTHS') || (adminMatch ? Number(adminMatch[1]) >= 12 : false)
      if (isYearPlan) {
        return NextResponse.json({ error: 'Nguoi dung da co goi 1 nam, khong the cap them.' }, { status: 400 })
      }
    }

    const now = new Date()
    const months = Number(body.months ?? 1)
    if (action === 'activate_pro' && (!Number.isInteger(months) || months < 1 || months > 12)) {
      return NextResponse.json({ error: 'So thang phai tu 1 den 12' }, { status: 400 })
    }

    const proEnd = new Date(now)
    proEnd.setMonth(proEnd.getMonth() + months)

    const updated = await prisma.user.update({
      where: { id: userId },
      data:
        action === 'activate_pro'
          ? {
              isPro: true,
              proType: `ADMIN_GRANTED_${months}M`,
              proStartDate: now,
              proEndDate: proEnd,
            }
          : action === 'cancel_pro'
            ? {
                isPro: false,
                proType: null,
                proStartDate: null,
                proEndDate: null,
              }
            : action === 'ban'
              ? {
                  isBanned: true,
                  isActive: false,
                }
              : {
                  isBanned: false,
                  isActive: true,
                },
      select: {
        id: true,
        isPro: true,
        proType: true,
        isActive: true,
        isBanned: true,
      },
    })

    let banEmailResult: BanEmailResult | null = null

    if (action === 'activate_pro') {
      await createUserNotification({
        userId,
        type: 'ADMIN_PLAN_UPGRADED',
        title: 'Goi hoc duoc nang cap',
        message: `Admin da nang cap goi cua ban them ${months} thang.`,
        dedupeKey: `admin_plan_upgraded:${userId}:${now.toISOString()}`,
        createdAt: now,
      }).catch((error) => {
        logger.error('Create admin plan upgraded notification error:', error)
      })
    } else if (action === 'cancel_pro') {
      await createUserNotification({
        userId,
        type: 'ADMIN_PLAN_CANCELED',
        title: 'Goi hoc bi huy',
        message: 'Admin da huy goi nang cap cua ban.',
        dedupeKey: `admin_plan_canceled:${userId}:${now.toISOString()}`,
        createdAt: now,
      }).catch((error) => {
        logger.error('Create admin plan canceled notification error:', error)
      })
    } else if (action === 'ban') {
      banEmailResult = await sendAccountStatusEmail(target.email, 'banned')
      if (!banEmailResult.sent) {
        logger.error('Ban email was not sent:', banEmailResult.error || 'Unknown error')
      }
    } else if (action === 'unban') {
      banEmailResult = await sendAccountStatusEmail(target.email, 'unbanned')
      if (!banEmailResult.sent) {
        logger.error('Unban email was not sent:', banEmailResult.error || 'Unknown error')
      }
    }

    return NextResponse.json({
      ok: true,
      user: updated,
      emailSent: banEmailResult?.sent ?? undefined,
      emailProvider: banEmailResult?.provider ?? undefined,
      emailError: banEmailResult?.sent ? undefined : banEmailResult?.error,
    })
  } catch (error) {
    logger.error('Admin manage user error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
