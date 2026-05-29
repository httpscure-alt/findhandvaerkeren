import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { api } from '../../../../services/api';
import type { BlogPost } from '../../../../lib/blogTypes';

const SITE = 'https://advero.dk';
const BLOG_SITEMAP_URL = `${SITE}/blog/sitemap.xml`;

const AdveroAdminSeoPage: React.FC = () => {
  const { lang } = useMarketplace();
  const isDa = lang === 'da';
  const [published, setPublished] = useState<BlogPost[]>([]);

  useEffect(() => {
    api.adminGetAllBlogPosts({ status: 'published' }).then(({ posts }) => {
      setPublished(posts as BlogPost[]);
    }).catch(() => setPublished([]));
  }, []);

  return (
    <div>
      <p className="mono-label text-white/50">SEO</p>
      <h1 className="mb-6 text-2xl font-bold text-white">
        {isDa ? 'SEO-værktøjer' : 'SEO tools'}
      </h1>

      <div className="space-y-6 text-sm text-white/80">
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="mb-2 font-semibold text-white">
            {isDa ? 'Sitemaps' : 'Sitemaps'}
          </h2>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <a href="/sitemap.xml" className="underline" target="_blank" rel="noreferrer">
                {SITE}/sitemap.xml
              </a>{' '}
              — {isDa ? 'sitemap-indeks' : 'sitemap index'}
            </li>
            <li>
              <a href="/sitemap-pages.xml" className="underline" target="_blank" rel="noreferrer">
                {SITE}/sitemap-pages.xml
              </a>{' '}
              — {isDa ? 'forside, kontakt, blog, audit' : 'home, contact, blog, audit'}
            </li>
            <li>
              <a href={BLOG_SITEMAP_URL} className="underline" target="_blank" rel="noreferrer">
                {BLOG_SITEMAP_URL}
              </a>{' '}
              — {isDa ? 'blogartikler' : 'blog posts'}
            </li>
          </ul>
          <p className="mt-3 text-white/55">
            {isDa
              ? 'Brug advero.dk-URL’en i Search Console — ikke Render/API-domænet. Indholdet peger allerede på advero.dk/blog/…'
              : 'Use the advero.dk URL in Search Console — not the Render/API hostname. Entries already point to advero.dk/blog/…'}
          </p>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="mb-2 font-semibold text-white">
            {isDa ? 'Publicerede URL’er' : 'Published URLs'}
          </h2>
          {published.length === 0 ? (
            <p className="text-white/55">{isDa ? 'Ingen publicerede artikler.' : 'No published articles.'}</p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {published.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <code className="text-xs text-white/70">{SITE}/blog/{p.slug}</code>
                  <a
                    href={`/blog/${p.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-white/50 hover:text-white"
                  >
                    <ExternalLink size={14} aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="mb-2 font-semibold text-white">
            {isDa ? 'Tjekliste pr. artikel' : 'Per-article checklist'}
          </h2>
          <ol className="list-inside list-decimal space-y-1 text-white/70">
            <li>{isDa ? 'Unikt meta title (≤ 60 tegn)' : 'Unique meta title (≤ 60 chars)'}</li>
            <li>{isDa ? 'Meta description (≤ 155 tegn)' : 'Meta description (≤ 155 chars)'}</li>
            <li>{isDa ? 'Én H1 i indhold (## i Markdown)' : 'One H1 in content (## in Markdown)'}</li>
            <li>{isDa ? 'Interne links til / og /advero/audit' : 'Internal links to / and /advero/audit'}</li>
            <li>{isDa ? 'Cover-billede med beskrivende alt-tekst i CMS' : 'Cover image with descriptive alt in CMS'}</li>
          </ol>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="mb-2 font-semibold text-white">
            {isDa ? 'Omdirigeringer & Search Console' : 'Redirects & Search Console'}
          </h2>
          <p className="text-white/55">
            {isDa
              ? 'http://advero.dk/ omdirigerer permanent til https://advero.dk/ — det er korrekt. I GSC under “Side med omdirigering” for http-URL’en: vælg “Færdig med rettelse”. Brug kun https-URL’er i sitemap og canonical.'
              : 'http://advero.dk/ permanently redirects to https://advero.dk/ — that is correct. In GSC “Page with redirect” for the http URL: mark “Done fixing”. Use only https URLs in sitemap and canonicals.'}
          </p>
          <p className="mt-2 text-white/55">
            {isDa
              ? 'www.advero.dk og øvrige marketing-redirects styres i vercel.json.'
              : 'www.advero.dk and other marketing redirects are configured in vercel.json.'}
          </p>
        </section>
      </div>
    </div>
  );
};

export default AdveroAdminSeoPage;
