'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    console.log('🏛️ Iniciando inserción de departamentos...');
    
    // Verificar si ya existen departamentos
    const [{ count }] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM departamentos',
      { type: Sequelize.QueryTypes.SELECT }
    );

    console.log(`📊 Departamentos existentes: ${count}`);

    if (parseInt(count) === 0) {
      console.log('📥 Insertando departamentos de Colombia...');
      
      await queryInterface.bulkInsert('departamentos', [
        { id_departamento: 1, nombre: 'Amazonas', codigo_dane: '91', region: 'Amazonía', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 2, nombre: 'Antioquia', codigo_dane: '05', region: 'Andina', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 3, nombre: 'Arauca', codigo_dane: '81', region: 'Orinoquía', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 4, nombre: 'Atlántico', codigo_dane: '08', region: 'Caribe', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 5, nombre: 'Bogotá D.C.', codigo_dane: '11', region: 'Andina', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 6, nombre: 'Bolívar', codigo_dane: '13', region: 'Caribe', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 7, nombre: 'Boyacá', codigo_dane: '15', region: 'Andina', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 8, nombre: 'Caldas', codigo_dane: '17', region: 'Andina', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 9, nombre: 'Caquetá', codigo_dane: '18', region: 'Amazonía', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 10, nombre: 'Casanare', codigo_dane: '85', region: 'Orinoquía', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 11, nombre: 'Cauca', codigo_dane: '19', region: 'Pacífica', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 12, nombre: 'Cesar', codigo_dane: '20', region: 'Caribe', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 13, nombre: 'Chocó', codigo_dane: '27', region: 'Pacífica', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 14, nombre: 'Córdoba', codigo_dane: '23', region: 'Caribe', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 15, nombre: 'Cundinamarca', codigo_dane: '25', region: 'Andina', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 16, nombre: 'Guainía', codigo_dane: '94', region: 'Amazonía', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 17, nombre: 'Guaviare', codigo_dane: '95', region: 'Amazonía', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 18, nombre: 'Huila', codigo_dane: '41', region: 'Andina', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 19, nombre: 'La Guajira', codigo_dane: '44', region: 'Caribe', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 20, nombre: 'Magdalena', codigo_dane: '47', region: 'Caribe', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 21, nombre: 'Meta', codigo_dane: '50', region: 'Orinoquía', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 22, nombre: 'Nariño', codigo_dane: '52', region: 'Pacífica', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 23, nombre: 'Norte de Santander', codigo_dane: '54', region: 'Andina', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 24, nombre: 'Putumayo', codigo_dane: '86', region: 'Amazonía', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 25, nombre: 'Quindío', codigo_dane: '63', region: 'Andina', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 26, nombre: 'Risaralda', codigo_dane: '66', region: 'Andina', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 27, nombre: 'San Andrés y Providencia', codigo_dane: '88', region: 'Caribe', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 28, nombre: 'Santander', codigo_dane: '68', region: 'Andina', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 29, nombre: 'Sucre', codigo_dane: '70', region: 'Caribe', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 30, nombre: 'Tolima', codigo_dane: '73', region: 'Andina', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 31, nombre: 'Valle del Cauca', codigo_dane: '76', region: 'Pacífica', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 32, nombre: 'Vaupés', codigo_dane: '97', region: 'Amazonía', createdAt: new Date(), updatedAt: new Date() },
        { id_departamento: 33, nombre: 'Vichada', codigo_dane: '99', region: 'Orinoquía', createdAt: new Date(), updatedAt: new Date() }
      ], { ignoreDuplicates: true });
      
      console.log('✅ Departamentos insertados correctamente');
    } else {
      console.log('ℹ️ Los departamentos ya existen, omitiendo inserción');
    }

    console.log('🏘️ Insertando municipios de ejemplo...');
    
    // Insertar algunos municipios principales
    const municipiosEjemplo = [
      { nombre_municipio: 'Medellín', codigo_dane: '05001', id_departamento: 2, createdAt: new Date(), updatedAt: new Date() },
      { nombre_municipio: 'Bogotá D.C.', codigo_dane: '11001', id_departamento: 5, createdAt: new Date(), updatedAt: new Date() },
      { nombre_municipio: 'Cali', codigo_dane: '76001', id_departamento: 31, createdAt: new Date(), updatedAt: new Date() },
      { nombre_municipio: 'Barranquilla', codigo_dane: '08001', id_departamento: 4, createdAt: new Date(), updatedAt: new Date() },
      { nombre_municipio: 'Cartagena', codigo_dane: '13001', id_departamento: 6, createdAt: new Date(), updatedAt: new Date() }
    ];

    for (const municipio of municipiosEjemplo) {
      console.log(`🔍 Verificando municipio: ${municipio.nombre_municipio}`);
      
      const existingMunicipio = await queryInterface.sequelize.query(
        'SELECT id_municipio FROM municipios WHERE codigo_dane = ?',
        { 
          replacements: [municipio.codigo_dane], 
          type: Sequelize.QueryTypes.SELECT 
        }
      );

      if (existingMunicipio.length === 0) {
        console.log(`➕ Insertando: ${municipio.nombre_municipio}`);
        await queryInterface.bulkInsert('municipios', [municipio], { ignoreDuplicates: true });
      } else {
        console.log(`ℹ️ Ya existe: ${municipio.nombre_municipio}`);
      }
    }

    console.log('✅ Seeder de departamentos y municipios completado');
  },

  async down (queryInterface, Sequelize) {
    // Eliminar municipios de ejemplo
    await queryInterface.bulkDelete('municipios', {
      codigo_dane: ['05001', '11001', '76001', '08001', '13001']
    }, {});
    
    // Eliminar departamentos
    await queryInterface.bulkDelete('departamentos', null, {});
  }
};
