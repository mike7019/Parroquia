import sequelize from './config/sequelize.js';

async function diagnosticarUsuarios() {
  try {
    console.log('🔍 DIAGNÓSTICO COMPLETO DE LA TABLA USUARIOS');
    console.log('=' .repeat(60));
    
    // 1. Verificar si la tabla existe
    const [tableExists] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
      );
    `);
    
    console.log('1. ¿Existe la tabla usuarios?', tableExists[0].exists ? '✅ SÍ' : '❌ NO');
    
    if (!tableExists[0].exists) {
      console.log('❌ La tabla usuarios no existe. Necesita ser creada.');
      return;
    }
    
    // 2. Obtener estructura completa de la tabla
    const [columns] = await sequelize.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n2. Estructura actual de la tabla usuarios:');
    console.table(columns);
    
    // 3. Verificar específicamente la columna id
    const idColumn = columns.find(col => col.column_name === 'id');
    console.log('\n3. Análisis de la columna ID:');
    if (idColumn) {
      console.log('✅ Columna "id" encontrada');
      console.log('   - Tipo:', idColumn.data_type);
      console.log('   - Nullable:', idColumn.is_nullable);
      console.log('   - Default:', idColumn.column_default);
    } else {
      console.log('❌ Columna "id" NO encontrada');
      
      // Buscar posibles variantes
      const possibleIds = columns.filter(col => 
        col.column_name.includes('id') || 
        col.column_name.includes('uuid') ||
        col.column_name.includes('pk')
      );
      
      if (possibleIds.length > 0) {
        console.log('🔍 Posibles columnas de ID encontradas:');
        console.table(possibleIds);
      }
    }
    
    // 4. Contar registros
    const [count] = await sequelize.query('SELECT COUNT(*) as total FROM usuarios;');
    console.log(`\n4. Total de registros en usuarios: ${count[0].total}`);
    
    // 5. Mostrar algunos registros de ejemplo (sin ID para evitar el error)
    try {
      const [sample] = await sequelize.query(`
        SELECT correo_electronico, primer_nombre, primer_apellido, activo 
        FROM usuarios 
        LIMIT 3;
      `);
      console.log('\n5. Registros de ejemplo (sin columna ID):');
      console.table(sample);
    } catch (error) {
      console.log('\n5. Error al obtener registros:', error.message);
    }
    
    // 6. Verificar índices
    const [indexes] = await sequelize.query(`
      SELECT 
        indexname, 
        indexdef 
      FROM pg_indexes 
      WHERE tablename = 'usuarios';
    `);
    
    console.log('\n6. Índices en la tabla usuarios:');
    console.table(indexes);
    
  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

diagnosticarUsuarios();
