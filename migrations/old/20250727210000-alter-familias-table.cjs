'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Add new columns according to user schema
      await queryInterface.addColumn('familias', 'jefe_familia', {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Nombre del jefe de familia'
      }, { transaction });

      await queryInterface.addColumn('familias', 'numero_miembros', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Número de miembros en la familia'
      }, { transaction });

      await queryInterface.addColumn('familias', 'estado_encuesta', {
        type: Sequelize.ENUM('pendiente', 'en_proceso', 'completada', 'revisada'),
        allowNull: true,
        defaultValue: 'pendiente',
        comment: 'Estado actual de la encuesta familiar'
      }, { transaction });

      await queryInterface.addColumn('familias', 'fecha_encuesta', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de realización de la encuesta'
      }, { transaction });

      await queryInterface.addColumn('familias', 'encuestador', {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Nombre del encuestador'
      }, { transaction });

      await queryInterface.addColumn('familias', 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }, { transaction });

      await queryInterface.addColumn('familias', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remove the added columns
      await queryInterface.removeColumn('familias', 'jefe_familia', { transaction });
      await queryInterface.removeColumn('familias', 'numero_miembros', { transaction });
      await queryInterface.removeColumn('familias', 'estado_encuesta', { transaction });
      await queryInterface.removeColumn('familias', 'fecha_encuesta', { transaction });
      await queryInterface.removeColumn('familias', 'encuestador', { transaction });
      await queryInterface.removeColumn('familias', 'created_at', { transaction });
      await queryInterface.removeColumn('familias', 'updated_at', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
