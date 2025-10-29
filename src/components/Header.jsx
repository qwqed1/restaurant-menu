import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

const Header = ({ title, onBack, onHome, showBack }) => {
  return (
    <header className="bg-transparent border-b border-menu-gold/20 px-6 py-5 flex items-center justify-between relative z-[100]">
      <button 
        onClick={onBack}
        className={`p-2.5 rounded-full bg-transparent border-2 border-menu-gold hover:bg-menu-gold/20 transition-all duration-300 hover:scale-105 ${
          showBack ? 'visible' : 'invisible'
        }`}
      >
        <ArrowLeft className="w-5 h-5 text-menu-gold" />
      </button>

      <h1 className="text-2xl font-light text-menu-cream tracking-wide drop-shadow-md">{title}</h1>

      <div className="flex items-center gap-3 relative z-[9999]">
        <LanguageSelector />
        <button 
          onClick={onHome}
          className="p-2.5 rounded-full bg-transparent border-2 border-menu-gold hover:bg-menu-gold/20 transition-all duration-300 hover:scale-105"
        >
          <Home className="w-5 h-5 text-menu-gold" />
        </button>
      </div>
    </header>
  );
};

export default Header;
