import { readFileSync } from 'fs';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const seq = new Sequelize(
  process.env.DB_NAME || 'parroquia_db',
  process.env.DB_USER || 'parroquia_user',
  process.env.DB_PASSWORD || 'ParroquiaSecure2025',
  { host: process.env.DB_HOST || 'localhost', dialect: 'postgres', logging: false }
);

const sql = readFileSync('migrations/crear-liderazgo.sql', 'utf8');

// Split on semicolons and run each statement
const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

let ok = 0, fail = 0;
for (const stmt of statements) {
  try {
    await seq.query(stmt + ';');
    process.stdout.write('.');
    ok++;
  } catch (e) {
    console.error('\nERROR:', e.message);
    console.error('Statement:', stmt.slice(0, 100));
    fail++;
  }
}

console.log(`\nMigración completada: ${ok} OK, ${fail} errores.`);
await seq.close();
