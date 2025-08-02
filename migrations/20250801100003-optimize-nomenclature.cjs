'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🏷️ PASO 3: Optimizando nomenclatura de relaciones...');
    
    // 1. Optimizar tabla persona_destreza
    try {
      console.log('   - Optimizando tabla persona_destreza...');
      
      // Verificar si las columnas existen antes de renombrar
      const personaDestrezaColumns = await queryInterface.describeTable('persona_destreza');
      
      if (personaDestrezaColumns.id_personas_personas) {
        await queryInterface.renameColumn('persona_destreza', 'id_personas_personas', 'id_persona');
        console.log('   ✅ Campo id_personas_personas → id_persona');
      } else {
        console.log('   ⚠️ Campo id_personas_personas no existe en persona_destreza');
      }
      
      if (personaDestrezaColumns.id_destrezas_destrezas) {
        await queryInterface.renameColumn('persona_destreza', 'id_destrezas_destrezas', 'id_destreza');
        console.log('   ✅ Campo id_destrezas_destrezas → id_destreza');
      } else {
        console.log('   ⚠️ Campo id_destrezas_destrezas no existe en persona_destreza');
      }
      
    } catch (error) {
      console.log(`   ⚠️ Error optimizando persona_destreza: ${error.message}`);
    }

    // 2. Optimizar tabla persona_enfermedad
    try {
      console.log('   - Optimizando tabla persona_enfermedad...');
      
      const personaEnfermedadColumns = await queryInterface.describeTable('persona_enfermedad');
      
      // Solo renombrar si el campo origen existe y el destino no existe
      if (personaEnfermedadColumns.id_personas && !personaEnfermedadColumns.id_persona) {
        await queryInterface.renameColumn('persona_enfermedad', 'id_personas', 'id_persona');
        console.log('   ✅ Campo id_personas → id_persona');
      } else if (personaEnfermedadColumns.id_persona) {
        console.log('   ✅ Campo id_persona ya existe en persona_enfermedad');
      }
      
      if (personaEnfermedadColumns.id_enfermedades && !personaEnfermedadColumns.id_enfermedad) {
        await queryInterface.renameColumn('persona_enfermedad', 'id_enfermedades', 'id_enfermedad');
        console.log('   ✅ Campo id_enfermedades → id_enfermedad');
      } else if (personaEnfermedadColumns.id_enfermedad) {
        console.log('   ✅ Campo id_enfermedad ya existe en persona_enfermedad');
      }
      
    } catch (error) {
      console.log(`   ⚠️ Error optimizando persona_enfermedad: ${error.message}`);
    }

    console.log('✅ Optimización de nomenclatura completada');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Revirtiendo optimización de nomenclatura...');
    
    // Revertir cambios en persona_destreza
    try {
      const personaDestrezaColumns = await queryInterface.describeTable('persona_destreza');
      
      if (personaDestrezaColumns.id_persona) {
        await queryInterface.renameColumn('persona_destreza', 'id_persona', 'id_personas_personas');
      }
      
      if (personaDestrezaColumns.id_destreza) {
        await queryInterface.renameColumn('persona_destreza', 'id_destreza', 'id_destrezas_destrezas');
      }
    } catch (error) {
      console.log(`Error revirtiendo persona_destreza: ${error.message}`);
    }

    // Revertir cambios en persona_enfermedad
    try {
      const personaEnfermedadColumns = await queryInterface.describeTable('persona_enfermedad');
      
      if (personaEnfermedadColumns.id_persona) {
        await queryInterface.renameColumn('persona_enfermedad', 'id_persona', 'id_personas');
      }
      
      if (personaEnfermedadColumns.id_enfermedad) {
        await queryInterface.renameColumn('persona_enfermedad', 'id_enfermedad', 'id_enfermedades');
      }
    } catch (error) {
      console.log(`Error revirtiendo persona_enfermedad: ${error.message}`);
    }

    console.log('✅ Reversión completada');
  }
};
