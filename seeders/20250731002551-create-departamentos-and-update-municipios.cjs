'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Verificar si ya existen departamentos
    const departamentosCount = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM departamentos',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (departamentosCount[0].count === 0) {
      // Insertar departamentos de Colombia
      await queryInterface.bulkInsert('departamentos', [
        { id_departamento: 1, nombre: 'Amazonas', codigo_dane: '91', region: 'Amazonía' },
        { id_departamento: 2, nombre: 'Antioquia', codigo_dane: '05', region: 'Andina' },
        { id_departamento: 3, nombre: 'Arauca', codigo_dane: '81', region: 'Orinoquía' },
        { id_departamento: 4, nombre: 'Atlántico', codigo_dane: '08', region: 'Caribe' },
        { id_departamento: 5, nombre: 'Bogotá D.C.', codigo_dane: '11', region: 'Andina' },
        { id_departamento: 6, nombre: 'Bolívar', codigo_dane: '13', region: 'Caribe' },
        { id_departamento: 7, nombre: 'Boyacá', codigo_dane: '15', region: 'Andina' },
        { id_departamento: 8, nombre: 'Caldas', codigo_dane: '17', region: 'Andina' },
        { id_departamento: 9, nombre: 'Caquetá', codigo_dane: '18', region: 'Amazonía' },
        { id_departamento: 10, nombre: 'Casanare', codigo_dane: '85', region: 'Orinoquía' },
        { id_departamento: 11, nombre: 'Cauca', codigo_dane: '19', region: 'Pacífica' },
        { id_departamento: 12, nombre: 'Cesar', codigo_dane: '20', region: 'Caribe' },
        { id_departamento: 13, nombre: 'Chocó', codigo_dane: '27', region: 'Pacífica' },
        { id_departamento: 14, nombre: 'Córdoba', codigo_dane: '23', region: 'Caribe' },
        { id_departamento: 15, nombre: 'Cundinamarca', codigo_dane: '25', region: 'Andina' },
        { id_departamento: 16, nombre: 'Guainía', codigo_dane: '94', region: 'Amazonía' },
        { id_departamento: 17, nombre: 'Guaviare', codigo_dane: '95', region: 'Amazonía' },
        { id_departamento: 18, nombre: 'Huila', codigo_dane: '41', region: 'Andina' },
        { id_departamento: 19, nombre: 'La Guajira', codigo_dane: '44', region: 'Caribe' },
        { id_departamento: 20, nombre: 'Magdalena', codigo_dane: '47', region: 'Caribe' },
        { id_departamento: 21, nombre: 'Meta', codigo_dane: '50', region: 'Orinoquía' },
        { id_departamento: 22, nombre: 'Nariño', codigo_dane: '52', region: 'Pacífica' },
        { id_departamento: 23, nombre: 'Norte de Santander', codigo_dane: '54', region: 'Andina' },
        { id_departamento: 24, nombre: 'Putumayo', codigo_dane: '86', region: 'Amazonía' },
        { id_departamento: 25, nombre: 'Quindío', codigo_dane: '63', region: 'Andina' },
        { id_departamento: 26, nombre: 'Risaralda', codigo_dane: '66', region: 'Andina' },
        { id_departamento: 27, nombre: 'San Andrés y Providencia', codigo_dane: '88', region: 'Caribe' },
        { id_departamento: 28, nombre: 'Santander', codigo_dane: '68', region: 'Andina' },
        { id_departamento: 29, nombre: 'Sucre', codigo_dane: '70', region: 'Caribe' },
        { id_departamento: 30, nombre: 'Tolima', codigo_dane: '73', region: 'Andina' },
        { id_departamento: 31, nombre: 'Valle del Cauca', codigo_dane: '76', region: 'Pacífica' },
        { id_departamento: 32, nombre: 'Vaupés', codigo_dane: '97', region: 'Amazonía' },
        { id_departamento: 33, nombre: 'Vichada', codigo_dane: '99', region: 'Orinoquía' }
      ], { ignoreDuplicates: true });
    }

    // Actualizar municipios existentes para asociarlos con departamentos
    // Si no existe la columna id_departamento, agregarla
    const columnExists = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'municipios' 
      AND column_name = 'id_departamento'
    `, { type: Sequelize.QueryTypes.SELECT });

    if (columnExists.length === 0) {
      await queryInterface.addColumn('municipios', 'id_departamento', {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'departamentos',
          key: 'id_departamento'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      });
    }

    // Actualizar municipios existentes basándose en el código DANE
    await queryInterface.sequelize.query(`
      UPDATE municipios 
      SET id_departamento = (
        SELECT d.id_departamento 
        FROM departamentos d 
        WHERE d.codigo_dane = LEFT(municipios.codigo_dane, 2)
      )
      WHERE municipios.codigo_dane IS NOT NULL 
      AND LENGTH(municipios.codigo_dane) >= 2
      AND municipios.id_departamento IS NULL
    `);

    // Actualizar municipios que no tienen codigo_dane basándose en el nombre del departamento
    await queryInterface.sequelize.query(`
      UPDATE municipios 
      SET id_departamento = (
        SELECT d.id_departamento 
        FROM departamentos d 
        WHERE LOWER(d.nombre) = LOWER(municipios.departamento)
      )
      WHERE municipios.id_departamento IS NULL 
      AND municipios.departamento IS NOT NULL
    `);

    // Insertar algunos municipios de ejemplo con relación a departamentos
    const municipiosEjemplo = [
      { nombre: 'Medellín', codigo_dane: '05001', id_departamento: 2 },
      { nombre: 'Bogotá D.C.', codigo_dane: '11001', id_departamento: 5 },
      { nombre: 'Cali', codigo_dane: '76001', id_departamento: 31 },
      { nombre: 'Barranquilla', codigo_dane: '08001', id_departamento: 4 },
      { nombre: 'Cartagena', codigo_dane: '13001', id_departamento: 6 }
    ];

    for (const municipio of municipiosEjemplo) {
      // Verificar si el municipio ya existe
      const existingMunicipio = await queryInterface.sequelize.query(
        'SELECT id_municipio FROM municipios WHERE codigo_dane = ?',
        { 
          replacements: [municipio.codigo_dane], 
          type: Sequelize.QueryTypes.SELECT 
        }
      );

      if (existingMunicipio.length === 0) {
        await queryInterface.bulkInsert('municipios', [municipio], { ignoreDuplicates: true });
      } else {
        // Actualizar si existe pero no tiene departamento
        await queryInterface.sequelize.query(`
          UPDATE municipios 
          SET id_departamento = ? 
          WHERE codigo_dane = ? 
          AND id_departamento IS NULL
        `, {
          replacements: [municipio.id_departamento, municipio.codigo_dane]
        });
      }
    }
  },

  async down (queryInterface, Sequelize) {
    // Eliminar la relación con departamentos
    await queryInterface.removeColumn('municipios', 'id_departamento');
    
    // Vaciar tabla departamentos
    await queryInterface.bulkDelete('departamentos', null, {});
  }
};
