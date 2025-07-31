'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add codigo column to tipo_identificacion table
    await queryInterface.addColumn('tipo_identificacion', 'codigo', {
      type: Sequelize.STRING(10),
      allowNull: true // Temporarily allow null while we update existing records
    });

    // Update existing records with appropriate codes
    await queryInterface.sequelize.query(`
      UPDATE tipo_identificacion SET codigo = 'RC' WHERE descripcion = 'Registro civil';
      UPDATE tipo_identificacion SET codigo = 'TI' WHERE descripcion = 'Tarjeta de identidad';
      UPDATE tipo_identificacion SET codigo = 'CC' WHERE descripcion = 'Cedula';
      UPDATE tipo_identificacion SET codigo = 'PP' WHERE descripcion = 'Pasaporte';
      UPDATE tipo_identificacion SET codigo = 'NIT' WHERE descripcion = 'NIT';
    `);

    // Delete the 'Contraseña' entry as it's not a valid identification type
    await queryInterface.sequelize.query(`
      DELETE FROM tipo_identificacion WHERE descripcion = 'Contraseña';
    `);

    // Insert new identification types (avoid duplicates)
    await queryInterface.sequelize.query(`
      INSERT INTO tipo_identificacion (descripcion, codigo) 
      SELECT 'Cédula de Extranjería', 'CE'
      WHERE NOT EXISTS (SELECT 1 FROM tipo_identificacion WHERE codigo = 'CE');
      
      INSERT INTO tipo_identificacion (descripcion, codigo) 
      SELECT 'Permiso Especial de Permanencia', 'PEP'
      WHERE NOT EXISTS (SELECT 1 FROM tipo_identificacion WHERE codigo = 'PEP');
      
      INSERT INTO tipo_identificacion (descripcion, codigo) 
      SELECT 'Documento de Identificación Extranjero', 'DIE'
      WHERE NOT EXISTS (SELECT 1 FROM tipo_identificacion WHERE codigo = 'DIE');
      
      INSERT INTO tipo_identificacion (descripcion, codigo) 
      SELECT 'Cédula de Ciudadanía Digital', 'CCD'
      WHERE NOT EXISTS (SELECT 1 FROM tipo_identificacion WHERE codigo = 'CCD');
    `);

    // Remove duplicates by keeping the ones with proper codes
    await queryInterface.sequelize.query(`
      DELETE FROM tipo_identificacion 
      WHERE id_tipo_identificacion IN (
        SELECT id_tipo_identificacion 
        FROM (
          SELECT id_tipo_identificacion, 
                 ROW_NUMBER() OVER (PARTITION BY codigo ORDER BY id_tipo_identificacion) as rn
          FROM tipo_identificacion
          WHERE codigo IS NOT NULL
        ) t 
        WHERE t.rn > 1
      );
    `);

    // Make codigo column not null and unique
    await queryInterface.changeColumn('tipo_identificacion', 'codigo', {
      type: Sequelize.STRING(10),
      allowNull: false,
      unique: true
    });

    // Add unique constraint
    await queryInterface.addConstraint('tipo_identificacion', {
      fields: ['codigo'],
      type: 'unique',
      name: 'tipo_identificacion_codigo_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove unique constraint
    await queryInterface.removeConstraint('tipo_identificacion', 'tipo_identificacion_codigo_unique');
    
    // Remove codigo column
    await queryInterface.removeColumn('tipo_identificacion', 'codigo');
    
    // Restore original data (this is a simplified version)
    await queryInterface.sequelize.query(`
      DELETE FROM tipo_identificacion;
    `);
    
    await queryInterface.bulkInsert('tipo_identificacion', [
      { id_tipo_identificacion: 1, descripcion: 'Registro civil' },
      { id_tipo_identificacion: 2, descripcion: 'Tarjeta de identidad' },
      { id_tipo_identificacion: 3, descripcion: 'Contraseña' },
      { id_tipo_identificacion: 4, descripcion: 'Cedula' },
      { id_tipo_identificacion: 5, descripcion: 'Pasaporte' },
      { id_tipo_identificacion: 6, descripcion: 'NIT' }
    ]);
  }
};
