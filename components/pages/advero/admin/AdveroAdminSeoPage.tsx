import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { api } from '../../../../services/api';
import type { BlogPost } from '../../../../lib/blogTypes';

const API_BASE = ((import.meta as any).env.VITE_API_URL || '').replace(/\/$/, '');
const SITE = 'https://advero.dk';

const AdveroAdminSeoPage: React.FC = () => {
  const { lang } = useMarketplace();
  const isDa = lang === 'da';
  const [published, setPublished] = useState<BlogPost[]>([]);

  useEffect(() => {
    api.adminGetAllBlogPosts({ status: 'published' }).then(({ posts }) => {
      setPublished(posts as BlogPost[]);
    }).catch(() => setPublished([]));
  }, []);

  const blogSitemapUrl = API_BASE
    ? `${API_BASE}/blog/sitemap.xml`
    : `${SITE}/api/blog/sitemap.xml`;

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
              — {isDa ? 'statiske sider' : 'static pages'}
            </li>
            <li>
              <a href={blogSitemapUrl} className="underline" target="_blank" rel="noreferrer">
                {blogSitemapUrl}
              </a>{' '}
              — {isDa ? 'blogartikler (dynamisk)' : 'blog posts (dynamic)'}
            </li>
          </ul>
          <p className="mt-3 text-white/55">
            {isDa
              ? 'Tilføj blog-sitemap i Google Search Console som separat feed, eller sammenflet i en sitemap-index.'
              : 'Submit the blog sitemap in Google Search Console as a separate feed, or merge via a sitemap index.'}
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
            {isDa ? 'Omdirigeringer' : 'Redirects'}
          </h2>
          <p className="text-white/55">
            {isDa
              ? 'Marketing-redirects styres i vercel.json. Ved behov for nye 301’er: opdater vercel.json og deploy.'
              : 'Marketing redirects live in vercel.json. For new 301s: update vercel.json and redeploy.'}
          </p>
        </section>
      </div>
    </div>
  );
};

export default AdveroAdminSeoPage;
