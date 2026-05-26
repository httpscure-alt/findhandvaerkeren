/**
 * Advero transactional email HTML — matches public/brand-v2/email previews.
 */

export type AdveroEmailId =
  | 'email-verification'
  | 'welcome-onboarding'
  | 'onboarding-reminder'
  | 'password-reset'
  | 'password-reset-success'
  | 'audit-report-preview'
  | 'audit-report-full'
  | 'payment-receipt'
  | 'account-updated';

const F = "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const mono = "'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace";
const slate = '#334155';
const slateMid = '#64748B';
const ink = '#0F172A';
const body = '#64748B';
const muted = '#94A3B8';
const white = '#FFFFFF';
const line = '#E2E8F0';
const panel = '#F8FAFC';

export function adveroSiteUrl(): string {
  return (process.env.ADVERO_SITE_URL || process.env.FRONTEND_URL || 'https://advero.dk').replace(/\/$/, '');
}

export function adveroAssetUrl(file: string): string {
  const base = (process.env.ADVERO_EMAIL_ASSETS_URL || `${adveroSiteUrl()}/brand-v2/email`).replace(/\/$/, '');
  return `${base}/${file}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function displayName(name?: string | null, email?: string): string {
  const n = (name || '').trim();
  if (n) return n.split(/\s+/)[0] || n;
  if (email) return email.split('@')[0] || 'der';
  return 'der';
}

function shell(title: string, preheader: string, content: string, footerNote: string): string {
  const site = adveroSiteUrl();
  const logo = adveroAssetUrl('advero-wordmark-light.png');
  return `<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${slate};">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${slate};">
    <tr>
      <td align="center" style="padding:36px 16px 44px 16px;">
        <table role="presentation" width="520" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:520px;">
          <tr>
            <td align="left" style="padding:0 0 24px 2px;">
              <a href="${site}/" style="text-decoration:none;">
                <img src="${logo}" width="108" alt="Advero" style="display:block;border:0;max-width:108px;height:auto;" />
              </a>
            </td>
          </tr>
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${white};border-radius:20px;box-shadow:0 32px 64px -24px rgba(15,23,42,0.45);">
                <tr><td style="padding:32px 28px 36px 28px;font-family:${F};">${content}</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:22px 12px 0 12px;font-family:${F};font-size:12px;line-height:18px;color:#CBD5E1;">
              ${footerNote}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:14px 12px 0 12px;font-family:${F};font-size:11px;line-height:18px;">
              <a href="${site}/privacy" style="color:#94A3B8;text-decoration:underline;">Privatliv</a>
              <span style="color:#475569;">&nbsp;·&nbsp;</span>
              <a href="${site}/terms" style="color:#94A3B8;text-decoration:underline;">Vilkår</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function label(text: string) {
  return `<p style="margin:0 0 12px 0;font-family:${mono};font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${slateMid};">${escapeHtml(text)}</p>`;
}

function h1(text: string) {
  return `<h1 style="margin:0 0 16px 0;font-size:26px;line-height:32px;font-weight:700;color:${ink};letter-spacing:-0.03em;">${escapeHtml(text)}</h1>`;
}

function greet(name: string) {
  return `<p style="margin:0 0 8px 0;font-size:15px;line-height:24px;font-weight:600;color:${ink};">Hej ${escapeHtml(name)},</p>`;
}

function para(html: string, mb = '24px') {
  return `<p style="margin:0 0 ${mb} 0;font-size:15px;line-height:26px;color:${body};">${html}</p>`;
}

function cta(labelText: string, href: string) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0;">
    <tr>
      <td bgcolor="${slate}" style="border-radius:999px;background:linear-gradient(165deg,#64748B 0%,#334155 52%,#334155 100%);">
        <a href="${href}" style="display:inline-block;padding:14px 26px;font-family:${F};font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#ffffff;text-decoration:none;">${escapeHtml(labelText)}</a>
      </td>
    </tr>
  </table>`;
}

function ctaBlock(labelText: string, href: string, top = '8px') {
  return `<div style="margin-top:${top};">${cta(labelText, href)}</div>`;
}

function divider() {
  return `<div style="height:1px;margin:24px 0;background:linear-gradient(90deg,transparent,${line} 12%,${line} 88%,transparent);"></div>`;
}

type CheckItem = { title: string; meta?: string; current?: boolean; done?: boolean };

function checklist(items: CheckItem[]) {
  return items
    .map((item, i) => {
      const rowBg = item.current
        ? `background:linear-gradient(90deg,rgba(51,65,85,0.08),rgba(248,250,252,0.95));border-left:3px solid ${slate};`
        : 'border-left:3px solid transparent;';
      const titleColor = item.done ? muted : ink;
      const weight = item.current ? '600' : '500';
      const mark = item.done
        ? `<span style="display:inline-block;width:18px;height:18px;border-radius:999px;background:${slate};color:#fff;font-size:11px;line-height:18px;text-align:center;">✓</span>`
        : `<span style="display:inline-block;width:18px;height:18px;border-radius:999px;border:1.5px solid ${line};font-size:10px;line-height:16px;text-align:center;color:${muted};font-weight:600;">${i + 1}</span>`;
      return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:${i < items.length - 1 ? '4' : '0'}px;${rowBg}border-radius:12px;">
        <tr>
          <td width="34" valign="top" style="padding:14px 0 14px 12px;">${mark}</td>
          <td valign="top" style="padding:14px 12px 14px 0;">
            <p style="margin:0;font-size:14px;line-height:20px;font-weight:${weight};color:${titleColor};letter-spacing:-0.01em;">${escapeHtml(item.title)}</p>
            ${item.meta ? `<p style="margin:4px 0 0 0;font-size:12px;line-height:18px;color:${muted};">${escapeHtml(item.meta)}</p>` : ''}
          </td>
        </tr>
      </table>`;
    })
    .join('');
}

function codeBox(code: string, note?: string) {
  return `${divider()}
    <p style="margin:0 0 10px 0;font-family:${mono};font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${slateMid};">Alternativ kode</p>
    <div style="background:${panel};border:1px solid ${line};border-radius:12px;padding:20px;text-align:center;">
      <span style="font-family:${mono};font-size:28px;font-weight:600;letter-spacing:0.3em;color:${ink};">${escapeHtml(code)}</span>
    </div>
    ${note ? `<p style="margin:10px 0 0 0;font-size:13px;line-height:20px;color:${muted};">${escapeHtml(note)}</p>` : ''}`;
}

function linkBox(url: string) {
  return `${divider()}
    <p style="margin:0 0 10px 0;font-family:${mono};font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${slateMid};">Direkte link</p>
    <div style="background:${panel};border:1px solid ${line};border-radius:12px;padding:14px 16px;">
      <code style="font-family:${mono};font-size:11px;line-height:17px;color:${ink};word-break:break-all;">${escapeHtml(url)}</code>
    </div>`;
}

function kvRows(rows: { k: string; v: string }[]) {
  const trs = rows
    .map(
      (r, i) =>
        `<tr><td style="padding:14px 0;${i < rows.length - 1 ? `border-bottom:1px solid ${line};` : ''}">
          <span style="font-family:${mono};font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${muted};">${escapeHtml(r.k)}</span><br/>
          <span style="font-size:15px;font-weight:600;color:${ink};letter-spacing:-0.01em;">${escapeHtml(r.v)}</span>
        </td></tr>`
    )
    .join('');
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${trs}</table>`;
}

function channelScoreCell(label: string, score: string | number) {
  const pct = Math.min(100, Math.max(0, Number(score) || 0));
  return `<td width="50%" valign="top" style="padding:5px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${panel};border:1px solid ${line};border-radius:12px;">
      <tr><td style="padding:14px 14px 8px 14px;">
        <p style="margin:0;font-family:${mono};font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${muted};">${escapeHtml(label)}</p>
        <p style="margin:8px 0 0 0;font-size:28px;font-weight:700;color:${ink};letter-spacing:-0.04em;line-height:1;">${escapeHtml(String(score))}</p>
      </td></tr>
      <tr><td style="padding:0 14px 14px 14px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
          <td style="height:6px;background:#E2E8F0;border-radius:999px;font-size:0;line-height:0;">
            <div style="width:${pct}%;max-width:100%;height:6px;background:${slate};border-radius:999px;">&nbsp;</div>
          </td>
        </tr></table>
      </td></tr>
    </table>
  </td>`;
}

function auditReportDigest(
  score: string | number,
  delta: string,
  channels: { k: string; v: string | number }[],
  recommendation: string
) {
  const deltaLabel = delta.startsWith('+') || delta.startsWith('-') ? `${delta} pts` : delta;
  const [c0, c1, c2, c3] = channels;
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:16px;border:1px solid ${line};border-radius:16px;overflow:hidden;background:linear-gradient(165deg,#f8fafc 0%,#ffffff 55%);">
      <tr>
        <td style="padding:22px 22px 6px 22px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
            <td valign="bottom">
              <p style="margin:0;font-family:${mono};font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${slateMid};">Samlet synlighedsscore</p>
            </td>
            <td valign="bottom" align="right">
              <span style="display:inline-block;padding:6px 11px;border-radius:999px;background:#ecfdf5;border:1px solid #a7f3d0;font-size:11px;font-weight:700;color:#047857;letter-spacing:0.02em;">${escapeHtml(deltaLabel)}</span>
            </td>
          </tr></table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:4px 22px 22px 22px;">
          <span style="font-size:56px;line-height:1;font-weight:700;color:${ink};letter-spacing:-0.05em;">${escapeHtml(String(score))}</span>
          <span style="font-size:18px;font-weight:500;color:${muted};">/100</span>
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:18px;">
      <tr>${channelScoreCell(c0.k, c0.v)}${channelScoreCell(c1.k, c1.v)}</tr>
      <tr>${channelScoreCell(c2.k, c2.v)}${channelScoreCell(c3.k, c3.v)}</tr>
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;background:${panel};border:1px solid ${line};border-radius:14px;border-left:3px solid ${slate};">
      <tr><td style="padding:16px 18px;">
        <p style="margin:0 0 6px 0;font-family:${mono};font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${slateMid};">Top anbefaling</p>
        <p style="margin:0;font-size:14px;line-height:22px;color:${ink};font-weight:500;">${escapeHtml(recommendation)}</p>
      </td></tr>
    </table>
  `;
}

export function renderAdveroOtpEmail(opts: { name?: string | null; email: string; code: string; verifyUrl?: string }) {
  const site = adveroSiteUrl();
  const first = displayName(opts.name, opts.email);
  const verifyUrl = opts.verifyUrl || `${site}/verify-email?email=${encodeURIComponent(opts.email)}`;
  const content = `
    ${label('Sikkerhed')}
    ${h1('Bekræft din e-mail')}
    ${greet(first)}
    ${para('Bekræft adressen for at aktivere kontoen. Brug knappen eller koden herunder.', '20px')}
    ${cta('Bekræft e-mail', verifyUrl)}
    ${codeBox(opts.code, 'Koden udløber om 10 minutter.')}
  `;
  return {
    subject: 'Bekræft e-mail — Advero',
    html: shell('Bekræft e-mail — Advero', 'Bekræft din e-mail for at aktivere Advero.', content, 'Hvis du ikke har oprettet en konto, kan du ignorere denne e-mail.'),
  };
}

export function renderAdveroWelcomeEmail(opts: { name?: string | null; email: string }) {
  const site = adveroSiteUrl();
  const first = displayName(opts.name, opts.email);
  const content = `
    ${label('Velkommen')}
    ${h1('Kom i gang med synlighed')}
    ${greet(first)}
    ${para('Vi hjælper jer med at blive lettere at finde — i søgning, på kort og i AI. Tre hurtige trin:')}
    ${checklist([
      { title: 'Bekræft din e-mail', meta: 'Aktiver konto og dashboard', done: true },
      { title: 'Udfyld virksomhedsprofil', meta: 'Branche, område og mål', current: true },
      { title: 'Book synlighedsaudit', meta: 'Score og anbefalinger' },
    ])}
    ${ctaBlock('Fortsæt', `${site}/advero/get-started`, '28px')}
    ${divider()}
    ${para(`Spørgsmål? Skriv til <a href="mailto:hello@advero.dk" style="color:#334155;font-weight:600;text-decoration:underline;">hello@advero.dk</a>`, '0')}
  `;
  return {
    subject: 'Velkommen til Advero',
    html: shell('Velkommen til Advero', 'Kom i gang med synlighed hos Advero.', content, 'Du modtager denne e-mail, fordi du har oprettet en konto hos Advero.'),
  };
}

export function renderAdveroPasswordResetEmail(opts: { name?: string | null; email: string; resetUrl: string }) {
  const first = displayName(opts.name, opts.email);
  const content = `
    ${label('Sikkerhed')}
    ${h1('Nulstil adgangskode')}
    ${greet(first)}
    ${para('Vi har modtaget en anmodning om at nulstille din adgangskode. Linket udløber om 60 minutter.', '20px')}
    ${cta('Nulstil adgangskode', opts.resetUrl)}
    ${divider()}
    ${para('<span style="font-size:14px;">Hvis du ikke har bedt om dette, kan du ignorere e-mailen.</span>', '0')}
    ${linkBox(opts.resetUrl)}
  `;
  return {
    subject: 'Nulstil adgangskode — Advero',
    html: shell('Nulstil adgangskode — Advero', 'Link til ny adgangskode.', content, 'Transaktionel sikkerheds-e-mail fra Advero.'),
  };
}

export function renderAdveroPasswordResetSuccessEmail(opts: { name?: string | null; email: string; changedAt?: string }) {
  const site = adveroSiteUrl();
  const first = displayName(opts.name, opts.email);
  const when = opts.changedAt || new Date().toLocaleString('da-DK', { dateStyle: 'medium', timeStyle: 'short' });
  const content = `
    ${label('Sikkerhed')}
    ${h1('Adgangskode opdateret')}
    ${greet(first)}
    ${para(`Ændret <strong style="color:#0F172A;">${escapeHtml(when)}</strong>. Hvis det var dig, behøver du ikke gøre mere.`, '20px')}
    ${ctaBlock('Log ind', `${site}/advero/login`, '0')}
    ${divider()}
    ${para(`Var det ikke dig? <a href="${site}/auth/forgot-password" style="color:#334155;font-weight:600;text-decoration:underline;">Nulstil igen</a>`, '0')}
  `;
  return {
    subject: 'Adgangskode opdateret — Advero',
    html: shell('Adgangskode opdateret — Advero', 'Din adgangskode er ændret.', content, 'Transaktionel sikkerheds-e-mail fra Advero.'),
  };
}

export function renderAdveroPaymentReceiptEmail(opts: {
  name?: string | null;
  email: string;
  plan: string;
  amount: string;
  invoiceId: string;
}) {
  const site = adveroSiteUrl();
  const first = displayName(opts.name, opts.email);
  const content = `
    ${label('Faktura')}
    ${h1('Betaling modtaget')}
    ${greet(first)}
    ${para('Tak for din betaling.', '20px')}
    ${kvRows([
      { k: 'Plan', v: opts.plan },
      { k: 'Beløb', v: opts.amount },
      { k: 'Faktura', v: opts.invoiceId },
    ])}
    ${ctaBlock('Se faktura', `${site}/dashboard/billing`, '24px')}
  `;
  return {
    subject: 'Betaling modtaget — Advero',
    html: shell('Betaling modtaget — Advero', `Kvittering for ${opts.plan}.`, content, 'Transaktionel kvittering fra Advero.'),
  };
}

export function renderAdveroPaymentFailedEmail(opts: {
  name?: string | null;
  email: string;
  amount: string;
  reason: string;
  actionUrl?: string;
}) {
  const site = adveroSiteUrl();
  const first = displayName(opts.name, opts.email);
  const actionUrl = opts.actionUrl || `${site}/dashboard/billing`;
  const content = `
    ${label('Betaling')}
    ${h1('Betaling mislykkedes')}
    ${greet(first)}
    ${para(`Vi kunne ikke gennemføre betalingen på <strong style="color:#0F172A;">${escapeHtml(opts.amount)}</strong>.`, '16px')}
    ${para(escapeHtml(opts.reason), '20px')}
    ${ctaBlock('Opdater betaling', actionUrl, '0')}
  `;
  return {
    subject: 'Betaling mislykkedes — Advero',
    html: shell('Betaling mislykkedes — Advero', 'Handling påkrævet for din betaling.', content, 'Transaktionel e-mail fra Advero.'),
  };
}

function reportPreviewGateNotice() {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;background:#fffbeb;border:1px solid #fde68a;border-radius:14px;">
      <tr><td style="padding:14px 16px;">
        <p style="margin:0;font-family:${mono};font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#b45309;">Preview</p>
        <p style="margin:6px 0 0 0;font-size:13px;line-height:20px;color:#92400e;">Fuld rapport med alle anbefalinger, konkurrenter og handlingsplan låses op efter <strong style="color:#78350f;">12 betalte måneder</strong>.</p>
      </td></tr>
    </table>
  `;
}

function fullReportActionPlan(items: { title: string; meta: string }[]) {
  const rows = items
    .map(
      (item, i) => `
      <tr>
        <td style="padding:12px 0;${i < items.length - 1 ? `border-bottom:1px solid ${line};` : ''}">
          <p style="margin:0;font-size:14px;line-height:21px;color:${ink};font-weight:600;">${escapeHtml(item.title)}</p>
          <p style="margin:4px 0 0 0;font-size:13px;line-height:19px;color:${body};">${escapeHtml(item.meta)}</p>
        </td>
      </tr>`
    )
    .join('');
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;background:${white};border:1px solid ${line};border-radius:14px;">
      <tr><td style="padding:16px 18px 8px 18px;">
        <p style="margin:0 0 10px 0;font-family:${mono};font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${slateMid};">Prioriteret handlingsplan</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${rows}</table>
      </td></tr>
    </table>
  `;
}

export type AuditReportEmailData = {
  name?: string | null;
  email: string;
  score: number | string;
  delta: string;
  channels: { k: string; v: number | string }[];
  recommendation: string;
  reportUrl?: string;
  actionItems?: { title: string; meta: string }[];
  planHeadline?: string;
  planReason?: string;
  planCtaUrl?: string;
};

function recommendedPlanBlock(headline: string, reason: string, ctaUrl: string, ctaLabel: string) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;background:${panel};border:1px solid ${line};border-radius:14px;border-left:3px solid ${slate};">
      <tr><td style="padding:18px 20px;">
        <p style="margin:0 0 6px 0;font-family:${mono};font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${slateMid};">Anbefalet pakke</p>
        <p style="margin:0 0 8px 0;font-size:16px;line-height:24px;color:${ink};font-weight:600;">${escapeHtml(headline)}</p>
        <p style="margin:0 0 16px 0;font-size:14px;line-height:22px;color:${body};">${escapeHtml(reason)}</p>
        <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:12px 22px;font-family:${F};font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#ffffff;text-decoration:none;border-radius:999px;background:linear-gradient(180deg,#475569 0%,#334155 100%);">${escapeHtml(ctaLabel)}</a>
      </td></tr>
    </table>
  `;
}

export function renderAdveroAuditReportPreviewEmail(opts: AuditReportEmailData) {
  const site = adveroSiteUrl();
  const first = displayName(opts.name, opts.email);
  const reportUrl = opts.reportUrl || `${site}/advero/reports/preview`;
  const planBlock =
    opts.planHeadline && opts.planReason && opts.planCtaUrl
      ? recommendedPlanBlock(opts.planHeadline, opts.planReason, opts.planCtaUrl, 'Start anbefalet plan')
      : '';
  const content = `
    ${label('Preview')}
    ${h1('Preview-rapport klar')}
    ${greet(first)}
    ${para('Jeres første synlighedsaudit er færdig. Her er et teaser-overblik — den fulde rapport med alle anbefalinger kommer senere.', '20px')}
    ${reportPreviewGateNotice()}
    ${auditReportDigest(opts.score, opts.delta, opts.channels, opts.recommendation)}
    ${planBlock}
    ${ctaBlock('Se preview-rapport', reportUrl, planBlock ? '12px' : '0')}
  `;
  return {
    subject: 'Preview-rapport klar — Advero',
    html: shell(
      'Preview-rapport klar — Advero',
      'Jeres preview-audit er klar.',
      content,
      'Du modtager denne e-mail, fordi preview-rapporten er klar på din konto.'
    ),
  };
}

export function renderAdveroAuditReportFullEmail(opts: AuditReportEmailData) {
  const site = adveroSiteUrl();
  const first = displayName(opts.name, opts.email);
  const reportUrl = opts.reportUrl || `${site}/dashboard/reports`;
  const actionItems = opts.actionItems || [];
  const content = `
    ${label('Rapport')}
    ${h1('Fuld synlighedsrapport klar')}
    ${greet(first)}
    ${para('Jeres fulde synlighedsrapport er klar med alle kanaler, anbefalinger og prioriteret handlingsplan.', '20px')}
    ${auditReportDigest(opts.score, opts.delta, opts.channels, opts.recommendation)}
    ${actionItems.length ? fullReportActionPlan(actionItems) : ''}
    ${ctaBlock('Se fuld rapport', reportUrl, '0')}
  `;
  return {
    subject: 'Fuld synlighedsrapport klar — Advero',
    html: shell(
      'Fuld synlighedsrapport klar — Advero',
      'Jeres fulde synlighedsaudit er klar.',
      content,
      'Du modtager denne e-mail, fordi den fulde rapport er klar på din konto.'
    ),
  };
}

/** @deprecated Use renderAdveroAuditReportPreviewEmail or renderAdveroAuditReportFullEmail */
export function renderAdveroAuditReportEmail(opts: AuditReportEmailData) {
  return renderAdveroAuditReportFullEmail(opts);
}

export function renderAdveroSubscriptionActivatedEmail(opts: {
  name?: string | null;
  email: string;
  tier: string;
  companyName: string;
}) {
  const site = adveroSiteUrl();
  const first = displayName(opts.name, opts.email);
  const content = `
    ${label('Abonnement')}
    ${h1('Abonnement aktiveret')}
    ${greet(first)}
    ${para(`Dit <strong style="color:#0F172A;">${escapeHtml(opts.tier)}</strong>-abonnement for <strong style="color:#0F172A;">${escapeHtml(opts.companyName)}</strong> er nu aktivt.`, '20px')}
    ${ctaBlock('Gå til dashboard', `${site}/dashboard`, '0')}
  `;
  return {
    subject: 'Abonnement aktiveret — Advero',
    html: shell('Abonnement aktiveret — Advero', 'Dit abonnement er aktivt.', content, 'Transaktionel e-mail fra Advero.'),
  };
}
