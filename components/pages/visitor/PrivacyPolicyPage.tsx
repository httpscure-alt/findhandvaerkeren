import React from 'react';
import { Language } from '../../../types';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PrivacyPolicyPageProps {
  lang: Language;
  onBack?: () => void;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ lang, onBack }) => {
  const navigate = useNavigate();
  const isDa = lang === 'da';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-[#1D1D1F] mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>{isDa ? 'Tilbage' : 'Back'}</span>
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Shield className="text-blue-600" size={24} />
          </div>
          <h1 className="text-4xl font-bold text-[#1D1D1F]">
            {isDa ? 'Fortrolighedspolitik' : 'Privacy Policy'}
          </h1>
        </div>
        <p className="text-gray-500">
          {isDa 
            ? 'Sidst opdateret: 15. januar 2024'
            : 'Last updated: January 15, 2024'}
        </p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-12 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-4">
            {isDa ? '1. Introduktion' : '1. Introduction'}
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {isDa 
              ? 'Findhåndværkeren ("vi", "os", "vores") respekterer dit privatliv og forpligter sig til at beskytte dine personlige oplysninger. Denne fortrolighedspolitik forklarer, hvordan vi indsamler, bruger, opbevarer og beskytter dine oplysninger, når du bruger vores platform.'
              : 'Findhåndværkeren ("we", "us", "our") respects your privacy and is committed to protecting your personal information. This privacy policy explains how we collect, use, store, and protect your information when you use our platform.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-4">
            {isDa ? '2. Oplysninger vi indsamler' : '2. Information We Collect'}
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[#1D1D1F] mb-2">
                {isDa ? 'Personlige oplysninger' : 'Personal Information'}
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>{isDa ? 'Navn og kontaktoplysninger (email, telefonnummer)' : 'Name and contact information (email, phone number)'}</li>
                <li>{isDa ? 'Virksomhedsoplysninger (for partnere)' : 'Business information (for partners)'}</li>
                <li>{isDa ? 'Betalingsoplysninger (via Stripe)' : 'Payment information (via Stripe)'}</li>
                <li>{isDa ? 'Verifikationsdokumenter' : 'Verification documents'}</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1D1D1F] mb-2">
                {isDa ? 'Brugerdata' : 'Usage Data'}
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>{isDa ? 'Søgehistorik og præferencer' : 'Search history and preferences'}</li>
                <li>{isDa ? 'Interaktioner med platformen' : 'Interactions with the platform'}</li>
                <li>{isDa ? 'IP-adresse og browseroplysninger' : 'IP address and browser information'}</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-4">
            {isDa ? '3. Hvordan vi bruger dine oplysninger' : '3. How We Use Your Information'}
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>{isDa ? 'At levere og forbedre vores tjenester' : 'To provide and improve our services'}</li>
            <li>{isDa ? 'At behandle betalinger og abonnementer' : 'To process payments and subscriptions'}</li>
            <li>{isDa ? 'At verificere partnere og virksomheder' : 'To verify partners and businesses'}</li>
            <li>{isDa ? 'At sende vigtige meddelelser og opdateringer' : 'To send important notifications and updates'}</li>
            <li>{isDa ? 'At analysere brugen af platformen' : 'To analyze platform usage'}</li>
            <li>{isDa ? 'At overholde juridiske forpligtelser' : 'To comply with legal obligations'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-4">
            {isDa ? '4. Cookies' : '4. Cookies'}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {isDa 
              ? 'Vi bruger cookies og lignende teknologier til at forbedre din oplevelse. Du kan administrere dine cookie-indstillinger i din browser eller via vores cookie-banner.'
              : 'We use cookies and similar technologies to enhance your experience. You can manage your cookie settings in your browser or via our cookie banner.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-4">
            {isDa ? '5. Dine rettigheder' : '5. Your Rights'}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {isDa 
              ? 'Under GDPR har du følgende rettigheder:'
              : 'Under GDPR, you have the following rights:'}
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>{isDa ? 'Ret til at få adgang til dine personlige oplysninger' : 'Right to access your personal information'}</li>
            <li>{isDa ? 'Ret til at rette unøjagtige oplysninger' : 'Right to rectify inaccurate information'}</li>
            <li>{isDa ? 'Ret til at slette dine oplysninger' : 'Right to delete your information'}</li>
            <li>{isDa ? 'Ret til at begrænse behandlingen' : 'Right to restrict processing'}</li>
            <li>{isDa ? 'Ret til dataportabilitet' : 'Right to data portability'}</li>
            <li>{isDa ? 'Ret til at gøre indsigelse' : 'Right to object'}</li>
            <li>{isDa ? 'Ret til at trække samtykke tilbage' : 'Right to withdraw consent'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-4">
            {isDa ? '6. Datasikkerhed' : '6. Data Security'}
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {isDa 
              ? 'Vi implementerer passende tekniske og organisatoriske foranstaltninger for at beskytte dine personlige oplysninger mod uautoriseret adgang, tab eller ødelæggelse. Dette inkluderer kryptering, sikre servere og regelmæssige sikkerhedsrevisioner.'
              : 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, loss, or destruction. This includes encryption, secure servers, and regular security audits.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-4">
            {isDa ? '7. Kontakt os' : '7. Contact Us'}
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {isDa 
              ? 'Hvis du har spørgsmål om denne fortrolighedspolitik eller ønsker at udøve dine rettigheder, kan du kontakte os på:'
              : 'If you have questions about this privacy policy or wish to exercise your rights, you can contact us at:'}
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <p className="font-semibold text-[#1D1D1F]">Email:</p>
            <a href="mailto:privacy@findhandvaerkeren.dk" className="text-blue-600 hover:text-blue-700">
              privacy@findhandvaerkeren.dk
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;





