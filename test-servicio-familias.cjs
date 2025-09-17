// TEST SERVICIO FAMILIAS - Paso 4 del plan de implementación
// Prueba del método obtenerFamiliasAgrupadas() aisladamente

async function testServicioFamilias() {
  console.log('🔧 INICIANDO TEST DEL SERVICIO FAMILIAS AGRUPADAS');
  console.log('===================================================');
  
  try {
    console.log('📡 Importando servicio...');
    
    // Import dinámico
    const familiasService = await import('./src/services/consolidados/familiasConsolidadoService.js');
    const service = familiasService.default;
    
    console.log('✅ Servicio importado correctamente');
    
    // TEST 1: Llamada básica sin filtros
    console.log('\n🧪 TEST 1: Llamada básica (límite 3 familias)');
    console.log('================================================');
    
    const resultado1 = await service.obtenerFamiliasAgrupadas({
      limite: 3
    });
    
    console.log(`📊 Familias obtenidas: ${resultado1.familias.length}`);
    console.log(`🔍 Total reportado: ${resultado1.total}`);
    console.log(`⚙️  Filtros aplicados:`, resultado1.filtros_aplicados);
    
    if (resultado1.familias.length > 0) {
      const primeraFamilia = resultado1.familias[0];
      console.log('\n🏠 PRIMERA FAMILIA:');
      console.log(`   ID: ${primeraFamilia.familia_id}`);
      console.log(`   Código: ${primeraFamilia.codigo_familia}`);
      console.log(`   Apellido: ${primeraFamilia.apellido_familiar}`);
      console.log(`   Ubicación: ${primeraFamilia.ubicacion.parroquia} - ${primeraFamilia.ubicacion.municipio}`);
      
      console.log('\n👥 MIEMBROS POR TIPO:');
      console.log(`   Padres: ${primeraFamilia.miembros.padres.length}`);
      console.log(`   Madres: ${primeraFamilia.miembros.madres.length}`);
      console.log(`   Hijos vivos: ${primeraFamilia.miembros.hijos_vivos.length}`);
      console.log(`   Otros miembros: ${primeraFamilia.miembros.otros_miembros ? primeraFamilia.miembros.otros_miembros.length : 0}`);
      console.log(`   Difuntos: ${primeraFamilia.miembros.difuntos.length}`);
      
      console.log('\n📊 ESTADÍSTICAS:');
      console.log(`   Total miembros: ${primeraFamilia.estadisticas.total_miembros}`);
      console.log(`   Vivos: ${primeraFamilia.estadisticas.total_vivos}`);
      console.log(`   Difuntos: ${primeraFamilia.estadisticas.total_difuntos}`);
      console.log(`   Menores: ${primeraFamilia.estadisticas.total_menores}`);
      console.log(`   Adultos: ${primeraFamilia.estadisticas.total_adultos}`);
      console.log(`   Tiene teléfono: ${primeraFamilia.estadisticas.tiene_telefono}`);
      console.log(`   Tiene email: ${primeraFamilia.estadisticas.tiene_email}`);
      
      console.log('\n🏥 RESUMEN PASTORAL:');
      console.log(`   Necesidades salud: ${primeraFamilia.resumen_pastoral.necesidades_salud.length}`);
      console.log(`   Destrezas disponibles: ${primeraFamilia.resumen_pastoral.destrezas_disponibles.length}`);
      
      // Mostrar detalles de un miembro si existe
      const todosMiembros = [
        ...primeraFamilia.miembros.padres,
        ...primeraFamilia.miembros.madres,
        ...primeraFamilia.miembros.hijos_vivos,
        ...(primeraFamilia.miembros.otros_miembros || []),
        ...primeraFamilia.miembros.difuntos
      ];
      
      if (todosMiembros.length > 0) {
        const primerMiembro = todosMiembros[0];
        console.log('\n👤 PRIMER MIEMBRO DETALLE:');
        console.log(`   Nombre: ${primerMiembro.nombre_completo}`);
        console.log(`   Cédula: ${primerMiembro.cedula}`);
        console.log(`   Tipo: ${primerMiembro.tipo_miembro}`);
        console.log(`   Edad: ${primerMiembro.edad}`);
        console.log(`   Es menor: ${primerMiembro.es_menor}`);
        console.log(`   Es difunto: ${primerMiembro.es_difunto}`);
        console.log(`   Teléfono: ${primerMiembro.telefono || 'No disponible'}`);
        console.log(`   Email: ${primerMiembro.email || 'No disponible'}`);
      }
    }
    
    // TEST 2: Con filtros
    console.log('\n🧪 TEST 2: Con filtro de parroquia');
    console.log('=====================================');
    
    const resultado2 = await service.obtenerFamiliasAgrupadas({
      parroquia: 'Central',  // Ajustar según datos reales
      limite: 2
    });
    
    console.log(`📊 Familias con filtro parroquia: ${resultado2.familias.length}`);
    
    // TEST 3: Validar estructura de datos
    console.log('\n🧪 TEST 3: Validación de estructura de datos');
    console.log('===============================================');
    
    let errores = 0;
    
    if (resultado1.familias.length === 0) {
      console.log('❌ No se obtuvieron familias');
      errores++;
    } else {
      console.log('✅ Se obtuvieron familias');
      
      const familia = resultado1.familias[0];
      
      // Validar estructura de familia
      if (!familia.familia_id || !familia.codigo_familia) {
        console.log('❌ Estructura de familia incorrecta (falta ID o código)');
        errores++;
      } else {
        console.log('✅ Estructura de familia correcta');
      }
      
      // Validar ubicación
      if (!familia.ubicacion || !familia.ubicacion.parroquia) {
        console.log('❌ Estructura de ubicación incorrecta');
        errores++;
      } else {
        console.log('✅ Estructura de ubicación correcta');
      }
      
      // Validar miembros
      if (!familia.miembros || typeof familia.miembros.padres === 'undefined') {
        console.log('❌ Estructura de miembros incorrecta');
        errores++;
      } else {
        console.log('✅ Estructura de miembros correcta');
      }
      
      // Validar estadísticas
      if (!familia.estadisticas || typeof familia.estadisticas.total_miembros === 'undefined') {
        console.log('❌ Estructura de estadísticas incorrecta');
        errores++;
      } else {
        console.log('✅ Estructura de estadísticas correcta');
      }
      
      // Validar coherencia de datos
      const totalCalculado = familia.miembros.padres.length + 
                           familia.miembros.madres.length + 
                           familia.miembros.hijos_vivos.length + 
                           (familia.miembros.otros_miembros ? familia.miembros.otros_miembros.length : 0) +
                           familia.miembros.difuntos.length;
      
      if (totalCalculado !== familia.estadisticas.total_miembros) {
        console.log(`❌ Inconsistencia en total de miembros: calculado=${totalCalculado}, reportado=${familia.estadisticas.total_miembros}`);
        errores++;
      } else {
        console.log('✅ Coherencia de datos correcta');
      }
    }
    
    // RESULTADO FINAL
    console.log('\n🎯 RESULTADO FINAL DEL TEST');
    console.log('=============================');
    
    if (errores === 0) {
      console.log('🎉 TODOS LOS TESTS PASARON!');
      console.log('✅ Método obtenerFamiliasAgrupadas() funciona correctamente');
      console.log('✅ Estructura de datos cumple con el diseño del notebook');
      console.log('✅ Listo para implementar generación Excel');
      process.exit(0);
    } else {
      console.log(`⚠️  ${errores} problemas encontrados`);
      console.log('❌ Revisar implementación antes de continuar');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 ERROR EN TEST DEL SERVICIO:');
    console.error('===============================');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.message.includes('Cannot read properties')) {
      console.error('\n🔧 DIAGNÓSTICO: Error de estructura de datos');
      console.error('   - Verificar que el método devuelve la estructura correcta');
      console.error('   - Revisar el procesamiento en estructurarFamiliaCompleta()');
    } else if (error.message.includes('relation') || error.message.includes('column')) {
      console.error('\n🔧 DIAGNÓSTICO: Error de base de datos');
      console.error('   - Verificar que la query SQL es correcta');
      console.error('   - Revisar nombres de tablas y columnas');
    }
    
    process.exit(1);
  }
}

// Ejecutar test
console.log('🚀 INICIANDO TEST DEL SERVICIO FAMILIAS AGRUPADAS');
console.log('Basado en el método implementado según diseño del notebook');
console.log('');

testServicioFamilias();