'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequ    // Insert sample difuntos_familia
    await queryInterface.bulkInsert('difuntos_familia', [
      {
        id_difunto: 1,
        nombre_completo: 'Pedro García Sánchez',
        fecha_fallecimiento: '2018-12-20',
        motivo: 'Enfermedad natural - gran devoto'
      }
    ]);  // Create sample family data based on the diagram structure
    
    // Insert sample familia
    await queryInterface.bulkInsert('familias', [
      {
        id_familia: 1,
        nombre_familia: 'Familia García López',
        direccion_familia: 'Calle 123 #45-67',
        numero_contacto: '3001234567',
        id_municipio: 1,
        id_vereda: 1,
        id_sector: 1,
        id_sistemas_acueducto: 1,
        id_tipos_disposicion_basura: 1,
        id_tipos_aguas_residuales: 1,
        observaciones: 'Familia comprometida con actividades parroquiales'
      },
      {
        id_familia: 2,
        nombre_familia: 'Familia Rodríguez Martínez',
        direccion_familia: 'Carrera 89 #12-34',
        numero_contacto: '3009876543',
        id_municipio: 1,
        id_vereda: 2,
        id_sector: 3,
        id_sistemas_acueducto: 1,
        id_tipos_disposicion_basura: 1,
        id_tipos_aguas_residuales: 1,
        observaciones: 'Participan activamente en catequesis'
      }
    ]);

    // Insert sample personas
    await queryInterface.bulkInsert('personas', [
      {
        id: uuidv4(),
        primer_nombre: 'Juan',
        segundo_nombre: 'Carlos',
        primer_apellido: 'García',
        segundo_apellido: 'López',
        numero_identificacion: '12345678',
        id_tipo_identificacion: 1, // CC
        correo_electronico: 'juan.garcia@email.com',
        telefono: '3001234567',
        celular: '3201234567',
        direccion: 'Calle 123 #45-67',
        barrio: 'Centro',
        fecha_nacimiento: '1975-03-15',
        lugar_nacimiento: 'Bogotá D.C.',
        id_sexo: 1, // Masculino
        id_estado_civil: 2, // Casado
        ocupacion: 'Ingeniero',
        nivel_educativo: 'Universitario',
        id_niveles_educativos: 10,
        estado_salud: 'Bueno',
        fecha_bautismo: '1975-04-20',
        fecha_primera_comunion: '1983-05-15',
        fecha_confirmacion: '1990-06-10',
        id_familia: 1,
        id_municipio: 1,
        id_vereda: 1,
        id_sector: 1,
        id_parroquia: 1,
        id_tipo_vivienda: 1,
        id_comunidades_culturales: 1,
        observaciones: 'Líder comunitario activo',
        activo: true
      },
      {
        id: uuidv4(),
        primer_nombre: 'María',
        segundo_nombre: 'Elena',
        primer_apellido: 'López',
        segundo_apellido: 'Fernández',
        numero_identificacion: '23456789',
        id_tipo_identificacion: 1, // CC
        correo_electronico: 'maria.lopez@email.com',
        telefono: '3001234567',
        celular: '3202345678',
        direccion: 'Calle 123 #45-67',
        barrio: 'Centro',
        fecha_nacimiento: '1978-08-22',
        lugar_nacimiento: 'Bogotá D.C.',
        id_sexo: 2, // Femenino
        id_estado_civil: 2, // Casada
        ocupacion: 'Profesora',
        nivel_educativo: 'Universitario',
        id_niveles_educativos: 10,
        estado_salud: 'Bueno',
        fecha_bautismo: '1978-09-15',
        fecha_primera_comunion: '1986-04-20',
        fecha_confirmacion: '1993-05-25',
        id_familia: 1,
        id_municipio: 1,
        id_vereda: 1,
        id_sector: 1,
        id_parroquia: 1,
        id_tipo_vivienda: 1,
        id_comunidades_culturales: 1,
        observaciones: 'Catequista experimentada',
        activo: true
      },
      {
        id: uuidv4(),
        primer_nombre: 'Ana',
        segundo_nombre: 'Sofía',
        primer_apellido: 'García',
        segundo_apellido: 'López',
        numero_identificacion: '34567890',
        id_tipo_identificacion: 2, // TI
        correo_electronico: 'ana.garcia@email.com',
        telefono: '3001234567',
        celular: '3203456789',
        direccion: 'Calle 123 #45-67',
        barrio: 'Centro',
        fecha_nacimiento: '2005-12-10',
        lugar_nacimiento: 'Bogotá D.C.',
        id_sexo: 2, // Femenino
        id_estado_civil: 1, // Soltera
        ocupacion: 'Estudiante',
        nivel_educativo: 'Secundaria',
        id_niveles_educativos: 6,
        estado_salud: 'Excelente',
        fecha_bautismo: '2006-01-15',
        fecha_primera_comunion: '2013-05-20',
        fecha_confirmacion: '2020-10-15',
        id_familia: 1,
        id_municipio: 1,
        id_vereda: 1,
        id_sector: 1,
        id_parroquia: 1,
        id_tipo_vivienda: 1,
        id_comunidades_culturales: 1,
        observaciones: 'Participa en pastoral juvenil',
        activo: true
      }
    ]);

    // Insert sample liderazgos
    await queryInterface.bulkInsert('liderazgos', [
      {
        id_liderazgo: 1,
        fecha_inicio: '2020-01-15',
        fecha_fin: null,
        activo: true
      },
      {
        id_liderazgo: 2,
        fecha_inicio: '2019-03-20',
        fecha_fin: null,
        activo: true
      }
    ]);

    // Sample difuntos_familia
    await queryInterface.bulkInsert('difuntos_familia', [
      {
        id_difunto: 1,
        nombre_completo: 'Pedro García Sánchez',
        fecha_fallecimiento: '2018-12-20',
        motivo: 'Enfermedad natural - gran devoto'
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    // Remove sample data in reverse order
    await queryInterface.bulkDelete('difuntos_familia', null, {});
    await queryInterface.bulkDelete('liderazgos', null, {});
    await queryInterface.bulkDelete('personas', null, {});
    await queryInterface.bulkDelete('familias', null, {});
  }
};
