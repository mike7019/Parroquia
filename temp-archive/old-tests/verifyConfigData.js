import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

console.log('🔍 Verificando datos de configuración...');

try {
  await sequelize.authenticate();
  console.log('✅ Conexión establecida');
  
  const tables = [
    'tipos_identificacion',
    'estados_civiles', 
    'tipos_vivienda',
    'sistemas_acueducto',
    'tipos_aguas_residuales',
    'tipos_disposicion_basura',
    'sexos',
    'roles',
    'departamentos'
  ];
  
  for (const table of tables) {
    try {
      const [result] = await sequelize.query(
        `SELECT COUNT(*) as count FROM ${table}`,
        { type: QueryTypes.SELECT }
      );
      
      console.log(`📋 ${table}: ${result.count} registros`);
    } catch (error) {
      console.warn(`⚠️  ${table}: ${error.message}`);
    }
  }
  
  console.log('\n✅ Verificación completada');
  
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await sequelize.close();
  console.log('🔌 Conexión cerrada');
}
