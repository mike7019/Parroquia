'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('usuarios', 'token_verificacion_email', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Token para verificación de email'
    });

    await queryInterface.addColumn('usuarios', 'email_verificado', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica si el email ha sido verificado'
    });

    await queryInterface.addColumn('usuarios', 'fecha_verificacion_email', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Fecha cuando se verificó el email'
    });

    await queryInterface.addColumn('usuarios', 'token_reset_password', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Token para reset de contraseña'
    });

    await queryInterface.addColumn('usuarios', 'expira_token_reset', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Fecha de expiración del token de reset'
    });

    console.log('✅ Campos de verificación de email agregados exitosamente');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('usuarios', 'token_verificacion_email');
    await queryInterface.removeColumn('usuarios', 'email_verificado');
    await queryInterface.removeColumn('usuarios', 'fecha_verificacion_email');
    await queryInterface.removeColumn('usuarios', 'token_reset_password');
    await queryInterface.removeColumn('usuarios', 'expira_token_reset');
    
    console.log('✅ Campos de verificación de email removidos exitosamente');
  }
};
