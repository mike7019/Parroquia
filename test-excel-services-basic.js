/**
 * Test básico para verificar que los servicios Excel se pueden importar y usar
 */

console.log('🚀 Iniciando importación de servicios...');

let ExcelConfigurationService, ExcelValidationService;

try {
  const services = await import('./src/services/excel/index.js');
  ExcelConfigurationService = services.ExcelConfigurationService;
  ExcelValidationService = services.ExcelValidationService;
  console.log('✅ Servicios importados correctamente');
} catch (error) {
  console.error('❌ Error importando servicios:', error.message);
  process.exit(1);
}

async function testExcelServices() {
  console.log('🧪 Iniciando test básico de servicios Excel...');

  try {
    // Test ExcelConfigurationService
    console.log('\n📋 Testing ExcelConfigurationService...');
    
    // Test obtener configuración por defecto
    const defaultConfig = ExcelConfigurationService.getDefaultConfiguration();
    console.log('✅ Configuración por defecto obtenida:', defaultConfig.name);
    
    // Test obtener configuración predefinida
    const completeConfig = await ExcelConfigurationService.getConfiguration(
      ExcelConfigurationService.CONFIGURATIONS.COMPLETE
    );
    console.log('✅ Configuración completa obtenida:', completeConfig.name);
    
    // Test generar mapeo de columnas
    const columnMapping = ExcelConfigurationService.generateColumnMapping(completeConfig);
    console.log('✅ Mapeo de columnas generado:', Object.keys(columnMapping).length, 'columnas');
    
    // Test configuraciones disponibles
    const availableConfigs = ExcelConfigurationService.getAvailableConfigurations();
    console.log('✅ Configuraciones disponibles:', availableConfigs.length);

    // Test ExcelValidationService
    console.log('\n🔍 Testing ExcelValidationService...');
    
    // Test datos de prueba
    const testFamilies = [
      {
        apellido_familiar: 'garcía lópez',
        telefono: '(123) 456-7890',
        direccion_familia: 'Calle 123',
        ubicacion: {
          municipio: 'Test Municipality',
          vereda: 'Test Vereda'
        },
        miembros: {
          padre: {
            nombre_completo: 'juan garcía',
            identificacion: '12345678',
            edad: 35,
            telefono: '123-456-7890'
          },
          madre: {
            nombre_completo: 'maría lópez',
            identificacion: '87654321',
            edad: 32
          }
        },
        tamaño_familia: 2
      },
      {
        apellido_familiar: '', // Error: campo requerido vacío
        telefono: 'invalid-phone', // Warning: formato inválido
        ubicacion: {
          vereda: 'Test Vereda' // Warning: vereda sin municipio
        },
        miembros: {
          padre: {
            nombre_completo: 'pedro test',
            identificacion: '12345678', // Error: identificación duplicada
            edad: 150 // Warning: edad fuera de rango
          }
        }
      }
    ];
    
    // Test validación de familias
    const validationResult = await ExcelValidationService.validateFamilyData(testFamilies);
    console.log('✅ Validación completada:');
    console.log(`   - Familias válidas: ${validationResult.statistics.valid_count}`);
    console.log(`   - Familias inválidas: ${validationResult.statistics.invalid_count}`);
    console.log(`   - Errores encontrados: ${validationResult.statistics.error_count}`);
    console.log(`   - Advertencias: ${validationResult.statistics.warning_count}`);
    console.log(`   - Correcciones aplicadas: ${validationResult.statistics.corrections_count}`);
    
    // Test reporte de validación
    const validationReport = ExcelValidationService.generateValidationReport(validationResult);
    console.log('✅ Reporte de validación generado:', validationReport.length, 'entradas');
    
    // Test verificación de integridad
    const integrityCheck = await ExcelValidationService.checkDataIntegrity(testFamilies);
    console.log('✅ Verificación de integridad:', integrityCheck.valid_records, '/', integrityCheck.total_records, 'válidos');
    
    // Test correcciones automáticas
    const correctionResult = await ExcelValidationService.autoCorrectCommonIssues(testFamilies);
    console.log('✅ Correcciones automáticas:', correctionResult.corrections_applied.length, 'registros corregidos');

    console.log('\n🎉 Todos los tests básicos pasaron exitosamente!');
    
    // Mostrar algunos ejemplos de correcciones aplicadas
    if (correctionResult.corrections_applied.length > 0) {
      console.log('\n📝 Ejemplos de correcciones aplicadas:');
      correctionResult.corrections_applied.forEach((correction, index) => {
        console.log(`   Registro ${correction.record_index + 1}:`);
        correction.corrections.forEach(c => {
          console.log(`     - ${c.field}: "${c.original}" → "${c.corrected}" (${c.type})`);
        });
      });
    }

    return {
      success: true,
      configurationService: 'OK',
      validationService: 'OK',
      validationStats: validationResult.statistics,
      integrityStats: integrityCheck
    };

  } catch (error) {
    console.error('❌ Error en test:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Ejecutar test si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testExcelServices()
    .then(result => {
      console.log('\n📊 Resultado final del test:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Error fatal en test:', error);
      process.exit(1);
    });
}

export default testExcelServices;