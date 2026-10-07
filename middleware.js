/**
 * Edge redirects: www → apex per market domain.
 */
export default function middleware(request) {
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

  if (host === 'advero.id' && !/^\/(wl\/|brand-v2\/whitelabel\/(juicebox|skipjack)-logo)/.test(url.pathname)) {
    return fetch(new URL('/wl/status.html', url)).then(
      (page) =>
        new Response(page.body, {
          status: 500,
          headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
        }),
    );
  }

  if (host === 'www.portal.juicebox.co.id') {
    url.protocol = 'https:';
    url.host = 'portal.juicebox.co.id';
    return Response.redirect(url.toString(), 308);
  }
}

export const config = {
  matcher: '/:path*',
};
