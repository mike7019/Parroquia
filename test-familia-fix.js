// Test rápido para verificar que el fix de familia funciona
import { Familias, Municipios, sequelize } from './src/models/index.js';

async function testFamiliaInsercion() {
  try {
    console.log('🧪 Probando inserción de familia con fix aplicado...\n');
    
    // Obtener un municipio existente
    const municipio = await Municipios.findOne();
    
    const datosCompletos = {
      apellido_familiar: 'FAMILIA_TEST_FIX',
      sector: 'Centro', // Fix aplicado: valor por defecto mejorado
      direccion_familia: 'Calle Test 123',
      tamaño_familia: 2, // Fix aplicado: mínimo 1
      tipo_vivienda: 'Casa', // Fix aplicado: valor por defecto mejorado
      estado_encuesta: 'completed',
      numero_encuestas: 1,
      fecha_ultima_encuesta: new Date(),
      id_municipio: municipio ? municipio.id_municipio : null
    };
    
    console.log('📝 Datos a insertar:', datosCompletos);
    
    const familiaTest = await Familias.create(datosCompletos);
    console.log(`✅ ¡ÉXITO! Familia creada con ID: ${familiaTest.id_familia}`);
    
    // Limpiar
    await familiaTest.destroy();
    console.log('🗑️ Familia de prueba eliminada');
    
    console.log('\n🎉 RESULTADO: El fix funciona correctamente');
    console.log('   - Los campos obligatorios se están proporcionando');
    console.log('   - La secuencia de id_familia funciona');
    console.log('   - No hay más errores de NOT NULL constraint');
    
  } catch (error) {
    console.error('❌ Error en test:', error.message);
    
    if (error.message.includes('null value in column "id_familia"')) {
      console.log('🚨 El problema original persiste');
    } else {
      console.log('ℹ️ Error diferente:', error.message);
    }
  } finally {
    await sequelize.close();
  }
}

testFamiliaInsercion();
