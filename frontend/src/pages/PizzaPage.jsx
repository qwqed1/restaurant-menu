import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import DishList from '../components/DishList';
import DishModal from '../components/DishModal';
import '../i18n';

function PizzaPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useAPI, setUseAPI] = useState(import.meta.env.VITE_USE_API === 'true');
  const [activeDish, setActiveDish] = useState(null);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const categoryImages = {
    16: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop', // Пицца
  };

  const loadDataFromAPI = () => {
    if (useAPI) {
      Promise.all([
        fetch(`${API_URL}/api/categories`).then(res => res.json()),
        fetch(`${API_URL}/api/dishes`).then(res => res.json())
      ])
        .then(([categoriesData, dishesData]) => {
          // Filter pizza categories using 'page' field (with fallback to name matching)
          const pizzaCategories = categoriesData.filter(cat => 
            cat.page === 'pizza' || 
            cat.name_ru?.toLowerCase() === 'пицца' ||
            cat.name_en?.toLowerCase() === 'pizza'
          );
          
          setCategories(pizzaCategories);
          
          // Filter dishes for pizza categories only
          const pizzaCategoryIds = pizzaCategories.map(c => c.id);
          const pizzaDishes = dishesData.filter(dish => 
            pizzaCategoryIds.includes(dish.category_id)
          );
          
          const transformedDishes = pizzaDishes.map(dish => ({
            id: dish.id,
            categoryId: dish.category_id,
            name: dish.name,
            name_ru: dish.name_ru,
            name_en: dish.name_en,
            name_kk: dish.name_kk,
            description: dish.description,
            description_ru: dish.description_ru,
            description_en: dish.description_en,
            description_kk: dish.description_kk,
            price: dish.price,
            weight: dish.weight,
            imageUrl: dish.image_url?.startsWith('/uploads/') 
              ? `${API_URL}${dish.image_url}`
              : dish.image_url,
            ingredients_text: dish.ingredients_text,
            is_available: dish.is_available
          }));
          
          setDishes(transformedDishes);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching data from API:', error);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    loadDataFromAPI();
  }, [useAPI, API_URL]);

  // Auto-refresh data every 30 seconds when using API
  useEffect(() => {
    if (useAPI) {
      const interval = setInterval(() => {
        loadDataFromAPI();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [useAPI, API_URL]);

  // Auto-rotate carousel
  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      const interval = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentCarouselIndex((prev) => (prev + 1) % categories.length);
          setIsAnimating(false);
        }, 500);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [selectedCategory, categories]);

  const handleGoBack = () => {
    setSelectedCategory(null);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewDish = (dish) => {
    if (!dish) return;
    const category = categories.find((cat) => cat.id === (dish.categoryId || dish.category_id));
    const categoryName = getCategoryName(category);
    setActiveDish({
      ...dish,
      categoryName: categoryName || dish.categoryName || 'Меню',
    });
  };

  const handleCloseDishModal = () => setActiveDish(null);

  const filteredDishes = selectedCategory 
    ? dishes.filter(dish => (dish.categoryId || dish.category_id) === selectedCategory)
    : [];

  const getCategoryName = (category) => {
    if (!category) return t('menu.pizza');
    const lang = t.i18n?.language || 'ru';
    if (lang === 'en' && category.name_en) return category.name_en;
    if (lang === 'kk' && category.name_kk) return category.name_kk;
    return category.name_ru || category.name;
  };

  const currentTitle = selectedCategory 
    ? getCategoryName(categories.find(cat => cat.id === selectedCategory))
    : (t('menu.pizza') || 'Пицца');

  const currentCarouselCategory = categories[currentCarouselIndex];
  
  const firstDishInCategory = currentCarouselCategory
    ? dishes.find(dish => (dish.categoryId || dish.category_id) === currentCarouselCategory.id)
    : null;
  
  const currentImage = firstDishInCategory?.imageUrl 
    || categoryImages[currentCarouselCategory?.id] 
    || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop';

  if (loading) {
    return (
      <div className="min-h-screen bg-menu-green flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-menu-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-menu-cream text-lg font-medium drop-shadow-md">Загрузка меню...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-menu-green relative overflow-hidden">
      {/* Background with blur effect */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: 'url(/img/background.jpg)',
            filter: 'blur(10px) saturate(0.7)',
            transform: 'scale(1.1)'
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 h-screen flex flex-col">
        <Header 
          title={currentTitle}
          onBack={handleGoBack}
          onHome={handleGoHome}
          showBack={selectedCategory !== null}
        />

        {/* Mobile category selector - only visible on mobile when category is selected */}
        {selectedCategory && (
          <div className="md:hidden bg-menu-green/80 backdrop-blur-sm border-b border-menu-gold/20 px-4 py-3 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-menu-gold text-menu-green shadow-lg'
                      : 'bg-menu-green/50 text-menu-cream border border-menu-gold/30'
                  }`}
                >
                  {getCategoryName(category)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {selectedCategory ? (
            <>
              <div className="flex-1 overflow-y-auto animate-fadeIn">
                <DishList dishes={filteredDishes} onViewDish={handleViewDish} />
              </div>
              {/* Hide sidebar on mobile (md:flex) */}
              <div className="hidden md:block">
                <Sidebar 
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex">
              {/* Left side content */}
              <div className="flex-1 flex items-center justify-center">
                <div className="relative">
                  <div className="relative z-10 text-center px-4">
                    {/* Animated Dish image and category */}
                    <div className="mb-4">
                      <div 
                        className={`transition-all duration-1000 overflow-hidden p-4 md:p-8 ${
                          isAnimating ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'
                        }`}
                      >
                        <img 
                          key={currentCarouselIndex}
                          src={currentImage}
                          alt={currentCarouselCategory?.name || 'Featured dish'}
                          className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover mx-auto mb-4 md:mb-6 ring-4 ring-menu-gold/60"
                        />
                        
                        <h2 className="text-2xl md:text-3xl font-light text-menu-cream drop-shadow-lg">
                          {getCategoryName(currentCarouselCategory)}
                        </h2>
                      </div>
                    </div>
                    
                    {/* Fixed button */}
                    <button 
                      onClick={() => currentCarouselCategory && setSelectedCategory(currentCarouselCategory.id)}
                      className="px-6 md:px-10 py-3 md:py-4 bg-transparent border-3 border-menu-gold text-menu-gold text-sm md:text-base font-semibold rounded-full flex items-center gap-2 mx-auto hover:bg-menu-gold/20 transition-all duration-300"
                    >
                      <span className="text-menu-gold">🍕</span>
                      {t('menu.goToMenu')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right sidebar - hidden on mobile */}
              <div className="hidden md:block">
                <Sidebar 
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <DishModal dish={activeDish} onClose={handleCloseDishModal} />
    </div>
  );
}

export default PizzaPage;
