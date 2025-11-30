import React, { useState, useEffect } from 'react';
import { Language } from '../../../types';
import { ShieldCheck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { api } from '../../../services/api';

interface VerificationQueuePageProps {
  lang: Language;
  onBack: () => void;
}

interface VerificationRequest {
  id: string;
  companyName: string;
  cvrNumber: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  permitType?: string;
  permitDocuments?: number;
}

const VerificationQueuePage: React.FC<VerificationQueuePageProps> = ({ lang, onBack }) => {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // TODO: Replace with real API call when backend is ready
        // const data = await api.getVerificationQueue();
        // For now, use mock data
        const mockData: VerificationRequest[] = [
          {
            id: '1',
            companyName: 'Nexus Solutions',
            cvrNumber: '12345678',
            submittedDate: '2024-01-10',
            status: 'pending',
            permitType: 'Electrical authorisation',
            permitDocuments: 3,
          },
          {
            id: '2',
            companyName: 'Summit Capital',
            cvrNumber: '87654321',
            submittedDate: '2024-01-08',
            status: 'pending',
            permitType: 'General contractor',
            permitDocuments: 2,
          },
          {
            id: '3',
            companyName: 'TechFlow Inc',
            cvrNumber: '11223344',
            submittedDate: '2024-01-05',
            status: 'approved',
            permitType: 'Plumbing licence',
        permitDocuments: 4,
      },
    ];
        setRequests(mockData);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === 'da' ? 'da-DK' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleApprove = (id: string) => {
    // TODO: Implement approval logic
    alert(lang === 'da' ? 'Godkendelse kommer snart' : 'Approval coming soon');
  };

  const handleReject = (id: string) => {
    // TODO: Implement rejection logic
    alert(lang === 'da' ? 'Afvisning kommer snart' : 'Rejection coming soon');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">{lang === 'da' ? 'Indlæser...' : 'Loading...'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1D1D1F] mb-2">
            {lang === 'da' ? 'Verificeringskø' : 'Verification Queue'}
          </h1>
          <p className="text-gray-500">
            {lang === 'da' 
              ? `${pendingCount} virksomheder afventer verificering`
              : `${pendingCount} companies awaiting verification`}
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          {lang === 'da' ? 'Tilbage' : 'Back'}
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center">
            <ShieldCheck className="text-amber-600" size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1D1D1F] mb-1">
              {lang === 'da' ? 'Afventer gennemgang' : 'Pending Review'}
            </h3>
            <p className="text-gray-500">
              {lang === 'da' 
                ? `${pendingCount} virksomheder har indsendt verificeringsanmodninger`
                : `${pendingCount} companies have submitted verification requests`}
            </p>
          </div>
        </div>
      </div>

      {/* Verification Requests List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {lang === 'da' ? 'Virksomhed' : 'Company'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {lang === 'da' ? 'CVR-nummer' : 'CVR Number'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {lang === 'da' ? 'Tilladelsestype' : 'Permit Type'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {lang === 'da' ? 'Dokumenter' : 'Documents'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {lang === 'da' ? 'Indsendt' : 'Submitted'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {lang === 'da' ? 'Status' : 'Status'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {lang === 'da' ? 'Handlinger' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1D1D1F]">
                    {request.companyName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                    {request.cvrNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {request.permitType || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {request.permitDocuments || 0} {lang === 'da' ? 'filer' : 'files'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatDate(request.submittedDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {request.status === 'pending' && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 flex items-center gap-1 w-fit">
                        <Clock size={12} />
                        {lang === 'da' ? 'Afventer' : 'Pending'}
                      </span>
                    )}
                    {request.status === 'approved' && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 flex items-center gap-1 w-fit">
                        <CheckCircle size={12} />
                        {lang === 'da' ? 'Godkendt' : 'Approved'}
                      </span>
                    )}
                    {request.status === 'rejected' && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 flex items-center gap-1 w-fit">
                        <XCircle size={12} />
                        {lang === 'da' ? 'Afvist' : 'Rejected'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {request.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle size={14} />
                          {lang === 'da' ? 'Godkend' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors flex items-center gap-1"
                        >
                          <XCircle size={14} />
                          {lang === 'da' ? 'Afvis' : 'Reject'}
                        </button>
                      </div>
                    )}
                    {request.status !== 'pending' && (
                      <span className="text-xs text-gray-400">
                        {lang === 'da' ? 'Gennemgået' : 'Reviewed'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {requests.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {lang === 'da' ? 'Ingen verificeringsanmodninger' : 'No verification requests'}
        </div>
      )}
    </div>
  );
};

export default VerificationQueuePage;
