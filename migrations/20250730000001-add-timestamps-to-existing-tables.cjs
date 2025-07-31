'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add timestamp columns to all existing tables created by the Docker init scripts
    const tables = [
      'tipo_identificacion',
      'estado_civil', 
      'sexo',
      'parroquia',
      'comunidades_culturales',
      'municipios',
      'sector',
      'veredas',
      'familias',
      'personas',
      'parentesco',
      'tipo_viviendas',
      'tipos_disposicion_basura',
      'sistemas_acueducto',
      'tipos_aguas_residuales',
      'parroquias',
      'difuntos_familia',
      'celebraciones_familia',
      'niveles_educativos',
      'talla_vestimenta',
      'areas_liderazgo',
      'liderazgos',
      'destrezas',
      'persona_destreza',
      'enfermedades',
      'enfermedades_persona',
      'celebraciones_personales',
      'celebraciones_padre_madre',
      'necesidades_enfermo',
      'usuarios',
      'roles',
      'usuarios_roles'
    ];

    for (const tableName of tables) {
      // Check if the table exists
      const tableExists = await queryInterface.describeTable(tableName).catch(() => null);
      
      if (tableExists) {
        // Add timestamp columns if they don't exist
        if (!tableExists.createdAt) {
          await queryInterface.addColumn(tableName, 'createdAt', {
            type: Sequelize.DATE,
            allowNull: true, // Initially allow null
          });
          
          // Update existing rows with current timestamp
          await queryInterface.sequelize.query(
            `UPDATE "${tableName}" SET "createdAt" = CURRENT_TIMESTAMP WHERE "createdAt" IS NULL`
          );
          
          // Now make it NOT NULL
          await queryInterface.changeColumn(tableName, 'createdAt', {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
          });
        }
        
        if (!tableExists.updatedAt) {
          await queryInterface.addColumn(tableName, 'updatedAt', {
            type: Sequelize.DATE,
            allowNull: true, // Initially allow null
          });
          
          // Update existing rows with current timestamp
          await queryInterface.sequelize.query(
            `UPDATE "${tableName}" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL`
          );
          
          // Now make it NOT NULL
          await queryInterface.changeColumn(tableName, 'updatedAt', {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
          });
        }
      }
    }

    console.log('✅ Timestamp columns added to existing tables');
  },

  async down(queryInterface, Sequelize) {
    // Remove timestamp columns from all tables
    const tables = [
      'tipo_identificacion',
      'estado_civil', 
      'sexo',
      'parroquia',
      'comunidades_culturales',
      'municipios',
      'sector',
      'veredas',
      'familias',
      'personas',
      'parentesco',
      'tipo_viviendas',
      'tipos_disposicion_basura',
      'sistemas_acueducto',
      'tipos_aguas_residuales',
      'parroquias',
      'difuntos_familia',
      'celebraciones_familia',
      'niveles_educativos',
      'talla_vestimenta',
      'areas_liderazgo',
      'liderazgos',
      'destrezas',
      'persona_destreza',
      'enfermedades',
      'enfermedades_persona',
      'celebraciones_personales',
      'celebraciones_padre_madre',
      'necesidades_enfermo',
      'usuarios',
      'roles',
      'usuarios_roles'
    ];

    for (const tableName of tables) {
      const tableExists = await queryInterface.describeTable(tableName).catch(() => null);
      
      if (tableExists) {
        if (tableExists.createdAt) {
          await queryInterface.removeColumn(tableName, 'createdAt');
        }
        
        if (tableExists.updatedAt) {
          await queryInterface.removeColumn(tableName, 'updatedAt');
        }
      }
    }
  }
};
