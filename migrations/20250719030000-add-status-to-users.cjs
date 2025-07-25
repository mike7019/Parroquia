'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    
    try {
      // Verificar si la columna ya existe en la tabla usuarios
      const tableDescription = await queryInterface.describeTable('usuarios');
      
      if (!tableDescription.status) {
        // Agregar columna status
        await queryInterface.addColumn('usuarios', 'status', {
          type: DataTypes.ENUM('active', 'inactive', 'deleted'),
          allowNull: false,
          defaultValue: 'active'
        });
        
        // Actualizar todos los usuarios existentes para que tengan status 'active'
        await queryInterface.sequelize.query(
          "UPDATE usuarios SET status = 'active' WHERE status IS NULL"
        );
      }
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Eliminar enum values primero
      await queryInterface.sequelize.query(
        "ALTER TABLE usuarios ALTER COLUMN status TYPE VARCHAR(20)"
      );
      
      // Luego eliminar la columna
      await queryInterface.removeColumn('usuarios', 'status');
      
      // Limpiar el tipo enum
      await queryInterface.sequelize.query(
        "DROP TYPE IF EXISTS enum_usuarios_status"
      );
    } catch (error) {
      console.error('Error in rollback:', error);
      throw error;
    }
  }
};
