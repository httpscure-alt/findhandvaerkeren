import React from 'react';
import { Language } from '../../../types';
import { MessageSquare, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { translations } from '../../../translations';

interface MyInquiriesPageProps {
  lang: Language;
  onBack: () => void;
}

const MyInquiriesPage: React.FC<MyInquiriesPageProps> = ({ lang, onBack }) => {
  // Mock inquiries
  const inquiries = [
    {
      id: '1',
      companyName: 'Nexus Solutions',
      companyLogo: 'https://picsum.photos/id/42/200/200',
      message: 'Interested in your cloud migration services...',
      status: 'PENDING',
      date: '2 days ago'
    },
    {
      id: '2',
      companyName: 'Summit Capital',
      companyLogo: 'https://picsum.photos/id/60/200/200',
      message: 'Looking for Series A funding opportunities...',
      status: 'RESPONDED',
      date: '1 week ago'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESPONDED':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'CLOSED':
        return <XCircle className="text-gray-400" size={18} />;
      default:
        return <Clock className="text-amber-500" size={18} />;
    }
  };

  const getStatusText = (status: string) => {
    if (lang === 'da') {
      switch (status) {
        case 'RESPONDED': return 'Besvaret';
        case 'CLOSED': return 'Lukket';
        default: return 'Afventer';
      }
    } else {
      return status;
    }
  };

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
                <img src={inquiry.companyLogo} alt={inquiry.companyName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-[#1D1D1F]">{inquiry.companyName}</h3>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(inquiry.status)}
                    <span className="text-xs text-nexus-subtext">{getStatusText(inquiry.status)}</span>
                  </div>
                </div>
                <p className="text-nexus-subtext text-sm mb-3">{inquiry.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-nexus-subtext">{inquiry.date}</span>
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
