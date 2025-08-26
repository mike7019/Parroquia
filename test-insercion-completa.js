// Script para probar inserción de familia con datos completos
import { Familias, Municipios, sequelize } from './src/models/index.js';

async function probarInsercionCompleta() {
  try {
    console.log('🧪 Probando inserción de familia con datos completos...\n');
    
    // 1. Verificar que existan municipios
    console.log('📊 1. Verificando municipios disponibles...');
    const municipios = await Municipios.findAll({ limit: 3 });
    console.log('Municipios encontrados:', municipios.map(m => ({ id: m.id_municipio, codigo: m.codigo, nombre: m.nombre })));
    
    if (municipios.length === 0) {
      console.log('❌ No hay municipios disponibles');
      return;
    }
    
    // 2. Intentar crear familia con todos los campos obligatorios
    console.log('\n🧪 2. Creando familia de prueba...');
    
    const datosCompletos = {
      apellido_familiar: 'FAMILIA_TEST',
      sector: 'SECTOR_TEST', // Campo obligatorio que faltaba
      direccion_familia: 'DIRECCION_TEST',
      tamaño_familia: 1,
      tipo_vivienda: 'Casa', // Campo obligatorio que faltaba
      estado_encuesta: 'pending',
      numero_encuestas: 0,
      fecha_ultima_encuesta: new Date(),
      id_municipio: municipios[0].id_municipio
    };
    
    console.log('Datos a insertar:', datosCompletos);
    
    const familiaTest = await Familias.create(datosCompletos);
    console.log(`✅ Familia creada exitosamente con ID: ${familiaTest.id_familia}`);
    
    // 3. Verificar que se insertó correctamente
    const familiaEncontrada = await Familias.findByPk(familiaTest.id_familia);
    console.log('Familia encontrada:', {
      id: familiaEncontrada.id_familia,
      apellido: familiaEncontrada.apellido_familiar,
      sector: familiaEncontrada.sector,
      tipo_vivienda: familiaEncontrada.tipo_vivienda
    });
    
    // 4. Limpiar - eliminar familia de prueba
    await familiaTest.destroy();
    console.log('✅ Familia de prueba eliminada');
    
    console.log('\n🎯 RESULTADO: La inserción funciona correctamente cuando se proporcionan todos los campos obligatorios');
    console.log('📋 CAMPOS OBLIGATORIOS IDENTIFICADOS:');
    console.log('   - apellido_familiar ✅');
    console.log('   - sector ❌ (faltaba en encuesta)');
    console.log('   - direccion_familia ✅');
    console.log('   - tamaño_familia ❌ (faltaba en encuesta)');
    console.log('   - tipo_vivienda ❌ (faltaba en encuesta)');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

probarInsercionCompleta();
