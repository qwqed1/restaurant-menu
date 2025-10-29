import React from 'react';

const Sidebar = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <aside className="w-64 glass-effect border-l border-menu-gold/30 p-6 overflow-y-auto shadow-xl animate-slideInRight">
      <div className="border-t-2 border-menu-gold/50 pt-6 mb-6"></div>
      <div className="space-y-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`w-full text-left py-3 px-4 rounded-lg flex items-center gap-3 border ${
              selectedCategory === category.id
                ? 'bg-menu-green border-menu-gold text-menu-gold font-semibold text-base shadow-lg shadow-menu-gold/30'
                : 'border-transparent text-menu-cream/80 text-sm'
            }`}
          >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300 ${
              selectedCategory === category.id ? 'bg-menu-gold shadow-lg shadow-menu-gold/50' : 'bg-menu-cream/40'
            }`} />
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
