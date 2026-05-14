import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../config/logger';

let transporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
  if (transporter) return transporter;

  if (env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  } else {
    // Dev fallback — Ethereal test account (emails visible at ethereal.email)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    logger.info(`Ethereal test account: ${testAccount.user}`);
  }

  return transporter;
}

export async function sendLoginOtp(to: string, otp: string, firstName: string): Promise<void> {
  const t = await getTransporter();

  const info = await t.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: `${otp} is your Crystal login code`,
    html: buildOtpEmail(otp, firstName),
    text: `Your Crystal login code is: ${otp}. It expires in 10 minutes.`,
  });

  if (env.isDev) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    logger.info(`Login OTP for ${to}: ${otp}`);
    if (previewUrl) logger.info(`Email preview: ${previewUrl}`);
  }
}

function buildOtpEmail(otp: string, firstName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#060912;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060912;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0"
          style="background:#0D1117;border-radius:16px;border:1px solid #1A2332;overflow:hidden;max-width:480px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#00D4FF,#7B2FFF);padding:3px 0 0;"></td>
          </tr>
          <tr>
            <td style="padding:32px 40px 24px;text-align:center;">
              <p style="margin:0 0 4px;font-size:22px;font-weight:700;letter-spacing:4px;
                background:linear-gradient(135deg,#00D4FF,#7B2FFF);
                -webkit-background-clip:text;-webkit-text-fill-color:transparent;">
                CRYSTAL
              </p>
              <p style="margin:0;font-size:11px;color:#4A5568;letter-spacing:3px;text-transform:uppercase;">
                Crypto Wallet
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0 0 8px;font-size:20px;font-weight:600;color:#F0F4F8;">
                Hey ${firstName},
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:#718096;line-height:1.6;">
                Use the code below to complete your login. It expires in <strong style="color:#00D4FF;">10 minutes</strong>.
              </p>

              <!-- OTP box -->
              <div style="background:#060912;border:1px solid #1A2332;border-radius:12px;
                padding:28px;text-align:center;margin-bottom:28px;
                box-shadow:0 0 24px rgba(0,212,255,0.08);">
                <p style="margin:0 0 8px;font-size:11px;color:#4A5568;letter-spacing:3px;text-transform:uppercase;">
                  Verification Code
                </p>
                <p style="margin:0;font-size:40px;font-weight:700;letter-spacing:12px;
                  color:#00D4FF;font-family:'Courier New',monospace;">
                  ${otp}
                </p>
              </div>

              <p style="margin:0 0 8px;font-size:13px;color:#4A5568;line-height:1.6;">
                If you didn't try to sign in, you can safely ignore this email — someone may have typed your email by mistake.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #1A2332;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#2D3748;">
                &copy; ${new Date().getFullYear()} Crystal. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
