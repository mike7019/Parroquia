'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Esta migración remueve el campo sexo original de tipo string
    // Ejecutar solo después de verificar que todos los datos han sido migrados correctamente
    
    // Verificar si el campo sexo existe
    const tableDescription = await queryInterface.describeTable('personas');
    
    if (tableDescription.sexo) {
      // Verificar que todos los registros tienen id_sexo asignado
      const [results] = await queryInterface.sequelize.query(
        "SELECT COUNT(*) as count FROM personas WHERE id_sexo IS NULL"
      );
      
      if (results[0].count > 0) {
        throw new Error(`Existen ${results[0].count} registros sin id_sexo asignado. No se puede remover el campo sexo.`);
      }

      // Remover el campo sexo original
      await queryInterface.removeColumn('personas', 'sexo');
    }
  },

  async down(queryInterface, Sequelize) {
    // Restaurar el campo sexo original
    await queryInterface.addColumn('personas', 'sexo', {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: 'No especificado'
    });

    // Restaurar los datos del campo sexo basándose en la relación con la tabla sexos
    await queryInterface.sequelize.query(`
      UPDATE personas p
      SET sexo = (
        SELECT s.nombre 
        FROM sexos s 
        WHERE s.id_sexo = p.id_sexo
      )
      WHERE p.id_sexo IS NOT NULL
    `);
  }
};
