import * as React from 'react';
import { useState } from 'react';
import { ServiceItem, Language } from '../../../types';
import { Plus, Trash2, Edit2, Save, X, Loader2 } from 'lucide-react';
import { api } from '../../../services/api';
import { useToast } from '../../../hooks/useToast';

interface ServicesManagementProps {
  services: ServiceItem[];
  companyId: string;
  lang: Language;
  onSave: () => void;
  onBack: () => void;
}

const ServicesManagement: React.FC<ServicesManagementProps> = ({ services, companyId, lang, onSave, onBack }) => {
  const toast = useToast();
  const [items, setItems] = useState<ServiceItem[]>(services);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    setItems([...items, { id: `new-${Date.now()}`, title: '', description: '' }]);
    setEditingId(`new-${Date.now()}`);
  };

  const handleEdit = (index: number) => {
    setEditingId(String(index));
  };

  const handleUpdate = (index: number, field: keyof ServiceItem, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleDelete = async (index: number) => {
    const item = items[index];

    // If it's an existing service (has an id that's not a new-*), delete from API
    if (item.id && !item.id.startsWith('new-')) {
      try {
        setIsSaving(true);
        await api.deleteService(companyId, item.id);
        toast.success(lang === 'da' ? 'Ydelse slettet' : 'Service deleted');
      } catch (err: any) {
        toast.error(err.message || (lang === 'da' ? 'Kunne ikke slette service' : 'Failed to delete service'));
        return;
      } finally {
        setIsSaving(false);
      }
    }

    // Remove from local state
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const updatedServices: ServiceItem[] = [];

      // Save each service
      for (const item of items) {
        if (!item.title.trim()) {
          continue; // Skip empty services
        }

        if (item.id && item.id.startsWith('new-')) {
          // Create new service
          const result = await api.createService(companyId, {
            title: item.title,
            description: item.description || '',
          });
          updatedServices.push(result.service);
        } else if (item.id) {
          // Update existing service
          const result = await api.updateService(companyId, item.id, {
            title: item.title,
            description: item.description || '',
          });
          updatedServices.push(result.service);
        }
      }

      setItems(updatedServices);
      toast.success(lang === 'da' ? 'Services gemt!' : 'Services saved!');
      onSave();
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.message || (lang === 'da' ? 'Kunne ikke gemme services' : 'Failed to save services'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F]">
          {lang === 'da' ? 'Ydelsesstyring' : 'Services Management'}
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-nexus-accent text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            {lang === 'da' ? 'Tilføj Ydelse' : 'Add Service'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((service, index) => (
          <div key={index} className="bg-white rounded-xl p-6 border border-gray-100">
            {editingId === String(index) ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lang === 'da' ? 'Titel' : 'Title'}
                  </label>
                  <input
                    type="text"
                    value={service.title}
                    onChange={(e) => handleUpdate(index, 'title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                    placeholder={lang === 'da' ? 'Service titel' : 'Service title'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lang === 'da' ? 'Beskrivelse' : 'Description'}
                  </label>
                  <textarea
                    value={service.description}
                    onChange={(e) => handleUpdate(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent resize-none"
                    placeholder={lang === 'da' ? 'Service beskrivelse' : 'Service description'}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <X size={16} />
                    {lang === 'da' ? 'Annuller' : 'Cancel'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-[#1D1D1F] mb-2">{service.title || lang === 'da' ? 'Uden titel' : 'Untitled'}</h3>
                  <p className="text-nexus-subtext text-sm">{service.description || lang === 'da' ? 'Ingen beskrivelse' : 'No description'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(index)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} className="text-nexus-accent" />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500 mb-4">
            {lang === 'da' ? 'Ingen services endnu.' : 'No services yet.'}
          </p>
          <button
            onClick={handleAdd}
            className="px-6 py-2.5 bg-[#1D1D1F] text-white rounded-full text-sm font-medium hover:bg-black transition-colors"
          >
            {lang === 'da' ? 'Tilføj Første Service' : 'Add First Service'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
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

export default ServicesManagement;
