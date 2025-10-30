import pool from '../config/database.js';

async function addPageField() {
  try {
    console.log('🔄 Добавление поля "page" в таблицу categories...');

    // Добавляем поле page
    await pool.query(`
      ALTER TABLE categories 
      ADD COLUMN IF NOT EXISTS page VARCHAR(50) DEFAULT 'kitchen'
    `);
    console.log('✅ Поле "page" добавлено');

    // Обновляем существующие категории
    console.log('\n🔄 Обновление существующих категорий...');
    
    // Категории кухни (display_order 1-12)
    await pool.query(`
      UPDATE categories 
      SET page = 'kitchen' 
      WHERE display_order >= 1 AND display_order <= 12
    `);
    console.log('✅ Категории кухни: page = "kitchen"');

    // Категории бара (Прохладительные напитки, Лимонады, Чаи)
    await pool.query(`
      UPDATE categories 
      SET page = 'bar' 
      WHERE name_ru IN ('Прохладительные напитки', 'Лимонады', 'Чаи')
    `);
    console.log('✅ Категории бара: page = "bar"');

    // Категория пиццы
    await pool.query(`
      UPDATE categories 
      SET page = 'pizza' 
      WHERE name_ru = 'Пицца'
    `);
    console.log('✅ Категория пиццы: page = "pizza"');

    // Категория "Бар" (родительская) - скрываем её
    await pool.query(`
      UPDATE categories 
      SET page = 'hidden' 
      WHERE name_ru = 'Бар'
    `);
    console.log('✅ Категория "Бар" (родительская): page = "hidden"');

    // Показываем результат
    const allCategories = await pool.query(
      'SELECT id, name_ru, display_order, page FROM categories ORDER BY display_order'
    );
    
    console.log('\n📋 Обновленные категории:');
    allCategories.rows.forEach(cat => {
      console.log(`  ${cat.display_order}. ${cat.name_ru} - page: "${cat.page}" (ID: ${cat.id})`);
    });

    console.log('\n✅ Поле "page" успешно добавлено!');
    console.log('\n💡 Теперь при добавлении новых категорий указывайте:');
    console.log('   - page = "kitchen" для категорий кухни');
    console.log('   - page = "bar" для категорий бара');
    console.log('   - page = "pizza" для категорий пиццы');
    console.log('   - page = "hidden" для скрытых категорий');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при добавлении поля:', error);
    process.exit(1);
  }
}

addPageField();
