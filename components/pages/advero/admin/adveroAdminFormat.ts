export function formatAdminDate(value: string | Date | null | undefined, locale: string): string {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return '—';
  }
}

export function auditStatusClass(status: string): string {
  switch (status) {
    case 'COMPLETE':
      return 'advero-admin-pill advero-admin-pill--ok';
    case 'FAILED':
      return 'advero-admin-pill advero-admin-pill--bad';
    case 'PROCESSING':
      return 'advero-admin-pill advero-admin-pill--warn';
    default:
      return 'advero-admin-pill';
  }
}
