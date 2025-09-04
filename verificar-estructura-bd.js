// Script para verificar la estructura de tablas
import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

async function verificarEstructuraBD() {
  try {
    console.log('🔍 Verificando estructura de la base de datos...');
    
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');
    
    // Verificar tablas existentes
    const tablas = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `, { type: QueryTypes.SELECT });
    
    console.log('\n📋 Tablas disponibles:');
    tablas.forEach(tabla => console.log(`  - ${tabla.table_name}`));
    
    // Verificar estructura de departamentos
    if (tablas.some(t => t.table_name === 'departamentos')) {
      console.log('\n🏛️ Estructura de tabla departamentos:');
      const columnasDepartamentos = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'departamentos' 
        ORDER BY ordinal_position;
      `, { type: QueryTypes.SELECT });
      
      columnasDepartamentos.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
    // Verificar estructura de municipios
    if (tablas.some(t => t.table_name === 'municipios')) {
      console.log('\n🏙️ Estructura de tabla municipios:');
      const columnasMunicipios = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'municipios' 
        ORDER BY ordinal_position;
      `, { type: QueryTypes.SELECT });
      
      columnasMunicipios.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
    // Verificar estructura de familias
    if (tablas.some(t => t.table_name === 'familias')) {
      console.log('\n👨‍👩‍👧‍👦 Estructura de tabla familias:');
      const columnasFamilias = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'familias' 
        ORDER BY ordinal_position;
      `, { type: QueryTypes.SELECT });
      
      columnasFamilias.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
    // Verificar estructura de personas
    if (tablas.some(t => t.table_name === 'personas')) {
      console.log('\n👤 Estructura de tabla personas:');
      const columnasPersonas = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'personas' 
        ORDER BY ordinal_position;
      `, { type: QueryTypes.SELECT });
      
      columnasPersonas.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
    await sequelize.close();
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error verificando estructura:', error);
    throw error;
  }
}

verificarEstructuraBD()
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
