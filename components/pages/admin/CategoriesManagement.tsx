import * as React from 'react';
import { useState, useEffect } from 'react';
import { Language } from '../../../types';
import { Plus, Edit2, Trash2, Save, X, Loader2 } from 'lucide-react';
import { api } from '../../../services/api';
import { LoadingSkeleton } from '../../common/LoadingSkeleton';
import { ErrorState } from '../../common/ErrorState';
import { EmptyState } from '../../common/EmptyState';
import { Tag } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import { ConfirmDialog } from '../../common/ConfirmDialog';

interface CategoriesManagementProps {
  lang: Language;
  onBack: () => void;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

const CategoriesManagement: React.FC<CategoriesManagementProps> = ({ lang, onBack }) => {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getCategories();
      setCategories(response.categories || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCategory.trim()) return;

    setIsSaving(true);
    try {
      const response = await api.createCategory({
        name: newCategory.trim(),
        description: newDescription.trim() || undefined,
      });
      setCategories([...categories, response.category]);
      setNewCategory('');
      setNewDescription('');
      toast.success(lang === 'da' ? 'Kategori tilføjet' : 'Category added');
    } catch (err: any) {
      toast.error(err.message || (lang === 'da' ? 'Kunne ikke tilføje kategori' : 'Failed to add category'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: lang === 'da' ? 'Slet Kategori' : 'Delete Category',
      message: lang === 'da' ? 'Er du sikker på at du vil slette denne kategori?' : 'Are you sure you want to delete this category?',
      isDestructive: true,
      onConfirm: async () => {
        setIsSaving(true);
        try {
          await api.deleteCategory(categoryId);
          setCategories(categories.filter(c => c.id !== categoryId));
          toast.success(lang === 'da' ? 'Kategori slettet' : 'Category deleted');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          toast.error(err.message || (lang === 'da' ? 'Kunne ikke slette kategori' : 'Failed to delete category'));
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const handleUpdate = async (categoryId: string, name: string, description?: string) => {
    try {
      const response = await api.updateCategory(categoryId, { name, description });
      setCategories(categories.map(c => c.id === categoryId ? response.category : c));
      setEditingId(null);
      toast.success(lang === 'da' ? 'Kategori opdateret' : 'Category updated');
    } catch (err: any) {
      toast.error(err.message || (lang === 'da' ? 'Kunne ikke opdatere kategori' : 'Failed to update category'));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F]">
          {lang === 'da' ? 'Kategoristyring' : 'Categories Management'}
        </h1>
      </div>

      {/* Add New Category */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
        <h3 className="font-bold text-[#1D1D1F] mb-4">
          {lang === 'da' ? 'Tilføj Ny Kategori' : 'Add New Category'}
        </h3>
        <div className="space-y-3">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={lang === 'da' ? 'Kategori navn' : 'Category name'}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
          />
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder={lang === 'da' ? 'Beskrivelse (valgfrit)' : 'Description (optional)'}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
          />
          <button
            onClick={handleAdd}
            disabled={isSaving || !newCategory.trim()}
            className="w-full px-4 py-2 bg-nexus-accent text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                {lang === 'da' ? 'Tilføjer...' : 'Adding...'}
              </>
            ) : (
              <>
                <Plus size={18} />
                {lang === 'da' ? 'Tilføj' : 'Add'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Categories List */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-6">
          <LoadingSkeleton variant="card" count={6} />
        </div>
      ) : error ? (
        <ErrorState title="Failed to load categories" message={error} onRetry={fetchCategories} />
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <div className="p-6">
            {categories.length === 0 ? (
              <EmptyState
                icon={Tag}
                title={lang === 'da' ? 'Ingen kategorier' : 'No categories'}
                description={lang === 'da' ? 'Tilføj din første kategori for at komme i gang.' : 'Add your first category to get started.'}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="p-4 border border-gray-200 rounded-xl hover:border-nexus-accent transition-colors group"
                  >
                    {editingId === category.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          defaultValue={category.name}
                          onBlur={(e) => {
                            if (e.target.value !== category.name) {
                              handleUpdate(category.id, e.target.value, category.description);
                            } else {
                              setEditingId(null);
                            }
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                          autoFocus
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="font-medium text-[#1D1D1F]">{category.name}</span>
                          {category.description && (
                            <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingId(category.id)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} className="text-blue-500" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-end gap-4">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          {lang === 'da' ? 'Tilbage' : 'Back'}
        </button>
      </div>

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

export default CategoriesManagement;
