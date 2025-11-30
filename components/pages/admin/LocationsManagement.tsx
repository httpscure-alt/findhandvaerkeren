import React, { useState } from 'react';
import { Language } from '../../../types';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';

interface LocationsManagementProps {
  lang: Language;
  onBack: () => void;
}

const LocationsManagement: React.FC<LocationsManagementProps> = ({ lang, onBack }) => {
  const [locations, setLocations] = useState(['København', 'Aarhus', 'Odense', 'Aalborg', 'Roskilde']);
  const [newLocation, setNewLocation] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = () => {
    if (newLocation.trim()) {
      setLocations([...locations, newLocation.trim()]);
      setNewLocation('');
    }
  };

  const handleDelete = (location: string) => {
    setLocations(locations.filter(l => l !== location));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert(lang === 'da' ? 'Lokationer gemt!' : 'Locations saved!');
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F]">
          {lang === 'da' ? 'Lokationsstyring' : 'Locations Management'}
        </h1>
      </div>

      {/* Add New Location */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
        <h3 className="font-bold text-[#1D1D1F] mb-4">
          {lang === 'da' ? 'Tilføj Ny Lokation' : 'Add New Location'}
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={lang === 'da' ? 'Lokations navn' : 'Location name'}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-nexus-accent text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            {lang === 'da' ? 'Tilføj' : 'Add'}
          </button>
        </div>
      </div>

      {/* Locations List */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((location, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-nexus-accent transition-colors group"
              >
                <span className="font-medium text-[#1D1D1F]">{location}</span>
                <button
                  onClick={() => handleDelete(location)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-4">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          {lang === 'da' ? 'Tilbage' : 'Back'}
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
              {lang === 'da' ? 'Gem Ændringer' : 'Save Changes'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LocationsManagement;
