import type { VisibilityAuditInput } from './mockAnalyzeVisibility';

export const AUDIT_PENDING_KEY = 'advero.audit.pending';

export function savePendingAudit(payload: VisibilityAuditInput): void {
  sessionStorage.setItem(AUDIT_PENDING_KEY, JSON.stringify(payload));
}

export function loadPendingAudit(): VisibilityAuditInput | null {
  try {
    const raw = sessionStorage.getItem(AUDIT_PENDING_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VisibilityAuditInput;
  } catch {
    return null;
  }
}

export function clearPendingAudit(): void {
  sessionStorage.removeItem(AUDIT_PENDING_KEY);
}
