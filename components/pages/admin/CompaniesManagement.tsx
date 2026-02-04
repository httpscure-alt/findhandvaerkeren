import * as React from 'react';
import { useState } from 'react';
import { Company, Language } from '../../../types';
import { Search, CheckCircle, XCircle, Edit2, MoreHorizontal, Eye, Trash2, X, AlertTriangle, Building2 } from 'lucide-react';

import { api } from '../../../services/api';
import { useToast } from '../../../hooks/useToast';
import { LoadingSkeleton } from '../../common/LoadingSkeleton';
import { ConfirmDialog } from '../../common/ConfirmDialog';

interface CompaniesManagementProps {
  lang: Language;
  onBack: () => void;
}

const CompaniesManagement: React.FC<CompaniesManagementProps> = ({ lang, onBack }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
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

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await api.getCompanies();
      setCompanies(response.companies);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch companies:', err);
      setError(lang === 'da' ? 'Kunne ikke hente virksomheder' : 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCompanies();
  }, []);

  const toggleVerification = async (id: string, currentStatus: boolean) => {
    setConfirmDialog({
      isOpen: true,
      title: currentStatus
        ? (lang === 'da' ? 'Fjern Verificering' : 'Remove Verification')
        : (lang === 'da' ? 'Bekræft Virksomhed' : 'Verify Company'),
      message: currentStatus
        ? (lang === 'da' ? 'Er du sikker på at du vil fjerne verifikationen fra denne virksomhed?' : 'Are you sure you want to remove verification from this company?')
        : (lang === 'da' ? 'Er du sikker på at du vil verificere denne virksomhed?' : 'Are you sure you want to verify this company?'),
      isDestructive: currentStatus,
      onConfirm: async () => {
        setIsSaving(true);
        try {
          await api.verifyCompany(id, !currentStatus);
          setCompanies(prev => prev.map(c =>
            c.id === id ? { ...c, isVerified: !currentStatus } : c
          ));
          toast.success(lang === 'da' ? 'Status opdateret' : 'Status updated');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          toast.error(lang === 'da' ? 'Kunne ikke opdatere verifikation' : 'Failed to update verification');
        } finally {
          setIsSaving(false);
          setShowActionsMenu(null);
        }
      }
    });
  };

  const handleDeleteCompany = async (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: lang === 'da' ? 'Slet Virksomhed' : 'Delete Company',
      message: lang === 'da'
        ? `Er du sikker på at du vil slette ${name}? Dette kan ikke fortrydes.`
        : `Are you sure you want to delete ${name}? This action cannot be undone.`,
      isDestructive: true,
      onConfirm: async () => {
        setIsSaving(true);
        try {
          await api.deleteCompany(id);
          setCompanies(prev => prev.filter(c => c.id !== id));
          toast.success(lang === 'da' ? 'Virksomhed slettet' : 'Company deleted');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          toast.error(lang === 'da' ? 'Kunne ikke slette virksomhed' : 'Failed to delete company');
        } finally {
          setIsSaving(false);
          setShowActionsMenu(null);
        }
      }
    });
  };

  const handleViewDetails = async (company: Company) => {
    setSelectedCompany(company);
    setShowActionsMenu(null);
  };

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contactEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F]">
          {lang === 'da' ? 'Virksomhedsstyring' : 'Companies Management'}
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder={lang === 'da' ? 'Søg virksomheder...' : 'Search companies...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-nexus-accent"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Virksomhed' : 'Company'}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Plan' : 'Plan'}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Status' : 'Status'}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">{lang === 'da' ? 'Handlinger' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4">
                    <LoadingSkeleton variant="table" count={5} />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20">
                    <div className="flex flex-col items-center justify-center">
                      <Building2 size={48} className="text-gray-200 mb-4" />
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{lang === 'da' ? 'Ingen virksomheder fundet' : 'No companies found'}</h3>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(company => (
                  <tr
                    key={company.id}
                    onClick={() => handleViewDetails(company)}
                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                          <img src={company.logoUrl || 'https://via.placeholder.com/100?text=Logo'} alt={company.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-medium text-[#1D1D1F]">{company.name}</div>
                          <div className="text-xs text-gray-400">{company.contactEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${company.pricingTier === 'Gold' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {company.pricingTier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {company.isVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          {lang === 'da' ? 'Verificeret' : 'Verified'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          {lang === 'da' ? 'Afventer' : 'Pending'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <div className="relative">
                          <button
                            onClick={() => setShowActionsMenu(showActionsMenu === company.id ? null : company.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#1D1D1F] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                          {showActionsMenu === company.id && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-xl z-20 overflow-hidden">
                              {company.isVerified && (
                                <button
                                  onClick={() => toggleVerification(company.id, company.isVerified)}
                                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                >
                                  <XCircle size={16} className="text-red-500" />
                                  {lang === 'da' ? 'Fjern verificering' : 'Remove verification'}
                                </button>
                              )}
                              <button
                                onClick={() => handleViewDetails(company)}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                              >
                                <Edit2 size={16} className="text-nexus-accent" />
                                {lang === 'da' ? 'Rediger virksomhed' : 'Edit business'}
                              </button>
                              <div className="h-px bg-gray-100 my-1"></div>
                              <button
                                onClick={() => handleDeleteCompany(company.id, company.name)}
                                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                              >
                                <Trash2 size={16} />
                                {lang === 'da' ? 'Slet virksomhed' : 'Delete company'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 p-2 overflow-hidden">
                  <img src={selectedCompany.logoUrl || 'https://via.placeholder.com/100'} className="w-full h-full object-contain" alt="" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#1D1D1F]">
                    {selectedCompany.name}
                  </h3>
                  <p className="text-gray-500">{selectedCompany.contactEmail}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{lang === 'da' ? 'Status' : 'Status'}</p>
                  <p className={`font-bold text-base ${selectedCompany.isVerified ? 'text-green-600' : 'text-amber-500'}`}>
                    {selectedCompany.isVerified ? (lang === 'da' ? 'Verificeret' : 'Verified') : (lang === 'da' ? 'Afventer' : 'Pending')}
                  </p>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{lang === 'da' ? 'Plan' : 'Plan'}</p>
                  <p className="font-bold text-base text-purple-600">{selectedCompany.pricingTier}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{lang === 'da' ? 'Virksomhedsinfo' : 'Business Information'}</h4>
                <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
                  <div className="flex justify-between p-4 items-center">
                    <span className="text-sm text-gray-500 font-medium">{lang === 'da' ? 'Lokation' : 'Location'}</span>
                    <span className="text-sm font-bold text-[#1D1D1F]">{selectedCompany.location}</span>
                  </div>
                  <div className="flex justify-between p-4 items-center">
                    <span className="text-sm text-gray-500 font-medium">{lang === 'da' ? 'Kategori' : 'Category'}</span>
                    <span className="text-sm font-bold text-[#1D1D1F]">{selectedCompany.category}</span>
                  </div>
                  <div className="flex justify-between p-4 items-center">
                    <span className="text-sm text-gray-500 font-medium">{lang === 'da' ? 'Rating' : 'Rating'}</span>
                    <span className="text-sm font-bold text-[#1D1D1F]">{selectedCompany.rating} ({selectedCompany.reviewCount} anmeldelser)</span>
                  </div>
                </div>
              </div>

              {/* Action Strip */}
              <div className="flex gap-3 pt-6">
                {selectedCompany.isVerified && (
                  <button
                    onClick={() => toggleVerification(selectedCompany.id, selectedCompany.isVerified)}
                    className="flex-1 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg bg-amber-50 text-amber-700 hover:bg-amber-100 shadow-amber-200/50"
                  >
                    {lang === 'da' ? 'Fjern Verificering' : 'Remove Verification'}
                  </button>
                )}
                <button
                  onClick={() => handleDeleteCompany(selectedCompany.id, selectedCompany.name)}
                  className={`${selectedCompany.isVerified ? 'px-6' : 'flex-1'} py-4 bg-red-50 text-red-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2`}
                  title={lang === 'da' ? 'Slet virksomhed' : 'Delete company'}
                >
                  <Trash2 size={20} />
                  {!selectedCompany.isVerified && (lang === 'da' ? 'Slet Virksomhed' : 'Delete Company')}
                </button>
              </div>
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

export default CompaniesManagement;
