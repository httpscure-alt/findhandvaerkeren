import * as React from 'react';
import { useState } from 'react';
import { TestimonialItem, Language } from '../../../types';
import { Plus, Trash2, Edit2, Save, X, Loader2, Quote, Star } from 'lucide-react';
import { api } from '../../../services/api';
import { useToast } from '../../../hooks/useToast';

interface TestimonialsManagementProps {
  testimonials: TestimonialItem[];
  companyId: string;
  lang: Language;
  onSave: () => void;
  onBack: () => void;
}

const TestimonialsManagement: React.FC<TestimonialsManagementProps> = ({ testimonials, companyId, lang, onSave, onBack }) => {
  const toast = useToast();
  const [items, setItems] = useState<TestimonialItem[]>(testimonials);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    const newItem = {
      id: `new-${Date.now()}`,
      author: '',
      role: '',
      company: '',
      content: '',
      rating: 5
    };
    setItems([...items, newItem]);
    setEditingId(newItem.id);
  };

  const handleEdit = (index: number) => {
    const item = items[index];
    setEditingId(item.id || String(index));
  };

  const handleUpdate = (index: number, field: keyof TestimonialItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleDelete = async (index: number) => {
    const item = items[index];
    if (item.id && !item.id.startsWith('new-')) {
      try {
        setIsSaving(true);
        await api.deleteTestimonial(companyId, item.id);
        toast.success(lang === 'da' ? 'Udtalelse slettet' : 'Testimonial deleted');
      } catch (err: any) {
        toast.error(err.message || (lang === 'da' ? 'Kunne ikke slette testimonial' : 'Failed to delete testimonial'));
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
      const updatedTestimonials: TestimonialItem[] = [];
      for (const item of items) {
        if (!item.author.trim() || !item.content.trim()) continue;

        if (item.id && item.id.startsWith('new-')) {
          const result = await api.createTestimonial(companyId, {
            author: item.author,
            role: item.role || '',
            company: item.company || '',
            content: item.content,
            rating: item.rating
          });
          updatedTestimonials.push(result.testimonial);
        } else if (item.id) {
          const result = await api.updateTestimonial(companyId, item.id, {
            author: item.author,
            role: item.role || '',
            company: item.company || '',
            content: item.content,
            rating: item.rating
          });
          updatedTestimonials.push(result.testimonial);
        }
      }
      setItems(updatedTestimonials);
      toast.success(lang === 'da' ? 'Udtalelser gemt!' : 'Testimonials saved!');
      onSave();
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.message || (lang === 'da' ? 'Kunne ikke gemme udtalelser' : 'Failed to save testimonials'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F]">
          {lang === 'da' ? 'Kundeudtalelser' : 'Testimonials Management'}
        </h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-nexus-accent text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          {lang === 'da' ? 'Tilføj Udtalelse' : 'Add Testimonial'}
        </button>
      </div>

      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={item.id || `new-${index}`} className="bg-white rounded-2xl p-6 border border-gray-100 relative">
            {(editingId === String(index) && !item.id) || editingId === item.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={item.author}
                    onChange={(e) => handleUpdate(index, 'author', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                    placeholder={lang === 'da' ? 'Navn' : 'Author Name'}
                  />
                  <input
                    type="text"
                    value={item.role}
                    onChange={(e) => handleUpdate(index, 'role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                    placeholder={lang === 'da' ? 'Rolle / Virksomhed' : 'Role / Company'}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">{lang === 'da' ? 'Bedømmelse:' : 'Rating:'}</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleUpdate(index, 'rating', star)}
                      className="transition-colors"
                    >
                      <Star
                        size={20}
                        className={star <= item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={item.content}
                  onChange={(e) => handleUpdate(index, 'content', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent resize-none text-sm"
                  placeholder={lang === 'da' ? 'Udtalelse' : 'Testimonial content'}
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors"
                  >
                    {lang === 'da' ? 'Annuller' : 'Cancel'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={star <= item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                      />
                    ))}
                  </div>
                  <blockquote className="text-gray-600 italic mb-4">"{item.content}"</blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-nexus-bg rounded-full flex items-center justify-center text-nexus-accent font-bold">
                      {item.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[#1D1D1F] text-sm">{item.author}</p>
                      <p className="text-nexus-subtext text-xs">{item.role}{item.company ? `, ${item.company}` : ''}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(index)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                  >
                    <Edit2 size={18} className="text-nexus-accent" />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
              </div>
            )}
            <Quote className="absolute top-6 right-6 text-nexus-accent opacity-5" size={48} />
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500 mb-4">{lang === 'da' ? 'Ingen udtalelser endnu.' : 'No testimonials yet.'}</p>
          <button
            onClick={handleAdd}
            className="px-6 py-2.5 bg-[#1D1D1F] text-white rounded-full text-sm font-medium hover:bg-black transition-colors"
          >
            {lang === 'da' ? 'Tilføj Første Udtalelse' : 'Add First Testimonial'}
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
            <><Save size={18} /> {lang === 'da' ? 'Gem Alle Udtalelser' : 'Save All'}</>
          )}
        </button>
      </div>
    </div>
  );
};

export default TestimonialsManagement;
