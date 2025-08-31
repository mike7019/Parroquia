'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si ya existen registros en la tabla departamentos
    const [results] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM departamentos"
    );

    // Solo insertar si no hay registros existentes
    if (results[0].count === 0) {
      try {
        console.log('🌐 Consultando API de Colombia para obtener departamentos...');
        
        // Hacer solicitud a la API de Colombia
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://api-colombia.com/api/v1/Department', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Parroquia-Management-System/1.0'
          },
          timeout: 30000
        });

        if (!response.ok) {
          throw new Error(`Error en API de Colombia: ${response.status} ${response.statusText}`);
        }

        const departamentosAPI = await response.json();
        console.log(`📊 Recibidos ${departamentosAPI.length} departamentos de la API`);

        // Mapeo de códigos DANE
        const codigosDane = {
          'Amazonas': '91', 'Antioquia': '05', 'Arauca': '81', 'Atlántico': '08',
          'Bogotá': '11', 'Bolívar': '13', 'Boyacá': '15', 'Caldas': '17',
          'Caquetá': '18', 'Casanare': '85', 'Cauca': '19', 'Cesar': '20',
          'Chocó': '27', 'Córdoba': '23', 'Cundinamarca': '25', 'Guainía': '94',
          'Guaviare': '95', 'Huila': '41', 'La Guajira': '44', 'Magdalena': '47',
          'Meta': '50', 'Nariño': '52', 'Norte de Santander': '54', 'Putumayo': '86',
          'Quindío': '63', 'Risaralda': '66', 'San Andrés y Providencia': '88',
          'Santander': '68', 'Sucre': '70', 'Tolima': '73', 'Valle del Cauca': '76',
          'Vaupés': '97', 'Vichada': '99'
        };

        // Procesar y mapear datos de la API
        const departamentos = departamentosAPI
          .map(dept => ({
            nombre: dept.name,
            codigo_dane: codigosDane[dept.name] || '00',
            created_at: new Date(),
            updated_at: new Date()
          }))
          .sort((a, b) => a.nombre.localeCompare(b.nombre));

        console.log(`✅ Insertando ${departamentos.length} departamentos desde API`);
        await queryInterface.bulkInsert('departamentos', departamentos, {});

      } catch (error) {
        console.error('❌ Error al consultar API de Colombia:', error.message);
        console.log('🔄 Usando datos de respaldo...');
        
        // Fallback: datos básicos si la API falla
        await queryInterface.bulkInsert('departamentos', [
          { nombre: 'Antioquia', codigo_dane: '05', created_at: new Date(), updated_at: new Date() },
          { nombre: 'Bogotá', codigo_dane: '11', created_at: new Date(), updated_at: new Date() },
          { nombre: 'Cundinamarca', codigo_dane: '25', created_at: new Date(), updated_at: new Date() },
          { nombre: 'Valle del Cauca', codigo_dane: '76', created_at: new Date(), updated_at: new Date() }
        ], {});
      }
    } else {
      console.log('ℹ️  Los departamentos ya están cargados en la base de datos');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('departamentos', null, {});
  }
};
