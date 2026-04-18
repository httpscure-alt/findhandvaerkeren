import { useEffect } from 'react';

interface SEOProps {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
    ogType?: string;
}

export const useSEO = ({ title, description, canonical, ogImage, ogType = 'website' }: SEOProps) => {
    useEffect(() => {
        // Title
        document.title = title;

        // Meta description
        const setMeta = (selector: string, attr: string, value: string) => {
            let el = document.querySelector(selector) as HTMLMetaElement | null;
            if (el) el.setAttribute(attr, value);
        };

        setMeta('meta[name="description"]', 'content', description);
        setMeta('meta[property="og:title"]', 'content', title);
        setMeta('meta[property="og:description"]', 'content', description);
        setMeta('meta[property="twitter:title"]', 'content', title);
        setMeta('meta[property="twitter:description"]', 'content', description);
        if (ogType) setMeta('meta[property="og:type"]', 'content', ogType);
        if (ogImage) {
            setMeta('meta[property="og:image"]', 'content', ogImage);
            setMeta('meta[property="twitter:image"]', 'content', ogImage);
        }

        // Canonical
        if (canonical) {
            let can = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
            if (can) can.setAttribute('href', canonical);
        }
    }, [title, description, canonical, ogImage, ogType]);
};
