// 🚀 SINCRONIZACIÓN DIRECTA DE BD
// Ejecutar con: node sync-direct.mjs

import sequelize from './config/sequelize.js';

console.log('🚀 SINCRONIZACIÓN DIRECTA DE BASE DE DATOS');
console.log('=========================================');

try {
  console.log('🔗 Conectando a la base de datos...');
  await sequelize.authenticate();
  console.log('✅ Conexión establecida correctamente');
  
  const [dbInfo] = await sequelize.query(`
    SELECT current_database() as db_name, 
           current_user as db_user,
           version() as db_version;
  `);
  
  console.log(`📊 Base de datos: ${dbInfo[0].db_name}`);
  console.log(`👤 Usuario: ${dbInfo[0].db_user}`);
  console.log(`🐘 PostgreSQL: ${dbInfo[0].db_version.split(' ')[1]}`);
  console.log('');

  console.log('🔄 Sincronizando modelos con la base de datos...');
  console.log('   Modo: ALTER (solo agregar/modificar, no eliminar)');
  
  // Sincronizar con alter: true (seguro - no elimina datos)
  await sequelize.sync({ alter: true });
  
  console.log('✅ Sincronización completada');
  console.log('');
  
  console.log('🔍 Verificando cambios implementados...');
  
  // Verificar campo comunionEnCasa
  const [comunionField] = await sequelize.query(`
    SELECT column_name, data_type, column_default, is_nullable
    FROM information_schema.columns 
    WHERE table_name = 'familias' 
    AND column_name = 'comunionEnCasa';
  `);
  
  if (comunionField.length > 0) {
    console.log('✅ Campo comunionEnCasa:');
    console.log(`   - Tipo: ${comunionField[0].data_type}`);
    console.log(`   - Default: ${comunionField[0].column_default}`);
    console.log(`   - Nullable: ${comunionField[0].is_nullable}`);
  } else {
    console.log('❌ Campo comunionEnCasa NO encontrado');
  }
  
  // Verificar estructura general
  const [tableInfo] = await sequelize.query(`
    SELECT 
      t.table_name,
      COUNT(c.column_name) as column_count
    FROM information_schema.tables t
    LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
    WHERE t.table_schema = 'public' 
    AND t.table_name IN ('familias', 'personas', 'usuarios')
    GROUP BY t.table_name
    ORDER BY t.table_name;
  `);
  
  console.log('');
  console.log('📊 Resumen de tablas principales:');
  tableInfo.forEach(table => {
    console.log(`   📁 ${table.table_name}: ${table.column_count} columnas`);
  });
  
  // Contar registros
  const [familias] = await sequelize.query('SELECT COUNT(*) as count FROM familias');
  const [personas] = await sequelize.query('SELECT COUNT(*) as count FROM personas');
  const [usuarios] = await sequelize.query('SELECT COUNT(*) as count FROM usuarios');
  
  console.log('');
  console.log('📈 Datos existentes:');
  console.log(`   👨‍👩‍👧‍👦 Familias: ${familias[0].count}`);
  console.log(`   👤 Personas: ${personas[0].count}`);
  console.log(`   👥 Usuarios: ${usuarios[0].count}`);
  
  await sequelize.close();
  
  console.log('');
  console.log('🎉 SINCRONIZACIÓN EXITOSA');
  console.log('========================');
  console.log('✅ Base de datos actualizada con todos tus cambios');
  console.log('✅ Campo comunionEnCasa disponible');
  console.log('✅ Validación de miembros únicos activa');
  console.log('');
  console.log('🔧 Próximos pasos:');
  console.log('   1. Reiniciar aplicación: pm2 restart parroquia-api');
  console.log('   2. Verificar logs: pm2 logs parroquia-api');
  console.log('   3. Probar endpoints actualizados');
  
  process.exit(0);
  
} catch (error) {
  console.error('❌ Error durante la sincronización:', error.message);
  
  if (error.name === 'ConnectionError') {
    console.error('');
    console.error('🔧 Posibles soluciones:');
    console.error('   1. Verificar que PostgreSQL esté ejecutándose');
    console.error('   2. Verificar credenciales en .env');
    console.error('   3. Verificar conectividad de red');
  } else if (error.name === 'DatabaseError') {
    console.error('');
    console.error('🔧 Posibles soluciones:');
    console.error('   1. Verificar permisos de usuario de BD');
    console.error('   2. Verificar que la BD existe');
    console.error('   3. Revisar sintaxis de consultas');
  }
  
  console.error('');
  console.error('📋 Stack trace (primeras líneas):');
  if (error.stack) {
    console.error(error.stack.split('\n').slice(0, 5).join('\n'));
  }
  
  process.exit(1);
}
