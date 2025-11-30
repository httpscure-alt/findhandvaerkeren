import React, { useState } from 'react';
import { Language } from '../../../types';
import { MessageSquare, User, Clock, CheckCircle, XCircle, Search } from 'lucide-react';

interface InquiriesManagementProps {
  lang: Language;
  onBack: () => void;
}

const InquiriesManagement: React.FC<InquiriesManagementProps> = ({ lang }) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RESPONDED' | 'CLOSED'>('ALL');

  const inquiries = [
    { id: '1', consumer: 'Anders Jensen', company: 'Nexus Solutions', message: 'Interested in cloud services...', status: 'PENDING', date: '2 hours ago' },
    { id: '2', consumer: 'Sarah Nielsen', company: 'Summit Capital', message: 'Looking for funding...', status: 'RESPONDED', date: '1 day ago' },
    { id: '3', consumer: 'Mads Hansen', company: 'Alpha Design', message: 'Need branding help...', status: 'CLOSED', date: '3 days ago' }
  ];

  const filtered = filter === 'ALL' 
    ? inquiries 
    : inquiries.filter(i => i.status === filter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESPONDED': return <CheckCircle className="text-green-500" size={18} />;
      case 'CLOSED': return <XCircle className="text-gray-400" size={18} />;
      default: return <Clock className="text-amber-500" size={18} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F]">
          {lang === 'da' ? 'Forespørgselsstyring' : 'Inquiries Management'}
        </h1>
        <div className="flex items-center gap-2">
          {(['ALL', 'PENDING', 'RESPONDED', 'CLOSED'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-[#1D1D1F] text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(inquiry => (
          <div key={inquiry.id} className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 bg-nexus-bg rounded-full flex items-center justify-center">
                    <User className="text-nexus-accent" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-[#1D1D1F]">{inquiry.consumer}</p>
                    <p className="text-sm text-nexus-subtext">{inquiry.company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(inquiry.status)}
                    <span className="text-xs text-nexus-subtext">{inquiry.status}</span>
                  </div>
                </div>
                <p className="text-nexus-text mb-3">{inquiry.message}</p>
                <div className="flex items-center gap-4 text-xs text-nexus-subtext">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {inquiry.date}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InquiriesManagement;
