import pool from '../config/database.js';

async function restoreBarCategories() {
  try {
    console.log('🔄 Восстановление категорий Бара...');

    // Проверяем, есть ли уже категории Бара
    const existingCheck = await pool.query(
      "SELECT id, name_ru FROM categories WHERE name_ru IN ('Бар', 'Пицца', 'Прохладительные напитки', 'Лимонады', 'Чаи')"
    );

    if (existingCheck.rows.length > 0) {
      console.log('\n⚠️  Категории Бара уже существуют:');
      existingCheck.rows.forEach(cat => console.log(`  - ${cat.name_ru} (ID: ${cat.id})`));
      process.exit(0);
    }

    // Добавляем категории Бара
    const barCategories = [
      { name_ru: 'Бар', name_en: 'Bar', name_kk: 'Бар', order: 13 },
      { name_ru: 'Пицца', name_en: 'Pizza', name_kk: 'Пицца', order: 14 },
      { name_ru: 'Прохладительные напитки', name_en: 'Soft Drinks', name_kk: 'Салқын сусындар', order: 15 },
      { name_ru: 'Лимонады', name_en: 'Lemonades', name_kk: 'Лимонадтар', order: 16 },
      { name_ru: 'Чаи', name_en: 'Teas', name_kk: 'Шайлар', order: 17 }
    ];

    console.log('\n➕ Добавление категорий Бара...');
    for (const cat of barCategories) {
      await pool.query(
        `INSERT INTO categories (name_ru, name_en, name_kk, display_order) 
         VALUES ($1, $2, $3, $4)`,
        [cat.name_ru, cat.name_en, cat.name_kk, cat.order]
      );
      console.log(`  ✅ ${cat.order}. ${cat.name_ru}`);
    }

    // Показываем все категории
    const allCategories = await pool.query(
      'SELECT id, name_ru, name_en, name_kk, display_order FROM categories ORDER BY display_order'
    );
    
    console.log('\n📋 Все категории:');
    allCategories.rows.forEach(cat => {
      console.log(`  ${cat.display_order}. ${cat.name_ru} (${cat.name_en} / ${cat.name_kk}) - ID: ${cat.id}`);
    });

    console.log('\n✅ Категории Бара восстановлены!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при восстановлении категорий:', error);
    process.exit(1);
  }
}

restoreBarCategories();
