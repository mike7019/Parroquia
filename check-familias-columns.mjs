import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

const verificarColumnas = async () => {
  try {
    await sequelize.authenticate();
    console.log('🔍 Verificando columnas en tabla familias...');
    
    const columnas = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'familias'
      ORDER BY ordinal_position;
    `, { type: QueryTypes.SELECT });
    
    console.log('\n📊 COLUMNAS DISPONIBLES EN TABLA FAMILIAS:');
    console.log('==========================================');
    columnas.forEach((col, i) => {
      console.log(`${i+1}. ${col.column_name} (${col.data_type})`);
    });
    
    // También verificar algunos datos de ejemplo
    console.log('\n📋 EJEMPLO DE DATOS:');
    console.log('====================');
    const [ejemplo] = await sequelize.query(`
      SELECT * FROM familias LIMIT 1
    `, { type: QueryTypes.SELECT });
    
    if (ejemplo) {
      Object.keys(ejemplo).forEach(key => {
        console.log(`${key}: ${ejemplo[key]}`);
      });
    } else {
      console.log('No hay datos en la tabla familias');
    }
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

verificarColumnas();
