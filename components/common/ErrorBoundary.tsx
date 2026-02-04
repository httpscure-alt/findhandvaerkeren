import * as React from 'react';
import * as Sentry from '@sentry/react';
import { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-nexus-bg flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center animate-fadeIn">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="text-red-500" size={40} />
                        </div>

                        <h1 className="text-2xl font-bold text-[#1D1D1F] mb-3">Something went wrong</h1>
                        <p className="text-nexus-subtext mb-8 leading-relaxed">
                            We've encountered an unexpected error. Don't worry, our team has been notified.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={this.handleReload}
                                className="w-full py-3 px-6 bg-[#1D1D1F] text-white rounded-xl font-medium hover:bg-black transition-all flex items-center justify-center gap-2 group"
                            >
                                <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                                Reload Page
                            </button>

                            <button
                                onClick={this.handleReset}
                                className="w-full py-3 px-6 border border-gray-200 text-[#1D1D1F] rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Home size={18} />
                                Return to Home
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mt-8 pt-6 border-t border-gray-100 text-left">
                                <p className="text-xs font-mono text-red-500 overflow-auto max-h-32 p-3 bg-red-50 rounded-lg">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
