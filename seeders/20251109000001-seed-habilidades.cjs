'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const habilidades = [
      { id_habilidad: 1, nombre: 'Liderazgo', descripcion: 'Capacidad de dirigir y motivar equipos', created_at: new Date(), updated_at: new Date() },
      { id_habilidad: 2, nombre: 'Comunicación', descripcion: 'Habilidad para transmitir ideas efectivamente', created_at: new Date(), updated_at: new Date() },
      { id_habilidad: 3, nombre: 'Trabajo en Equipo', descripcion: 'Capacidad de colaborar con otros', created_at: new Date(), updated_at: new Date() },
      { id_habilidad: 4, nombre: 'Resolución de Problemas', descripcion: 'Habilidad para encontrar soluciones', created_at: new Date(), updated_at: new Date() },
      { id_habilidad: 5, nombre: 'Pensamiento Crítico', descripcion: 'Capacidad de análisis y evaluación', created_at: new Date(), updated_at: new Date() },
      { id_habilidad: 6, nombre: 'Creatividad', descripcion: 'Habilidad para generar ideas innovadoras', created_at: new Date(), updated_at: new Date() },
      { id_habilidad: 7, nombre: 'Adaptabilidad', descripcion: 'Capacidad de ajustarse a cambios', created_at: new Date(), updated_at: new Date() },
      { id_habilidad: 8, nombre: 'Gestión del Tiempo', descripcion: 'Organización y priorización de tareas', created_at: new Date(), updated_at: new Date() },
      { id_habilidad: 9, nombre: 'Toma de Decisiones', descripcion: 'Capacidad para elegir opciones efectivas', created_at: new Date(), updated_at: new Date() },
      { id_habilidad: 10, nombre: 'Empatía', descripcion: 'Comprensión de emociones ajenas', created_at: new Date(), updated_at: new Date() },
      { id_habilidad: 11, nombre: 'Negociación', descripcion: 'Habilidad para llegar a acuerdos', created_at: new Date(), updated_at: new Date() },
      { id_habilidad: 12, nombre: 'Organización', descripcion: 'Capacidad de estructurar tareas y recursos', created_at: new Date(), updated_at: new Date() },
      { id_habilidad: 13, nombre: 'Atención al Detalle', descripcion: 'Precisión en la ejecución de tareas', created_at: new Date(), updated_at: new Date() },
      { id_habilidad: 14, nombre: 'Resiliencia', descripcion: 'Capacidad de recuperarse de adversidades', created_at: new Date(), updated_at: new Date() },
      { id_habilidad: 15, nombre: 'Persuasión', descripcion: 'Habilidad para influir en otros', created_at: new Date(), updated_at: new Date() }
    ];

    // Verificar si la tabla existe y tiene las columnas necesarias
    try {
      // Intentar insertar habilidades
      await queryInterface.bulkInsert('habilidades', habilidades, {
        ignoreDuplicates: true
      });
      console.log('✅ Habilidades insertadas correctamente');
    } catch (error) {
      console.error('⚠️ Error al insertar habilidades:', error.message);
      
      // Si la tabla no existe o falta alguna columna, intentar crearla
      if (error.message.includes('does not exist') || error.message.includes('column')) {
        console.log('📋 Intentando crear tabla habilidades...');
        try {
          await queryInterface.createTable('habilidades', {
            id_habilidad: {
              type: Sequelize.INTEGER,
              primaryKey: true,
              autoIncrement: true,
              allowNull: false
            },
            nombre: {
              type: Sequelize.STRING(100),
              allowNull: false,
              unique: true
            },
            descripcion: {
              type: Sequelize.TEXT,
              allowNull: true
            },
            created_at: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
          });
          
          // Volver a intentar insertar
          await queryInterface.bulkInsert('habilidades', habilidades, {
            ignoreDuplicates: true
          });
          console.log('✅ Tabla habilidades creada y datos insertados');
        } catch (createError) {
          console.error('❌ Error al crear tabla habilidades:', createError.message);
        }
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('habilidades', null, {});
  }
};
