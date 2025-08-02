'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Eliminar tablas intermedias que no se necesitan
    console.log('Eliminando tabla familia_sistema_acueducto...');
    await queryInterface.dropTable('familia_sistema_acueducto');
    
    console.log('Eliminando tabla familia_tipo_aguas_residuales...');
    await queryInterface.dropTable('familia_tipo_aguas_residuales');
    
    console.log('Eliminando tabla familia_disposicion_basura...');
    await queryInterface.dropTable('familia_disposicion_basura');
    
    console.log('✅ Tablas eliminadas exitosamente');
  },

  async down(queryInterface, Sequelize) {
    // Recrear las tablas en caso de rollback
    
    // Recrear familia_disposicion_basura
    await queryInterface.createTable('familia_disposicion_basura', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_familia: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'familias',
          key: 'id_familia',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_tipo_disposicion_basura: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'tipos_disposicion_basura',
          key: 'id_tipos_disposicion_basura',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('familia_disposicion_basura', ['id_familia', 'id_tipo_disposicion_basura'], {
      unique: true,
      name: 'unique_familia_disposicion_basura'
    });

    // Recrear familia_sistema_acueducto
    await queryInterface.createTable('familia_sistema_acueducto', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_familia: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'familias',
          key: 'id_familia',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_sistema_acueducto: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'sistemas_acueducto',
          key: 'id_sistemas_acueducto',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('familia_sistema_acueducto', ['id_familia', 'id_sistema_acueducto'], {
      unique: true,
      name: 'unique_familia_sistema_acueducto'
    });

    // Recrear familia_tipo_aguas_residuales
    await queryInterface.createTable('familia_tipo_aguas_residuales', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_familia: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'familias',
          key: 'id_familia',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_tipo_aguas_residuales: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'tipos_aguas_residuales',
          key: 'id_tipos_aguas_residuales',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('familia_tipo_aguas_residuales', ['id_familia', 'id_tipo_aguas_residuales'], {
      unique: true,
      name: 'unique_familia_tipo_aguas_residuales'
    });
  }
};
