#!/usr/bin/env node

/**
 * Script de validación para las nuevas estructuras de base de datos
 * Este script valida que todas las nuevas tablas y relaciones funcionen correctamente
 */

const path = require('path');
const { Sequelize } = require('sequelize');

// Importar configuración de base de datos
const configPath = path.join(__dirname, 'config', 'database.js');
const config = require(configPath);

// Crear instancia de Sequelize
const sequelize = new Sequelize(config.development);

async function validateDatabaseStructure() {
  try {
    console.log('🔧 Iniciando validación de la estructura de base de datos...');
    
    // Probar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // Validar que todas las nuevas tablas existen
    const tables = [
      'encuestas',
      'enfermedades', 
      'profesiones',
      'persona_enfermedad',
      'familia_tipo_vivienda',
      'familia_disposicion_basura',
      'familia_sistema_acueducto',
      'familia_tipo_aguas_residuales'
    ];

    console.log('🔍 Validando existencia de nuevas tablas...');
    for (const table of tables) {
      const [results] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = '${table}'
      `);
      
      if (results.length > 0) {
        console.log(`✅ Tabla '${table}' existe`);
      } else {
        console.log(`❌ Tabla '${table}' NO existe`);
      }
    }

    // Validar que la tabla familias fue modificada correctamente
    console.log('🔍 Validando modificaciones en tabla familias...');
    
    // Verificar que se renombró nombre_familia a apellido_familiar
    const familiaColumns = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'familias' AND table_schema = 'public'
    `);
    
    const columnNames = familiaColumns[0].map(col => col.column_name);
    
    if (columnNames.includes('apellido_familiar')) {
      console.log('✅ Campo apellido_familiar existe en familias');
    } else {
      console.log('❌ Campo apellido_familiar NO existe en familias');
    }
    
    if (columnNames.includes('telefono')) {
      console.log('✅ Campo telefono existe en familias');
    } else {
      console.log('❌ Campo telefono NO existe en familias');
    }
    
    if (!columnNames.includes('tratamiento_datos')) {
      console.log('✅ Campo tratamiento_datos fue eliminado de familias');
    } else {
      console.log('❌ Campo tratamiento_datos NO fue eliminado de familias');
    }
    
    if (!columnNames.includes('observaciones')) {
      console.log('✅ Campo observaciones fue eliminado de familias');
    } else {
      console.log('❌ Campo observaciones NO fue eliminado de familias');
    }

    // Validar nuevos campos en tabla personas
    console.log('🔍 Validando nuevos campos en tabla personas...');
    
    const personaColumns = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'personas' AND table_schema = 'public'
    `);
    
    const personaColumnNames = personaColumns[0].map(col => col.column_name);
    const newPersonaFields = [
      'camisa', 'blusa', 'pantalon', 'calzado', 
      'estudios', 'en_que_eres_lider', 'habilidad_destreza', 
      'necesidad_enfermo', 'id_profesion'
    ];
    
    for (const field of newPersonaFields) {
      if (personaColumnNames.includes(field)) {
        console.log(`✅ Campo '${field}' existe en personas`);
      } else {
        console.log(`❌ Campo '${field}' NO existe en personas`);
      }
    }

    // Validar relaciones de clave foránea
    console.log('🔍 Validando claves foráneas...');
    
    const foreignKeys = await sequelize.query(`
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public'
      ORDER BY tc.table_name, kcu.column_name;
    `);
    
    console.log(`📊 Se encontraron ${foreignKeys[0].length} claves foráneas en el esquema`);

    console.log('🎉 Validación completada');
    
  } catch (error) {
    console.error('❌ Error durante la validación:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar validación si es llamado directamente
if (require.main === module) {
  validateDatabaseStructure()
    .then(() => {
      console.log('✅ Validación finalizada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en la validación:', error);
      process.exit(1);
    });
}

module.exports = { validateDatabaseStructure };
