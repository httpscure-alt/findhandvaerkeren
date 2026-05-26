import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const dir = dirname(fileURLToPath(import.meta.url));

/** Advero v3 — slate canvas, white card, product checklist (not Apple/partner clone) */
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

function shell({ title, preheader, content, footerNote }) {
  return `<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet" />
  <script>(function(){try{var b=document.createElement('base');b.href=new URL('.',location.href).href;document.head.insertBefore(b,document.head.firstChild);}catch(e){}})();</script>
</head>
<body style="margin:0;padding:0;background:${slate};">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${slate};">
    <tr>
      <td align="center" style="padding:36px 16px 44px 16px;">
        <table role="presentation" width="520" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:520px;">
          <tr>
            <td align="left" style="padding:0 0 24px 2px;">
              <a href="https://advero.dk/" style="text-decoration:none;">
                <img src="advero-wordmark-light.png" width="108" alt="Advero" style="display:block;border:0;max-width:108px;height:auto;" />
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
              <a href="https://advero.dk/privacy" style="color:#94A3B8;text-decoration:underline;">Privatliv</a>
              <span style="color:#475569;">&nbsp;·&nbsp;</span>
              <a href="https://advero.dk/terms" style="color:#94A3B8;text-decoration:underline;">Vilkår</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function label(text) {
  return `<p style="margin:0 0 12px 0;font-family:${mono};font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${slateMid};">${text}</p>`;
}

function h1(text) {
  return `<h1 style="margin:0 0 16px 0;font-size:26px;line-height:32px;font-weight:700;color:${ink};letter-spacing:-0.03em;">${text}</h1>`;
}

function greet(name = 'Jonas') {
  return `<p style="margin:0 0 8px 0;font-size:15px;line-height:24px;font-weight:600;color:${ink};">Hej ${name},</p>`;
}

function para(html, mb = '24px') {
  return `<p style="margin:0 0 ${mb} 0;font-size:15px;line-height:26px;color:${body};">${html}</p>`;
}

function cta(label, href) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0;">
    <tr>
      <td bgcolor="${slate}" style="border-radius:999px;background:linear-gradient(165deg,#64748B 0%,#334155 52%,#334155 100%);">
        <a href="${href}" style="display:inline-block;padding:14px 26px;font-family:${F};font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#ffffff;text-decoration:none;">${label}</a>
      </td>
    </tr>
  </table>`;
}

function ctaBlock(label, href, top = '8px') {
  return `<div style="margin-top:${top};">${cta(label, href)}</div>`;
}

function divider() {
  return `<div style="height:1px;margin:24px 0;background:linear-gradient(90deg,transparent,${line} 12%,${line} 88%,transparent);"></div>`;
}

/** Single checklist inside the white card — matches advero-setup-row */
function checklist(items) {
  return items
    .map((item, i) => {
      const isCurrent = item.current;
      const isDone = item.done;
      const rowBg = isCurrent
        ? `background:linear-gradient(90deg,rgba(51,65,85,0.08),rgba(248,250,252,0.95));border-left:3px solid ${slate};`
        : 'border-left:3px solid transparent;';
      const titleColor = isDone ? muted : ink;
      const weight = isCurrent ? '600' : '500';
      const mark = isDone
        ? `<span style="display:inline-block;width:18px;height:18px;border-radius:999px;background:${slate};color:#fff;font-size:11px;line-height:18px;text-align:center;">✓</span>`
        : `<span style="display:inline-block;width:18px;height:18px;border-radius:999px;border:1.5px solid ${line};font-size:10px;line-height:16px;text-align:center;color:${muted};font-weight:600;">${i + 1}</span>`;
      return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:${i < items.length - 1 ? '4' : '0'}px;${rowBg}border-radius:12px;">
        <tr>
          <td width="34" valign="top" style="padding:14px 0 14px 12px;">${mark}</td>
          <td valign="top" style="padding:14px 12px 14px 0;">
            <p style="margin:0;font-size:14px;line-height:20px;font-weight:${weight};color:${titleColor};letter-spacing:-0.01em;">${item.title}</p>
            ${item.meta ? `<p style="margin:4px 0 0 0;font-size:12px;line-height:18px;color:${muted};">${item.meta}</p>` : ''}
          </td>
        </tr>
      </table>`;
    })
    .join('');
}

function codeBox(code, note) {
  return `${divider()}
    <p style="margin:0 0 10px 0;font-family:${mono};font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${slateMid};">Alternativ kode</p>
    <div style="background:${panel};border:1px solid ${line};border-radius:12px;padding:20px;text-align:center;">
      <span style="font-family:${mono};font-size:28px;font-weight:600;letter-spacing:0.3em;color:${ink};">${code}</span>
    </div>
    ${note ? `<p style="margin:10px 0 0 0;font-size:13px;line-height:20px;color:${muted};">${note}</p>` : ''}`;
}

function linkBox(url) {
  return `${divider()}
    <p style="margin:0 0 10px 0;font-family:${mono};font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${slateMid};">Direkte link</p>
    <div style="background:${panel};border:1px solid ${line};border-radius:12px;padding:14px 16px;">
      <code style="font-family:${mono};font-size:11px;line-height:17px;color:${ink};word-break:break-all;">${url}</code>
    </div>`;
}

function kvRows(rows) {
  const trs = rows
    .map(
      (r, i) =>
        `<tr><td style="padding:14px 0;${i < rows.length - 1 ? `border-bottom:1px solid ${line};` : ''}">
          <span style="font-family:${mono};font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${muted};">${r.k}</span><br/>
          <span style="font-size:15px;font-weight:600;color:${ink};letter-spacing:-0.01em;">${r.v}</span>
        </td></tr>`
    )
    .join('');
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${trs}</table>`;
}

function channelScoreCell(label, score) {
  const pct = Math.min(100, Math.max(0, Number(score) || 0));
  return `<td width="50%" valign="top" style="padding:5px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${panel};border:1px solid ${line};border-radius:12px;">
      <tr><td style="padding:14px 14px 8px 14px;">
        <p style="margin:0;font-family:${mono};font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${muted};">${label}</p>
        <p style="margin:8px 0 0 0;font-size:28px;font-weight:700;color:${ink};letter-spacing:-0.04em;line-height:1;">${score}</p>
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

function auditReportDigest(score, delta, channels, recommendation) {
  const deltaLabel = delta.startsWith('+') || delta.startsWith('-') ? `${delta} pts` : delta;
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:16px;border:1px solid ${line};border-radius:16px;overflow:hidden;background:linear-gradient(165deg,#f8fafc 0%,#ffffff 55%);">
      <tr>
        <td style="padding:22px 22px 6px 22px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
            <td valign="bottom">
              <p style="margin:0;font-family:${mono};font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${slateMid};">Samlet synlighedsscore</p>
            </td>
            <td valign="bottom" align="right">
              <span style="display:inline-block;padding:6px 11px;border-radius:999px;background:#ecfdf5;border:1px solid #a7f3d0;font-size:11px;font-weight:700;color:#047857;letter-spacing:0.02em;">${deltaLabel}</span>
            </td>
          </tr></table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:4px 22px 22px 22px;">
          <span style="font-size:56px;line-height:1;font-weight:700;color:${ink};letter-spacing:-0.05em;">${score}</span>
          <span style="font-size:18px;font-weight:500;color:${muted};">/100</span>
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:18px;">
      <tr>
        ${channelScoreCell(channels[0].k, channels[0].v)}
        ${channelScoreCell(channels[1].k, channels[1].v)}
      </tr>
      <tr>
        ${channelScoreCell(channels[2].k, channels[2].v)}
        ${channelScoreCell(channels[3].k, channels[3].v)}
      </tr>
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;background:${panel};border:1px solid ${line};border-radius:14px;border-left:3px solid ${slate};">
      <tr><td style="padding:16px 18px;">
        <p style="margin:0 0 6px 0;font-family:${mono};font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${slateMid};">Top anbefaling</p>
        <p style="margin:0;font-size:14px;line-height:22px;color:${ink};font-weight:500;">${recommendation}</p>
      </td></tr>
    </table>
  `;
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

function fullReportActionPlan(items) {
  const rows = items
    .map(
      (item, i) => `
      <tr>
        <td style="padding:12px 0;${i < items.length - 1 ? `border-bottom:1px solid ${line};` : ''}">
          <p style="margin:0;font-size:14px;line-height:21px;color:${ink};font-weight:600;">${item.title}</p>
          <p style="margin:4px 0 0 0;font-size:13px;line-height:19px;color:${body};">${item.meta}</p>
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

function recommendedPlanBlock(headline, reason, ctaUrl, ctaLabel) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;background:${panel};border:1px solid ${line};border-radius:14px;border-left:3px solid ${slate};">
      <tr><td style="padding:18px 20px;">
        <p style="margin:0 0 6px 0;font-family:${mono};font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${slateMid};">Anbefalet pakke</p>
        <p style="margin:0 0 8px 0;font-size:16px;line-height:24px;color:${ink};font-weight:600;">${headline}</p>
        <p style="margin:0 0 16px 0;font-size:14px;line-height:22px;color:${body};">${reason}</p>
        <a href="${ctaUrl}" style="display:inline-block;padding:12px 22px;font-family:${F};font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#ffffff;text-decoration:none;border-radius:999px;background:linear-gradient(180deg,#475569 0%,#334155 100%);">${ctaLabel}</a>
      </td></tr>
    </table>
  `;
}

const templates = {
  'welcome-onboarding.html': shell({
    title: 'Velkommen til Advero',
    preheader: 'Kom i gang med synlighed hos Advero.',
    footerNote: 'Du modtager denne e-mail, fordi du har oprettet en konto hos Advero.',
    content: `
      ${label('Velkommen')}
      ${h1('Kom i gang med synlighed')}
      ${greet()}
      ${para('Vi hjælper jer med at blive lettere at finde — i søgning, på kort og i AI. Tre hurtige trin:')}
      ${checklist([
        { title: 'Bekræft din e-mail', meta: 'Aktiver konto og dashboard', current: true },
        { title: 'Udfyld virksomhedsprofil', meta: 'Branche, område og mål' },
        { title: 'Book synlighedsaudit', meta: 'Score og anbefalinger' },
      ])}
      ${ctaBlock('Fortsæt', 'https://advero.dk/advero/get-started', '28px')}
      ${divider()}
      ${para('Spørgsmål? Skriv til <a href="mailto:hello@advero.dk" style="color:#334155;font-weight:600;text-decoration:underline;">hello@advero.dk</a>', '0')}
    `,
  }),

  'onboarding-reminder.html': shell({
    title: 'Færdiggør din profil — Advero',
    preheader: 'Du er næsten klar.',
    footerNote: 'Du modtager denne e-mail, fordi din profil ikke er færdig endnu.',
    content: `
      ${label('Profil')}
      ${h1('Du er næsten klar')}
      ${greet()}
      ${para('Du har gennemført <strong style="color:#0F172A;">2 af 4</strong> trin. Færdiggør for at åbne synlighedsoversigt og rapporter.')}
      ${checklist([
        { title: 'Konto oprettet', done: true },
        { title: 'E-mail bekræftet', done: true },
        { title: 'Virksomhedsprofil', meta: 'Upload info og vælg målområde', current: true },
        { title: 'Synlighedsaudit', meta: 'Book gratis gennemgang' },
      ])}
      ${ctaBlock('Fortsæt', 'https://advero.dk/advero/get-started', '28px')}
    `,
  }),

  'email-verification.html': shell({
    title: 'Bekræft e-mail — Advero',
    preheader: 'Bekræft din e-mail for at aktivere Advero.',
    footerNote: 'Hvis du ikke har oprettet en konto, kan du ignorere denne e-mail.',
    content: `
      ${label('Sikkerhed')}
      ${h1('Bekræft din e-mail')}
      ${greet()}
      ${para('Bekræft adressen for at aktivere kontoen og fortsætte.', '20px')}
      ${cta('Bekræft e-mail', 'https://advero.dk/auth/verify?token=TOKEN')}
      ${codeBox('482910', 'Udløber om 10 minutter.')}
    `,
  }),

  'password-reset.html': shell({
    title: 'Nulstil adgangskode — Advero',
    preheader: 'Link til ny adgangskode.',
    footerNote: 'Transaktionel sikkerheds-e-mail fra Advero.',
    content: `
      ${label('Sikkerhed')}
      ${h1('Nulstil adgangskode')}
      ${greet()}
      ${para('Vi har modtaget en anmodning om at nulstille din adgangskode. Linket udløber om 30 minutter.', '20px')}
      ${cta('Nulstil adgangskode', 'https://advero.dk/auth/reset-password?token=TOKEN')}
      ${divider()}
      ${para('<span style="font-size:14px;">Hvis du ikke har bedt om dette, kan du ignorere e-mailen.</span>', '0')}
      ${linkBox('https://advero.dk/auth/reset-password?token=TOKEN')}
    `,
  }),

  'password-reset-success.html': shell({
    title: 'Adgangskode opdateret — Advero',
    preheader: 'Din adgangskode er ændret.',
    footerNote: 'Transaktionel sikkerheds-e-mail fra Advero.',
    content: `
      ${label('Sikkerhed')}
      ${h1('Adgangskode opdateret')}
      ${greet()}
      ${para('Ændret <strong style="color:#0F172A;">20. maj 2026 kl. 14:32</strong>. Hvis det var dig, behøver du ikke gøre mere.', '20px')}
      ${ctaBlock('Log ind', 'https://advero.dk/auth/login', '0')}
      ${divider()}
      ${para('Var det ikke dig? <a href="https://advero.dk/auth/forgot-password" style="color:#334155;font-weight:600;text-decoration:underline;">Nulstil igen</a>', '0')}
    `,
  }),

  'audit-report-preview.html': shell({
    title: 'Preview-rapport klar — Advero',
    preheader: 'Jeres preview-audit er klar.',
    footerNote: 'Du modtager denne e-mail, fordi preview-rapporten er klar på din konto.',
    content: `
      ${label('Preview')}
      ${h1('Preview-rapport klar')}
      ${greet()}
      ${para('Jeres første synlighedsaudit er færdig. Her er et teaser-overblik — den fulde rapport med alle anbefalinger kommer senere.', '20px')}
      ${reportPreviewGateNotice()}
      ${auditReportDigest('72', '+12', [
        { k: 'Søg', v: '78' },
        { k: 'Lokal', v: '71' },
        { k: 'AI', v: '64' },
        { k: 'Web', v: '85' },
      ], 'Forbedr servicesider for mere lokal synlighed.')}
      ${recommendedPlanBlock(
        'Vi anbefaler SEO Organisk vækst',
        'Baseret på jeres audit er Lokal (71) jeres største gap. SEO Organisk vækst matcher jeres nuværende niveau.',
        'https://advero.dk/advero/get-started?seo=seo_standard&from=report',
        'Start anbefalet plan'
      )}
      ${ctaBlock('Se preview-rapport', 'https://advero.dk/advero/reports/preview', '0')}
    `,
  }),

  'audit-report-full.html': shell({
    title: 'Fuld synlighedsrapport klar — Advero',
    preheader: 'Jeres fulde audit er klar.',
    footerNote: 'Du modtager denne e-mail, fordi den fulde rapport er klar på din konto.',
    content: `
      ${label('Rapport')}
      ${h1('Fuld synlighedsrapport klar')}
      ${greet()}
      ${para('Jeres fulde synlighedsrapport er klar med alle kanaler, anbefalinger og prioriteret handlingsplan.', '20px')}
      ${auditReportDigest('72', '+12', [
        { k: 'Søg', v: '78' },
        { k: 'Lokal', v: '71' },
        { k: 'AI', v: '64' },
        { k: 'Web', v: '85' },
      ], 'Forbedr servicesider for mere lokal synlighed.')}
      ${fullReportActionPlan([
        { title: 'Optimer Google Business Profile', meta: 'Tilføj services, billeder og ugentlige opslag' },
        { title: 'Udvid lokale landingssider', meta: '3 nye by-specifikke servicesider med schema markup' },
        { title: 'AI-synlighed', meta: 'Strukturer FAQ og om-os så AI-assistenter kan citere jer' },
      ])}
      ${ctaBlock('Se fuld rapport', 'https://advero.dk/dashboard/reports', '0')}
    `,
  }),

  'payment-failed.html': shell({
    title: 'Betaling mislykkedes — Advero',
    preheader: 'Handling påkrævet for din betaling.',
    footerNote: 'Transaktionel e-mail fra Advero.',
    content: `
      ${label('Betaling')}
      ${h1('Betaling mislykkedes')}
      ${greet()}
      ${para('Vi kunne ikke gennemføre betalingen på <strong style="color:#0F172A;">2.499,00 DKK</strong>.', '16px')}
      ${para('Din betalingsmetode blev afvist. Opdater den for at undgå afbrydelse.', '20px')}
      ${ctaBlock('Opdater betaling', 'https://advero.dk/dashboard/billing', '0')}
    `,
  }),

  'payment-receipt.html': shell({
    title: 'Betaling modtaget — Advero',
    preheader: 'Kvittering for Growth+.',
    footerNote: 'Transaktionel kvittering fra Advero.',
    content: `
      ${label('Faktura')}
      ${h1('Betaling modtaget')}
      ${greet()}
      ${para('Tak for din betaling.', '20px')}
      ${kvRows([
        { k: 'Plan', v: 'Growth+' },
        { k: 'Beløb', v: '2.499,00 DKK' },
        { k: 'Faktura', v: '#INV-2026-0520' },
      ])}
      ${ctaBlock('Se faktura', 'https://advero.dk/dashboard/billing', '24px')}
    `,
  }),

  'account-updated.html': shell({
    title: 'Kontoopdatering — Advero',
    preheader: 'Ændringer på din konto.',
    footerNote: 'Transaktionel konto-e-mail fra Advero.',
    content: `
      ${label('Konto')}
      ${h1('Kontoopdatering')}
      ${greet()}
      ${para('Ændringer <strong style="color:#0F172A;">20. maj 2026 kl. 14:32</strong>:', '16px')}
      ${checklist([
        { title: 'Virksomhedsnavn opdateret', done: true },
        { title: 'Fakturerings-e-mail ændret', done: true },
        { title: 'Notifikationsindstillinger justeret', done: true },
      ])}
      ${ctaBlock('Indstillinger', 'https://advero.dk/dashboard/settings', '24px')}
      ${divider()}
      ${para('Var det ikke dig? <a href="mailto:hello@advero.dk" style="color:#334155;font-weight:600;text-decoration:underline;">hello@advero.dk</a>', '0')}
    `,
  }),
};

for (const [file, html] of Object.entries(templates)) {
  writeFileSync(join(dir, file), html);
}
console.log('Generated', Object.keys(templates).length, 'Advero slate emails');
console.log('Production sends use backend/src/emails/adveroEmails.ts via emailService (brand: advero).');
