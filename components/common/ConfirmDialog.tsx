import * as React from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { Language } from '../../types';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
    lang?: Language;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel,
    cancelLabel,
    isDestructive = true,
    isLoading = false,
    lang = 'da'
}) => {
    if (!isOpen) return null;

    const labels = {
        da: {
            confirm: confirmLabel || (isDestructive ? 'Slet' : 'Bekræft'),
            cancel: cancelLabel || 'Annuller'
        },
        en: {
            confirm: confirmLabel || (isDestructive ? 'Delete' : 'Confirm'),
            cancel: cancelLabel || 'Cancel'
        }
    };

    const currentLabels = lang === 'da' ? labels.da : labels.en;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
            <div
                className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isDestructive ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                            <AlertTriangle size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-[#1D1D1F] mb-2">{title}</h3>
                            <p className="text-gray-500 leading-relaxed">{message}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="mt-8 flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-6 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                            {currentLabels.cancel}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`px-6 py-2.5 rounded-xl font-medium text-white transition-all flex items-center gap-2 disabled:opacity-50 ${isDestructive
                                    ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200'
                                    : 'bg-nexus-accent hover:bg-blue-600 shadow-lg shadow-blue-200'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    {lang === 'da' ? 'Venter...' : 'Wait...'}
                                </>
                            ) : (
                                currentLabels.confirm
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
