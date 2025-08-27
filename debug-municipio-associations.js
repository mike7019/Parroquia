#!/usr/bin/env node

/**
 * Script para diagnosticar el problema de asociaciones de Municipios
 */

import { loadAllModels } from './syncDatabaseComplete.js';
import sequelize from './config/sequelize.js';

async function diagnosticMunicipioAssociations() {
  try {
    console.log('🔍 DIAGNOSTICANDO ASOCIACIONES DE MUNICIPIOS');
    console.log('=' .repeat(60));

    // Cargar todos los modelos
    console.log('📦 Cargando todos los modelos...');
    const models = await loadAllModels();
    
    // Verificar modelo Municipio
    console.log('\n🔍 Verificando modelo Municipio...');
    const MunicipioModel = sequelize.models.Municipio || models.Municipio;
    
    if (MunicipioModel) {
      console.log('✅ Modelo Municipio encontrado');
      console.log(`📍 Nombre del modelo: ${MunicipioModel.name}`);
      console.log(`📍 Tabla: ${MunicipioModel.tableName}`);
      
      // Verificar asociaciones
      const associations = MunicipioModel.associations || {};
      console.log(`📍 Asociaciones: ${Object.keys(associations).length}`);
      
      Object.keys(associations).forEach(alias => {
        const assoc = associations[alias];
        console.log(`   - ${alias}: ${assoc.associationType} → ${assoc.target.name}`);
      });
      
      if (Object.keys(associations).length === 0) {
        console.log('❌ NO HAY ASOCIACIONES CONFIGURADAS');
        
        // Intentar configurar manualmente
        console.log('\n🔧 Intentando configurar asociaciones manualmente...');
        
        const DepartamentoModel = sequelize.models.Departamento || models.Departamento;
        if (DepartamentoModel) {
          try {
            MunicipioModel.belongsTo(DepartamentoModel, {
              foreignKey: 'id_departamento',
              as: 'departamento'
            });
            console.log('✅ Asociación Municipio → Departamento configurada');
            
            // Verificar de nuevo
            const newAssociations = MunicipioModel.associations || {};
            console.log(`📍 Asociaciones después de configurar: ${Object.keys(newAssociations).length}`);
            Object.keys(newAssociations).forEach(alias => {
              const assoc = newAssociations[alias];
              console.log(`   - ${alias}: ${assoc.associationType} → ${assoc.target.name}`);
            });
            
          } catch (error) {
            console.error('❌ Error configurando asociación:', error.message);
          }
        } else {
          console.log('❌ Modelo Departamento no encontrado');
        }
      }
      
      // Probar una consulta con include
      console.log('\n🧪 Probando consulta con include...');
      try {
        const municipio = await MunicipioModel.findOne({
          include: [
            {
              association: 'departamento',
              attributes: ['id_departamento', 'nombre']
            }
          ],
          limit: 1
        });
        
        if (municipio) {
          console.log('✅ Consulta con include exitosa');
          console.log(`📍 Municipio: ${municipio.nombre_municipio}`);
          console.log(`📍 Departamento: ${municipio.departamento?.nombre || 'N/A'}`);
        } else {
          console.log('ℹ️  No hay municipios en la base de datos');
        }
        
      } catch (error) {
        console.error('❌ Error en consulta con include:', error.message);
        
        // Intentar consulta simple
        console.log('\n🧪 Probando consulta simple...');
        try {
          const municipios = await MunicipioModel.findAll({ limit: 3 });
          console.log(`✅ Consulta simple exitosa: ${municipios.length} municipios`);
          municipios.forEach(m => {
            console.log(`   - ${m.nombre_municipio} (ID: ${m.id_municipio})`);
          });
        } catch (simpleError) {
          console.error('❌ Error en consulta simple:', simpleError.message);
        }
      }
      
    } else {
      console.log('❌ Modelo Municipio NO encontrado');
      console.log('📋 Modelos disponibles:');
      Object.keys(sequelize.models).forEach(name => {
        console.log(`   - ${name}`);
      });
    }
    
    console.log('\n🎯 DIAGNÓSTICO COMPLETO');
    return true;
    
  } catch (error) {
    console.error('\n❌ ERROR EN DIAGNÓSTICO:', error.message);
    console.error('Stack:', error.stack);
    return false;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar diagnóstico
diagnosticMunicipioAssociations()
  .then(success => {
    console.log(success ? '✅ Diagnóstico completado' : '❌ Diagnóstico falló');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Error crítico:', error.message);
    process.exit(1);
  });
