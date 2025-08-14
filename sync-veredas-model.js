/**
 * Script para sincronizar SOLO el modelo Veredas con force
 * Esto recreará la tabla con la nueva estructura
 */
import sequelize from './config/sequelize.js';
import Veredas from './src/models/catalog/Veredas.js';

async function syncVeredasModel() {
  try {
    console.log('🔄 Sincronizando modelo Veredas con FORCE...');
    console.log('⚠️ ADVERTENCIA: Esto recreará la tabla veredas');
    
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    // Guardar datos existentes
    console.log('💾 Guardando datos existentes...');
    const existingData = await sequelize.query(`
      SELECT id_vereda, nombre, codigo_vereda, id_municipio_municipios, id_sector_sector, created_at, updated_at
      FROM veredas
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log(`📊 ${existingData.length} registros encontrados para respaldar`);
    
    // Forzar recreación de la tabla veredas
    console.log('🔄 Recreando tabla veredas...');
    await Veredas.sync({ force: true });
    console.log('✅ Tabla veredas recreada con nueva estructura');
    
    // Restaurar datos con la nueva estructura
    console.log('📋 Restaurando datos...');
    for (const vereda of existingData) {
      await Veredas.create({
        nombre: vereda.nombre,
        nombre_vereda: vereda.nombre, // Usar nombre para poblar nombre_vereda
        codigo_vereda: vereda.codigo_vereda,
        id_municipio_municipios: vereda.id_municipio_municipios,
        id_sector_sector: vereda.id_sector_sector
        // created_at y updated_at se generarán automáticamente
      });
    }
    
    console.log(`✅ ${existingData.length} registros restaurados`);
    
    // Verificar resultado
    console.log('🔍 Verificando estructura final...');
    const finalStructure = await sequelize.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'veredas' 
      ORDER BY ordinal_position
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.table(finalStructure);
    
    // Verificar datos
    const finalData = await Veredas.findAll({ limit: 3 });
    console.log('\n📋 Datos verificados:');
    console.table(finalData.map(v => v.toJSON()));
    
    console.log('\n✅ ¡Modelo Veredas sincronizado exitosamente!');
    console.log('🚀 La columna nombre_vereda ya está disponible');
    
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
  } finally {
    await sequelize.close();
  }
}

syncVeredasModel().catch(console.error);
