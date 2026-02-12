import React, { useEffect } from 'react';

interface TagManagerProps {
    gtmId?: string;
    ga4Id?: string;
    facebookPixelId?: string;
    hotjarId?: string;
    clarityId?: string;
}

/**
 * TagManager Component
 * 
 * Centralized tag management for analytics and tracking tools.
 * Add your tracking IDs to environment variables for production.
 * 
 * Environment Variables:
 * - VITE_GTM_ID: Google Tag Manager ID (GTM-XXXXXXX)
 * - VITE_GA4_ID: Google Analytics 4 ID (G-XXXXXXXXXX)
 * - VITE_FB_PIXEL_ID: Facebook Pixel ID
 * - VITE_HOTJAR_ID: Hotjar Site ID
 * - VITE_CLARITY_ID: Microsoft Clarity ID
 */
const TagManager: React.FC<TagManagerProps> = ({
    gtmId = (import.meta as any).env?.VITE_GTM_ID,
    ga4Id = (import.meta as any).env?.VITE_GA4_ID,
    facebookPixelId = (import.meta as any).env?.VITE_FB_PIXEL_ID,
    hotjarId = (import.meta as any).env?.VITE_HOTJAR_ID,
    clarityId = (import.meta as any).env?.VITE_CLARITY_ID,
}) => {
    useEffect(() => {
        // Google Tag Manager
        if (gtmId) {
            const script = document.createElement('script');
            script.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${gtmId}');
      `;
            document.head.appendChild(script);
        }

        // Google Analytics 4 (Direct Implementation - fallback if GTM not used)
        if (ga4Id && !gtmId) {
            const script1 = document.createElement('script');
            script1.async = true;
            script1.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
            document.head.appendChild(script1);

            const script2 = document.createElement('script');
            script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${ga4Id}', {
          page_path: window.location.pathname,
          send_page_view: true
        });
      `;
            document.head.appendChild(script2);
        }

        // Facebook Pixel
        if (facebookPixelId) {
            const script = document.createElement('script');
            script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${facebookPixelId}');
        fbq('track', 'PageView');
      `;
            document.head.appendChild(script);
        }

        // Hotjar
        if (hotjarId) {
            const script = document.createElement('script');
            script.innerHTML = `
        (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:${hotjarId},hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `;
            document.head.appendChild(script);
        }

        // Microsoft Clarity
        if (clarityId) {
            const script = document.createElement('script');
            script.innerHTML = `
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${clarityId}");
      `;
            document.head.appendChild(script);
        }
    }, [gtmId, ga4Id, facebookPixelId, hotjarId, clarityId]);

    return null;
};

export default TagManager;
