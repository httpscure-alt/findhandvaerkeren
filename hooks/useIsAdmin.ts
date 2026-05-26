import { useAuth } from '../contexts/AuthContext';
import { getStoredAdveroUserRole, isAdveroInternalAdmin } from '../lib/adveroSession';

export function useIsAdmin(): boolean {
  const { user } = useAuth();
  const role = (user?.role as string | undefined) ?? getStoredAdveroUserRole();
  return isAdveroInternalAdmin(role);
}
