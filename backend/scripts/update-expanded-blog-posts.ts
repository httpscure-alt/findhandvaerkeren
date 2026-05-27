/**
 * Push expanded markdown from blog-content/*.md to production posts (same slug as filename).
 *
 * Usage (from repo root):
 *   BLOG_ADMIN_EMAIL=... BLOG_ADMIN_PASSWORD=... npx tsx backend/scripts/update-expanded-blog-posts.ts
 *
 * Optional: API_URL=https://findhandvaerkeren.onrender.com
 */

import fs from 'fs';
import path from 'path';

const API_URL = (process.env.API_URL || 'https://findhandvaerkeren.onrender.com').replace(/\/$/, '');
const EMAIL = process.env.BLOG_ADMIN_EMAIL || 'admin@advero.dk';
const PASSWORD = process.env.BLOG_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

const CONTENT_DIR = path.join(__dirname, 'blog-content');

const UPDATES: Record<
  string,
  { excerpt: string; metaDescription: string }
> = {
  'saadan-bliver-din-virksomhed-fundet-paa-google-i-2026': {
    excerpt:
      'Komplet guide til lokal SEO, Google Business Profile og synlighed i 2026. Tjekliste, typiske fejl, 90-dages plan og FAQ for danske virksomheder.',
    metaDescription:
      'Lær hvordan din virksomhed bliver fundet på Google: profil, hjemmeside, anmeldelser og måling. Praktisk dansk guide med tjekliste og næste skridt.',
  },
  'google-ads-eller-seo-hvad-giver-mening-foerst': {
    excerpt:
      'Google Ads eller SEO først? Sammenligning af tid, omkostning, risici og hybridmodel, så du vælger den rigtige kanal for din virksomhed.',
    metaDescription:
      'Hvornår skal du starte med Google Ads, SEO eller begge? Dansk beslutningsguide med sammenligning, fejl at undgå og link til gratis audit.',
  },
};

async function login(): Promise<string> {
  if (!PASSWORD) {
    throw new Error('Set BLOG_ADMIN_PASSWORD (or ADMIN_PASSWORD) in the environment.');
  }
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const data = (await res.json()) as { token?: string; error?: string };
  if (!res.ok || !data.token) {
    throw new Error(data.error || `Login failed (${res.status})`);
  }
  return data.token;
}

async function main() {
  const token = await login();
  const listRes = await fetch(`${API_URL}/api/blog/admin/posts?limit=50`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const list = (await listRes.json()) as { posts?: { id: string; slug: string }[] };
  if (!listRes.ok || !list.posts) {
    throw new Error('Failed to list posts');
  }
  const bySlug = new Map(list.posts.map((p) => [p.slug, p.id]));

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'));
  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const id = bySlug.get(slug);
    if (!id) {
      console.warn(`Skip ${slug}: no post in DB`);
      continue;
    }
    const content = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8').trim();
    const meta = UPDATES[slug];
    if (!meta) {
      console.warn(`Skip ${slug}: no metadata in script`);
      continue;
    }
    const words = content.split(/\s+/).filter(Boolean).length;
    const res = await fetch(`${API_URL}/api/blog/admin/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content,
        excerpt: meta.excerpt,
        metaDescription: meta.metaDescription,
        status: 'published',
      }),
    });
    const body = await res.json();
    if (!res.ok) {
      throw new Error(`${slug}: ${JSON.stringify(body)}`);
    }
    console.log(`Updated ${slug} (~${words} words)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
