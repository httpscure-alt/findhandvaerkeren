/** Crisp live chat — only for paying Advero customers (dashboard). */

declare global {
  interface Window {
    $crisp?: unknown[];
    CRISP_WEBSITE_ID?: string;
    adveroCrispLoaded?: boolean;
  }
}

const CRISP_SCRIPT_ID = 'advero-crisp-script';

export function getAdveroCrispWebsiteId(): string | undefined {
  const id = import.meta.env.VITE_ADVERO_CRISP_WEBSITE_ID;
  return typeof id === 'string' && id.trim() ? id.trim() : undefined;
}

/** Paying customer: active subscription or grace period while past_due. */
export function hasAdveroPaidSupport(subscription: { status: string } | null | undefined): boolean {
  if (!subscription?.status) return false;
  return subscription.status === 'active' || subscription.status === 'past_due';
}

export type AdveroCrispUser = {
  email?: string | null;
  name?: string | null;
  companyName?: string | null;
};

export function loadAdveroCrisp(user?: AdveroCrispUser): void {
  const websiteId = getAdveroCrispWebsiteId();
  if (!websiteId || typeof window === 'undefined') return;
  if (window.adveroCrispLoaded) {
    identifyAdveroCrispUser(user);
    return;
  }

  window.$crisp = window.$crisp || [];
  window.CRISP_WEBSITE_ID = websiteId;

  if (!document.getElementById(CRISP_SCRIPT_ID)) {
    const script = document.createElement('script');
    script.id = CRISP_SCRIPT_ID;
    script.src = 'https://client.crisp.chat/l.js';
    script.async = true;
    document.head.appendChild(script);
  }

  window.adveroCrispLoaded = true;
  identifyAdveroCrispUser(user);
}

function identifyAdveroCrispUser(user?: AdveroCrispUser): void {
  if (!user || !window.$crisp) return;
  if (user.email) {
    window.$crisp.push(['set', 'user:email', [user.email]]);
  }
  const nickname = user.companyName?.trim() || user.name?.trim();
  if (nickname) {
    window.$crisp.push(['set', 'user:nickname', [nickname]]);
  }
}

/** Hide marketing email FAB while Crisp is active (avoids two chat buttons). */
export function hideAdveroSupportWidget(): void {
  const root = document.getElementById('advero-support-root');
  if (root) root.style.display = 'none';
}

export function showAdveroSupportWidget(): void {
  const root = document.getElementById('advero-support-root');
  if (root) root.style.display = '';
}
