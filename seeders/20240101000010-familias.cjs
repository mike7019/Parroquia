'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si ya existen registros en la tabla familias
    const [results] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM familias"
    );

    // Solo insertar si no hay registros existentes
    if (results[0].count === 0) {
      // Obtener datos de catálogos necesarios
      const [municipios] = await queryInterface.sequelize.query(
        "SELECT id_municipio FROM municipios LIMIT 3"
      );
      
      const [veredas] = await queryInterface.sequelize.query(
        "SELECT id_vereda FROM veredas LIMIT 5"
      );
      
      const [sectores] = await queryInterface.sequelize.query(
        "SELECT id_sector FROM sectores LIMIT 3"
      );

      const tiposVivienda = ['Casa', 'Apartamento', 'Rancho', 'Finca', 'Cuarto'];
      const sectoresNombres = ['Centro', 'Norte', 'Sur', 'Oriente', 'Occidente'];
      const apellidosFamiliares = [
        'Rodríguez', 'García', 'Martínez', 'López', 'González', 'Hernández',
        'Pérez', 'Sánchez', 'Ramírez', 'Cruz', 'Flores', 'Gómez', 'Díaz',
        'Reyes', 'Morales', 'Jiménez', 'Guerrero', 'Medina', 'Rojas', 'Vargas',
        'Castillo', 'Castro', 'Ortiz', 'Rubio', 'Marín', 'Iglesias', 'Santos',
        'Torres', 'Aguilar', 'Mendoza', 'Ruiz', 'Vega', 'Molina', 'Delgado',
        'Moreno', 'Carrasco', 'Alvarez', 'Fernández', 'Muñoz', 'Cortés'
      ];

      const familiasData = [];
      
      // Generar 40 familias
      for (let i = 1; i <= 40; i++) {
        const municipio = municipios[Math.floor(Math.random() * municipios.length)];
        const vereda = veredas[Math.floor(Math.random() * veredas.length)];
        const sector = sectores[Math.floor(Math.random() * sectores.length)];
        const apellido = apellidosFamiliares[Math.floor(Math.random() * apellidosFamiliares.length)];
        const tipoVivienda = tiposVivienda[Math.floor(Math.random() * tiposVivienda.length)];
        const sectorNombre = sectoresNombres[Math.floor(Math.random() * sectoresNombres.length)];
        
        familiasData.push({
          apellido_familiar: apellido,
          sector: sectorNombre,
          direccion_familia: `Calle ${Math.floor(Math.random() * 100) + 1} # ${Math.floor(Math.random() * 50) + 1}-${Math.floor(Math.random() * 99) + 1}`,
          numero_contacto: `300${Math.floor(Math.random() * 9000000) + 1000000}`,
          telefono: Math.random() > 0.5 ? `${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 9000) + 1000}` : null,
          email: Math.random() > 0.3 ? `familia${apellido.toLowerCase()}${i}@email.com` : null,
          tamaño_familia: Math.floor(Math.random() * 6) + 1, // Entre 1 y 6 miembros
          tipo_vivienda: tipoVivienda,
          estado_encuesta: Math.random() > 0.7 ? 'completed' : Math.random() > 0.4 ? 'in_progress' : 'pending',
          numero_encuestas: Math.floor(Math.random() * 3),
          fecha_ultima_encuesta: Math.random() > 0.5 ? new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1) : null,
          codigo_familia: `FAM${String(i).padStart(4, '0')}`,
          tutor_responsable: Math.random() > 0.3,
          id_municipio: municipio.id_municipio,
          id_vereda: vereda.id_vereda,
          id_sector: sector.id_sector,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      await queryInterface.bulkInsert('familias', familiasData, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('familias', null, {});
  }
};
