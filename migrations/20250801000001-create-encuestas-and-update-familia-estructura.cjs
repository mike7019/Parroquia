'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Crear tabla encuestas
    await queryInterface.createTable('encuestas', {
      id_encuesta: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_parroquia: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'parroquias',
          key: 'id_parroquia',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      id_municipio: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'municipios',
          key: 'id_municipio',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Fecha en formato dia/mes/año'
      },
      id_sector: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'sector',
          key: 'id_sector',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      id_vereda: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'veredas',
          key: 'id_vereda',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      tratamiento_datos: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      firma: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Firma digital o ruta de imagen de firma'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // 2. Modificar tabla familias
    // Renombrar nombre_familia a apellido_familiar
    await queryInterface.renameColumn('familias', 'nombre_familia', 'apellido_familiar');
    
    // Añadir campo telefono
    await queryInterface.addColumn('familias', 'telefono', {
      type: Sequelize.STRING(20),
      allowNull: true,
    });
    
    // Eliminar tratamiento_datos de la tabla familia
    await queryInterface.removeColumn('familias', 'tratamiento_datos');
    
    // Eliminar el campo observaciones de familias
    await queryInterface.removeColumn('familias', 'observaciones');

    // 3. Crear tabla intermedia familia-vivienda (muchos a muchos)
    await queryInterface.createTable('familia_tipo_vivienda', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_familia: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'familias',
          key: 'id_familia',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_tipo_vivienda: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'tipo_viviendas',
          key: 'id_tipo_vivienda',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Agregar índices únicos para evitar duplicados
    await queryInterface.addIndex('familia_tipo_vivienda', ['id_familia', 'id_tipo_vivienda'], {
      unique: true,
      name: 'unique_familia_tipo_vivienda'
    });

    // 4. Crear tabla intermedia familia-basura (muchos a muchos)
    await queryInterface.createTable('familia_disposicion_basura', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_familia: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'familias',
          key: 'id_familia',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_tipo_disposicion_basura: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'tipos_disposicion_basura',
          key: 'id_tipos_disposicion_basura',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('familia_disposicion_basura', ['id_familia', 'id_tipo_disposicion_basura'], {
      unique: true,
      name: 'unique_familia_disposicion_basura'
    });

    // 5. Crear tabla intermedia familia-acueducto (muchos a muchos)
    await queryInterface.createTable('familia_sistema_acueducto', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_familia: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'familias',
          key: 'id_familia',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_sistema_acueducto: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'sistemas_acueducto',
          key: 'id_sistemas_acueducto',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('familia_sistema_acueducto', ['id_familia', 'id_sistema_acueducto'], {
      unique: true,
      name: 'unique_familia_sistema_acueducto'
    });

    // 6. Crear tabla intermedia familia-aguas residuales (muchos a muchos)
    await queryInterface.createTable('familia_tipo_aguas_residuales', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_familia: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'familias',
          key: 'id_familia',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_tipo_aguas_residuales: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'tipos_aguas_residuales',
          key: 'id_tipos_aguas_residuales',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('familia_tipo_aguas_residuales', ['id_familia', 'id_tipo_aguas_residuales'], {
      unique: true,
      name: 'unique_familia_tipo_aguas_residuales'
    });

    // 7. Añadir campos a la tabla personas
    await queryInterface.addColumn('personas', 'camisa', {
      type: Sequelize.STRING(10),
      allowNull: true,
    });

    await queryInterface.addColumn('personas', 'blusa', {
      type: Sequelize.STRING(10),
      allowNull: true,
    });

    await queryInterface.addColumn('personas', 'pantalon', {
      type: Sequelize.STRING(10),
      allowNull: true,
    });

    await queryInterface.addColumn('personas', 'calzado', {
      type: Sequelize.STRING(10),
      allowNull: true,
    });

    await queryInterface.addColumn('personas', 'estudios', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('personas', 'en_que_eres_lider', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('personas', 'habilidad_destreza', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('personas', 'necesidad_enfermo', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // 8. Crear tabla enfermedades si no existe o modificar la existente
    const existingEnfermedadesTable = await queryInterface.describeTable('enfermedades');
    if (!existingEnfermedadesTable) {
      await queryInterface.createTable('enfermedades', {
        id_enfermedad: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        nombre: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        descripcion: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
      });
    } else {
      // La tabla existe, verificar si necesitamos añadir campos
      if (!existingEnfermedadesTable.descripcion) {
        await queryInterface.addColumn('enfermedades', 'descripcion', {
          type: Sequelize.TEXT,
          allowNull: true,
        });
      }
      if (!existingEnfermedadesTable.createdAt) {
        await queryInterface.addColumn('enfermedades', 'createdAt', {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        });
      }
      if (!existingEnfermedadesTable.updatedAt) {
        await queryInterface.addColumn('enfermedades', 'updatedAt', {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        });
      }
    }

    // 9. Crear tabla intermedia persona-enfermedad (muchos a muchos)
    await queryInterface.createTable('persona_enfermedad', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_persona: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'personas',
          key: 'id_personas',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_enfermedad: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'enfermedades',
          key: 'id_enfermedades', // Usar la clave existente
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      fecha_diagnostico: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      notas: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('persona_enfermedad', ['id_persona', 'id_enfermedad'], {
      unique: true,
      name: 'unique_persona_enfermedad'
    });

    // 10. Crear tabla profesiones si no existe
    await queryInterface.createTable('profesiones', {
      id_profesion: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      categoria: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // 11. Añadir campo id_profesion a la tabla personas
    await queryInterface.addColumn('personas', 'id_profesion', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'profesiones',
        key: 'id_profesion',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    // Rollback en orden inverso
    
    // Eliminar campo id_profesion de personas
    await queryInterface.removeColumn('personas', 'id_profesion');
    
    // Eliminar tabla profesiones
    await queryInterface.dropTable('profesiones');
    
    // Eliminar tabla intermedia persona_enfermedad
    await queryInterface.dropTable('persona_enfermedad');
    
    // Eliminar tabla enfermedades
    await queryInterface.dropTable('enfermedades');
    
    // Eliminar campos añadidos a personas
    await queryInterface.removeColumn('personas', 'necesidad_enfermo');
    await queryInterface.removeColumn('personas', 'habilidad_destreza');
    await queryInterface.removeColumn('personas', 'en_que_eres_lider');
    await queryInterface.removeColumn('personas', 'estudios');
    await queryInterface.removeColumn('personas', 'calzado');
    await queryInterface.removeColumn('personas', 'pantalon');
    await queryInterface.removeColumn('personas', 'blusa');
    await queryInterface.removeColumn('personas', 'camisa');
    
    // Eliminar tablas intermedias
    await queryInterface.dropTable('familia_tipo_aguas_residuales');
    await queryInterface.dropTable('familia_sistema_acueducto');
    await queryInterface.dropTable('familia_disposicion_basura');
    await queryInterface.dropTable('familia_tipo_vivienda');
    
    // Restaurar campos eliminados de familias
    await queryInterface.addColumn('familias', 'observaciones', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    
    await queryInterface.addColumn('familias', 'tratamiento_datos', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    
    // Eliminar campo telefono de familias
    await queryInterface.removeColumn('familias', 'telefono');
    
    // Renombrar apellido_familiar de vuelta a nombre_familia
    await queryInterface.renameColumn('familias', 'apellido_familiar', 'nombre_familia');
    
    // Eliminar tabla encuestas
    await queryInterface.dropTable('encuestas');
  }
};
