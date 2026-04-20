import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { TestimonialItem, Language } from '../../../types';
import { ArrowLeft, Loader2, Quote, Send, Star } from 'lucide-react';
import { api } from '../../../services/api';
import { useToast } from '../../../hooks/useToast';

interface TestimonialsManagementProps {
  testimonials: TestimonialItem[];
  companyId: string;
  lang: Language;
  onSave: () => void;
  onBack: () => void;
}

const TestimonialsManagement: React.FC<TestimonialsManagementProps> = ({ testimonials, companyId, lang, onSave, onBack }) => {
  const toast = useToast();
  const [items, setItems] = useState<TestimonialItem[]>(testimonials);
  const [loading, setLoading] = useState(true);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bd - ad;
    });
  }, [items]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.getCompanyTestimonials(companyId);
        setItems(res.testimonials || []);
      } catch (e: any) {
        toast.error(e?.message || (lang === 'da' ? 'Kunne ikke hente udtalelser' : 'Failed to load testimonials'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [companyId, lang, toast]);

  const sendReply = async (testimonialId: string) => {
    const reply = (replyDrafts[testimonialId] || '').trim();
    if (!reply) return;
    try {
      setSendingId(testimonialId);
      const res = await api.replyToTestimonial(companyId, testimonialId, reply);
      setItems((prev) => prev.map((t) => (t.id === testimonialId ? res.testimonial : t)));
      setReplyDrafts((prev) => ({ ...prev, [testimonialId]: '' }));
      toast.success(lang === 'da' ? 'Svar sendt' : 'Reply sent');
      onSave();
    } catch (e: any) {
      toast.error(e?.message || (lang === 'da' ? 'Kunne ikke sende svar' : 'Failed to send reply'));
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label={lang === 'da' ? 'Tilbage' : 'Back'}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-3xl font-bold text-[#1D1D1F]">
            {lang === 'da' ? 'Kundeudtalelser' : 'Customer testimonials'}
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Loader2 className="animate-spin text-nexus-accent mx-auto mb-3" size={24} />
          <div className="text-nexus-subtext">{lang === 'da' ? 'Henter udtalelser…' : 'Loading testimonials…'}</div>
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500">{lang === 'da' ? 'Ingen udtalelser endnu.' : 'No testimonials yet.'}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sorted.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-6 border border-gray-100 relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={star <= item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                      />
                    ))}
                    {item.createdAt && (
                      <span className="ml-3 text-xs text-nexus-subtext">
                        {new Date(item.createdAt).toLocaleDateString(lang === 'da' ? 'da-DK' : 'en-US')}
                      </span>
                    )}
                  </div>

                  <blockquote className="text-gray-700 italic mb-4">"{item.content}"</blockquote>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-nexus-bg rounded-full flex items-center justify-center text-nexus-accent font-bold">
                      {(item.author || '?').charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[#1D1D1F] text-sm">{item.author}</p>
                      <p className="text-nexus-subtext text-xs">
                        {item.role}
                        {item.company ? `, ${item.company}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-gray-100 pt-4">
                    {item.partnerReply ? (
                      <div className="bg-nexus-bg rounded-xl p-4">
                        <div className="text-xs font-bold tracking-wide text-[#1D1D1F]">
                          {lang === 'da' ? 'Dit svar' : 'Your reply'}
                        </div>
                        <div className="text-sm text-nexus-text whitespace-pre-wrap mt-2">{item.partnerReply}</div>
                        {item.partnerReplyAt && (
                          <div className="text-xs text-nexus-subtext mt-2">
                            {new Date(item.partnerReplyAt).toLocaleString(lang === 'da' ? 'da-DK' : 'en-US')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs font-bold tracking-wide text-[#1D1D1F] mb-2">
                          {lang === 'da' ? 'Svar til kunden' : 'Reply to customer'}
                        </div>
                        <textarea
                          value={replyDrafts[item.id] || ''}
                          onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent resize-none text-sm"
                          placeholder={lang === 'da' ? 'Skriv et kort svar…' : 'Write a short reply…'}
                          disabled={sendingId === item.id}
                        />
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={() => sendReply(item.id)}
                            disabled={sendingId === item.id || !(replyDrafts[item.id] || '').trim()}
                            className="px-5 py-2.5 bg-[#1D1D1F] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                          >
                            {sendingId === item.id ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                            {lang === 'da' ? 'Send svar' : 'Send reply'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Quote className="absolute top-6 right-6 text-nexus-accent opacity-5" size={48} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestimonialsManagement;
