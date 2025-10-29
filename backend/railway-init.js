import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚂 Railway Database Initialization Script');
console.log('==========================================\n');

async function runScript(scriptName, description) {
  console.log(`📦 Running: ${description}...`);
  try {
    const { stdout, stderr } = await execAsync(`node ${scriptName}`, {
      cwd: __dirname
    });
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    console.log(`✅ ${description} completed\n`);
    return true;
  } catch (error) {
    console.error(`❌ Error in ${description}:`, error.message);
    return false;
  }
}

async function initialize() {
  const scripts = [
    { name: 'init-postgres.js', desc: 'Initialize database tables' },
    { name: 'migrations/add-localization.js', desc: 'Add localization fields' },
    { name: 'migrations/fill-translations.js', desc: 'Fill translations' }
  ];

  console.log('Starting database initialization...\n');

  for (const script of scripts) {
    const success = await runScript(script.name, script.desc);
    if (!success) {
      console.error('\n❌ Initialization failed. Please check the errors above.');
      process.exit(1);
    }
  }

  console.log('==========================================');
  console.log('✅ Database initialization completed successfully!');
  console.log('🎉 Your Railway app is ready to use!');
}

// Only run if DATABASE_URL is set (Railway environment)
if (process.env.DATABASE_URL) {
  initialize().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
} else {
  console.log('⚠️  DATABASE_URL not found. Skipping initialization.');
  console.log('This script should only run on Railway with PostgreSQL configured.');
}
