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
