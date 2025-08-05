'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si la columna id_sexo ya existe
    const tableDescription = await queryInterface.describeTable('personas');
    
    if (!tableDescription.id_sexo) {
      // Agregar la columna id_sexo a la tabla personas
      await queryInterface.addColumn('personas', 'id_sexo', {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'sexos',
          key: 'id_sexo'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });

      // Agregar índice para mejorar el rendimiento
      await queryInterface.addIndex('personas', ['id_sexo'], {
        name: 'idx_personas_id_sexo'
      });
    }

    // Migrar los datos existentes del campo sexo al nuevo campo id_sexo (si existe el campo sexo)
    if (tableDescription.sexo) {
      // Obtener los IDs de los sexos
      const [masculinoResult] = await queryInterface.sequelize.query(
        "SELECT id_sexo FROM sexos WHERE codigo = 'M'"
      );
      const [femeninoResult] = await queryInterface.sequelize.query(
        "SELECT id_sexo FROM sexos WHERE codigo = 'F'"
      );
      const [otroResult] = await queryInterface.sequelize.query(
        "SELECT id_sexo FROM sexos WHERE codigo = 'O'"
      );

      const masculinoId = masculinoResult[0]?.id_sexo;
      const femeninoId = femeninoResult[0]?.id_sexo;
      const otroId = otroResult[0]?.id_sexo;

      if (masculinoId && femeninoId && otroId) {
        // Actualizar registros existentes basándose en el campo sexo actual
        await queryInterface.sequelize.query(`
          UPDATE personas 
          SET id_sexo = CASE 
            WHEN LOWER(sexo) IN ('masculino', 'hombre', 'm', 'male') THEN ${masculinoId}
            WHEN LOWER(sexo) IN ('femenino', 'mujer', 'f', 'female') THEN ${femeninoId}
            ELSE ${otroId}
          END
          WHERE id_sexo IS NULL
        `);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Remover el índice
    await queryInterface.removeIndex('personas', 'idx_personas_id_sexo');
    
    // Remover la columna id_sexo
    await queryInterface.removeColumn('personas', 'id_sexo');
  }
};
