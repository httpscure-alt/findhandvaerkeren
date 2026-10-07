import { handleWhitelabelAuth } from './lib/wlAuth/core.js';

/**
 * Edge middleware: www → apex per market domain, and white-label portal auth.
 */
export default async function middleware(request) {
  const host = request.headers.get('host') || '';
  const url = new URL(request.url);

  if (host === 'www.advero.dk') {
    url.protocol = 'https:';
    url.host = 'advero.dk';
    return Response.redirect(url.toString(), 308);
  }

  if (host === 'www.advero.id') {
    url.protocol = 'https:';
    url.host = 'advero.id';
    return Response.redirect(url.toString(), 308);
  }

  if (host === 'www.portal.juicebox.co.id') {
    url.protocol = 'https:';
    url.host = 'portal.juicebox.co.id';
    return Response.redirect(url.toString(), 308);
  }

  try {
    const response = await handleWhitelabelAuth(request, process.env);
    if (response) return response;
  } catch (error) {
    console.error('white-label auth failed', error);
    return errorPage(request, url);
  }
}

async function errorPage(request, url) {
  const requestId = request.headers.get('x-vercel-id') || '';
  const page = await fetch(new URL('/wl/status.html', url));
  const html = (await page.text()).replace('__REQUEST_ID__', requestId.replace(/[^\w:.-]/g, ''));
  return new Response(html, {
    status: 500,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export const config = {
  matcher: '/:path*',
};
