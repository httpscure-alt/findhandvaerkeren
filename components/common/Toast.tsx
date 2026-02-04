import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { ToastType } from '../../types';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    const styles = {
        success: 'bg-green-50 text-green-800 border-green-100',
        error: 'bg-red-50 text-red-800 border-red-100',
        info: 'bg-blue-50 text-blue-800 border-blue-100',
        warning: 'bg-yellow-50 text-yellow-800 border-yellow-100',
    };

    const icons = {
        success: <CheckCircle className="text-green-500" size={20} />,
        error: <AlertCircle className="text-red-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />,
        warning: <AlertTriangle className="text-yellow-500" size={20} />,
    };

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slideInRight ${styles[type]}`}>
            <div className="flex-shrink-0">
                {icons[type]}
            </div>
            <div className="flex-grow text-sm font-medium">
                {message}
            </div>
            <button
                onClick={onClose}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-white/50 transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    );
};

interface ToastContainerProps {
    toasts: Array<{ id: string; message: string; type: ToastType }>;
    removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full sm:w-auto">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};
