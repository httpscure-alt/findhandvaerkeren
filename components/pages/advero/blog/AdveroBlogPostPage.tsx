import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { api } from '../../../../services/api';
import type { BlogPost } from '../../../../lib/blogTypes';
import { categoryLabel, formatBlogDate } from '../../../../lib/blogTypes';
import { markdownToHtml } from '../../../../lib/simpleMarkdown';

const SITE = 'https://advero.dk';

const AdveroBlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useMarketplace();
  const isDa = lang === 'da';
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const html = useMemo(() => (post ? markdownToHtml(post.content) : ''), [post]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    api
      .getBlogPost(slug)
      .then(({ post: data }) => {
        if (cancelled) return;
        setPost(data as BlogPost);
        setNotFound(false);
      })
      .catch(() => {
        if (!cancelled) {
          setPost(null);
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!post) {
      document.title = isDa ? 'Artikel | Advero' : 'Article | Advero';
      return;
    }
    document.title = post.metaTitle || `${post.title} | Advero`;

    const desc = post.metaDescription || post.excerpt;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${SITE}/blog/${post.slug}`);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', post.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', desc);
  }, [post, isDa]);

  if (loading) {
    return (
      <p className="py-20 text-center text-white/55">{isDa ? 'Indlæser…' : 'Loading…'}</p>
    );
  }

  if (notFound || !post) {
    return (
      <div className="advero-blog-article text-center">
        <h1 className="text-xl font-bold">{isDa ? 'Artikel ikke fundet' : 'Article not found'}</h1>
        <Link to="/blog" className="mt-4 inline-block text-sky-300 underline">
          {isDa ? 'Tilbage til indsigt' : 'Back to insights'}
        </Link>
      </div>
    );
  }

  return (
    <article className="advero-blog-article">
      <Link
        to="/blog"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white"
      >
        <ArrowLeft size={16} aria-hidden />
        {isDa ? 'Alle artikler' : 'All articles'}
      </Link>

      <p className="advero-blog-card-meta mb-2">
        {categoryLabel(post.category, isDa)} · {post.authorName} ·{' '}
        {formatBlogDate(post.publishedAt, isDa)}
      </p>
      <h1>{post.title}</h1>
      <p className="advero-blog-article-meta">{post.excerpt}</p>

      {post.coverImageUrl ? (
        <img
          src={post.coverImageUrl}
          alt=""
          className="advero-blog-article-cover"
          loading="eager"
        />
      ) : null}

      <div
        className="advero-blog-prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className="mt-12 rounded-xl border border-white/10 bg-white/[0.04] p-6 text-center">
        <p className="text-lg font-semibold text-white">
          {isDa ? 'Klar til at måle jeres synlighed?' : 'Ready to measure your visibility?'}
        </p>
        <a
          href="/advero/audit"
          className="advero-btn-slate-solid mt-4 inline-flex rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-wider"
        >
          {isDa ? 'Start gratis analyse' : 'Start free analysis'}
        </a>
      </div>
    </article>
  );
};

export default AdveroBlogPostPage;
