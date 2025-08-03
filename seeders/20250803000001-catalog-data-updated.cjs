'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🌱 Poblando datos catálogo...');

    // Insert initial data for tipo_identificacion
    await queryInterface.bulkInsert('tipo_identificacion', [
      { id_tipo_identificacion: 1, descripcion: 'Registro civil', codigo: 'RC' },
      { id_tipo_identificacion: 2, descripcion: 'Tarjeta de identidad', codigo: 'TI' },
      { id_tipo_identificacion: 3, descripcion: 'Cédula de Ciudadanía', codigo: 'CC' },
      { id_tipo_identificacion: 4, descripcion: 'Cédula de Extranjería', codigo: 'CE' },
      { id_tipo_identificacion: 5, descripcion: 'Pasaporte', codigo: 'PP' },
      { id_tipo_identificacion: 6, descripcion: 'NIT', codigo: 'NIT' },
      { id_tipo_identificacion: 7, descripcion: 'Permiso Especial de Permanencia', codigo: 'PEP' }
    ], { ignoreDuplicates: true });

    // Insert initial data for sexo
    await queryInterface.bulkInsert('sexo', [
      { id_sexo: 1, descripcion: 'Masculino', createdAt: new Date(), updatedAt: new Date() },
      { id_sexo: 2, descripcion: 'Femenino', createdAt: new Date(), updatedAt: new Date() }
    ], { ignoreDuplicates: true });

    console.log('✅ Datos catálogo poblados exitosamente');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tipo_identificacion', null, {});
    await queryInterface.bulkDelete('sexo', null, {});
  }
};
