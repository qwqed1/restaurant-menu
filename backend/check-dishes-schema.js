import pool from './config/database.js';

async function checkDishesSchema() {
  try {
    console.log('Checking dishes table schema...\n');
    
    // Get column information
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'dishes'
      ORDER BY ordinal_position;
    `);
    
    console.log('Dishes table columns:');
    console.table(result.rows);
    
    // Check if name_ru, name_en, name_kk exist
    const hasNameRu = result.rows.some(row => row.column_name === 'name_ru');
    const hasNameEn = result.rows.some(row => row.column_name === 'name_en');
    const hasNameKk = result.rows.some(row => row.column_name === 'name_kk');
    
    console.log('\nLocalization fields status:');
    console.log(`✓ name_ru: ${hasNameRu ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`✓ name_en: ${hasNameEn ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`✓ name_kk: ${hasNameKk ? '✅ EXISTS' : '❌ MISSING'}`);
    
    // Sample data check
    const sampleData = await pool.query('SELECT id, name, name_ru, name_en, name_kk FROM dishes LIMIT 3');
    console.log('\nSample dish data:');
    console.table(sampleData.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking schema:', error);
    process.exit(1);
  }
}

checkDishesSchema();
