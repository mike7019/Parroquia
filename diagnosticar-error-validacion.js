/**
 * Script para diagnosticar el error "Errores de validación" 
 * después de limpiar la tabla de situaciones civiles
 */

import './src/models/index.js';
import SituacionCivilService from './src/services/situacionCivilService.js';
import sequelize from './config/sequelize.js';

async function diagnosticarErrorValidacion() {
  console.log('🔍 DIAGNOSTICANDO ERROR "Errores de validación"');
  
  try {
    // Test 1: Verificar estado de la tabla
    console.log('\n1️⃣ Verificando estado actual de la tabla...');
    const SituacionCivil = sequelize.models.SituacionCivil;
    
    if (!SituacionCivil) {
      console.log('❌ Modelo SituacionCivil no encontrado');
      return;
    }
    
    const count = await SituacionCivil.count({ paranoid: false });
    console.log(`   Total de registros en tabla: ${count}`);
    
    // Test 2: Intentar crear con datos muy básicos
    console.log('\n2️⃣ Probando datos básicos válidos...');
    const datosBasicos = {
      nombre: 'Soltero'
    };
    
    try {
      const resultado = await SituacionCivilService.createSituacionCivil(datosBasicos);
      console.log('✅ Datos básicos funcionan:', resultado);
      
      // Limpiar
      await SituacionCivilService.deleteSituacionCivil(resultado.id);
      
    } catch (error) {
      console.log('❌ Error con datos básicos:');
      console.log('   - Tipo:', error.constructor.name);
      console.log('   - Mensaje:', error.message);
      console.log('   - StatusCode:', error.statusCode);
      
      if (error.errors) {
        console.log('   - Errores detallados:');
        error.errors.forEach((err, i) => {
          console.log(`     ${i + 1}. Campo: ${err.field || err.path || 'desconocido'}`);
          console.log(`        Mensaje: ${err.message}`);
          console.log(`        Tipo: ${err.type || 'custom'}`);
        });
      }
      
      if (error.details) {
        console.log('   - Detalles adicionales:');
        error.details.forEach((detail, i) => {
          console.log(`     ${i + 1}. ${detail.field}: ${detail.message}`);
        });
      }
    }
    
    // Test 3: Probando con datos completos
    console.log('\n3️⃣ Probando datos completos...');
    const datosCompletos = {
      nombre: 'Casado',
      descripcion: 'Estado civil casado',
      codigo: 'CAS',
      orden: 1,
      activo: true
    };
    
    try {
      const resultado = await SituacionCivilService.createSituacionCivil(datosCompletos);
      console.log('✅ Datos completos funcionan:', resultado);
      
      // Limpiar
      await SituacionCivilService.deleteSituacionCivil(resultado.id);
      
    } catch (error) {
      console.log('❌ Error con datos completos:');
      console.log('   - Tipo:', error.constructor.name);
      console.log('   - Mensaje:', error.message);
      
      if (error.errors) {
        console.log('   - Errores detallados:');
        error.errors.forEach((err, i) => {
          console.log(`     ${i + 1}. Campo: ${err.field || err.path}`);
          console.log(`        Mensaje: ${err.message}`);
        });
      }
    }
    
    // Test 4: Verificar validaciones del modelo directamente
    console.log('\n4️⃣ Probando creación directa en el modelo...');
    
    try {
      const registroDirecto = await SituacionCivil.create({
        nombre: 'Viudo',
        descripcion: 'Estado civil viudo'
      });
      
      console.log('✅ Creación directa exitosa:', {
        id: registroDirecto.id_situacion_civil,
        nombre: registroDirecto.nombre
      });
      
      // Limpiar
      await registroDirecto.destroy({ force: true });
      
    } catch (error) {
      console.log('❌ Error en creación directa:');
      console.log('   - Nombre:', error.name);
      console.log('   - Mensaje:', error.message);
      
      if (error.errors) {
        console.log('   - Errores de Sequelize:');
        error.errors.forEach((err, i) => {
          console.log(`     ${i + 1}. ${err.path}: ${err.message} (${err.type})`);
          console.log(`        Valor: ${err.value}`);
        });
      }
    }

  } catch (error) {
    console.error('💥 Error general:', error);
  }

  process.exit(0);
}

diagnosticarErrorValidacion();