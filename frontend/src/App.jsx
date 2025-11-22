import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DishList from './components/DishList';
import DishModal from './components/DishModal';
import './i18n';

function App() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useAPI, setUseAPI] = useState(import.meta.env.VITE_USE_API === 'true'); // Toggle between API and mock data
  const [activeDish, setActiveDish] = useState(null);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Category images mapping
  const categoryImages = {
    1: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=400&fit=crop', // Завтраки
    2: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop', // Супы
    3: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=400&fit=crop', // Салаты
    4: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop', // Основные блюда
    5: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop', // Десерты
    6: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop', // Напитки
  }

  const loadDataFromAPI = () => {
    if (useAPI) {
      // Fetch from API
      Promise.all([
        fetch(`${API_URL}/api/categories`).then(res => res.json()),
        fetch(`${API_URL}/api/dishes`).then(res => res.json())
      ])
        .then(([categoriesData, dishesData]) => {
          // Filter only kitchen categories using 'page' field
          // This allows flexible addition of new categories without breaking the code
          const kitchenCategories = categoriesData.filter(cat => 
            cat.page === 'kitchen' || (!cat.page && cat.display_order >= 1 && cat.display_order <= 12)
          );
          setCategories(kitchenCategories);
          
          // Filter dishes: only include kitchen categories (display_order 1-12)
          const kitchenCategoryIds = kitchenCategories.map(c => c.id);
          const kitchenDishes = dishesData.filter(dish => 
            kitchenCategoryIds.includes(dish.category_id)
          );
          
          // Transform dishes data: convert snake_case to camelCase and fix image URLs
          const transformedDishes = kitchenDishes.map(dish => ({
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
            // Fix image URL: if it starts with /uploads/, prepend API_URL
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
          // Fallback to mock data if API fails
          loadMockData();
        });
    } else {
      // Use mock data
      loadMockData();
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
      }, 30000); // Refresh every 30 seconds

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
        }, 500); // Half of animation duration
      }, 4000); // Change every 4 seconds

      return () => clearInterval(interval);
    }
  }, [selectedCategory, categories]);

  const loadMockData = async () => {
    const { menuData } = await import('./data/mockMenu');
    setCategories(menuData.categories);
    setDishes(menuData.dishes);
    setLoading(false);
  };

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

  // Get category name based on current language
  const getCategoryName = (category) => {
    if (!category) return t('menu.title');
    const lang = t.i18n?.language || 'ru';
    if (lang === 'en' && category.name_en) return category.name_en;
    if (lang === 'kk' && category.name_kk) return category.name_kk;
    return category.name_ru || category.name;
  };

  const currentTitle = selectedCategory 
    ? getCategoryName(categories.find(cat => cat.id === selectedCategory))
    : t('menu.title');

  const currentCarouselCategory = categories[currentCarouselIndex];
  
  // Get first dish from current category
  const firstDishInCategory = currentCarouselCategory
    ? dishes.find(dish => (dish.categoryId || dish.category_id) === currentCarouselCategory.id)
    : null;
  
  // Use first dish image if available, otherwise fallback to category image
  const currentImage = firstDishInCategory?.imageUrl 
    ? firstDishInCategory.imageUrl
    : (currentCarouselCategory 
        ? (categoryImages[currentCarouselCategory.id] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop')
        : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop');

  if (loading) {
    return (
      <div className="min-h-screen bg-menu-green flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-menu-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium drop-shadow-md">Загрузка меню...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-menu-green relative overflow-hidden">
      {/* Background with blur effect - no green overlay */}
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

        <div className="flex-1 flex overflow-hidden">
          {selectedCategory ? (
            <>
              <div className="flex-1 overflow-y-auto animate-fadeIn pb-20 md:pb-0">
                <DishList dishes={filteredDishes} onViewDish={handleViewDish} />
              </div>
              {/* Desktop Sidebar - hidden on mobile */}
              <div className="hidden md:block">
                <Sidebar 
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              </div>
              
              {/* Mobile Bottom Navigation */}
              <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
                {/* Category toggle button */}
                <button
                  onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
<<<<<<< HEAD
                  className="w-full bg-menu-blue backdrop-blur-md border-t-2 border-menu-blue/50 px-4 py-3 flex items-center justify-between text-white font-semibold active:scale-95 transition-transform duration-200"
=======
                  className="w-full bg-menu-green/95 backdrop-blur-md border-t-2 border-menu-gold/30 px-4 py-3 flex items-center justify-between text-menu-gold font-semibold"
>>>>>>> ec5e51dd96d97dca8cf41b3c9967a3b477e07139
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    {getCategoryName(categories.find(cat => cat.id === selectedCategory))}
                  </span>
                  <svg 
                    className={`w-5 h-5 transition-transform ${isMobileCategoriesOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Categories drawer */}
                {isMobileCategoriesOpen && (
<<<<<<< HEAD
                  <div className="bg-menu-blue/95 backdrop-blur-md border-t border-white/20 max-h-64 overflow-y-auto">
=======
                  <div className="bg-menu-green/98 backdrop-blur-md border-t border-menu-gold/30 max-h-64 overflow-y-auto">
>>>>>>> ec5e51dd96d97dca8cf41b3c9967a3b477e07139
                    <div className="p-3 space-y-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setIsMobileCategoriesOpen(false);
                          }}
<<<<<<< HEAD
                          className={`w-full text-left py-2.5 px-3 rounded-lg flex items-center gap-2 active:scale-95 transition-transform duration-200 ${
                            selectedCategory === category.id
                              ? 'bg-blue-700 text-white font-semibold shadow-lg'
                              : 'bg-menu-blue/70 text-white/80'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            selectedCategory === category.id ? 'bg-white' : 'bg-white/60'
=======
                          className={`w-full text-left py-2.5 px-3 rounded-lg flex items-center gap-2 border ${
                            selectedCategory === category.id
                              ? 'bg-menu-green border-menu-gold text-menu-gold font-semibold shadow-lg shadow-menu-gold/30'
                              : 'border-transparent text-menu-cream/80'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            selectedCategory === category.id ? 'bg-menu-gold' : 'bg-menu-cream/40'
>>>>>>> ec5e51dd96d97dca8cf41b3c9967a3b477e07139
                          }`} />
                          <span className="text-sm">{getCategoryName(category)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col md:flex-row">
              {/* Left side content - carousel */}
              <div className="flex-1 flex items-center justify-center px-4 md:px-0">
                <div className="relative w-full max-w-md">
                  <div className="relative z-10 text-center">
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
                        
<<<<<<< HEAD
                        <h2 className="text-2xl md:text-3xl font-light text-white drop-shadow-lg">
=======
                        <h2 className="text-2xl md:text-3xl font-light text-menu-cream drop-shadow-lg">
>>>>>>> ec5e51dd96d97dca8cf41b3c9967a3b477e07139
                          {getCategoryName(currentCarouselCategory)}
                        </h2>
                      </div>
                    </div>
                    
                    {/* Fixed button - stays in place */}
                    <button 
                      onClick={() => currentCarouselCategory && setSelectedCategory(currentCarouselCategory.id)}
<<<<<<< HEAD
                      className="px-6 py-3 md:px-10 md:py-4 bg-menu-blue text-white text-sm md:text-base font-semibold rounded-full flex items-center gap-2 mx-auto active:scale-95 transition-transform duration-200"
=======
                      className="px-6 py-3 md:px-10 md:py-4 bg-transparent border-2 md:border-3 border-menu-gold text-menu-gold text-sm md:text-base font-semibold rounded-full flex items-center gap-2 mx-auto hover:bg-menu-gold/20 transition-all duration-300"
>>>>>>> ec5e51dd96d97dca8cf41b3c9967a3b477e07139
                    >
                      <span className="text-white">📋</span>
                      {t('menu.goToMenu')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop sidebar - hidden on mobile */}
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

export default App;
