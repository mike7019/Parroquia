'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si ya existen registros en la tabla personas
    const [results] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM personas"
    );

    // Solo insertar si no hay registros existentes
    if (results[0].count === 0) {
      // Obtener familias existentes
      const [familias] = await queryInterface.sequelize.query(
        "SELECT id_familia, tamaño_familia FROM familias"
      );

      // Obtener catálogos necesarios
      const [tiposIdentificacion] = await queryInterface.sequelize.query(
        "SELECT id_tipo_identificacion FROM tipos_identificacion"
      );
      
      const [estadosCiviles] = await queryInterface.sequelize.query(
        "SELECT id_estado_civil FROM estados_civiles"
      );
      
      const [sexos] = await queryInterface.sequelize.query(
        "SELECT id_sexo FROM sexos"
      );

      const nombres = {
        masculinos: [
          'Carlos', 'José', 'Luis', 'Miguel', 'Juan', 'Antonio', 'Francisco', 
          'Manuel', 'Rafael', 'Pedro', 'Alejandro', 'Diego', 'Daniel', 'Jorge',
          'Ricardo', 'Fernando', 'Roberto', 'Eduardo', 'Andrés', 'Gabriel',
          'Santiago', 'Sebastián', 'Nicolás', 'Mateo', 'Samuel', 'David'
        ],
        femeninos: [
          'María', 'Carmen', 'Ana', 'Isabel', 'Rosa', 'Josefa', 'Antonia',
          'Dolores', 'Pilar', 'Teresa', 'Ángeles', 'Concepción', 'Francisca',
          'Laura', 'Cristina', 'Marta', 'Mercedes', 'Julia', 'Lucía', 'Elena',
          'Sofía', 'Valentina', 'Isabella', 'Camila', 'Valeria', 'Natalia'
        ]
      };

      const apellidos = [
        'Rodríguez', 'García', 'Martínez', 'López', 'González', 'Hernández',
        'Pérez', 'Sánchez', 'Ramírez', 'Cruz', 'Flores', 'Gómez', 'Díaz',
        'Reyes', 'Morales', 'Jiménez', 'Guerrero', 'Medina', 'Rojas', 'Vargas',
        'Castillo', 'Castro', 'Ortiz', 'Rubio', 'Marín', 'Iglesias', 'Santos',
        'Torres', 'Aguilar', 'Mendoza', 'Ruiz', 'Vega', 'Molina', 'Delgado'
      ];

      const estudios = [
        'Primaria Completa', 'Bachillerato Completo', 'Técnico', 'Tecnólogo',
        'Universitario', 'Especialización', 'Maestría', 'Sin Estudios Formales'
      ];

      const liderazgos = [
        'Líder Comunitario', 'Líder Religioso', 'Líder Deportivo', 
        'Líder Juvenil', 'Líder de Mujeres', 'Líder Ambiental',
        'Líder de Padres de Familia', 'No ejerce liderazgo'
      ];

      const personasData = [];
      let identificacionCounter = 10000000;

      // Generar personas para cada familia
      for (const familia of familias) {
        const tamañoFamilia = familia.tamaño_familia;
        
        // Generar miembros de la familia
        for (let i = 0; i < tamañoFamilia; i++) {
          const esMasculino = Math.random() > 0.5;
          const sexo = sexos.find(s => s.id_sexo === (esMasculino ? 1 : 2)) || sexos[0];
          const nombresDisponibles = esMasculino ? nombres.masculinos : nombres.femeninos;
          
          const primerNombre = nombresDisponibles[Math.floor(Math.random() * nombresDisponibles.length)];
          const segundoNombre = Math.random() > 0.6 ? nombresDisponibles[Math.floor(Math.random() * nombresDisponibles.length)] : null;
          const primerApellido = apellidos[Math.floor(Math.random() * apellidos.length)];
          const segundoApellido = Math.random() > 0.3 ? apellidos[Math.floor(Math.random() * apellidos.length)] : null;
          
          const edad = i === 0 ? Math.floor(Math.random() * 40) + 25 : // Primer miembro (jefe de familia)
                       i === 1 ? Math.floor(Math.random() * 35) + 20 : // Segundo miembro (cónyuge)
                       Math.floor(Math.random() * 60) + 1; // Otros miembros
          
          const fechaNacimiento = new Date();
          fechaNacimiento.setFullYear(fechaNacimiento.getFullYear() - edad);
          fechaNacimiento.setMonth(Math.floor(Math.random() * 12));
          fechaNacimiento.setDate(Math.floor(Math.random() * 28) + 1);

          const tipoId = tiposIdentificacion[Math.floor(Math.random() * tiposIdentificacion.length)];
          const estadoCivil = estadosCiviles[Math.floor(Math.random() * estadosCiviles.length)];
          
          personasData.push({
            primer_nombre: primerNombre,
            segundo_nombre: segundoNombre,
            primer_apellido: primerApellido,
            segundo_apellido: segundoApellido,
            id_tipo_identificacion_tipo_identificacion: tipoId.id_tipo_identificacion,
            identificacion: String(identificacionCounter++),
            telefono: `300${Math.floor(Math.random() * 9000000) + 1000000}`,
            correo_electronico: `${primerNombre.toLowerCase()}.${primerApellido.toLowerCase()}${identificacionCounter}@email.com`,
            fecha_nacimiento: fechaNacimiento.toISOString().split('T')[0],
            direccion: `Calle ${Math.floor(Math.random() * 100) + 1} # ${Math.floor(Math.random() * 50) + 1}-${Math.floor(Math.random() * 99) + 1}`,
            id_familia_familias: familia.id_familia,
            id_estado_civil_estado_civil: estadoCivil.id_estado_civil,
            estudios: estudios[Math.floor(Math.random() * estudios.length)],
            en_que_eres_lider: Math.random() > 0.6 ? liderazgos[Math.floor(Math.random() * liderazgos.length)] : null,
            necesidad_enfermo: Math.random() > 0.8 ? 'Requiere atención médica especializada' : null,
            id_profesion: null, // Se llenará cuando tengamos datos de profesiones
            id_sexo: sexo.id_sexo,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }

      // Insertar en lotes para evitar problemas de memoria
      const batchSize = 50;
      for (let i = 0; i < personasData.length; i += batchSize) {
        const batch = personasData.slice(i, i + batchSize);
        await queryInterface.bulkInsert('personas', batch, {});
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('personas', null, {});
  }
};
