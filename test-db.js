#!/usr/bin/env node

/**
 * Test script para verificar las migraciones y modelos
 */

const db = require('./models');

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a PostgreSQL...');
    
    // Probar conexión
    await db.sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL exitosa!');
    
    // Listar todas las tablas
    console.log('\n📋 Tablas disponibles:');
    const [results] = await db.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    results.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table.table_name}`);
    });
    
    // Probar algunos datos de ejemplo
    console.log('\n🧪 Probando consultas de ejemplo:');
    
    // Tipos de identificación
    const tiposId = await db.sequelize.query(
      'SELECT * FROM tipo_identificacion ORDER BY id_tipo_identificacion',
      { type: db.sequelize.QueryTypes.SELECT }
    );
    console.log(`  • Tipos de identificación: ${tiposId.length} registros`);
    tiposId.forEach(tipo => {
      console.log(`    - ${tipo.tipo_identificacion_pk}: ${tipo.descripcion}`);
    });
    
    // Estados civiles
    const estadosCiviles = await db.sequelize.query(
      'SELECT * FROM estado_civil ORDER BY id_estado_civil',
      { type: db.sequelize.QueryTypes.SELECT }
    );
    console.log(`  • Estados civiles: ${estadosCiviles.length} registros`);
    estadosCiviles.forEach(estado => {
      console.log(`    - ${estado.descripcion}`);
    });
    
    // Sexos
    const sexos = await db.sequelize.query(
      'SELECT * FROM sexo ORDER BY id_sexo',
      { type: db.sequelize.QueryTypes.SELECT }
    );
    console.log(`  • Sexos: ${sexos.length} registros`);
    sexos.forEach(sexo => {
      console.log(`    - ${sexo.sexo}`);
    });
    
    // Parroquias
    const parroquias = await db.sequelize.query(
      'SELECT * FROM parroquia ORDER BY id_parroquia',
      { type: db.sequelize.QueryTypes.SELECT }
    );
    console.log(`  • Parroquias: ${parroquias.length} registros`);
    parroquias.forEach(parroquia => {
      console.log(`    - ${parroquia.nombre}`);
    });
    
    console.log('\n✅ Todas las pruebas pasaron correctamente!');
    console.log('\n🎉 Tu base de datos PostgreSQL está lista para usar con el ORM Sequelize!');
    console.log('\n📚 Para usar los modelos en tu aplicación:');
    console.log('   const { Persona, TipoIdentificacion, EstadoCivil } = require("./models");');
    console.log('\n💡 Comandos útiles:');
    console.log('   • node migrate.js migrate       - Ejecutar migraciones');
    console.log('   • node migrate.js migrate-undo  - Deshacer última migración');
    console.log('   • node migrate.js seed          - Ejecutar seeders');
    console.log('   • node test-db.js               - Probar conexión');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n🔧 Posibles soluciones:');
    console.error('   1. Verificar que PostgreSQL esté corriendo');
    console.error('   2. Confirmar credenciales en .env');
    console.error('   3. Ejecutar: node migrate.js create-db');
    console.error('   4. Ejecutar: node migrate.js migrate');
  } finally {
    await db.sequelize.close();
  }
}

testConnection();
