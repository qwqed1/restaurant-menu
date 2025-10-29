import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Info, Sparkles } from 'lucide-react';

const DishModal = ({ dish, onClose }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!dish) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dish, onClose]);

  if (!dish) return null;

  // Get description based on current language
  const getDescription = () => {
    const lang = i18n.language;
    if (lang === 'en' && dish.description_en) return dish.description_en;
    if (lang === 'kk' && dish.description_kk) return dish.description_kk;
    return dish.description_ru || dish.description;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative max-w-3xl w-full rounded-3xl bg-gradient-to-br from-menu-green/95 via-menu-green/85 to-menu-green/80 border border-menu-gold/40 shadow-2xl shadow-menu-gold/20 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-menu-gold/80 hover:bg-menu-gold transition-colors shadow-gold"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5 text-menu-green" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative p-8 flex flex-col justify-center items-center bg-gradient-to-b from-menu-green/40 to-menu-green/10">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-menu-gold via-transparent to-transparent" />
            <img
              src={dish.imageUrl || dish.image_url}
              alt={dish.name}
              className="relative z-10 w-64 h-64 md:w-80 md:h-80 object-cover ring-4 ring-menu-gold/60 shadow-2xl"
            />
            <div className="relative z-10 mt-6 flex flex-col items-center text-center">
              <div className="flex items-center gap-2 text-menu-gold/90 uppercase tracking-[0.3em] text-xs">
                <Sparkles className="w-4 h-4" /> Специальное блюдо
              </div>
              <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-menu-cream drop-shadow-lg">
                {dish.name}
              </h2>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-6 text-menu-cream">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-menu-gold/90 text-sm uppercase tracking-[0.25em]">
                <Info className="w-4 h-4" /> Описание
              </div>
              <p className="text-menu-cream/85 leading-relaxed text-base md:text-lg">
                {getDescription()}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-menu-green/80 to-menu-green/60 p-5 text-center shadow-2xl shadow-menu-gold/40">
                <div className="text-sm text-menu-green font-light uppercase tracking-[0.2em]">Цена</div>
                <div className="mt-2 text-4xl font-light text-menu-gold">
                  {Math.floor(dish.price)} ₸
                </div>
              </div>

              {dish.weight && (
                <div className="rounded-2xl border border-menu-gold/30 bg-menu-green/60 p-4 text-center shadow-lg shadow-menu-gold/10">
                  <div className="text-sm text-menu-gold/80 uppercase tracking-[0.2em]">Порция</div>
                  <div className="mt-2 text-2xl font-semibold text-menu-cream">
                    {dish.weight}
                  </div>
                </div>
              )}
            </div>

            {dish.ingredients && dish.ingredients.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm text-menu-gold/80 uppercase tracking-[0.2em]">Состав</div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-menu-cream/80 text-sm">
                  {dish.ingredients.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-menu-gold" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-transparent border-2 border-menu-gold text-menu-gold font-semibold hover:bg-menu-gold/20 transition-all duration-300"
              >
                Закрыть
              </button>
              <div className="text-sm text-menu-cream/70">
                Категория: <span className="text-menu-gold font-medium">{dish.categoryName || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishModal;
