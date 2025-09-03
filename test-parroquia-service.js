import sequelize from './config/sequelize.js';

async function testParroquiaService() {
  try {
    console.log('🧪 Probando servicio de parroquia...');
    
    // Verificar modelos disponibles
    console.log('Modelos disponibles:', Object.keys(sequelize.models));
    
    // Verificar modelo Parroquia específicamente
    const ParroquiaModel = sequelize.models.Parroquia;
    if (ParroquiaModel) {
      console.log('✅ Modelo Parroquia encontrado');
      console.log('Asociaciones:', Object.keys(ParroquiaModel.associations || {}));
      
      // Probar consulta directa
      const parroquias = await ParroquiaModel.findAll({
        limit: 3,
        order: [['id_parroquia', 'ASC']]
      });
      
      console.log(`📊 Parroquias encontradas: ${parroquias.length}`);
      if (parroquias.length > 0) {
        console.log('Primera parroquia:', {
          id: parroquias[0].id_parroquia,
          nombre: parroquias[0].nombre,
          id_municipio: parroquias[0].id_municipio
        });
      }
      
      // Probar con include si existe la asociación
      if (ParroquiaModel.associations && ParroquiaModel.associations.municipio) {
        console.log('✅ Asociación municipio encontrada, probando include...');
        const parroquiasWithMunicipio = await ParroquiaModel.findAll({
          include: [{
            association: 'municipio',
            attributes: ['id_municipio', 'nombre_municipio']
          }],
          limit: 2
        });
        console.log(`📊 Parroquias con municipio: ${parroquiasWithMunicipio.length}`);
      } else {
        console.log('⚠️  No se encontró asociación municipio');
      }
      
    } else {
      console.log('❌ Modelo Parroquia no encontrado');
    }
    
    // Probar el servicio importado
    console.log('\n🧪 Probando servicio importado...');
    const service = await import('./src/services/catalog/parroquiaService.js');
    const result = await service.default.getAllParroquias();
    console.log('Resultado del servicio:', {
      status: result.status,
      total: result.total,
      message: result.message
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testParroquiaService();
