import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { useIsAdmin } from '../../../../hooks/useIsAdmin';
import { adveroLoginPath } from '../../../../lib/adveroSession';
import AdveroAdminLayout from './AdveroAdminLayout';

const AdveroAdminRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const isAdmin = useIsAdmin();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="advero-ds flex min-h-screen items-center justify-center bg-[#334155] text-white/70">
        …
      </div>
    );
  }

  if (!isAuthenticated) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={adveroLoginPath(next)} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/advero/dashboard" replace />;
  }

  return <AdveroAdminLayout />;
};

export default AdveroAdminRoute;
