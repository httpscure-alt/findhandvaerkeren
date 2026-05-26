import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { hasStoredAdveroSession, adveroLoginPath } from '../../../../lib/adveroSession';
import AdveroDashboardLayout from './AdveroDashboardLayout';

type AdveroDashboardRouteProps = {
  getCompanyName?: () => string | null;
};

/** Protects /advero/dashboard — accepts context auth or just-written localStorage session. */
const AdveroDashboardRoute: React.FC<AdveroDashboardRouteProps> = ({ getCompanyName }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const allowed = isAuthenticated || hasStoredAdveroSession();

  if (!allowed) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={adveroLoginPath(next)} replace />;
  }

  return <AdveroDashboardLayout getCompanyName={getCompanyName} />;
};

export default AdveroDashboardRoute;
