/**
 * Test simple para verificar importaciones del modelo Estudio
 */

console.log('🧪 Iniciando test de importaciones...');

try {
  console.log('📦 Importando sequelize...');
  const { default: sequelize } = await import('./config/sequelize.js');
  console.log('✅ Sequelize importado correctamente');

  console.log('📦 Importando modelo Estudio...');
  const { default: Estudio } = await import('./src/models/catalog/Estudio.js');
  console.log('✅ Modelo Estudio importado correctamente');

  console.log('🔗 Probando conexión a base de datos...');
  await sequelize.authenticate();
  console.log('✅ Conexión a base de datos exitosa');

  console.log('📋 Información del modelo:');
  console.log(`   Nombre de tabla: ${Estudio.tableName}`);
  console.log(`   Atributos: ${Object.keys(Estudio.rawAttributes).join(', ')}`);

  console.log('🎉 Todas las importaciones funcionan correctamente');

} catch (error) {
  console.error('❌ Error en importaciones:', error.message);
  console.error('Stack:', error.stack);
} finally {
  process.exit(0);
}
