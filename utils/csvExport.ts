/**
 * Utility functions for CSV export
 */

export const exportToCSV = (data: any[], filename: string, headers?: string[]) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    csvHeaders.join(','),
    ...data.map(row =>
      csvHeaders.map(header => {
        const value = row[header];
        // Handle values with commas, quotes, or newlines
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

export const exportUsersToCSV = (users: any[]) => {
  const data = users.map(user => ({
    'ID': user.id,
    'Email': user.email,
    'Name': user.name || '',
    'First Name': user.firstName || '',
    'Last Name': user.lastName || '',
    'Role': user.role,
    'Location': user.location || '',
    'Joined Date': new Date(user.createdAt).toLocaleDateString(),
    'Company Name': user.ownedCompany?.name || '',
    'Company Verified': user.ownedCompany?.isVerified ? 'Yes' : 'No',
  }));

  exportToCSV(data, 'users');
};

export const exportCompaniesToCSV = (companies: any[]) => {
  const data = companies.map(company => ({
    'ID': company.id,
    'Name': company.name,
    'Category': company.category,
    'Location': company.location,
    'Contact Email': company.contactEmail,
    'Website': company.website || '',
    'Verified': company.isVerified ? 'Yes' : 'No',
    'Verification Status': company.verificationStatus,
    'Pricing Tier': company.pricingTier,
    'Rating': company.rating,
    'Review Count': company.reviewCount,
    'Created Date': new Date(company.createdAt).toLocaleDateString(),
  }));

  exportToCSV(data, 'companies');
};

export const exportTransactionsToCSV = (transactions: any[]) => {
  const data = transactions.map(txn => ({
    'ID': txn.id,
    'Company/User': txn.userOrCompany,
    'Plan Name': txn.planName,
    'Billing Cycle': txn.billingCycle,
    'Amount': txn.amount,
    'Status': txn.status,
    'Date': txn.date,
    'Transaction ID': txn.transactionId,
  }));

  exportToCSV(data, 'transactions');
};

export const exportSubscriptionsToCSV = (subscriptions: any[]) => {
  const data = subscriptions.map(sub => ({
    'ID': sub.id,
    'Company': sub.company?.name || '',
    'Tier': sub.tier,
    'Status': sub.status,
    'Billing Cycle': sub.billingCycle || '',
    'Start Date': new Date(sub.startDate).toLocaleDateString(),
    'End Date': sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '',
    'Current Period End': sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : '',
    'Stripe Customer ID': sub.stripeCustomerId || '',
    'Stripe Subscription ID': sub.stripeSubscriptionId || '',
  }));

  exportToCSV(data, 'subscriptions');
};

export const exportFinanceMetricsToCSV = (metrics: any) => {
  const data = [{
    'Total Revenue': metrics.totalRevenue,
    'MRR': metrics.monthlyRecurringRevenue,
    'Active Subscriptions': metrics.activeSubscriptions,
    'New This Month': metrics.newSubscriptionsThisMonth,
    'Cancellations This Month': metrics.cancellationsThisMonth,
    'Upcoming Renewals': metrics.upcomingRenewals,
    'Export Date': new Date().toLocaleDateString(),
  }];

  exportToCSV(data, 'finance_metrics');
};





