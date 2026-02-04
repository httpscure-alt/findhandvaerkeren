import * as React from 'react';
import { useState, useEffect } from 'react';
import { Language } from '../../../types';
import { Briefcase, Search, CheckCircle, XCircle, MoreHorizontal, Eye, Trash2, RefreshCw, Key, UserX, X, Download } from 'lucide-react';
import { api } from '../../../services/api';
import { LoadingSkeleton } from '../../common/LoadingSkeleton';
import { ErrorState } from '../../common/ErrorState';
import { EmptyState } from '../../common/EmptyState';
import { exportUsersToCSV } from '../../../utils/csvExport';
import { useToast } from '../../../hooks/useToast';
import { ConfirmDialog } from '../../common/ConfirmDialog';

interface PartnersManagementProps {
  lang: Language;
  onBack: () => void;
}

interface Partner {
  id: string;
  name: string;
  email: string;
  plan: string;
  verified: boolean;
  joinedDate: string;
  company?: any;
  user?: any;
}

const PartnersManagement: React.FC<PartnersManagementProps> = ({ lang, onBack }) => {
  const [search, setSearch] = useState('');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
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
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getAdminUsers({ role: 'PARTNER' });
      const partnersData = response.users.map((user: any) => ({
        id: user.id,
        name: user.ownedCompany?.name || user.name || user.email,
        email: user.email,
        plan: user.ownedCompany?.pricingTier || 'Standard',
        verified: user.ownedCompany?.isVerified || user.ownedCompany?.verificationStatus === 'verified',
        joinedDate: new Date(user.createdAt).toLocaleDateString(),
        company: user.ownedCompany,
        user: user,
      }));
      setPartners(partnersData);
    } catch (err: any) {
      setError(err.message || 'Failed to load partners');
    } finally {
      setLoading(false);
    }
  };

  const filtered = partners.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewDetails = async (partner: Partner) => {
    try {
      if (partner.company?.id) {
        const companyData = await api.getCompany(partner.company.id);
        setSelectedPartner({ ...partner, company: companyData.company });
      } else {
        setSelectedPartner(partner);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load details');
    }
  };

  const handleSuspendAccount = async (partnerId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: lang === 'da' ? 'Suspendér Konto' : 'Suspend Account',
      message: lang === 'da'
        ? 'Er du sikker på at du vil suspendere denne konto?'
        : 'Are you sure you want to suspend this account?',
      onConfirm: async () => {
        setIsSaving(true);
        try {
          await api.suspendUser(partnerId);
          toast.success(lang === 'da' ? 'Konto suspenderede' : 'Account suspended');
          await fetchPartners();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          toast.error(err.message || (lang === 'da' ? 'Kunne ikke suspendere konto' : 'Failed to suspend account'));
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const handleDeleteUser = async (partnerId: string) => {
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
          await api.deleteUser(partnerId);
          toast.success(lang === 'da' ? 'Bruger slettet' : 'User deleted');
          await fetchPartners();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          toast.error(err.message || (lang === 'da' ? 'Kunne ikke slette bruger' : 'Failed to delete user'));
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const handleResetProfile = async (partnerId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: lang === 'da' ? 'Nulstil Profil' : 'Reset Profile',
      message: lang === 'da'
        ? 'Er du sikker på at du vil nulstille denne profil?'
        : 'Are you sure you want to reset this profile?',
      isDestructive: false,
      onConfirm: async () => {
        setIsSaving(true);
        try {
          await api.resetPartnerProfile(partnerId);
          toast.success(lang === 'da' ? 'Profil nulstillet' : 'Profile reset');
          await fetchPartners();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          toast.error(err.message || (lang === 'da' ? 'Kunne ikke nulstille profil' : 'Failed to reset profile'));
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1D1D1F] mb-2">
            {lang === 'da' ? 'Partnerstyring' : 'Partners Management'}
          </h1>
          <p className="text-gray-500">
            {lang === 'da' ? 'Administrer alle partnere' : 'Manage all partners'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={lang === 'da' ? 'Søg partnere...' : 'Search partners...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-nexus-accent"
            />
          </div>
          <button
            onClick={() => exportUsersToCSV(partners.map(p => ({ ...p.user, ownedCompany: p.company })))}
            disabled={partners.length === 0}
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
        <ErrorState title="Failed to load partners" message={error} onRetry={fetchPartners} />
      ) : (
        <>
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Partner' : 'Partner'}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Plan' : 'Plan'}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Status' : 'Status'}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Tilmeldt' : 'Joined'}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">{lang === 'da' ? 'Handlinger' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(partner => (
                    <tr key={partner.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-nexus-bg flex items-center justify-center">
                            <Briefcase className="text-nexus-accent" size={20} />
                          </div>
                          <div>
                            <div className="font-medium text-[#1D1D1F]">{partner.name}</div>
                            <div className="text-xs text-gray-400">{partner.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${partner.plan === 'Elite' ? 'bg-purple-50 text-purple-700' :
                          partner.plan === 'Premium' ? 'bg-indigo-50 text-indigo-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                          {partner.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {partner.verified ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                            <CheckCircle size={12} />
                            {lang === 'da' ? 'Verificeret' : 'Verified'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                            <XCircle size={12} />
                            {lang === 'da' ? 'Ikke Verificeret' : 'Not Verified'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-nexus-subtext">{partner.joinedDate}</span>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(partner)}
                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            title={lang === 'da' ? 'Se detaljer' : 'View details'}
                          >
                            <Eye size={18} />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setShowActionsMenu(showActionsMenu === partner.id ? null : partner.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#1D1D1F] opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal size={18} />
                            </button>
                            {showActionsMenu === partner.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg z-10">
                                <button
                                  onClick={() => {
                                    handleViewDetails(partner);
                                    setShowActionsMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Eye size={16} />
                                  {lang === 'da' ? 'Se detaljer' : 'View details'}
                                </button>
                                <button
                                  onClick={() => {
                                    handleSuspendAccount(partner.id);
                                    setShowActionsMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <UserX size={16} />
                                  {lang === 'da' ? 'Suspendér konto' : 'Suspend account'}
                                </button>
                                <button
                                  onClick={() => {
                                    handleResetProfile(partner.id);
                                    setShowActionsMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <RefreshCw size={16} />
                                  {lang === 'da' ? 'Nulstil profil' : 'Reset profile'}
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteUser(partner.id);
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
              icon={Briefcase}
              title={lang === 'da' ? 'Ingen partnere fundet' : 'No partners found'}
              description={lang === 'da' ? 'Der er ingen partnere, der matcher din søgning.' : 'No partners match your search.'}
            />
          )}
        </>
      )}

      {/* Partner Details Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1D1D1F]">
                {lang === 'da' ? 'Partner Detaljer' : 'Partner Details'}
              </h3>
              <button
                onClick={() => setSelectedPartner(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">{lang === 'da' ? 'Bruger Information' : 'User Information'}</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div><strong>{lang === 'da' ? 'Navn:' : 'Name:'}</strong> {selectedPartner.user?.name || selectedPartner.name}</div>
                  <div><strong>{lang === 'da' ? 'Email:' : 'Email:'}</strong> {selectedPartner.email}</div>
                  <div><strong>{lang === 'da' ? 'Tilmeldt:' : 'Joined:'}</strong> {selectedPartner.joinedDate}</div>
                </div>
              </div>
              {selectedPartner.company && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">{lang === 'da' ? 'Virksomheds Information' : 'Company Information'}</h4>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div><strong>{lang === 'da' ? 'Navn:' : 'Name:'}</strong> {selectedPartner.company.name}</div>
                    <div><strong>{lang === 'da' ? 'Kategori:' : 'Category:'}</strong> {selectedPartner.company.category}</div>
                    <div><strong>{lang === 'da' ? 'Lokation:' : 'Location:'}</strong> {selectedPartner.company.location}</div>
                    <div><strong>{lang === 'da' ? 'Plan:' : 'Plan:'}</strong> {selectedPartner.plan}</div>
                    <div><strong>{lang === 'da' ? 'Verificeret:' : 'Verified:'}</strong> {selectedPartner.verified ? (lang === 'da' ? 'Ja' : 'Yes') : (lang === 'da' ? 'Nej' : 'No')}</div>
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

export default PartnersManagement;
