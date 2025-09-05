import { DataTypes } from 'sequelize';
import sequelize from './config/sequelize.js';

async function checkStructure() {
  try {
    console.log('🔍 Verificando estructura de tabla familias...');
    
    // Ver columnas de tipo_vivienda
    const [columns] = await sequelize.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'familias' AND column_name LIKE '%tipo_vivienda%';"
    );
    console.log('\n📋 Columnas tipo_vivienda en tabla familias:');
    console.log(columns);
    
    // Ver datos de familias
    const [familias] = await sequelize.query(
      'SELECT id_familia, tipo_vivienda, COALESCE(id_tipo_vivienda, 0) as id_tipo_vivienda FROM familias LIMIT 5;'
    );
    console.log('\n📊 Datos de familias (primeras 5):');
    console.log(familias);
    
    // Ver tipos de vivienda disponibles
    const [tipos] = await sequelize.query(
      'SELECT id_tipo_vivienda, nombre FROM tipos_vivienda;'
    );
    console.log('\n🏠 Tipos de vivienda disponibles:');
    console.log(tipos);
    
    await sequelize.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkStructure();
