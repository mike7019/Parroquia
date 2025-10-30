'use strict';

/**
 * Migración para transferir datos existentes a las nuevas tablas intermedias
 * - Migra celebraciones de personas a persona_celebracion
 * - Migra enfermedades de personas a persona_enfermedad
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('📋 Iniciando migración de datos existentes...');

    // 1. Migrar celebraciones existentes
    console.log('1️⃣  Migrando celebraciones...');
    await queryInterface.sequelize.query(`
      INSERT INTO persona_celebracion (id_persona, motivo, dia, mes, created_at, updated_at)
      SELECT 
        id_personas,
        motivo_celebrar,
        dia_celebrar,
        mes_celebrar,
        NOW(),
        NOW()
      FROM personas
      WHERE motivo_celebrar IS NOT NULL 
        AND motivo_celebrar != ''
        AND dia_celebrar IS NOT NULL
        AND mes_celebrar IS NOT NULL
      ON CONFLICT (id_persona, motivo, dia, mes) DO NOTHING
    `);

    const [celebracionesMigradas] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM persona_celebracion`
    );
    console.log(`   ✅ ${celebracionesMigradas[0].count} celebraciones migradas`);

    // 2. Migrar enfermedades existentes
    console.log('2️⃣  Migrando enfermedades...');
    
    // Primero, intentar mapear enfermedades del campo necesidad_enfermo
    // Este campo puede contener el nombre de la enfermedad o una mezcla de enfermedad + necesidades
    const [personas] = await queryInterface.sequelize.query(`
      SELECT id_personas, necesidad_enfermo 
      FROM personas 
      WHERE necesidad_enfermo IS NOT NULL 
        AND necesidad_enfermo != ''
        AND necesidad_enfermo != 'null'
    `);

    let enfermedadesMigradas = 0;
    for (const persona of personas) {
      const necesidad = persona.necesidad_enfermo.toLowerCase().trim();
      
      // Mapeo de texto a ID de enfermedad
      const mapeoEnfermedades = {
        'diabetes': 1,
        'hipertensión': 2,
        'hipertension': 2,
        'artritis': 3,
        'obesidad': 4,
        'asma': 5,
        'cardiopatía': 6,
        'cardiopatia': 6,
        'enfermedad renal': 7,
        'renal': 7,
        'depresión': 8,
        'depresion': 8,
        'ansiedad': 9,
        'discapacidad física': 10,
        'discapacidad fisica': 10,
        'discapacidad cognitiva': 11,
        'cáncer': 12,
        'cancer': 12,
        'epilepsia': 13
      };

      let idEnfermedadEncontrada = null;
      for (const [texto, idEnfermedad] of Object.entries(mapeoEnfermedades)) {
        if (necesidad.includes(texto)) {
          idEnfermedadEncontrada = idEnfermedad;
          break;
        }
      }

      // Si no se encontró mapeo específico, usar "Otra" (id: 14)
      if (!idEnfermedadEncontrada && necesidad.length > 0) {
        idEnfermedadEncontrada = 14; // Otra
      }

      if (idEnfermedadEncontrada) {
        try {
          await queryInterface.sequelize.query(`
            INSERT INTO persona_enfermedad (id_persona, id_enfermedad, notas, created_at, updated_at)
            VALUES (:id_persona, :id_enfermedad, :notas, NOW(), NOW())
            ON CONFLICT (id_persona, id_enfermedad) DO NOTHING
          `, {
            replacements: {
              id_persona: persona.id_personas,
              id_enfermedad: idEnfermedadEncontrada,
              notas: persona.necesidad_enfermo
            }
          });
          enfermedadesMigradas++;
        } catch (error) {
          console.log(`   ⚠️  Error migrando enfermedad para persona ${persona.id_personas}: ${error.message}`);
        }
      }
    }

    console.log(`   ✅ ${enfermedadesMigradas} enfermedades migradas`);

    console.log('✅ Migración de datos completada');
    console.log('');
    console.log('📊 Resumen:');
    console.log(`   - Celebraciones: ${celebracionesMigradas[0].count}`);
    console.log(`   - Enfermedades: ${enfermedadesMigradas}`);
    console.log('');
    console.log('⚠️  IMPORTANTE:');
    console.log('   - Los campos motivo_celebrar, dia_celebrar, mes_celebrar en tabla personas NO se eliminan automáticamente');
    console.log('   - El campo necesidad_enfermo en tabla personas NO se elimina automáticamente');
    console.log('   - Estos campos se mantienen por seguridad hasta validar la migración');
    console.log('   - Para eliminarlos, ejecutar la migración 20251029000004-remove-old-fields.cjs');
  },

  async down(queryInterface, Sequelize) {
    console.log('⏮️  Revirtiendo migración de datos...');
    
    // Vaciar las tablas intermedias (los datos originales siguen en personas)
    await queryInterface.sequelize.query('DELETE FROM persona_enfermedad');
    await queryInterface.sequelize.query('DELETE FROM persona_celebracion');
    
    console.log('✅ Datos eliminados de tablas intermedias');
    console.log('   Los datos originales en tabla personas no fueron afectados');
  }
};
