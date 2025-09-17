// INSPECCIONAR ESTRUCTURA REAL DE LA BASE DE DATOS
// Para ajustar la query SQL según la estructura actual

async function inspectDatabase() {
  console.log('🔍 INSPECCIONANDO ESTRUCTURA DE BASE DE DATOS');
  console.log('===============================================');
  
  try {
    // Import dinámico para ESM
    const { sequelize } = await import('./src/models/index.js');
    const { QueryTypes } = await import('sequelize');
    
    console.log('📡 Conectado a la base de datos');
    
    // 1. Verificar tablas principales
    console.log('\n📋 TABLAS PRINCIPALES:');
    const tablas = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('familias', 'personas', 'difuntos_familia', 'parroquias', 'municipios', 'departamentos', 'sectores', 'veredas')
      ORDER BY table_name;
    `, { type: QueryTypes.SELECT });
    
    tablas.forEach(tabla => {
      console.log(`✅ ${tabla.table_name}`);
    });
    
    // 2. Inspeccionar estructura de tabla personas
    console.log('\n👤 ESTRUCTURA TABLA PERSONAS:');
    const columnasPersonas = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'personas' 
        AND table_schema = 'public'
      ORDER BY ordinal_position;
    `, { type: QueryTypes.SELECT });
    
    if (columnasPersonas.length > 0) {
      columnasPersonas.forEach(col => {
        console.log(`   ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    } else {
      console.log('❌ Tabla personas no encontrada');
    }
    
    // 3. Inspeccionar estructura de tabla familias
    console.log('\n🏠 ESTRUCTURA TABLA FAMILIAS:');
    const columnasFamilias = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
        AND table_schema = 'public'
      ORDER BY ordinal_position;
    `, { type: QueryTypes.SELECT });
    
    if (columnasFamilias.length > 0) {
      columnasFamilias.forEach(col => {
        console.log(`   ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    } else {
      console.log('❌ Tabla familias no encontrada');
    }
    
    // 4. Verificar claves foráneas entre personas y familias
    console.log('\n🔗 RELACIONES ENTRE PERSONAS Y FAMILIAS:');
    const relaciones = await sequelize.query(`
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND (tc.table_name = 'personas' OR tc.table_name = 'familias')
      ORDER BY tc.table_name;
    `, { type: QueryTypes.SELECT });
    
    if (relaciones.length > 0) {
      relaciones.forEach(rel => {
        console.log(`   ${rel.table_name}.${rel.column_name} -> ${rel.foreign_table_name}.${rel.foreign_column_name}`);
      });
    } else {
      console.log('⚠️  No se encontraron relaciones FK directas');
    }
    
    // 5. Buscar datos de muestra para entender la estructura
    console.log('\n📊 DATOS DE MUESTRA - PERSONAS (primeros 3):');
    const muestraPersonas = await sequelize.query(`
      SELECT * FROM personas LIMIT 3;
    `, { type: QueryTypes.SELECT });
    
    if (muestraPersonas.length > 0) {
      console.log('Columnas encontradas:', Object.keys(muestraPersonas[0]));
      console.log('Primera persona:', muestraPersonas[0]);
    } else {
      console.log('❌ No hay datos en tabla personas');
    }
    
    // 6. Buscar datos de muestra de familias
    console.log('\n🏠 DATOS DE MUESTRA - FAMILIAS (primeros 3):');
    const muestraFamilias = await sequelize.query(`
      SELECT * FROM familias LIMIT 3;
    `, { type: QueryTypes.SELECT });
    
    if (muestraFamilias.length > 0) {
      console.log('Columnas encontradas:', Object.keys(muestraFamilias[0]));
      console.log('Primera familia:', muestraFamilias[0]);
    } else {
      console.log('❌ No hay datos en tabla familias');
    }
    
    // 7. Verificar tabla de difuntos
    console.log('\n⚰️  ESTRUCTURA TABLA DIFUNTOS_FAMILIA:');
    const columnasDifuntos = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'difuntos_familia' 
        AND table_schema = 'public'
      ORDER BY ordinal_position;
    `, { type: QueryTypes.SELECT });
    
    if (columnasDifuntos.length > 0) {
      columnasDifuntos.forEach(col => {
        console.log(`   ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('❌ Tabla difuntos_familia no encontrada');
    }
    
    console.log('\n✅ INSPECCIÓN COMPLETADA');
    
  } catch (error) {
    console.error('❌ Error inspeccionando base de datos:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    try {
      const { sequelize } = await import('./src/models/index.js');
      await sequelize.close();
      console.log('📊 Conexión cerrada');
    } catch (closeError) {
      console.error('Error cerrando conexión:', closeError.message);
    }
  }
}

// Ejecutar inspección
console.log('🔍 INICIANDO INSPECCIÓN DE BASE DE DATOS');
console.log('Para ajustar la query SQL según estructura real');
console.log('');

inspectDatabase();