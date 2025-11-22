import React from 'react';
import { useTranslation } from 'react-i18next';

const DishCard = ({ dish, onViewDetails, index = 0 }) => {
  const { t, i18n } = useTranslation();
  
  // Get dish name based on current language
  const getDishName = (dish) => {
    const lang = i18n.language;
    if (lang === 'en' && dish.name_en) return dish.name_en;
    if (lang === 'kk' && dish.name_kk) return dish.name_kk;
    return dish.name_ru || dish.name; // Fallback to Russian or original
  };
  
  // Get description based on current language
  const getDescription = (dish) => {
    const lang = i18n.language;
    if (lang === 'en' && dish.description_en) return dish.description_en;
    if (lang === 'kk' && dish.description_kk) return dish.description_kk;
    return dish.description_ru || dish.description; // Fallback to Russian or original
  };

  return (
    <div 
      className="py-3 md:py-5 border-b border-menu-gold/20 last:border-b-0 animate-fadeInUp"
      style={{ 
        animationDelay: `${index * 0.1}s`,
        opacity: 0,
        animationFillMode: 'forwards'
      }}
    >
      <div className="flex items-center justify-between gap-3 md:gap-10">
        {/* Left side: Image and text */}
        <div className="flex items-center gap-3 md:gap-5 flex-1 min-w-0">
          <img 
            src={dish.imageUrl || dish.image_url} 
            alt={dish.name}
            className="w-20 h-20 md:w-32 md:h-32 rounded-full object-cover shadow-xl ring-2 ring-menu-gold/30 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
<<<<<<< HEAD
            <h3 className="text-base md:text-lg font-semibold text-white mb-1 md:mb-2 drop-shadow-sm truncate">{getDishName(dish)}</h3>
            <p className="text-white/70 text-xs md:text-sm leading-relaxed line-clamp-2">
=======
            <h3 className="text-base md:text-lg font-semibold text-menu-cream mb-1 md:mb-2 drop-shadow-sm truncate">{getDishName(dish)}</h3>
            <p className="text-menu-cream/70 text-xs md:text-sm leading-relaxed line-clamp-2">
>>>>>>> ec5e51dd96d97dca8cf41b3c9967a3b477e07139
              {getDescription(dish)}
            </p>
            
            {/* "Подробнее" button */}
            <button
              onClick={() => onViewDetails?.(dish)}
<<<<<<< HEAD
              className="mt-2 md:mt-3 px-3 py-1 md:px-4 md:py-1.5 bg-menu-blue text-white text-xs font-medium rounded-full flex items-center gap-1 md:gap-2 w-fit active:scale-95 transition-transform duration-200"
            >
              <span className="text-white text-xs">ℹ️</span>
=======
              className="mt-2 md:mt-3 px-3 py-1 md:px-4 md:py-1.5 bg-transparent border-2 border-menu-gold text-menu-gold text-xs font-medium rounded-full flex items-center gap-1 md:gap-2 w-fit hover:bg-menu-gold/20 transition-all duration-300"
            >
              <span className="text-menu-gold text-xs">ℹ️</span>
>>>>>>> ec5e51dd96d97dca8cf41b3c9967a3b477e07139
              <span className="hidden md:inline">Подробнее</span>
              <span className="md:hidden">Инфо</span>
            </button>
          </div>
        </div>

        {/* Right side: Price circle */}
<<<<<<< HEAD
        <div className="flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-full bg-menu-blue shadow-2xl flex-shrink-0">
          <div className="text-center">
            <span className="text-white text-base md:text-2xl font-bold">{Math.floor(dish.price)} ₸</span>
=======
        <div className="flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-menu-green/80 to-menu-green/60 shadow-2xl shadow-menu-gold/50 border-2 border-menu-gold flex-shrink-0">
          <div className="text-center">
            <span className="text-menu-gold text-base md:text-2xl font-light">{Math.floor(dish.price)} ₸</span>
>>>>>>> ec5e51dd96d97dca8cf41b3c9967a3b477e07139
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishCard;
