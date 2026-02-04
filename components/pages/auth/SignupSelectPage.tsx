import React from 'react';
import { User, Briefcase, ArrowRight, X } from 'lucide-react';
import { Language } from '../../../types';
import { useNavigate } from 'react-router-dom';

interface SignupSelectPageProps {
  lang: Language;
  onBack?: () => void;
}

const SignupSelectPage: React.FC<SignupSelectPageProps> = ({ lang, onBack }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="w-full max-w-md">
        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
            <span className="text-sm">{lang === 'da' ? 'Tilbage' : 'Back'}</span>
          </button>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#1D1D1F] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <h2 className="text-2xl font-bold text-[#1D1D1F]">
              {lang === 'da' ? 'Opret din konto' : 'Create Your Account'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {lang === 'da'
                ? 'Vælg din kontotype'
                : 'Choose your account type'}
            </p>
          </div>

          {/* Account Type Buttons */}
          <div className="space-y-4">
            {/* Consumer Option */}
            <button
              onClick={() => navigate('/signup?role=CONSUMER')}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-[#1D1D1F] hover:bg-gray-50 transition-all group text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-[#1D1D1F]/5 transition-colors">
                    <User className="text-gray-600 group-hover:text-[#1D1D1F] transition-colors" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1D1D1F] text-lg">
                      {lang === 'da' ? 'Jeg er en Forbruger' : "I'm a Consumer"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {lang === 'da'
                        ? 'Find og kontakt håndværkere'
                        : 'Find and contact professionals'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="text-gray-400 group-hover:text-[#1D1D1F] transition-colors" size={20} />
              </div>
            </button>

            {/* Partner/Business Option */}
            <button
              onClick={() => {
                localStorage.setItem('signupRole', 'PARTNER');
                navigate('/signup?role=PARTNER');
              }}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-[#1D1D1F] hover:bg-gray-50 transition-all group text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-[#1D1D1F]/5 transition-colors">
                    <Briefcase className="text-gray-600 group-hover:text-[#1D1D1F] transition-colors" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1D1D1F] text-lg">
                      {lang === 'da' ? 'Jeg er en Virksomhed / Partner' : "I'm a Business / Partner"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {lang === 'da'
                        ? 'List din virksomhed og få leads'
                        : 'List your business and get leads'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="text-gray-400 group-hover:text-[#1D1D1F] transition-colors" size={20} />
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {lang === 'da'
                ? 'Har du allerede en konto? '
                : 'Already have an account? '}
              <button
                onClick={() => navigate('/auth')}
                className="text-[#1D1D1F] hover:underline font-bold"
              >
                {lang === 'da' ? 'Log ind' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupSelectPage;
