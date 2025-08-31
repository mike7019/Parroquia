import { db } from './src/config/database.js';
const { sequelize } = db;

async function checkTables() {
  try {
    // Verificar que las tablas existen
    console.log('🔍 Verificando tablas...');
    
    const tables = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('personas', 'sexos', 'tipos_identificacion', 'estados_civil')
      ORDER BY table_name
    `);
    
    console.log('📋 Tablas encontradas:', tables[0].map(t => t.table_name));
    
    // Verificar columnas específicas
    const personasColumns = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'personas' 
      AND column_name IN ('id_sexo', 'id_tipo_identificacion_tipo_identificacion', 'id_estado_civil_estado_civil')
    `);
    
    console.log('📋 Columnas de personas:', personasColumns[0].map(c => c.column_name));
    
    // Verificar columnas de sexos
    const sexosColumns = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'sexos'
    `);
    
    console.log('📋 Columnas de sexos:', sexosColumns[0].map(c => c.column_name));
    
    // Verificar columnas de tipos_identificacion
    const tiposIdColumns = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tipos_identificacion'
    `);
    
    console.log('📋 Columnas de tipos_identificacion:', tiposIdColumns[0].map(c => c.column_name));
    
    // Verificar si existe estados_civil
    const estadosCivilColumns = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'estados_civil'
    `);
    
    console.log('📋 Columnas de estados_civil:', estadosCivilColumns[0].map(c => c.column_name));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTables();
