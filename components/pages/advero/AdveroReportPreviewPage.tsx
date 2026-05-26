import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

/** Legacy URL — redirects to instant results dashboard. */
const AdveroReportPreviewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  if (id) {
    return <Navigate to={`/advero/audit/results?id=${encodeURIComponent(id)}`} replace />;
  }
  return <Navigate to="/advero/audit" replace />;
};

export default AdveroReportPreviewPage;
