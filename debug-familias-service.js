/**
 * Script de depuración para probar el servicio de familias
 */

import familiasConsultasService from './src/services/familiasConsultasService.js';

async function probarServicio() {
  try {
    console.log('🔍 Probando servicio de familias...');
    
    const filtros = { limite: 5 };
    console.log('📋 Filtros:', filtros);
    
    const resultado = await familiasConsultasService.consultarFamiliasConPadresMadres(filtros);
    
    console.log('✅ Resultado obtenido:');
    console.log(`📊 Total de familias: ${resultado?.length || 0}`);
    console.log('🔍 Tipo de resultado:', typeof resultado);
    console.log('🔍 Es array?:', Array.isArray(resultado));
    console.log('🔍 Estructura completa:', JSON.stringify(resultado, null, 2));
    
    if (resultado && resultado.length > 0) {
      console.log('👥 Primera familia:', {
        apellido: resultado[0].apellido_familiar,
        sector: resultado[0].sector,
        personas: resultado[0].personas?.length || 0
      });
    }
    
    console.log('🎉 Servicio funciona correctamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error en servicio:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

probarServicio().then(exito => {
  console.log(`\n${exito ? '✅' : '❌'} Prueba completada`);
  process.exit(exito ? 0 : 1);
});
