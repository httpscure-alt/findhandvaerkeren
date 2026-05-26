import React from 'react';

type Props = {
  kicker?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

const AdveroAdminPageHeader: React.FC<Props> = ({ kicker, title, description, actions }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      {kicker ? <p className="mono-label text-white/50">{kicker}</p> : null}
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      {description ? <p className="mt-1 max-w-2xl text-sm text-white/60">{description}</p> : null}
    </div>
    {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
  </div>
);

export default AdveroAdminPageHeader;
