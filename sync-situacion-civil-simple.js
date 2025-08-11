/**
 * Script simple para sincronizar SituacionCivil
 */

console.log('🚀 Iniciando sincronización de SituacionCivil...');

import { fileURLToPath } from 'url';
import path from 'path';

try {
  console.log('📦 Importando dependencias...');
  
  // Importar sequelize
  const sequelizeModule = await import('./config/sequelize.js');
  const sequelize = sequelizeModule.default;
  console.log('✅ Sequelize importado');

  // Importar modelos
  await import('./src/models/index.js');
  console.log('✅ Modelos importados');

  // Obtener modelo
  const { SituacionCivil } = sequelize.models;
  
  if (!SituacionCivil) {
    console.error('❌ Modelo SituacionCivil no encontrado');
    console.log('📋 Modelos disponibles:', Object.keys(sequelize.models));
    process.exit(1);
  }

  console.log('✅ Modelo SituacionCivil encontrado');

  // Conectar
  console.log('🔌 Conectando a la base de datos...');
  await sequelize.authenticate();
  console.log('✅ Conexión establecida');

  // Sincronizar
  console.log('🔄 Sincronizando tabla...');
  await SituacionCivil.sync({ alter: true });
  console.log('✅ Tabla sincronizada exitosamente');

  // Cerrar conexión
  await sequelize.close();
  console.log('✅ Sincronización completada');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
