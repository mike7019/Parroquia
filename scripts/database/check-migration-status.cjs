const { Sequelize } = require('sequelize');
const config = require('./config/config.cjs');
const sequelize = new Sequelize(config.development);

async function checkMigrationStatus() {
  try {
    await sequelize.authenticate();
    console.log('📊 VERIFICANDO ESTADO DE LA MIGRACIÓN...\n');
    
    // 1. Verificar si la tabla parroquia existe
    const [parroquiaExists] = await sequelize.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'parroquia'
    `);
    
    // 2. Verificar si la tabla veredas_has_many_familias existe
    const [veredasHasManyExists] = await sequelize.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'veredas_has_many_familias'
    `);
    
    // 3. Verificar campo sexo en personas
    const [sexoColumn] = await sequelize.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'personas' AND column_name = 'sexo'
    `);
    
    // 4. Verificar estado de la tabla persona_destreza
    const [personaDestrezaColumns] = await sequelize.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'persona_destreza' 
      ORDER BY ordinal_position
    `);
    
    // 5. Verificar índices creados
    const [customIndexes] = await sequelize.query(`
      SELECT indexname FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_%'
      ORDER BY indexname
    `);
    
    console.log('✅ RESULTADOS:');
    console.log('─'.repeat(50));
    console.log(`❌ Tabla parroquia eliminada: ${parroquiaExists.length === 0 ? '✅ SÍ' : '❌ NO'}`);
    console.log(`❌ Tabla veredas_has_many_familias eliminada: ${veredasHasManyExists.length === 0 ? '✅ SÍ' : '❌ NO'}`);
    console.log(`❌ Campo sexo eliminado: ${sexoColumn.length === 0 ? '✅ SÍ' : '❌ NO'}`);
    
    if (personaDestrezaColumns.length > 0) {
      console.log(`\n📋 Columnas en persona_destreza:`);
      personaDestrezaColumns.forEach(col => {
        console.log(`   - ${col.column_name}`);
      });
    }
    
    if (customIndexes.length > 0) {
      console.log(`\n📚 Índices personalizados creados:`);
      customIndexes.forEach(idx => {
        console.log(`   - ${idx.indexname}`);
      });
    } else {
      console.log(`\n📚 Índices personalizados: ❌ NO CREADOS`);
    }
    
    // 6. Verificar el estado de las migraciones
    const [migrations] = await sequelize.query(`
      SELECT name FROM "SequelizeMeta" 
      WHERE name LIKE '%optimize%' 
      ORDER BY name
    `);
    
    console.log(`\n🔄 Migraciones de optimización aplicadas:`);
    if (migrations.length > 0) {
      migrations.forEach(mig => {
        console.log(`   ✅ ${mig.name}`);
      });
    } else {
      console.log(`   ❌ NO HAY MIGRACIONES DE OPTIMIZACIÓN APLICADAS`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkMigrationStatus();
