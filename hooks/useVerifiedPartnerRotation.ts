import { useState, useEffect, useMemo } from 'react';
import { Company } from '../types';

interface UseVerifiedPartnerRotationOptions {
  companies: Company[];
  rotationInterval?: number; // in milliseconds
}

/**
 * Hook to rotate through verified partners
 * @param companies - Array of all companies
 * @param rotationInterval - Time in milliseconds between rotations (default: 8000ms)
 * @returns Currently selected verified partner, or null if none exist
 */
export const useVerifiedPartnerRotation = (
  companies: Company[],
  rotationInterval: number = 8000
): Company | null => {
  // Filter and memoize verified partners
  const verifiedPartners = useMemo(() => {
    return companies.filter(company => company.isVerified === true);
  }, [companies]);

  // Get random starting index
  const getRandomIndex = (max: number) => {
    return Math.floor(Math.random() * max);
  };

  // Initialize with random partner
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (verifiedPartners.length === 0) return -1;
    return getRandomIndex(verifiedPartners.length);
  });

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
