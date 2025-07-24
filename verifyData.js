import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'parroquia_db',
  process.env.DB_USER || 'parroquia_user', 
  process.env.DB_PASSWORD || 'admin',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false // Sin logging para salida limpia
  }
);

async function verifyData() {
  try {
    console.log('📊 Verificando datos en las tablas de catálogos...\n');
    
    const catalogs = [
      'tipo_identificacion',
      'estado_civil', 
      'sexo',
      'tipo_vivienda',
      'parroquia',
      'parentesco',
      'sistemas_acueducto',
      'niveles_educativos',
      'comunidades_culturales',
      'destrezas',
      'roles',
      'areas_liderazgo',
      'municipios',
      'veredas'
    ];
    
    for (const table of catalogs) {
      try {
        const [result] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table};`);
        const count = result[0]?.count || 0;
        console.log(`✅ ${table.padEnd(25)} : ${count} registros`);
      } catch (error) {
        console.log(`❌ ${table.padEnd(25)} : Error - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await sequelize.close();
  }
}

verifyData();
