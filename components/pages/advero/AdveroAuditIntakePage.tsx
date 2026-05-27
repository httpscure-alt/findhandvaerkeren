import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Globe, Loader2, Mail, MapPin, Sparkles, Tag } from 'lucide-react';
import { useAdveroLang } from '../../../lib/adveroLocale';
import { useToast } from '../../../hooks/useToast';
import { api } from '../../../services/api';
import type { GrowthGoal, IndustryCategory } from '../../../lib/recommendPlan';
import { mockAnalyzeVisibility } from '../../../lib/mockAnalyzeVisibility';
import { getJourneyStoryCopy } from '../../../lib/adveroJourneyStory';
import './advero-ds.css';

const AdveroAuditIntakePage: React.FC = () => {
  const { isDa } = useAdveroLang();
  const navigate = useNavigate();
  const toast = useToast();

  const [websiteUrl, setWebsiteUrl] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState<IndustryCategory>('unknown');
  const [serviceArea, setServiceArea] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [growthGoal, setGrowthGoal] = useState<GrowthGoal>('both');
  const [loading, setLoading] = useState(false);

  const story = getJourneyStoryCopy();

  const t = {
    kicker: isDa ? 'Gratis synlighedsanalyse' : 'Free visibility analysis',
    title: isDa ? 'Fortæl om jeres virksomhed' : 'Tell us about your business',
    subtitle: isDa
      ? 'Vi analyserer jeres synlighed online og viser resultater med en anbefalet pakke.'
      : 'We analyze your online visibility and show results with a recommended package.',
    engineNote: isDa ? story.engineNoteDa : story.engineNoteEn,
    website: isDa ? 'Website URL' : 'Website URL',
    company: isDa ? 'Virksomhedsnavn' : 'Business name',
    category: isDa ? 'Kategori / branche' : 'Category',
    location: isDa ? 'Lokation' : 'Location',
    email: isDa ? 'E-mail' : 'Email',
    emailHint: isDa ? 'Vi sender et link til resultaterne.' : 'We will email you a link to your results.',
    goal: isDa ? 'Primært mål' : 'Primary goal',
    submit: isDa ? 'Få gratis synlighedsanalyse' : 'Get free visibility analysis',
    back: isDa ? 'Til forsiden' : 'Back to home',
    needName: isDa ? 'Angiv virksomhedsnavn.' : 'Enter a business name.',
    needEmail: isDa ? 'Angiv en gyldig e-mail.' : 'Enter a valid email.',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = companyName.trim();
    const email = contactEmail.trim();
    if (name.length < 2) {
      toast.error(t.needName);
      return;
    }
    if (!email.includes('@')) {
      toast.error(t.needEmail);
      return;
    }

    setLoading(true);
    const payload = {
      companyName: name,
      websiteUrl: websiteUrl.trim() || undefined,
      serviceArea: serviceArea.trim() || undefined,
      contactEmail: email,
      growthGoal,
      industry: industry === 'unknown' ? undefined : industry,
    };

    try {
      const { audit } = await api.createVisibilityAudit({ ...payload, industry, growthGoal });
      navigate(`/advero/audit/analyzing?id=${encodeURIComponent(audit.id)}`, { replace: true });
    } catch {
      const audit = mockAnalyzeVisibility({ ...payload, industry, growthGoal });
      navigate(`/advero/audit/analyzing?id=${encodeURIComponent(audit.id)}`, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="advero-ds relative isolate min-h-screen">
      <div className="advero-dot-grid pointer-events-none absolute inset-0 -z-10" aria-hidden />

      <header className="advero-site-header">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="advero-site-header-brand shrink-0" aria-label="Advero">
            <img
              src="/brand/advero-logo-light.png"
              alt=""
              className="advero-logo-wordmark-light object-contain object-left"
              width={800}
              height={168}
            />
          </Link>
          <Link to="/" className="advero-btn-ghost text-[11px] font-semibold uppercase tracking-[0.12em]">
            {t.back}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-10 pb-20 sm:px-6">
        <div className="mb-8 text-center">
          <p className="mono-label text-[10px] font-semibold tracking-[0.2em] text-white/50">{t.kicker}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{t.title}</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/60">{t.subtitle}</p>
          <p className="mx-auto mt-3 max-w-lg text-xs leading-relaxed text-white/45">{t.engineNote}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-white/10 bg-white p-6 shadow-xl sm:p-8"
        >
          <label className="block">
            <span className="mono-label mb-1.5 flex items-center gap-2 text-[10px] text-slate-500">
              <Globe className="h-3.5 w-3.5" aria-hidden />
              {t.website}
            </span>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900"
              placeholder="https://example.dk"
            />
          </label>

          <label className="block">
            <span className="mono-label mb-1.5 flex items-center gap-2 text-[10px] text-slate-500">
              <Building2 className="h-3.5 w-3.5" aria-hidden />
              {t.company}
            </span>
            <input
              required
              minLength={2}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900"
              placeholder={isDa ? 'Fx Nordisk El ApS' : 'e.g. Acme Services Ltd'}
            />
          </label>

          <label className="block">
            <span className="mono-label mb-1.5 flex items-center gap-2 text-[10px] text-slate-500">
              <Tag className="h-3.5 w-3.5" aria-hidden />
              {t.category}
            </span>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
              value={industry}
              onChange={(e) => setIndustry(e.target.value as IndustryCategory)}
            >
              <option value="unknown">{isDa ? 'Vælg kategori' : 'Select category'}</option>
              <option value="local_services">{isDa ? 'Lokal service' : 'Local services'}</option>
              <option value="professional_services">{isDa ? 'Professionel' : 'Professional'}</option>
              <option value="retail_ecommerce">{isDa ? 'Retail / webshop' : 'Retail / e-commerce'}</option>
              <option value="hospitality">{isDa ? 'Hotel / restaurant' : 'Hospitality'}</option>
              <option value="health_wellness">{isDa ? 'Sundhed / wellness' : 'Health / wellness'}</option>
              <option value="other">{isDa ? 'Andet' : 'Other'}</option>
            </select>
          </label>

          <label className="block">
            <span className="mono-label mb-1.5 flex items-center gap-2 text-[10px] text-slate-500">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {t.location}
            </span>
            <input
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900"
              placeholder={isDa ? 'Fx København og Nordsjælland' : 'e.g. Copenhagen area'}
            />
          </label>

          <label className="block">
            <span className="mono-label mb-1.5 flex items-center gap-2 text-[10px] text-slate-500">
              <Mail className="h-3.5 w-3.5" aria-hidden />
              {t.email}
            </span>
            <input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900"
              placeholder="navn@firma.dk"
            />
            <p className="mt-1 text-xs text-slate-500">{t.emailHint}</p>
          </label>

          <label className="block">
            <span className="mono-label mb-1.5 block text-[10px] text-slate-500">{t.goal}</span>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
              value={growthGoal}
              onChange={(e) => setGrowthGoal(e.target.value as GrowthGoal)}
            >
              <option value="leads_now">{isDa ? 'Flere henvendelser nu' : 'More leads now'}</option>
              <option value="long_term">{isDa ? 'Langsigtet synlighed' : 'Long-term visibility'}</option>
              <option value="both">{isDa ? 'Begge dele' : 'Both'}</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="advero-btn-slate-solid flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden />
            )}
            {t.submit}
            {!loading ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
          </button>
        </form>
      </main>
    </div>
  );
};

export default AdveroAuditIntakePage;
