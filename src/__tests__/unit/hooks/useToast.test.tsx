import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useToast } from '@/hooks/useToast';
import { ToastContext } from '@/contexts/ToastContext';
import React from 'react';

// Mock context provider wrapper
const wrapper = ({ children }: { children: React.ReactNode }) => {
    // Use the actual provider or a mock one. For unit testing the hook, usually we want to test correct context usage.
    // But wait, useToast just returns useContext(ToastContext).
    // Real logic is inside ToastProvider.
    // So we should probably test ToastProvider or integration of useToast + ToastProvider.

    // Let's mock the expected context value to ensure useToast returns what context provides
    const mockContextValue = {
        addToast: vi.fn(),
        removeToast: vi.fn(),
        toasts: [],
        showToast: vi.fn(),
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warning: vi.fn()
    };

    return (
        <ToastContext.Provider value={mockContextValue}>
            {children}
        </ToastContext.Provider>
    );
};

describe('useToast Hook', () => {
    it('should throw error when used outside of ToastProvider', () => {
        // Suppress console.error for this test as React logs the error
        const spy = vi.spyOn(console, 'error');
        spy.mockImplementation(() => { });

        expect(() => renderHook(() => useToast())).toThrow('useToast must be used within a ToastProvider');

        spy.mockRestore();
    });

    it('should return context value when used within ToastProvider', () => {
        const { result } = renderHook(() => useToast(), { wrapper });

        expect(result.current).toHaveProperty('addToast');
        expect(result.current).toHaveProperty('removeToast');
        expect(result.current).toHaveProperty('success');
        expect(result.current).toHaveProperty('error');
        expect(result.current).toHaveProperty('info');
        expect(result.current).toHaveProperty('warning');
    });
});
