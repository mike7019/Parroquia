const { connectToDatabase, sequelize } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function syncDataTables() {
  try {
    console.log('🔄 Iniciando sincronización de datos de tablas...\n');
    
    // Conectar a la base de datos
    await connectToDatabase();
    console.log('✅ Conexión a base de datos establecida\n');
    
    // Verificar estado de las tablas principales
    console.log('📊 Verificando datos en tablas principales:\n');
    
    const tablesToCheck = [
      'departamentos',
      'municipios', 
      'sectores',
      'veredas',
      'sexos',
      'tipos_identificacion',
      'estados_civiles',
      'tipos_vivienda',
      'sistemas_acueducto',
      'tipos_aguas_residuales',
      'tipos_disposicion_basura',
      'roles',
      'enfermedades',
      'profesiones',
      'parentescos',
      'situaciones_civiles',
      'niveles_educativos'
    ];
    
    for (const table of tablesToCheck) {
      try {
        const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = parseInt(results[0].count);
        
        if (count === 0) {
          console.log(`⚠️  ${table}: VACÍA (${count} registros)`);
        } else if (count < 5) {
          console.log(`🔸 ${table}: POCOS DATOS (${count} registros)`);
        } else {
          console.log(`✅ ${table}: OK (${count} registros)`);
        }
      } catch (error) {
        console.log(`❌ ${table}: ERROR - ${error.message}`);
      }
    }
    
    console.log('\n🌱 Ejecutando seeders para poblar datos faltantes...\n');
    
    // Ejecutar seeders básicos
    await runBasicSeeders();
    
    console.log('\n📋 Verificación final del estado de datos:\n');
    
    // Verificar nuevamente después de seeders
    for (const table of tablesToCheck.slice(0, 10)) { // Solo las primeras 10 para no saturar
      try {
        const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = parseInt(results[0].count);
        console.log(`  📊 ${table}: ${count} registros`);
      } catch (error) {
        console.log(`  ❌ ${table}: ERROR - ${error.message}`);
      }
    }
    
    console.log('\n✅ Sincronización de datos completada');
    
  } catch (error) {
    console.error('❌ Error en sincronización de datos:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

async function runBasicSeeders() {
  console.log('🌱 Ejecutando seeders básicos...');
  
  // Seeder de Sexos
  try {
    const [sexosCount] = await sequelize.query('SELECT COUNT(*) as count FROM sexos');
    if (parseInt(sexosCount[0].count) === 0) {
      await sequelize.query(`
        INSERT INTO sexos (nombre, codigo, descripcion, created_at, updated_at) VALUES
        ('Masculino', 'M', 'Persona de sexo masculino', NOW(), NOW()),
        ('Femenino', 'F', 'Persona de sexo femenino', NOW(), NOW()),
        ('Otro', 'O', 'Otra identificación de género', NOW(), NOW())
      `);
      console.log('  ✅ Sexos: datos insertados');
    } else {
      console.log('  ℹ️  Sexos: datos ya existen');
    }
  } catch (error) {
    console.log('  ❌ Sexos: Error -', error.message);
  }
  
  // Seeder de Tipos de Identificación
  try {
    const [tiposCount] = await sequelize.query('SELECT COUNT(*) as count FROM tipos_identificacion');
    if (parseInt(tiposCount[0].count) === 0) {
      await sequelize.query(`
        INSERT INTO tipos_identificacion (nombre, codigo, descripcion, activo, created_at, updated_at) VALUES
        ('Cédula de Ciudadanía', 'CC', 'Documento de identificación para ciudadanos colombianos', true, NOW(), NOW()),
        ('Tarjeta de Identidad', 'TI', 'Documento de identificación para menores de edad', true, NOW(), NOW()),
        ('Cédula de Extranjería', 'CE', 'Documento de identificación para extranjeros', true, NOW(), NOW()),
        ('Pasaporte', 'PA', 'Documento de identificación internacional', true, NOW(), NOW()),
        ('Registro Civil', 'RC', 'Documento de identificación para recién nacidos', true, NOW(), NOW())
      `);
      console.log('  ✅ Tipos de Identificación: datos insertados');
    } else {
      console.log('  ℹ️  Tipos de Identificación: datos ya existen');
    }
  } catch (error) {
    console.log('  ❌ Tipos de Identificación: Error -', error.message);
  }
  
  // Seeder de Estados Civiles
  try {
    const [estadosCount] = await sequelize.query('SELECT COUNT(*) as count FROM estados_civiles');
    if (parseInt(estadosCount[0].count) === 0) {
      await sequelize.query(`
        INSERT INTO estados_civiles (nombre, descripcion, activo, created_at, updated_at) VALUES
        ('Soltero/a', 'Persona sin vínculo matrimonial', true, NOW(), NOW()),
        ('Casado/a', 'Persona con vínculo matrimonial civil o religioso', true, NOW(), NOW()),
        ('Unión Libre', 'Persona en convivencia sin vínculo matrimonial formal', true, NOW(), NOW()),
        ('Divorciado/a', 'Persona que ha disuelto su vínculo matrimonial', true, NOW(), NOW()),
        ('Viudo/a', 'Persona cuyo cónyuge ha fallecido', true, NOW(), NOW()),
        ('Separado/a', 'Persona separada de facto pero sin divorcio', true, NOW(), NOW())
      `);
      console.log('  ✅ Estados Civiles: datos insertados');
    } else {
      console.log('  ℹ️  Estados Civiles: datos ya existen');
    }
  } catch (error) {
    console.log('  ❌ Estados Civiles: Error -', error.message);
  }
  
  // Seeder de Roles
  try {
    const [rolesCount] = await sequelize.query('SELECT COUNT(*) as count FROM roles');
    if (parseInt(rolesCount[0].count) === 0) {
      await sequelize.query(`
        INSERT INTO roles (nombre, descripcion, activo, created_at, updated_at) VALUES
        ('admin', 'Administrador del sistema con acceso completo', true, NOW(), NOW()),
        ('encuestador', 'Usuario encargado de realizar encuestas', true, NOW(), NOW()),
        ('consultor', 'Usuario con acceso de solo lectura para consultas', true, NOW(), NOW()),
        ('moderador', 'Usuario con permisos de moderación limitados', true, NOW(), NOW())
      `);
      console.log('  ✅ Roles: datos insertados');
    } else {
      console.log('  ℹ️  Roles: datos ya existen');
    }
  } catch (error) {
    console.log('  ❌ Roles: Error -', error.message);
  }
  
  console.log('🌱 Seeders básicos completados');
}

// Ejecutar
syncDataTables();
