import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { api } from '../../../../services/api';
import type { BlogPost } from '../../../../lib/blogTypes';
import { categoryLabel } from '../../../../lib/blogTypes';

const AdveroAdminPostsPage: React.FC = () => {
  const { lang } = useMarketplace();
  const isDa = lang === 'da';
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const status = filter === 'all' ? undefined : filter;
      const { posts: data } = await api.adminGetAllBlogPosts({ status });
      setPosts(data as BlogPost[]);
    } catch {
      setError(isDa ? 'Kunne ikke hente artikler' : 'Could not load articles');
    } finally {
      setLoading(false);
    }
  }, [filter, isDa]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string, title: string) => {
    const ok = window.confirm(
      isDa ? `Slet "${title}"?` : `Delete "${title}"?`
    );
    if (!ok) return;
    try {
      await api.adminDeleteBlogPost(id);
      await load();
    } catch {
      window.alert(isDa ? 'Sletning fejlede' : 'Delete failed');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono-label text-white/50">{isDa ? 'Indhold' : 'Content'}</p>
          <h1 className="text-2xl font-bold text-white">
            {isDa ? 'SEO-artikler' : 'SEO articles'}
          </h1>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white"
        >
          <option value="all">{isDa ? 'Alle' : 'All'}</option>
          <option value="published">{isDa ? 'Publiceret' : 'Published'}</option>
          <option value="draft">{isDa ? 'Kladde' : 'Draft'}</option>
        </select>
      </div>

      {loading ? (
        <p className="text-white/60">{isDa ? 'Indlæser…' : 'Loading…'}</p>
      ) : error ? (
        <p className="text-red-300">{error}</p>
      ) : posts.length === 0 ? (
        <p className="text-white/60">
          {isDa ? 'Ingen artikler endnu.' : 'No articles yet.'}{' '}
          <Link to="/advero/admin/posts/new" className="underline">
            {isDa ? 'Opret den første' : 'Create the first one'}
          </Link>
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="advero-admin-table">
            <thead>
              <tr>
                <th>{isDa ? 'Titel' : 'Title'}</th>
                <th>{isDa ? 'Status' : 'Status'}</th>
                <th>{isDa ? 'Kategori' : 'Category'}</th>
                <th>{isDa ? 'Sprog' : 'Lang'}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div className="font-medium text-white">{post.title}</div>
                    <div className="text-xs text-white/45">/blog/{post.slug}</div>
                  </td>
                  <td>
                    <span
                      className={`advero-admin-status advero-admin-status--${post.status}`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="text-white/70">{categoryLabel(post.category, isDa)}</td>
                  <td className="uppercase text-white/70">{post.lang}</td>
                  <td>
                    <div className="flex justify-end gap-2">
                      {post.status === 'published' ? (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-white/60 hover:text-white"
                        >
                          {isDa ? 'Vis' : 'View'}
                        </a>
                      ) : null}
                      <Link
                        to={`/advero/admin/posts/${post.id}`}
                        className="inline-flex text-white/70 hover:text-white"
                        title={isDa ? 'Rediger' : 'Edit'}
                      >
                        <Pencil size={16} aria-hidden />
                      </Link>
                      <button
                        type="button"
                        className="text-red-300/80 hover:text-red-200"
                        onClick={() => handleDelete(post.id, post.title)}
                        title={isDa ? 'Slet' : 'Delete'}
                      >
                        <Trash2 size={16} aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdveroAdminPostsPage;
