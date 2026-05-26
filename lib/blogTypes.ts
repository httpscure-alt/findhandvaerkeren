export type BlogPostStatus = 'draft' | 'published';

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  coverImageUrl: string | null;
  category: string;
  tags: string[];
  status: BlogPostStatus;
  lang: 'da' | 'en';
  authorName: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export const BLOG_CATEGORIES = [
  { id: 'seo', labelDa: 'SEO', labelEn: 'SEO' },
  { id: 'google-ads', labelDa: 'Google Ads', labelEn: 'Google Ads' },
  { id: 'ai-visibility', labelDa: 'AI-synlighed', labelEn: 'AI visibility' },
  { id: 'case-study', labelDa: 'Case', labelEn: 'Case study' },
  { id: 'product', labelDa: 'Produkt', labelEn: 'Product' },
  { id: 'general', labelDa: 'Generelt', labelEn: 'General' },
] as const;

export type BlogPostInput = {
  title: string;
  excerpt: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  coverImageUrl?: string;
  category?: string;
  tags?: string[];
  status?: BlogPostStatus;
  lang?: 'da' | 'en';
  authorName?: string;
};

export function categoryLabel(category: string, isDa: boolean): string {
  const found = BLOG_CATEGORIES.find((c) => c.id === category);
  if (!found) return category;
  return isDa ? found.labelDa : found.labelEn;
}

export function formatBlogDate(iso: string | null | undefined, isDa: boolean): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(isDa ? 'da-DK' : 'en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}
