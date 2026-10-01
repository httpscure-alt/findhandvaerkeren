import React from 'react';
import AdveroAdminTokensPage from '../admin/AdveroAdminTokensPage';
import '../advero-ds.css';
import '../admin/advero-admin.css';

const AdveroTokenUsagePreviewShell: React.FC = () => {
  return (
    <div className="advero-ds advero-admin-shell min-h-screen">
      <div className="advero-dot-grid pointer-events-none absolute inset-0 -z-10" aria-hidden />
      <header className="advero-admin-header">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="advero-admin-brand-row">
            <div className="advero-admin-logo-slot">
              <a href="/" className="advero-admin-brand-link" aria-label="Advero">
                <img
                  src="/brand/advero-logo-light.png"
                  alt=""
                  width={800}
                  height={168}
                  decoding="async"
                  className="advero-logo-wordmark-light advero-admin-wordmark"
                />
              </a>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="advero-admin-main">
          <AdveroAdminTokensPage embedded={false} />
        </div>
      </main>
    </div>
  );
};

export default AdveroTokenUsagePreviewShell;
