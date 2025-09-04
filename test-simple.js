// Prueba Simple de Conexión y Consulta de Familias
import sequelize from './config/sequelize.js';
import FamiliasConsultasService from './src/services/familiasConsultasService.js';

async function pruebaSimple() {
  try {
    console.log('🔍 Iniciando prueba simple...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos OK');
    
    // Test service
    const servicio = new FamiliasConsultasService();
    console.log('✅ Servicio de consultas creado');
    
    // Execute simple query
    const resultado = await servicio.consultarFamiliasConPadresMadres({ limite: 1 });
    console.log('✅ Consulta ejecutada');
    console.log('📊 Total familias:', resultado.total);
    
    if (resultado.total > 0) {
      const familia = resultado.datos[0];
      console.log('🎯 Primera familia encontrada:');
      console.log('  - ID:', familia.id_encuesta);
      console.log('  - Apellido:', familia.informacionGeneral?.apellido_familiar);
      console.log('  - Miembros:', familia.familyMembers?.length || 0);
      console.log('  - Difuntos:', familia.deceasedMembers?.length || 0);
      
      // Quick validation
      const errores = [];
      if (!familia.id_encuesta) errores.push('id_encuesta es null');
      if (!familia.informacionGeneral) errores.push('informacionGeneral es null');
      if (!familia.familyMembers) errores.push('familyMembers es null');
      if (!familia.metadata) errores.push('metadata es null');
      
      if (errores.length === 0) {
        console.log('✅ Estructura básica válida');
      } else {
        console.log('❌ Errores de estructura:', errores);
      }
    } else {
      console.log('⚠️ No se encontraron familias en la base de datos');
    }
    
    await sequelize.close();
    console.log('🔐 Conexión cerrada');
    console.log('🎉 Prueba simple completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en prueba simple:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

pruebaSimple();
