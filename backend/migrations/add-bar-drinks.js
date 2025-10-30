import pool from '../config/database.js';

async function addBarDrinks() {
  try {
    console.log('🍹 Добавление подкатегорий и напитков для бара...');

    // Проверяем, существует ли категория "Бар"
    const barCheck = await pool.query(
      "SELECT id FROM categories WHERE id = 13"
    );

    if (barCheck.rows.length === 0) {
      console.log('❌ Категория "Бар" не найдена. Сначала запустите: npm run add-bar-pizza');
      process.exit(1);
    }

    // Получаем максимальный display_order
    const maxOrderResult = await pool.query(
      'SELECT MAX(display_order) as max_order FROM categories'
    );
    let nextOrder = (maxOrderResult.rows[0].max_order || 0) + 1;

    // Добавляем подкатегории для бара
    console.log('\n📋 Добавление подкатегорий...');
    
    // 1. Прохладительные напитки
    const coolDrinksResult = await pool.query(
      `INSERT INTO categories (name_ru, name_en, name_kk, display_order) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      ['Прохладительные напитки', 'Soft Drinks', 'Салқын сусындар', nextOrder++]
    );
    const coolDrinksId = coolDrinksResult.rows[0].id;
    console.log(`✅ Добавлена категория "Прохладительные напитки" (ID: ${coolDrinksId})`);

    // 2. Лимонады
    const lemonadesResult = await pool.query(
      `INSERT INTO categories (name_ru, name_en, name_kk, display_order) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      ['Лимонады', 'Lemonades', 'Лимонадтар', nextOrder++]
    );
    const lemonadesId = lemonadesResult.rows[0].id;
    console.log(`✅ Добавлена категория "Лимонады" (ID: ${lemonadesId})`);

    // 3. Чаи
    const teasResult = await pool.query(
      `INSERT INTO categories (name_ru, name_en, name_kk, display_order) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      ['Чаи', 'Teas', 'Шайлар', nextOrder++]
    );
    const teasId = teasResult.rows[0].id;
    console.log(`✅ Добавлена категория "Чаи" (ID: ${teasId})`);

    // Добавляем напитки
    console.log('\n🥤 Добавление напитков...');

    // Прохладительные напитки
    const coolDrinks = [
      { name: 'Кока-Кола', name_en: 'Coca-Cola', name_kk: 'Кока-Кола', price: 500, weight: '330 мл' },
      { name: 'Спрайт', name_en: 'Sprite', name_kk: 'Спрайт', price: 500, weight: '330 мл' },
      { name: 'Фанта', name_en: 'Fanta', name_kk: 'Фанта', price: 500, weight: '330 мл' },
      { name: 'Минеральная вода', name_en: 'Mineral Water', name_kk: 'Минералды су', price: 300, weight: '500 мл' },
      { name: 'Сок апельсиновый', name_en: 'Orange Juice', name_kk: 'Апельсин шырыны', price: 600, weight: '250 мл' },
      { name: 'Сок яблочный', name_en: 'Apple Juice', name_kk: 'Алма шырыны', price: 600, weight: '250 мл' },
    ];

    for (const drink of coolDrinks) {
      await pool.query(
        `INSERT INTO dishes (category_id, name, description_ru, description_en, description_kk, price, weight, is_available) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          coolDrinksId,
          drink.name,
          `Освежающий напиток ${drink.name}`,
          `Refreshing ${drink.name_en}`,
          `Сергітетін ${drink.name_kk}`,
          drink.price,
          drink.weight,
          true
        ]
      );
    }
    console.log(`✅ Добавлено ${coolDrinks.length} прохладительных напитков`);

    // Лимонады
    const lemonades = [
      { name: 'Классический лимонад', name_en: 'Classic Lemonade', name_kk: 'Классикалық лимонад', price: 800, weight: '400 мл' },
      { name: 'Клубничный лимонад', name_en: 'Strawberry Lemonade', name_kk: 'Құлпынайлы лимонад', price: 900, weight: '400 мл' },
      { name: 'Мятный лимонад', name_en: 'Mint Lemonade', name_kk: 'Жалбызды лимонад', price: 850, weight: '400 мл' },
      { name: 'Манго лимонад', name_en: 'Mango Lemonade', name_kk: 'Манго лимонад', price: 950, weight: '400 мл' },
      { name: 'Маракуйя лимонад', name_en: 'Passion Fruit Lemonade', name_kk: 'Маракуйя лимонад', price: 950, weight: '400 мл' },
    ];

    for (const drink of lemonades) {
      await pool.query(
        `INSERT INTO dishes (category_id, name, description_ru, description_en, description_kk, price, weight, is_available) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          lemonadesId,
          drink.name,
          `Домашний ${drink.name.toLowerCase()} из свежих ингредиентов`,
          `Homemade ${drink.name_en.toLowerCase()} with fresh ingredients`,
          `Жаңа ингредиенттерден жасалған ${drink.name_kk.toLowerCase()}`,
          drink.price,
          drink.weight,
          true
        ]
      );
    }
    console.log(`✅ Добавлено ${lemonades.length} лимонадов`);

    // Чаи
    const teas = [
      { name: 'Черный чай', name_en: 'Black Tea', name_kk: 'Қара шай', price: 400, weight: '300 мл' },
      { name: 'Зеленый чай', name_en: 'Green Tea', name_kk: 'Жасыл шай', price: 400, weight: '300 мл' },
      { name: 'Чай с лимоном', name_en: 'Tea with Lemon', name_kk: 'Лимонды шай', price: 450, weight: '300 мл' },
      { name: 'Чай с мятой', name_en: 'Mint Tea', name_kk: 'Жалбызды шай', price: 450, weight: '300 мл' },
      { name: 'Имбирный чай', name_en: 'Ginger Tea', name_kk: 'Иірлі шай', price: 500, weight: '300 мл' },
      { name: 'Фруктовый чай', name_en: 'Fruit Tea', name_kk: 'Жемісті шай', price: 550, weight: '300 мл' },
    ];

    for (const drink of teas) {
      await pool.query(
        `INSERT INTO dishes (category_id, name, description_ru, description_en, description_kk, price, weight, is_available) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          teasId,
          drink.name,
          `Ароматный ${drink.name.toLowerCase()}`,
          `Aromatic ${drink.name_en.toLowerCase()}`,
          `Хош иісті ${drink.name_kk.toLowerCase()}`,
          drink.price,
          drink.weight,
          true
        ]
      );
    }
    console.log(`✅ Добавлено ${teas.length} видов чая`);

    // Показываем итоги
    console.log('\n📊 Итого добавлено:');
    console.log(`  - Подкатегорий: 3`);
    console.log(`  - Напитков: ${coolDrinks.length + lemonades.length + teas.length}`);
    
    console.log('\n✅ Напитки успешно добавлены!');
    console.log('\n💡 Теперь на странице /bar будут отображаться все напитки');
    console.log('   http://localhost:5173/bar');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при добавлении напитков:', error);
    process.exit(1);
  }
}

addBarDrinks();
