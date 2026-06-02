import React, { useMemo, useState } from 'react';
import { markdownToHtml } from '../../../../lib/simpleMarkdown';
import type { OpsPlaybookKey } from '../../../../lib/opsPlaybooks';
import { OPS_PLAYBOOKS, playbookForServiceLine } from '../../../../lib/opsPlaybooks';

type Row = {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  serviceLine: string;
  tierId: string;
  companyName: string;
  contactEmail?: string;
  websiteUrl?: string;
  notes?: string | null;
};

const FIXTURE: Row = {
  id: 'preview-1',
  status: 'PENDING',
  serviceLine: 'growth',
  tierId: 'standard',
  companyName: 'Murerfirma Jensen ApS',
  contactEmail: 'kontakt@murerjensen.dk',
  websiteUrl: 'https://murerjensen.dk',
  notes: null,
};

function fakeOpsDraft(lang: 'da' | 'en', row: Row): string {
  if (lang === 'en') {
    return `## Short summary
Client purchased **SEO + Google Ads**. Goal: stable lead flow and more local inquiries.

## What we need from the client (access)
- GA4 + GTM (or permission to set up)
- Google Search Console
- Google Ads admin access + billing confirmed
- Google Business Profile manager access
- CMS / website login

## Week 1 plan
- Tracking: conversions (calls/forms)
- SEO quick wins: titles/meta on top pages, internal links, local landing pages
- Ads: structure (brand/non-brand), negatives, ad copy, geo, bidding

## Client email (template)
Hi — thanks for your order. To start today, please share access to GA4, Search Console, Google Ads, GBP and your website. We’ll deliver a Week 1 plan within 24–48 hours.`;
  }

  return `## Kort opsummering
Kunden har købt **SEO + Google Ads**. Målet er stabilt lead-flow og flere lokale henvendelser.

## Hvad vi mangler fra kunden (adgang)
- GA4 + GTM (eller adgang til at opsætte)
- Google Search Console
- Google Ads admin + fakturering bekræftet
- Google Business Profile (manager)
- CMS / website-login

## Uge 1 plan
- Tracking: konverteringer (opkald/formular)
- SEO quick wins: titles/meta på top-sider, interne links, lokale landingpages
- Ads: struktur (brand/non-brand), negatives, annoncemeddelelser, geo, budstrategi

## Skabelon-mail til kunden
Hej — tak for din bestilling. For at vi kan starte i dag, skal vi bruge adgang til GA4, Search Console, Google Ads, GBP og website. Vi leverer en uge 1 plan inden for 24–48 timer.`;
}

const AdveroOpsPreviewPage: React.FC = () => {
  const [lang, setLang] = useState<'da' | 'en'>('da');
  const isDa = lang === 'da';

  const [row, setRow] = useState<Row>(FIXTURE);
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<OpsPlaybookKey>(playbookForServiceLine(row.serviceLine));
  const [draft, setDraft] = useState<string>('');
  const [enPreview, setEnPreview] = useState<string>('');

  const playbookMd = useMemo(() => {
    const pb = OPS_PLAYBOOKS.find((x) => x.key === tab) || OPS_PLAYBOOKS[0];
    return isDa ? pb.markdownDa : pb.markdownEn;
  }, [tab, isDa]);

  const playbookHtml = useMemo(() => markdownToHtml(playbookMd), [playbookMd]);
  const draftHtml = useMemo(() => markdownToHtml(draft), [draft]);
  const enHtml = useMemo(() => markdownToHtml(enPreview), [enPreview]);

  const generate = () => {
    const out = fakeOpsDraft(lang, row);
    setDraft(out);
    setEnPreview(lang === 'da' ? fakeOpsDraft('en', row) : '');
  };

  const saveToNotes = () => {
    const prev = (row.notes ?? '').trim();
    const next = `${prev ? `${prev}\n\n` : ''}---\nOps AI draft (preview)\n\n${draft}`.trim();
    setRow((r) => ({ ...r, notes: next }));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono-label text-white/50">Advero</p>
          <h1 className="text-2xl font-bold text-white">
            {isDa ? 'Ops preview (ingen login)' : 'Ops preview (no login)'}
          </h1>
          <p className="text-sm text-white/60">
            {isDa
              ? 'Klikbar preview af playbook + AI draft UI (uden backend).'
              : 'Clickable preview of playbook + AI draft UI (no backend).'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setLang('da')}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              isDa ? 'border-white/10 bg-white/10 text-white' : 'border-white/15 bg-white/5 text-white/70'
            }`}
          >
            Dansk
          </button>
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              !isDa ? 'border-white/10 bg-white/10 text-white' : 'border-white/15 bg-white/5 text-white/70'
            }`}
          >
            English
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white/90">{row.companyName}</p>
            <p className="text-xs text-white/55">
              {isDa ? 'Service' : 'Service'}: {row.serviceLine} · {isDa ? 'Tier' : 'Tier'}: {row.tierId} ·{' '}
              {isDa ? 'Status' : 'Status'}: {row.status}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/5"
          >
            {open ? (isDa ? 'Skjul playbook' : 'Hide playbook') : (isDa ? 'Open playbook' : 'Open playbook')}
          </button>
        </div>

        {open ? (
          <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white">
                {isDa ? 'Ops playbooks (intern)' : 'Ops playbooks (internal)'}
              </p>
              <div className="flex flex-wrap gap-2">
                {OPS_PLAYBOOKS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setTab(p.key)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      tab === p.key
                        ? 'border-white/10 bg-white/10 text-white'
                        : 'border-white/10 bg-black/20 text-white/80 hover:bg-white/5'
                    }`}
                  >
                    {p.key}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="advero-blog-prose max-w-none text-white/80"
              dangerouslySetInnerHTML={{ __html: playbookHtml }}
            />

            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
                  {isDa ? 'AI-udkast (kræver godkendelse)' : 'AI draft (review required)'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={generate}
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/15"
                  >
                    {isDa ? 'Generér' : 'Generate'}
                  </button>
                  {draft ? (
                    <button
                      type="button"
                      onClick={saveToNotes}
                      className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/5"
                    >
                      {isDa ? 'Gem i noter' : 'Save to notes'}
                    </button>
                  ) : null}
                </div>
              </div>

              {draft ? (
                <div
                  className="advero-blog-prose mt-3 max-w-none rounded-lg border border-white/10 bg-white/[0.03] p-3 text-white/85"
                  dangerouslySetInnerHTML={{ __html: draftHtml }}
                />
              ) : (
                <p className="mt-2 text-xs text-white/55">
                  {isDa
                    ? 'Klik “Generér” for at se hvordan UI opfører sig.'
                    : 'Click “Generate” to see the UI behavior.'}
                </p>
              )}

              {isDa && enPreview ? (
                <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
                    English preview (draft)
                  </p>
                  <div
                    className="advero-blog-prose mt-2 max-w-none text-white/85"
                    dangerouslySetInnerHTML={{ __html: enHtml }}
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="mono-label mb-2 text-white/50">{isDa ? 'Noter (preview state)' : 'Notes (preview state)'}</p>
          <pre className="whitespace-pre-wrap text-xs text-white/75">{row.notes || (isDa ? '(tom)' : '(empty)')}</pre>
        </div>
      </div>
    </div>
  );
};

export default AdveroOpsPreviewPage;

