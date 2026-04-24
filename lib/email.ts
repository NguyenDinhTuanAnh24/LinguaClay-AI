import { Resend } from 'resend'
import nodemailer from 'nodemailer'

export type EmailSendResult = {
  sent: boolean
  provider: 'resend' | 'gmail' | null
  error?: string
}

export async function sendSystemEmail(toEmail: string, subject: string, messageHtml: string, messageText: string): Promise<EmailSendResult> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://linguaclay.com'
  const escapedSubject = subject.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${escapedSubject}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap');
    body, table, td, p, a, h1, h2, h3, span { font-family: 'Be Vietnam Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif !important; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Be Vietnam Pro','Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <tr><td align="center" style="padding-bottom:24px;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="background:#111111;padding:14px 32px;">
        <span style="color:#ffffff;font-size:20px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;">LINGUACLAY</span>
      </td>
    </tr></table>
  </td></tr>

  <tr><td style="background:#ffffff;border:2px solid #111111;box-shadow:6px 6px 0px #111111;padding:40px 40px 32px;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.18em;color:#6b7280;">Thông báo từ hệ thống</p>
    <h1 style="margin:0 0 24px;font-size:20px;font-weight:900;color:#111111;line-height:1.3;">${escapedSubject}</h1>
    <div style="border-top:2px solid #111111;margin-bottom:24px;"></div>
    <div style="font-size:15px;color:#333333;line-height:1.75;">${messageHtml}</div>
    <div style="border-top:1px dashed #d1d5db;margin:32px 0 24px;"></div>
    <table cellpadding="0" cellspacing="0"><tr><td>
      <a href="${siteUrl}" style="display:inline-block;background:#111111;color:#ffffff;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.14em;text-decoration:none;padding:12px 28px;border:2px solid #111111;">Truy c&#7853;p LinguaClay &#8594;</a>
    </td></tr></table>
  </td></tr>

  <tr><td align="center" style="padding:28px 0 0;">
    <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">LinguaClay — N&#7873;n t&#7843;ng h&#7885;c ti&#7871;ng Anh th&#244;ng minh</p>
    <p style="margin:0;font-size:11px;color:#d1d5db;">B&#7841;n nh&#7853;n &#273;&#432;&#7907;c email n&#224;y v&#236; &#273;&#227; c&#243; t&#224;i kho&#7843;n t&#7841;i LinguaClay.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`

  const resendApiKey = process.env.RESEND_API_KEY
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey)
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'LinguaClay Support <onboarding@resend.dev>'
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject,
        html,
        text: messageText,
      })
      if (!error) {
        return { sent: true, provider: 'resend' }
      }
      console.error(`Resend email error:`, error)
    } catch (error) {
      console.error(`Resend email exception:`, error)
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
        to: toEmail,
        subject,
        html,
        text: messageText,
      })

      return { sent: true, provider: 'gmail' }
    } catch (error) {
      console.error(`Gmail email error:`, error)
      return { sent: false, provider: null, error: 'Gmail send failed' }
    }
  }

  return { sent: false, provider: null, error: 'Missing RESEND_API_KEY and GMAIL_USER/GMAIL_PASS' }
}
