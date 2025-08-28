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

async function checkColumns() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');
    
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Todas las columnas en familias:');
    results.forEach((col, index) => {
      console.log(`${index + 1}. "${col.column_name}"`);
    });
    
    // Check specifically for comunionEnCasa variations
    const [comunionCheck] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
      AND (column_name = 'comunionEnCasa' OR column_name = 'comunionencasa' OR column_name = 'comunion_en_casa');
    `);
    
    console.log('\n🔍 Columnas relacionadas con comunion:');
    if (comunionCheck.length > 0) {
      comunionCheck.forEach(col => {
        console.log(`- "${col.column_name}"`);
      });
    } else {
      console.log('- Ninguna encontrada');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkColumns();
