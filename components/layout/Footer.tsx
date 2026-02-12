import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Language } from '../../types';
import { translations } from '../../translations';
import { useMarketplace } from '../../contexts/MarketplaceContext';

interface FooterProps {
  lang: Language;
}

const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = translations[lang];
  const { setLang } = useMarketplace();
  const navigate = useNavigate();
  const isDa = lang === 'da';

  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#FBFBFD] border-t border-gray-100 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-[#1D1D1F] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-[#1D1D1F]">Findhåndværkeren</span>
            </div>
            <p className="max-w-sm text-[#86868B] font-medium leading-relaxed mb-8">
              {lang === 'da'
                ? 'Danmarks førende platform for verificerede håndværkere. Vi gør det nemt at finde den rette fagmand til dit næste projekt, og hjælper håndværkere med at vokse gennem professionelle Google Ads og SEO tjenester.'
                : 'Denmark\'s leading platform for verified craftsmen. We make it easy to find the right professional for your next project, and help craftsmen grow with professional Google Ads and SEO services.'}
            </p>

            {/* Language Selector */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLang('da')}
                className={`text-xs font-bold transition-all px-3 py-2 rounded-xl ${lang === 'da' ? 'bg-[#1D1D1F] text-white' : 'text-[#86868B] bg-white border border-gray-100 hover:border-gray-200 shadow-sm'}`}
              >
                Dansk
              </button>
              <button
                onClick={() => setLang('en')}
                className={`text-xs font-bold transition-all px-3 py-2 rounded-xl ${lang === 'en' ? 'bg-[#1D1D1F] text-white' : 'text-[#86868B] bg-white border border-gray-100 hover:border-gray-200 shadow-sm'}`}
              >
                English
              </button>
            </div>
          </div>

          <div className="md:col-span-2 md:col-start-7">
            <h3 className="text-sm font-bold text-[#1D1D1F] mb-6 uppercase tracking-wider">{lang === 'da' ? 'For Forbrugere' : 'For Consumers'}</h3>
            <ul className="space-y-4">
              <li>
                <button onClick={() => handleNavigate('/browse')} className="text-sm text-[#86868B] font-medium hover:text-[#1D1D1F] transition-colors">
                  {t.nav.findPros}
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('/get-offers')} className="text-sm text-[#86868B] font-medium hover:text-[#1D1D1F] transition-colors">
                  {lang === 'da' ? 'Få 3 tilbud' : 'Get 3 quotes'}
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-bold text-[#1D1D1F] mb-6 uppercase tracking-wider">{lang === 'da' ? 'Marketing' : 'Marketing'}</h3>
            <ul className="space-y-4">
              <li>
                <button onClick={() => handleNavigate('/signup?role=PARTNER')} className="text-sm text-[#86868B] font-medium hover:text-[#1D1D1F] transition-colors">
                  {isDa ? 'Bliv verificeret' : 'Get verified'}
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('/pricing')} className="text-sm text-[#86868B] font-medium hover:text-[#1D1D1F] transition-colors">
                  {t.nav.pricing}
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('/for-businesses')} className="text-sm text-[#86868B] font-medium hover:text-[#1D1D1F] transition-colors">
                  {t.nav.forBusinesses}
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-bold text-[#1D1D1F] mb-6 uppercase tracking-wider">{lang === 'da' ? 'Virksomhed' : 'Company'}</h3>
            <ul className="space-y-4">
              <li>
                <button onClick={() => handleNavigate('/about')} className="text-sm text-[#86868B] font-medium hover:text-[#1D1D1F] transition-colors">
                  {t.footer.about}
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('/contact')} className="text-sm text-[#86868B] font-medium hover:text-[#1D1D1F] transition-colors">
                  {t.footer.contact}
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-bold text-[#1D1D1F] mb-6 uppercase tracking-wider">{lang === 'da' ? 'Juridisk' : 'Legal'}</h3>
            <ul className="space-y-4">
              <li>
                <button onClick={() => handleNavigate('/terms')} className="text-sm text-[#86868B] font-medium hover:text-[#1D1D1F] transition-colors">
                  {t.footer.terms}
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('/privacy')} className="text-sm text-[#86868B] font-medium hover:text-[#1D1D1F] transition-colors">
                  {t.footer.privacy}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[#86868B] text-xs font-medium tracking-tight">
            © 2024 Findhåndværkeren. {t.footer.rights}
          </p>
          <div className="flex items-center gap-8">
            <span className="text-[#86868B] text-xs font-semibold hover:text-[#1D1D1F] cursor-pointer transition-colors">LinkedIn</span>
            <span className="text-[#86868B] text-xs font-semibold hover:text-[#1D1D1F] cursor-pointer transition-colors">Facebook</span>
            <span className="text-[#86868B] text-xs font-semibold hover:text-[#1D1D1F] cursor-pointer transition-colors">Trustpilot</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
