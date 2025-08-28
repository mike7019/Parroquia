import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'parroquia_db',
  process.env.DB_USER || 'postgres', 
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

async function findComunionField() {
  try {
    await sequelize.authenticate();
    
    // Buscar campos relacionados con comunión
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
      AND (column_name ILIKE '%comunion%' OR column_name ILIKE '%comunión%' OR column_name ILIKE '%casa%')
      ORDER BY column_name;
    `);
    
    console.log('🔍 Campos relacionados con comunión/casa:');
    if (results.length > 0) {
      results.forEach(col => {
        console.log(`- "${col.column_name}"`);
      });
    } else {
      console.log('- Ninguno encontrado con esos términos');
    }
    
    // También mostrar todos los campos para referencia
    const [allColumns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Todos los campos en familias:');
    allColumns.forEach((col, index) => {
      console.log(`${index + 1}. "${col.column_name}"`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

findComunionField();
