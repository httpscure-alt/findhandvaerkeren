/**
 * Analytics Tracking Utilities
 * 
 * Helper functions for tracking events, conversions, and user interactions.
 * Works with Google Tag Manager, GA4, and other analytics platforms.
 */

// Type definitions for tracking events
export interface TrackingEvent {
    event: string;
    category?: string;
    action?: string;
    label?: string;
    value?: number;
    [key: string]: any;
}

export interface ConversionEvent {
    event: string;
    transactionId?: string;
    value?: number;
    currency?: string;
    items?: any[];
    [key: string]: any;
}

/**
 * Push event to dataLayer (for GTM/GA4)
 */
export const trackEvent = (eventData: TrackingEvent) => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push(eventData);
        console.log('📊 Event tracked:', eventData);
    } else {
        console.warn('⚠️ dataLayer not available. Event not tracked:', eventData);
    }
};

/**
 * Track page view
 */
export const trackPageView = (pagePath: string, pageTitle?: string) => {
    trackEvent({
        event: 'page_view',
        page_path: pagePath,
        page_title: pageTitle || document.title,
    });
};

/**
 * Track user signup
 */
export const trackSignup = (method: 'email' | 'google' | 'facebook', role: 'CONSUMER' | 'PARTNER') => {
    trackEvent({
        event: 'sign_up',
        method,
        user_role: role,
    });
};

/**
 * Track user login
 */
export const trackLogin = (method: 'email' | 'google' | 'facebook') => {
    trackEvent({
        event: 'login',
        method,
    });
};

/**
 * Track subscription purchase
 */
export const trackSubscription = (tier: string, billingCycle: string, value: number, currency: string = 'DKK') => {
    trackEvent({
        event: 'purchase',
        transaction_id: `sub_${Date.now()}`,
        value,
        currency,
        items: [
            {
                item_id: tier.toLowerCase(),
                item_name: `${tier} Subscription`,
                item_category: 'Subscription',
                price: value,
                quantity: 1,
            },
        ],
        subscription_tier: tier,
        billing_cycle: billingCycle,
    });
};

/**
 * Track growth service request (SEO/Ads)
 */
export const trackGrowthRequest = (service: 'seo' | 'ads', tier: string, budget?: number) => {
    trackEvent({
        event: 'growth_request',
        service_type: service,
        service_tier: tier,
        budget: budget || 0,
    });
};

/**
 * Track quote request (3 Quotes feature)
 */
export const trackQuoteRequest = (category: string, location?: string) => {
    trackEvent({
        event: 'quote_request',
        category,
        location: location || 'unknown',
    });
};

/**
 * Track company profile view
 */
export const trackCompanyView = (companyId: string, companyName: string, category?: string) => {
    trackEvent({
        event: 'view_company',
        company_id: companyId,
        company_name: companyName,
        category: category || 'unknown',
    });
};

/**
 * Track inquiry sent to company
 */
export const trackInquiry = (companyId: string, companyName: string) => {
    trackEvent({
        event: 'send_inquiry',
        company_id: companyId,
        company_name: companyName,
    });
};

/**
 * Track contact form submission
 */
export const trackContactForm = (subject: string) => {
    trackEvent({
        event: 'contact_form_submit',
        form_subject: subject,
    });
};

/**
 * Track search
 */
export const trackSearch = (searchTerm: string, category?: string, location?: string) => {
    trackEvent({
        event: 'search',
        search_term: searchTerm,
        category: category || 'all',
        location: location || 'all',
    });
};

/**
 * Track button/CTA clicks
 */
export const trackCTAClick = (ctaName: string, ctaLocation: string) => {
    trackEvent({
        event: 'cta_click',
        cta_name: ctaName,
        cta_location: ctaLocation,
    });
};

/**
 * Track outbound link clicks
 */
export const trackOutboundLink = (url: string, linkText: string) => {
    trackEvent({
        event: 'outbound_link',
        link_url: url,
        link_text: linkText,
    });
};

/**
 * Track file downloads
 */
export const trackDownload = (fileName: string, fileType: string) => {
    trackEvent({
        event: 'file_download',
        file_name: fileName,
        file_type: fileType,
    });
};

/**
 * Track video plays
 */
export const trackVideoPlay = (videoTitle: string, videoUrl: string) => {
    trackEvent({
        event: 'video_play',
        video_title: videoTitle,
        video_url: videoUrl,
    });
};

/**
 * Track errors
 */
export const trackError = (errorMessage: string, errorLocation: string) => {
    trackEvent({
        event: 'error',
        error_message: errorMessage,
        error_location: errorLocation,
    });
};

/**
 * Set user properties (for GA4)
 */
export const setUserProperties = (properties: { [key: string]: any }) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('set', 'user_properties', properties);
    }
};

/**
 * Set user ID (for cross-device tracking)
 */
export const setUserId = (userId: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('config', (import.meta as any).env?.VITE_GA4_ID, {
            user_id: userId,
        });
    }
};

// Export all tracking functions
export const analytics = {
    trackEvent,
    trackPageView,
    trackSignup,
    trackLogin,
    trackSubscription,
    trackGrowthRequest,
    trackQuoteRequest,
    trackCompanyView,
    trackInquiry,
    trackContactForm,
    trackSearch,
    trackCTAClick,
    trackOutboundLink,
    trackDownload,
    trackVideoPlay,
    trackError,
    setUserProperties,
    setUserId,
};
