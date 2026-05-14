import { Resend } from 'resend';
import { env } from '../config/env';
import { logger } from '../config/logger';

let client: Resend | null = null;

function getClient(): Resend {
  if (!client) client = new Resend(env.RESEND_API_KEY);
  return client;
}

export async function sendLoginOtp(to: string, otp: string, firstName: string): Promise<void> {
  if (!env.RESEND_API_KEY) {
    logger.warn(`[DEV] Email not sent — no RESEND_API_KEY. OTP for ${to}: ${otp}`);
    return;
  }

  const { error } = await getClient().emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: `${otp} is your Crystal login code`,
    html: buildOtpEmail(otp, firstName),
  });

  if (error) {
    logger.error('Resend error', error);
    throw new Error('Failed to send verification email');
  }

  logger.info(`Login OTP sent to ${to}`);
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

          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0 0 8px;font-size:20px;font-weight:600;color:#F0F4F8;">
                Hey ${firstName},
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:#718096;line-height:1.6;">
                Use the code below to complete your login. It expires in
                <strong style="color:#00D4FF;">10 minutes</strong>.
              </p>

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

              <p style="margin:0;font-size:13px;color:#4A5568;line-height:1.6;">
                If you didn't try to sign in, you can safely ignore this email.
              </p>
            </td>
          </tr>

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
