import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { getSearchSuggestions } from '../services/geminiService';
import { Language } from '../types';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder: string;
  lang: Language;
  variant?: 'hero' | 'sidebar';
  buttonText?: string;
}

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange, 
  onSearch, 
  placeholder, 
  lang, 
  variant = 'hero',
  buttonText = 'Search' 
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(value, 300);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length >= 2) {
        setIsLoading(true);
        const results = await getSearchSuggestions(debouncedQuery, lang);
        setSuggestions(results);
        setIsLoading(false);
        if (results.length > 0) setIsOpen(true);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, lang]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    onSearch(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setIsOpen(false);
    onSearch(suggestion);
  };

  const clearSearch = () => {
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
  };

  if (variant === 'hero') {
    return (
      <div className="w-full max-w-2xl relative z-50" ref={wrapperRef}>
        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-nexus-accent transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-32 py-4 rounded-2xl border border-gray-200 bg-white/60 backdrop-blur-xl text-nexus-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nexus-accent/20 focus:border-nexus-accent transition-all shadow-lg hover:shadow-xl"
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (!isOpen && e.target.value.length >= 2) setIsOpen(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setIsOpen(true);
            }}
          />
          
          {value && (
            <button 
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-28 px-2 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}

          <button 
            type="submit" 
            className="absolute inset-y-2 right-2 px-6 bg-[#1D1D1F] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors flex items-center gap-2 shadow-sm"
          >
            {buttonText}
          </button>
        </form>

        {/* Suggestions Dropdown */}
        {isOpen && (suggestions.length > 0 || isLoading) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden animate-fadeIn">
             {isLoading && suggestions.length === 0 && (
               <div className="p-4 flex items-center gap-2 text-gray-400 text-sm">
                 <Loader2 className="animate-spin" size={16} />
                 <span>Thinking...</span>
               </div>
             )}
             {suggestions.map((suggestion, index) => (
               <button
                 key={index}
                 onClick={() => handleSuggestionClick(suggestion)}
                 className="w-full text-left px-5 py-3 text-sm text-[#1D1D1F] hover:bg-blue-50 transition-colors flex items-center justify-between group border-b border-gray-50 last:border-0"
               >
                 <div className="flex items-center gap-3">
                    <Sparkles size={14} className="text-nexus-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{suggestion}</span>
                 </div>
                 <ArrowRight size={14} className="text-gray-300 group-hover:text-nexus-accent -translate-x-2 group-hover:translate-x-0 transition-all" />
               </button>
             ))}
          </div>
        )}
      </div>
    );
  }

  // Sidebar Variant
  return (
    <div className="relative w-full z-40" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-nexus-accent/20 focus:border-nexus-accent transition-all shadow-sm"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
             onChange(e.target.value);
             if (!isOpen && e.target.value.length >= 2) setIsOpen(true);
          }}
          onFocus={() => {
             if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        {value && (
            <button 
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
      </div>

       {/* Sidebar Suggestions Dropdown */}
       {isOpen && (suggestions.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
             {suggestions.map((suggestion, index) => (
               <button
                 key={index}
                 onClick={() => handleSuggestionClick(suggestion)}
                 className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 border-b border-gray-50 last:border-0"
               >
                 <Search size={12} className="text-gray-400" />
                 <span className="truncate">{suggestion}</span>
               </button>
             ))}
          </div>
        )}
    </div>
  );
};

export default SearchBar;