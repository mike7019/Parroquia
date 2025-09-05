import * as models from './src/models/index.js';
import sequelize from './config/sequelize.js';

async function verificarEstructuraTablas() {
  try {
    console.log('🔍 Verificando estructura de tablas...');
    
    // Verificar tabla parroquias
    const [parroquiasDesc] = await sequelize.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'parroquias' ORDER BY ordinal_position"
    );
    console.log('\n📋 Tabla parroquias:');
    parroquiasDesc.forEach(col => console.log('  -', col.column_name, '(', col.data_type, ')'));
    
    // Verificar tabla sectores
    const [sectoresDesc] = await sequelize.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'sectores' ORDER BY ordinal_position"
    );
    console.log('\n📋 Tabla sectores:');
    sectoresDesc.forEach(col => console.log('  -', col.column_name, '(', col.data_type, ')'));
    
    // Verificar tabla veredas
    const [veredasDesc] = await sequelize.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'veredas' ORDER BY ordinal_position"
    );
    console.log('\n📋 Tabla veredas:');
    veredasDesc.forEach(col => console.log('  -', col.column_name, '(', col.data_type, ')'));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarEstructuraTablas();
