import React, { useState } from 'react';
import { ConsumerUser, Language } from '../../../types';
import { User, Mail, MapPin, Save, Loader2, Trash2 } from 'lucide-react';
import { translations } from '../../../translations';
import { api } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

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
  const { logout } = useAuth();
  const [formData, setFormData] = useState({
    firstName: (user as any).firstName || '',
    lastName: (user as any).lastName || '',
    name: user.name,
    email: user.email,
    location: user.location,
    avatarUrl: (user as any).avatarUrl || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await api.updateConsumerProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: formData.name,
        location: formData.location,
        avatarUrl: formData.avatarUrl,
      });
      onSave(formData);
      alert(lang === 'da' ? 'Indstillinger gemt!' : 'Settings saved!');
    } catch (error: any) {
      alert(error.message || (lang === 'da' ? 'Fejl ved gemning' : 'Error saving'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert(lang === 'da' ? 'Adgangskoder matcher ikke' : 'Passwords do not match');
      return;
    }
    
    setIsChangingPassword(true);
    try {
      await api.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      alert(lang === 'da' ? 'Adgangskode ændret!' : 'Password changed!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      alert(error.message || (lang === 'da' ? 'Fejl ved ændring af adgangskode' : 'Error changing password'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm(lang === 'da' ? 'Er du sikker? Denne handling kan ikke fortrydes.' : 'Are you sure? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.deleteAccount();
      logout();
      onBack();
    } catch (error: any) {
      alert(error.message || (lang === 'da' ? 'Fejl ved sletning' : 'Error deleting account'));
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

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User size={16} />
              {lang === 'da' ? 'Fornavn' : 'First Name'}
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User size={16} />
              {lang === 'da' ? 'Efternavn' : 'Last Name'}
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
            />
          </div>

          {/* Full Name (auto-generated or manual) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User size={16} />
              {lang === 'da' ? 'Fulde Navn' : 'Full Name'}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
              placeholder={formData.firstName && formData.lastName ? `${formData.firstName} ${formData.lastName}` : ''}
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
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'da' ? 'Nuværende Adgangskode' : 'Current Password'}
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'da' ? 'Ny Adgangskode' : 'New Password'}
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'da' ? 'Bekræft Ny Adgangskode' : 'Confirm New Password'}
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-4 py-2 bg-nexus-accent text-white rounded-xl text-sm font-medium hover:bg-nexus-accent/90 transition-colors disabled:opacity-50"
              >
                {isChangingPassword 
                  ? (lang === 'da' ? 'Ændrer...' : 'Changing...')
                  : (lang === 'da' ? 'Skift Adgangskode' : 'Change Password')}
              </button>
            </form>
          </div>

          {/* GDPR Delete Account */}
          <div className="pt-6 border-t border-red-200">
            <h3 className="font-bold text-red-600 mb-4">
              {lang === 'da' ? 'Slet Konto' : 'Delete Account'}
            </h3>
            <p className="text-sm text-nexus-subtext mb-4">
              {lang === 'da' 
                ? 'Dette vil permanent slette din konto og alle dine data. Denne handling kan ikke fortrydes.'
                : 'This will permanently delete your account and all your data. This action cannot be undone.'}
            </p>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              {lang === 'da' ? 'Slet Konto' : 'Delete Account'}
            </button>
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
