import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? 'Inference Optimizer | AI Inference Gateway <noreply@inference-web-theta.vercel.app>';
const BASE_URL = process.env.BASE_URL ?? 'https://inference-web-theta.vercel.app';

export async function sendWelcomeEmail(email: string, name?: string) {
  const displayName = name || email.split('@')[0];
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Welcome to Inference Optimizer',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">

        <!-- Header -->
        <tr>
          <td style="background:#f97316;padding:32px 40px;text-align:center">
            <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px">Inference Optimizer</span>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px">AI INFERENCE GATEWAY</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px">
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827">Welcome, ${displayName}!</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6">
              Your account is ready. Inference Optimizer sits between your application and any LLM provider — automatically routing to the cheapest model that fits, caching duplicate requests, and showing you exactly how much you save.
            </p>

            <!-- Stats row -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
              <tr>
                <td width="33%" style="text-align:center;padding:16px 8px;background:#f9fafb;border-radius:8px;margin-right:8px">
                  <div style="font-size:22px;font-weight:700;color:#f97316">13</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:2px">Optimisations</div>
                </td>
                <td width="4px"></td>
                <td width="33%" style="text-align:center;padding:16px 8px;background:#f9fafb;border-radius:8px">
                  <div style="font-size:22px;font-weight:700;color:#10b981">~70%</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:2px">Avg Cost Savings</div>
                </td>
                <td width="4px"></td>
                <td width="33%" style="text-align:center;padding:16px 8px;background:#f9fafb;border-radius:8px">
                  <div style="font-size:22px;font-weight:700;color:#3b82f6">5</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:2px">Providers</div>
                </td>
              </tr>
            </table>

            <!-- Steps -->
            <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#111827">Get started in 3 steps:</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6">
                  <span style="display:inline-block;width:22px;height:22px;background:#f97316;color:#fff;border-radius:50%;text-align:center;font-size:12px;font-weight:700;line-height:22px;margin-right:10px">1</span>
                  <span style="font-size:14px;color:#374151">Add your provider API key (OpenAI, Anthropic, Gemini…)</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6">
                  <span style="display:inline-block;width:22px;height:22px;background:#f97316;color:#fff;border-radius:50%;text-align:center;font-size:12px;font-weight:700;line-height:22px;margin-right:10px">2</span>
                  <span style="font-size:14px;color:#374151">Generate a Gateway API key</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0">
                  <span style="display:inline-block;width:22px;height:22px;background:#f97316;color:#fff;border-radius:50%;text-align:center;font-size:12px;font-weight:700;line-height:22px;margin-right:10px">3</span>
                  <span style="font-size:14px;color:#374151">Point your app at the gateway — done</span>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <div style="margin-top:32px;text-align:center">
              <a href="${BASE_URL}/dashboard/gateway"
                 style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:8px">
                Open Dashboard →
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #f3f4f6;text-align:center">
            <p style="margin:0;font-size:12px;color:#9ca3af">
              You're receiving this because you signed up at <a href="${BASE_URL}" style="color:#f97316;text-decoration:none">Inference Optimizer</a>.
              If this wasn't you, you can safely ignore this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
    `.trim(),
  });
}

export async function sendInvitationEmail(
  email: string,
  teamName: string,
  role: string,
  inviteId: number,
) {
  const inviteUrl = `${BASE_URL}/sign-up?inviteId=${inviteId}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `You've been invited to join ${teamName} on Inference Optimizer`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">

        <tr>
          <td style="background:#f97316;padding:32px 40px;text-align:center">
            <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px">Inference Optimizer</span>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px">AI INFERENCE GATEWAY</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px 40px 32px">
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827">You're invited!</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6">
              You've been invited to join <strong style="color:#111827">${teamName}</strong> as a <strong style="color:#111827">${role}</strong> on Inference Optimizer.
            </p>
            <div style="text-align:center;margin-top:32px">
              <a href="${inviteUrl}"
                 style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:8px">
                Accept Invitation →
              </a>
            </div>
            <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;text-align:center">
              This link will take you to the sign-up page. If you already have an account, sign in first.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 40px;border-top:1px solid #f3f4f6;text-align:center">
            <p style="margin:0;font-size:12px;color:#9ca3af">
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
    `.trim(),
  });
}
