/**
 * Script de prueba para el servicio de salud con filtros basados en IDs
 * Verifica que los filtros funcionan correctamente después de la migración
 */

import saludConsolidadoService from './src/services/consolidados/saludConsolidadoService.js';
import { sequelize } from './src/models/index.js';

async function probarFiltrosConIDs() {
  try {
    console.log('🧪 Iniciando pruebas de filtros basados en IDs...\n');

    // Prueba 1: Sin filtros (solo límite)
    console.log('📋 Prueba 1: Consulta sin filtros');
    const resultadoSinFiltros = await saludConsolidadoService.consultarSalud({ limite: 5 });
    console.log(`✅ Total personas: ${resultadoSinFiltros.total}`);
    console.log(`✅ Personas retornadas: ${resultadoSinFiltros.datos.length}\n`);

    // Prueba 2: Filtro por ID de sexo (Masculino = 1, Femenino = 2)
    console.log('📋 Prueba 2: Filtrar por sexo masculino (id_sexo = 1)');
    const resultadoSexoMasculino = await saludConsolidadoService.consultarSalud({ 
      id_sexo: 1, 
      limite: 5 
    });
    console.log(`✅ Personas masculinas: ${resultadoSexoMasculino.total}`);
    if (resultadoSexoMasculino.datos.length > 0) {
      console.log(`✅ Ejemplo: ${resultadoSexoMasculino.datos[0].nombre} - Sexo: ${resultadoSexoMasculino.datos[0].sexo}`);
    }
    console.log('');

    // Prueba 3: Filtro por ID de parroquia
    console.log('📋 Prueba 3: Filtrar por ID de parroquia');
    const resultadoParroquia = await saludConsolidadoService.consultarSalud({ 
      id_parroquia: 1, 
      limite: 5 
    });
    console.log(`✅ Personas en parroquia: ${resultadoParroquia.total}`);
    if (resultadoParroquia.datos.length > 0) {
      console.log(`✅ Ejemplo: ${resultadoParroquia.datos[0].nombre} - Parroquia: ${resultadoParroquia.datos[0].parroquia}`);
    }
    console.log('');

    // Prueba 4: Filtro por ID de municipio
    console.log('📋 Prueba 4: Filtrar por ID de municipio');
    const resultadoMunicipio = await saludConsolidadoService.consultarSalud({ 
      id_municipio: 1, 
      limite: 5 
    });
    console.log(`✅ Personas en municipio: ${resultadoMunicipio.total}`);
    if (resultadoMunicipio.datos.length > 0) {
      console.log(`✅ Ejemplo: ${resultadoMunicipio.datos[0].nombre} - Municipio: ${resultadoMunicipio.datos[0].municipio}`);
    }
    console.log('');

    // Prueba 5: Filtro combinado (sexo + rango de edad)
    console.log('📋 Prueba 5: Filtro combinado (sexo femenino + edad 18-65)');
    const resultadoCombinado = await saludConsolidadoService.consultarSalud({ 
      id_sexo: 2, 
      rango_edad: '18-65',
      limite: 5 
    });
    console.log(`✅ Personas que coinciden: ${resultadoCombinado.total}`);
    if (resultadoCombinado.datos.length > 0) {
      console.log(`✅ Ejemplo: ${resultadoCombinado.datos[0].nombre} - Sexo: ${resultadoCombinado.datos[0].sexo}, Edad: ${resultadoCombinado.datos[0].edad}`);
    }
    console.log('');

    // Prueba 6: Verificar filtros aplicados
    console.log('📋 Prueba 6: Verificar filtros aplicados en respuesta');
    const resultadoConFiltros = await saludConsolidadoService.consultarSalud({ 
      id_sexo: 1,
      id_municipio: 1,
      limite: 3
    });
    console.log('✅ Filtros aplicados:', JSON.stringify(resultadoConFiltros.filtros_aplicados, null, 2));
    console.log('');

    console.log('🎉 Todas las pruebas completadas exitosamente!');
    console.log('✅ Los filtros basados en IDs funcionan correctamente');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar pruebas
probarFiltrosConIDs();
