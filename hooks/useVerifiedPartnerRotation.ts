import { useState, useEffect, useMemo } from 'react';
import { Company } from '../types';
import { api } from '../services/api';

interface UseVerifiedPartnerRotationOptions {
  companies: Company[];
  rotationInterval?: number; // in milliseconds
  useApi?: boolean; // Whether to fetch from API
}

/**
 * Hook to rotate through verified partners
 * @param companies - Array of all companies (fallback if API unavailable)
 * @param rotationInterval - Time in milliseconds between rotations (default: 8000ms)
 * @param useApi - Whether to fetch verified companies from API (default: false)
 * @returns Currently selected verified partner, or null if none exist
 */
export const useVerifiedPartnerRotation = (
  companies: Company[],
  rotationInterval: number = 8000,
  useApi: boolean = false
): Company | null => {
  const [apiCompanies, setApiCompanies] = useState<Company[]>([]);

  // Fetch verified companies from API if enabled
  useEffect(() => {
    if (useApi) {
      api.getCompanies({ verifiedOnly: true })
        .then(({ companies: fetchedCompanies }) => {
          setApiCompanies(fetchedCompanies || []);
        })
        .catch(() => {
          // API not available, use fallback
          setApiCompanies([]);
        });
    }
  }, [useApi]);

  // Use API companies if available, otherwise use provided companies
  const allCompanies = useMemo(() => {
    return useApi && apiCompanies.length > 0 ? apiCompanies : companies;
  }, [useApi, apiCompanies, companies]);

  // Filter and memoize verified partners - Use verificationStatus === 'verified' (Danish verification requirements)
  const verifiedPartners = useMemo(() => {
    return allCompanies.filter(company => 
      company.verificationStatus === 'verified' || company.isVerified === true
    );
  }, [allCompanies]);

  // Get random starting index
  const getRandomIndex = (max: number) => {
    return Math.floor(Math.random() * max);
  };

  // Initialize with random partner (use initial companies, not memoized)
  const [currentIndex, setCurrentIndex] = useState(() => {
    const initialPartners = companies.filter(company => 
      company.verificationStatus === 'verified' || company.isVerified === true
    );
    if (initialPartners.length === 0) return -1;
    return Math.floor(Math.random() * initialPartners.length);
  });

  // Reset index when verified partners change (e.g., API data loads)
  useEffect(() => {
    if (verifiedPartners.length > 0) {
      setCurrentIndex(Math.floor(Math.random() * verifiedPartners.length));
    } else {
      setCurrentIndex(-1);
    }
  }, [verifiedPartners.length]);

  // Rotate through verified partners every 8 seconds
  useEffect(() => {
    if (verifiedPartners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        // Move to next partner, loop back to start
        return (prevIndex + 1) % verifiedPartners.length;
      });
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [verifiedPartners.length, rotationInterval]);

  // Return current partner or null
  if (verifiedPartners.length === 0 || currentIndex === -1) {
    return null;
  }

  return verifiedPartners[currentIndex];
};
