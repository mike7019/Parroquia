import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

async function checkTables() {
  try {
    const tables = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND (table_name LIKE '%habilidad%' OR table_name LIKE '%persona%')
      ORDER BY table_name;
    `, { type: QueryTypes.SELECT });

    console.log('📊 Tablas relacionadas con personas y habilidades:\n');
    tables.forEach(t => console.log('  -', t.table_name));

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTables();
