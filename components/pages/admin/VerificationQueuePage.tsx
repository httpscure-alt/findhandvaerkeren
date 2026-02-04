import * as React from 'react';
import { useState, useEffect } from 'react';
import { Language } from '../../../types';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Eye,
  X,
  Mail,
  AlertTriangle,
  MessageSquare,
  Search,
  Check,
  AlertCircle,
  FileSearch,
  ChevronRight
} from 'lucide-react';
import { api } from '../../../services/api';
import { useToast } from '../../../hooks/useToast';
import { LoadingSkeleton } from '../../common/LoadingSkeleton';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { ErrorState } from '../../common/ErrorState';

interface VerificationRequest {
  id: string;
  companyName: string;
  email: string;
  logoUrl?: string;
  reason: 'initial_registration' | 'document_update' | 'manual_review' | 'flagged';
  submittedAt: string;
  riskHint?: string;
  completeness: 'full' | 'partial' | 'missing_critical';
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  documents: { id: string; name: string; url: string; category: string }[];
  flags?: string[];
  cvrNumber?: string;
  address?: string;
}

const CHANGE_REASONS = [
  { id: 'missing_doc', label_da: 'Manglende dokument', label_en: 'Missing document' },
  { id: 'incorrect_info', label_da: 'Forkert information', label_en: 'Incorrect information' },
  { id: 'expired_license', label_da: 'Udløbet licens', label_en: 'Expired license' },
  { id: 'low_quality', label_da: 'Dårlig billedkvalitet', label_en: 'Low image quality' },
];

const REJECT_REASONS = [
  { id: 'fraudulent', label_da: 'Mistanke om svindel', label_en: 'Fraudulent activity suspected' },
  { id: 'business_inactive', label_da: 'Virksomhed ophørt', label_en: 'Business inactive' },
  { id: 'tos_violation', label_da: 'Overtrædelse af vilkår', label_en: 'ToS violation' },
  { id: 'unqualified', label_da: 'Ikke kvalificeret', label_en: 'Unqualified' },
];

const VerificationQueuePage: React.FC<{ lang: Language; onBack: () => void }> = ({ lang, onBack }) => {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modal states
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRequestChangesModal, setShowRequestChangesModal] = useState(false);

  // Selection states
  const [selectedReason, setSelectedReason] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const toast = useToast();
  const isDa = lang === 'da';

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // const data = await api.getVerificationQueue();
      // For now, simulating the response with the required data structure
      const mockData: VerificationRequest[] = [
        {
          id: '1',
          companyName: 'Mesterbyg ApS',
          email: 'info@mesterbyg.dk',
          logoUrl: 'https://picsum.photos/id/1/200/200',
          reason: 'initial_registration',
          submittedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
          riskHint: isDa ? 'Alle dokumenter indsendt' : 'All documents submitted',
          completeness: 'full',
          status: 'pending',
          documents: [
            { id: 'd1', name: 'Erhvervsforsikring', url: '#', category: 'Insurance' },
            { id: 'd2', name: 'CVR Bevis', url: '#', category: 'Legal' }
          ],
          cvrNumber: '12345678',
          address: 'Vesterbrogade 1, 1620 København'
        },
        {
          id: '2',
          companyName: 'Flash El-Service',
          email: 'admin@flashel.dk',
          logoUrl: 'https://picsum.photos/id/2/200/200',
          reason: 'flagged',
          submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          riskHint: isDa ? 'Uoverensstemmelse i navn' : 'Name mismatch detected',
          completeness: 'partial',
          status: 'pending',
          flags: ['Name check failed', 'Previous rejection exists'],
          documents: [
            { id: 'd3', name: 'Identitetsbevis', url: '#', category: 'Identity' }
          ]
        },
        {
          id: '3',
          companyName: 'Nordic Plumbing',
          email: 'contact@nordicplumbing.com',
          logoUrl: 'https://picsum.photos/id/3/200/200',
          reason: 'document_update',
          submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          riskHint: isDa ? 'Mangler svendebrev' : 'Missing business license',
          completeness: 'missing_critical',
          status: 'pending',
          documents: []
        }
      ];
      setRequests(mockData);
    } catch (err: any) {
      setError(err.message || 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  const getReasonLabel = (reason: VerificationRequest['reason']) => {
    switch (reason) {
      case 'initial_registration': return isDa ? 'Førstegangsregistrering' : 'Initial registration';
      case 'document_update': return isDa ? 'Dokumentopdatering' : 'Document update';
      case 'manual_review': return isDa ? 'Manuel gennemgang' : 'Manual review required';
      case 'flagged': return isDa ? 'Flaget af systemet' : 'Flagged by system';
      default: return reason;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    let interval = seconds / 3600;
    if (interval > 1) return isDa ? `Indsendt ${Math.floor(interval)}t siden` : `Submitted ${Math.floor(interval)}h ago`;
    interval = seconds / 60;
    if (interval > 1) return isDa ? `Indsendt ${Math.floor(interval)}m siden` : `Submitted ${Math.floor(interval)}m ago`;
    return isDa ? 'Lige nu' : 'Just now';
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setProcessingId(selectedRequest.id);
    try {
      await api.approveVerification(selectedRequest.id);
      // await logActivity('approved_verification', selectedRequest.id, adminNote);
      toast.success(isDa ? 'Virksomhed verificeret' : 'Company verified');
      fetchRequests();
      setShowApproveConfirm(false);
      setSelectedRequest(null);
      setIsDetailPanelOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !selectedReason) return;
    setProcessingId(selectedRequest.id);
    try {
      await api.rejectVerification(selectedRequest.id, `${selectedReason}: ${adminNote}`);
      toast.success(isDa ? 'Anmodning afvist' : 'Request rejected');
      fetchRequests();
      setShowRejectModal(false);
      setSelectedRequest(null);
      setIsDetailPanelOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRequestChanges = async () => {
    if (!selectedRequest || !selectedReason) return;
    setProcessingId(selectedRequest.id);
    try {
      // await api.requestChanges(selectedRequest.id, selectedReason, adminNote);
      toast.success(isDa ? 'Anmodning om ændringer sendt' : 'Changes requested');
      fetchRequests();
      setShowRequestChangesModal(false);
      setSelectedRequest(null);
      setIsDetailPanelOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const isOld = (dateString: string) => {
    const hours = (new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60);
    return hours > 24;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
              <X size={20} />
            </button>
            <h1 className="text-lg font-bold text-[#1D1D1F]">
              {isDa ? 'Verificeringskø' : 'Verification Queue'}
            </h1>
            <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
              {requests.length} {isDa ? 'afventer' : 'pending'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder={isDa ? 'Søg i kø...' : 'Search queue...'}
                className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#1D1D1F]/5 w-64"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {loading ? (
          <LoadingSkeleton variant="table" count={5} />
        ) : error ? (
          <ErrorState title="Error" message={error} />
        ) : (
          <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{isDa ? 'Virksomhed' : 'Company Identity'}</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{isDa ? 'Årsag' : 'Reason'}</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{isDa ? 'Indsendt' : 'Submitted'}</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{isDa ? 'Risiko / Status' : 'Risk / Status'}</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">{isDa ? 'Handlinger' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.map((request) => (
                  <tr key={request.id} className={`group hover:bg-gray-50/50 transition-colors ${isOld(request.submittedAt) ? 'bg-amber-50/10' : ''}`}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                          {request.logoUrl ? (
                            <img src={request.logoUrl} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <FileSearch className="w-full h-full p-2.5 text-gray-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#1D1D1F] truncate">{request.companyName}</p>
                          <p className="text-xs text-gray-400 truncate">{request.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`px-2.5 py-1 rounded-lg text-[11px] font-bold w-fit ${request.reason === 'flagged' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {getReasonLabel(request.reason)}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <Clock size={14} className={isOld(request.submittedAt) ? 'text-amber-500' : ''} />
                        <span className={isOld(request.submittedAt) ? 'text-amber-600 font-bold' : ''}>
                          {getTimeAgo(request.submittedAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <p className={`text-xs font-bold flex items-center gap-1.5 ${request.completeness === 'missing_critical' ? 'text-red-600' :
                            request.completeness === 'partial' ? 'text-amber-600' : 'text-green-600'
                          }`}>
                          {request.completeness === 'missing_critical' && <AlertCircle size={14} />}
                          {request.completeness === 'full' && <CheckCircle size={14} />}
                          {request.riskHint}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setSelectedRequest(request); setIsDetailPanelOpen(true); }}
                          className="p-2 text-gray-400 hover:text-[#1D1D1F] hover:bg-gray-100 rounded-lg transition-all"
                          title={isDa ? 'Se detaljer' : 'View verification details'}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => { setSelectedRequest(request); setShowApproveConfirm(true); }}
                          disabled={request.completeness === 'missing_critical'}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-20"
                          title={isDa ? 'Godkend' : 'Approve'}
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => { setSelectedRequest(request); setShowRequestChangesModal(true); }}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title={isDa ? 'Anmod om ændringer' : 'Request additional information'}
                        >
                          <MessageSquare size={18} />
                        </button>
                        <button
                          onClick={() => { setSelectedRequest(request); setShowRejectModal(true); }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title={isDa ? 'Afvis' : 'Reject'}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {requests.length === 0 && (
              <div className="py-20 text-center">
                <ShieldCheck size={48} className="mx-auto text-gray-200 mb-4" />
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{isDa ? 'Køen er tom' : 'Queue is empty'}</h3>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Detail Panel Overlay */}
      {isDetailPanelOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsDetailPanelOpen(false)} />
          <div className="relative w-full max-w-xl bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 p-1">
                  <img src={selectedRequest.logoUrl} className="w-full h-full object-cover rounded-xl" alt="" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1D1D1F]">{selectedRequest.companyName}</h2>
                  <p className="text-xs text-gray-400">{selectedRequest.email}</p>
                </div>
              </div>
              <button onClick={() => setIsDetailPanelOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {/* Checklist */}
              <section>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Verification Checklist</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                    <div className={`p-1.5 rounded-full ${selectedRequest.cvrNumber ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {selectedRequest.cvrNumber ? <Check size={12} /> : <AlertCircle size={12} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold">Business Registration (CVR)</p>
                      <p className="text-[10px] text-gray-400">{selectedRequest.cvrNumber || 'Missing'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                    <div className={`p-1.5 rounded-full ${selectedRequest.documents.length >= 2 ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                      {selectedRequest.documents.length >= 2 ? <Check size={12} /> : <AlertCircle size={12} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold">Minimum 2 documents required</p>
                      <p className="text-[10px] text-gray-400">{selectedRequest.documents.length} submitted</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* System Flags */}
              {selectedRequest.flags && selectedRequest.flags.length > 0 && (
                <section>
                  <h3 className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-4">System Concerns</h3>
                  <div className="space-y-2">
                    {selectedRequest.flags.map((flag, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-red-50/50 rounded-2xl border border-red-100">
                        <AlertTriangle size={16} className="text-red-500" />
                        <span className="text-xs font-medium text-red-700">{flag}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Documents */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Submitted Documents</h3>
                  <span className="text-[10px] font-bold text-gray-400">{selectedRequest.documents.length} Files</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {selectedRequest.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#1D1D1F]/10 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-[#1D1D1F] transition-colors">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1D1D1F]">{doc.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest">{doc.category}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-[#1D1D1F] transition-colors" />
                    </a>
                  ))}
                  {selectedRequest.documents.length === 0 && (
                    <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-xs text-gray-400">No documents provided</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Panel Actions */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <button
                onClick={() => setShowApproveConfirm(true)}
                disabled={selectedRequest.completeness === 'missing_critical'}
                className="flex-1 px-4 py-3 bg-[#1D1D1F] text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-[#1D1D1F]/20 transition-all disabled:opacity-20"
              >
                {isDa ? 'Godkend nu' : 'Approve Submission'}
              </button>
              <button
                onClick={() => setShowRequestChangesModal(true)}
                className="px-4 py-3 bg-white border border-gray-200 text-[#1D1D1F] rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
              >
                {isDa ? 'Ændringer' : 'Request Changes'}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decision Modals */}

      {/* APPROVE MODAL */}
      <ConfirmDialog
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={handleApprove}
        title={isDa ? 'Godkend verificering?' : 'Approve verification?'}
        message={isDa
          ? 'Virksomheden vil modtage Verified-status med det samme. Dette vil blive logget.'
          : 'Approve this company and grant verified status? This action will be logged.'}
        isLoading={!!processingId}
        lang={lang}
      />

      {/* REQUEST CHANGES MODAL */}
      {showRequestChangesModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1D1D1F]/80 backdrop-blur-sm" onClick={() => setShowRequestChangesModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-[#1D1D1F] mb-2">{isDa ? 'Anmod om ændringer' : 'Request Changes'}</h2>
            <p className="text-sm text-gray-500 mb-8">{isDa ? 'Vælg årsag til at anmode om rettelser.' : 'Identify what the company needs to correct.'}</p>

            <div className="space-y-3 mb-8">
              {CHANGE_REASONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedReason(r.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl border text-sm font-medium transition-all ${selectedReason === r.id ? 'bg-[#1D1D1F] border-[#1D1D1F] text-white shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-200'
                    }`}
                >
                  {isDa ? r.label_da : r.label_en}
                </button>
              ))}
            </div>

            <div className="mb-8">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Note to partner (Optional)</label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#1D1D1F]/5 resize-none"
                placeholder={isDa ? 'Skriv uddybning her...' : 'Explain what is missing...'}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRequestChangesModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold"
              >
                {isDa ? 'Annuller' : 'Cancel'}
              </button>
              <button
                onClick={handleRequestChanges}
                disabled={!selectedReason || !!processingId}
                className="flex-1 px-4 py-3 bg-[#1D1D1F] text-white rounded-xl text-sm font-bold disabled:opacity-20"
              >
                {isDa ? 'Send anmodning' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-red-900/40 backdrop-blur-sm" onClick={() => setShowRejectModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl border border-red-100">
            <h2 className="text-2xl font-bold text-red-600 mb-2">{isDa ? 'Afvis anmodning?' : 'Reject Request?'}</h2>
            <p className="text-sm text-gray-500 mb-8">{isDa ? 'Dette vil nægte verificeret status. En grund er påkrævet.' : 'This action will deny verified status. A reason is mandatory.'}</p>

            <div className="space-y-2 mb-8">
              {REJECT_REASONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedReason(r.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl border text-sm font-medium transition-all ${selectedReason === r.id ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200' : 'bg-red-50/30 border-red-50 text-red-700 hover:border-red-100'
                    }`}
                >
                  {isDa ? r.label_da : r.label_en}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold"
              >
                {isDa ? 'Annuller' : 'Cancel'}
              </button>
              <button
                onClick={handleReject}
                disabled={!selectedReason || !!processingId}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl text-sm font-bold disabled:opacity-20"
              >
                {isDa ? 'Bekræft afvisning' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationQueuePage;


