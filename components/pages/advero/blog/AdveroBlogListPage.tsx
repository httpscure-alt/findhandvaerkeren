import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { api } from '../../../../services/api';
import type { BlogPost } from '../../../../lib/blogTypes';
import { BLOG_CATEGORIES, categoryLabel, formatBlogDate } from '../../../../lib/blogTypes';
import { applyAdveroPageSeo } from '../../../../lib/adveroPageSeo';

const AdveroBlogListPage: React.FC = () => {
  const { lang } = useMarketplace();
  const isDa = lang === 'da';
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applyAdveroPageSeo('/blog', isDa ? 'da' : 'en');
  }, [isDa]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getBlogPosts({
        lang,
        category: category === 'all' ? undefined : category,
        limit: 24,
      })
      .then(({ posts: data }) => {
        if (!cancelled) setPosts(data as BlogPost[]);
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lang, category]);

  return (
    <>
      <div className="advero-blog-hero mx-auto max-w-3xl px-4">
        <p className="mono-label mb-2 text-white/50">{isDa ? 'Indsigt' : 'Insights'}</p>
        <h1>{isDa ? 'Viden om vækst og synlighed' : 'Growth & visibility knowledge'}</h1>
        <p className="mt-3 text-white/65">
          {isDa
            ? 'Praktiske artikler om SEO, Google Ads og AI-synlighed for danske servicevirksomheder.'
            : 'Practical articles on SEO, Google Ads, and AI visibility for Danish service businesses.'}
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="advero-blog-filters">
          <button
            type="button"
            className={`advero-blog-filter-btn ${category === 'all' ? 'advero-blog-filter-btn--active' : ''}`}
            onClick={() => setCategory('all')}
          >
            {isDa ? 'Alle' : 'All'}
          </button>
          {BLOG_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`advero-blog-filter-btn ${category === c.id ? 'advero-blog-filter-btn--active' : ''}`}
              onClick={() => setCategory(c.id)}
            >
              {isDa ? c.labelDa : c.labelEn}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-white/55">{isDa ? 'Indlæser…' : 'Loading…'}</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-white/55">
            {isDa ? 'Ingen artikler endnu — kom tilbage snart.' : 'No articles yet — check back soon.'}
          </p>
        ) : (
          <div className="advero-blog-grid">
            {posts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="advero-blog-card">
                {post.coverImageUrl ? (
                  <img
                    src={post.coverImageUrl}
                    alt=""
                    className="advero-blog-card-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="advero-blog-card-cover bg-gradient-to-br from-slate-600 to-slate-800" />
                )}
                <div className="advero-blog-card-body">
                  <p className="advero-blog-card-meta">
                    {categoryLabel(post.category, isDa)} · {formatBlogDate(post.publishedAt, isDa)}
                  </p>
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AdveroBlogListPage;
