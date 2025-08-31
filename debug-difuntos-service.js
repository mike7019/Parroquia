/**
 * Script de depuración para probar el servicio de difuntos
 */

import difuntosService from './src/services/difuntosService.js';

async function probarServicio() {
  try {
    console.log('🔍 Probando servicio de difuntos...');
    
    const filtros = { limite: 5 };
    console.log('📋 Filtros:', filtros);
    
    const resultado = await difuntosService.getTodosDifuntos(filtros);
    
    console.log('✅ Resultado obtenido:');
    console.log(`📊 Total de difuntos: ${resultado?.length || 0}`);
    console.log('🔍 Tipo de resultado:', typeof resultado);
    console.log('🔍 Es array?:', Array.isArray(resultado));
    console.log('🔍 Estructura completa:', JSON.stringify(resultado, null, 2));
    
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
