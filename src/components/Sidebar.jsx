import React from 'react';

const Sidebar = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <aside className="w-64 glass-effect border-l border-menu-gold/30 p-6 overflow-y-auto shadow-xl">
      <div className="space-y-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-300 flex items-center gap-3 border ${
              selectedCategory === category.id
                ? 'bg-menu-green border-menu-gold text-menu-gold font-semibold text-base shadow-lg shadow-menu-gold/30 scale-105'
                : 'border-transparent text-menu-cream/80 text-sm hover:text-menu-cream hover:bg-menu-green/40 hover:border-menu-gold/20 hover:shadow-md hover:scale-102'
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
