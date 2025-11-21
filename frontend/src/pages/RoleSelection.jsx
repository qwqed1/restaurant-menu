import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';

function RoleSelection() {
  const navigate = useNavigate();

  const handleClientClick = () => {
    navigate('/home');
  };

  const handleAdminClick = () => {
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-menu-green via-menu-blue to-menu-green flex items-center justify-center p-8">
      {/* Background overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: 'url(/img/background.jpg)',
            filter: 'blur(5px)',
            transform: 'scale(1.05)'
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-5xl">
        <div className="text-center mb-12">
          {/* Logo */}
          <div className="mb-2 flex justify-center">
            <img 
              src="/img/Logo.png" 
              alt="Vostochnyj Dvor Logo" 
              className="w-80 h-80 md:w-96 md:h-96 drop-shadow-2xl object-fill"
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 drop-shadow-lg tracking-wider" style={{ fontFamily: 'Georgia, serif' }}>
            Vostochnyj Dvor
          </h1>
          <p className="text-xl md:text-2xl text-white/90 drop-shadow-md">
            Выберите режим входа
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Client Card */}
          <button
            onClick={handleClientClick}
            className="group relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 p-8 md:p-12"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-menu-green/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 bg-gradient-to-br from-menu-green to-green-600 rounded-full flex items-center justify-center shadow-lg group-hover:animate-pulse">
                <User className="w-12 h-12 md:w-16 md:h-16 text-white" strokeWidth={2} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                Клиент
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                Просмотр меню и заказ блюд
              </p>
              <div className="mt-6 inline-flex items-center text-menu-green font-semibold text-lg">
                <span className="mr-2">Войти в меню</span>
                <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Admin Card */}
          <button
            onClick={handleAdminClick}
            className="group relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 p-8 md:p-12"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-menu-blue/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 bg-gradient-to-br from-menu-blue to-blue-700 rounded-full flex items-center justify-center shadow-lg group-hover:animate-pulse">
                <Lock className="w-12 h-12 md:w-16 md:h-16 text-white" strokeWidth={2} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                Администратор
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                Управление меню и заказами
              </p>
              <div className="mt-6 inline-flex items-center text-menu-blue font-semibold text-lg">
                <span className="mr-2">Войти в панель</span>
                <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center">
          <p className="text-white/70 text-sm md:text-base">
            Версия для планшетов • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;
