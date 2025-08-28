import FamiliasConsultasService from './src/services/familiasConsultasService.js';
import sequelize from './config/sequelize.js';

// Función de prueba para los servicios de consultas
async function probarConsultas() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    // Probar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa\n');

    console.log('🔍 Probando consulta de madres...');
    const resultadoMadres = await FamiliasConsultasService.consultarPorMadres({ limite: 5 });
    console.log(`✅ Madres encontradas: ${resultadoMadres.total}`);
    console.log('📋 Primeras 3 madres:', resultadoMadres.datos.slice(0, 3));

    console.log('\n🔍 Probando consulta de padres...');
    const resultadoPadres = await FamiliasConsultasService.consultarPorPadres({ limite: 5 });
    console.log(`✅ Padres encontrados: ${resultadoPadres.total}`);
    console.log('📋 Primeros 3 padres:', resultadoPadres.datos.slice(0, 3));

    console.log('\n🎉 Pruebas completadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

probarConsultas();
