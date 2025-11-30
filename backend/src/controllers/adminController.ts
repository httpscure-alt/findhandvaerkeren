import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

// Mock data for finance metrics
export const getFinanceMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // TODO: Replace with real database queries when Stripe is integrated
    const mockMetrics = {
      totalRevenue: 125430.50,
      monthlyRecurringRevenue: 12450.00,
      activeSubscriptions: 254,
      newSubscriptionsThisMonth: 23,
      cancellationsThisMonth: 5,
      upcomingRenewals: 42,
    };

    res.json(mockMetrics);
  } catch (error) {
    console.error('Get finance metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch finance metrics' });
  }
};

// Mock data for transactions
export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dateRange = 'all' } = req.query;

    // TODO: Replace with real database queries when Stripe is integrated
    const mockTransactions = [
      {
        id: '1',
        userOrCompany: 'Nexus Solutions',
        planName: 'Partner Plan',
        billingCycle: 'monthly',
        amount: 49,
        status: 'paid',
        date: '2024-01-15',
        transactionId: 'txn_abc123',
      },
      {
        id: '2',
        userOrCompany: 'Summit Capital',
        planName: 'Partner Plan',
        billingCycle: 'annual',
        amount: 470.40,
        status: 'paid',
        date: '2024-01-14',
        transactionId: 'txn_def456',
      },
      {
        id: '3',
        userOrCompany: 'TechFlow Inc',
        planName: 'Partner Plan',
        billingCycle: 'monthly',
        amount: 49,
        status: 'failed',
        date: '2024-01-13',
        transactionId: 'txn_ghi789',
      },
      {
        id: '4',
        userOrCompany: 'CloudBuilders',
        planName: 'Partner Plan',
        billingCycle: 'monthly',
        amount: 49,
        status: 'upcoming',
        date: '2024-01-20',
        transactionId: 'txn_jkl012',
      },
      {
        id: '5',
        userOrCompany: 'DataSync Pro',
        planName: 'Partner Plan',
        billingCycle: 'annual',
        amount: 470.40,
        status: 'paid',
        date: '2024-01-12',
        transactionId: 'txn_mno345',
      },
    ];

    // Filter by date range (mock implementation)
    let filteredTransactions = mockTransactions;
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      if (dateRange === 'month') {
        filterDate.setMonth(now.getMonth() - 1);
      } else if (dateRange === 'quarter') {
        filterDate.setMonth(now.getMonth() - 3);
      } else if (dateRange === 'year') {
        filterDate.setFullYear(now.getFullYear() - 1);
      }
      
      filteredTransactions = mockTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= filterDate;
      });
    }

    res.json({ transactions: filteredTransactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// Mock data for verification queue
export const getVerificationQueue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // TODO: Replace with real database queries
    const mockQueue = [
      {
        id: '1',
        companyName: 'Nexus Solutions',
        cvrNumber: '12345678',
        submittedDate: '2024-01-10',
        status: 'pending',
        permitType: 'Electrical authorisation',
        permitDocuments: 3,
      },
      {
        id: '2',
        companyName: 'Summit Capital',
        cvrNumber: '87654321',
        submittedDate: '2024-01-08',
        status: 'pending',
        permitType: 'General contractor',
        permitDocuments: 2,
      },
      {
        id: '3',
        companyName: 'TechFlow Inc',
        cvrNumber: '11223344',
        submittedDate: '2024-01-05',
        status: 'approved',
        permitType: 'Plumbing licence',
        permitDocuments: 4,
      },
    ];

    res.json({ requests: mockQueue });
  } catch (error) {
    console.error('Get verification queue error:', error);
    res.status(500).json({ error: 'Failed to fetch verification queue' });
  }
};
