import React, { useState } from 'react';
import { PortfolioItem, Language } from '../../../types';
import { Plus, Trash2, Edit2, Save, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface PortfolioManagementProps {
  portfolio: PortfolioItem[];
  lang: Language;
  onSave: (portfolio: PortfolioItem[]) => void;
  onBack: () => void;
}

const PortfolioManagement: React.FC<PortfolioManagementProps> = ({ portfolio, lang, onSave, onBack }) => {
  const [items, setItems] = useState<PortfolioItem[]>(portfolio);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = () => {
    setItems([...items, { title: '', imageUrl: '', category: '' }]);
    setEditingId(`new-${Date.now()}`);
  };

  const handleUpdate = (index: number, field: keyof PortfolioItem, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleDelete = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      onSave(items);
      setIsSaving(false);
      setEditingId(null);
      alert(lang === 'da' ? 'Portfolio gemt!' : 'Portfolio saved!');
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F]">
          {lang === 'da' ? 'Porteføljestyring' : 'Portfolio Management'}
        </h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-nexus-accent text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          {lang === 'da' ? 'Tilføj Projekt' : 'Add Project'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
            <div className="relative h-48 bg-gray-100">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="text-gray-300" size={48} />
                </div>
              )}
              <button
                onClick={() => handleDelete(index)}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="p-4">
              {editingId === String(index) ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleUpdate(index, 'title', e.target.value)}
                    placeholder={lang === 'da' ? 'Projekt titel' : 'Project title'}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                  />
                  <input
                    type="text"
                    value={item.category}
                    onChange={(e) => handleUpdate(index, 'category', e.target.value)}
                    placeholder={lang === 'da' ? 'Kategori' : 'Category'}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                  />
                  <input
                    type="url"
                    value={item.imageUrl}
                    onChange={(e) => handleUpdate(index, 'imageUrl', e.target.value)}
                    placeholder={lang === 'da' ? 'Billede URL' : 'Image URL'}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50"
                    >
                      {lang === 'da' ? 'Annuller' : 'Cancel'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-[#1D1D1F] mb-1">{item.title || lang === 'da' ? 'Uden titel' : 'Untitled'}</h3>
                  <p className="text-xs text-nexus-subtext mb-3">{item.category || lang === 'da' ? 'Ingen kategori' : 'No category'}</p>
                  <button
                    onClick={() => setEditingId(String(index))}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 flex items-center justify-center gap-1"
                  >
                    <Edit2 size={14} />
                    {lang === 'da' ? 'Rediger' : 'Edit'}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500 mb-4">
            {lang === 'da' ? 'Ingen portfolio-projekter endnu.' : 'No portfolio projects yet.'}
          </p>
          <button
            onClick={handleAdd}
            className="px-6 py-2.5 bg-[#1D1D1F] text-white rounded-full text-sm font-medium hover:bg-black transition-colors"
          >
            {lang === 'da' ? 'Tilføj Første Projekt' : 'Add First Project'}
          </button>
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-8 flex items-center justify-end gap-4">
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
              <>
                <Loader2 className="animate-spin" size={18} />
                {lang === 'da' ? 'Gemmer...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save size={18} />
                {lang === 'da' ? 'Gem Alle' : 'Save All'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PortfolioManagement;
