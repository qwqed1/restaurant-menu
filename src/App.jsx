import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DishList from './components/DishList';
import DishModal from './components/DishModal';

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useAPI, setUseAPI] = useState(import.meta.env.VITE_USE_API === 'true'); // Toggle between API and mock data
  const [activeDish, setActiveDish] = useState(null);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
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
          setCategories(categoriesData);
          
          // Transform dishes data: convert snake_case to camelCase and fix image URLs
          const transformedDishes = dishesData.map(dish => ({
            id: dish.id,
            categoryId: dish.category_id,
            name: dish.name,
            description: dish.description,
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
    setSelectedCategory(null);
  };

  const handleViewDish = (dish) => {
    if (!dish) return;
    const categoryName = categories.find((cat) => cat.id === (dish.categoryId || dish.category_id))?.name;
    setActiveDish({
      ...dish,
      categoryName: categoryName || dish.categoryName || currentCarouselCategory?.name || 'Меню',
    });
  };

  const handleCloseDishModal = () => setActiveDish(null);

  const filteredDishes = selectedCategory 
    ? dishes.filter(dish => (dish.categoryId || dish.category_id) === selectedCategory)
    : [];

  const currentTitle = selectedCategory 
    ? categories.find(cat => cat.id === selectedCategory)?.name 
    : 'Кухня';

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
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=1080&fit=crop)',
            filter: 'blur(10px) saturate(0.7)',
            transform: 'scale(1.1)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-menu-green/90 via-menu-green/60 to-menu-gold/20" />
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
              <div className="flex-1 overflow-y-auto">
                <DishList dishes={filteredDishes} onViewDish={handleViewDish} />
              </div>
              <Sidebar 
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </>
          ) : (
            <div className="flex-1 flex">
              {/* Left side content - positioned left but not at edge */}
              <div className="flex-1 flex items-center pl-20">
                <div className="relative">
                  {/* Large circular decorative elements matching the design */}
                  <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full border-2 border-menu-gold/50 border-dashed animate-pulse" />
                  <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full border-2 border-menu-gold/40 border-dashed animate-pulse" style={{animationDelay: '1s'}} />
                  
                  <div className="relative z-10 text-center">
                    {/* Animated Dish image and category */}
                    <div className="overflow-hidden mb-8">
                      <div 
                        className={`transition-all duration-1000 ${
                          isAnimating ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'
                        }`}
                      >
                        <img 
                          key={currentCarouselIndex}
                          src={currentImage}
                          alt={currentCarouselCategory?.name || 'Featured dish'}
                          className="w-52 h-52 md:w-60 md:h-60 rounded-full object-cover mx-auto mb-8 ring-4 ring-menu-gold/60 hover:ring-menu-gold transition-all duration-500 hover:scale-105"
                        />
                        
                        <h2 className="text-2xl md:text-3xl font-light text-menu-cream drop-shadow-lg">
                          {currentCarouselCategory?.name || 'Меню'}
                        </h2>
                      </div>
                    </div>
                    
                    {/* Fixed button - stays in place */}
                    <button 
                      onClick={() => currentCarouselCategory && setSelectedCategory(currentCarouselCategory.id)}
                      className="px-8 py-3 bg-gradient-to-r from-menu-gold to-menu-gold/90 text-menu-green text-sm font-semibold rounded-full hover:from-menu-gold hover:to-menu-gold transition-all duration-300 flex items-center gap-2 mx-auto shadow-xl hover:shadow-2xl hover:shadow-menu-gold/50 hover:scale-110"
                    >
                      <span className="text-menu-green">📋</span>
                      Перейти в меню
                    </button>
                  </div>
                </div>
              </div>

              {/* Right sidebar - fixed */}
              <Sidebar 
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>
          )}
        </div>
      </div>

      <DishModal dish={activeDish} onClose={handleCloseDishModal} />
    </div>
  );
}

export default App;
