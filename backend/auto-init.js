import pool from './config/database.js';

// Auto-initialize database if tables don't exist
export async function autoInitDatabase() {
  try {
    // Check if categories table exists
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'categories'
      );
    `);
    
    const tablesExist = result.rows[0].exists;
    
    if (!tablesExist) {
      console.log('📦 Tables not found. Running auto-initialization...');
      
      // Import and run init script
      const initModule = await import('./init-postgres.js');
      // The init script will run automatically when imported
      
      console.log('✅ Auto-initialization complete!');
    } else {
      console.log('✅ Database tables already exist');
    }
  } catch (error) {
    console.error('⚠️  Auto-init check failed:', error.message);
    // Don't fail the server start, just log the error
  }
}
