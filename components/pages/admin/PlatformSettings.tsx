import React, { useState } from 'react';
import { Language } from '../../../types';
import { Settings, Save, Loader2, Globe, Bell, Shield } from 'lucide-react';
import { api } from '../../../services/api';
import { useToast } from '../../../hooks/useToast';

interface PlatformSettingsProps {
  lang: Language;
  onBack: () => void;
}

const PlatformSettings: React.FC<PlatformSettingsProps> = ({ lang, onBack }) => {
  const toast = useToast();
  const [settings, setSettings] = useState({
    platformName: 'Findhåndværkeren',
    supportEmail: 'support@findhandvaerkeren.dk',
    maintenanceMode: false,
    emailNotifications: true, // This is local state for now
    defaultLanguage: 'da'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await api.getPlatformSettings();
      if (response.settings) {
        setSettings(prev => ({
          ...prev,
          ...response.settings
        }));
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updatePlatformSettings(settings);
      toast.success(lang === 'da' ? 'Indstillinger gemt!' : 'Settings saved!');
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      toast.error(err.message || (lang === 'da' ? 'Kunne ikke gemme indstillinger' : 'Failed to save settings'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <h1 className="text-3xl font-bold text-[#1D1D1F] mb-8">
        {lang === 'da' ? 'Platformindstillinger' : 'Platform Settings'}
      </h1>

      <div className="space-y-6">
        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
            <Loader2 className="animate-spin mx-auto mb-4 text-nexus-accent" size={32} />
            <p className="text-gray-500">{lang === 'da' ? 'Henter indstillinger...' : 'Loading settings...'}</p>
          </div>
        ) : (
          <>
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
                    {lang === 'da' ? 'Platform Navn' : 'Platform Name'}
                  </label>
                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lang === 'da' ? 'Support Email' : 'Support Email'}
                  </label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                  />
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

          </>
        )}

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
