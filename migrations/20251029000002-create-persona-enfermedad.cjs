'use strict';

/**
 * Migración para crear la tabla persona_enfermedad
 * Permite almacenar múltiples enfermedades por persona con relación al catálogo
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Primero verificar si existe la tabla de catálogo de enfermedades
    // Si no existe, crearla
    const tables = await queryInterface.showAllTables();
    
    if (!tables.includes('enfermedades')) {
      console.log('📋 Creando tabla catálogo enfermedades...');
      await queryInterface.createTable('enfermedades', {
        id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        nombre: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true,
          comment: 'Nombre de la enfermedad'
        },
        descripcion: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Descripción opcional de la enfermedad'
        },
        activo: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          comment: 'Indica si la enfermedad está activa en el catálogo'
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

      // Crear índice para nombre
      await queryInterface.addIndex('enfermedades', ['nombre'], {
        name: 'idx_enfermedades_nombre'
      });

      // Insertar enfermedades comunes
      await queryInterface.bulkInsert('enfermedades', [
        { nombre: 'Diabetes', descripcion: 'Enfermedad crónica que afecta el procesamiento de glucosa', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Hipertensión', descripcion: 'Presión arterial alta', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Artritis', descripcion: 'Inflamación de las articulaciones', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Obesidad', descripcion: 'Exceso de grasa corporal', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Asma', descripcion: 'Enfermedad respiratoria crónica', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Cardiopatía', descripcion: 'Enfermedad del corazón', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Enfermedad Renal', descripcion: 'Problemas en los riñones', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Depresión', descripcion: 'Trastorno del estado de ánimo', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Ansiedad', descripcion: 'Trastorno de ansiedad', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Discapacidad Física', descripcion: 'Limitación física permanente', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Discapacidad Cognitiva', descripcion: 'Limitación cognitiva o intelectual', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Cáncer', descripcion: 'Enfermedad oncológica', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Epilepsia', descripcion: 'Trastorno neurológico', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Otra', descripcion: 'Otra enfermedad no especificada', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Ninguna', descripcion: 'Sin enfermedades', created_at: new Date(), updated_at: new Date() }
      ]);

      console.log('✅ Tabla enfermedades creada y poblada');
    }

    // Verificar si persona_enfermedad ya existe
    if (tables.includes('persona_enfermedad')) {
      console.log('⚠️  Tabla persona_enfermedad ya existe, actualizando estructura...');
      
      // Agregar columna id si no existe
      try {
        await queryInterface.addColumn('persona_enfermedad', 'id', {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        });
        console.log('  ✅ Columna id agregada');
      } catch (error) {
        console.log('  ℹ️ Columna id ya existe o error:', error.message);
      }
      
      // Agregar columnas nuevas
      try {
        await queryInterface.addColumn('persona_enfermedad', 'diagnostico_fecha', {
          type: Sequelize.DATE,
          allowNull: true
        });
        console.log('  ✅ Columna diagnostico_fecha agregada');
      } catch (error) {
        console.log('  ℹ️ Columna diagnostico_fecha ya existe');
      }
      
      try {
        await queryInterface.addColumn('persona_enfermedad', 'notas', {
          type: Sequelize.TEXT,
          allowNull: true
        });
        console.log('  ✅ Columna notas agregada');
      } catch (error) {
        console.log('  ℹ️ Columna notas ya existe');
      }
      
      try {
        await queryInterface.addColumn('persona_enfermedad', 'activo', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        });
        console.log('  ✅ Columna activo agregada');
      } catch (error) {
        console.log('  ℹ️ Columna activo ya existe');
      }
      
      // Renombrar columnas si es necesario
      try {
        await queryInterface.renameColumn('persona_enfermedad', 'createdAt', 'created_at');
        console.log('  ✅ Columna createdAt renombrada a created_at');
      } catch (error) {
        console.log('  ℹ️ Columna created_at ya existe o error:', error.message);
      }
      
      try {
        await queryInterface.renameColumn('persona_enfermedad', 'updatedAt', 'updated_at');
        console.log('  ✅ Columna updatedAt renombrada a updated_at');
      } catch (error) {
        console.log('  ℹ️ Columna updated_at ya existe o error:', error.message);
      }
      
    } else {
      // Crear tabla persona_enfermedad desde cero
      await queryInterface.createTable('persona_enfermedad', {
        id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        id_persona: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'personas',
            key: 'id_personas'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          comment: 'Referencia a la persona que tiene la enfermedad'
        },
        id_enfermedad: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'enfermedades',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
          comment: 'Referencia al catálogo de enfermedades'
        },
        diagnostico_fecha: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Fecha del diagnóstico (opcional)'
        },
        notas: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Notas adicionales sobre la enfermedad'
        },
        activo: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          comment: 'Indica si la enfermedad sigue activa'
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
    }

    // Crear índice compuesto para evitar duplicados (si no existe)
    try {
      await queryInterface.addConstraint('persona_enfermedad', {
        fields: ['id_persona', 'id_enfermedad'],
        type: 'unique',
        name: 'unique_persona_enfermedad'
      });
      console.log('✅ Constraint unique_persona_enfermedad creado');
    } catch (error) {
      console.log('ℹ️ Constraint unique_persona_enfermedad ya existe');
    }

    // Crear índices para optimizar búsquedas
    try {
      await queryInterface.addIndex('persona_enfermedad', ['id_persona'], {
        name: 'idx_persona_enfermedad_persona'
      });
    } catch (error) {
      console.log('ℹ️ Índice idx_persona_enfermedad_persona ya existe');
    }

    try {
      await queryInterface.addIndex('persona_enfermedad', ['id_enfermedad'], {
        name: 'idx_persona_enfermedad_enfermedad'
      });
    } catch (error) {
      console.log('ℹ️ Índice idx_persona_enfermedad_enfermedad ya existe');
    }

    try {
      await queryInterface.addIndex('persona_enfermedad', ['activo'], {
        name: 'idx_persona_enfermedad_activo'
      });
    } catch (error) {
      console.log('ℹ️ Índice idx_persona_enfermedad_activo ya existe');
    }

    console.log('✅ Tabla persona_enfermedad lista');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('persona_enfermedad');
    console.log('✅ Tabla persona_enfermedad eliminada');
    
    // Opcionalmente eliminar tabla enfermedades si se creó en esta migración
    const tables = await queryInterface.showAllTables();
    if (tables.includes('enfermedades')) {
      // Comentado para no eliminar el catálogo en rollback
      // await queryInterface.dropTable('enfermedades');
      console.log('⚠️  Tabla enfermedades NO eliminada (catálogo preservado)');
    }
  }
};
