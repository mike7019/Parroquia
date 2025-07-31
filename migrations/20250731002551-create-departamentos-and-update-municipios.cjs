'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear tabla departamentos
    await queryInterface.createTable('departamentos', {
      id_departamento: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      codigo_dane: {
        type: Sequelize.STRING(2),
        allowNull: false,
        unique: true,
        comment: 'Código DANE del departamento (2 dígitos)'
      },
      region: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Región geográfica del departamento'
      }
    });

    // Insertar datos básicos de departamentos colombianos
    await queryInterface.bulkInsert('departamentos', [
      { nombre: 'Amazonas', codigo_dane: '91', region: 'Amazonía' },
      { nombre: 'Antioquia', codigo_dane: '05', region: 'Andina' },
      { nombre: 'Arauca', codigo_dane: '81', region: 'Orinoquía' },
      { nombre: 'Atlántico', codigo_dane: '08', region: 'Caribe' },
      { nombre: 'Bogotá D.C.', codigo_dane: '11', region: 'Andina' },
      { nombre: 'Bolívar', codigo_dane: '13', region: 'Caribe' },
      { nombre: 'Boyacá', codigo_dane: '15', region: 'Andina' },
      { nombre: 'Caldas', codigo_dane: '17', region: 'Andina' },
      { nombre: 'Caquetá', codigo_dane: '18', region: 'Amazonía' },
      { nombre: 'Casanare', codigo_dane: '85', region: 'Orinoquía' },
      { nombre: 'Cauca', codigo_dane: '19', region: 'Pacífica' },
      { nombre: 'Cesar', codigo_dane: '20', region: 'Caribe' },
      { nombre: 'Chocó', codigo_dane: '27', region: 'Pacífica' },
      { nombre: 'Córdoba', codigo_dane: '23', region: 'Caribe' },
      { nombre: 'Cundinamarca', codigo_dane: '25', region: 'Andina' },
      { nombre: 'Guainía', codigo_dane: '94', region: 'Amazonía' },
      { nombre: 'Guaviare', codigo_dane: '95', region: 'Amazonía' },
      { nombre: 'Huila', codigo_dane: '41', region: 'Andina' },
      { nombre: 'La Guajira', codigo_dane: '44', region: 'Caribe' },
      { nombre: 'Magdalena', codigo_dane: '47', region: 'Caribe' },
      { nombre: 'Meta', codigo_dane: '50', region: 'Orinoquía' },
      { nombre: 'Nariño', codigo_dane: '52', region: 'Pacífica' },
      { nombre: 'Norte de Santander', codigo_dane: '54', region: 'Andina' },
      { nombre: 'Putumayo', codigo_dane: '86', region: 'Amazonía' },
      { nombre: 'Quindío', codigo_dane: '63', region: 'Andina' },
      { nombre: 'Risaralda', codigo_dane: '66', region: 'Andina' },
      { nombre: 'San Andrés y Providencia', codigo_dane: '88', region: 'Caribe' },
      { nombre: 'Santander', codigo_dane: '68', region: 'Andina' },
      { nombre: 'Sucre', codigo_dane: '70', region: 'Caribe' },
      { nombre: 'Tolima', codigo_dane: '73', region: 'Andina' },
      { nombre: 'Valle del Cauca', codigo_dane: '76', region: 'Pacífica' },
      { nombre: 'Vaupés', codigo_dane: '97', region: 'Amazonía' },
      { nombre: 'Vichada', codigo_dane: '99', region: 'Orinoquía' }
    ], { ignoreDuplicates: true });

    // Agregar columna id_departamento a la tabla municipios
    await queryInterface.addColumn('municipios', 'id_departamento', {
      type: Sequelize.BIGINT,
      allowNull: true, // Temporalmente permitir null para migración
      references: {
        model: 'departamentos',
        key: 'id_departamento'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    // Agregar código DANE a municipios (si no existe)
    const [municipiosColumns] = await queryInterface.sequelize.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'municipios' AND column_name = 'codigo_dane'"
    );
    
    if (municipiosColumns.length === 0) {
      await queryInterface.addColumn('municipios', 'codigo_dane', {
        type: Sequelize.STRING(5),
        allowNull: true,
        unique: true,
        comment: 'Código DANE del municipio (5 dígitos)'
      });
    }

    // Por ahora solo vinculamos los departamentos manualmente
    // Se puede implementar actualización de códigos DANE posteriormente
    console.log('Tabla departamentos creada y relación con municipios establecida');

    // Modificar la columna codigo_dane para ser más restrictiva (si existe)
    const [municipiosCodeDaneColumns] = await queryInterface.sequelize.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'municipios' AND column_name = 'codigo_dane'"
    );
    
    if (municipiosCodeDaneColumns.length > 0) {
      await queryInterface.changeColumn('municipios', 'codigo_dane', {
        type: Sequelize.STRING(5),
        allowNull: true,
        comment: 'Código DANE del municipio (5 dígitos)'
      });
    }

    // Agregar índices para optimizar consultas
    await queryInterface.addIndex('municipios', ['id_departamento']);
    if (municipiosCodeDaneColumns.length > 0) {
      await queryInterface.addIndex('municipios', ['codigo_dane']);
    }
    await queryInterface.addIndex('departamentos', ['codigo_dane']);
  },

  async down(queryInterface, Sequelize) {
    // Eliminar índices (ignorar errores si no existen)
    try {
      await queryInterface.removeIndex('municipios', ['id_departamento']);
    } catch (e) { console.log('Índice id_departamento no existe'); }
    
    try {
      await queryInterface.removeIndex('municipios', ['codigo_dane']);
    } catch (e) { console.log('Índice codigo_dane no existe'); }
    
    try {
      await queryInterface.removeIndex('departamentos', ['codigo_dane']);
    } catch (e) { console.log('Índice departamentos codigo_dane no existe'); }
    
    // Eliminar columna id_departamento de municipios
    await queryInterface.removeColumn('municipios', 'id_departamento');
    
    // Eliminar tabla departamentos
    await queryInterface.dropTable('departamentos');
  }
};
