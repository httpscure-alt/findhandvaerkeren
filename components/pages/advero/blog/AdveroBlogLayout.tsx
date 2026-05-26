import React from 'react';
import { Outlet } from 'react-router-dom';
import AdveroMarketingHeader from '../AdveroMarketingHeader';
import '../advero-ds.css';
import './advero-blog.css';

const AdveroBlogLayout: React.FC = () => {
  return (
    <div className="advero-ds advero-blog-shell">
      <div className="advero-dot-grid pointer-events-none absolute inset-0 -z-10" aria-hidden />
      <AdveroMarketingHeader activeNav="blog" />
      <Outlet />
    </div>
  );
};

export default AdveroBlogLayout;
