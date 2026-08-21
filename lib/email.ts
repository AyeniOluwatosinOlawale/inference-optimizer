import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'noop');
}

function getFrom() {
  return process.env.RESEND_FROM_EMAIL ?? 'Inference Optimizer | AI Inference Gateway <onboarding@resend.dev>';
}

const BASE_URL = process.env.BASE_URL ?? 'https://inference-web-theta.vercel.app';

function header() {
  return `<tr><td style="background:#f97316;padding:32px 40px;text-align:center">
  <span style="font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.5px">Inference Optimizer</span>
  <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px">AI INFERENCE GATEWAY</p>
</td></tr>`;
}

function wrap(content: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
${header()}
${content}
</table></td></tr></table>
</body></html>`;
}

export async function sendWelcomeEmail(email: string, name?: string) {
  const displayName = name || email.split('@')[0];
  await getResend().emails.send({
    from: getFrom(),
    to: email,
    subject: 'Welcome to Inference Optimizer',
    html: wrap(`<tr><td style="padding:40px 40px 32px">
  <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827">Welcome, ${displayName}!</h1>
  <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6">
    Your account is ready. Inference Optimizer sits between your app and any LLM provider —
    automatically routing to the cheapest model, caching duplicate requests, and showing you exactly how much you save.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
    <tr>
      <td style="text-align:center;padding:16px 8px;background:#f9fafb;border-radius:8px"><div style="font-size:22px;font-weight:700;color:#f97316">13</div><div style="font-size:12px;color:#6b7280;margin-top:2px">Optimisations</div></td>
      <td width="6px"></td>
      <td style="text-align:center;padding:16px 8px;background:#f9fafb;border-radius:8px"><div style="font-size:22px;font-weight:700;color:#10b981">~70%</div><div style="font-size:12px;color:#6b7280;margin-top:2px">Avg Cost Savings</div></td>
      <td width="6px"></td>
      <td style="text-align:center;padding:16px 8px;background:#f9fafb;border-radius:8px"><div style="font-size:22px;font-weight:700;color:#3b82f6">5</div><div style="font-size:12px;color:#6b7280;margin-top:2px">Providers</div></td>
    </tr>
  </table>
  <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#111827">Get started in 3 steps:</p>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6"><span style="display:inline-block;width:22px;height:22px;background:#f97316;color:#fff;border-radius:50%;text-align:center;font-size:12px;font-weight:700;line-height:22px;margin-right:10px">1</span><span style="font-size:14px;color:#374151">Add your provider API key (OpenAI, Anthropic, Gemini…)</span></td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6"><span style="display:inline-block;width:22px;height:22px;background:#f97316;color:#fff;border-radius:50%;text-align:center;font-size:12px;font-weight:700;line-height:22px;margin-right:10px">2</span><span style="font-size:14px;color:#374151">Generate a Gateway API key</span></td></tr>
    <tr><td style="padding:10px 0"><span style="display:inline-block;width:22px;height:22px;background:#f97316;color:#fff;border-radius:50%;text-align:center;font-size:12px;font-weight:700;line-height:22px;margin-right:10px">3</span><span style="font-size:14px;color:#374151">Point your app at the gateway — done</span></td></tr>
  </table>
  <div style="margin-top:32px;text-align:center">
    <a href="${BASE_URL}/dashboard/gateway" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:8px">Open Dashboard →</a>
  </div>
</td></tr>
<tr><td style="padding:24px 40px;border-top:1px solid #f3f4f6;text-align:center">
  <p style="margin:0;font-size:12px;color:#9ca3af">You're receiving this because you signed up at <a href="${BASE_URL}" style="color:#f97316;text-decoration:none">Inference Optimizer</a>.</p>
</td></tr>`),
  });
}

export async function sendInvitationEmail(email: string, teamName: string, role: string, inviteId: number) {
  const inviteUrl = `${BASE_URL}/sign-up?inviteId=${inviteId}`;
  await getResend().emails.send({
    from: getFrom(),
    to: email,
    subject: `You've been invited to join ${teamName} on Inference Optimizer`,
    html: wrap(`<tr><td style="padding:40px">
  <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827">You're invited!</h1>
  <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6">
    You've been invited to join <strong style="color:#111827">${teamName}</strong> as a <strong style="color:#111827">${role}</strong> on Inference Optimizer.
  </p>
  <div style="text-align:center;margin:32px 0">
    <a href="${inviteUrl}" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:8px">Accept Invitation →</a>
  </div>
  <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">If you didn't expect this, ignore this email.</p>
</td></tr>`),
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`;
  await getResend().emails.send({
    from: getFrom(),
    to: email,
    subject: 'Reset your Inference Optimizer password',
    html: wrap(`<tr><td style="padding:40px">
  <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827">Reset your password</h1>
  <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6">Click below to set a new password. This link expires in <strong>1 hour</strong>.</p>
  <div style="text-align:center;margin:32px 0">
    <a href="${resetUrl}" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:8px">Reset Password →</a>
  </div>
  <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center">If you didn't request this, ignore this email. Your password won't change.</p>
</td></tr>`),
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${BASE_URL}/verify-email?token=${token}`;
  await getResend().emails.send({
    from: getFrom(),
    to: email,
    subject: 'Verify your Inference Optimizer email',
    html: wrap(`<tr><td style="padding:40px">
  <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827">Verify your email</h1>
  <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6">Click below to confirm your email address. This link expires in <strong>24 hours</strong>.</p>
  <div style="text-align:center;margin:32px 0">
    <a href="${verifyUrl}" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:8px">Verify Email →</a>
  </div>
  <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center">If you didn't sign up, ignore this email.</p>
</td></tr>`),
  });
}

export async function sendUsageAlertEmail(email: string, spendUsd: number, thresholdUsd: number) {
  await getResend().emails.send({
    from: getFrom(),
    to: email,
    subject: `Usage alert: you've spent $${spendUsd.toFixed(4)} this month`,
    html: wrap(`<tr><td style="padding:40px">
  <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827">Monthly usage alert</h1>
  <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6">
    Your team's LLM spend has reached <strong>$${spendUsd.toFixed(4)}</strong> this month, crossing your $$${thresholdUsd} alert threshold.
  </p>
  <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:16px;margin-bottom:24px;text-align:center">
    <span style="font-size:28px;font-weight:800;color:#92400e">$${spendUsd.toFixed(4)}</span>
    <div style="font-size:13px;color:#92400e;margin-top:4px">spent this month</div>
  </div>
  <div style="text-align:center">
    <a href="${BASE_URL}/dashboard/gateway" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:8px">View Dashboard →</a>
  </div>
</td></tr>`),
  });
}
