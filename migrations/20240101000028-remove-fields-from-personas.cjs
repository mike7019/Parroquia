'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Eliminar los campos que ya no se necesitan de la tabla personas
    
    // Verificar que existe el campo sexo antes de eliminarlo
    const tableDescription = await queryInterface.describeTable('personas');
    
    if (tableDescription.sexo) {
      await queryInterface.removeColumn('personas', 'sexo');
    }
    
    if (tableDescription.camisa) {
      await queryInterface.removeColumn('personas', 'camisa');
    }
    
    if (tableDescription.blusa) {
      await queryInterface.removeColumn('personas', 'blusa');
    }
    
    if (tableDescription.pantalon) {
      await queryInterface.removeColumn('personas', 'pantalon');
    }
  },

  async down(queryInterface, Sequelize) {
    // Restaurar los campos eliminados
    
    await queryInterface.addColumn('personas', 'sexo', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null
    });
    
    await queryInterface.addColumn('personas', 'camisa', {
      type: Sequelize.STRING(10),
      allowNull: true
    });
    
    await queryInterface.addColumn('personas', 'blusa', {
      type: Sequelize.STRING(10),
      allowNull: true
    });
    
    await queryInterface.addColumn('personas', 'pantalon', {
      type: Sequelize.STRING(10),
      allowNull: true
    });

    // Intentar restaurar los datos del campo sexo basándose en la relación con sexos
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
