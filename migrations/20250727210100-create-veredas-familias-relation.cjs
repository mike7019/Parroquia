'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('veredas_has_many_familias', {
      id_vereda: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'veredas',
          key: 'id_vereda'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID de la vereda'
      },
      id_familia: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'familias',
          key: 'id_familia'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID de la familia'
      },
      fecha_asignacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de asignación de la familia a la vereda'
      },
      activa: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si la relación está activa'
      }
    });

    // Crear clave primaria compuesta
    await queryInterface.addConstraint('veredas_has_many_familias', {
      fields: ['id_vereda', 'id_familia'],
      type: 'primary key',
      name: 'veredas_familias_pk'
    });

    // Agregar índices
    await queryInterface.addIndex('veredas_has_many_familias', ['id_vereda'], {
      name: 'idx_veredas_familias_vereda'
    });
    await queryInterface.addIndex('veredas_has_many_familias', ['id_familia'], {
      name: 'idx_veredas_familias_familia'
    });
    await queryInterface.addIndex('veredas_has_many_familias', ['activa'], {
      name: 'idx_veredas_familias_activa'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('veredas_has_many_familias');
  }
};
