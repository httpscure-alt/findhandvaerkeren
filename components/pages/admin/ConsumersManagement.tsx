import * as React from 'react';
import { useState, useEffect } from 'react';
import { User, Search, Mail, MapPin, MoreHorizontal, Eye, Trash2, Key, UserX, X, Download } from 'lucide-react';
import { Language } from '../../../types';
import { api } from '../../../services/api';
import { LoadingSkeleton } from '../../common/LoadingSkeleton';
import { ErrorState } from '../../common/ErrorState';
import { EmptyState } from '../../common/EmptyState';
import { exportUsersToCSV } from '../../../utils/csvExport';
import { useToast } from '../../../hooks/useToast';
import { ConfirmDialog } from '../../common/ConfirmDialog';

interface ConsumersManagementProps {
  lang: Language;
  onBack: () => void;
}

interface Consumer {
  id: string;
  name: string;
  email: string;
  location: string;
  savedCount: number;
  joinedDate: string;
  user?: any;
}

const ConsumersManagement: React.FC<ConsumersManagementProps> = ({ lang, onBack }) => {
  const [search, setSearch] = useState('');
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConsumer, setSelectedConsumer] = useState<Consumer | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
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
  const toast = useToast();

  useEffect(() => {
    fetchConsumers();
  }, []);

  const fetchConsumers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getAdminUsers({ role: 'CONSUMER' });
      const consumersData = response.users.map((user: any) => ({
        id: user.id,
        name: user.name || user.email,
        email: user.email,
        location: user.location || '-',
        savedCount: user.savedListings?.length || 0,
        joinedDate: new Date(user.createdAt).toLocaleDateString(),
        user: user,
      }));
      setConsumers(consumersData);
    } catch (err: any) {
      setError(err.message || 'Failed to load consumers');
    } finally {
      setLoading(false);
    }
  };

  const filtered = consumers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewDetails = async (consumer: Consumer) => {
    try {
      const userData = await api.getUserDetails(consumer.id);
      setSelectedConsumer({ ...consumer, user: userData.user });
    } catch (err: any) {
      toast.error(err.message || 'Failed to load details');
    }
  };

  const handleSuspendAccount = async (consumerId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: lang === 'da' ? 'Suspendér Konto' : 'Suspend Account',
      message: lang === 'da'
        ? 'Er du sikker på at du vil suspendere denne konto?'
        : 'Are you sure you want to suspend this account?',
      onConfirm: async () => {
        setIsSaving(true);
        try {
          await api.suspendUser(consumerId);
          toast.success(lang === 'da' ? 'Konto suspenderede' : 'Account suspended');
          await fetchConsumers();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          toast.error(err.message || (lang === 'da' ? 'Kunne ikke suspendere konto' : 'Failed to suspend account'));
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const handleDeleteUser = async (consumerId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: lang === 'da' ? 'Slet Bruger' : 'Delete User',
      message: lang === 'da'
        ? 'Er du sikker på at du vil slette denne bruger? Dette kan ikke fortrydes.'
        : 'Are you sure you want to delete this user? This cannot be undone.',
      isDestructive: true,
      onConfirm: async () => {
        setIsSaving(true);
        try {
          await api.deleteUser(consumerId);
          toast.success(lang === 'da' ? 'Bruger slettet' : 'User deleted');
          await fetchConsumers();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          toast.error(err.message || (lang === 'da' ? 'Kunne ikke slette bruger' : 'Failed to delete user'));
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const handleResetPassword = async (consumerId: string) => {
    const newPassword = prompt(lang === 'da' ? 'Indtast nyt password (mindst 8 tegn):' : 'Enter new password (min 8 characters):');
    if (!newPassword || newPassword.length < 8) {
      toast.warning(lang === 'da' ? 'Password skal være mindst 8 tegn' : 'Password must be at least 8 characters');
      return;
    }
    try {
      await api.resetUserPassword(consumerId, newPassword);
      toast.success(lang === 'da' ? 'Password nulstillet' : 'Password reset');
    } catch (err: any) {
      toast.error(err.message || (lang === 'da' ? 'Kunne ikke nulstille password' : 'Failed to reset password'));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1D1D1F] mb-2">
            {lang === 'da' ? 'Forbrugerstyring' : 'Consumers Management'}
          </h1>
          <p className="text-gray-500">
            {lang === 'da' ? 'Administrer alle forbrugere' : 'Manage all consumers'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={lang === 'da' ? 'Søg forbrugere...' : 'Search consumers...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-nexus-accent"
            />
          </div>
          <button
            onClick={() => exportUsersToCSV(consumers.map(c => c.user))}
            disabled={consumers.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download size={16} />
            {lang === 'da' ? 'Eksporter CSV' : 'Export CSV'}
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {lang === 'da' ? 'Tilbage' : 'Back'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden p-6">
          <LoadingSkeleton variant="table" count={5} />
        </div>
      ) : error ? (
        <ErrorState title="Failed to load consumers" message={error} onRetry={fetchConsumers} />
      ) : (
        <>
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Forbruger' : 'Consumer'}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Lokation' : 'Location'}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Gemte' : 'Saved'}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Tilmeldt' : 'Joined'}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">{lang === 'da' ? 'Handlinger' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(consumer => (
                    <tr key={consumer.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="text-gray-400" size={20} />
                          </div>
                          <div>
                            <div className="font-medium text-[#1D1D1F]">{consumer.name}</div>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <Mail size={12} />
                              {consumer.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-nexus-subtext">
                          <MapPin size={14} />
                          {consumer.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#1D1D1F]">{consumer.savedCount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-nexus-subtext">{consumer.joinedDate}</span>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(consumer)}
                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            title={lang === 'da' ? 'Se detaljer' : 'View details'}
                          >
                            <Eye size={18} />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setShowActionsMenu(showActionsMenu === consumer.id ? null : consumer.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#1D1D1F] opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal size={18} />
                            </button>
                            {showActionsMenu === consumer.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg z-10">
                                <button
                                  onClick={() => {
                                    handleViewDetails(consumer);
                                    setShowActionsMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Eye size={16} />
                                  {lang === 'da' ? 'Se detaljer' : 'View details'}
                                </button>
                                <button
                                  onClick={() => {
                                    handleResetPassword(consumer.id);
                                    setShowActionsMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Key size={16} />
                                  {lang === 'da' ? 'Nulstil password' : 'Reset password'}
                                </button>
                                <button
                                  onClick={() => {
                                    handleSuspendAccount(consumer.id);
                                    setShowActionsMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <UserX size={16} />
                                  {lang === 'da' ? 'Suspendér konto' : 'Suspend account'}
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteUser(consumer.id);
                                    setShowActionsMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 size={16} />
                                  {lang === 'da' ? 'Slet bruger' : 'Delete user'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filtered.length === 0 && !loading && (
            <EmptyState
              icon={User}
              title={lang === 'da' ? 'Ingen forbrugere fundet' : 'No consumers found'}
              description={lang === 'da' ? 'Der er ingen forbrugere, der matcher din søgning.' : 'No consumers match your search.'}
            />
          )}
        </>
      )}

      {/* Consumer Details Modal */}
      {selectedConsumer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1D1D1F]">
                {lang === 'da' ? 'Forbruger Detaljer' : 'Consumer Details'}
              </h3>
              <button
                onClick={() => setSelectedConsumer(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">{lang === 'da' ? 'Bruger Information' : 'User Information'}</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div><strong>{lang === 'da' ? 'Navn:' : 'Name:'}</strong> {selectedConsumer.user?.name || selectedConsumer.name}</div>
                  <div><strong>{lang === 'da' ? 'Email:' : 'Email:'}</strong> {selectedConsumer.email}</div>
                  <div><strong>{lang === 'da' ? 'Lokation:' : 'Location:'}</strong> {selectedConsumer.location}</div>
                  <div><strong>{lang === 'da' ? 'Tilmeldt:' : 'Joined:'}</strong> {selectedConsumer.joinedDate}</div>
                </div>
              </div>
              {selectedConsumer.user?.savedListings && selectedConsumer.user.savedListings.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">{lang === 'da' ? 'Gemte Listings' : 'Saved Listings'}</h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600">
                      {selectedConsumer.user.savedListings.length} {lang === 'da' ? 'gemte listings' : 'saved listings'}
                    </div>
                  </div>
                </div>
              )}
              {selectedConsumer.user?.sentInquiries && selectedConsumer.user.sentInquiries.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">{lang === 'da' ? 'Forespørgsler' : 'Inquiries'}</h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600">
                      {selectedConsumer.user.sentInquiries.length} {lang === 'da' ? 'forespørgsler' : 'inquiries'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
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

export default ConsumersManagement;
