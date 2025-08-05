'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('familia_sistema_acueducto', {
      id_familia_sistema_acueducto: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      id_familia: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'familias',
          key: 'id_familia'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_sistema_acueducto: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'sistemas_acueducto',
          key: 'id_sistema_acueducto'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Agregar índices únicos y de rendimiento
    await queryInterface.addIndex('familia_sistema_acueducto', ['id_familia', 'id_sistema_acueducto'], { unique: true });
    await queryInterface.addIndex('familia_sistema_acueducto', ['id_familia']);
    await queryInterface.addIndex('familia_sistema_acueducto', ['id_sistema_acueducto']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('familia_sistema_acueducto');
  }
};
