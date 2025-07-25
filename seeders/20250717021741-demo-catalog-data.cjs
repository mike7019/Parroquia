'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Insert initial data for tipo_identificacion
    await queryInterface.bulkInsert('tipo_identificacion', [
      { id_tipo_identificacion: 1, descripcion: 'Cédula de Ciudadanía', tipo_identificacion_pk: 'CC' },
      { id_tipo_identificacion: 2, descripcion: 'Tarjeta de Identidad', tipo_identificacion_pk: 'TI' },
      { id_tipo_identificacion: 3, descripcion: 'Cédula de Extranjería', tipo_identificacion_pk: 'CE' },
      { id_tipo_identificacion: 4, descripcion: 'Pasaporte', tipo_identificacion_pk: 'PA' }
    ]);

    // Insert initial data for estado_civil
    await queryInterface.bulkInsert('estado_civil', [
      { id_estado_civil: 1, descripcion: 'Soltero' },
      { id_estado_civil: 2, descripcion: 'Casado' },
      { id_estado_civil: 3, descripcion: 'Divorciado' },
      { id_estado_civil: 4, descripcion: 'Viudo' },
      { id_estado_civil: 5, descripcion: 'Unión Libre' }
    ]);

    // Insert initial data for sexo
    await queryInterface.bulkInsert('sexo', [
      { id_sexo: 1, sexo: 'Masculino' },
      { id_sexo: 2, sexo: 'Femenino' },
      { id_sexo: 3, sexo: 'Otro' }
    ]);

    // Insert initial data for tipo_vivienda
    await queryInterface.bulkInsert('tipo_vivienda', [
      { id_tipo_vivienda: 1, tipo_vivienda: 'Casa' },
      { id_tipo_vivienda: 2, tipo_vivienda: 'Apartamento' },
      { id_tipo_vivienda: 3, tipo_vivienda: 'Finca' },
      { id_tipo_vivienda: 4, tipo_vivienda: 'Habitación' },
      { id_tipo_vivienda: 5, tipo_vivienda: 'Otro' }
    ]);

    // Insert initial data for parroquia
    await queryInterface.bulkInsert('parroquia', [
      { id_parroquia: 1, nombre: 'Parroquia San José' },
      { id_parroquia: 2, nombre: 'Parroquia Nuestra Señora de Fátima' },
      { id_parroquia: 3, nombre: 'Parroquia San Pedro' }
    ]);

    // Insert initial data for parentesco
    await queryInterface.bulkInsert('parentesco', [
      { id_parentesco: 1, nombre: 'Padre' },
      { id_parentesco: 2, nombre: 'Madre' },
      { id_parentesco: 3, nombre: 'Hijo' },
      { id_parentesco: 4, nombre: 'Hija' },
      { id_parentesco: 5, nombre: 'Hermano' },
      { id_parentesco: 6, nombre: 'Hermana' },
      { id_parentesco: 7, nombre: 'Abuelo' },
      { id_parentesco: 8, nombre: 'Abuela' },
      { id_parentesco: 9, nombre: 'Tío' },
      { id_parentesco: 10, nombre: 'Tía' },
      { id_parentesco: 11, nombre: 'Primo' },
      { id_parentesco: 12, nombre: 'Prima' },
      { id_parentesco: 13, nombre: 'Esposo' },
      { id_parentesco: 14, nombre: 'Esposa' }
    ]);

    // Insert initial data for sistemas_acueducto
    await queryInterface.bulkInsert('sistemas_acueducto', [
      { id_sistemas_acueducto: 1, proveedor: 'Acueducto Municipal', metodo_abastecimiento: 'Red pública', descripcion: 'Servicio público de acueducto' },
      { id_sistemas_acueducto: 2, proveedor: 'Pozo propio', metodo_abastecimiento: 'Pozo artesiano', descripcion: 'Agua extraída de pozo privado' },
      { id_sistemas_acueducto: 3, proveedor: 'Agua lluvia', metodo_abastecimiento: 'Recolección', descripcion: 'Recolección de agua de lluvia' },
      { id_sistemas_acueducto: 4, proveedor: 'Río/Quebrada', metodo_abastecimiento: 'Captación directa', descripcion: 'Agua tomada directamente de fuente natural' }
    ]);

    // Insert initial data for tipos_disposicion_basura
    await queryInterface.bulkInsert('tipos_disposicion_basura', [
      { id_tipos_disposicion_basura: 1, metodo: 'Recolección municipal' },
      { id_tipos_disposicion_basura: 2, metodo: 'Quema' },
      { id_tipos_disposicion_basura: 3, metodo: 'Enterramiento' },
      { id_tipos_disposicion_basura: 4, metodo: 'Reciclaje' },
      { id_tipos_disposicion_basura: 5, metodo: 'Compostaje' }
    ]);

    // Insert initial data for tipos_aguas_residuales
    await queryInterface.bulkInsert('tipos_aguas_residuales', [
      { id_tipos_aguas_residuales: 1, metodo: 'Alcantarillado público' },
      { id_tipos_aguas_residuales: 2, metodo: 'Pozo séptico' },
      { id_tipos_aguas_residuales: 3, metodo: 'Letrina' },
      { id_tipos_aguas_residuales: 4, metodo: 'Campo abierto' }
    ]);

    // Insert initial data for niveles_educativos
    await queryInterface.bulkInsert('niveles_educativos', [
      { id_niveles_educativos: 1, nivel: 'Sin educación formal', orden_nivel: 1, descripcion: 'No tiene educación formal' },
      { id_niveles_educativos: 2, nivel: 'Preescolar', orden_nivel: 2, descripcion: 'Educación preescolar básica' },
      { id_niveles_educativos: 3, nivel: 'Primaria incompleta', orden_nivel: 3, descripcion: 'Primaria sin completar' },
      { id_niveles_educativos: 4, nivel: 'Primaria completa', orden_nivel: 4, descripcion: 'Educación primaria completa' },
      { id_niveles_educativos: 5, nivel: 'Secundaria incompleta', orden_nivel: 5, descripcion: 'Secundaria sin completar' },
      { id_niveles_educativos: 6, nivel: 'Secundaria completa', orden_nivel: 6, descripcion: 'Bachillerato completo' },
      { id_niveles_educativos: 7, nivel: 'Técnico', orden_nivel: 7, descripcion: 'Formación técnica especializada' },
      { id_niveles_educativos: 8, nivel: 'Tecnológico', orden_nivel: 8, descripcion: 'Formación tecnológica' },
      { id_niveles_educativos: 9, nivel: 'Universitario incompleto', orden_nivel: 9, descripcion: 'Estudios universitarios en curso' },
      { id_niveles_educativos: 10, nivel: 'Universitario completo', orden_nivel: 10, descripcion: 'Título universitario' },
      { id_niveles_educativos: 11, nivel: 'Especialización', orden_nivel: 11, descripcion: 'Estudios de especialización' },
      { id_niveles_educativos: 12, nivel: 'Maestría', orden_nivel: 12, descripcion: 'Estudios de maestría' },
      { id_niveles_educativos: 13, nivel: 'Doctorado', orden_nivel: 13, descripcion: 'Estudios doctorales' }
    ]);

    // Insert initial data for comunidades_culturales
    await queryInterface.bulkInsert('comunidades_culturales', [
      { id_comunidades_culturales: 1, descripcion: 'Ninguna - No pertenece a comunidad étnica específica' },
      { id_comunidades_culturales: 2, descripcion: 'Indígena - Pertenece a comunidad indígena' },
      { id_comunidades_culturales: 3, descripcion: 'Afrocolombiano - Pertenece a comunidad afrocolombiana' },
      { id_comunidades_culturales: 4, descripcion: 'Raizal - Pertenece a comunidad raizal' },
      { id_comunidades_culturales: 5, descripcion: 'Palenquero - Pertenece a comunidad palenquera' },
      { id_comunidades_culturales: 6, descripcion: 'ROM (Gitano) - Pertenece a comunidad ROM' }
    ]);

    // Insert initial data for talla_vestimenta
    await queryInterface.bulkInsert('talla_vestimenta', [
      { id_talla_vestimenta: 1, nombre: 'XS - Extra pequeña' },
      { id_talla_vestimenta: 2, nombre: 'S - Pequeña' },
      { id_talla_vestimenta: 3, nombre: 'M - Mediana' },
      { id_talla_vestimenta: 4, nombre: 'L - Grande' },
      { id_talla_vestimenta: 5, nombre: 'XL - Extra grande' },
      { id_talla_vestimenta: 6, nombre: 'XXL - Extra extra grande' },
      { id_talla_vestimenta: 7, nombre: 'Talla 6' },
      { id_talla_vestimenta: 8, nombre: 'Talla 8' },
      { id_talla_vestimenta: 9, nombre: 'Talla 10' },
      { id_talla_vestimenta: 10, nombre: 'Talla 12' },
      { id_talla_vestimenta: 11, nombre: 'Talla 14' },
      { id_talla_vestimenta: 12, nombre: 'Talla 16' }
    ]);

    // Insert initial data for destrezas
    await queryInterface.bulkInsert('destrezas', [
      { id_destrezas: 1, nombre: 'Liderazgo - Capacidad de liderar grupos y proyectos' },
      { id_destrezas: 2, nombre: 'Comunicación - Habilidades de comunicación oral y escrita' },
      { id_destrezas: 3, nombre: 'Organización - Capacidad de organizar eventos y actividades' },
      { id_destrezas: 4, nombre: 'Enseñanza - Habilidad para enseñar y formar a otros' },
      { id_destrezas: 5, nombre: 'Música - Talento musical e instrumental' },
      { id_destrezas: 6, nombre: 'Arte - Habilidades artísticas y creativas' },
      { id_destrezas: 7, nombre: 'Deportes - Destrezas deportivas y físicas' },
      { id_destrezas: 8, nombre: 'Tecnología - Conocimientos en tecnología e informática' },
      { id_destrezas: 9, nombre: 'Pastoral - Formación y experiencia pastoral' },
      { id_destrezas: 10, nombre: 'Administración - Capacidades administrativas y de gestión' }
    ]);

    // Insert initial data for roles
    await queryInterface.bulkInsert('roles', [
      { id_rol: 1, nombre_rol: 'Administrador - Acceso total al sistema' },
      { id_rol: 2, nombre_rol: 'Pastor - Gestión pastoral de la parroquia' },
      { id_rol: 3, nombre_rol: 'Secretario - Gestión administrativa y documentos' },
      { id_rol: 4, nombre_rol: 'Catequista - Formación religiosa y catequesis' },
      { id_rol: 5, nombre_rol: 'Líder Comunitario - Liderazgo en la comunidad' },
      { id_rol: 6, nombre_rol: 'Voluntario - Participación en actividades voluntarias' },
      { id_rol: 7, nombre_rol: 'Usuario Básico - Acceso básico al sistema' }
    ]);

    // Insert initial data for areas_liderazgo
    await queryInterface.bulkInsert('areas_liderazgo', [
      { id_areas_liderazgo: 1, nombre: 'Pastoral', descripcion: 'Liderazgo en actividades pastorales' },
      { id_areas_liderazgo: 2, nombre: 'Liturgia', descripcion: 'Organización de celebraciones litúrgicas' },
      { id_areas_liderazgo: 3, nombre: 'Catequesis', descripcion: 'Formación religiosa y catequética' },
      { id_areas_liderazgo: 4, nombre: 'Social', descripcion: 'Trabajo social y comunitario' },
      { id_areas_liderazgo: 5, nombre: 'Caridad', descripcion: 'Obras de caridad y asistencia' },
      { id_areas_liderazgo: 6, nombre: 'Juventud', descripcion: 'Pastoral juvenil' },
      { id_areas_liderazgo: 7, nombre: 'Familia', descripcion: 'Pastoral familiar' },
      { id_areas_liderazgo: 8, nombre: 'Educación', descripcion: 'Formación y educación' },
      { id_areas_liderazgo: 9, nombre: 'Administración', descripcion: 'Gestión administrativa' },
      { id_areas_liderazgo: 10, nombre: 'Coro', descripcion: 'Ministerio musical' }
    ]);

    // Insert initial data for enfermedades
    await queryInterface.bulkInsert('enfermedades', [
      { id_enfermedades: 1, nombre: 'Hipertensión - Presión arterial alta' },
      { id_enfermedades: 2, nombre: 'Diabetes - Diabetes mellitus' },
      { id_enfermedades: 3, nombre: 'Asma - Enfermedad respiratoria crónica' },
      { id_enfermedades: 4, nombre: 'Artritis - Inflamación de las articulaciones' },
      { id_enfermedades: 5, nombre: 'Depresión - Trastorno del estado de ánimo' },
      { id_enfermedades: 6, nombre: 'Ansiedad - Trastorno de ansiedad' },
      { id_enfermedades: 7, nombre: 'Migraña - Dolores de cabeza severos' },
      { id_enfermedades: 8, nombre: 'Gastritis - Inflamación del estómago' },
      { id_enfermedades: 9, nombre: 'Colesterol alto - Niveles elevados de colesterol' },
      { id_enfermedades: 10, nombre: 'Otras - Otras enfermedades no especificadas' }
    ]);

    // Insert sample data for municipios (ejemplo Colombia)
    await queryInterface.bulkInsert('municipios', [
      { id_municipio: 1, nombre: 'Bogotá D.C.', codigo_dane: '11001', departamento: 'Cundinamarca' },
      { id_municipio: 2, nombre: 'Medellín', codigo_dane: '05001', departamento: 'Antioquia' },
      { id_municipio: 3, nombre: 'Cali', codigo_dane: '76001', departamento: 'Valle del Cauca' },
      { id_municipio: 4, nombre: 'Barranquilla', codigo_dane: '08001', departamento: 'Atlántico' },
      { id_municipio: 5, nombre: 'Cartagena', codigo_dane: '13001', departamento: 'Bolívar' }
    ]);

    // Insert sample data for veredas
    await queryInterface.bulkInsert('veredas', [
      { id_vereda: 1, nombre: 'Centro', id_municipio: 1 },
      { id_vereda: 2, nombre: 'Norte', id_municipio: 1 },
      { id_vereda: 3, nombre: 'Sur', id_municipio: 1 },
      { id_vereda: 4, nombre: 'Oriente', id_municipio: 1 },
      { id_vereda: 5, nombre: 'Occidente', id_municipio: 1 }
    ]);

    // Insert sample data for sector
    await queryInterface.bulkInsert('sector', [
      { id_sector: 1, nombre: 'Sector A', id_vereda: 1 },
      { id_sector: 2, nombre: 'Sector B', id_vereda: 1 },
      { id_sector: 3, nombre: 'Sector C', id_vereda: 2 },
      { id_sector: 4, nombre: 'Sector D', id_vereda: 2 },
      { id_sector: 5, nombre: 'Sector E', id_vereda: 3 }
    ]);

    // Insert initial data for celebraciones_personales
    await queryInterface.bulkInsert('celebraciones_personales', [
      { id_celebracion: 1, profesion: 'Cumpleaños', motivo: 'Celebración de nacimiento', fecha: '2024-01-15' },
      { id_celebracion: 2, profesion: 'Bautismo', motivo: 'Sacramento del bautismo', fecha: '2024-02-20' },
      { id_celebracion: 3, profesion: 'Primera Comunión', motivo: 'Primera comunión eucarística', fecha: '2024-05-12' },
      { id_celebracion: 4, profesion: 'Confirmación', motivo: 'Sacramento de la confirmación', fecha: '2024-06-15' },
      { id_celebracion: 5, profesion: 'Matrimonio', motivo: 'Sacramento del matrimonio', fecha: '2024-07-20' },
      { id_celebracion: 6, profesion: 'Graduación', motivo: 'Graduación académica', fecha: '2024-11-30' },
      { id_celebracion: 7, profesion: 'Santo', motivo: 'Día del santo patrono', fecha: '2024-12-08' }
    ]);

    // Insert initial data for celebraciones_familia
    await queryInterface.bulkInsert('celebraciones_familia', [
      { id_celebracion: 1, motivo: 'Aniversario de matrimonio', fecha: '2024-03-25' },
      { id_celebracion: 2, motivo: 'Celebración navideña familiar', fecha: '2024-12-25' },
      { id_celebracion: 3, motivo: 'Celebración de año nuevo', fecha: '2024-01-01' },
      { id_celebracion: 4, motivo: 'Reuniones especiales de familia', fecha: '2024-08-15' },
      { id_celebracion: 5, motivo: 'Bendición del hogar familiar', fecha: '2024-04-10' }
    ]);

    // Insert initial data for celebraciones_padre_madre
    await queryInterface.bulkInsert('celebraciones_padre_madre', [
      { id_celebracion: 1, nombre_evento: 'Día del Padre', fecha_celebracion: '2024-06-16' },
      { id_celebracion: 2, nombre_evento: 'Día de la Madre', fecha_celebracion: '2024-05-14' },
      { id_celebracion: 3, nombre_evento: 'Cumpleaños del Padre', fecha_celebracion: '2024-09-10' },
      { id_celebracion: 4, nombre_evento: 'Cumpleaños de la Madre', fecha_celebracion: '2024-07-25' }
    ]);

    // Insert initial data for necesidades_enfermo
    await queryInterface.bulkInsert('necesidades_enfermo', [
      { id_necesidad: 1, solicita_comunion: true, otras_necesidades: 'Medicamentos para hipertensión', fecha_registro: '2024-01-15' },
      { id_necesidad: 2, solicita_comunion: false, otras_necesidades: 'Terapia física y psicológica', fecha_registro: '2024-02-20' },
      { id_necesidad: 3, solicita_comunion: true, otras_necesidades: 'Atención médica especializada', fecha_registro: '2024-03-10' },
      { id_necesidad: 4, solicita_comunion: false, otras_necesidades: 'Apoyo y acompañamiento familiar', fecha_registro: '2024-04-05' },
      { id_necesidad: 5, solicita_comunion: true, otras_necesidades: 'Dieta y alimentación específica', fecha_registro: '2024-05-12' },
      { id_necesidad: 6, solicita_comunion: false, otras_necesidades: 'Equipos y dispositivos médicos', fecha_registro: '2024-06-18' },
      { id_necesidad: 7, solicita_comunion: true, otras_necesidades: 'Transporte para citas médicas', fecha_registro: '2024-07-22' }
    ]);
  },

  async down (queryInterface, Sequelize) {
    // Remove data in reverse order
    await queryInterface.bulkDelete('necesidades_enfermo', null, {});
    await queryInterface.bulkDelete('celebraciones_padre_madre', null, {});
    await queryInterface.bulkDelete('celebraciones_familia', null, {});
    await queryInterface.bulkDelete('celebraciones_personales', null, {});
    await queryInterface.bulkDelete('sector', null, {});
    await queryInterface.bulkDelete('veredas', null, {});
    await queryInterface.bulkDelete('municipios', null, {});
    await queryInterface.bulkDelete('enfermedades', null, {});
    await queryInterface.bulkDelete('areas_liderazgo', null, {});
    await queryInterface.bulkDelete('roles', null, {});
    await queryInterface.bulkDelete('destrezas', null, {});
    await queryInterface.bulkDelete('talla_vestimenta', null, {});
    await queryInterface.bulkDelete('comunidades_culturales', null, {});
    await queryInterface.bulkDelete('niveles_educativos', null, {});
    await queryInterface.bulkDelete('tipos_aguas_residuales', null, {});
    await queryInterface.bulkDelete('tipos_disposicion_basura', null, {});
    await queryInterface.bulkDelete('sistemas_acueducto', null, {});
    await queryInterface.bulkDelete('parentesco', null, {});
    await queryInterface.bulkDelete('parroquia', null, {});
    await queryInterface.bulkDelete('tipo_vivienda', null, {});
    await queryInterface.bulkDelete('sexo', null, {});
    await queryInterface.bulkDelete('estado_civil', null, {});
    await queryInterface.bulkDelete('tipo_identificacion', null, {});
  }
};
