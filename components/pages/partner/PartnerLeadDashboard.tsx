import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { Briefcase, MapPin, DollarSign, Calendar, FileText, Image as ImageIcon, Send, X, Mail, Phone, User, Copy, Check } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';

interface Lead {
    id: string;
    status: string;
    createdAt: string;
    job: {
        id: string;
        title: string;
        description: string;
        category: string;
        postalCode: string;
        images: string[];
        createdAt: string;
    };
    customer?: {
        name: string;
        email: string;
        phone: string;
        isGuest: boolean;
    };
    quotes: any[];
}

export default function PartnerLeadDashboard() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'quoted'>('all');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [showQuoteModal, setShowQuoteModal] = useState(false);

    useEffect(() => {
        loadLeads();
    }, []);

    const loadLeads = async () => {
        setLoading(true);
        try {
            const res = await api.getPartnerLeads();
            setLeads(res.leads);
        } catch (err) {
            console.error('Failed to load leads:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredLeads = leads.filter(lead => {
        if (filter === 'all') return true;
        if (filter === 'pending') return lead.status === 'pending';
        if (filter === 'quoted') return lead.status === 'quoted';
        return true;
    });

    const handleSubmitQuote = (lead: Lead) => {
        setSelectedLead(lead);
        setShowQuoteModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Leads</h1>
                    <p className="text-gray-600 mt-2">Job requests matched to your business</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                            ? 'bg-primary text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        All ({leads.length})
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'pending'
                            ? 'bg-primary text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Pending ({leads.filter(l => l.status === 'pending').length})
                    </button>
                    <button
                        onClick={() => setFilter('quoted')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'quoted'
                            ? 'bg-primary text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Quoted ({leads.filter(l => l.status === 'quoted').length})
                    </button>
                </div>

                {/* Leads List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading leads...</p>
                    </div>
                ) : filteredLeads.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads yet</h3>
                        <p className="text-gray-600">
                            {filter === 'all'
                                ? "You'll see job requests here when customers need your services."
                                : `No ${filter} leads at the moment.`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredLeads.map((lead) => (
                            <div key={lead.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">

                                {/* Lead Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">{lead.job.title}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${lead.status === 'pending'
                                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                : lead.status === 'quoted'
                                                    ? 'bg-green-50 text-green-700 border-green-100'
                                                    : 'bg-gray-50 text-gray-600 border-gray-100'
                                                }`}>
                                                {lead.status === 'pending' ? 'Pending' : (lead.status === 'quoted' ? 'Quoted' : lead.status)}
                                            </span>
                                        </div>

                                        {/* Job Meta */}
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                <span>DK-{lead.job.postalCode}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(lead.job.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {lead.job.images.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <ImageIcon className="w-4 h-4" />
                                                    <span>{lead.job.images.length} photo{lead.job.images.length > 1 ? 's' : ''}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Job Description */}
                                <p className="text-gray-700 mb-4 line-clamp-2">{lead.job.description}</p>

                                {/* Images Preview */}
                                {lead.job.images.length > 0 && (
                                    <div className="flex gap-2 mb-4 overflow-x-auto">
                                        {lead.job.images.slice(0, 3).map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`Job image ${idx + 1}`}
                                                className="w-20 h-20 object-cover rounded-lg"
                                            />
                                        ))}
                                        {lead.job.images.length > 3 && (
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 text-sm font-medium">
                                                +{lead.job.images.length - 3}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Customer Contact Info */}
                                {lead.customer && (
                                    <CustomerContactCard customer={lead.customer} />
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-4 border-t">
                                    {lead.status === 'pending' ? (
                                        <button
                                            onClick={() => handleSubmitQuote(lead)}
                                            className="btn btn-primary flex items-center gap-2"
                                        >
                                            <Send className="w-4 h-4" />
                                            Submit Quote
                                        </button>
                                    ) : (
                                        <div className="text-sm text-gray-600">
                                            ✓ Quote submitted on {new Date(lead.quotes[0]?.createdAt || lead.createdAt).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Submit Quote Modal */}
            {showQuoteModal && selectedLead && (
                <SubmitQuoteModal
                    lead={selectedLead}
                    onClose={() => {
                        setShowQuoteModal(false);
                        setSelectedLead(null);
                    }}
                    onSuccess={() => {
                        setShowQuoteModal(false);
                        setSelectedLead(null);
                        loadLeads(); // Refresh leads
                    }}
                />
            )}
        </div>
    );
}

// Submit Quote Modal Component
interface SubmitQuoteModalProps {
    lead: Lead;
    onClose: () => void;
    onSuccess: () => void;
}

function SubmitQuoteModal({ lead, onClose, onSuccess }: SubmitQuoteModalProps) {
    const [price, setPrice] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.submitQuote(lead.id, {
                price: parseFloat(price),
                message,
            });
            toast.success('Quote submitted successfully!');
            onSuccess();
        } catch (err) {
            console.error('Failed to submit quote:', err);
            toast.error('Failed to submit quote. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Submit Quote</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Job Details */}
                <div className="p-6 bg-gray-50 border-b">
                    <h3 className="font-semibold text-gray-900 mb-2">{lead.job.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{lead.job.description}</p>
                    <div className="flex gap-4 text-sm text-gray-600">
                        <span>📍 DK-{lead.job.postalCode}</span>
                    </div>
                </div>

                {/* Quote Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Price (DKK) *
                        </label>
                        <input
                            type="number"
                            required
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="e.g. 15000"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Proposal / Message *
                        </label>
                        <textarea
                            required
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                            placeholder="Describe your approach, timeline, what's included..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Submitting...' : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Submit Quote
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Customer Contact Card with Copy Buttons
interface CustomerContactCardProps {
    customer: {
        name: string;
        email: string;
        phone: string;
        isGuest: boolean;
    };
}

function CustomerContactCard({ customer }: CustomerContactCardProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const CopyButton = ({ text, field }: { text: string; field: string }) => (
        <button
            onClick={(e) => {
                e.preventDefault();
                handleCopy(text, field);
            }}
            className="p-1 rounded hover:bg-blue-100 transition-colors"
            title="Copy to clipboard"
        >
            {copiedField === field ? (
                <Check className="w-4 h-4 text-green-600" />
            ) : (
                <Copy className="w-4 h-4 text-blue-400 hover:text-blue-600" />
            )}
        </button>
    );

    return (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
            {/* Customer Name */}
            <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-900">
                        {customer.name}
                        {customer.isGuest && (
                            <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Guest</span>
                        )}
                    </span>
                </div>
                <CopyButton text={customer.name} field="name" />
            </div>

            {/* Contact Details */}
            <div className="space-y-2">
                {/* Email */}
                <div className="flex items-center justify-between gap-2 bg-white/50 rounded-lg px-3 py-2">
                    <a
                        href={`mailto:${customer.email}`}
                        className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 hover:underline flex-1 min-w-0"
                    >
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{customer.email}</span>
                    </a>
                    <CopyButton text={customer.email} field="email" />
                </div>

                {/* Phone */}
                <div className="flex items-center justify-between gap-2 bg-white/50 rounded-lg px-3 py-2">
                    <a
                        href={`tel:${customer.phone}`}
                        className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 hover:underline flex-1 min-w-0"
                    >
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{customer.phone}</span>
                    </a>
                    <CopyButton text={customer.phone} field="phone" />
                </div>
            </div>
        </div>
    );
}
