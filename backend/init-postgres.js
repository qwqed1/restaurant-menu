import pool from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

// Create tables
const createTables = async () => {
  try {
    // Create categories table with localization
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name_ru VARCHAR(255) NOT NULL,
        name_en VARCHAR(255),
        name_kk VARCHAR(255),
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create dishes table with localization
    await pool.query(`
      CREATE TABLE IF NOT EXISTS dishes (
        id SERIAL PRIMARY KEY,
        category_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        description_ru TEXT,
        description_en TEXT,
        description_kk TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image_url TEXT,
        weight VARCHAR(50),
        ingredients_text TEXT,
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);

    // Create admin users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

// Insert sample categories with localization
const insertCategories = async () => {
  const categories = [
    { name_ru: 'Завтраки', name_en: 'Breakfast', name_kk: 'Таңғы ас', order: 1 },
    { name_ru: 'Сэндвичи', name_en: 'Sandwiches', name_kk: 'Сэндвичтер', order: 2 },
    { name_ru: 'Закуски', name_en: 'Appetizers', name_kk: 'Тағамдар', order: 3 },
    { name_ru: 'Салаты', name_en: 'Salads', name_kk: 'Салаттар', order: 4 },
    { name_ru: 'Супы', name_en: 'Soups', name_kk: 'Сорпалар', order: 5 },
    { name_ru: 'Основные блюда', name_en: 'Main Dishes', name_kk: 'Негізгі тағамдар', order: 6 },
    { name_ru: 'Паназия', name_en: 'Pan-Asian', name_kk: 'Паназиялық', order: 7 },
    { name_ru: 'Паста', name_en: 'Pasta', name_kk: 'Паста', order: 8 },
    { name_ru: 'Гарниры', name_en: 'Side Dishes', name_kk: 'Гарнирлер', order: 9 },
    { name_ru: 'Десерты', name_en: 'Desserts', name_kk: 'Десерттер', order: 10 },
    { name_ru: 'Хлеб', name_en: 'Bread', name_kk: 'Нан', order: 11 },
    { name_ru: 'Добавки ко всему', name_en: 'Add-ons', name_kk: 'Қосымшалар', order: 12 }
  ];

  try {
    // Clear existing categories first
    await pool.query('TRUNCATE TABLE categories RESTART IDENTITY CASCADE');
    
    for (const category of categories) {
      await pool.query(
        'INSERT INTO categories (name_ru, name_en, name_kk, display_order) VALUES ($1, $2, $3, $4)',
        [category.name_ru, category.name_en, category.name_kk, category.order]
      );
    }
    console.log(`✅ Inserted ${categories.length} categories`);
  } catch (error) {
    console.error('Error inserting categories:', error);
    throw error;
  }
};

// Insert sample dishes
const insertDishes = async () => {
  const dishes = [
    {
      category_id: 6,
      name: 'Тушенка с гречкой',
      description: 'Нежная тушеная шея говядины в сочетании с гречневым ризотто, блюрсыром Пармезан, тимьяном, яйцом пашот и соусом Голландез. Всем знакомая классика в современной интерпретации.',
      price: 5800,
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop',
      weight: '350г'
    },
    {
      category_id: 6,
      name: 'Запеканка с семгой и картофелем',
      description: 'Изысканное сочетание сливочной текстуры, нежного картофеля и насыщенного вкуса семги, подчеркнутое тонкими нотками свежих трав.',
      price: 5200,
      image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=300&fit=crop',
      weight: '320г'
    },
    {
      category_id: 1,
      name: 'Скрэмбл с лососем и авокадо',
      description: 'Нежный скрэмбл, ломтики слабосоленого лосося и спелое авокадо на тосте из цельнозернового хлеба.',
      price: 4100,
      image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=300&h=300&fit=crop',
      weight: '280г'
    },
    {
      category_id: 1,
      name: 'Яичница с беконом',
      description: 'Классическая яичница из трех яиц с хрустящим беконом, подается с тостами и свежими овощами.',
      price: 3200,
      image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&h=300&fit=crop',
      weight: '250г'
    },
    {
      category_id: 1,
      name: 'Овсяная каша с ягодами',
      description: 'Нежная овсяная каша на молоке с добавлением свежих ягод, меда и орехов.',
      price: 2400,
      image_url: 'https://images.unsplash.com/photo-1517673408097-07e3ad2e5277?w=300&h=300&fit=crop',
      weight: '300г'
    },
    {
      category_id: 2,
      name: 'Клаб-сэндвич',
      description: 'Трехслойный сэндвич с куриной грудкой, беконом, листьями салата, томатами и соусом.',
      price: 3800,
      image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&h=300&fit=crop',
      weight: '320г'
    },
    {
      category_id: 2,
      name: 'Сэндвич с тунцом',
      description: 'Цельнозерновой хлеб с тунцом, свежими овощами и легким йогуртовым соусом.',
      price: 3400,
      image_url: 'https://images.unsplash.com/photo-1554433607-66b5746d8f2f?w=300&h=300&fit=crop',
      weight: '280г'
    },
    {
      category_id: 3,
      name: 'Брускетты с томатами',
      description: 'Хрустящие брускетты с томатами, базиликом и моцареллой, заправленные оливковым маслом.',
      price: 2800,
      image_url: 'https://images.unsplash.com/photo-1572695157369-d8f5a0e9d8d7?w=300&h=300&fit=crop',
      weight: '200г'
    },
    {
      category_id: 3,
      name: 'Сырная тарелка',
      description: 'Ассорти из пяти видов сыра с медом, орехами и виноградом.',
      price: 4500,
      image_url: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=300&h=300&fit=crop',
      weight: '350г'
    },
    {
      category_id: 4,
      name: 'Цезарь с курицей',
      description: 'Классический салат Цезарь с обжаренной куриной грудкой, сыром Пармезан и соусом Цезарь.',
      price: 3600,
      image_url: 'https://images.unsplash.com/photo-1580013620798-ff0c8c68417f?w=300&h=300&fit=crop',
      weight: '280г'
    },
    {
      category_id: 4,
      name: 'Греческий салат',
      description: 'Свежие овощи, сыр фета, маслины и оливковое масло - классика средиземноморской кухни.',
      price: 3200,
      image_url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&h=300&fit=crop',
      weight: '250г'
    },
    {
      category_id: 4,
      name: 'Салат с креветками',
      description: 'Тигровые креветки, микс салатов, авокадо, черри и цитрусовая заправка.',
      price: 4200,
      image_url: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=300&h=300&fit=crop',
      weight: '260г'
    },
    {
      category_id: 5,
      name: 'Том Ям',
      description: 'Острый тайский суп с креветками, грибами, лемонграссом и кокосовым молоком.',
      price: 4200,
      image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=300&fit=crop',
      weight: '400мл'
    },
    {
      category_id: 5,
      name: 'Борщ',
      description: 'Традиционный борщ со сметаной, подается с чесночными пампушками.',
      price: 2800,
      image_url: 'https://images.unsplash.com/photo-1562170437-ecfe20e0b8f0?w=300&h=300&fit=crop',
      weight: '350мл'
    },
    {
      category_id: 5,
      name: 'Крем-суп из тыквы',
      description: 'Нежный крем-суп из запеченной тыквы с тыквенными семечками и сливками.',
      price: 2600,
      image_url: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=300&h=300&fit=crop',
      weight: '300мл'
    },
    {
      category_id: 6,
      name: 'Стейк Рибай',
      description: 'Премиальный стейк из мраморной говядины с печеными овощами и соусом из красного вина.',
      price: 8900,
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=300&fit=crop',
      weight: '300г'
    },
    {
      category_id: 6,
      name: 'Утка конфи',
      description: 'Утиная ножка конфи с картофельным пюре и вишневым соусом.',
      price: 6200,
      image_url: 'https://images.unsplash.com/photo-1612871689142-28b9e0e62ae8?w=300&h=300&fit=crop',
      weight: '350г'
    },
    {
      category_id: 8,
      name: 'Карбонара',
      description: 'Классическая паста с беконом, яичным желтком и сыром Пармезан.',
      price: 3800,
      image_url: 'https://images.unsplash.com/photo-1588013273468-315fd88ea34c?w=300&h=300&fit=crop',
      weight: '320г'
    },
    {
      category_id: 8,
      name: 'Паста с морепродуктами',
      description: 'Спагетти с тигровыми креветками, мидиями и кальмарами в томатном соусе.',
      price: 4600,
      image_url: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=300&h=300&fit=crop',
      weight: '380г'
    },
    {
      category_id: 10,
      name: 'Тирамису',
      description: 'Классический итальянский десерт с маскарпоне и кофе.',
      price: 2400,
      image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&h=300&fit=crop',
      weight: '150г'
    },
    {
      category_id: 10,
      name: 'Чизкейк',
      description: 'Нежный чизкейк с ягодным соусом.',
      price: 2200,
      image_url: 'https://images.unsplash.com/photo-1533134242066-d0dd3e68c19e?w=300&h=300&fit=crop',
      weight: '140г'
    }
  ];

  try {
    // Clear existing dishes first
    await pool.query('TRUNCATE TABLE dishes RESTART IDENTITY CASCADE');

    for (const dish of dishes) {
      await pool.query(
        `INSERT INTO dishes (category_id, name, description_ru, description_en, description_kk, price, image_url, weight) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [dish.category_id, dish.name, dish.description, dish.description, dish.description, dish.price, dish.image_url, dish.weight]
      );
    }
    console.log(`✅ Inserted ${dishes.length} dishes (with Russian descriptions, EN/KK will use same text as fallback)`);
  } catch (error) {
    console.error('Error inserting dishes:', error);
    throw error;
  }
};

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.default.hash('admin123', 10);
    
    await pool.query(
      `INSERT INTO admin_users (username, email, password) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (username) DO NOTHING`,
      ['admin', 'admin@restaurant.com', hashedPassword]
    );
    
    console.log('✅ Default admin user created (username: admin, password: admin123)');
  } catch (error) {
    console.error('Error creating default admin:', error);
    throw error;
  }
};

// Main initialization function
const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing PostgreSQL database...');
    
    await createTables();
    await insertCategories();
    await insertDishes();
    await createDefaultAdmin();
    
    console.log('✅ Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

initializeDatabase();
