import React, { useState } from 'react';
import { Language } from '../../../types';
import { MessageSquare, User, Clock, CheckCircle, Send } from 'lucide-react';

interface LeadsMessagesPageProps {
  lang: Language;
  onBack: () => void;
}

import { api } from '../../../services/api';
import { useToast } from '../../../hooks/useToast';

const LeadsMessagesPage: React.FC<LeadsMessagesPageProps> = ({ lang, onBack }) => {
  const toast = useToast();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  React.useEffect(() => {
    fetchLeads();
  }, [lang]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await api.getInquiries();
      setLeads(response.inquiries || []);
    } catch (err: any) {
      console.error('Fetch leads error:', err);
      setError(lang === 'da' ? 'Kunne ikke hente leads' : 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedLead || !replyText.trim()) return;

    try {
      setSendingReply(true);
      await api.replyToInquiry(selectedLead, replyText);
      toast.success(lang === 'da' ? 'Besked sendt!' : 'Message sent!');
      setReplyText('');
      fetchLeads(); // Refresh to show new status
    } catch (err: any) {
      console.error('Send reply error:', err);
      toast.error(lang === 'da' ? 'Kunne ikke sende besked' : 'Failed to send message');
    } finally {
      setSendingReply(false);
    }
  };

  const selectedLeadData = leads.find(l => l.id === selectedLead);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nexus-accent mx-auto mb-4"></div>
        <p className="text-nexus-subtext">
          {lang === 'da' ? 'Henter leads...' : 'Loading leads...'}
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
            onClick={() => fetchLeads()}
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
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="text-nexus-accent" size={24} />
        <h1 className="text-3xl font-bold text-[#1D1D1F]">
          {lang === 'da' ? 'Leads & Beskeder' : 'Leads & Messages'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads List */}
        <div className="lg:col-span-1 space-y-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              onClick={() => setSelectedLead(lead.id)}
              className={`bg-white rounded-xl p-4 border cursor-pointer transition-all ${selectedLead === lead.id
                ? 'border-nexus-accent shadow-md'
                : 'border-gray-100 hover:border-gray-200'
                }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-nexus-bg rounded-full flex items-center justify-center overflow-hidden">
                    {lead.consumer?.avatarUrl ? (
                      <img src={lead.consumer.avatarUrl} alt={lead.consumer.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} className="text-nexus-accent" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-[#1D1D1F] text-sm">{lead.consumer?.name || 'Unknown'}</p>
                    <p className="text-xs text-nexus-subtext">{lead.company?.name || 'General Inquiry'}</p>
                  </div>
                </div>
                {lead.status === 'PENDING' && (
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                )}
              </div>
              <p className="text-xs text-nexus-subtext line-clamp-2 mb-2">{lead.message}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-nexus-subtext flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(lead.createdAt).toLocaleDateString(lang === 'da' ? 'da-DK' : 'en-US')}
                </span>
                {lead.status === 'RESPONDED' && (
                  <CheckCircle className="text-green-500" size={14} />
                )}
              </div>
            </div>
          ))}

          {leads.length === 0 && (
            <div className="text-center py-10 text-nexus-subtext">
              {lang === 'da' ? 'Ingen leads endnu.' : 'No leads yet.'}
            </div>
          )}
        </div>

        {/* Message View */}
        <div className="lg:col-span-2">
          {selectedLeadData ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 h-full flex flex-col">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h3 className="font-bold text-[#1D1D1F] mb-1">{selectedLeadData.consumer?.name || 'Unknown'}</h3>
                <p className="text-sm text-nexus-subtext">{selectedLeadData.consumer?.email}</p>
                <p className="text-sm text-nexus-subtext mt-2 font-medium">{selectedLeadData.company?.name}</p>
              </div>

              <div className="flex-1 mb-4 overflow-y-auto">
                <div className="bg-nexus-bg rounded-xl p-4 mb-4 whitespace-pre-wrap">
                  <p className="text-nexus-text">{selectedLeadData.message}</p>
                  <span className="text-xs text-nexus-subtext mt-2 block">
                    {new Date(selectedLeadData.createdAt).toLocaleString(lang === 'da' ? 'da-DK' : 'en-US')}
                  </span>
                </div>

                {selectedLeadData.status === 'RESPONDED' && (
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-nexus-text text-sm">
                      {lang === 'da' ? 'Du har allerede besvaret denne henvendelse.' : 'You have already responded to this inquiry.'}
                    </p>
                  </div>
                )}
              </div>

              {selectedLeadData.status === 'PENDING' && (
                <div className="border-t border-gray-200 pt-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={lang === 'da' ? 'Skriv dit svar...' : 'Write your reply...'}
                    rows={4}
                    disabled={sendingReply}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent resize-none mb-3 disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={sendingReply || !replyText.trim()}
                    className="w-full px-4 py-3 bg-[#1D1D1F] text-white rounded-xl font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {sendingReply ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Send size={18} />
                    )}
                    {lang === 'da' ? 'Send Besked' : 'Send Message'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center h-[500px] flex items-center justify-center">
              <div>
                <MessageSquare className="text-gray-300 mx-auto mb-4" size={48} />
                <p className="text-nexus-subtext">
                  {lang === 'da' ? 'Vælg en lead for at se beskeden' : 'Select a lead to view the message'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadsMessagesPage;
