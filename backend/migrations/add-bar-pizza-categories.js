import pool from '../config/database.js';

async function addBarPizzaCategories() {
  try {
    console.log('🍹 Добавление категорий для бара и пиццы...');

    // Проверяем, есть ли уже категории
    const existingCheck = await pool.query(
      "SELECT id FROM categories WHERE name_ru IN ('Бар', 'Пицца')"
    );

    if (existingCheck.rows.length > 0) {
      console.log('⚠️  Категории "Бар" и/или "Пицца" уже существуют');
      
      // Показываем существующие категории
      const allCategories = await pool.query(
        'SELECT id, name_ru, name_en, name_kk, display_order FROM categories ORDER BY display_order'
      );
      console.log('\n📋 Существующие категории:');
      allCategories.rows.forEach(cat => {
        console.log(`  ${cat.display_order}. ${cat.name_ru} (${cat.name_en} / ${cat.name_kk})`);
      });
      
      process.exit(0);
    }

    // Получаем максимальный display_order
    const maxOrderResult = await pool.query(
      'SELECT MAX(display_order) as max_order FROM categories'
    );
    const nextOrder = (maxOrderResult.rows[0].max_order || 0) + 1;

    // Добавляем категорию "Бар"
    const barResult = await pool.query(
      `INSERT INTO categories (name_ru, name_en, name_kk, display_order) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      ['Бар', 'Bar', 'Бар', nextOrder]
    );
    console.log(`✅ Добавлена категория "Бар" (ID: ${barResult.rows[0].id})`);

    // Добавляем категорию "Пицца"
    const pizzaResult = await pool.query(
      `INSERT INTO categories (name_ru, name_en, name_kk, display_order) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      ['Пицца', 'Pizza', 'Пицца', nextOrder + 1]
    );
    console.log(`✅ Добавлена категория "Пицца" (ID: ${pizzaResult.rows[0].id})`);

    // Показываем все категории
    const allCategories = await pool.query(
      'SELECT id, name_ru, name_en, name_kk, display_order FROM categories ORDER BY display_order'
    );
    
    console.log('\n📋 Все категории:');
    allCategories.rows.forEach(cat => {
      console.log(`  ${cat.display_order}. ${cat.name_ru} (${cat.name_en} / ${cat.name_kk}) - ID: ${cat.id}`);
    });

    console.log('\n✅ Категории успешно добавлены!');
    console.log('\n💡 Теперь можно добавить блюда через админ-панель:');
    console.log('   http://localhost:5173/admin/dashboard');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при добавлении категорий:', error);
    process.exit(1);
  }
}

addBarPizzaCategories();
