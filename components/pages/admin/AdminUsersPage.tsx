import * as React from 'react';
import { useState, useEffect } from 'react';
import { Language } from '../../../types';
import { ShieldCheck, UserPlus, Search, MoreHorizontal, Eye, ArrowUp, ArrowDown, X } from 'lucide-react';
import { api } from '../../../services/api';
import { useToast } from '../../../hooks/useToast';
import { LoadingSkeleton } from '../../common/LoadingSkeleton';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { ErrorState } from '../../common/ErrorState';
import { EmptyState } from '../../common/EmptyState';
import { exportUsersToCSV } from '../../../utils/csvExport';
import { Download } from 'lucide-react';

interface AdminUsersPageProps {
  lang: Language;
  onBack: () => void;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  user?: any;
}

const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ lang, onBack }) => {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    email: '',
    password: '',
    name: '',
    firstName: '',
    lastName: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getAdminUsers({ role: 'ADMIN' });
      const usersData = response.users.map((user: any) => ({
        id: user.id,
        name: user.name || user.email,
        email: user.email,
        role: user.role,
        createdAt: new Date(user.createdAt).toLocaleDateString(),
        user: user,
      }));
      setAdminUsers(usersData);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin users');
    } finally {
      setLoading(false);
    }
  };

  const filtered = adminUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewDetails = async (user: AdminUser) => {
    try {
      const userData = await api.getUserDetails(user.id);
      setSelectedUser({ ...user, user: userData.user });
    } catch (err: any) {
      toast.error(err.message || 'Failed to load details');
    }
  };

  const handlePromoteToAdmin = async (userId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: lang === 'da' ? 'Promover til Admin' : 'Promote to Admin',
      message: lang === 'da'
        ? 'Er du sikker på at du vil promovere denne bruger til admin?'
        : 'Are you sure you want to promote this user to admin?',
      isDestructive: false,
      onConfirm: async () => {
        setIsSaving(true);
        try {
          await api.updateUserRole(userId, 'ADMIN');
          toast.success(lang === 'da' ? 'Bruger promoveret til admin' : 'User promoted to admin');
          await fetchAdminUsers();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          toast.error(err.message || (lang === 'da' ? 'Kunne ikke promovere bruger' : 'Failed to promote user'));
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const handleDemoteFromAdmin = async (userId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: lang === 'da' ? 'Degrader fra Admin' : 'Demote from Admin',
      message: lang === 'da'
        ? 'Er du sikker på at du vil degraderer denne admin?'
        : 'Are you sure you want to demote this admin?',
      isDestructive: true,
      onConfirm: async () => {
        setIsSaving(true);
        try {
          // Demote to PARTNER (or CONSUMER based on context)
          await api.updateUserRole(userId, 'PARTNER');
          toast.success(lang === 'da' ? 'Admin degraderet' : 'Admin demoted');
          await fetchAdminUsers();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          toast.error(err.message || (lang === 'da' ? 'Kunne ikke degradere admin' : 'Failed to demote admin'));
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const handleCreateAdmin = async () => {
    if (!newAdminData.email || !newAdminData.password) {
      toast.warning(lang === 'da' ? 'Email og password er påkrævet' : 'Email and password are required');
      return;
    }
    setIsSaving(true);
    try {
      await api.createAdminUser(newAdminData);
      toast.success(lang === 'da' ? 'Admin bruger oprettet' : 'Admin user created');
      setShowCreateModal(false);
      setNewAdminData({ email: '', password: '', name: '', firstName: '', lastName: '' });
      await fetchAdminUsers();
    } catch (err: any) {
      toast.error(err.message || (lang === 'da' ? 'Kunne ikke oprette admin' : 'Failed to create admin'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1D1D1F] mb-2">
            {lang === 'da' ? 'Admin Brugere' : 'Admin Users'}
          </h1>
          <p className="text-gray-500">
            {lang === 'da' ? 'Administrer admin brugere' : 'Manage admin users'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => exportUsersToCSV(adminUsers.map(u => u.user))}
            disabled={adminUsers.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download size={16} />
            {lang === 'da' ? 'Eksporter CSV' : 'Export CSV'}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-nexus-accent text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <UserPlus size={18} />
            {lang === 'da' ? 'Tilføj Admin' : 'Add Admin'}
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {lang === 'da' ? 'Tilbage' : 'Back'}
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        <input
          type="text"
          placeholder={lang === 'da' ? 'Søg admin brugere...' : 'Search admin users...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-nexus-accent"
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden p-6">
          <LoadingSkeleton variant="table" count={5} />
        </div>
      ) : error ? (
        <ErrorState title="Failed to load admin users" message={error} onRetry={fetchAdminUsers} />
      ) : (
        <>
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Bruger' : 'User'}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Rolle' : 'Role'}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Oprettet' : 'Created'}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">{lang === 'da' ? 'Handlinger' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(user => (
                    <tr
                      key={user.id}
                      onClick={() => handleViewDetails(user)}
                      className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-nexus-bg flex items-center justify-center">
                            <ShieldCheck className="text-nexus-accent" size={20} />
                          </div>
                          <div>
                            <div className="font-medium text-[#1D1D1F]">{user.name}</div>
                            <div className="text-xs text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-nexus-subtext">{user.createdAt}</td>
                      <td className="px-6 py-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <div className="relative">
                            <button
                              onClick={() => setShowActionsMenu(showActionsMenu === user.id ? null : user.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#1D1D1F] opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal size={18} />
                            </button>
                            {showActionsMenu === user.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg z-10">
                                <button
                                  onClick={() => {
                                    handleViewDetails(user);
                                    setShowActionsMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Eye size={16} />
                                  {lang === 'da' ? 'Se detaljer' : 'View details'}
                                </button>
                                <button
                                  onClick={() => {
                                    handleDemoteFromAdmin(user.id);
                                    setShowActionsMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <ArrowDown size={16} />
                                  {lang === 'da' ? 'Degrader fra admin' : 'Demote from admin'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filtered.length === 0 && !loading && (
            <EmptyState
              icon={ShieldCheck}
              title={lang === 'da' ? 'Ingen admin brugere fundet' : 'No admin users found'}
              description={lang === 'da' ? 'Der er ingen admin brugere, der matcher din søgning.' : 'No admin users match your search.'}
            />
          )}
        </>
      )}

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1D1D1F]">
                {lang === 'da' ? 'Opret Admin Bruger' : 'Create Admin User'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewAdminData({ email: '', password: '', name: '', firstName: '', lastName: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'da' ? 'Email *' : 'Email *'}
                </label>
                <input
                  type="email"
                  value={newAdminData.email}
                  onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'da' ? 'Password *' : 'Password *'}
                </label>
                <input
                  type="password"
                  value={newAdminData.password}
                  onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={lang === 'da' ? 'Mindst 8 tegn' : 'Min 8 characters'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'da' ? 'Navn' : 'Name'}
                </label>
                <input
                  type="text"
                  value={newAdminData.name}
                  onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={lang === 'da' ? 'Fulde navn' : 'Full name'}
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewAdminData({ email: '', password: '', name: '', firstName: '', lastName: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50"
                >
                  {lang === 'da' ? 'Annuller' : 'Cancel'}
                </button>
                <button
                  onClick={handleCreateAdmin}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50"
                >
                  {isSaving ? (lang === 'da' ? 'Opretter...' : 'Creating...') : (lang === 'da' ? 'Opret' : 'Create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1D1D1F]">
                {lang === 'da' ? 'Admin Bruger Detaljer' : 'Admin User Details'}
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">{lang === 'da' ? 'Bruger Information' : 'User Information'}</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div><strong>{lang === 'da' ? 'Navn:' : 'Name:'}</strong> {selectedUser.user?.name || selectedUser.name}</div>
                  <div><strong>{lang === 'da' ? 'Email:' : 'Email:'}</strong> {selectedUser.email}</div>
                  <div><strong>{lang === 'da' ? 'Rolle:' : 'Role:'}</strong> {selectedUser.role}</div>
                  <div><strong>{lang === 'da' ? 'Oprettet:' : 'Created:'}</strong> {selectedUser.createdAt}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => !isSaving && setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isLoading={isSaving}
        isDestructive={confirmDialog.isDestructive}
        lang={lang}
      />
    </div>
  );
};

export default AdminUsersPage;
