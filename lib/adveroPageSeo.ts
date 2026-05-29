/**
 * Per-route SEO for Advero SPA (app.html). Static pages (/, /contact) set their own tags in HTML.
 */

const SITE = 'https://advero.dk';

export type PageSeoConfig = {
  title: string;
  description: string;
  /** false → noindex,nofollow (funnel, auth, dashboard) */
  index?: boolean;
};

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
}

function upsertMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  const selector = `meta[${attr}="${name}"]`;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function removeCanonical() {
  document.querySelector('link[rel="canonical"]')?.remove();
}

/** Static route table — blog post detail is handled in AdveroBlogPostPage. */
const ROUTE_SEO: Record<string, PageSeoConfig> = {
  '/blog': {
    title: 'Indsigt | SEO, Google Ads og AI-synlighed | Advero',
    description:
      'Praktiske artikler om SEO, Google Ads og AI-synlighed for danske service- og håndværksvirksomheder.',
    index: true,
  },
  '/advero/audit': {
    title: 'Gratis synlighedsanalyse | Advero',
    description:
      'Få en gratis synlighedsanalyse af jeres website. Advero vurderer SEO, lokal synlighed og AI-læsbarhed — med anbefalet pakke.',
    index: true,
  },
};

const NOINDEX_PREFIXES = [
  '/advero/admin',
  '/advero/dashboard',
  '/advero/dev',
  '/advero/login',
  '/advero/signup',
  '/advero/get-started',
  '/advero/verify-email',
  '/advero/audit/analyzing',
  '/advero/audit/results',
  '/advero/reports',
  '/auth',
  '/billing',
  '/admin',
  '/dashboard',
  '/verify-email',
];

export function shouldNoindexPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return NOINDEX_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

export function isBlogPostPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return path.startsWith('/blog/') && path !== '/blog';
}

export function applyAdveroPageSeo(pathname: string, lang: 'da' | 'en' = 'da'): void {
  const path = normalizePath(pathname);

  if (isBlogPostPath(path)) {
    return;
  }

  if (shouldNoindexPath(path)) {
    document.title = 'Advero';
    upsertMeta('robots', 'noindex,nofollow');
    removeCanonical();
    return;
  }

  upsertMeta('robots', 'index,follow');

  const enBlog: PageSeoConfig = {
    title: 'Insights | SEO, Google Ads & AI visibility | Advero',
    description:
      'Practical articles on SEO, Google Ads, and AI visibility for Danish service businesses.',
    index: true,
  };

  const enAudit: PageSeoConfig = {
    title: 'Free visibility analysis | Advero',
    description:
      'Get a free visibility analysis of your website. Advero reviews SEO, local presence, and AI readability — with a recommended plan.',
    index: true,
  };

  let config = ROUTE_SEO[path];
  if (lang === 'en') {
    if (path === '/blog') config = enBlog;
    if (path === '/advero/audit') config = enAudit;
  }

  if (!config) {
    removeCanonical();
    return;
  }

  document.title = config.title;
  upsertMeta('description', config.description);
  upsertCanonical(`${SITE}${path}`);
  upsertMeta('og:title', config.title, 'property');
  upsertMeta('og:description', config.description, 'property');
  upsertMeta('og:url', `${SITE}${path}`, 'property');
}
