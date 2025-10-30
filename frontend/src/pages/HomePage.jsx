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
    <div className="min-h-screen relative overflow-hidden" style={{backgroundColor: '#10443b'}}>
      {/* Clean green background */}
      <div className="absolute inset-0 z-0" style={{backgroundColor: '#10443b'}} />

      {/* Language selector - top right corner */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSelector />
      </div>

      {/* Main content - centered and simple */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
        {/* Decorative background patterns */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
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
              className="w-80 h-80 mx-auto object-contain"
            />
          </div>
          
          {/* Company name - Halal Hall */}
          <h1 className="text-7xl font-bold text-menu-gold mb-8 drop-shadow-2xl tracking-wider" style={{fontFamily: 'serif'}}>
            Halal Hall
          </h1>
        </div>

        {/* Navigation buttons */}
        <div className="flex flex-col md:flex-row md:justify-center md:items-center gap-4 animate-fadeInUp" style={{animationDelay: '0.3s'}}>
          <button
            onClick={() => navigate('/menu')}
            className="group px-10 py-4 bg-transparent border-4 border-menu-gold text-menu-gold text-xl font-bold rounded-full hover:bg-menu-gold hover:text-menu-green transform hover:scale-105 transition-all duration-300 shadow-xl shadow-menu-gold/20 flex items-center gap-3"
          >
            <Utensils className="w-6 h-6" />
            {t('menu.title')?.toUpperCase() || 'КУХНЯ'}
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate('/bar')}
            className="group px-10 py-4 bg-transparent border-4 border-menu-gold text-menu-gold text-xl font-bold rounded-full hover:bg-menu-gold hover:text-menu-green transform hover:scale-105 transition-all duration-300 shadow-xl shadow-menu-gold/20 flex items-center gap-3"
          >
            <Wine className="w-6 h-6" />
            {t('menu.bar')?.toUpperCase() || 'БАР'}
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate('/pizza')}
            className="group px-10 py-4 bg-transparent border-4 border-menu-gold text-menu-gold text-xl font-bold rounded-full hover:bg-menu-gold hover:text-menu-green transform hover:scale-105 transition-all duration-300 shadow-xl shadow-menu-gold/20 flex items-center gap-3"
          >
            <Pizza className="w-6 h-6" />
            {t('menu.pizza')?.toUpperCase() || 'ПИЦЦА'}
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
