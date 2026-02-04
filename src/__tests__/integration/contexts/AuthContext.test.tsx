import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import React from 'react';

// Mock API
vi.mock('@/services/api', () => ({
    api: {
        login: vi.fn(),
        logout: vi.fn(),
        getMe: vi.fn(),
    }
}));

// Test component to consume context
const TestComponent = () => {
    const { user, login, logout, isAuthenticated } = useAuth();
    return (
        <div>
            <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
            {user && <div data-testid="user-email">{user.email}</div>}
            <button onClick={() => login('test@example.com', 'password')}>Login</button>
            <button onClick={() => logout()}>Logout</button>
        </div>
    );
};

describe('AuthContext Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        // Mock import.meta.env if needed, but Vite handles it.
    });

    it('provides initial unauthenticated state', async () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );
        // Wait for potential initial useEffect to run
        await waitFor(() => {
            expect(screen.getByTestId('auth-status')).toBeInTheDocument();
        });
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });

    it('updates state after successful login', async () => {
        const mockUser = { id: '1', email: 'test@example.com', role: 'CONSUMER' };
        (api.login as any).mockResolvedValue({ user: mockUser, token: 'fake-token' });

        // Mock getMe to return user so the effect in AuthContext doesn't fail or overwrite
        (api.getMe as any).mockResolvedValue({ user: mockUser });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const loginButton = screen.getByText('Login');
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(api.login).toHaveBeenCalledWith('test@example.com', 'password');
        });

        // AuthContext usually stores token in localStorage, so login updates state
        // We need to check if AuthContext updates internal state
        // Note: The actual AuthContext implementation matters here. 
        // Assuming standard implementation:
        await waitFor(() => {
            expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
            expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
        });
    });
});

import { fireEvent } from '@testing-library/react';
