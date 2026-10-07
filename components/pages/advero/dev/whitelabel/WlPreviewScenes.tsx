import React, { createContext, useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { WhitelabelScreenId, WhitelabelTheme } from '../../../../../lib/adveroWhitelabelThemes';
import { formatWlIdr } from '../../../../../lib/adveroWhitelabelThemes';
import {
  agencyDemoData,
  useAgencyData,
  type DemoClient,
  type DemoReport,
} from '../../../../../lib/whitelabel/agencyDataStore';
import WhitelabelWordmark from '../../../../advero/whitelabel/WhitelabelWordmark';

type SceneProps = { theme: WhitelabelTheme };

export type WhitelabelSceneContext = {
  link?: (id: WhitelabelScreenId) => string;
  onAgencyLogin?: (email: string, password: string) => Promise<void>;
  onAgencyLogout?: () => void;
  loginError?: string | null;
  loginLoading?: boolean;
  loginNotice?: string | null;
  navLink?: (label: string, role?: 'agency' | 'client') => string | undefined;
  clientName?: string;
  clientSection?: ClientSection;
  clientHref?: (clientName: string) => string;
  onSelectClient?: (clientName: string) => void;
  reportId?: string;
  reportHref?: (reportId: string) => string;
  reportsHref?: string;
  signInHref?: string;
};

export type ClientSection = 'overview' | 'google-ads' | 'seo' | 'ai-visibility' | 'meta' | 'reports';

export const CLIENT_SECTIONS: { id: ClientSection; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'google-ads', label: 'Google Ads' },
  { id: 'seo', label: 'SEO' },
  { id: 'ai-visibility', label: 'AI visibility' },
  { id: 'meta', label: 'Meta' },
  { id: 'reports', label: 'Reports' },
];

export function clientSlug(name: string): string {
  return name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const WhitelabelSceneContextReact = createContext<WhitelabelSceneContext | undefined>(undefined);

function useSceneContext(): WhitelabelSceneContext | undefined {
  return useContext(WhitelabelSceneContextReact);
}

function SceneContextProvider({
  value,
  children,
}: {
  value?: WhitelabelSceneContext;
  children: React.ReactNode;
}) {
  if (!value) return <>{children}</>;
  return <WhitelabelSceneContextReact.Provider value={value}>{children}</WhitelabelSceneContextReact.Provider>;
}

function MiniBars({ values, accentEvery = 4 }: { values: number[]; accentEvery?: number }) {
  const h = values;
  return (
    <div className="flex h-12 items-end gap-[3px]">
      {h.map((v, i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: `${v}%`,
            borderRadius: 2,
            background: i % accentEvery === 0 ? 'var(--wl-accent)' : 'var(--wl-chart-muted)',
          }}
        />
      ))}
    </div>
  );
}

function DailyBars({ values }: { values: number[] }) {
  const days = Array.from({ length: 30 }, (_, d) => {
    const x = (d / 29) * (values.length - 1);
    const i = Math.floor(x);
    const base = values[i] + (values[Math.min(i + 1, values.length - 1)] - values[i]) * (x - i);
    const jitter = ((Math.sin(d * 12.9898 + values[0]) * 43758.5453) % 1) * 12;
    return Math.max(12, Math.min(100, base + jitter));
  });
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120 }}>
      {days.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${v}%`,
            borderRadius: 3,
            background: i >= 23 ? 'var(--wl-accent)' : 'var(--wl-chart-muted)',
          }}
        />
      ))}
    </div>
  );
}

function WlPoweredBy({ theme }: { theme: WhitelabelTheme }) {
  if (!theme.showPoweredBy) return null;
  return (
    <p className="wl-powered-by">
      Powered by <strong>Advero</strong>
    </p>
  );
}

type NavLink = { label: string; active?: boolean };

function WlSidebar({
  theme,
  role,
  links,
  navLink,
  onSignOut,
}: {
  theme: WhitelabelTheme;
  role: 'agency' | 'client';
  links: NavLink[];
  navLink?: (label: string, role?: 'agency' | 'client') => string | undefined;
  onSignOut?: () => void;
}) {
  const backHref = role === 'client' ? navLink?.('Dashboard', 'agency') : undefined;
  return (
    <aside className="wl-sidebar">
      <WhitelabelWordmark theme={theme} variant="light" />
      {backHref ? (
        <Link to={backHref} className="wl-sidebar-link">
          ← All clients
        </Link>
      ) : null}
      <div>
        <p className="wl-sidebar-section">{role === 'agency' ? 'Agency' : 'Client'}</p>
        <nav className="wl-sidebar-nav">
          {links.map((l) => {
            const href = navLink?.(l.label, role);
            const className = `wl-sidebar-link ${l.active ? 'wl-sidebar-link--on' : ''}`;
            if (href) {
              return (
                <Link key={l.label} to={href} className={className}>
                  {l.label}
                </Link>
              );
            }
            return (
              <a
                key={l.label}
                href="#"
                className={className}
                onClick={(e) => e.preventDefault()}
              >
                {l.label}
              </a>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto">
        <p className="wl-sidebar-section">Account</p>
        <a href="#" className="wl-sidebar-link" onClick={(e) => e.preventDefault()}>
          Settings
        </a>
        {onSignOut ? (
          <button type="button" className="wl-sidebar-link wl-sidebar-signout" onClick={onSignOut}>
            Sign out
          </button>
        ) : null}
      </div>
    </aside>
  );
}

function WlAppShell({
  theme,
  role,
  title,
  subtitle,
  activeNav,
  children,
  action,
}: {
  theme: WhitelabelTheme;
  role: 'agency' | 'client';
  title: string;
  subtitle?: string;
  activeNav: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const sceneContext = useSceneContext();
  const agencyLinks: NavLink[] = [
    { label: 'Dashboard', active: activeNav === 'Dashboard' },
    { label: 'Operations', active: activeNav === 'Operations' },
    { label: 'Clients', active: activeNav === 'Clients' },
    { label: 'Audit history', active: activeNav === 'Audit history' },
    { label: 'Reports', active: activeNav === 'Reports' },
    { label: 'Recommendations', active: activeNav === 'Recommendations' },
  ];

  const clientLinks: NavLink[] = [
    { label: 'Overview', active: activeNav === 'Overview' },
    { label: 'Google Ads', active: activeNav === 'Google Ads' },
    { label: 'SEO', active: activeNav === 'SEO' },
    { label: 'AI visibility', active: activeNav === 'AI visibility' },
    { label: 'Meta', active: activeNav === 'Meta' },
    { label: 'Reports', active: activeNav === 'Reports' },
  ];

  return (
    <div className="wl-root">
      <div className="wl-app-layout">
        <WlSidebar
          theme={theme}
          role={role}
          links={role === 'agency' ? agencyLinks : clientLinks}
          navLink={sceneContext?.navLink}
          onSignOut={sceneContext?.onAgencyLogout}
        />
        <div className="wl-app-main">
          <header className="wl-app-topbar">
            <div>
              <h1 className="wl-page-title">{title}</h1>
              {subtitle ? <p className="wl-page-sub">{subtitle}</p> : null}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="wl-tag wl-tag--outline">{agencyDemoData(theme.id).period}</span>
              {action}
            </div>
          </header>
          <div className="wl-app-content">{children}</div>
        </div>
      </div>
    </div>
  );
}

const fmtInt = (n: number) => n.toLocaleString('en-US');
const fmtReach = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${Math.round(n / 1000)}k`);

type ChannelSource = {
  google: DemoClient['google'];
  meta: DemoClient['meta'];
  seo: DemoClient['seo'];
  ai: DemoClient['ai'];
  metaRoas: number;
  deltas: { google: string; seo: string; ai: string };
  trendA: number[];
  trendB: number[];
};

function ChannelCards({ showCharts, source }: { showCharts?: boolean; source: ChannelSource }) {
  const { google, meta, seo, ai } = source;
  const channels = [
    {
      title: 'Google Ads',
      delta: source.deltas.google,
      trend: source.trendA,
      metrics: [
        { l: 'Spend', v: formatWlIdr(google.spend) },
        { l: 'Clicks', v: fmtInt(google.clicks) },
        { l: 'Conversions', v: fmtInt(google.conversions) },
        { l: 'CPA', v: formatWlIdr(google.cpa) },
      ],
    },
    {
      title: 'SEO',
      delta: source.deltas.seo,
      trend: source.trendA,
      metrics: [
        { l: 'Visibility', v: String(seo.visibility) },
        { l: 'Top 10 keywords', v: fmtInt(seo.top10) },
        { l: 'Organic sessions', v: fmtInt(seo.sessions) },
        { l: 'Indexed pages', v: fmtInt(seo.pages) },
      ],
    },
    {
      title: 'AI visibility',
      delta: source.deltas.ai,
      trend: source.trendA,
      metrics: [
        { l: 'AI score', v: String(ai.score) },
        { l: 'Brand mentions', v: fmtInt(ai.mentions) },
        { l: 'Share of voice', v: `${ai.shareOfVoice}%` },
        { l: 'Cited sources', v: fmtInt(ai.cited) },
      ],
    },
    {
      title: 'Meta Ads',
      delta: `ROAS ${source.metaRoas.toFixed(1)}×`,
      trend: source.trendB,
      metrics: [
        { l: 'Spend', v: formatWlIdr(meta.spend) },
        { l: 'Reach', v: fmtReach(meta.reach) },
        { l: 'CTR', v: `${(meta.ctr * 100).toFixed(1)}%` },
        { l: 'Conversions', v: fmtInt(meta.conversions) },
      ],
    },
  ];

  return (
    <div className="wl-channel-grid">
      {channels.map((ch) => (
        <div key={ch.title} className="wl-channel-card">
          <div className="wl-channel-head">
            <span className="wl-channel-title">{ch.title}</span>
            <span className="wl-channel-delta">{ch.delta}</span>
          </div>
          <div className="wl-channel-metrics">
            {ch.metrics.map((m) => (
              <div key={m.l} className="wl-channel-metric">
                <span>{m.l}</span>
                <strong>{m.v}</strong>
              </div>
            ))}
          </div>
          {showCharts && (ch.title === 'Google Ads' || ch.title === 'Meta Ads') ? (
            <div className="wl-chart-box">
              <p className="wl-chart-label">Last 30 days</p>
              <MiniBars values={ch.trend} />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function ClientRow({ name, children }: { name: string; children: React.ReactNode }) {
  const href = useSceneContext()?.clientHref?.(name);
  if (!href) return <div className="wl-list-row">{children}</div>;
  return (
    <Link to={href} className="wl-list-row wl-list-row--link" style={{ color: 'inherit', textDecoration: 'none' }}>
      {children}
    </Link>
  );
}

function StatRow({ items }: { items: { l: string; v: string }[] }) {
  return (
    <div className="wl-stat-row">
      {items.map((m) => (
        <div key={m.l} className="wl-stat-cell">
          <span>{m.l}</span>
          <strong>{m.v}</strong>
        </div>
      ))}
    </div>
  );
}

function LoginScene({ theme, role }: { theme: WhitelabelTheme; role: 'agency' | 'client' }) {
  const isAgency = role === 'agency';
  const sceneContext = useSceneContext();
  const interactive = isAgency && !!sceneContext?.onAgencyLogin;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interactive || !sceneContext?.onAgencyLogin) return;
    await sceneContext.onAgencyLogin(email, password);
  };

  return (
    <div className="wl-root">
      <div className="wl-login-split">
        <div className="wl-login-brand">
          <WhitelabelWordmark theme={theme} variant="light" />
          <p>
            {isAgency
              ? 'Manage client performance, audits, and reporting from one workspace.'
              : `Your brand performance dashboard — delivered by ${theme.name}.`}
          </p>
        </div>
        <form className="wl-login-form-side" onSubmit={handleSubmit} noValidate>
          <h2>{isAgency ? 'Agency sign in' : 'Client sign in'}</h2>
          <p className="wl-muted">
            {isAgency
              ? `Use your ${theme.name} team credentials.`
              : 'Access your performance reports.'}
          </p>
          <label className="wl-field">
            <span>Email</span>
            <input
              readOnly={!interactive}
              className="wl-input"
              type="email"
              name="email"
              autoComplete="username"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="wl-field">
            <span>Password</span>
            <input
              readOnly={!interactive}
              type="password"
              name="password"
              autoComplete="current-password"
              className="wl-input"
              value={interactive ? password : '••••••••'}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {sceneContext?.loginNotice && !sceneContext?.loginError ? (
            <p className="wl-muted" role="status" style={{ fontSize: 12, marginTop: 8 }}>
              {sceneContext.loginNotice}
            </p>
          ) : null}
          {sceneContext?.loginError ? (
            <p className="wl-muted" role="alert" style={{ color: '#b91c1c', fontSize: 12, marginTop: 8 }}>
              {sceneContext.loginError}
            </p>
          ) : null}
          <button
            type="submit"
            className="wl-btn wl-btn--wide"
            style={{ marginTop: '1.25rem' }}
            disabled={!interactive || sceneContext?.loginLoading}
          >
            {sceneContext?.loginLoading ? 'Signing in…' : 'Sign in'}
          </button>
          <WlPoweredBy theme={theme} />
        </form>
      </div>
    </div>
  );
}

export const WlAgencyLoginScene: React.FC<SceneProps> = ({ theme }) => <LoginScene theme={theme} role="agency" />;

export const WlClientLoginScene: React.FC<SceneProps> = ({ theme }) => <LoginScene theme={theme} role="client" />;

export const WlAgencyDashboardScene: React.FC<SceneProps> = ({ theme }) => {
  const data = agencyDemoData(theme.id);
  const { totals } = data;
  return (
    <WlAppShell
      theme={theme}
      role="agency"
      title="Agency dashboard"
      subtitle={`Portfolio performance · ${data.clients.length} clients · September 2026`}
      activeNav="Dashboard"
      action={<button type="button" className="wl-btn">New client</button>}
    >
      <StatRow
        items={[
          { l: 'Total ad spend', v: formatWlIdr(totals.spend) },
          { l: 'Portfolio ROAS', v: `${totals.roas.toFixed(1)}×` },
          { l: 'Avg visibility score', v: String(totals.visibility) },
          { l: 'Active clients', v: `${totals.activeClients} of ${data.clients.length}` },
        ]}
      />

      <p className="wl-eyebrow wl-section-gap">Channel performance — all clients</p>
      <div style={{ marginTop: '0.65rem' }}>
        <ChannelCards
          showCharts
          source={{
            google: totals.google,
            meta: totals.meta,
            seo: totals.seo,
            ai: totals.ai,
            metaRoas: totals.meta.roas,
            deltas: data.deltas,
            trendA: data.clients[0].trend,
            trendB: data.clients[1].trend,
          }}
        />
      </div>

      <div className="wl-panel wl-section-gap">
        <div className="wl-panel-head">Clients by spend</div>
        <div className="wl-panel-body">
          {data.clients.map((c) => (
            <ClientRow key={c.name} name={c.name}>
              <div>
                <p style={{ fontWeight: 500 }}>{c.name}</p>
                <p className="wl-muted" style={{ fontSize: 12, marginTop: 2 }}>
                  {c.industry} · {fmtInt(c.leads)} leads
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: 12, alignItems: 'center' }}>
                {c.status !== 'Active' ? <span className="wl-tag">{c.status}</span> : null}
                <span className="wl-muted">{formatWlIdr(c.spend)}</span>
                <span className="wl-channel-delta">{c.roas.toFixed(1)}×</span>
              </div>
            </ClientRow>
          ))}
        </div>
      </div>
    </WlAppShell>
  );
};

export const WlAgencyOpsScene: React.FC<SceneProps> = ({ theme }) => {
  type TaskType = 'Report' | 'Audit' | 'Creative' | 'Integration' | 'Scan';
  type TaskStatus = 'open' | 'in_progress' | 'blocked' | 'done';

  type OpsTask = {
    id: string;
    title: string;
    client: string;
    type: TaskType;
    status: TaskStatus;
    priority: 'high' | 'medium' | 'low';
    dueLabel: string;
    owner: string;
    description: string;
    checklist: { id: string; label: string; done: boolean }[];
  };

  const data = agencyDemoData(theme.id);
  const sceneContext = useSceneContext();
  const owners = data.team;
  const initialTasks: OpsTask[] = data.tasks;

  const [tasks, setTasks] = useState(initialTasks);
  const [selectedId, setSelectedId] = useState<string>('t1');
  const [filter, setFilter] = useState<'all' | 'due' | 'blocked'>('all');
  const [mode, setMode] = useState<'detail' | 'add'>('detail');
  const [toast, setToast] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: '', client: data.featured.name, type: 'Report' as TaskType, owner: owners[0] });

  const selected = tasks.find((t) => t.id === selectedId) ?? null;

  const filteredTasks = useMemo(() => {
    if (filter === 'due') return tasks.filter((t) => t.status !== 'done' && t.dueLabel !== 'Scheduled');
    if (filter === 'blocked') return tasks.filter((t) => t.status === 'blocked');
    return tasks.filter((t) => t.status !== 'done');
  }, [tasks, filter]);

  const stats = useMemo(() => ({
    dueWeek: tasks.filter((t) => t.status !== 'done' && t.dueLabel !== 'Scheduled').length,
    drafts: tasks.filter((t) => t.type === 'Report' && t.status !== 'done').length,
    onboarding: data.clients.filter((c) => c.status === 'Onboarding').length,
    audits: tasks.filter((t) => t.type === 'Audit' && t.status !== 'done').length,
  }), [tasks, data.clients]);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  }

  function selectTask(id: string) {
    setSelectedId(id);
    setMode('detail');
  }

  function toggleCheck(taskId: string, checkId: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id !== taskId
          ? t
          : {
              ...t,
              checklist: t.checklist.map((c) => (c.id === checkId ? { ...c, done: !c.done } : c)),
              status: t.status === 'open' ? 'in_progress' : t.status,
            },
      ),
    );
  }

  function completeTask(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'done' as const, dueLabel: 'Completed' } : t)));
    flash('Task marked complete');
    const next = tasks.find((t) => t.id !== id && t.status !== 'done');
    if (next) setSelectedId(next.id);
  }

  function unblockTask(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'in_progress' as const, dueLabel: 'Due in 3 days' } : t)));
    flash('Block removed — task moved to in progress');
  }

  function reassignTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const idx = owners.indexOf(t.owner);
        return { ...t, owner: owners[(idx + 1) % owners.length] };
      }),
    );
    flash('Task reassigned');
  }

  function addTask() {
    if (!newTask.title.trim()) return;
    const id = `t${Date.now()}`;
    const task: OpsTask = {
      id,
      title: newTask.title.trim(),
      client: newTask.client,
      type: newTask.type,
      status: 'open',
      priority: 'medium',
      dueLabel: 'Due in 1 week',
      owner: newTask.owner,
      description: 'New task created from ops queue.',
      checklist: [{ id: 'c1', label: 'Define scope', done: false }],
    };
    setTasks((prev) => [task, ...prev]);
    setSelectedId(id);
    setMode('detail');
    setNewTask({ title: '', client: data.featured.name, type: 'Report', owner: owners[0] });
    flash('Task added to ops queue');
  }

  function statusTag(task: OpsTask) {
    if (task.status === 'done') return <span className="wl-tag wl-tag--done">Done</span>;
    if (task.status === 'blocked') return <span className="wl-tag wl-tag--blocked">Blocked</span>;
    if (task.dueLabel === 'Due today') return <span className="wl-tag wl-tag--accent">Due today</span>;
    return <span className="wl-tag wl-tag--outline">{task.dueLabel}</span>;
  }

  return (
    <WlAppShell
      theme={theme}
      role="agency"
      title="Operations"
      subtitle="Tasks, pipeline, and delivery calendar"
      activeNav="Operations"
      action={
        <button
          type="button"
          className="wl-btn"
          onClick={() => {
            setMode('add');
            flash('Add a new task below');
          }}
        >
          Add task
        </button>
      }
    >
      {toast ? (
        <div className="wl-toast">
          <strong>Action ·</strong> {toast}
        </div>
      ) : null}

      <StatRow
        items={[
          { l: 'Tasks due this week', v: String(stats.dueWeek) },
          { l: 'Reports in draft', v: String(stats.drafts) },
          { l: 'Onboarding', v: String(stats.onboarding) },
          { l: 'Audits in review', v: String(stats.audits) },
        ]}
      />

      <p className="wl-eyebrow wl-section-gap">Task queue</p>
      <div className="wl-ops-layout" style={{ marginTop: '0.65rem' }}>
        <div>
          <div className="wl-filter-tabs">
            {([
              ['all', 'All open'],
              ['due', 'Due soon'],
              ['blocked', 'Blocked'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`wl-filter-tab ${filter === key ? 'wl-filter-tab--on' : ''}`}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="wl-task-list">
            {filteredTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                className={`wl-task-card ${selectedId === task.id && mode === 'detail' ? 'wl-task-card--selected' : ''} ${task.status === 'done' ? 'wl-task-card--done' : ''}`}
                onClick={() => selectTask(task.id)}
              >
                <div className="wl-task-card-top">
                  <p className="wl-task-title">{task.title}</p>
                  {statusTag(task)}
                </div>
                <p className="wl-muted" style={{ fontSize: 12, marginTop: 4 }}>{task.client}</p>
                <div className="wl-task-meta">
                  <span className="wl-tag wl-tag--outline">{task.type}</span>
                  <span className="wl-tag">{task.priority} priority</span>
                </div>
                <div className="wl-task-foot">
                  <span className="wl-task-owner">
                    <span className="wl-avatar">{task.owner.slice(0, 1)}</span>
                    {task.owner}
                  </span>
                  <span className="wl-muted">
                    {task.checklist.filter((c) => c.done).length}/{task.checklist.length} steps
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          {mode === 'add' ? (
            <div className="wl-detail-panel">
              <h3>New task</h3>
              <p className="wl-detail-desc">Create a delivery task and assign it to your team.</p>
              <div className="wl-add-form" style={{ marginTop: '1rem' }}>
                <label className="wl-field" style={{ marginTop: 0 }}>
                  <span>Title</span>
                  <input
                    className="wl-input"
                    value={newTask.title}
                    onChange={(e) => setNewTask((s) => ({ ...s, title: e.target.value }))}
                    placeholder="e.g. Send Q1 review deck"
                  />
                </label>
                <label className="wl-field">
                  <span>Client</span>
                  <input
                    className="wl-input"
                    value={newTask.client}
                    onChange={(e) => setNewTask((s) => ({ ...s, client: e.target.value }))}
                  />
                </label>
                <label className="wl-field">
                  <span>Type</span>
                  <select
                    className="wl-input"
                    value={newTask.type}
                    onChange={(e) => setNewTask((s) => ({ ...s, type: e.target.value as TaskType }))}
                  >
                    {(['Report', 'Audit', 'Creative', 'Integration', 'Scan'] as TaskType[]).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label className="wl-field">
                  <span>Assignee</span>
                  <select
                    className="wl-input"
                    value={newTask.owner}
                    onChange={(e) => setNewTask((s) => ({ ...s, owner: e.target.value }))}
                  >
                    {owners.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </label>
                <div className="wl-detail-actions">
                  <button type="button" className="wl-btn wl-btn--sm" onClick={addTask}>
                    Create task
                  </button>
                  <button type="button" className="wl-btn wl-btn--ghost wl-btn--sm" onClick={() => setMode('detail')}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : selected ? (
            <div className="wl-detail-panel">
              <div className="wl-task-card-top">
                <h3>{selected.title}</h3>
                {statusTag(selected)}
              </div>
              <p className="wl-detail-desc">{selected.description}</p>
              <div className="wl-detail-grid">
                <div className="wl-detail-field"><span>Client</span><strong>{selected.client}</strong></div>
                <div className="wl-detail-field"><span>Assignee</span><strong>{selected.owner}</strong></div>
                <div className="wl-detail-field"><span>Type</span><strong>{selected.type}</strong></div>
                <div className="wl-detail-field"><span>Due</span><strong>{selected.dueLabel}</strong></div>
              </div>
              <div className="wl-checklist">
                <p className="wl-eyebrow">Checklist</p>
                {selected.checklist.map((item) => (
                  <label key={item.id} className={`wl-check-item ${item.done ? 'wl-check-item--done' : ''}`}>
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggleCheck(selected.id, item.id)}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
              <div className="wl-detail-actions">
                {selected.status !== 'done' ? (
                  <button type="button" className="wl-btn wl-btn--sm" onClick={() => completeTask(selected.id)}>
                    Mark complete
                  </button>
                ) : null}
                {selected.status === 'blocked' ? (
                  <button type="button" className="wl-btn wl-btn--sm" onClick={() => unblockTask(selected.id)}>
                    Remove block
                  </button>
                ) : null}
                <button type="button" className="wl-btn wl-btn--ghost wl-btn--sm" onClick={() => reassignTask(selected.id)}>
                  Reassign
                </button>
                <button
                  type="button"
                  className="wl-btn wl-btn--ghost wl-btn--sm"
                  onClick={() => flash(`Opened ${selected.type.toLowerCase()} workflow for ${selected.client}`)}
                >
                  Open workflow
                </button>
              </div>
            </div>
          ) : (
            <div className="wl-empty-detail">Select a task to view details and actions.</div>
          )}
        </div>
      </div>

      <div className="wl-grid-2 wl-section-gap">
        <div className="wl-panel">
          <div className="wl-panel-head">Client pipeline</div>
          <div className="wl-panel-body">
            {data.clients.map((c) => ({
              name: c.name,
              status: c.status,
              channel: c.bundle,
              stage: c.status === 'Onboarding' ? 'Setup' : c.status === 'Audit review' ? 'Review' : 'Delivering',
            })).map((row) => (
              <div key={row.name} className="wl-list-row">
                <div>
                  <p style={{ fontWeight: 500 }}>{row.name}</p>
                  <p className="wl-muted" style={{ fontSize: 12, marginTop: 2 }}>{row.channel} · {row.stage}</p>
                </div>
                <div className="wl-row-actions">
                  <span className="wl-tag">{row.status}</span>
                  {sceneContext?.clientHref ? (
                    <Link to={sceneContext.clientHref(row.name)} className="wl-btn wl-btn--ghost wl-btn--sm">
                      Open
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="wl-btn wl-btn--ghost wl-btn--sm"
                      onClick={() => flash(`Opened client workspace for ${row.name}`)}
                    >
                      Open
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="wl-panel">
          <div className="wl-panel-head">Delivery calendar — {data.period}</div>
          <div className="wl-panel-body">
            {data.calendar.map((row) => (
              <div key={row.item} className="wl-list-row">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
                  <span className="wl-muted" style={{ fontSize: 12, minWidth: '3.5rem' }}>{row.date}</span>
                  <p style={{ fontWeight: 500, margin: 0 }}>{row.item}</p>
                </div>
                <div className="wl-row-actions">
                  <span className="wl-tag wl-tag--outline">{row.type}</span>
                  <button
                    type="button"
                    className="wl-btn wl-btn--ghost wl-btn--sm"
                    onClick={() => {
                      selectTask(row.taskId);
                      flash(`Jumped to linked task for ${row.date}`);
                    }}
                  >
                    View task
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WlAppShell>
  );
};

function splitBy<T extends { w: number }>(total: number, parts: T[]): (T & { value: number })[] {
  const sum = parts.reduce((a, p) => a + p.w, 0);
  return parts.map((p) => ({ ...p, value: Math.round((total * p.w) / sum) }));
}

function allocate<T>(items: T[], total: number, weight: (k: T) => number): { k: T; conv: number }[] {
  const w = items.map(weight);
  const sum = w.reduce((a, b) => a + b, 0) || 1;
  const raw = w.map((x) => (total * x) / sum);
  const out = raw.map(Math.floor);
  const order = raw.map((x, i) => [x - Math.floor(x), i] as const).sort((a, b) => b[0] - a[0]);
  for (let r = total - out.reduce((a, b) => a + b, 0), n = 0; r > 0; r--, n++) out[order[n % out.length][1]]++;
  return items.map((k, i) => ({ k, conv: out[i] }));
}

function ChannelTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="wl-panel wl-section-gap" style={{ overflow: 'hidden' }}>
      <table className="wl-table">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r[0])}>
              {r.map((v, i) => (
                <td key={i} style={i === 0 ? { fontWeight: 500 } : undefined} className={i === 0 ? undefined : 'wl-muted'}>
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ClientSectionBody({ c, section, data }: { c: DemoClient; section: ClientSection; data: ReturnType<typeof agencyDemoData> }) {
  if (section === 'google-ads') {
    const camps = splitBy(c.google.spend, [
      { name: 'Search — Brand', w: 18, cpaF: 0.55 },
      { name: 'Search — Generic', w: 41, cpaF: 1.18 },
      { name: 'Performance Max', w: 29, cpaF: 0.92 },
      { name: 'Remarketing', w: 12, cpaF: 0.74 },
    ]);
    return (
      <>
        <StatRow
          items={[
            { l: 'Spend', v: formatWlIdr(c.google.spend) },
            { l: 'Clicks', v: fmtInt(c.google.clicks) },
            { l: 'Conversions', v: fmtInt(c.google.conversions) },
            { l: 'CPA', v: formatWlIdr(c.google.cpa) },
          ]}
        />
        <div className="wl-panel wl-section-gap">
          <div className="wl-panel-head">Daily spend — last 30 days</div>
          <div className="wl-panel-body" style={{ paddingBottom: '1rem' }}>
            <DailyBars values={c.trend} />
          </div>
        </div>
        <ChannelTable
          head={['Campaign', 'Spend', 'Conversions', 'CPA']}
          rows={allocate(camps, c.google.conversions, (k) => k.value / k.cpaF).map(({ k, conv }) => [
            k.name,
            formatWlIdr(k.value),
            fmtInt(conv),
            formatWlIdr(Math.round(k.value / Math.max(conv, 1))),
          ])}
        />
      </>
    );
  }

  if (section === 'meta') {
    const camps = splitBy(c.meta.spend, [
      { name: 'Prospecting — Advantage+', w: 46, f: 0.9 },
      { name: 'Retargeting — 30 days', w: 21, f: 1.7 },
      { name: 'Reels awareness', w: 33, f: 0.6 },
    ]);
    return (
      <>
        <StatRow
          items={[
            { l: 'Spend', v: formatWlIdr(c.meta.spend) },
            { l: 'Reach', v: fmtReach(c.meta.reach) },
            { l: 'CTR', v: `${(c.meta.ctr * 100).toFixed(1)}%` },
            { l: 'Conversions', v: fmtInt(c.meta.conversions) },
          ]}
        />
        <div className="wl-panel wl-section-gap">
          <div className="wl-panel-head">Daily spend — last 30 days</div>
          <div className="wl-panel-body" style={{ paddingBottom: '1rem' }}>
            <DailyBars values={[...c.trend].reverse()} />
          </div>
        </div>
        <ChannelTable
          head={['Campaign', 'Spend', 'Conversions', 'Cost / result']}
          rows={allocate(camps, c.meta.conversions, (k) => k.value * k.f).map(({ k, conv }) => [
            k.name,
            formatWlIdr(k.value),
            fmtInt(conv),
            formatWlIdr(Math.round(k.value / Math.max(conv, 1))),
          ])}
        />
      </>
    );
  }

  if (section === 'seo') {
    const pages = splitBy(c.seo.sessions, [
      { name: `${c.website} (home)`, w: 34 },
      { name: `${c.website}/products`, w: 22 },
      { name: `${c.website}/blog`, w: 19 },
      { name: `${c.website}/locations`, w: 14 },
      { name: `${c.website}/contact`, w: 11 },
    ]);
    return (
      <>
        <StatRow
          items={[
            { l: 'Visibility', v: String(c.seo.visibility) },
            { l: 'Top 10 keywords', v: fmtInt(c.seo.top10) },
            { l: 'Organic sessions', v: fmtInt(c.seo.sessions) },
            { l: 'Indexed pages', v: fmtInt(c.seo.pages) },
          ]}
        />
        <ChannelTable
          head={['Landing page', 'Organic sessions', 'Share']}
          rows={pages.map((p) => [p.name, fmtInt(p.value), `${Math.round((p.value / c.seo.sessions) * 100)}%`])}
        />
      </>
    );
  }

  if (section === 'ai-visibility') {
    const engines = splitBy(c.ai.mentions, [
      { name: 'ChatGPT', w: 38, sov: 1.1 },
      { name: 'Google AI Overviews', w: 27, sov: 0.95 },
      { name: 'Perplexity', w: 21, sov: 1.2 },
      { name: 'Gemini', w: 14, sov: 0.8 },
    ]);
    return (
      <>
        <StatRow
          items={[
            { l: 'AI score', v: String(c.ai.score) },
            { l: 'Brand mentions', v: fmtInt(c.ai.mentions) },
            { l: 'Share of voice', v: `${c.ai.shareOfVoice}%` },
            { l: 'Cited sources', v: fmtInt(c.ai.cited) },
          ]}
        />
        <ChannelTable
          head={['Engine', 'Mentions', 'Share of voice']}
          rows={engines.map((e) => [e.name, fmtInt(e.value), `${Math.round(c.ai.shareOfVoice * e.sov)}%`])}
        />
      </>
    );
  }

  if (section === 'reports') {
    return <ClientReports c={c} data={data} />;
  }

  return (
    <>
      <StatRow
        items={[
          { l: 'Total ad spend', v: formatWlIdr(c.spend) },
          { l: 'Leads generated', v: fmtInt(c.leads) },
          { l: 'Blended ROAS', v: `${c.roas.toFixed(1)}×` },
          { l: 'Visibility score', v: String(c.seo.visibility) },
        ]}
      />
      <p className="wl-eyebrow wl-section-gap">Channel performance</p>
      <div style={{ marginTop: '0.65rem' }}>
        <ChannelCards
          showCharts
          source={{
            google: c.google,
            meta: c.meta,
            seo: c.seo,
            ai: c.ai,
            metaRoas: c.roas,
            deltas: data.deltas,
            trendA: c.trend,
            trendB: [...c.trend].reverse(),
          }}
        />
      </div>
      <div className="wl-panel wl-section-gap">
        <div className="wl-panel-head">Cross-channel daily spend — last 30 days</div>
        <div className="wl-panel-body" style={{ paddingBottom: '1rem' }}>
          <DailyBars values={c.trend} />
        </div>
      </div>
    </>
  );
}

function ClientReports({ c, data }: { c: DemoClient; data: ReturnType<typeof agencyDemoData> }) {
  const ctx = useSceneContext();
  const [limit, setLimit] = useState(PAGE);
  const reports = data.reports.filter((r) => r.client === c.name);
  const open = ctx?.reportId ? reports.find((r) => r.id === ctx.reportId) : undefined;
  if (open) return <ReportDetail key={open.id} report={open} data={data} />;
  const runs = data.runs.filter((r) => r.client === c.name);
  const tokens = runs.reduce((a, r) => a + r.tokens, 0);
  return (
    <>
      <StatRow
        items={[
          { l: 'Reports', v: fmtInt(reports.length) },
          { l: `AI runs since ${data.usage.since}`, v: fmtInt(runs.length) },
          { l: 'Audits · scans', v: `${fmtInt(runs.filter((r) => r.kind === 'Audit').length)} · ${fmtInt(runs.filter((r) => r.kind === 'AI visibility scan').length)}` },
          { l: 'Tokens used', v: fmtReach(tokens) },
        ]}
      />
      <div className="wl-rec-list wl-section-gap">
        {reports.length ? (
          reports.slice(0, limit).map((row, i) => <ReportRow key={`${row.period}-${i}`} row={row} showClient={false} />)
        ) : (
          <div className="wl-panel" style={{ padding: '1rem 1.1rem' }}>
            <p className="wl-muted" style={{ margin: 0 }}>No reports yet — first report is sent after onboarding.</p>
          </div>
        )}
      </div>
      <ShowMore shown={Math.min(limit, reports.length)} total={reports.length} onMore={() => setLimit((l) => l + PAGE)} />
    </>
  );
}

export const WlClientDashboardScene: React.FC<SceneProps> = ({ theme }) => {
  const data = agencyDemoData(theme.id);
  const ctx = useSceneContext();
  const [localName, setLocalName] = useState(data.featured.name);
  const name = ctx?.clientName ?? localName;
  const c = data.clients.find((x) => x.name === name) ?? data.featured;
  const section: ClientSection = ctx?.clientSection ?? 'overview';
  const sectionLabel = CLIENT_SECTIONS.find((s) => s.id === section)?.label ?? 'Overview';

  return (
    <WlAppShell
      theme={theme}
      role="client"
      title={c.name}
      subtitle={`${c.industry} · ${c.website}${section === 'overview' ? '' : ` · ${sectionLabel}`}`}
      activeNav={sectionLabel}
      action={
        <>
          <select
            className="wl-client-switch"
            value={c.name}
            aria-label="Switch client"
            onChange={(e) => (ctx?.onSelectClient ? ctx.onSelectClient(e.target.value) : setLocalName(e.target.value))}
          >
            {data.clients.map((x) => (
              <option key={x.name} value={x.name}>
                {x.name}
              </option>
            ))}
          </select>
          <span className="wl-tag wl-tag--accent">{c.status}</span>
        </>
      }
    >
      <ClientSectionBody c={c} section={section} data={data} />
    </WlAppShell>
  );
};

function UsageSummary({ data }: { data: ReturnType<typeof agencyDemoData> }) {
  const u = data.usage;
  return (
    <StatRow
      items={[
        { l: `AI runs since ${u.since}`, v: fmtInt(data.runs.length) },
        { l: 'Reports · audits', v: `${fmtInt(u.byKind.Report)} · ${fmtInt(u.byKind.Audit)}` },
        { l: 'Scans · recommendations', v: `${fmtInt(u.byKind['AI visibility scan'])} · ${fmtInt(u.byKind.Recommendations)}` },
        { l: 'Tokens used', v: `${fmtReach(u.tokens)} · $${fmtInt(u.usd)}` },
      ]}
    />
  );
}

function ClientFilter({ data, value, onChange }: { data: ReturnType<typeof agencyDemoData>; value: string; onChange: (v: string) => void }) {
  return (
    <select className="wl-client-switch" value={value} aria-label="Filter by client" onChange={(e) => onChange(e.target.value)}>
      <option value="">All clients</option>
      {data.clients.map((c) => (
        <option key={c.name} value={c.name}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

const PAGE = 25;

function ShowMore({ shown, total, onMore }: { shown: number; total: number; onMore: () => void }) {
  if (shown >= total) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
      <span className="wl-muted" style={{ fontSize: 12 }}>
        Showing {fmtInt(shown)} of {fmtInt(total)}
      </span>
      <button type="button" className="wl-btn wl-btn--ghost wl-btn--sm" onClick={onMore}>
        Show more
      </button>
    </div>
  );
}

export const WlAuditHistoryScene: React.FC<SceneProps> = ({ theme }) => {
  const data = agencyDemoData(theme.id);
  const [client, setClient] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const rows = data.audits.filter((a) => !client || a.client === client);
  return (
    <WlAppShell
      theme={theme}
      role="agency"
      title="Audit history"
      subtitle={`${fmtInt(data.audits.length)} visibility audits across clients`}
      activeNav="Audit history"
      action={<ClientFilter data={data} value={client} onChange={(v) => { setClient(v); setLimit(PAGE); }} />}
    >
      <UsageSummary data={data} />
      <div className="wl-panel wl-section-gap" style={{ overflow: 'hidden' }}>
        <table className="wl-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Date</th>
              <th>Score</th>
              <th>Channels</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, limit).map((row, i) => (
              <tr key={`${row.client}-${row.date}-${i}`}>
                <td style={{ fontWeight: 500 }}>{row.client}</td>
                <td className="wl-muted">{row.date}</td>
                <td><span className="wl-tag wl-tag--accent">{row.score}</span></td>
                <td className="wl-muted">{row.channels}</td>
                <td><span className="wl-tag">{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ShowMore shown={Math.min(limit, rows.length)} total={rows.length} onMore={() => setLimit((l) => l + PAGE)} />
    </WlAppShell>
  );
};

const sentDrafts = new Set<string>();

function reportStatus(row: DemoReport): DemoReport['status'] {
  return row.status === 'Draft' && sentDrafts.has(row.id) ? 'Sent' : row.status;
}

function ReportRow({ row, showClient = true }: { row: DemoReport; showClient?: boolean }) {
  const href = useSceneContext()?.reportHref?.(row.id);
  const status = reportStatus(row);
  const label = status === 'Draft' ? 'Edit' : 'View';
  return (
    <div className="wl-panel" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.85rem 1.1rem' }}>
      <div>
        <p style={{ fontWeight: 600, margin: 0 }}>{showClient ? row.client : row.period}</p>
        <p className="wl-muted" style={{ fontSize: 13, marginTop: 4 }}>
          {showClient ? `${row.period} · ` : ''}
          {row.channels}
          {row.tokens ? ` · ${fmtReach(row.tokens)} tokens` : ''}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span className="wl-tag">{status}</span>
        {href ? (
          <Link to={href} className="wl-btn wl-btn--ghost">
            {label}
          </Link>
        ) : (
          <button type="button" className="wl-btn wl-btn--ghost">
            {label}
          </button>
        )}
      </div>
    </div>
  );
}

const MONTH_FACTOR: Record<string, number> = { aug: 0.92, sep: 1 };

function reportFactor(r: DemoReport): number {
  const growth = r.kind === 'monthly' ? MONTH_FACTOR[r.id.slice(0, 3)] ?? 1 : 1;
  return r.coverage * growth;
}

function scaleClient(c: DemoClient, f: number) {
  const r = (n: number) => Math.round(n * f);
  return {
    spend: r(c.spend),
    leads: r(c.leads),
    gSpend: r(c.google.spend),
    gClicks: r(c.google.clicks),
    gConv: r(c.google.conversions),
    mSpend: r(c.meta.spend),
    mReach: r(c.meta.reach),
    mConv: r(c.meta.conversions),
  };
}

function reportSummary(r: DemoReport, c: DemoClient | undefined, data: ReturnType<typeof agencyDemoData>): string {
  if (!c) {
    const top = data.clients[0];
    return `Portfolio spend held steady across ${data.clients.length} clients. ${top.name} remains the largest account; blended ROAS is ${data.totals.roas.toFixed(1)}×. Flagged items are listed in Recommendations.`;
  }
  const rec = data.recommendations.find((x) => x.client === c.name);
  const lead = c.google.spend >= c.meta.spend ? 'Google Ads' : 'Meta';
  return `${lead} drove most of the results for ${c.name} this period at ${c.roas.toFixed(1)}× ROAS. Google CPA sits at ${formatWlIdr(c.google.cpa)}; organic visibility is ${c.seo.visibility} and AI visibility ${c.ai.score}.${rec ? ` Next step: ${rec.title.charAt(0).toLowerCase()}${rec.title.slice(1)} (${rec.impact}).` : ''}`;
}

function ReportDetail({ report, data }: { report: DemoReport; data: ReturnType<typeof agencyDemoData> }) {
  const ctx = useSceneContext();
  const c = data.clients.find((x) => x.name === report.client);
  const [status, setStatus] = useState(reportStatus(report));
  const [summary, setSummary] = useState(() => reportSummary(report, c, data));
  const f = reportFactor(report);
  const kindLabel = report.kind === 'ai' ? 'AI performance report' : report.kind === 'weekly' ? 'Weekly digest' : 'Monthly report';
  const rows = c ? [c] : data.clients;
  const m = rows.map((x) => ({ c: x, ...scaleClient(x, f) }));
  const tot = m.reduce(
    (a, x) => ({ spend: a.spend + x.spend, leads: a.leads + x.leads, gConv: a.gConv + x.gConv, gSpend: a.gSpend + x.gSpend }),
    { spend: 0, leads: 0, gConv: 0, gSpend: 0 },
  );
  const roas = c ? c.roas : data.totals.roas;

  return (
    <>
      <div className="wl-no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        {ctx?.reportsHref ? (
          <Link to={ctx.reportsHref} className="wl-btn wl-btn--ghost wl-btn--sm">
            ← Back to reports
          </Link>
        ) : (
          <span />
        )}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="wl-tag">{status}</span>
          <button type="button" className="wl-btn wl-btn--ghost wl-btn--sm" onClick={() => window.print()}>
            Download PDF
          </button>
          {status === 'Draft' ? (
            <button
              type="button"
              className="wl-btn wl-btn--sm"
              onClick={() => {
                sentDrafts.add(report.id);
                setStatus('Sent');
              }}
            >
              Send to client
            </button>
          ) : null}
        </div>
      </div>

      <div className="wl-panel" style={{ padding: '1.25rem 1.4rem' }}>
        <p className="wl-eyebrow">{kindLabel}</p>
        <h2 style={{ fontSize: 22, fontWeight: 600, margin: '0.35rem 0 0.2rem' }}>{report.client}</h2>
        <p className="wl-muted" style={{ fontSize: 13 }}>
          {report.kind === 'ai' ? `Last 30 days · Generated ${report.issued}` : `${report.period} · Issued ${report.issued}`} · {report.channels}
          {report.tokens ? ` · ${fmtReach(report.tokens)} tokens` : ''}
        </p>
        <p className="wl-eyebrow wl-section-gap">Executive summary</p>
        {status === 'Draft' ? (
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.7rem', border: '1px solid var(--wl-border)', borderRadius: 6, font: 'inherit', fontSize: 14, lineHeight: 1.55, background: 'var(--wl-surface)', color: 'var(--wl-text)' }}
          />
        ) : (
          <p style={{ fontSize: 14, lineHeight: 1.6, marginTop: '0.5rem' }}>{summary}</p>
        )}
      </div>

      <div className="wl-section-gap">
        <StatRow
          items={[
            { l: 'Ad spend', v: formatWlIdr(tot.spend) },
            { l: 'Leads', v: fmtInt(tot.leads) },
            { l: 'Google CPA', v: formatWlIdr(tot.gConv ? Math.round(tot.gSpend / tot.gConv) : 0) },
            { l: 'Blended ROAS', v: `${roas.toFixed(1)}×` },
          ]}
        />
      </div>

      {c ? (
        <ChannelTable
          head={['Channel', 'Spend', 'Results', 'Key metric']}
          rows={[
            ['Google Ads', formatWlIdr(m[0].gSpend), `${fmtInt(m[0].gConv)} conversions`, `CPA ${formatWlIdr(c.google.cpa)}`],
            ['Meta Ads', formatWlIdr(m[0].mSpend), `${fmtInt(m[0].mConv)} conversions`, `Reach ${fmtReach(m[0].mReach)} · CTR ${(c.meta.ctr * 100).toFixed(1)}%`],
            ['SEO', '—', `${fmtInt(Math.round(c.seo.sessions * f))} organic sessions`, `Visibility ${c.seo.visibility} · ${c.seo.top10} top-10 keywords`],
            ['AI visibility', '—', `${fmtInt(Math.round(c.ai.mentions * f))} brand mentions`, `Score ${c.ai.score} · ${c.ai.shareOfVoice}% share of voice`],
          ]}
        />
      ) : (
        <ChannelTable
          head={['Client', 'Spend', 'Leads', 'ROAS']}
          rows={m.map((x) => [x.c.name, formatWlIdr(x.spend), fmtInt(x.leads), `${x.c.roas.toFixed(1)}×`])}
        />
      )}

      {data.recommendations.filter((r) => !c || r.client === c.name).length ? (
        <div className="wl-panel wl-section-gap">
          <div className="wl-panel-head">Recommendations</div>
          <div className="wl-panel-body">
            {data.recommendations
              .filter((r) => !c || r.client === c.name)
              .map((r) => (
                <div key={r.title} className="wl-list-row">
                  <div>
                    <p style={{ fontWeight: 500 }}>{r.title}</p>
                    <p className="wl-muted" style={{ fontSize: 12, marginTop: 2 }}>
                      {c ? '' : `${r.client} · `}
                      {r.channel} · {r.impact}
                    </p>
                  </div>
                  <span className="wl-tag">{r.priority === 'med' ? 'medium' : r.priority}</span>
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

export const WlReportsScene: React.FC<SceneProps> = ({ theme }) => {
  const data = agencyDemoData(theme.id);
  const ctx = useSceneContext();
  const open = ctx?.reportId ? data.reports.find((r) => r.id === ctx.reportId) : undefined;
  const [client, setClient] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const rows = data.reports.filter((r) => !client || r.client === client);
  if (open) {
    return (
      <WlAppShell theme={theme} role="agency" title="Reports" subtitle={`${open.client} · ${open.period}`} activeNav="Reports">
        <ReportDetail key={open.id} report={open} data={data} />
      </WlAppShell>
    );
  }
  return (
    <WlAppShell
      theme={theme}
      role="agency"
      title="Reports"
      subtitle={`${fmtInt(data.reports.length)} reports · AI runs, weekly digests and monthly reports`}
      activeNav="Reports"
      action={<ClientFilter data={data} value={client} onChange={(v) => { setClient(v); setLimit(PAGE); }} />}
    >
      <UsageSummary data={data} />
      <div className="wl-rec-list wl-section-gap">
        {rows.slice(0, limit).map((row, i) => (
          <ReportRow key={`${row.client}-${row.period}-${i}`} row={row} />
        ))}
      </div>
      <ShowMore shown={Math.min(limit, rows.length)} total={rows.length} onMore={() => setLimit((l) => l + PAGE)} />
    </WlAppShell>
  );
};

export const WlRecommendationsScene: React.FC<SceneProps> = ({ theme }) => {
  const data = agencyDemoData(theme.id);
  return (
    <WlAppShell
      theme={theme}
      role="agency"
      title="Recommendations"
      subtitle="Prioritized actions across the portfolio"
      activeNav="Recommendations"
    >
      <div className="wl-rec-list">
        {data.recommendations.map((rec) => (
          <div key={rec.title} className={`wl-rec-card wl-rec-card--${rec.priority}`}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div>
                <div className="wl-rec-meta">
                  <span className="wl-tag wl-tag--outline">{rec.channel}</span>
                  <span className="wl-tag">{rec.priority} priority</span>
                </div>
                <p className="wl-rec-title">{rec.title}</p>
                <p className="wl-muted" style={{ fontSize: 12, marginTop: 4 }}>{rec.client}</p>
              </div>
              <button type="button" className="wl-btn wl-btn--ghost">Assign</button>
            </div>
            <p className="wl-rec-impact">{rec.impact}</p>
          </div>
        ))}
      </div>
    </WlAppShell>
  );
};

export function renderWhitelabelScene(
  screen: WhitelabelScreenId,
  theme: WhitelabelTheme,
  context?: WhitelabelSceneContext,
): React.ReactNode {
  const scene = (() => {
    switch (screen) {
      case 'agency-login':
        return <WlAgencyLoginScene theme={theme} />;
      case 'agency-dashboard':
        return <WlAgencyDashboardScene theme={theme} />;
      case 'agency-ops':
        return <WlAgencyOpsScene theme={theme} />;
      case 'client-login':
        return <WlClientLoginScene theme={theme} />;
      case 'client-portal':
        return <WlClientDashboardScene theme={theme} />;
      case 'client-dashboard':
        return <WlClientDashboardScene theme={theme} />;
      case 'audit-history':
        return <WlAuditHistoryScene theme={theme} />;
      case 'reports':
        return <WlReportsScene theme={theme} />;
      case 'recommendations':
        return <WlRecommendationsScene theme={theme} />;
      default:
        return null;
    }
  })();

  const needsData = screen !== 'agency-login' && screen !== 'client-login';
  return (
    <SceneContextProvider value={context}>
      <SceneErrorBoundary key={theme.id} theme={theme}>
        {needsData ? <AgencyDataGate theme={theme}>{scene}</AgencyDataGate> : scene}
      </SceneErrorBoundary>
    </SceneContextProvider>
  );
}

function SceneMessage({ theme, title, body, action }: { theme: WhitelabelTheme; title: string; body: string; action?: React.ReactNode }) {
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

function AgencyDataGate({ theme, children }: { theme: WhitelabelTheme; children: React.ReactNode }) {
  const ctx = useSceneContext();
  const { state, retry } = useAgencyData(theme.id);
  if (state === 'ready') return <>{children}</>;
  if (state === 'loading') {
    return (
      <div className="wl-root">
        <div className="wl-scene-message" aria-busy="true">
          <p className="wl-muted">Loading your workspace…</p>
        </div>
      </div>
    );
  }
  if (state === 'unauthorized') {
    return (
      <SceneMessage
        theme={theme}
        title="Your session has ended"
        body="Please sign in again to continue."
        action={
          ctx?.signInHref ? (
            <a className="wl-btn" href={ctx.signInHref}>
              Sign in
            </a>
          ) : null
        }
      />
    );
  }
  if (state === 'unavailable') {
    return <SceneMessage theme={theme} title="Workspace not available" body="This workspace has no data to show." />;
  }
  return (
    <SceneMessage
      theme={theme}
      title="We couldn't load your workspace"
      body="Check your connection and try again. Your data is safe."
      action={
        <button type="button" className="wl-btn" onClick={retry}>
          Try again
        </button>
      }
    />
  );
}

class SceneErrorBoundary extends React.Component<
  { theme: WhitelabelTheme; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('White-label scene crashed', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <SceneMessage
        theme={this.props.theme}
        title="Something went wrong"
        body="This page hit an unexpected error. Reload to try again — your data is safe."
        action={
          <button type="button" className="wl-btn" onClick={() => window.location.reload()}>
            Reload page
          </button>
        }
      />
    );
  }
}
