import React from 'react';
import { useTranslation } from 'react-i18next';

const Sidebar = ({ categories, selectedCategory, onSelectCategory }) => {
  const { i18n } = useTranslation();
  
  // Get category name based on current language
  const getCategoryName = (category) => {
    const lang = i18n.language;
    if (lang === 'en' && category.name_en) return category.name_en;
    if (lang === 'kk' && category.name_kk) return category.name_kk;
    return category.name_ru || category.name; // Fallback to Russian or original name
  };

  return (
    <aside className="w-64 bg-transparent border-l border-menu-gold/20 p-6 overflow-y-auto animate-slideInRight">
      <div className="border-t-2 border-menu-gold/50 pt-6 mb-6"></div>
      <div className="space-y-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`w-full text-left py-3 px-4 rounded-lg flex items-center gap-3 active:scale-95 transition-transform duration-200 ${
              selectedCategory === category.id
                ? 'bg-menu-blue text-white font-semibold text-base shadow-lg'
                : 'bg-menu-blue/70 text-white/90 text-sm'
            }`}
          >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-all duration-200 ${
              selectedCategory === category.id ? 'bg-white shadow-lg shadow-white/50' : 'bg-white/60'
            }`} />
            <span>{getCategoryName(category)}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
