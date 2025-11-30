import React, { useState } from 'react';
import { Company, Language, VerificationStatus } from '../../../types';
import { ShieldCheck, CheckCircle, Clock, X, Upload, FileText } from 'lucide-react';
import { api } from '../../../services/api';

interface VerificationSectionProps {
  company: Company;
  lang: Language;
  onUpdate: (company: Company) => void;
}

const VerificationSection: React.FC<VerificationSectionProps> = ({ company, lang, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    cvrNumber: company.cvrNumber || '',
    vatNumber: company.vatNumber || '',
    legalName: company.legalName || '',
    businessAddress: company.businessAddress || '',
    cvrLookupUrl: company.cvrLookupUrl || '',
    permitType: company.permitType || '',
    permitIssuer: company.permitIssuer || '',
    permitNumber: company.permitNumber || '',
    permitDocuments: company.permitDocuments || [],
  });

  const getStatusDisplay = (status?: VerificationStatus) => {
    switch (status) {
      case 'verified':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: lang === 'da' ? 'Verificeret' : 'Verified',
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: lang === 'da' ? 'Afventer gennemgang' : 'Pending Review',
        };
      default:
        return {
          icon: X,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: lang === 'da' ? 'Ikke verificeret' : 'Unverified',
        };
    }
  };

  const statusDisplay = getStatusDisplay(company.verificationStatus);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save verification data - status will be set to "pending" if verification requested
      await api.saveOnboardingStep4({
        ...formData,
        requestVerification: company.verificationStatus !== 'verified' && (formData.cvrNumber && formData.permitDocuments.length > 0),
      });
      
      // Update local company data
      const updated = {
        ...company,
        ...formData,
        verificationStatus: (company.verificationStatus === 'verified' ? 'verified' : 
          (formData.cvrNumber && formData.permitDocuments.length > 0 ? 'pending' : 'unverified')) as VerificationStatus,
      };
      onUpdate(updated);
      setIsEditing(false);
    } catch (error) {
      alert(lang === 'da' ? 'Kunne ikke gemme verificeringsoplysninger' : 'Failed to save verification info');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-nexus-accent" size={24} />
            <h2 className="text-2xl font-bold text-[#1D1D1F]">
              {lang === 'da' ? 'Virksomhedsverificering' : 'Business Verification'}
            </h2>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            {lang === 'da' ? 'Rediger' : 'Edit'}
          </button>
        </div>

        {/* Status */}
        <div className={`mb-6 p-4 rounded-xl border ${statusDisplay.bg} ${statusDisplay.border}`}>
          <div className="flex items-center gap-2">
            <statusDisplay.icon className={statusDisplay.color} size={20} />
            <span className={`font-medium ${statusDisplay.color}`}>{statusDisplay.text}</span>
          </div>
          {company.verificationStatus === 'pending' && (
            <p className="text-sm text-gray-600 mt-2">
              {lang === 'da' 
                ? 'Din verificeringsanmodning afventer gennemgang. Du vil modtage en e-mail, når den er godkendt.'
                : 'Your verification request is pending review. You will receive an email when it is approved.'}
            </p>
          )}
        </div>

        {/* Verification Details */}
        <div className="space-y-4">
          {company.cvrNumber && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                {lang === 'da' ? 'CVR-nummer' : 'CVR Number'}
              </label>
              <p className="text-sm text-[#1D1D1F]">{company.cvrNumber}</p>
            </div>
          )}
          {company.legalName && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                {lang === 'da' ? 'Juridisk navn' : 'Legal Name'}
              </label>
              <p className="text-sm text-[#1D1D1F]">{company.legalName}</p>
            </div>
          )}
          {company.businessAddress && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                {lang === 'da' ? 'Forretningsadresse' : 'Business Address'}
              </label>
              <p className="text-sm text-[#1D1D1F]">{company.businessAddress}</p>
            </div>
          )}
          {company.permitType && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                {lang === 'da' ? 'Tilladelsestype' : 'Permit Type'}
              </label>
              <p className="text-sm text-[#1D1D1F]">{company.permitType}</p>
            </div>
          )}
          {company.permitDocuments && company.permitDocuments.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                {lang === 'da' ? 'Tilladelsesdokumenter' : 'Permit Documents'}
              </label>
              <div className="space-y-2">
                {company.permitDocuments.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <FileText size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-700">Document {idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#1D1D1F]">
          {lang === 'da' ? 'Rediger Verificering' : 'Edit Verification'}
        </h2>
        <button
          onClick={() => setIsEditing(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-nexus-text mb-2">
            {lang === 'da' ? 'CVR-nummer' : 'CVR Number'} *
          </label>
          <input
            type="text"
            required
            value={formData.cvrNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 8);
              setFormData(prev => ({ ...prev, cvrNumber: value }));
            }}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent/20"
            placeholder="12345678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-nexus-text mb-2">
            {lang === 'da' ? 'Juridisk navn' : 'Legal Company Name'}
          </label>
          <input
            type="text"
            value={formData.legalName}
            onChange={(e) => setFormData(prev => ({ ...prev, legalName: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent/20"
            placeholder={company.name}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-nexus-text mb-2">
            {lang === 'da' ? 'Forretningsadresse' : 'Business Address'}
          </label>
          <input
            type="text"
            value={formData.businessAddress}
            onChange={(e) => setFormData(prev => ({ ...prev, businessAddress: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent/20"
            placeholder={lang === 'da' ? 'Gade, Postnummer, By' : 'Street, Postal Code, City'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-nexus-text mb-2">
            {lang === 'da' ? 'Tilladelsestype' : 'Permit Type'}
          </label>
          <select
            value={formData.permitType}
            onChange={(e) => setFormData(prev => ({ ...prev, permitType: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent/20"
          >
            <option value="">{lang === 'da' ? 'Vælg type' : 'Select type'}</option>
            <option value="Electrician">{lang === 'da' ? 'Elektriker' : 'Electrician'}</option>
            <option value="Plumbing">{lang === 'da' ? 'Rørlægger' : 'Plumbing'}</option>
            <option value="Construction">{lang === 'da' ? 'Byggearbejde' : 'Construction'}</option>
            <option value="Painting">{lang === 'da' ? 'Maler' : 'Painting'}</option>
            <option value="General">{lang === 'da' ? 'Generel entreprenør' : 'General Contractor'}</option>
            <option value="Other">{lang === 'da' ? 'Andet' : 'Other'}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-nexus-text mb-2">
            {lang === 'da' ? 'Udsteder' : 'Issuing Authority'}
          </label>
          <input
            type="text"
            value={formData.permitIssuer}
            onChange={(e) => setFormData(prev => ({ ...prev, permitIssuer: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent/20"
            placeholder={lang === 'da' ? 'F.eks. Sikkerhedsstyrelsen' : 'Ex. Safety Authority'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-nexus-text mb-2">
            {lang === 'da' ? 'Tilladelsesdokumenter' : 'Permit Documents'} *
          </label>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              const urls = files.map(f => URL.createObjectURL(f));
              setFormData(prev => ({ ...prev, permitDocuments: [...prev.permitDocuments, ...urls] }));
            }}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent/20"
          />
          {formData.permitDocuments.length > 0 && (
            <div className="mt-2 space-y-1">
              {formData.permitDocuments.map((url, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                  <span className="text-gray-700">Document {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, permitDocuments: prev.permitDocuments.filter((_, i) => i !== idx) }))}
                    className="text-red-500 hover:text-red-700"
                  >
                    {lang === 'da' ? 'Fjern' : 'Remove'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-6 py-2 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            {lang === 'da' ? 'Annuller' : 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={isSaving || !formData.cvrNumber || formData.permitDocuments.length === 0}
            className="px-6 py-2 bg-[#1D1D1F] text-white rounded-xl font-medium hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving 
              ? (lang === 'da' ? 'Gemmer...' : 'Saving...')
              : (lang === 'da' ? 'Gem og anmod om verificering' : 'Save & Request Verification')
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default VerificationSection;
