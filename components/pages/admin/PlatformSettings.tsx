import React, { useState } from 'react';
import { Language } from '../../../types';
import { Settings, Save, Loader2, Globe, Bell, Shield } from 'lucide-react';

interface PlatformSettingsProps {
  lang: Language;
  onBack: () => void;
}

const PlatformSettings: React.FC<PlatformSettingsProps> = ({ lang }) => {
  const [settings, setSettings] = useState({
    siteName: 'Findhåndværkeren',
    defaultLanguage: 'en',
    emailNotifications: true,
    maintenanceMode: false
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert(lang === 'da' ? 'Indstillinger gemt!' : 'Settings saved!');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <h1 className="text-3xl font-bold text-[#1D1D1F] mb-8">
        {lang === 'da' ? 'Platformindstillinger' : 'Platform Settings'}
      </h1>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="text-nexus-accent" size={24} />
            <h2 className="text-xl font-bold text-[#1D1D1F]">
              {lang === 'da' ? 'Generelle Indstillinger' : 'General Settings'}
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lang === 'da' ? 'Webstedsnavn' : 'Site Name'}
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lang === 'da' ? 'Standardsprog' : 'Default Language'}
              </label>
              <select
                value={settings.defaultLanguage}
                onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
              >
                <option value="en">English</option>
                <option value="da">Dansk</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="text-nexus-accent" size={24} />
            <h2 className="text-xl font-bold text-[#1D1D1F]">
              {lang === 'da' ? 'Notifikationsindstillinger' : 'Notification Settings'}
            </h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-[#1D1D1F]">
                {lang === 'da' ? 'Email Notifikationer' : 'Email Notifications'}
              </span>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.emailNotifications ? 'bg-nexus-accent' : 'bg-gray-200'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="text-nexus-accent" size={24} />
            <h2 className="text-xl font-bold text-[#1D1D1F]">
              {lang === 'da' ? 'Systemindstillinger' : 'System Settings'}
            </h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-[#1D1D1F]">
                {lang === 'da' ? 'Vedligeholdelsestilstand' : 'Maintenance Mode'}
              </span>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-200'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            {lang === 'da' ? 'Annuller' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
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
                {lang === 'da' ? 'Gem Indstillinger' : 'Save Settings'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlatformSettings;
