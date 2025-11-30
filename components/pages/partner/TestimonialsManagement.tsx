import React, { useState } from 'react';
import { TestimonialItem, Language } from '../../../types';
import { Star } from 'lucide-react';

interface TestimonialsManagementProps {
  testimonials: TestimonialItem[];
  lang: Language;
  onSave: (testimonials: TestimonialItem[]) => void;
  onBack: () => void;
}

const TestimonialsManagement: React.FC<TestimonialsManagementProps> = ({ testimonials, lang, onSave, onBack }) => {
  // Testimonials creation temporarily disabled until we finalise moderation rules.
  const [items] = useState<TestimonialItem[]>(testimonials);
  // const [editingId, setEditingId] = useState<string | null>(null);
  // const [isSaving, setIsSaving] = useState(false);

  // Disabled - Testimonials creation temporarily disabled until we finalise moderation rules.
  // const handleAdd = () => {
  //   setItems([...items, { author: '', role: '', company: '', content: '', rating: 5 }]);
  //   setEditingId(`new-${Date.now()}`);
  // };

  // const handleUpdate = (index: number, field: keyof TestimonialItem, value: string | number) => {
  //   const updated = [...items];
  //   updated[index] = { ...updated[index], [field]: value };
  //   setItems(updated);
  // };

  // const handleDelete = (index: number) => {
  //   setItems(items.filter((_, i) => i !== index));
  // };

  // const handleSave = async () => {
  //   setIsSaving(true);
  //   setTimeout(() => {
  //     onSave(items);
  //     setIsSaving(false);
  //     setEditingId(null);
  //     alert(lang === 'da' ? 'Udtalelser gemt!' : 'Testimonials saved!');
  //   }, 1000);
  // };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F]">
          {lang === 'da' ? 'Udtalelser / Anmeldelser' : 'Testimonials / Reviews'}
        </h1>
        {/* Testimonials creation temporarily disabled until we finalise moderation rules. */}
        {/* <button
          onClick={handleAdd}
          className="px-4 py-2 bg-nexus-accent text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          {lang === 'da' ? 'Tilføj Udtalelse' : 'Add Testimonial'}
        </button> */}
      </div>

      {/* Info message */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-700">
          {lang === 'da' 
            ? 'Testimonials-håndtering er midlertidigt deaktiveret, mens vi finaliserer moderationsreglerne. Du kan stadig se eksisterende testimonials.'
            : 'Testimonials management is temporarily disabled while we finalize moderation rules. You can still view existing testimonials.'}
        </p>
      </div>

      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="bg-white rounded-xl p-6 border border-gray-100">
            {/* Read-only display - Testimonials creation temporarily disabled until we finalise moderation rules. */}
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
              {/* Edit/Delete buttons removed - Testimonials creation temporarily disabled until we finalise moderation rules. */}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500 mb-4">
            {lang === 'da' ? 'Ingen udtalelser endnu.' : 'No testimonials yet.'}
          </p>
          {/* Testimonials creation temporarily disabled until we finalise moderation rules. */}
        </div>
      )}

      {/* Back button only - Testimonials creation temporarily disabled until we finalise moderation rules. */}
      <div className="mt-8 flex items-center justify-end gap-4">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          {lang === 'da' ? 'Tilbage' : 'Back'}
        </button>
      </div>
    </div>
  );
};

export default TestimonialsManagement;
