import React, { useState } from 'react';
import { ConsumerUser, Language } from '../../../types';
import { User, Mail, MapPin, Save, Loader2 } from 'lucide-react';
import { translations } from '../../../translations';

interface ConsumerAccountSettingsProps {
  user: ConsumerUser;
  lang: Language;
  onBack: () => void;
  onSave: (user: Partial<ConsumerUser>) => void;
}

const ConsumerAccountSettings: React.FC<ConsumerAccountSettingsProps> = ({
  user,
  lang,
  onBack,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    location: user.location
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
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
          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {lang === 'da' ? 'Profilbillede' : 'Profile Picture'}
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-md">
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                {lang === 'da' ? 'Skift Billede' : 'Change Picture'}
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User size={16} />
              {lang === 'da' ? 'Navn' : 'Name'}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Mail size={16} />
              {lang === 'da' ? 'Email' : 'Email'}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MapPin size={16} />
              {lang === 'da' ? 'Lokation' : 'Location'}
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
              placeholder={lang === 'da' ? 'F.eks. København' : 'e.g. Copenhagen'}
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

export default ConsumerAccountSettings;
