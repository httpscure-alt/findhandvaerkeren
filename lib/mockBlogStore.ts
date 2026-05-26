import type { BlogPost, BlogPostInput } from './blogTypes';

const STORAGE_KEY = 'advero.mock.blogPosts';

function load(): BlogPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedPosts();
    const parsed = JSON.parse(raw) as BlogPost[];
    return Array.isArray(parsed) ? parsed : seedPosts();
  } catch {
    return seedPosts();
  }
}

function save(posts: BlogPost[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function seedPosts(): BlogPost[] {
  const now = new Date().toISOString();
  const posts: BlogPost[] = [
    {
      id: 'mock-post-1',
      title: 'Sådan vinder du lokale SEO-søgninger i 2026',
      slug: 'lokal-seo-2026',
      excerpt: 'Tre konkrete skridt danske servicevirksomheder kan tage denne måned.',
      content:
        '## Start med Google Business Profile\n\nOpdater kategori, åbningstider og billeder.\n\n## Byg landingssider pr. by\n\nÉn side pr. primær serviceområde.\n\n## Mål synlighed månedligt\n\nBrug en fast rapport-rutine — ikke kun rankings.',
      metaTitle: 'Lokal SEO 2026 | Advero',
      metaDescription: 'Tre skridt til bedre lokal synlighed for danske servicevirksomheder.',
      coverImageUrl: null,
      category: 'seo',
      tags: ['seo', 'lokal'],
      status: 'published',
      lang: 'da',
      authorName: 'Advero',
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    },
  ];
  save(posts);
  return posts;
}

export const mockBlogStore = {
  listPublished(filters?: { lang?: string; category?: string }): BlogPost[] {
    return load().filter((p) => {
      if (p.status !== 'published') return false;
      if (filters?.lang && p.lang !== filters.lang) return false;
      if (filters?.category && filters.category !== 'all' && p.category !== filters.category) return false;
      return true;
    });
  },

  getBySlug(slug: string): BlogPost | null {
    const post = load().find((p) => p.slug === slug);
    if (!post || post.status !== 'published') return null;
    return post;
  },

  listAll(status?: string): BlogPost[] {
    const posts = load();
    if (!status) return posts;
    return posts.filter((p) => p.status === status);
  },

  getById(id: string): BlogPost | null {
    return load().find((p) => p.id === id) ?? null;
  },

  create(input: BlogPostInput): BlogPost {
    const posts = load();
    const now = new Date().toISOString();
    const base = slugify(input.title);
    let slug = base;
    let n = 1;
    while (posts.some((p) => p.slug === slug)) slug = `${base}-${n++}`;

    const post: BlogPost = {
      id: `mock-post-${Date.now()}`,
      title: input.title,
      slug,
      excerpt: input.excerpt,
      content: input.content,
      metaTitle: input.metaTitle || input.title,
      metaDescription: input.metaDescription || input.excerpt,
      coverImageUrl: input.coverImageUrl || null,
      category: input.category || 'general',
      tags: input.tags || [],
      status: input.status || 'draft',
      lang: input.lang || 'da',
      authorName: input.authorName || 'Advero',
      publishedAt: input.status === 'published' ? now : null,
      createdAt: now,
      updatedAt: now,
    };
    posts.unshift(post);
    save(posts);
    return post;
  },

  update(id: string, input: Partial<BlogPostInput>): BlogPost | null {
    const posts = load();
    const idx = posts.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    const existing = posts[idx];
    const now = new Date().toISOString();
    const wasPublished = existing.status === 'published';
    const nextStatus = input.status ?? existing.status;

    let slug = existing.slug;
    if (input.title && input.title !== existing.title) {
      const base = slugify(input.title);
      slug = base;
      let n = 1;
      while (posts.some((p) => p.slug === slug && p.id !== id)) slug = `${base}-${n++}`;
    }

    const updated: BlogPost = {
      ...existing,
      title: input.title ?? existing.title,
      slug,
      excerpt: input.excerpt ?? existing.excerpt,
      content: input.content ?? existing.content,
      metaTitle: input.metaTitle ?? existing.metaTitle,
      metaDescription: input.metaDescription ?? existing.metaDescription,
      coverImageUrl: input.coverImageUrl !== undefined ? input.coverImageUrl || null : existing.coverImageUrl,
      category: input.category ?? existing.category,
      tags: input.tags ?? existing.tags,
      status: nextStatus,
      lang: input.lang ?? existing.lang,
      authorName: input.authorName ?? existing.authorName,
      publishedAt:
        nextStatus === 'published' && !wasPublished ? now : existing.publishedAt,
      updatedAt: now,
    };
    posts[idx] = updated;
    save(posts);
    return updated;
  },

  remove(id: string): boolean {
    const posts = load().filter((p) => p.id !== id);
    if (posts.length === load().length) return false;
    save(posts);
    return true;
  },
};
