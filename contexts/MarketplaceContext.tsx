import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Company, FilterState, Language, GeminiSearchResponse } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from '../hooks/useToast';
import { analyzeSearchQuery } from '../services/geminiService';

interface MarketplaceContextType {
    companies: Company[];
    categories: string[];
    locations: string[];
    isLoadingCompanies: boolean;
    isLoadingCategories: boolean;
    isLoadingLocations: boolean;
    companiesError: string | null;
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    savedCompanyIds: string[];
    toggleFavorite: (id: string) => void;
    lang: Language;
    setLang: (lang: Language) => void;
    isAnalyzing: boolean;
    aiSuggestion: GeminiSearchResponse | null;
    handleSearch: (query?: string) => Promise<void>;
    refreshCompanies: () => Promise<void>;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const toast = useToast();

    const [lang, setLang] = useState<Language>('da');
    const [filters, setFilters] = useState<FilterState>({
        category: 'All',
        location: 'All',
        zipCode: '',
        verifiedOnly: false,
        searchQuery: ''
    });

    const [companies, setCompanies] = useState<Company[]>([]);
    const [categories, setCategories] = useState<string[]>(['All']);
    const [locations, setLocations] = useState<string[]>(['All']);
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
    const [companiesError, setCompaniesError] = useState<string | null>(null);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [isLoadingLocations, setIsLoadingLocations] = useState(true);

    const [savedCompanyIds, setSavedCompanyIds] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<GeminiSearchResponse | null>(null);

    // Fetch companies from API
    const fetchCompanies = useCallback(async () => {
        setIsLoadingCompanies(true);
        setCompaniesError(null);
        try {
            const response = await api.getCompanies({
                category: filters.category !== 'All' ? filters.category || undefined : undefined,
                location: filters.location !== 'All' ? filters.location || undefined : undefined,
                postalCode: filters.zipCode || undefined,
                verifiedOnly: filters.verifiedOnly,
                search: filters.searchQuery || undefined,
            });
            setCompanies(response.companies);
        } catch (error: any) {
            setCompaniesError(error.message || 'Failed to load companies');
            setCompanies([]);
        } finally {
            setIsLoadingCompanies(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoadingCategories(true);
            try {
                const response = await api.getCategories();
                setCategories(['All', ...response.categories.map((c: any) => c.name)]);
            } catch (error) {
                setCategories(['All', 'Tømrer', 'Murer', 'VVS-installatør', 'Elektriker', 'Maler', 'Haveservice', 'Anlægsgartner', 'Brolægger', 'Entreprenør', 'Vinduespudser']);
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // Fetch locations from API
    useEffect(() => {
        const fetchLocations = async () => {
            setIsLoadingLocations(true);
            try {
                const response = await api.getLocations();
                setLocations(['All', ...response.locations.map((l: any) => l.name)]);
            } catch (error) {
                setLocations(['All', 'København', 'Aarhus', 'Odense', 'Aalborg', 'Roskilde']);
            } finally {
                setIsLoadingLocations(false);
            }
        };
        fetchLocations();
    }, []);

    const toggleFavorite = useCallback((id: string) => {
        if (!isAuthenticated) {
            toast.error(lang === 'da' ? 'Log venligst ind for at gemme.' : 'Please log in to save listings.');
            return;
        }
        setSavedCompanyIds(prev =>
            prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
        );
    }, [isAuthenticated, lang, toast]);

    const handleSearch = useCallback(async (query?: string) => {
        const searchQuery = query || filters.searchQuery;
        if (!searchQuery.trim()) return;

        setIsAnalyzing(true);
        setAiSuggestion(null);

        try {
            const analysis = await analyzeSearchQuery(searchQuery);
            if (analysis) {
                setAiSuggestion(analysis);
                setFilters(prev => {
                    const newFilters = { ...prev, searchQuery };
                    if (analysis.suggestedCategory && analysis.suggestedCategory !== 'All' && categories.includes(analysis.suggestedCategory)) {
                        newFilters.category = analysis.suggestedCategory;
                    }
                    if (analysis.suggestedLocation) {
                        const matchedLocation = locations.find(
                            loc => loc.toLowerCase().includes(analysis.suggestedLocation.toLowerCase())
                        );
                        if (matchedLocation) {
                            newFilters.location = matchedLocation;
                        }
                    }
                    return newFilters;
                });
            }
        } catch (error) {
            console.error('AI Search analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    }, [filters.searchQuery, categories, locations]);

    const value = useMemo(() => ({
        companies,
        categories,
        locations,
        isLoadingCompanies,
        isLoadingCategories,
        isLoadingLocations,
        companiesError,
        filters,
        setFilters,
        savedCompanyIds,
        toggleFavorite,
        lang,
        setLang,
        isAnalyzing,
        aiSuggestion,
        handleSearch,
        refreshCompanies: fetchCompanies
    }), [
        companies, categories, locations, isLoadingCompanies, isLoadingCategories,
        isLoadingLocations, companiesError, filters, savedCompanyIds,
        toggleFavorite, lang, isAnalyzing, aiSuggestion, handleSearch, fetchCompanies
    ]);

    return (
        <MarketplaceContext.Provider value={value}>
            {children}
        </MarketplaceContext.Provider>
    );
};

export const useMarketplace = () => {
    const context = useContext(MarketplaceContext);
    if (context === undefined) {
        throw new Error('useMarketplace must be used within a MarketplaceProvider');
    }
    return context;
};
