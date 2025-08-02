'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Check if columns already exist to avoid errors
      const tableDescription = await queryInterface.describeTable('usuarios');
      
      // Add token_verificacion_email if it doesn't exist
      if (!tableDescription.token_verificacion_email) {
        await queryInterface.addColumn('usuarios', 'token_verificacion_email', {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Token para verificación de email'
        }, { transaction });
      }

      // Add email_verificado if it doesn't exist
      if (!tableDescription.email_verificado) {
        await queryInterface.addColumn('usuarios', 'email_verificado', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Indica si el email ha sido verificado'
        }, { transaction });
      }

      // Add fecha_verificacion_email if it doesn't exist
      if (!tableDescription.fecha_verificacion_email) {
        await queryInterface.addColumn('usuarios', 'fecha_verificacion_email', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Fecha cuando se verificó el email'
        }, { transaction });
      }

      // Add token_reset_password if it doesn't exist
      if (!tableDescription.token_reset_password) {
        await queryInterface.addColumn('usuarios', 'token_reset_password', {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Token para reset de contraseña'
        }, { transaction });
      }

      // Add expira_token_reset if it doesn't exist
      if (!tableDescription.expira_token_reset) {
        await queryInterface.addColumn('usuarios', 'expira_token_reset', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Fecha de expiración del token de reset'
        }, { transaction });
      }

      await transaction.commit();
      console.log('✅ Columnas de verificación de email agregadas/verificadas exitosamente');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error al agregar columnas de verificación de email:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Check if columns exist before trying to remove them
      const tableDescription = await queryInterface.describeTable('usuarios');
      
      if (tableDescription.token_verificacion_email) {
        await queryInterface.removeColumn('usuarios', 'token_verificacion_email', { transaction });
      }
      
      if (tableDescription.email_verificado) {
        await queryInterface.removeColumn('usuarios', 'email_verificado', { transaction });
      }
      
      if (tableDescription.fecha_verificacion_email) {
        await queryInterface.removeColumn('usuarios', 'fecha_verificacion_email', { transaction });
      }
      
      if (tableDescription.token_reset_password) {
        await queryInterface.removeColumn('usuarios', 'token_reset_password', { transaction });
      }
      
      if (tableDescription.expira_token_reset) {
        await queryInterface.removeColumn('usuarios', 'expira_token_reset', { transaction });
      }

      await transaction.commit();
      console.log('✅ Columnas de verificación de email removidas exitosamente');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error al remover columnas de verificación de email:', error);
      throw error;
    }
  }
};
