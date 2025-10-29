import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'kk', name: 'Қазақша', flag: '🇰🇿' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setIsOpen(false);
  };

  return (
    <div className="relative z-[9999]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-menu-gold to-menu-gold/80 rounded-lg text-menu-green hover:from-menu-gold hover:to-menu-gold/90 transition-all duration-300 shadow-md hover:shadow-gold hover:scale-105 font-semibold relative z-[9999]"
      >
        <Globe className="w-5 h-5" />
        <span>{currentLanguage?.flag} {currentLanguage?.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 glass-effect border border-menu-gold/30 rounded-lg shadow-2xl z-[9999]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full px-4 py-3 text-left hover:bg-menu-gold/20 transition-all duration-200 flex items-center gap-3 ${
                i18n.language === lang.code ? 'text-menu-gold bg-menu-gold/10 font-semibold' : 'text-menu-cream/80'
              } ${lang.code === 'en' ? 'rounded-t-lg' : ''} ${lang.code === 'kk' ? 'rounded-b-lg' : ''}`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
