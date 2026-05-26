import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, ExternalLink, Link2, Loader2, RefreshCw, Unplug } from 'lucide-react';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { api } from '../../../../services/api';
import type { AdveroIntegrationsPayload } from '../../../../lib/adveroDashboardApi';
import { markSetupComplete } from '../../../../lib/adveroSetupProgress';
import { useToast } from '../../../../hooks/useToast';
import AdveroDashboardPageHeader from './AdveroDashboardPageHeader';

type AdsAccount = { customerId: string; descriptiveName: string; manager: boolean };

const AdveroDashboardIntegrationsPage: React.FC = () => {
  const { lang } = useMarketplace();
  const isDa = lang === 'da';
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<AdveroIntegrationsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<AdsAccount[]>([]);
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  const t = useMemo(
    () => ({
      eyebrow: isDa ? 'Indstillinger' : 'Settings',
      title: isDa ? 'Google-integrationer' : 'Google integrations',
      lead: isDa
        ? 'Forbind Search Console og Google Ads med OAuth. Data synkroniseres til dit dashboard.'
        : 'Connect Search Console and Google Ads with OAuth. Data syncs to your dashboard.',
      gscTitle: 'Google Search Console',
      gscDesc: isDa
        ? 'Organisk søgning: klik, visninger og forespørgsler fra jeres website.'
        : 'Organic search: clicks, impressions, and queries from your website.',
      adsTitle: 'Google Ads',
      adsDesc: isDa
        ? 'Kampagneperformance fra kundens Ads-konto (styring betales til Advero; annoncebudget til Google).'
        : 'Campaign performance from the client Ads account (management billed to Advero; ad spend to Google).',
      connect: isDa ? 'Forbind med Google' : 'Connect with Google',
      sync: isDa ? 'Synkroniser nu' : 'Sync now',
      disconnect: isDa ? 'Afbryd' : 'Disconnect',
      connected: isDa ? 'Forbundet' : 'Connected',
      notConnected: isDa ? 'Ikke forbundet' : 'Not connected',
      selectAccount: isDa ? 'Vælg Google Ads-konto' : 'Select Google Ads account',
      confirmAccount: isDa ? 'Brug denne konto' : 'Use this account',
      loadingAccounts: isDa ? 'Henter konti…' : 'Loading accounts…',
      pendingPick: isDa
        ? 'Google er forbundet — vælg hvilken Ads-konto Advero skal læse.'
        : 'Google connected — pick which Ads account Advero should read.',
      missingOAuth: isDa
        ? 'Google OAuth er ikke konfigureret på serveren (GOOGLE_CLIENT_ID).'
        : 'Google OAuth is not configured on the server (GOOGLE_CLIENT_ID).',
      missingAdsToken: isDa
        ? 'Google Ads developer token mangler på serveren.'
        : 'Google Ads developer token missing on the server.',
    }),
    [isDa]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await api.getAdveroIntegrations();
      setData(payload);
      if (payload.searchConsole.connected && payload.searchConsole.source === 'google') {
        markSetupComplete('gsc');
      }
      if (payload.googleAds.connected && payload.googleAds.source === 'google') {
        markSetupComplete('ads');
      }
      if (payload.googleAds.pendingAccountSelection) {
        setShowAccountPicker(true);
      }
    } catch (e: unknown) {
      toast.error((e as Error)?.message || (isDa ? 'Kunne ikke hente integrationer.' : 'Could not load integrations.'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [isDa, toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const integration = searchParams.get('integration');
    const status = searchParams.get('status');
    if (!integration) return;

    if (integration === 'gsc' && status === 'connected') {
      toast.success(isDa ? 'Search Console forbundet.' : 'Search Console connected.');
      markSetupComplete('gsc');
    } else if (integration === 'ads' && status === 'select_account') {
      toast.info(t.pendingPick);
      setShowAccountPicker(true);
      void api.getGoogleAdsAccounts().then((r) => setAccounts(r.accounts)).catch(() => undefined);
    } else if (integration === 'error') {
      toast.error(searchParams.get('message') || (isDa ? 'Google-forbindelse fejlede.' : 'Google connect failed.'));
    }

    searchParams.delete('integration');
    searchParams.delete('status');
    searchParams.delete('message');
    setSearchParams(searchParams, { replace: true });
    void load();
  }, [searchParams, setSearchParams, toast, isDa, t.pendingPick, load]);

  const openOAuth = (url: string | null) => {
    if (!url) {
      toast.error(t.missingOAuth);
      return;
    }
    window.location.href = url;
  };

  const runSync = async (kind: 'gsc' | 'ads') => {
    setBusy(`sync-${kind}`);
    try {
      if (kind === 'gsc') await api.syncAdveroSearchConsole();
      else await api.syncAdveroGoogleAds();
      toast.success(isDa ? 'Synkroniseret.' : 'Synced.');
      await load();
    } catch (e: unknown) {
      toast.error((e as Error)?.message || (isDa ? 'Synkronisering fejlede.' : 'Sync failed.'));
    } finally {
      setBusy(null);
    }
  };

  const runDisconnect = async (kind: 'gsc' | 'ads') => {
    setBusy(`disc-${kind}`);
    try {
      if (kind === 'gsc') await api.disconnectAdveroSearchConsole();
      else await api.disconnectAdveroGoogleAds();
      toast.success(isDa ? 'Forbindelse fjernet.' : 'Disconnected.');
      setShowAccountPicker(false);
      setAccounts([]);
      await load();
    } catch (e: unknown) {
      toast.error((e as Error)?.message || (isDa ? 'Kunne ikke afbryde.' : 'Could not disconnect.'));
    } finally {
      setBusy(null);
    }
  };

  const loadAccounts = async () => {
    setBusy('accounts');
    try {
      const { accounts: list } = await api.getGoogleAdsAccounts();
      setAccounts(list);
      setShowAccountPicker(true);
    } catch (e: unknown) {
      toast.error((e as Error)?.message || (isDa ? 'Kunne ikke hente Ads-konti.' : 'Could not load Ads accounts.'));
    } finally {
      setBusy(null);
    }
  };

  const pickAccount = async (customerId: string) => {
    setBusy(`pick-${customerId}`);
    try {
      await api.selectGoogleAdsAccount(customerId);
      toast.success(isDa ? 'Google Ads-konto valgt.' : 'Google Ads account selected.');
      markSetupComplete('ads');
      setShowAccountPicker(false);
      await load();
    } catch (e: unknown) {
      toast.error((e as Error)?.message || (isDa ? 'Kunne ikke vælge konto.' : 'Could not select account.'));
    } finally {
      setBusy(null);
    }
  };

  const statusPill = (connected: boolean, source?: string) => (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
        connected && source === 'google'
          ? 'bg-emerald-500/15 text-emerald-200'
          : connected
            ? 'bg-amber-500/15 text-amber-100'
            : 'bg-white/10 text-white/55'
      }`}
    >
      {connected && source === 'google' ? <Check size={12} /> : <Link2 size={12} />}
      {connected ? (source === 'google' ? t.connected : `${t.connected} (demo)`) : t.notConnected}
    </span>
  );

  return (
    <>
      <AdveroDashboardPageHeader eyebrow={t.eyebrow} title={t.title} />
      <div className="advero-dash-page-body max-w-3xl">
        <p className="advero-dash-lead mb-8">{t.lead}</p>

        {loading ? (
          <p className="flex items-center gap-2 text-sm text-white/60">
            <Loader2 size={16} className="animate-spin" />
            {isDa ? 'Indlæser…' : 'Loading…'}
          </p>
        ) : null}

        {data && !data.configured.googleOAuth ? (
          <p className="mb-6 rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {t.missingOAuth}
          </p>
        ) : null}

        <div className="grid gap-6">
          <section className="advero-home-panel rounded-2xl border border-white/10 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">{t.gscTitle}</h2>
                <p className="mt-1 text-sm text-white/60">{t.gscDesc}</p>
              </div>
              {data ? statusPill(data.searchConsole.connected, data.searchConsole.source) : null}
            </div>

            {data?.searchConsole.connected ? (
              <ul className="mt-4 space-y-1 text-sm text-white/70">
                {data.searchConsole.siteUrl ? (
                  <li>
                    {isDa ? 'Property' : 'Property'}: {data.searchConsole.siteUrl}
                  </li>
                ) : null}
                {data.searchConsole.clicks != null ? (
                  <li>
                    {isDa ? 'Klik (28 d.)' : 'Clicks (28d)'}: {data.searchConsole.clicks}
                  </li>
                ) : null}
                {data.searchConsole.impressions != null ? (
                  <li>
                    {isDa ? 'Visninger' : 'Impressions'}: {data.searchConsole.impressions}
                  </li>
                ) : null}
              </ul>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              {!data?.searchConsole.connected || data.searchConsole.source !== 'google' ? (
                <button
                  type="button"
                  className="advero-btn-slate-solid inline-flex items-center gap-2 px-4 py-2 text-sm"
                  onClick={() => openOAuth(data?.authUrls.gsc ?? null)}
                  disabled={!!busy}
                >
                  <ExternalLink size={14} />
                  {t.connect}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/90 hover:bg-white/5"
                    onClick={() => runSync('gsc')}
                    disabled={!!busy}
                  >
                    {busy === 'sync-gsc' ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    {t.sync}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/55 hover:text-white/80"
                    onClick={() => runDisconnect('gsc')}
                    disabled={!!busy}
                  >
                    <Unplug size={14} />
                    {t.disconnect}
                  </button>
                </>
              )}
            </div>
          </section>

          <section className="advero-home-panel rounded-2xl border border-white/10 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">{t.adsTitle}</h2>
                <p className="mt-1 text-sm text-white/60">{t.adsDesc}</p>
              </div>
              {data ? statusPill(data.googleAds.connected, data.googleAds.source) : null}
            </div>

            {data && !data.configured.googleAdsApi ? (
              <p className="mt-3 text-xs text-amber-200/90">{t.missingAdsToken}</p>
            ) : null}

            {data?.googleAds.connected ? (
              <ul className="mt-4 space-y-1 text-sm text-white/70">
                {data.googleAds.customerName ? <li>{data.googleAds.customerName}</li> : null}
                {data.googleAds.customerId ? <li>ID: {data.googleAds.customerId}</li> : null}
                {data.googleAds.clicks != null ? (
                  <li>
                    {isDa ? 'Klik (30 d.)' : 'Clicks (30d)'}: {data.googleAds.clicks}
                  </li>
                ) : null}
                {data.googleAds.costDkk ? (
                  <li>
                    {isDa ? 'Forbrug' : 'Spend'}: {data.googleAds.costDkk}
                  </li>
                ) : null}
              </ul>
            ) : data?.googleAds.pendingAccountSelection ? (
              <p className="mt-4 text-sm text-violet-200/90">{t.pendingPick}</p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              {!data?.googleAds.connected && !data?.googleAds.pendingAccountSelection ? (
                <button
                  type="button"
                  className="advero-btn-slate-solid inline-flex items-center gap-2 px-4 py-2 text-sm"
                  onClick={() => openOAuth(data?.authUrls.ads ?? null)}
                  disabled={!!busy}
                >
                  <ExternalLink size={14} />
                  {t.connect}
                </button>
              ) : null}

              {data?.googleAds.pendingAccountSelection || showAccountPicker ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-500/10 px-4 py-2 text-sm text-violet-100"
                  onClick={() => loadAccounts()}
                  disabled={!!busy}
                >
                  {busy === 'accounts' ? <Loader2 size={14} className="animate-spin" /> : null}
                  {t.selectAccount}
                </button>
              ) : null}

              {data?.googleAds.connected && data.googleAds.source === 'google' ? (
                <>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/90 hover:bg-white/5"
                    onClick={() => runSync('ads')}
                    disabled={!!busy}
                  >
                    {busy === 'sync-ads' ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    {t.sync}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/55"
                    onClick={() => runDisconnect('ads')}
                    disabled={!!busy}
                  >
                    <Unplug size={14} />
                    {t.disconnect}
                  </button>
                </>
              ) : null}
            </div>

            {showAccountPicker && accounts.length > 0 ? (
              <ul className="mt-6 space-y-2 border-t border-white/10 pt-4">
                {accounts.map((a) => (
                  <li
                    key={a.customerId}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-white">{a.descriptiveName}</p>
                      <p className="text-xs text-white/50">{a.customerId}</p>
                    </div>
                    <button
                      type="button"
                      className="advero-btn-slate-solid px-3 py-1.5 text-xs"
                      disabled={!!busy}
                      onClick={() => pickAccount(a.customerId)}
                    >
                      {busy === `pick-${a.customerId}` ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        t.confirmAccount
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {showAccountPicker && busy === 'accounts' ? (
              <p className="mt-4 text-sm text-white/50">{t.loadingAccounts}</p>
            ) : null}
          </section>
        </div>
      </div>
    </>
  );
};

export default AdveroDashboardIntegrationsPage;
