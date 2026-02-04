import React from 'react';
import { api } from '../../../services/api';
import { Inquiry, Language } from '../../../types';
import { MessageSquare, Clock, CheckCircle, XCircle, ArrowRight, User } from 'lucide-react';
import { translations } from '../../../translations';

interface MyInquiriesPageProps {
  lang: Language;
  onBack: () => void;
}

const MyInquiriesPage: React.FC<MyInquiriesPageProps> = ({ lang, onBack }) => {
  const [inquiries, setInquiries] = React.useState<Inquiry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        const response = await api.getInquiries();
        setInquiries(response.inquiries || []);
      } catch (err: any) {
        console.error('Fetch inquiries error:', err);
        setError(lang === 'da' ? 'Kunne ikke hente forespørgsler' : 'Failed to fetch inquiries');
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [lang]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESPONDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
            <CheckCircle size={14} />
            {lang === 'da' ? 'Besvaret' : 'Responded'}
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-600 text-xs font-bold border border-gray-100">
            <XCircle size={14} />
            {lang === 'da' ? 'Lukket' : 'Closed'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
            <Clock size={14} />
            {lang === 'da' ? 'Afventer' : 'Pending'}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nexus-accent mx-auto mb-4"></div>
        <p className="text-nexus-subtext">
          {lang === 'da' ? 'Henter forespørgsler...' : 'Loading inquiries...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 text-red-600 rounded-xl p-6 border border-red-100 max-w-md mx-auto">
          <p className="font-medium mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm underline hover:no-underline"
          >
            {lang === 'da' ? 'Prøv igen' : 'Try again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-nexus-subtext hover:text-[#1D1D1F] mb-6 transition-colors"
      >
        <ArrowRight size={18} className="rotate-180" />
        {lang === 'da' ? 'Tilbage' : 'Back'}
      </button>

      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="text-nexus-accent" size={24} />
        <h1 className="text-3xl font-bold text-[#1D1D1F]">
          {lang === 'da' ? 'Mine Forespørgsler' : 'My Inquiries'}
        </h1>
      </div>

      <div className="space-y-4">
        {inquiries.map((inquiry) => (
          <div
            key={inquiry.id}
            className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                {inquiry.company?.logoUrl ? (
                  <img src={inquiry.company.logoUrl} alt={inquiry.company.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <MessageSquare size={20} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-[#1D1D1F]">{inquiry.company?.name || 'Unknown Company'}</h3>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(inquiry.status)}
                  </div>
                </div>
                <p className="text-nexus-subtext text-sm mb-3">{inquiry.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-nexus-subtext">
                    {new Date(inquiry.createdAt).toLocaleDateString(lang === 'da' ? 'da-DK' : 'en-US')}
                  </span>
                  <button className="text-sm font-medium text-nexus-accent hover:underline flex items-center gap-1">
                    {lang === 'da' ? 'Se Detaljer' : 'View Details'} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {inquiries.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <MessageSquare size={24} />
          </div>
          <p className="text-gray-500">
            {lang === 'da' ? 'Ingen forespørgsler endnu.' : 'No inquiries yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyInquiriesPage;
