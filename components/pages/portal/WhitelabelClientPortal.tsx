import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { whitelabelCssVars, type WhitelabelScreenId, type WhitelabelTheme } from '../../../lib/adveroWhitelabelThemes';
import { tenantBySlug } from '../../../lib/whitelabel/tenantRegistry';
import { agencyDemoData, clearAgencyData, useAgencyData } from '../../../lib/whitelabel/agencyDataStore';
import WhitelabelWordmark from '../../advero/whitelabel/WhitelabelWordmark';
import {
  CLIENT_SECTIONS,
  clientSlug,
  renderWhitelabelScene,
  type ClientSection,
} from '../advero/dev/whitelabel/WlPreviewScenes';
import '../../advero/whitelabel/whitelabel-ds.css';

export const CLIENT_PORTAL_SLUGS = ['juicebox', 'skipjack', 'suitmedia', 'artdigital'] as const;

const SCREEN_BY_PATH: Record<string, WhitelabelScreenId> = {
  '': 'agency-login',
  login: 'agency-login',
  dashboard: 'agency-dashboard',
  operations: 'agency-ops',
  clients: 'client-dashboard',
  audits: 'audit-history',
  reports: 'reports',
  recommendations: 'recommendations',
};

const PATH_BY_NAV_LABEL: Record<string, string> = {
  Dashboard: 'dashboard',
  Operations: 'operations',
  Clients: 'clients',
  'Audit history': 'audits',
  Reports: 'reports',
  Recommendations: 'recommendations',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeNext(slug: string, next: string | null): string {
  if (next && next.startsWith(`/${slug}/`) && !next.startsWith('//') && !next.includes('\\')) return next;
  return `/${slug}/dashboard`;
}

function PortalMessage({ theme, title, body, action }: { theme: WhitelabelTheme; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="wl-root">
      <div className="wl-scene-message" role="alert">
        <WhitelabelWordmark theme={theme} variant="light" />
        <h1>{title}</h1>
        <p className="wl-muted">{body}</p>
        {action}
      </div>
    </div>
  );
}

const WhitelabelClientPortal: React.FC = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const segments = pathname.split('/').slice(1).filter((s, i, all) => s !== '' || i < all.length - 1);
  const [slug = '', sub = '', ...rest] = segments;
  const tenant = tenantBySlug(slug);
  const isPortalSlug = (CLIENT_PORTAL_SLUGS as readonly string[]).includes(slug);
  const screen: WhitelabelScreenId | undefined = SCREEN_BY_PATH[sub];
  const isLogin = screen === 'agency-login';
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const { state: dataState } = useAgencyData(isLogin || !tenant ? '' : tenant.theme.id);
  const data = dataState === 'ready' && tenant ? agencyDemoData(tenant.theme.id) : null;

  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  useLayoutEffect(() => {
    document.getElementById('advero-support-root')?.remove();
    document.querySelector('.crisp-client')?.remove();
  }, []);

  useEffect(() => {
    if (tenant) document.title = tenant.theme.name;
  }, [tenant]);

  useEffect(() => {
    if (dataState === 'unauthorized') {
      window.location.assign(`/${slug}?expired=1&next=${encodeURIComponent(pathname + search)}`);
    }
  }, [dataState, slug, pathname, search]);

  const onAgencyLogin = useCallback(
    async (email: string, password: string) => {
      const trimmed = email.trim();
      if (!trimmed || !password) {
        setLoginError('Enter your email and password.');
        return;
      }
      if (!EMAIL_PATTERN.test(trimmed)) {
        setLoginError('Enter a valid email address.');
        return;
      }
      setLoginError(null);
      setLoginLoading(true);
      try {
        const res = await fetch('/api/wl/login', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ brand: slug, email: trimmed, password }),
        });
        if (res.ok) {
          clearAgencyData();
          window.location.assign(safeNext(slug, params.get('next')));
          return;
        }
        setLoginError(
          res.status === 401
            ? 'Incorrect email or password.'
            : "We couldn't sign you in right now. Please try again in a moment.",
        );
      } catch {
        setLoginError("Can't reach the server. Check your connection and try again.");
      }
      setLoginLoading(false);
    },
    [slug, params],
  );

  const onAgencyLogout = useCallback(async () => {
    try {
      const res = await fetch('/api/wl/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ brand: slug }),
      });
      if (!res.ok) throw new Error(String(res.status));
      clearAgencyData();
      window.location.assign(`/${slug}?signedout=1`);
    } catch {
      window.alert("Couldn't sign out. Check your connection and try again.");
    }
  }, [slug]);

  const route = useMemo(() => {
    if (!data || isLogin) return null;
    const clients = data.clients;
    if (screen === 'client-dashboard') {
      const [clientPart, sectionPart, reportPart, ...extra] = rest;
      if (!clientPart) return { redirect: `/${slug}/clients/${clientSlug(clients[0].name)}/overview` };
      const client = clients.find((c) => clientSlug(c.name) === clientPart);
      if (!client) return { notFound: true as const };
      if (!sectionPart) return { redirect: `/${slug}/clients/${clientPart}/overview` };
      const section = CLIENT_SECTIONS.find((s) => s.id === sectionPart)?.id;
      if (!section || extra.length || (reportPart && section !== 'reports')) return { notFound: true as const };
      if (reportPart && !data.reports.some((r) => r.id === reportPart && r.client === client.name)) {
        return { notFound: true as const };
      }
      return { client, section, reportId: reportPart };
    }
    if (screen === 'reports') {
      const [reportPart, ...extra] = rest;
      if (extra.length || (reportPart && !data.reports.some((r) => r.id === reportPart))) return { notFound: true as const };
      return { reportId: reportPart };
    }
    return rest.length ? { notFound: true as const } : {};
  }, [data, isLogin, screen, rest, slug]);

  const client = route && 'client' in route ? route.client : undefined;
  const section = route && 'section' in route ? (route.section as ClientSection) : undefined;
  const reportId = route && 'reportId' in route ? route.reportId : undefined;

  const context = useMemo(() => {
    const clientHref = (name: string, s: ClientSection = section ?? 'overview') =>
      `/${slug}/clients/${clientSlug(name)}/${s}`;
    const loginNotice = params.get('expired')
      ? 'Your session has expired. Please sign in again.'
      : params.get('signedout')
        ? "You've been signed out."
        : null;
    return {
      navLink: (label: string, role?: 'agency' | 'client') => {
        if (role === 'client' && client) {
          const s = CLIENT_SECTIONS.find((x) => x.label === label);
          return s ? clientHref(client.name, s.id) : undefined;
        }
        return PATH_BY_NAV_LABEL[label] ? `/${slug}/${PATH_BY_NAV_LABEL[label]}` : undefined;
      },
      onAgencyLogin,
      onAgencyLogout,
      loginError,
      loginLoading,
      loginNotice,
      signInHref: `/${slug}`,
      clientName: client?.name,
      clientSection: section,
      clientHref: (name: string) => clientHref(name, 'overview'),
      onSelectClient: (name: string) => navigate(clientHref(name)),
      reportId,
      reportHref: (id: string) =>
        client && section === 'reports' ? `${clientHref(client.name, 'reports')}/${id}` : `/${slug}/reports/${id}`,
      reportsHref: client && section === 'reports' ? clientHref(client.name, 'reports') : `/${slug}/reports`,
    };
  }, [slug, navigate, client, section, reportId, params, onAgencyLogin, onAgencyLogout, loginError, loginLoading]);

  if (!tenant || !isPortalSlug) return <Navigate to="/" replace />;

  const shellStyle = {
    ...(whitelabelCssVars(tenant.theme) as React.CSSProperties),
    minHeight: '100vh',
    background: tenant.theme.pageBg,
  };

  const notFound = (
    <PortalMessage
      theme={tenant.theme}
      title="Page not found"
      body="This page doesn't exist or the link is out of date."
      action={
        <Link className="wl-btn" to={`/${slug}/dashboard`}>
          Go to dashboard
        </Link>
      }
    />
  );

  let body: React.ReactNode;
  if (!screen) body = notFound;
  else if (isLogin) body = rest.length ? notFound : renderWhitelabelScene(screen, tenant.theme, context);
  else if (!data) body = renderWhitelabelScene(screen, tenant.theme, context);
  else if (route && 'redirect' in route) return <Navigate to={route.redirect} replace />;
  else if (route && 'notFound' in route) body = notFound;
  else body = renderWhitelabelScene(screen, tenant.theme, context);

  return (
    <div className="wl-client-portal" style={shellStyle}>
      {body}
    </div>
  );
};

export default WhitelabelClientPortal;
