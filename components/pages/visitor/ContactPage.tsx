import React, { useState } from 'react';
import { Language } from '../../../types';
import { translations } from '../../../translations';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';

interface ContactPageProps {
  lang: Language;
}

const ContactPage: React.FC<ContactPageProps> = ({ lang }) => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 3000);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-[#1D1D1F] mb-4">
          {lang === 'da' ? 'Kontakt Os' : 'Contact Us'}
        </h1>
        <p className="text-xl text-nexus-subtext max-w-2xl mx-auto">
          {lang === 'da'
            ? 'Har du spørgsmål? Vi er her for at hjælpe.'
            : 'Have questions? We\'re here to help.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="w-12 h-12 bg-nexus-bg rounded-xl flex items-center justify-center mb-4">
              <Mail className="text-nexus-accent" size={24} />
            </div>
            <h3 className="font-bold text-[#1D1D1F] mb-2">
              {lang === 'da' ? 'Email' : 'Email'}
            </h3>
            <p className="text-nexus-subtext">hello@findhandvaerkeren.dk</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="w-12 h-12 bg-nexus-bg rounded-xl flex items-center justify-center mb-4">
              <Phone className="text-nexus-accent" size={24} />
            </div>
            <h3 className="font-bold text-[#1D1D1F] mb-2">
              {lang === 'da' ? 'Telefon' : 'Phone'}
            </h3>
            <p className="text-nexus-subtext">+45 12 34 56 78</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="w-12 h-12 bg-nexus-bg rounded-xl flex items-center justify-center mb-4">
              <MapPin className="text-nexus-accent" size={24} />
            </div>
            <h3 className="font-bold text-[#1D1D1F] mb-2">
              {lang === 'da' ? 'Adresse' : 'Address'}
            </h3>
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
                <h3 className="text-2xl font-bold text-[#1D1D1F] mb-2">
                  {lang === 'da' ? 'Tak for din besked!' : 'Thank You!'}
                </h3>
                <p className="text-nexus-subtext">
                  {lang === 'da'
                    ? 'Vi vender tilbage inden for 24 timer.'
                    : 'We\'ll get back to you within 24 hours.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {lang === 'da' ? 'Navn' : 'Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {lang === 'da' ? 'Email' : 'Email'}
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lang === 'da' ? 'Emne' : 'Subject'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lang === 'da' ? 'Besked' : 'Message'}
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#1D1D1F] text-white rounded-xl font-medium hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {lang === 'da' ? 'Sender...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      {lang === 'da' ? 'Send Besked' : 'Send Message'}
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
