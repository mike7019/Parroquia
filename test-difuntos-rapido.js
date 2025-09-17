#!/usr/bin/env node

import difuntosConsolidadoService from './src/services/consolidados/difuntosConsolidadoService.js';
import sequelize from './config/sequelize.js';

async function testRapido() {
  try {
    console.log('🔍 Probando servicio consolidado de difuntos...\n');

    // Test básico
    console.log('1. Test consulta básica:');
    const resultado = await difuntosConsolidadoService.consultarDifuntos({});
    console.log(`✅ Difuntos encontrados: ${resultado.difuntos.length}`);
    console.log(`📊 Total en BD: ${resultado.total}`);
    
    if (resultado.difuntos.length > 0) {
      console.log('\n📋 Primer difunto encontrado:');
      console.log(JSON.stringify(resultado.difuntos[0], null, 2));
    }

    // Test filtro por mes
    console.log('\n2. Test filtro por mes (mayo = 5):');
    const mayo = await difuntosConsolidadoService.consultarDifuntos({ mes_aniversario: 5 });
    console.log(`✅ Difuntos en mayo: ${mayo.difuntos.length}`);

    // Test búsqueda por nombre
    console.log('\n3. Test búsqueda por nombre "Pedro":');
    const pedro = await difuntosConsolidadoService.buscarPorNombre('Pedro');
    console.log(`✅ Resultados para "Pedro": ${pedro.length}`);
    
    if (pedro.length > 0) {
      console.log('📋 Resultado de búsqueda:');
      console.log(JSON.stringify(pedro[0], null, 2));
    }

    console.log('\n✅ Todas las pruebas completadas exitosamente');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔚 Conexión cerrada');
  }
}

testRapido();
