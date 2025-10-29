import pg from 'pg';

const { Pool } = pg;

// Use public URL for Railway PostgreSQL
const publicUrl = 'postgresql://postgres:pFWYtiSWaZxgrscBVZqCJfsubhuFXkIo@maglev.proxy.rlwy.net:43216/railway';

const pool = new Pool({
  connectionString: publicUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initDatabase() {
  try {
    console.log('🚀 Connecting to Railway PostgreSQL...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected successfully!');
    
    // Import and run init script
    const { default: initScript } = await import('./init-postgres.js');
    
    console.log('✅ Database initialized!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initDatabase();
