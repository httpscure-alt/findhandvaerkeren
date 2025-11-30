import React from 'react';
import { Language, ViewState } from '../../types';
import { translations } from '../../translations';
import { Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  lang: Language;
  onNavigate: (view: ViewState) => void;
}

const Footer: React.FC<FooterProps> = ({ lang, onNavigate }) => {
  const t = translations[lang];

  const footerLinks = {
    en: {
      company: {
        title: 'Company',
        links: [
          { label: 'About', view: ViewState.ABOUT },
          { label: 'How It Works', view: ViewState.HOW_IT_WORKS },
          { label: 'Pricing', view: ViewState.PRICING },
          { label: 'Blog', view: ViewState.BLOG },
          { label: 'Contact', view: ViewState.CONTACT }
        ]
      },
      legal: {
        title: 'Legal',
        links: [
          { label: 'Terms & Conditions', view: ViewState.CONTACT },
          { label: 'Privacy Policy', view: ViewState.CONTACT },
          { label: 'Cookie Policy', view: ViewState.CONTACT }
        ]
      },
      support: {
        title: 'Support',
        links: [
          { label: 'Help Center', view: ViewState.CONTACT },
          { label: 'FAQ', view: ViewState.CONTACT },
          { label: 'Contact Support', view: ViewState.CONTACT }
        ]
      }
    },
    da: {
      company: {
        title: 'Virksomhed',
        links: [
          { label: 'Om Os', view: ViewState.ABOUT },
          { label: 'Sådan Fungerer Det', view: ViewState.HOW_IT_WORKS },
          { label: 'Priser', view: ViewState.PRICING },
          { label: 'Blog', view: ViewState.BLOG },
          { label: 'Kontakt', view: ViewState.CONTACT }
        ]
      },
      legal: {
        title: 'Juridisk',
        links: [
          { label: 'Vilkår & Betingelser', view: ViewState.CONTACT },
          { label: 'Fortrolighedspolitik', view: ViewState.CONTACT },
          { label: 'Cookiepolitik', view: ViewState.CONTACT }
        ]
      },
      support: {
        title: 'Support',
        links: [
          { label: 'Hjælpecenter', view: ViewState.CONTACT },
          { label: 'FAQ', view: ViewState.CONTACT },
          { label: 'Kontakt Support', view: ViewState.CONTACT }
        ]
      }
    }
  };

  const links = footerLinks[lang];

  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#1D1D1F] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="font-bold text-xl text-[#1D1D1F]">Findhåndværkeren</span>
            </div>
            <p className="text-nexus-subtext text-sm mb-4">
              {lang === 'da'
                ? 'Danmarks førende B2B-markedsplads for verificerede partnere.'
                : 'Denmark\'s leading B2B marketplace for verified partners.'}
            </p>
            <div className="space-y-2 text-sm text-nexus-subtext">
              <div className="flex items-center gap-2">
                <Mail size={14} />
                <span>hello@findhandvaerkeren.dk</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} />
                <span>+45 12 34 56 78</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                <span>København, Denmark</span>
              </div>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-[#1D1D1F] mb-4">{links.company.title}</h3>
            <ul className="space-y-2">
              {links.company.links.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => onNavigate(link.view)}
                    className="text-sm text-nexus-subtext hover:text-[#1D1D1F] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-[#1D1D1F] mb-4">{links.legal.title}</h3>
            <ul className="space-y-2">
              {links.legal.links.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => onNavigate(link.view)}
                    className="text-sm text-nexus-subtext hover:text-[#1D1D1F] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-[#1D1D1F] mb-4">{links.support.title}</h3>
            <ul className="space-y-2">
              {links.support.links.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => onNavigate(link.view)}
                    className="text-sm text-nexus-subtext hover:text-[#1D1D1F] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-nexus-subtext text-sm">
            © 2024 Findhåndværkeren. {lang === 'da' ? 'Alle rettigheder forbeholdes.' : 'All rights reserved.'}
          </p>
          <div className="flex items-center gap-6 text-sm text-nexus-subtext">
            <span>{lang === 'da' ? 'Designet med' : 'Designed with'} ❤️</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
