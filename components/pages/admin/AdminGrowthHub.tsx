import React, { useState, useEffect } from 'react';
import {
    Zap,
    Search,
    Filter,
    ExternalLink,
    CheckCircle2,
    Clock,
    ArrowLeft,
    TrendingUp,
    Globe,
    MousePointer2,
    Calendar,
    Building2,
    Check,
    X,
    Loader2,
    BarChart3,
    ArrowUpRight
} from 'lucide-react';
import { Language } from '../../../types';
import { api } from '../../../services/api';
import { useToast } from '../../../hooks/useToast';

interface AdminGrowthHubProps {
    lang: Language;
    onBack: () => void;
}

const AdminGrowthHub: React.FC<AdminGrowthHubProps> = ({ lang, onBack }) => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
    const toast = useToast();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await api.getGrowthRequests();
            setRequests(data.requests);
        } catch (error) {
            console.error('Failed to fetch growth requests:', error);
            toast.error(lang === 'da' ? 'Kunne ikke hente anmodninger' : 'Failed to fetch requests');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await api.updateGrowthRequestStatus(id, status);
            toast.success(lang === 'da' ? 'Status opdateret' : 'Status updated');
            fetchRequests();
        } catch (error) {
            toast.error(lang === 'da' ? 'Kunne ikke opdatere status' : 'Failed to update status');
        }
    };
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [metricsForm, setMetricsForm] = useState({
        impressions: '',
        clicks: '',
        conversions: '',
        trend: ''
    });
    const [logForm, setLogForm] = useState({
        title: '',
        description: '',
        type: 'seo' as 'seo' | 'ads'
    });

    const handleUpdateMetrics = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCompanyId) return;

        try {
            const metrics = {
                impressions: parseInt(metricsForm.impressions),
                clicks: parseInt(metricsForm.clicks),
                conversions: parseInt(metricsForm.conversions),
                trend: metricsForm.trend.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))
            };
            await api.updatePerformanceMetrics(selectedCompanyId, metrics);
            toast.success(isDa ? 'Metrics opdateret' : 'Metrics updated');
            setSelectedCompanyId(null);
            setMetricsForm({ impressions: '', clicks: '', conversions: '', trend: '' });
        } catch (error) {
            toast.error(isDa ? 'Kunne ikke opdatere metrics' : 'Failed to update metrics');
        }
    };

    const handleAddLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCompanyId) return;

        try {
            await api.addOptimizationLog(selectedCompanyId, logForm);
            toast.success(isDa ? 'Arbejdshistorik opdateret' : 'Optimization log added');
            setSelectedCompanyId(null);
            setLogForm({ title: '', description: '', type: 'seo' });
        } catch (error) {
            toast.error(isDa ? 'Kunne ikke tilføje historik' : 'Failed to add log');
        }
    };

    const openMetricsModal = (companyId: string) => {
        setSelectedCompanyId(companyId);
        // Optionally pre-fill if we had existing metrics
    };

    const filteredRequests = filter === 'ALL'
        ? requests
        : requests.filter(r => r.status === filter);

    const isDa = lang === 'da';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-nexus-subtext hover:text-[#1D1D1F] transition-colors mb-4 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span>{isDa ? 'Tilbage til Dashboard' : 'Back to Dashboard'}</span>
                </button>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-[#1D1D1F]">
                                {isDa ? 'Vækst Center Management' : 'Growth Hub Management'}
                            </h1>
                            <p className="text-nexus-subtext">
                                {isDa
                                    ? 'Administrer SEO og Google Ads anmodninger fra partnere'
                                    : 'Manage SEO and Google Ads requests from partners'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                        {(['ALL', 'PENDING', 'COMPLETED'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                    ? 'bg-[#1D1D1F] text-white shadow-md'
                                    : 'text-nexus-subtext hover:text-[#1D1D1F]'
                                    }`}
                            >
                                {f === 'ALL' ? (isDa ? 'Alle' : 'All') : f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
                    <p className="text-nexus-subtext">{isDa ? 'Henter anmodninger...' : 'Fetching requests...'}</p>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <Filter size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-[#1D1D1F] mb-1">
                        {isDa ? 'Ingen anmodninger fundet' : 'No requests found'}
                    </h3>
                    <p className="text-nexus-subtext">
                        {isDa ? 'Der er ingen anmodninger i denne kategori.' : 'There are no requests in this category.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredRequests.map((req) => (
                        <div key={req.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 md:p-8">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${req.status === 'PENDING'
                                            ? 'bg-amber-50 text-amber-600'
                                            : 'bg-green-50 text-green-600'
                                            }`}>
                                            {req.status}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-nexus-subtext">
                                            <Calendar size={14} />
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100">
                                            {req.company?.logoUrl ? (
                                                <img src={req.company.logoUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Building2 className="text-gray-400" size={24} />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-[#1D1D1F]">{req.company?.name || 'Unknown Partner'}</h3>
                                            <p className="text-sm text-nexus-subtext flex items-center gap-2">
                                                {req.company?.contactEmail}
                                                {req.company?.website && (
                                                    <a href={`https://${req.company.website}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 flex items-center gap-0.5 hover:underline">
                                                        <ExternalLink size={12} />
                                                        {req.company.website}
                                                    </a>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {req.services.map((s: string) => (
                                            <span key={s} className="px-4 py-1.5 bg-gray-50 rounded-xl text-sm font-bold text-[#1D1D1F] flex items-center gap-2 border border-gray-100">
                                                {s === 'seo' ? <Globe size={14} className="text-blue-500" /> : <MousePointer2 size={14} className="text-purple-500" />}
                                                {s === 'seo' ? 'SEO' : 'Google Ads'}
                                            </span>
                                        ))}
                                    </div>
                                    {req.details && (
                                        <div className="p-4 bg-gray-50 rounded-2xl text-sm space-y-2 border border-gray-100">
                                            {req.details.objectives && (
                                                <p><span className="font-bold text-[#1D1D1F]">{isDa ? 'Mål:' : 'Objectives:'}</span> {req.details.objectives}</p>
                                            )}
                                            {req.details.budget && (
                                                <p><span className="font-bold text-[#1D1D1F]">{isDa ? 'Budget:' : 'Budget:'}</span> {req.details.budget} DKK</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 min-w-[200px]">
                                    {req.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(req.id, 'COMPLETED')}
                                                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <Check size={18} />
                                                {isDa ? 'Markér som udført' : 'Mark Completed'}
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(req.id, 'CANCELLED')}
                                                className="w-full px-6 py-3 bg-white border border-gray-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                            >
                                                <X size={18} />
                                                {isDa ? 'Afvis' : 'Reject'}
                                            </button>
                                        </>
                                    )}
                                    {req.status === 'COMPLETED' && (
                                        <div className="flex items-center justify-center gap-2 text-green-600 font-bold bg-green-50 px-6 py-3 rounded-xl border border-green-100 mb-2">
                                            <CheckCircle2 size={18} />
                                            {isDa ? 'Udført' : 'Completed'}
                                        </div>
                                    )}
                                    {(req.status === 'PENDING' || req.status === 'COMPLETED') && (
                                        <button
                                            onClick={() => openMetricsModal(req.companyId)}
                                            className="w-full px-6 py-3 bg-white border border-indigo-200 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <BarChart3 size={18} />
                                            {isDa ? 'Opdater Tal / Arbejde' : 'Update Stats / Work'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Metrics & Log Update Form (Inline) */}
                            {selectedCompanyId === req.companyId && (
                                <div className="mt-8 pt-8 border-t border-gray-100 animate-in slide-in-from-top-4 duration-300">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        {/* Left: Performance Metrics */}
                                        <div className="space-y-6">
                                            <h4 className="font-bold text-[#1D1D1F] flex items-center gap-2">
                                                <TrendingUp size={18} className="text-indigo-500" />
                                                {isDa ? 'Performance Tal' : 'Performance Stats'}
                                            </h4>
                                            <form onSubmit={handleUpdateMetrics} className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-nexus-subtext uppercase tracking-wider ml-1">{isDa ? 'Eksponeringer' : 'Impressions'}</label>
                                                        <input type="number" required value={metricsForm.impressions} onChange={(e) => setMetricsForm({ ...metricsForm, impressions: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none" placeholder="12400" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-nexus-subtext uppercase tracking-wider ml-1">{isDa ? 'Klik' : 'Clicks'}</label>
                                                        <input type="number" required value={metricsForm.clicks} onChange={(e) => setMetricsForm({ ...metricsForm, clicks: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none" placeholder="842" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-nexus-subtext uppercase tracking-wider ml-1">{isDa ? 'Konverteringer' : 'Conversions'}</label>
                                                        <input type="number" required value={metricsForm.conversions} onChange={(e) => setMetricsForm({ ...metricsForm, conversions: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none" placeholder="24" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-nexus-subtext uppercase tracking-wider ml-1">{isDa ? 'Trend (komma)' : 'Trend (comma)'}</label>
                                                        <input type="text" required value={metricsForm.trend} onChange={(e) => setMetricsForm({ ...metricsForm, trend: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none" placeholder="40, 60, 45..." />
                                                    </div>
                                                </div>
                                                <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 italic transition-all active:scale-95">
                                                    <ArrowUpRight size={18} />
                                                    {isDa ? 'Opdater Tal' : 'Update Stats'}
                                                </button>
                                            </form>
                                        </div>

                                        {/* Right: Optimization Work Log */}
                                        <div className="space-y-6">
                                            <h4 className="font-bold text-[#1D1D1F] flex items-center gap-2">
                                                <ExternalLink size={18} className="text-purple-500" />
                                                {isDa ? 'Hvad er blevet lavet? (SEO Work)' : 'What has been optimized?'}
                                            </h4>
                                            <form onSubmit={handleAddLog} className="space-y-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-nexus-subtext uppercase tracking-wider ml-1">{isDa ? 'Overskrift' : 'Work Title'}</label>
                                                    <input type="text" required value={logForm.title} onChange={(e) => setLogForm({ ...logForm, title: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none" placeholder={isDa ? 'F.eks. Teknisk SEO Optimeret' : 'e.g. Meta Tag Optimization'} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-nexus-subtext uppercase tracking-wider ml-1">{isDa ? 'Beskrivelse' : 'Description of work'}</label>
                                                    <textarea required rows={2} value={logForm.description} onChange={(e) => setLogForm({ ...logForm, description: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none resize-none" placeholder={isDa ? 'Detaljer om hvad i har lavet...' : 'Details about the optimizations...'} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-nexus-subtext uppercase tracking-wider ml-1">{isDa ? 'Type' : 'Service'}</label>
                                                        <select value={logForm.type} onChange={(e) => setLogForm({ ...logForm, type: e.target.value as any })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none">
                                                            <option value="seo">SEO</option>
                                                            <option value="ads">Google Ads</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex items-end">
                                                        <button type="submit" className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-100 italic transition-all active:scale-95">
                                                            <CheckCircle2 size={18} />
                                                            {isDa ? 'Post Update' : 'Post Update'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                    <div className="flex justify-center mt-8 pt-4 border-t border-gray-50">
                                        <button onClick={() => setSelectedCompanyId(null)} className="text-sm font-bold text-nexus-subtext hover:text-[#1D1D1F]">
                                            {isDa ? 'Luk værktøj' : 'Close tools'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminGrowthHub;
