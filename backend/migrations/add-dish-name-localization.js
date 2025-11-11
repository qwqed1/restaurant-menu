import pool from '../config/database.js';

async function addDishNameLocalization() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Adding localization fields for dish names...');
    
    // Add new columns for localized dish names
    await client.query(`
      ALTER TABLE dishes 
      ADD COLUMN IF NOT EXISTS name_ru TEXT,
      ADD COLUMN IF NOT EXISTS name_en TEXT,
      ADD COLUMN IF NOT EXISTS name_kk TEXT
    `);
    
    // Copy existing 'name' to 'name_ru' for existing dishes
    await client.query(`
      UPDATE dishes 
      SET name_ru = name,
          name_en = name,
          name_kk = name
      WHERE name_ru IS NULL
    `);
    
    // Make name_ru NOT NULL after copying data
    await client.query(`
      ALTER TABLE dishes 
      ALTER COLUMN name_ru SET NOT NULL
    `);
    
    console.log('✅ Dish name localization fields added successfully');
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error adding dish name localization:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  addDishNameLocalization()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default addDishNameLocalization;
