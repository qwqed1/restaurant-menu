import React from 'react';

const DishCard = ({ dish, onViewDetails }) => {
  return (
    <div className="py-5 border-b border-menu-gold/20 last:border-b-0">
      <div className="flex items-center justify-between gap-10">
        {/* Left side: Image and text */}
        <div className="flex items-center gap-5 flex-1">
          <img 
            src={dish.imageUrl} 
            alt={dish.name}
            className="w-20 h-20 rounded-full object-cover shadow-xl ring-2 ring-menu-gold/30 hover:ring-menu-gold/60 transition-all duration-300 hover:scale-105"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-menu-cream mb-2 drop-shadow-sm">{dish.name}</h3>
            <p className="text-menu-cream/70 text-sm leading-relaxed line-clamp-2">
              {dish.description}
            </p>
            
            {/* "Перейти в меню" button matching design */}
            <button
              onClick={() => onViewDetails?.(dish)}
              className="mt-3 px-4 py-1.5 bg-gradient-to-r from-menu-gold to-menu-gold/90 text-menu-green text-xs font-medium rounded-full hover:from-menu-gold hover:to-menu-gold transition-all duration-300 flex items-center gap-2 w-fit shadow-md hover:shadow-lg hover:shadow-menu-gold/40 hover:scale-105"
            >
              <span className="text-menu-green text-xs">ℹ️</span>
              Подробнее
            </button>
          </div>
        </div>

        {/* Right side: Price circle */}
        <div className="flex items-center justify-center w-28 h-28 rounded-full border-3 border-menu-gold bg-gradient-to-br from-menu-green/80 to-menu-green/60 shadow-xl shadow-menu-gold/20 hover:shadow-menu-gold/40 transition-all duration-300 hover:scale-105">
          <div className="text-center">
            <span className="text-menu-gold text-2xl font-bold block drop-shadow-lg">{dish.price}</span>
            <span className="text-menu-gold/90 text-xs font-medium">тенге</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishCard;
