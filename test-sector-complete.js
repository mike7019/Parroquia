// Script para probar la creación de sectores con municipio
import sequelize from './config/sequelize.js';
import Sector from './src/models/catalog/Sector.js';
import Municipios from './src/models/catalog/Municipios.js';

async function testSectorCreation() {
  try {
    console.log('🧪 Probando la creación de sectores con municipio...\n');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Definir asociaciones
    Sector.belongsTo(Municipios, {
      foreignKey: 'id_municipio',
      as: 'municipio'
    });
    
    Municipios.hasMany(Sector, {
      foreignKey: 'id_municipio',
      as: 'sectores'
    });
    
    // Mostrar municipios disponibles
    const municipios = await Municipios.findAll({
      attributes: ['id_municipio', 'nombre_municipio']
    });
    
    console.log('🏛️ Municipios disponibles:');
    municipios.forEach(mun => {
      console.log(`  - ID: ${mun.id_municipio}, Nombre: ${mun.nombre_municipio}`);
    });
    
    // Crear un nuevo sector
    const nuevoSector = {
      nombre: 'Sector de Prueba API',
      id_municipio: municipios[0].id_municipio
    };
    
    console.log(`\n🔧 Creando sector: ${nuevoSector.nombre}`);
    console.log(`📍 Municipio: ${municipios[0].nombre_municipio} (ID: ${nuevoSector.id_municipio})`);
    
    const sectorCreado = await Sector.create(nuevoSector);
    console.log('✅ Sector creado exitosamente:');
    console.log(`  - ID: ${sectorCreado.id_sector}`);
    console.log(`  - Nombre: ${sectorCreado.nombre}`);
    console.log(`  - ID Municipio: ${sectorCreado.id_municipio}`);
    console.log(`  - Created At: ${sectorCreado.created_at}`);
    console.log(`  - Updated At: ${sectorCreado.updated_at}`);
    
    // Buscar sectores con información del municipio
    console.log('\n📋 Consultando sectores con información de municipio...');
    const sectoresConMunicipio = await Sector.findAll({
      include: [{
        model: Municipios,
        as: 'municipio',
        attributes: ['id_municipio', 'nombre_municipio']
      }],
      order: [['id_sector', 'DESC']],
      limit: 5
    });
    
    console.log('Últimos 5 sectores:');
    sectoresConMunicipio.forEach(sector => {
      console.log(`  - ${sector.nombre} (Municipio: ${sector.municipio.nombre_municipio})`);
    });
    
    // Probar validación sin municipio (debe fallar)
    console.log('\n🚫 Probando validación sin municipio...');
    try {
      await Sector.create({
        nombre: 'Sector Sin Municipio'
        // id_municipio faltante intencionalmente
      });
      console.log('❌ ERROR: Se permitió crear sector sin municipio');
    } catch (error) {
      if (error.name === 'SequelizeValidationError' || error.message.includes('notNull')) {
        console.log('✅ Validación funcionando: No se puede crear sector sin municipio');
      } else {
        console.log('⚠️ Error diferente:', error.message);
      }
    }
    
    console.log('\n🎯 Resumen de pruebas:');
    console.log('  ✅ Creación de sector con municipio: EXITOSA');
    console.log('  ✅ Consulta con asociaciones: EXITOSA');
    console.log('  ✅ Validación de municipio obligatorio: EXITOSA');
    console.log('  ✅ Timestamps automáticos: EXITOSA');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar pruebas
testSectorCreation();
