import React, { useState } from 'react';
import { TestimonialItem, Language } from '../../../types';
import { Plus, Trash2, Edit2, Save, X, Loader2, Star } from 'lucide-react';

interface TestimonialsManagementProps {
  testimonials: TestimonialItem[];
  lang: Language;
  onSave: (testimonials: TestimonialItem[]) => void;
  onBack: () => void;
}

const TestimonialsManagement: React.FC<TestimonialsManagementProps> = ({ testimonials, lang, onSave, onBack }) => {
  const [items, setItems] = useState<TestimonialItem[]>(testimonials);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = () => {
    setItems([...items, { author: '', role: '', company: '', content: '', rating: 5 }]);
    setEditingId(`new-${Date.now()}`);
  };

  const handleUpdate = (index: number, field: keyof TestimonialItem, value: string | number) => {
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
      alert(lang === 'da' ? 'Udtalelser gemt!' : 'Testimonials saved!');
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F]">
          {lang === 'da' ? 'Udtalelser / Anmeldelser' : 'Testimonials / Reviews'}
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
          <div key={index} className="bg-white rounded-xl p-6 border border-gray-100">
            {editingId === String(index) ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {lang === 'da' ? 'Forfatter' : 'Author'}
                    </label>
                    <input
                      type="text"
                      value={item.author}
                      onChange={(e) => handleUpdate(index, 'author', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {lang === 'da' ? 'Rolle' : 'Role'}
                    </label>
                    <input
                      type="text"
                      value={item.role}
                      onChange={(e) => handleUpdate(index, 'role', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lang === 'da' ? 'Virksomhed' : 'Company'}
                  </label>
                  <input
                    type="text"
                    value={item.company}
                    onChange={(e) => handleUpdate(index, 'company', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lang === 'da' ? 'Indhold' : 'Content'}
                  </label>
                  <textarea
                    value={item.content}
                    onChange={(e) => handleUpdate(index, 'content', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lang === 'da' ? 'Bedømmelse' : 'Rating'} ({item.rating}/5)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={item.rating}
                    onChange={(e) => handleUpdate(index, 'rating', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={i < item.rating ? 'fill-nexus-verified text-nexus-verified' : 'text-gray-300'}
                      />
                    ))}
                  </div>
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
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < item.rating ? 'fill-nexus-verified text-nexus-verified' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <p className="text-nexus-text italic mb-4">"{item.content || lang === 'da' ? 'Ingen indhold' : 'No content'}"</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-[#1D1D1F]">{item.author || lang === 'da' ? 'Anonym' : 'Anonymous'}</span>
                    <span className="text-nexus-subtext">
                      {item.role && `${item.role}, `}
                      {item.company || ''}
                    </span>
                  </div>
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
            {lang === 'da' ? 'Ingen udtalelser endnu.' : 'No testimonials yet.'}
          </p>
          <button
            onClick={handleAdd}
            className="px-6 py-2.5 bg-[#1D1D1F] text-white rounded-full text-sm font-medium hover:bg-black transition-colors"
          >
            {lang === 'da' ? 'Tilføj Første Udtalelse' : 'Add First Testimonial'}
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

export default TestimonialsManagement;
