import pool from '../config/database.js';

async function updateCategories() {
  try {
    console.log('🔄 Обновление категорий...');

    // Новый список категорий
    const newCategories = [
      { name_ru: 'Завтраки', name_en: 'Breakfast', name_kk: 'Таңғы ас', order: 1 },
      { name_ru: 'Супы', name_en: 'Soups', name_kk: 'Сорпалар', order: 2 },
      { name_ru: 'Салаты', name_en: 'Salads', name_kk: 'Салаттар', order: 3 },
      { name_ru: 'Вок и восточные блюда', name_en: 'Wok and Asian dishes', name_kk: 'Вок және шығыс тағамдары', order: 4 },
      { name_ru: 'Горячие блюда', name_en: 'Hot dishes', name_kk: 'Ыстық тағамдар', order: 5 },
      { name_ru: 'Стейки', name_en: 'Steaks', name_kk: 'Стейктер', order: 6 },
      { name_ru: 'Гарниры', name_en: 'Side dishes', name_kk: 'Гарнирлер', order: 7 },
      { name_ru: 'Выпечка', name_en: 'Bakery', name_kk: 'Нан-тоқаш', order: 8 },
      { name_ru: 'Манты', name_en: 'Manti', name_kk: 'Мәнті', order: 9 },
      { name_ru: 'Пасты', name_en: 'Pasta', name_kk: 'Паста', order: 10 },
      { name_ru: 'Блюда на компанию', name_en: 'Dishes for company', name_kk: 'Компанияға арналған тағамдар', order: 11 },
      { name_ru: 'Десерты', name_en: 'Desserts', name_kk: 'Десерттер', order: 12 }
    ];

    // Показываем текущие категории
    const currentCategories = await pool.query(
      'SELECT id, name_ru, name_en, name_kk, display_order FROM categories ORDER BY display_order'
    );
    
    console.log('\n📋 Текущие категории:');
    currentCategories.rows.forEach(cat => {
      console.log(`  ${cat.display_order}. ${cat.name_ru} (${cat.name_en} / ${cat.name_kk}) - ID: ${cat.id}`);
    });

    // Удаляем только старые категории кухни (оставляем Бар, Пиццу и напитки)
    console.log('\n🗑️  Удаление старых категорий кухни...');
    await pool.query(`DELETE FROM categories WHERE name_ru NOT IN ('Бар', 'Пицца', 'Прохладительные напитки', 'Лимонады', 'Чаи')`);
    console.log('✅ Старые категории кухни удалены (Бар и напитки сохранены)');

    // Добавляем новые категории
    console.log('\n➕ Добавление новых категорий...');
    for (const cat of newCategories) {
      await pool.query(
        `INSERT INTO categories (name_ru, name_en, name_kk, display_order) 
         VALUES ($1, $2, $3, $4)`,
        [cat.name_ru, cat.name_en, cat.name_kk, cat.order]
      );
      console.log(`  ✅ ${cat.order}. ${cat.name_ru}`);
    }

    // Обновляем порядок для категорий Бара (чтобы они были после кухни)
    console.log('\n🔄 Обновление порядка категорий Бара...');
    await pool.query(`UPDATE categories SET display_order = 13 WHERE name_ru = 'Бар'`);
    await pool.query(`UPDATE categories SET display_order = 14 WHERE name_ru = 'Пицца'`);
    await pool.query(`UPDATE categories SET display_order = 15 WHERE name_ru = 'Прохладительные напитки'`);
    await pool.query(`UPDATE categories SET display_order = 16 WHERE name_ru = 'Лимонады'`);
    await pool.query(`UPDATE categories SET display_order = 17 WHERE name_ru = 'Чаи'`);
    console.log('✅ Порядок обновлен');

    // Показываем новые категории
    const updatedCategories = await pool.query(
      'SELECT id, name_ru, name_en, name_kk, display_order FROM categories ORDER BY display_order'
    );
    
    console.log('\n📋 Обновленные категории:');
    updatedCategories.rows.forEach(cat => {
      console.log(`  ${cat.display_order}. ${cat.name_ru} (${cat.name_en} / ${cat.name_kk}) - ID: ${cat.id}`);
    });

    console.log('\n✅ Категории кухни успешно обновлены!');
    console.log('✅ Категории Бара и напитков сохранены!');
    console.log('\n⚠️  ВНИМАНИЕ: Блюда из старых категорий кухни теперь без категорий!');
    console.log('💡 Зайдите в админ-панель и назначьте блюдам новые категории:');
    console.log('   http://localhost:5173/admin/dashboard');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при обновлении категорий:', error);
    process.exit(1);
  }
}

updateCategories();
