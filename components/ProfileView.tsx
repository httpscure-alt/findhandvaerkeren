import React, { useState } from 'react';
import { Company, Language, ModalState } from '../types';
import { ArrowLeft, Globe, MapPin, CheckCircle, Star, ArrowRight, Quote, Layers, Briefcase } from 'lucide-react';
import { translations } from '../translations';

interface ProfileViewProps {
  company: Company;
  onBack: () => void;
  onOpenModal: (type: ModalState) => void;
  lang: Language;
}

const ProfileView: React.FC<ProfileViewProps> = ({ company, onBack, onOpenModal, lang }) => {
  const t = translations[lang].profile;
  // Map English tab names to translated tab names if necessary, or just use keys
  const tabs = [t.about, t.services, t.portfolio, t.testimonials];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const renderServices = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
      {company.services.length > 0 ? company.services.map((service, idx) => (
        <div key={idx} className="bg-[#F5F5F7] p-8 rounded-3xl border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
            <Layers size={24} className="text-nexus-text" />
          </div>
          <h3 className="text-lg font-bold text-nexus-text mb-2">{service.title}</h3>
          <p className="text-nexus-subtext leading-relaxed">{service.description}</p>
        </div>
      )) : (
        <div className="col-span-2 text-center py-12 text-gray-400 italic">{t.noContent}</div>
      )}
    </div>
  );

  const renderPortfolio = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
      {company.portfolio.length > 0 ? company.portfolio.map((item, idx) => (
        <div key={idx} className="group relative rounded-3xl overflow-hidden aspect-[4/3] shadow-sm hover:shadow-xl transition-all">
          <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
          <img src={item.imageUrl} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
             <span className="text-xs font-medium text-nexus-accent uppercase tracking-wider bg-white/10 backdrop-blur-md w-fit px-3 py-1 rounded-full mb-2 border border-white/20">{item.category}</span>
             <h3 className="text-2xl font-bold text-white">{item.title}</h3>
          </div>
        </div>
      )) : (
        <div className="col-span-2 text-center py-12 text-gray-400 italic">{t.noContent}</div>
      )}
    </div>
  );

  const renderTestimonials = () => (
    <div className="grid grid-cols-1 gap-6 animate-fadeIn">
      {company.testimonials.length > 0 ? company.testimonials.map((testimonial, idx) => (
        <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative">
          <Quote className="absolute top-8 right-8 text-gray-100" size={48} />
          <div className="flex items-center gap-1 mb-4">
             {[...Array(5)].map((_, i) => (
               <Star key={i} size={14} className={`${i < testimonial.rating ? 'fill-nexus-verified text-nexus-verified' : 'text-gray-200'}`} />
             ))}
          </div>
          <p className="text-lg text-nexus-text italic mb-6 relative z-10">"{testimonial.content}"</p>
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                {testimonial.author.charAt(0)}
             </div>
             <div>
                <div className="font-bold text-sm text-nexus-text">{testimonial.author}</div>
                <div className="text-xs text-gray-500">{testimonial.role}, {testimonial.company}</div>
             </div>
          </div>
        </div>
      )) : (
        <div className="col-span-1 text-center py-12 text-gray-400 italic">{t.noContent}</div>
      )}
    </div>
  );

  return (
    <div className="animate-fadeIn">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-96 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60 z-10"></div>
        <img src={company.bannerUrl} alt="Cover" className="w-full h-full object-cover blur-sm scale-105 transform transition-transform duration-[20s] hover:scale-110" />
        
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 md:p-10 max-w-7xl mx-auto w-full">
          <button 
            onClick={onBack}
            className="self-start bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 hover:bg-white/20 transition-all border border-white/10"
          >
            <ArrowLeft size={16} /> {t.back}
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-30 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Column */}
          <div className="flex-1">
            {/* Header Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 mb-8">
              <div className="flex flex-col md:flex-row md:items-center gap-8">
                <div className="w-32 h-32 rounded-2xl bg-white shadow-lg p-1 shrink-0 border border-gray-50">
                  <img src={company.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold text-nexus-text tracking-tight">{company.name}</h1>
                    {company.isVerified && <CheckCircle className="text-nexus-verified shrink-0" size={28} fill="#F59E0B" color="white" />}
                  </div>
                  <p className="text-nexus-subtext text-lg mb-6 font-light">{company.shortDescription}</p>
                  <div className="flex flex-wrap gap-3">
                    {company.tags.map(tag => (
                      <span key={tag} className="px-4 py-1.5 bg-[#F5F5F7] text-gray-600 rounded-full text-xs font-medium tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-gray-200 mb-8 px-2 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-medium transition-all relative whitespace-nowrap ${
                    activeTab === tab ? 'text-[#1D1D1F]' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1D1D1F] rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === t.about && (
                <div className="space-y-8 animate-fadeIn bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
                  <div>
                    <h2 className="text-2xl font-bold text-nexus-text mb-4">{t.about} Us</h2>
                    <p className="text-nexus-subtext leading-relaxed text-lg font-light">{company.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="p-8 bg-[#F5F5F7] rounded-3xl border border-gray-100">
                      <h3 className="font-bold text-nexus-text mb-3 text-lg">{t.mission}</h3>
                      <p className="text-nexus-subtext leading-relaxed">To redefine industry standards through innovation, integrity, and unwavering commitment to client success.</p>
                    </div>
                     <div className="p-8 bg-[#F5F5F7] rounded-3xl border border-gray-100">
                      <h3 className="font-bold text-nexus-text mb-3 text-lg">{t.globalReach}</h3>
                      <p className="text-nexus-subtext leading-relaxed">Operating in 12 countries with 24/7 support capabilities, bridging markets and cultures.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === t.services && renderServices()}
              {activeTab === t.portfolio && renderPortfolio()}
              {activeTab === t.testimonials && renderTestimonials()}
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="w-full lg:w-80 space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-24">
              <h3 className="font-bold text-xl mb-6">{t.contactInfo}</h3>
              
              <div className="space-y-5 mb-8">
                <div className="flex items-start gap-4 text-nexus-subtext group cursor-pointer">
                  <div className="p-2 bg-[#F5F5F7] rounded-full group-hover:bg-gray-200 transition-colors">
                    <MapPin size={18} className="text-nexus-text" />
                  </div>
                  <span className="text-sm mt-1">{company.location}</span>
                </div>
                <div className="flex items-center gap-4 text-nexus-subtext group cursor-pointer">
                   <div className="p-2 bg-[#F5F5F7] rounded-full group-hover:bg-gray-200 transition-colors">
                    <Globe size={18} className="text-nexus-text" />
                  </div>
                  <a href={`https://${company.website}`} className="text-sm hover:text-nexus-accent transition-colors border-b border-transparent hover:border-nexus-accent">{company.website}</a>
                </div>
                 <div className="flex items-center gap-4 text-nexus-subtext">
                   <div className="p-2 bg-[#F5F5F7] rounded-full">
                    <Star size={18} className="fill-nexus-verified text-nexus-verified" />
                  </div>
                  <span className="text-sm font-medium text-nexus-text">{company.rating} <span className="text-gray-400 font-normal">({company.reviewCount} reviews)</span></span>
                </div>
              </div>

              <button 
                onClick={() => onOpenModal(ModalState.CONTACT_VENDOR)}
                className="w-full py-4 rounded-2xl bg-[#1D1D1F] text-white font-medium shadow-lg hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {t.contactVendor}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;