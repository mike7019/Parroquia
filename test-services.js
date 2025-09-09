#!/usr/bin/env node

import familiasConsultasService from './src/services/familiasConsultasService.js';
import difuntosService from './src/services/difuntosService.js';

async function testServices() {
  try {
    console.log('🧪 Probando servicios...');
    
    // Test familiasConsultasService
    console.log('\n1. Testing familiasConsultasService...');
    console.log('- Tipo:', typeof familiasConsultasService);
    console.log('- ¿Tiene consultarFamiliasConPadresMadres?:', typeof familiasConsultasService.consultarFamiliasConPadresMadres);
    console.log('- Métodos disponibles:', Object.getOwnPropertyNames(Object.getPrototypeOf(familiasConsultasService)).filter(m => m !== 'constructor'));
    
    // Test difuntosService
    console.log('\n2. Testing difuntosService...');
    console.log('- Tipo:', typeof difuntosService);
    console.log('- ¿Tiene getMadresDifuntas?:', typeof difuntosService.getMadresDifuntas);
    console.log('- Métodos disponibles:', Object.getOwnPropertyNames(Object.getPrototypeOf(difuntosService)).filter(m => m !== 'constructor'));
    
    // Test método específico
    console.log('\n3. Testing método consultarFamiliasConPadresMadres...');
    try {
      const resultado = await familiasConsultasService.consultarFamiliasConPadresMadres({ limite: 1 });
      console.log('✅ Método funciona correctamente');
      console.log('- Tipo de resultado:', typeof resultado);
      console.log('- ¿Es array?:', Array.isArray(resultado));
      if (resultado && Array.isArray(resultado)) {
        console.log('- Cantidad de elementos:', resultado.length);
      } else if (resultado && resultado.datos) {
        console.log('- Estructura con datos:', !!resultado.datos);
        console.log('- Cantidad en datos:', Array.isArray(resultado.datos) ? resultado.datos.length : 'No es array');
      }
    } catch (methodError) {
      console.error('❌ Error en método:', methodError.message);
    }
    
    console.log('\n✅ Testing completado');
    
  } catch (error) {
    console.error('❌ Error en testing:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

testServices();
