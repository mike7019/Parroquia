import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

console.log('🔧 Iniciando corrección de datos...');

try {
  await sequelize.authenticate();
  console.log('✅ Conexión establecida');
  
  // Contar registros con problema
  const [nullCount] = await sequelize.query(
    'SELECT COUNT(*) as count FROM parroquia WHERE id_municipio IS NULL',
    { type: QueryTypes.SELECT }
  );
  
  console.log(`📊 Registros con id_municipio NULL: ${nullCount.count}`);
  
  if (nullCount.count > 0) {
    // Obtener primer municipio
    const [firstMunicipio] = await sequelize.query(
      'SELECT id_municipio FROM municipios ORDER BY id_municipio LIMIT 1',
      { type: QueryTypes.SELECT }
    );
    
    if (firstMunicipio) {
      console.log(`🔄 Asignando municipio ID: ${firstMunicipio.id_municipio}`);
      
      await sequelize.query(
        `UPDATE parroquia SET id_municipio = ${firstMunicipio.id_municipio} WHERE id_municipio IS NULL`
      );
      
      console.log('✅ Datos corregidos');
    }
  } else {
    console.log('✅ No hay datos para corregir');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await sequelize.close();
  console.log('🔌 Conexión cerrada');
}
