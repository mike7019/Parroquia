'use strict';

export async function up(queryInterface, Sequelize) {
  const { DataTypes } = Sequelize;
  
  try {
    // Verificar si la columna ya existe
    const tableDescription = await queryInterface.describeTable('users');
    
    if (!tableDescription.status) {
      // Agregar columna status
      await queryInterface.addColumn('users', 'status', {
        type: DataTypes.ENUM('active', 'inactive', 'deleted'),
        allowNull: false,
        defaultValue: 'active',
        after: 'role'
      });
      
      // Actualizar todos los usuarios existentes para que tengan status 'active'
      await queryInterface.sequelize.query(
        "UPDATE users SET status = 'active' WHERE status IS NULL"
      );
    }
  } catch (error) {
    console.error('Error in migration:', error);
    throw error;
  }
}

export async function down(queryInterface, Sequelize) {
  try {
    // Eliminar enum values primero
    await queryInterface.sequelize.query(
      "ALTER TABLE users MODIFY COLUMN status VARCHAR(20)"
    );
    
    // Luego eliminar la columna
    await queryInterface.removeColumn('users', 'status');
    
    // Limpiar el tipo enum
    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS enum_users_status"
    );
  } catch (error) {
    console.error('Error in rollback:', error);
    throw error;
  }
}
