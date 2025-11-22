import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

const Header = ({ title, onBack, onHome, showBack }) => {
  return (
    <header className="bg-transparent border-b border-menu-gold/20 px-3 py-3 md:px-6 md:py-5 flex items-center justify-between relative z-[100]">
      <button 
        onClick={onBack}
<<<<<<< HEAD
        className={`p-2 md:p-2.5 rounded-full bg-menu-blue active:scale-95 transition-transform duration-200 ${
          showBack ? 'visible' : 'invisible'
        }`}
      >
        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
      </button>

      <h1 className="text-lg md:text-2xl font-light text-white tracking-wide drop-shadow-md truncate px-2">{title}</h1>
=======
        className={`p-2 md:p-2.5 rounded-full bg-transparent border-2 border-menu-gold hover:bg-menu-gold/20 transition-all duration-300 hover:scale-105 ${
          showBack ? 'visible' : 'invisible'
        }`}
      >
        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-menu-gold" />
      </button>

      <h1 className="text-lg md:text-2xl font-light text-menu-cream tracking-wide drop-shadow-md truncate px-2">{title}</h1>
>>>>>>> ec5e51dd96d97dca8cf41b3c9967a3b477e07139

      <div className="flex items-center gap-2 md:gap-3 relative z-[9999]">
        <LanguageSelector />
        <button 
          onClick={onHome}
<<<<<<< HEAD
          className="p-2 md:p-2.5 rounded-full bg-menu-blue active:scale-95 transition-transform duration-200"
        >
          <Home className="w-4 h-4 md:w-5 md:h-5 text-white" />
=======
          className="p-2 md:p-2.5 rounded-full bg-transparent border-2 border-menu-gold hover:bg-menu-gold/20 transition-all duration-300 hover:scale-105"
        >
          <Home className="w-4 h-4 md:w-5 md:h-5 text-menu-gold" />
>>>>>>> ec5e51dd96d97dca8cf41b3c9967a3b477e07139
        </button>
      </div>
    </header>
  );
};

export default Header;
