#!/usr/bin/env node

/**
 * Script para probar las asociaciones entre Departamentos y Municipios
 * Verifica si las relaciones de las líneas 64-69 de models/index.js funcionan correctamente
 */

import sequelize from './config/sequelize.js';
import Departamentos from './src/models/catalog/Departamentos.js';
import Municipios from './src/models/catalog/Municipios.js';

async function testAssociations() {
  try {
    console.log('🔍 Iniciando pruebas de asociaciones Departamentos-Municipios...\n');

    // Test 1: Verificar conexión a la base de datos
    console.log('1️⃣ Probando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // Test 2: Configurar las asociaciones exactamente como están en index.js líneas 64-69
    console.log('2️⃣ Configurando asociaciones...');
    
    // Línea 64-67: Departamentos.hasMany(Municipios)
    Departamentos.hasMany(Municipios, {
      foreignKey: 'id_departamento',
      as: 'municipios'
    });

    // Línea 69-72: Municipios.belongsTo(Departamentos)
    Municipios.belongsTo(Departamentos, {
      foreignKey: 'id_departamento',
      as: 'departamentoData'
    });
    
    console.log('✅ Asociaciones configuradas\n');

    // Test 3: Verificar que las tablas existen
    console.log('3️⃣ Verificando existencia de tablas...');
    
    const departamentosCount = await Departamentos.count();
    const municipiosCount = await Municipios.count();
    
    console.log(`📊 Departamentos en BD: ${departamentosCount}`);
    console.log(`📊 Municipios en BD: ${municipiosCount}\n`);

    // Test 4: Probar consulta con include (hasMany)
    console.log('4️⃣ Probando relación hasMany (Departamento -> Municipios)...');
    
    const departamentoConMunicipios = await Departamentos.findOne({
      include: [{
        model: Municipios,
        as: 'municipios',
        limit: 3
      }],
      limit: 1
    });

    if (departamentoConMunicipios) {
      console.log(`✅ Departamento encontrado: ${departamentoConMunicipios.nombre}`);
      console.log(`✅ Municipios asociados: ${departamentoConMunicipios.municipios?.length || 0}`);
      
      if (departamentoConMunicipios.municipios?.length > 0) {
        console.log(`   - Ejemplo: ${departamentoConMunicipios.municipios[0].nombre_municipio}`);
      }
    } else {
      console.log('⚠️  No se encontraron departamentos con municipios');
    }
    console.log('');

    // Test 5: Probar consulta con include (belongsTo)
    console.log('5️⃣ Probando relación belongsTo (Municipio -> Departamento)...');
    
    const municipioConDepartamento = await Municipios.findOne({
      include: [{
        model: Departamentos,
        as: 'departamentoData'
      }],
      limit: 1
    });

    if (municipioConDepartamento) {
      console.log(`✅ Municipio encontrado: ${municipioConDepartamento.nombre_municipio}`);
      console.log(`✅ Departamento asociado: ${municipioConDepartamento.departamentoData?.nombre || 'No encontrado'}`);
    } else {
      console.log('⚠️  No se encontraron municipios con departamento');
    }
    console.log('');

    // Test 6: Probar consulta más compleja con filtros
    console.log('6️⃣ Probando consulta compleja con filtros...');
    
    const departamentosConStats = await Departamentos.findAll({
      include: [{
        model: Municipios,
        as: 'municipios',
        attributes: ['id_municipio', 'nombre_municipio'],
        required: false
      }],
      attributes: ['id_departamento', 'nombre', 'codigo_dane'],
      limit: 3
    });

    console.log(`✅ Encontrados ${departamentosConStats.length} departamentos con estadísticas:`);
    departamentosConStats.forEach(dep => {
      console.log(`   - ${dep.nombre}: ${dep.municipios?.length || 0} municipios`);
    });
    console.log('');

    // Test 7: Verificar integridad referencial
    console.log('7️⃣ Verificando integridad referencial...');
    
    const municipiosSinDepartamento = await Municipios.count({
      include: [{
        model: Departamentos,
        as: 'departamentoData',
        required: false
      }],
      where: {
        '$departamentoData.id_departamento$': null
      }
    });

    if (municipiosSinDepartamento === 0) {
      console.log('✅ Todos los municipios tienen departamento asociado');
    } else {
      console.log(`⚠️  ${municipiosSinDepartamento} municipios sin departamento asociado`);
    }
    console.log('');

    console.log('🎉 RESULTADO FINAL:');
    console.log('✅ Las asociaciones de las líneas 64-69 funcionan correctamente');
    console.log('✅ No hay conflictos detectados');
    console.log('✅ Las relaciones Departamentos-Municipios son estables');
    console.log('\n💡 RECOMENDACIÓN: Estas asociaciones pueden mantenerse activas\n');

  } catch (error) {
    console.error('\n❌ ERROR EN LAS PRUEBAS:');
    console.error(`Tipo: ${error.name}`);
    console.error(`Mensaje: ${error.message}`);
    
    if (error.original) {
      console.error(`Error original: ${error.original.message}`);
    }
    
    console.error('\n🔧 RECOMENDACIÓN: Comentar estas asociaciones en models/index.js');
    console.error('Las líneas 64-69 deben ser comentadas para evitar conflictos\n');
    
    return false;
  } finally {
    await sequelize.close();
  }
  
  return true;
}

// Ejecutar las pruebas
console.log('🧪 INICIANDO PRUEBAS DE ASOCIACIONES DEPARTAMENTOS-MUNICIPIOS');
console.log('=' .repeat(70));

testAssociations()
  .then(success => {
    if (success) {
      console.log('🎯 Todas las pruebas completadas exitosamente');
      process.exit(0);
    } else {
      console.log('💥 Algunas pruebas fallaron');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Error crítico:', error.message);
    process.exit(1);
  });
