import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Info, Sparkles } from 'lucide-react';

const DishModal = ({ dish, onClose }) => {
  const { t, i18n } = useTranslation();

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

  // Get dish name based on current language
  const getDishName = () => {
    const lang = i18n.language;
    if (lang === 'en' && dish.name_en) return dish.name_en;
    if (lang === 'kk' && dish.name_kk) return dish.name_kk;
    return dish.name_ru || dish.name;
  };

  // Get description based on current language
  const getDescription = () => {
    const lang = i18n.language;
    if (lang === 'en' && dish.description_en) return dish.description_en;
    if (lang === 'kk' && dish.description_kk) return dish.description_kk;
    return dish.description_ru || dish.description;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-2 md:px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative max-w-3xl w-full max-h-[95vh] overflow-y-auto rounded-2xl md:rounded-3xl bg-gradient-to-br from-menu-green/95 via-menu-green/85 to-menu-green/80 border border-menu-gold/40 shadow-2xl shadow-menu-gold/20">
        <button
          onClick={onClose}
<<<<<<< HEAD
          className="absolute top-3 right-3 md:top-4 md:right-4 p-1.5 md:p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-lg z-10"
=======
          className="absolute top-3 right-3 md:top-4 md:right-4 p-1.5 md:p-2 rounded-full bg-menu-gold/80 hover:bg-menu-gold transition-colors shadow-gold z-10"
>>>>>>> ec5e51dd96d97dca8cf41b3c9967a3b477e07139
          aria-label="Закрыть"
        >
          <X className="w-4 h-4 md:w-5 md:h-5 text-menu-green" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="relative p-4 md:p-8 flex flex-col justify-center items-center bg-gradient-to-b from-menu-green/40 to-menu-green/10">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-menu-gold via-transparent to-transparent" />
            <img
              src={dish.imageUrl || dish.image_url}
              alt={dish.name}
              className="relative z-10 w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 object-cover ring-4 ring-menu-gold/60 shadow-2xl rounded-lg"
            />
            <div className="relative z-10 mt-4 md:mt-6 flex flex-col items-center text-center">
<<<<<<< HEAD
              <div className="flex items-center gap-2 text-white/90 uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4" /> Специальное блюдо
              </div>
              <h2 className="mt-2 md:mt-3 text-xl md:text-2xl lg:text-3xl font-semibold text-white drop-shadow-lg">
=======
              <div className="flex items-center gap-2 text-menu-gold/90 uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4" /> Специальное блюдо
              </div>
              <h2 className="mt-2 md:mt-3 text-xl md:text-2xl lg:text-3xl font-semibold text-menu-cream drop-shadow-lg">
>>>>>>> ec5e51dd96d97dca8cf41b3c9967a3b477e07139
                {getDishName()}
              </h2>
            </div>
          </div>

<<<<<<< HEAD
          <div className="p-4 md:p-8 lg:p-10 space-y-4 md:space-y-6 text-white">
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-2 text-white/90 text-xs md:text-sm uppercase tracking-[0.15em] md:tracking-[0.25em]">
                <Info className="w-3 h-3 md:w-4 md:h-4" /> Описание
              </div>
              <p className="text-white/85 leading-relaxed text-sm md:text-base lg:text-lg">
=======
          <div className="p-4 md:p-8 lg:p-10 space-y-4 md:space-y-6 text-menu-cream">
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-2 text-menu-gold/90 text-xs md:text-sm uppercase tracking-[0.15em] md:tracking-[0.25em]">
                <Info className="w-3 h-3 md:w-4 md:h-4" /> Описание
              </div>
              <p className="text-menu-cream/85 leading-relaxed text-sm md:text-base lg:text-lg">
>>>>>>> ec5e51dd96d97dca8cf41b3c9967a3b477e07139
                {getDescription()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
<<<<<<< HEAD
              <div className="rounded-xl md:rounded-2xl bg-gradient-to-br from-white/90 to-white/80 p-3 md:p-5 text-center shadow-2xl shadow-white/40">
                <div className="text-xs md:text-sm text-menu-green font-bold uppercase tracking-[0.15em] md:tracking-[0.2em]">Цена</div>
                <div className="mt-1 md:mt-2 text-2xl md:text-4xl font-bold text-menu-green">
=======
              <div className="rounded-xl md:rounded-2xl bg-gradient-to-br from-menu-green/80 to-menu-green/60 p-3 md:p-5 text-center shadow-2xl shadow-menu-gold/40">
                <div className="text-xs md:text-sm text-menu-green font-light uppercase tracking-[0.15em] md:tracking-[0.2em]">Цена</div>
                <div className="mt-1 md:mt-2 text-2xl md:text-4xl font-light text-menu-gold">
>>>>>>> ec5e51dd96d97dca8cf41b3c9967a3b477e07139
                  {Math.floor(dish.price)} ₸
                </div>
              </div>

              {dish.weight && (
<<<<<<< HEAD
                <div className="rounded-xl md:rounded-2xl border border-white/30 bg-white/20 p-3 md:p-4 text-center shadow-lg shadow-white/10">
                  <div className="text-xs md:text-sm text-white/80 uppercase tracking-[0.15em] md:tracking-[0.2em]">Порция</div>
                  <div className="mt-1 md:mt-2 text-xl md:text-2xl font-semibold text-white">
=======
                <div className="rounded-xl md:rounded-2xl border border-menu-gold/30 bg-menu-green/60 p-3 md:p-4 text-center shadow-lg shadow-menu-gold/10">
                  <div className="text-xs md:text-sm text-menu-gold/80 uppercase tracking-[0.15em] md:tracking-[0.2em]">Порция</div>
                  <div className="mt-1 md:mt-2 text-xl md:text-2xl font-semibold text-menu-cream">
>>>>>>> ec5e51dd96d97dca8cf41b3c9967a3b477e07139
                    {dish.weight}
                  </div>
                </div>
              )}
            </div>

            {dish.ingredients && dish.ingredients.length > 0 && (
              <div className="space-y-2 md:space-y-3">
<<<<<<< HEAD
                <div className="text-xs md:text-sm text-white/80 uppercase tracking-[0.15em] md:tracking-[0.2em]">Состав</div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-white/80 text-xs md:text-sm">
                  {dish.ingredients.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white" />
=======
                <div className="text-xs md:text-sm text-menu-gold/80 uppercase tracking-[0.15em] md:tracking-[0.2em]">Состав</div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-menu-cream/80 text-xs md:text-sm">
                  {dish.ingredients.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-menu-gold" />
>>>>>>> ec5e51dd96d97dca8cf41b3c9967a3b477e07139
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4 pt-2">
              <button
                onClick={onClose}
<<<<<<< HEAD
                className="px-5 py-2 md:px-6 md:py-2.5 rounded-full bg-menu-blue text-white text-sm md:text-base font-semibold active:scale-95 transition-transform duration-200"
              >
                Закрыть
              </button>
              <div className="text-xs md:text-sm text-white/70">
                Категория: <span className="text-white font-medium">{dish.categoryName || '—'}</span>
=======
                className="px-5 py-2 md:px-6 md:py-2.5 rounded-full bg-transparent border-2 border-menu-gold text-menu-gold text-sm md:text-base font-semibold hover:bg-menu-gold/20 transition-all duration-300"
              >
                Закрыть
              </button>
              <div className="text-xs md:text-sm text-menu-cream/70">
                Категория: <span className="text-menu-gold font-medium">{dish.categoryName || '—'}</span>
>>>>>>> ec5e51dd96d97dca8cf41b3c9967a3b477e07139
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishModal;
