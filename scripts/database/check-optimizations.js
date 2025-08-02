const { Sequelize } = require('sequelize');
const config = require('./config/config.cjs');
const sequelize = new Sequelize(config.development);

async function checkOptimizations() {
  try {
    await sequelize.authenticate();
    
    console.log('🔍 VERIFICANDO ESTADO DE LAS OPTIMIZACIONES...\n');
    
    // 1. Verificar estructura de persona_destreza
    const [personaDestrezaCols] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'persona_destreza' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Columnas en persona_destreza:');
    personaDestrezaCols.forEach(col => console.log(`  - ${col.column_name}`));
    
    // 2. Verificar si existe campo sexo en personas
    const [personasCols] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'personas' AND column_name = 'sexo';
    `);
    
    console.log('\n🔍 Campo sexo en personas:');
    console.log(personasCols.length > 0 ? '❌ Aún existe' : '✅ Eliminado correctamente');
    
    // 3. Verificar existencia de tablas
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('parroquia', 'parroquias', 'veredas_has_many_familias')
      ORDER BY table_name;
    `);
    
    console.log('\n🔍 Tablas duplicadas/redundantes:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name} ${table.table_name === 'parroquias' || table.table_name === 'veredas_has_many_familias' ? '❌ Debe eliminarse' : '✅ Mantener'}`);
    });
    
    // 4. Verificar índices creados
    const [indexes] = await sequelize.query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname;
    `);
    
    console.log('\n🔍 Índices de optimización:');
    indexes.forEach(idx => {
      console.log(`  ✅ ${idx.indexname} en ${idx.tablename}`);
    });
    
    console.log('\n📊 RESUMEN:');
    console.log(`- Campo sexo eliminado: ${personasCols.length === 0 ? '✅' : '❌'}`);
    console.log(`- Nomenclatura optimizada: ${personaDestrezaCols.some(c => c.column_name === 'id_persona') ? '✅' : '❌'}`);
    console.log(`- Tabla parroquias eliminada: ${!tables.some(t => t.table_name === 'parroquias') ? '✅' : '❌'}`);
    console.log(`- Índices creados: ${indexes.length} índices`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkOptimizations();
