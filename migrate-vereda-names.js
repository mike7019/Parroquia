/**
 * Script post-sync para migrar datos de 'nombre' a 'nombre_vereda'
 * Este script se ejecuta después de que el sync alter agregue la nueva columna
 */
import sequelize from './config/sequelize.js';
import Veredas from './src/models/catalog/Veredas.js';

async function migrateName() {
  try {
    console.log('🔄 Iniciando migración de datos nombre -> nombre_vereda...');
    
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // Actualizar registros donde nombre_vereda es null pero nombre existe
    const [affectedCount] = await sequelize.query(`
      UPDATE veredas 
      SET nombre_vereda = nombre 
      WHERE nombre_vereda IS NULL AND nombre IS NOT NULL
    `);

    console.log(`✅ ${affectedCount} registros actualizados`);

    // Verificar resultado
    const veredas = await Veredas.findAll({
      attributes: ['id_vereda', 'nombre', 'nombre_vereda', 'codigo_vereda'],
      limit: 5
    });

    console.log('\n📋 Verificación de datos migrados:');
    console.table(veredas.map(v => v.toJSON()));

    console.log('\n✅ Migración completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await sequelize.close();
  }
}

migrateName().catch(console.error);
