'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar restricciones de clave foránea que faltaban en la tabla personas
    await queryInterface.addConstraint('personas', {
      fields: ['id_tipo_identificacion_tipo_identificacion'],
      type: 'foreign key',
      name: 'fk_personas_tipo_identificacion',
      references: {
        table: 'tipos_identificacion',
        field: 'id_tipo_identificacion'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addConstraint('personas', {
      fields: ['id_estado_civil_estado_civil'],
      type: 'foreign key',
      name: 'fk_personas_estado_civil',
      references: {
        table: 'estados_civiles',
        field: 'id_estado_civil'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Agregar índices para mejorar el rendimiento
    await queryInterface.addIndex('personas', ['id_tipo_identificacion_tipo_identificacion']);
    await queryInterface.addIndex('personas', ['id_estado_civil_estado_civil']);
  },

  async down(queryInterface, Sequelize) {
    // Remover las restricciones
    await queryInterface.removeConstraint('personas', 'fk_personas_tipo_identificacion');
    await queryInterface.removeConstraint('personas', 'fk_personas_estado_civil');
    
    // Remover los índices
    await queryInterface.removeIndex('personas', ['id_tipo_identificacion_tipo_identificacion']);
    await queryInterface.removeIndex('personas', ['id_estado_civil_estado_civil']);
  }
};
