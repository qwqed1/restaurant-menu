import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';

const Header = ({ title, onBack, onHome, showBack }) => {
  return (
    <header className="glass-effect border-b border-menu-gold/30 px-6 py-5 flex items-center justify-between shadow-lg">
      <button 
        onClick={onBack}
        className={`p-2.5 rounded-full bg-gradient-to-br from-menu-gold to-menu-gold/80 hover:from-menu-gold hover:to-menu-gold/90 transition-all duration-300 shadow-md hover:shadow-gold hover:scale-105 ${
          showBack ? 'visible' : 'invisible'
        }`}
      >
        <ArrowLeft className="w-5 h-5 text-menu-green" />
      </button>

      <h1 className="text-2xl font-light text-menu-cream tracking-wide drop-shadow-md">{title}</h1>

      <button 
        onClick={onHome}
        className="p-2.5 rounded-full bg-gradient-to-br from-menu-gold to-menu-gold/80 hover:from-menu-gold hover:to-menu-gold/90 transition-all duration-300 shadow-md hover:shadow-gold hover:scale-105"
      >
        <Home className="w-5 h-5 text-menu-green" />
      </button>
    </header>
  );
};

export default Header;
