import React, { useState } from 'react';
import { Company, Language } from '../../../types';
import { User, Mail, MapPin, Globe, Save, Loader2 } from 'lucide-react';

interface PartnerAccountSettingsProps {
  company: Company;
  lang: Language;
  onBack: () => void;
  onSave: (company: Partial<Company>) => void;
}

const PartnerAccountSettings: React.FC<PartnerAccountSettingsProps> = ({
  company,
  lang,
  onBack,
  onSave
}) => {
  const [formData, setFormData] = useState({
    contactEmail: company.contactEmail,
    website: company.website || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      onSave(formData);
      setIsSaving(false);
      alert(lang === 'da' ? 'Indstillinger gemt!' : 'Settings saved!');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-nexus-subtext hover:text-[#1D1D1F] mb-6 transition-colors"
      >
        <User size={18} />
        {lang === 'da' ? 'Tilbage' : 'Back'}
      </button>

      <h1 className="text-3xl font-bold text-[#1D1D1F] mb-8">
        {lang === 'da' ? 'Kontoindstillinger' : 'Account Settings'}
      </h1>

      <div className="bg-white rounded-3xl p-8 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Mail size={16} />
              {lang === 'da' ? 'Kontakt Email' : 'Contact Email'}
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
              required
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Globe size={16} />
              {lang === 'da' ? 'Hjemmeside' : 'Website'}
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
              placeholder="https://example.com"
            />
          </div>

          {/* Password Section */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="font-bold text-[#1D1D1F] mb-4">
              {lang === 'da' ? 'Skift Adgangskode' : 'Change Password'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'da' ? 'Nuværende Adgangskode' : 'Current Password'}
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'da' ? 'Ny Adgangskode' : 'New Password'}
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              {lang === 'da' ? 'Annuller' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-[#1D1D1F] text-white rounded-xl font-medium hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  {lang === 'da' ? 'Gemmer...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save size={18} />
                  {lang === 'da' ? 'Gem Ændringer' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartnerAccountSettings;
