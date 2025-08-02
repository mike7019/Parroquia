'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Añadir columna id_municipio a la tabla familias
    await queryInterface.addColumn('familias', 'id_municipio', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'municipios',
        key: 'id_municipio',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Añadir columna id_sector a la tabla familias
    await queryInterface.addColumn('familias', 'id_sector', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'sector',
        key: 'id_sector',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Crear índices para mejor rendimiento
    await queryInterface.addIndex('familias', ['id_municipio'], {
      name: 'idx_familias_municipio',
    });

    await queryInterface.addIndex('familias', ['id_sector'], {
      name: 'idx_familias_sector',
    });

    // Actualizar familias existentes con municipio y sector basado en su vereda
    await queryInterface.sequelize.query(`
      UPDATE familias 
      SET id_municipio = v.id_municipio_municipios,
          id_sector = v.id_sector_sector
      FROM veredas v 
      WHERE familias.id_vereda_veredas = v.id_vereda;
    `);

    console.log('✅ Relaciones familia-municipio-sector añadidas exitosamente');
  },

  async down(queryInterface, Sequelize) {
    // Eliminar índices
    await queryInterface.removeIndex('familias', 'idx_familias_municipio');
    await queryInterface.removeIndex('familias', 'idx_familias_sector');
    
    // Eliminar columnas
    await queryInterface.removeColumn('familias', 'id_municipio');
    await queryInterface.removeColumn('familias', 'id_sector');

    console.log('❌ Relaciones familia-municipio-sector eliminadas');
  }
};
