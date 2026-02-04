import * as React from 'react';
import { useState } from 'react';
import { Company, Language } from '../../../types';
import { User, Mail, MapPin, Globe, Save, Loader2, Download, Shield, Trash2, Phone, FileText } from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../hooks/useToast';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { FileUpload } from '../../common/FileUpload';

interface PartnerAccountSettingsProps {
  company: Company;
  lang: Language;
  onBack: () => void;
  onSave: (company: Partial<Company>) => Promise<void>;
}

const PartnerAccountSettings: React.FC<PartnerAccountSettingsProps> = ({
  company,
  lang,
  onBack,
  onSave
}) => {
  const { logout } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    contactEmail: company.contactEmail,
    website: company.website || '',
    phone: company.phone || '',
    cvrNumber: company.cvrNumber || '',
    logoUrl: company.logoUrl || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave(formData);
      setIsSaving(false);
      toast.success(lang === 'da' ? 'Indstillinger gemt!' : 'Settings saved!');
    } catch (error: any) {
      setIsSaving(false);
      toast.error(error.message || (lang === 'da' ? 'Fejl ved gemning' : 'Error saving settings'));
    }
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
          {/* Logo Upload */}
          <FileUpload
            label={lang === 'da' ? 'Virksomhedslogo' : 'Company Logo'}
            lang={lang}
            currentUrl={formData.logoUrl}
            onUpload={async (file) => {
              const result = await api.uploadLogo(file);
              setFormData(prev => ({ ...prev, logoUrl: result.logoUrl }));
              return result.logoUrl;
            }}
            accept="image/*"
            maxSize={2}
          />

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone size={16} />
                {lang === 'da' ? 'Telefonnummer' : 'Phone Number'}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                placeholder="+45 ..."
              />
            </div>

            {/* CVR */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText size={16} />
                {lang === 'da' ? 'CVR-nummer' : 'CVR Number'}
              </label>
              <input
                type="text"
                value={formData.cvrNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                  setFormData({ ...formData, cvrNumber: value });
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                placeholder="12345678"
              />
            </div>
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

          {/* GDPR Section */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="font-bold text-[#1D1D1F] mb-4 flex items-center gap-2">
              <Shield size={18} />
              {lang === 'da' ? 'GDPR Rettigheder' : 'GDPR Rights'}
            </h3>

            {/* Export Data */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h4 className="font-semibold text-[#1D1D1F] mb-2">
                {lang === 'da' ? 'Eksporter Dine Data' : 'Export Your Data'}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {lang === 'da'
                  ? 'Download en kopi af alle dine personlige data i JSON-format.'
                  : 'Download a copy of all your personal data in JSON format.'}
              </p>
              <button
                type="button"
                onClick={async () => {
                  setIsExporting(true);
                  try {
                    const response = await api.exportUserData();
                    const dataStr = JSON.stringify(response.data, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `my-data-${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    toast.success(lang === 'da' ? 'Data eksporteret!' : 'Data exported!');
                  } catch (error: any) {
                    toast.error(error.message || (lang === 'da' ? 'Fejl ved eksport' : 'Error exporting data'));
                  } finally {
                    setIsExporting(false);
                  }
                }}
                disabled={isExporting}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    {lang === 'da' ? 'Eksporterer...' : 'Exporting...'}
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    {lang === 'da' ? 'Eksporter Data' : 'Export Data'}
                  </>
                )}
              </button>
            </div>

            {/* Delete Account */}
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <h4 className="font-semibold text-red-600 mb-2">
                {lang === 'da' ? 'Slet Konto' : 'Delete Account'}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {lang === 'da'
                  ? 'Dette vil permanent slette din konto, virksomhedsprofil og alle dine data. Denne handling kan ikke fortrydes.'
                  : 'This will permanently delete your account, company profile, and all your data. This action cannot be undone.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setConfirmDialog({
                    isOpen: true,
                    title: lang === 'da' ? 'Slet Konto' : 'Delete Account',
                    message: lang === 'da'
                      ? 'Er du sikker? Denne handling kan ikke fortrydes. Alle dine data vil blive slettet permanent.'
                      : 'Are you sure? This action cannot be undone. All your data will be permanently deleted.',
                    isDestructive: true,
                    onConfirm: async () => {
                      setIsSaving(true);
                      try {
                        await api.deleteUserAccount();
                        toast.success(lang === 'da' ? 'Konto slettet' : 'Account deleted');
                        logout();
                        onBack();
                        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                      } catch (error: any) {
                        toast.error(error.message || (lang === 'da' ? 'Fejl ved sletning' : 'Error deleting account'));
                      } finally {
                        setIsSaving(false);
                      }
                    }
                  });
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                {lang === 'da' ? 'Slet Konto' : 'Delete Account'}
              </button>
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

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => !isSaving && setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isLoading={isSaving}
        isDestructive={confirmDialog.isDestructive}
        lang={lang}
      />
    </div>
  );
};

export default PartnerAccountSettings;
