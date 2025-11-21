import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Utensils, ChevronRight, Wine, Pizza } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import '../i18n';

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen relative overflow-hidden bg-menu-green">
      {/* Clean orange background */}
      <div className="absolute inset-0 z-0 bg-menu-green" />

      {/* Language selector - top right corner */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
        <LanguageSelector />
      </div>

      {/* Main content - centered and simple */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 md:px-8">
        {/* Decorative background patterns */}
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          {/* Top left pattern */}
          <img 
            src="/img/Logo.png" 
            alt="" 
            className="absolute -top-20 -left-20 w-96 h-96 object-contain opacity-30 rotate-12"
          />
          {/* Top right pattern */}
          <img 
            src="/img/Logo.png" 
            alt="" 
            className="absolute -top-32 -right-32 w-80 h-80 object-contain opacity-20 -rotate-45"
          />
          {/* Bottom left pattern */}
          <img 
            src="/img/Logo.png" 
            alt="" 
            className="absolute -bottom-24 -left-24 w-72 h-72 object-contain opacity-25 -rotate-12"
          />
          {/* Bottom right pattern */}
          <img 
            src="/img/Logo.png" 
            alt="" 
            className="absolute -bottom-40 -right-40 w-96 h-96 object-contain opacity-15 rotate-45"
          />
        </div>

        {/* Logo and Title */}
        <div className="text-center animate-fadeInUp relative z-10">
          {/* Logo image */}
          <div className="mb-4">
            <img 
              src="/img/Logo.png" 
              alt="Halal Hall Logo" 
              className="w-48 h-48 md:w-64 md:h-64 lg:w-96 lg:h-96 mx-auto object-contain"
            />
          </div>
          
          {/* Company name - Vostochnyj Dvor */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 md:mb-8 drop-shadow-2xl tracking-wider" style={{fontFamily: 'serif'}}>
            Vostochnyj Dvor
          </h1>
        </div>

        {/* Navigation buttons */}
        <div className="relative z-20 flex flex-col w-full max-w-md md:max-w-none md:flex-row md:justify-center md:items-center gap-3 md:gap-4 animate-fadeInUp" style={{animationDelay: '0.3s'}}>
          <button
            onClick={() => navigate('/menu')}
            className="px-6 py-3 md:px-10 md:py-4 bg-menu-blue text-white text-base md:text-xl font-bold rounded-full active:scale-95 transition-transform duration-200 shadow-xl flex items-center justify-center gap-2 md:gap-3"
          >
            <Utensils className="w-5 h-5 md:w-6 md:h-6" />
            {t('menu.title')?.toUpperCase() || 'КУХНЯ'}
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <button
            onClick={() => navigate('/bar')}
            className="px-6 py-3 md:px-10 md:py-4 bg-menu-blue text-white text-base md:text-xl font-bold rounded-full active:scale-95 transition-transform duration-200 shadow-xl flex items-center justify-center gap-2 md:gap-3"
          >
            <Wine className="w-5 h-5 md:w-6 md:h-6" />
            {t('menu.bar')?.toUpperCase() || 'БАР'}
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <button
            onClick={() => navigate('/pizza')}
            className="px-6 py-3 md:px-10 md:py-4 bg-menu-blue text-white text-base md:text-xl font-bold rounded-full active:scale-95 transition-transform duration-200 shadow-xl flex items-center justify-center gap-2 md:gap-3"
          >
            <Pizza className="w-5 h-5 md:w-6 md:h-6" />
            {t('menu.pizza')?.toUpperCase() || 'ПИЦЦА'}
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
