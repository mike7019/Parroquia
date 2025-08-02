'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar datos iniciales en la tabla profesiones
    await queryInterface.bulkInsert('profesiones', [
      { id_profesion: 1, nombre: 'Médico', descripcion: 'Profesional de la salud', categoria: 'Salud', createdAt: new Date(), updatedAt: new Date() },
      { id_profesion: 2, nombre: 'Enfermero/a', descripcion: 'Profesional de enfermería', categoria: 'Salud', createdAt: new Date(), updatedAt: new Date() },
      { id_profesion: 3, nombre: 'Docente', descripcion: 'Profesional de la educación', categoria: 'Educación', createdAt: new Date(), updatedAt: new Date() },
      { id_profesion: 4, nombre: 'Ingeniero', descripcion: 'Profesional de la ingeniería', categoria: 'Ingeniería', createdAt: new Date(), updatedAt: new Date() },
      { id_profesion: 5, nombre: 'Contador', descripcion: 'Profesional contable', categoria: 'Finanzas', createdAt: new Date(), updatedAt: new Date() },
      { id_profesion: 6, nombre: 'Abogado', descripcion: 'Profesional del derecho', categoria: 'Legal', createdAt: new Date(), updatedAt: new Date() },
      { id_profesion: 7, nombre: 'Agricultor', descripcion: 'Trabajador del campo', categoria: 'Agropecuario', createdAt: new Date(), updatedAt: new Date() },
      { id_profesion: 8, nombre: 'Comerciante', descripcion: 'Dedicado al comercio', categoria: 'Comercio', createdAt: new Date(), updatedAt: new Date() },
      { id_profesion: 9, nombre: 'Estudiante', descripcion: 'Persona que estudia', categoria: 'Educación', createdAt: new Date(), updatedAt: new Date() },
      { id_profesion: 10, nombre: 'Ama de casa', descripcion: 'Dedicada al hogar', categoria: 'Hogar', createdAt: new Date(), updatedAt: new Date() },
      { id_profesion: 11, nombre: 'Pensionado', descripcion: 'Persona jubilada', categoria: 'Jubilación', createdAt: new Date(), updatedAt: new Date() },
      { id_profesion: 12, nombre: 'Desempleado', descripcion: 'Sin empleo actual', categoria: 'Sin empleo', createdAt: new Date(), updatedAt: new Date() },
    ]);

    // Insertar datos iniciales en la tabla enfermedades (usando la clave existente)
    await queryInterface.bulkInsert('enfermedades', [
      { id_enfermedades: 1, nombre: 'Hipertensión arterial', descripcion: 'Presión arterial alta', createdAt: new Date(), updatedAt: new Date() },
      { id_enfermedades: 2, nombre: 'Diabetes mellitus', descripcion: 'Enfermedad metabólica crónica', createdAt: new Date(), updatedAt: new Date() },
      { id_enfermedades: 3, nombre: 'Artritis', descripcion: 'Inflamación de las articulaciones', createdAt: new Date(), updatedAt: new Date() },
      { id_enfermedades: 4, nombre: 'Asma', descripcion: 'Enfermedad respiratoria crónica', createdAt: new Date(), updatedAt: new Date() },
      { id_enfermedades: 5, nombre: 'Depresión', descripcion: 'Trastorno del estado de ánimo', createdAt: new Date(), updatedAt: new Date() },
      { id_enfermedades: 6, nombre: 'Ansiedad', descripcion: 'Trastorno de ansiedad', createdAt: new Date(), updatedAt: new Date() },
      { id_enfermedades: 7, nombre: 'Enfermedad cardiovascular', descripcion: 'Afecciones del corazón y vasos sanguíneos', createdAt: new Date(), updatedAt: new Date() },
      { id_enfermedades: 8, nombre: 'Gastritis', descripcion: 'Inflamación del estómago', createdAt: new Date(), updatedAt: new Date() },
      { id_enfermedades: 9, nombre: 'Migraña', descripcion: 'Dolor de cabeza intenso', createdAt: new Date(), updatedAt: new Date() },
      { id_enfermedades: 10, nombre: 'Osteoporosis', descripcion: 'Debilitamiento de los huesos', createdAt: new Date(), updatedAt: new Date() },
      { id_enfermedades: 11, nombre: 'Colesterol alto', descripcion: 'Niveles elevados de colesterol', createdAt: new Date(), updatedAt: new Date() },
      { id_enfermedades: 12, nombre: 'Ninguna', descripcion: 'Sin enfermedades conocidas', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('persona_enfermedad', null, {});
    await queryInterface.bulkDelete('enfermedades', null, {});
    await queryInterface.bulkDelete('profesiones', null, {});
  }
};
