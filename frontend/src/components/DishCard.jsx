import React from 'react';
import { useTranslation } from 'react-i18next';

const DishCard = ({ dish, onViewDetails, index = 0 }) => {
  const { i18n } = useTranslation();
  
  // Get description based on current language
  const getDescription = (dish) => {
    const lang = i18n.language;
    if (lang === 'en' && dish.description_en) return dish.description_en;
    if (lang === 'kk' && dish.description_kk) return dish.description_kk;
    return dish.description_ru || dish.description; // Fallback to Russian or original
  };

  return (
    <div 
      className="py-5 border-b border-menu-gold/20 last:border-b-0 animate-fadeInUp"
      style={{ 
        animationDelay: `${index * 0.1}s`,
        opacity: 0,
        animationFillMode: 'forwards'
      }}
    >
      <div className="flex items-center justify-between gap-10">
        {/* Left side: Image and text */}
        <div className="flex items-center gap-5 flex-1">
          <img 
            src={dish.imageUrl || dish.image_url} 
            alt={dish.name}
            className="w-32 h-32 rounded-full object-cover shadow-xl ring-2 ring-menu-gold/30"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-menu-cream mb-2 drop-shadow-sm">{dish.name}</h3>
            <p className="text-menu-cream/70 text-sm leading-relaxed line-clamp-2">
              {getDescription(dish)}
            </p>
            
            {/* "Перейти в меню" button matching design */}
            <button
              onClick={() => onViewDetails?.(dish)}
              className="mt-3 px-4 py-1.5 bg-transparent border-2 border-menu-gold text-menu-gold text-xs font-medium rounded-full flex items-center gap-2 w-fit hover:bg-menu-gold/20 transition-all duration-300"
            >
              <span className="text-menu-gold text-xs">ℹ️</span>
              Подробнее
            </button>
          </div>
        </div>

        {/* Right side: Price circle */}
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-menu-green/80 to-menu-green/60 shadow-2xl shadow-menu-gold/50 border-2 border-menu-gold">
          <div className="text-center">
            <span className="text-menu-gold text-2xl font-light">{Math.floor(dish.price)} ₸</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishCard;
