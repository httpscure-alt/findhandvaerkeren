import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Language } from '../../../types';
import { translations } from '../../../translations';
import { Mail, Phone, MapPin, Send, Loader2, Paperclip, X } from 'lucide-react';
import { api } from '../../../services/api';
import { FileUpload } from '../../common/FileUpload';

interface ContactPageProps {
  lang: Language;
}

const ContactPage: React.FC<ContactPageProps> = ({ lang }) => {
  const t = translations[lang].contact;
  const [searchParams] = useSearchParams();
  const initialSubject = searchParams.get('subject') === 'audit'
    ? (lang === 'da' ? 'Jeg ønsker en SEO & Ads audit' : 'I want an SEO & Ads audit')
    : '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: initialSubject,
    message: '',
    files: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.submitContactForm(formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        files: []
      });
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || t.error);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const url = await api.uploadDocument(file);
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, url]
      }));
      return url;
    } catch (err) {
      throw err;
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-[#1D1D1F] mb-4">
          {t.title}
        </h1>
        <p className="text-xl text-nexus-subtext max-w-2xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="w-12 h-12 bg-nexus-bg rounded-xl flex items-center justify-center mb-4">
              <Mail className="text-nexus-accent" size={24} />
            </div>
            <h3 className="font-bold text-[#1D1D1F] mb-2">{t.email}</h3>
            <div className="space-y-1 text-sm">
              <p className="text-nexus-subtext flex justify-between">
                <span>General:</span>
                <a href="mailto:hello@findhandvaerkeren.dk" className="text-nexus-accent hover:underline">hello@findhandvaerkeren.dk</a>
              </p>
              <p className="text-nexus-subtext flex justify-between">
                <span>Private:</span>
                <a href="mailto:privat@findhandvaerkeren.dk" className="text-nexus-accent hover:underline">privat@findhandvaerkeren.dk</a>
              </p>
              <p className="text-nexus-subtext flex justify-between">
                <span>Partners:</span>
                <a href="mailto:partner@findhandvaerkeren.dk" className="text-nexus-accent hover:underline">partner@findhandvaerkeren.dk</a>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="w-12 h-12 bg-nexus-bg rounded-xl flex items-center justify-center mb-4">
              <Phone className="text-nexus-accent" size={24} />
            </div>
            <h3 className="font-bold text-[#1D1D1F] mb-2">{t.phone}</h3>
            <p className="text-nexus-subtext">+45 12 34 56 78</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="w-12 h-12 bg-nexus-bg rounded-xl flex items-center justify-center mb-4">
              <MapPin className="text-nexus-accent" size={24} />
            </div>
            <h3 className="font-bold text-[#1D1D1F] mb-2">{t.address}</h3>
            <p className="text-nexus-subtext">København, Denmark</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-8 border border-gray-100">
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="text-green-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-[#1D1D1F] mb-2">{t.successTitle}</h3>
                <p className="text-nexus-subtext">{t.successMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.nameLabel}</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.emailLabel}</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.phoneLabel}</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.subjectLabel}</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.messageLabel}</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.fileLabel}</label>
                  <FileUpload
                    onUpload={handleFileUpload}
                    type="document"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    maxSize={5}
                    lang={lang}
                  />
                  {formData.files.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {formData.files.map((fileUrl, index) => (
                        <div key={index} className="flex items-center gap-2 bg-nexus-bg px-3 py-1.5 rounded-full text-xs text-nexus-text border border-nexus-accent/10">
                          <Paperclip size={12} className="text-nexus-accent" />
                          <span className="truncate max-w-[150px]">{fileUrl.split('/').pop()}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">{t.fileHelp}</p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#1D1D1F] text-white rounded-xl font-medium hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {t.sendingButton}
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      {t.sendButton}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
