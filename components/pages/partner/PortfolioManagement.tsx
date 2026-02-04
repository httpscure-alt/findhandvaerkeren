import * as React from 'react';
import { useState } from 'react';
import { PortfolioItem, Language } from '../../../types';
import { Plus, Trash2, Edit2, Save, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { api } from '../../../services/api';
import { useToast } from '../../../hooks/useToast';

interface PortfolioManagementProps {
  portfolio: PortfolioItem[];
  companyId: string;
  lang: Language;
  onSave: () => void;
  onBack: () => void;
}

const PortfolioManagement: React.FC<PortfolioManagementProps> = ({ portfolio, companyId, lang, onSave, onBack }) => {
  const toast = useToast();
  const [items, setItems] = useState<PortfolioItem[]>(portfolio);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    const newItem = { id: `new-${Date.now()}`, title: '', imageUrl: '', category: '', description: '' };
    setItems([...items, newItem]);
    setEditingId(newItem.id);
  };

  const handleEdit = (index: number) => {
    setEditingId(String(index));
  };

  const handleUpdate = (index: number, field: keyof PortfolioItem, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleDelete = async (index: number) => {
    const item = items[index];
    if (item.id && !item.id.startsWith('new-')) {
      try {
        setIsSaving(true);
        await api.deletePortfolioItem(companyId, item.id);
        toast.success(lang === 'da' ? 'Projekt slettet' : 'Project deleted');
      } catch (err: any) {
        toast.error(err.message || (lang === 'da' ? 'Kunne ikke slette portefølje-emne' : 'Failed to delete portfolio item'));
        return;
      } finally {
        setIsSaving(false);
      }
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const updatedPortfolio: PortfolioItem[] = [];
      for (const item of items) {
        if (!item.title.trim()) continue;

        if (item.id && item.id.startsWith('new-')) {
          const result = await api.createPortfolioItem(companyId, {
            title: item.title,
            imageUrl: item.imageUrl || '',
            category: item.category || 'Work',
            description: item.description || '',
          });
          updatedPortfolio.push(result.portfolioItem);
        } else if (item.id) {
          const result = await api.updatePortfolioItem(companyId, item.id, {
            title: item.title,
            imageUrl: item.imageUrl || '',
            category: item.category || 'Work',
            description: item.description || '',
          });
          updatedPortfolio.push(result.portfolioItem);
        }
      }
      setItems(updatedPortfolio);
      toast.success(lang === 'da' ? 'Portfolio gemt!' : 'Portfolio saved!');
      onSave();
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.message || (lang === 'da' ? 'Kunne ikke gemme portefølje' : 'Failed to save portfolio'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F]">
          {lang === 'da' ? 'Portfolio Styring' : 'Portfolio Management'}
        </h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-nexus-accent text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          {lang === 'da' ? 'Tilføj Projekt' : 'Add Project'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, index) => (
          <div key={index} className="bg-white rounded-xl overflow-hidden border border-gray-100 group">
            <div className="aspect-video bg-gray-50 relative group">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon size={48} className="mb-2 opacity-20" />
                  <span className="text-sm">{lang === 'da' ? 'Ingen billede' : 'No image'}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={() => handleEdit(index)}
                  className="p-2 bg-white rounded-full text-nexus-accent hover:scale-110 transition-transform"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="p-2 bg-white rounded-full text-red-500 hover:scale-110 transition-transform"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="p-4">
              {editingId === String(index) || editingId === item.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleUpdate(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                    placeholder={lang === 'da' ? 'Projekt titel' : 'Project title'}
                  />
                  <input
                    type="text"
                    value={item.imageUrl}
                    onChange={(e) => handleUpdate(index, 'imageUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                    placeholder={lang === 'da' ? 'Billede URL' : 'Image URL'}
                  />
                  <textarea
                    value={item.description || ''}
                    onChange={(e) => handleUpdate(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                    placeholder={lang === 'da' ? 'Projektbeskrivelse' : 'Project description'}
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700"
                    >
                      {lang === 'da' ? 'Færdig' : 'Done'}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="font-bold text-[#1D1D1F]">{item.title || (lang === 'da' ? 'Uden titel' : 'Untitled')}</h3>
                  <p className="text-xs text-nexus-subtext mt-1">{item.category || (lang === 'da' ? 'Arbejde' : 'Work')}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center col-span-full">
          <p className="text-gray-500 mb-4">{lang === 'da' ? 'Ingen projekter endnu.' : 'No projects yet.'}</p>
          <button
            onClick={handleAdd}
            className="px-6 py-2.5 bg-[#1D1D1F] text-white rounded-full text-sm font-medium hover:bg-black transition-colors"
          >
            {lang === 'da' ? 'Tilføj Første Projekt' : 'Add First Project'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mt-10 flex items-center justify-end gap-4">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          {lang === 'da' ? 'Annuller' : 'Cancel'}
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-[#1D1D1F] text-white rounded-xl font-medium hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <><Loader2 className="animate-spin" size={18} /> {lang === 'da' ? 'Gemmer...' : 'Saving...'}</>
          ) : (
            <><Save size={18} /> {lang === 'da' ? 'Gem Alle Projekter' : 'Save All Projects'}</>
          )}
        </button>
      </div>
    </div>
  );
};

export default PortfolioManagement;
