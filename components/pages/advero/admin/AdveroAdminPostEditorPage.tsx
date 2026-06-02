import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { api } from '../../../../services/api';
import type { BlogPostInput, BlogPostStatus } from '../../../../lib/blogTypes';
import { BLOG_CATEGORIES } from '../../../../lib/blogTypes';
import { markdownToHtml } from '../../../../lib/simpleMarkdown';

const EMPTY: BlogPostInput = {
  title: '',
  excerpt: '',
  content: '',
  metaTitle: '',
  metaDescription: '',
  coverImageUrl: '',
  category: 'seo',
  tags: [],
  status: 'draft',
  lang: 'da',
  authorName: 'Advero',
};

const AdveroAdminPostEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { lang } = useMarketplace();
  const isDa = lang === 'da';

  const [form, setForm] = useState<BlogPostInput>(EMPTY);
  const [tagsRaw, setTagsRaw] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiPrimaryKeyword, setAiPrimaryKeyword] = useState('');
  const [aiSecondaryKeywords, setAiSecondaryKeywords] = useState('');
  const [aiAudience, setAiAudience] = useState('');
  const [aiBusinessType, setAiBusinessType] = useState('');
  const [aiLocation, setAiLocation] = useState('');
  const [aiTone, setAiTone] = useState<'practical' | 'expert' | 'friendly'>('practical');
  const [aiLength, setAiLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [enPreview, setEnPreview] = useState<string | null>(null);
  const [enLoading, setEnLoading] = useState(false);

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { posts } = await api.adminGetAllBlogPosts();
        const post = (posts as any[]).find((p) => p.id === id);
        if (!post) throw new Error('not found');
        if (cancelled) return;
        setForm({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          metaTitle: post.metaTitle || '',
          metaDescription: post.metaDescription || '',
          coverImageUrl: post.coverImageUrl || '',
          category: post.category,
          tags: post.tags || [],
          status: post.status,
          lang: post.lang,
          authorName: post.authorName,
        });
        setTagsRaw((post.tags || []).join(', '));
      } catch {
        if (!cancelled) setError(isDa ? 'Artikel ikke fundet' : 'Article not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isNew, isDa]);

  const previewHtml = useMemo(() => markdownToHtml(form.content || ''), [form.content]);

  const update = <K extends keyof BlogPostInput>(key: K, value: BlogPostInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const buildPayload = (): BlogPostInput => ({
    ...form,
    tags: tagsRaw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    metaTitle: form.metaTitle || form.title,
    metaDescription: form.metaDescription || form.excerpt,
    coverImageUrl: form.coverImageUrl || undefined,
  });

  const save = async (status?: BlogPostStatus) => {
    if (!form.title?.trim() || !form.excerpt?.trim() || !form.content?.trim()) {
      window.alert(isDa ? 'Udfyld titel, uddrag og indhold' : 'Fill in title, excerpt, and content');
      return;
    }
    setSaving(true);
    setError(null);
    const payload = buildPayload();
    if (status) payload.status = status;

    try {
      if (isNew) {
        const { post } = await api.adminCreateBlogPost(payload);
        navigate(`/advero/admin/posts/${post.id}`, { replace: true });
      } else {
        await api.adminUpdateBlogPost(id!, payload);
      }
    } catch {
      setError(isDa ? 'Kunne ikke gemme' : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const runAi = async () => {
    if (!aiTopic.trim()) {
      window.alert(isDa ? 'Skriv et emne først' : 'Enter a topic first');
      return;
    }
    setAiLoading(true);
    setError(null);
    try {
      const secondaryKeywords = aiSecondaryKeywords
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
      const { draft } = await api.adminGenerateBlogPostDraft({
        lang: form.lang,
        topic: aiTopic.trim(),
        primaryKeyword: aiPrimaryKeyword.trim() || undefined,
        secondaryKeywords: secondaryKeywords.length ? secondaryKeywords : undefined,
        audience: aiAudience.trim() || undefined,
        businessType: aiBusinessType.trim() || undefined,
        location: aiLocation.trim() || undefined,
        category: form.category,
        tone: aiTone,
        length: aiLength,
      });

      const d = draft as any;
      setForm((f) => ({
        ...f,
        title: d.title || f.title,
        excerpt: d.excerpt || f.excerpt,
        content: d.contentMarkdown || f.content,
        metaTitle: d.metaTitle || d.title || f.metaTitle,
        metaDescription: d.metaDescription || d.excerpt || f.metaDescription,
        category: d.category || f.category,
      }));
      if (Array.isArray(d.tags)) setTagsRaw((d.tags as any[]).join(', '));

      if (d.additionalJsonLd && typeof d.additionalJsonLd === 'string') {
        const block = `\n\n---\n\n## Schema (JSON-LD)\n\n\`\`\`json\n${d.additionalJsonLd.trim()}\n\`\`\`\n`;
        setForm((f) => ({ ...f, content: (f.content || '').trimEnd() + block }));
      }
    } catch (e: any) {
      setError(e?.message || (isDa ? 'Kunne ikke generere' : 'Could not generate'));
    } finally {
      setAiLoading(false);
    }
  };

  const translatePreview = async () => {
    const md = String(form.content || '').trim();
    if (!md) {
      window.alert(isDa ? 'Der er intet indhold at oversætte endnu' : 'Nothing to translate yet');
      return;
    }
    setEnLoading(true);
    setError(null);
    try {
      const { translated } = await api.adminTranslateBlogMarkdown({ markdown: md });
      setEnPreview(translated || '');
    } catch (e: any) {
      setError(e?.message || (isDa ? 'Kunne ikke oversætte' : 'Could not translate'));
    } finally {
      setEnLoading(false);
    }
  };

  if (loading) {
    return <p className="text-white/60">{isDa ? 'Indlæser…' : 'Loading…'}</p>;
  }

  if (error && !isNew) {
    return (
      <p className="text-red-300">
        {error}{' '}
        <Link to="/advero/admin/content" className="underline">
          {isDa ? 'Tilbage' : 'Back'}
        </Link>
      </p>
    );
  }

  return (
    <div>
      <Link
        to="/advero/admin/content"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/65 hover:text-white"
      >
        <ArrowLeft size={16} aria-hidden />
        {isDa ? 'Alle artikler' : 'All articles'}
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-white">
        {isNew ? (isDa ? 'Ny artikel' : 'New article') : (isDa ? 'Rediger artikel' : 'Edit article')}
      </h1>

      <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-white/85">
            {isDa ? 'AI generator (intern)' : 'AI generator (internal)'}
          </p>
          <button
            type="button"
            onClick={() => setAiOpen((v) => !v)}
            className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/5"
          >
            {aiOpen ? (isDa ? 'Skjul' : 'Hide') : (isDa ? 'Vis' : 'Show')}
          </button>
        </div>

        {aiOpen ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="advero-admin-field">
                <label>{isDa ? 'Emne' : 'Topic'}</label>
                <input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder={isDa ? 'F.eks. “Lokal SEO for murere i Aarhus”' : 'e.g. “Local SEO for plumbers in Aarhus”'} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="advero-admin-field">
                  <label>{isDa ? 'Primært søgeord' : 'Primary keyword'}</label>
                  <input value={aiPrimaryKeyword} onChange={(e) => setAiPrimaryKeyword(e.target.value)} placeholder="lokal seo" />
                </div>
                <div className="advero-admin-field">
                  <label>{isDa ? 'Sekundære (kommasepareret)' : 'Secondary (comma-separated)'}</label>
                  <input value={aiSecondaryKeywords} onChange={(e) => setAiSecondaryKeywords(e.target.value)} placeholder="google business profile, anmeldelser" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="advero-admin-field">
                  <label>{isDa ? 'Målgruppe' : 'Audience'}</label>
                  <input value={aiAudience} onChange={(e) => setAiAudience(e.target.value)} placeholder={isDa ? 'Ejerleder i servicevirksomhed' : 'Owner-operator of a service business'} />
                </div>
                <div className="advero-admin-field">
                  <label>{isDa ? 'Branche (valgfri)' : 'Business type (optional)'}</label>
                  <input value={aiBusinessType} onChange={(e) => setAiBusinessType(e.target.value)} placeholder={isDa ? 'Murer, elektriker, VVS' : 'Plumber, electrician'} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="advero-admin-field">
                  <label>{isDa ? 'Lokation (valgfri)' : 'Location (optional)'}</label>
                  <input value={aiLocation} onChange={(e) => setAiLocation(e.target.value)} placeholder="Aarhus" />
                </div>
                <div className="advero-admin-field">
                  <label>{isDa ? 'Tone' : 'Tone'}</label>
                  <select value={aiTone} onChange={(e) => setAiTone(e.target.value as any)}>
                    <option value="practical">{isDa ? 'Praktisk' : 'Practical'}</option>
                    <option value="expert">{isDa ? 'Ekspert' : 'Expert'}</option>
                    <option value="friendly">{isDa ? 'Venlig' : 'Friendly'}</option>
                  </select>
                </div>
              </div>
              <div className="advero-admin-field">
                <label>{isDa ? 'Længde' : 'Length'}</label>
                <select value={aiLength} onChange={(e) => setAiLength(e.target.value as any)}>
                  <option value="short">{isDa ? 'Kort' : 'Short'}</option>
                  <option value="medium">{isDa ? 'Mellem' : 'Medium'}</option>
                  <option value="long">{isDa ? 'Lang' : 'Long'}</option>
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={runAi}
                  className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-60"
                >
                  {aiLoading ? (isDa ? 'Genererer…' : 'Generating…') : (isDa ? 'Generér udkast' : 'Generate draft')}
                </button>
                <p className="text-xs text-white/50">
                  {isDa ? 'Udfylder felterne nedenfor. Husk menneskelig review før publicering.' : 'Auto-fills fields below. Review before publishing.'}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/55">{isDa ? 'Hvad den gør' : 'What it does'}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/70">
                <li>{isDa ? 'Skriver titel, uddrag, fuld artikel (Markdown)' : 'Writes title, excerpt, full article (Markdown)'}</li>
                <li>{isDa ? 'Genererer meta title/description + tags' : 'Generates meta title/description + tags'}</li>
                <li>{isDa ? 'Kan tilføje JSON-LD schema (FAQPage) i indholdet' : 'Can add JSON-LD schema (FAQPage) into the content'}</li>
              </ul>
              <p className="mt-3 text-xs text-white/50">
                {isDa
                  ? 'Hvis AI ikke er tilgængelig, får du en fejlbesked — resten af CMS virker stadig.'
                  : 'If AI is unavailable, you’ll see an error — the rest of the CMS still works.'}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="advero-admin-field">
            <label>{isDa ? 'Titel' : 'Title'}</label>
            <input
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder={isDa ? 'F.eks. Lokal SEO i 2026' : 'e.g. Local SEO in 2026'}
            />
          </div>
          <div className="advero-admin-field">
            <label>{isDa ? 'Uddrag' : 'Excerpt'}</label>
            <textarea
              rows={3}
              value={form.excerpt}
              onChange={(e) => update('excerpt', e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="advero-admin-field">
              <label>{isDa ? 'Kategori' : 'Category'}</label>
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
              >
                {BLOG_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {isDa ? c.labelDa : c.labelEn}
                  </option>
                ))}
              </select>
            </div>
            <div className="advero-admin-field">
              <label>{isDa ? 'Sprog' : 'Language'}</label>
              <select
                value={form.lang}
                onChange={(e) => update('lang', e.target.value as 'da' | 'en')}
              >
                <option value="da">Dansk</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
          <div className="advero-admin-field">
            <label>{isDa ? 'Tags (kommasepareret)' : 'Tags (comma-separated)'}</label>
            <input value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} placeholder="seo, google-ads" />
          </div>
          <div className="advero-admin-field">
            <label>{isDa ? 'Cover-billede URL' : 'Cover image URL'}</label>
            <input
              value={form.coverImageUrl || ''}
              onChange={(e) => update('coverImageUrl', e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div className="advero-admin-field">
            <label>Meta title (SEO)</label>
            <input
              value={form.metaTitle || ''}
              onChange={(e) => update('metaTitle', e.target.value)}
            />
          </div>
          <div className="advero-admin-field">
            <label>Meta description (SEO)</label>
            <textarea
              rows={2}
              value={form.metaDescription || ''}
              onChange={(e) => update('metaDescription', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="advero-admin-field">
            <label>{isDa ? 'Indhold (Markdown)' : 'Content (Markdown)'}</label>
            <textarea
              rows={16}
              value={form.content}
              onChange={(e) => update('content', e.target.value)}
              placeholder={'## Overskrift\n\nBrødtekst med **fed** og [link](https://advero.dk).'}
            />
          </div>
          {form.lang === 'da' ? (
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
                  {isDa ? 'Engelsk preview (kun til intern kontrol)' : 'English preview (internal only)'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={enLoading}
                    onClick={translatePreview}
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-60"
                  >
                    {enLoading
                      ? (isDa ? 'Oversætter…' : 'Translating…')
                      : (isDa ? 'Oversæt til engelsk' : 'Translate to English')}
                  </button>
                  {enPreview !== null ? (
                    <button
                      type="button"
                      onClick={() => setEnPreview(null)}
                      className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/5"
                    >
                      {isDa ? 'Skjul' : 'Hide'}
                    </button>
                  ) : null}
                </div>
              </div>
              {enPreview !== null ? (
                <div
                  className="advero-blog-prose mt-3 max-w-none rounded-lg border border-white/10 bg-white/[0.03] p-3 text-white/85"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(enPreview || '') }}
                />
              ) : (
                <p className="mt-2 text-xs text-white/55">
                  {isDa
                    ? 'Dette ændrer ikke din danske artikel. Det er kun en preview-oversættelse.'
                    : 'This does not change your Danish article. It’s preview-only.'}
                </p>
              )}
            </div>
          ) : null}
          <div>
            <p className="mono-label mb-2 text-white/50">{isDa ? 'Forhåndsvisning' : 'Preview'}</p>
            <div
              className="advero-admin-preview"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </div>

      {error ? <p className="mt-4 text-red-300">{error}</p> : null}

      <div className="advero-admin-actions">
        <button
          type="button"
          className="advero-admin-btn advero-admin-btn--ghost"
          disabled={saving}
          onClick={() => save('draft')}
        >
          {isDa ? 'Gem kladde' : 'Save draft'}
        </button>
        <button
          type="button"
          className="advero-admin-btn advero-admin-btn--primary"
          disabled={saving}
          onClick={() => save('published')}
        >
          {isDa ? 'Publicer' : 'Publish'}
        </button>
      </div>
    </div>
  );
};

export default AdveroAdminPostEditorPage;
