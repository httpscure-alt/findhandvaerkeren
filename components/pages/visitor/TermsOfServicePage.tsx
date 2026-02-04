import React from 'react';
import { Language } from '../../../types';
import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TermsOfServicePageProps {
  lang: Language;
  onBack?: () => void;
}

const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ lang, onBack }) => {
  const navigate = useNavigate();
  const isDa = lang === 'da';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const content = isDa ? {
    title: "Vilkår og Betingelser",
    lastUpdated: "Senest opdateret: 15. januar 2024",
    sections: [
      {
        title: "1. Accept af vilkår",
        text: "Ved at bruge Findhåndværkeren (“Platformen”) accepterer du disse vilkår. Hvis du ikke accepterer vilkårene, må Platformen ikke anvendes."
      },
      {
        title: "2. Beskrivelse af tjenesten",
        text: "Findhåndværkeren er en online platform, der forbinder forbrugere med professionelle serviceudbydere (“Partnere”) i Danmark. Findhåndværkeren fungerer udelukkende som platform og udfører, overvåger eller garanterer ikke partnernes ydelser."
      },
      {
        title: "3. Brugerkonti",
        text: "Brugere er ansvarlige for at beskytte deres loginoplysninger og for al aktivitet på kontoen. Vi forbeholder os retten til at suspendere eller fjerne konti med urigtige oplysninger."
      },
      {
        title: "4. Partnerabonnementer og betaling",
        text: "Abonnementer faktureres månedligt eller årligt afhængigt af valgt plan. Betalinger håndteres via tredjepartsudbydere (f.eks. Stripe). Abonnementer kan opsiges til enhver tid. Betalte beløb refunderes ikke. Priser kan ændres med rimeligt varsel."
      },
      {
        title: "5. Verificering",
        text: "Nogle Partnere kan være markeret som “Verificeret”. Verificering betyder, at der er foretaget grundlæggende identitets- eller virksomhedskontrol. Verificering er ikke en garanti for kvalitet, pris eller resultat."
      },
      {
        title: "6. Forbrugere og Partnere",
        text: "Aftaler indgås udelukkende mellem forbruger og Partner. Findhåndværkeren er ikke ansvarlig for Partnernes ydelser."
      },
      {
        title: "7. Opsigelse og suspension",
        text: "Vi kan suspendere eller lukke konti ved misbrug, svig eller overtrædelse af vilkårene. Brugere kan til enhver tid stoppe brugen af Platformen."
      },
      {
        title: "8. Immaterielle rettigheder",
        text: "Alt indhold på Platformen tilhører Findhåndværkeren eller vores licensgivere og er beskyttet af gældende lovgivning."
      },
      {
        title: "9. Ansvarsbegrænsning",
        text: "Platformen leveres “som den er”. Findhåndværkeren er ikke ansvarlig for indirekte tab. Vores samlede ansvar overstiger ikke de gebyrer, som Partneren har betalt de seneste 12 måneder."
      },
      {
        title: "10. Ændringer af vilkår",
        text: "Vi kan opdatere vilkårene løbende. Fortsat brug af Platformen udgør accept af ændringer."
      },
      {
        title: "11. Privatliv og databeskyttelse",
        text: "Personoplysninger behandles i overensstemmelse med vores Privatlivspolitik og GDPR."
      },
      {
        title: "12. Lovvalg og værneting",
        text: "Vilkårene er underlagt dansk ret. Tvister afgøres ved danske domstole."
      }
    ],
    contact: {
      title: "13. Kontakt",
      email: "legal@findhandvaerkeren.dk"
    }
  } : {
    title: "Terms of Service",
    lastUpdated: "Last updated: January 15, 2024",
    sections: [
      {
        title: "1. Acceptance of Terms",
        text: "By accessing or using Findhåndværkeren (“the Platform”), you agree to be bound by these Terms of Service (“Terms”). If you do not agree, you may not use the Platform."
      },
      {
        title: "2. Description of the Service",
        text: "Findhåndværkeren is an online platform that connects consumers with professional service providers (“Partners”) in Denmark. Findhåndværkeren acts solely as a platform provider and does not perform, supervise, or guarantee any services provided by Partners."
      },
      {
        title: "3. User Accounts",
        text: "Users are responsible for maintaining the confidentiality of their account credentials and for all activities conducted through their account. We reserve the right to suspend or remove accounts containing false or misleading information."
      },
      {
        title: "4. Partner Subscriptions & Payments",
        text: "Subscriptions are billed monthly or annually depending on the selected plan. Payments are processed via third-party providers (e.g. Stripe). Subscriptions may be cancelled at any time. Fees already paid are non-refundable. Pricing may be updated with reasonable prior notice."
      },
      {
        title: "5. Verification Disclaimer",
        text: "Some Partners may be marked as “Verified”. Verification means that basic identity or business checks have been performed. Verification does not guarantee service quality, pricing, legality, or outcomes."
      },
      {
        title: "6. Consumers and Partners",
        text: "Any agreement entered into between a consumer and a Partner is solely between those parties. Findhåndværkeren is not responsible for services provided by Partners."
      },
      {
        title: "7. Termination and Suspension",
        text: "We may suspend or terminate accounts in cases of misuse, fraud, or violation of these Terms. Users may stop using the Platform at any time."
      },
      {
        title: "8. Intellectual Property",
        text: "All content on the Platform is owned by Findhåndværkeren or its licensors and is protected by applicable intellectual property laws."
      },
      {
        title: "9. Limitation of Liability",
        text: "The Platform is provided “as is”. To the maximum extent permitted by law, Findhåndværkeren shall not be liable for indirect or consequential damages. Total liability shall not exceed the fees paid by a Partner during the previous 12 months."
      },
      {
        title: "10. Changes to Terms",
        text: "We may update these Terms from time to time. Continued use of the Platform constitutes acceptance of updated Terms."
      },
      {
        title: "11. Privacy & Data Protection",
        text: "Personal data is processed in accordance with our Privacy Policy and the GDPR."
      },
      {
        title: "12. Governing Law and Jurisdiction",
        text: "These Terms are governed by Danish law. Any disputes shall be subject to the exclusive jurisdiction of the Danish courts."
      }
    ],
    contact: {
      title: "13. Contact",
      email: "legal@findhandvaerkeren.dk"
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 animate-fadeIn text-left">
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
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
            <FileText className="text-[#1D1D1F]" size={24} />
          </div>
          <h1 className="text-4xl font-extrabold text-[#1D1D1F] tracking-tight">
            {content.title}
          </h1>
        </div>
        <p className="text-[#86868B] font-medium">
          {content.lastUpdated}
        </p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-[2rem] border border-gray-100 p-8 md:p-12 space-y-12 shadow-sm">
        {content.sections.map((section, index) => (
          <section key={index}>
            <h2 className="text-2xl font-black text-[#1D1D1F] mb-4">
              {section.title}
            </h2>
            <p className="text-[#1D1D1F] leading-relaxed font-medium opacity-80">
              {section.text}
            </p>
          </section>
        ))}

        <section>
          <h2 className="text-2xl font-black text-[#1D1D1F] mb-4">
            {content.contact.title}
          </h2>
          <div className="p-6 bg-[#F5F5F7] rounded-2xl">
            <p className="font-bold text-[#1D1D1F] mb-2">Email:</p>
            <a href={`mailto:${content.contact.email}`} className="text-[#1D1D1F] font-black underline hover:opacity-70 transition-opacity">
              {content.contact.email}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
