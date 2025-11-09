import { DataTypes } from 'sequelize';

/**
 * Migración: Crear tabla persona_celebracion
 * 
 * Esta tabla almacena las celebraciones de cada persona
 * (cumpleaños, aniversarios, días especiales, etc.)
 */

export async function up(queryInterface, Sequelize) {
  console.log('🎉 Creando tabla persona_celebracion...');

  await queryInterface.createTable('persona_celebracion', {
    id_persona_celebracion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: 'ID único de la celebración'
    },
    id_personas: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'personas',
        key: 'id_personas'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      comment: 'FK a la tabla personas'
    },
    motivo: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Motivo de la celebración (Cumpleaños, Aniversario, etc.)'
    },
    dia: {
      type: DataTypes.STRING(2),
      allowNull: false,
      comment: 'Día del mes (1-31)'
    },
    mes: {
      type: DataTypes.STRING(2),
      allowNull: false,
      comment: 'Mes del año (1-12)'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('NOW()')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('NOW()')
    }
  }, {
    comment: 'Celebraciones asociadas a cada persona'
  });

  console.log('📊 Creando índice único persona_celebracion...');
  
  // Índice único para evitar duplicados
  await queryInterface.addIndex('persona_celebracion', 
    ['id_personas', 'motivo', 'dia', 'mes'], 
    {
      unique: true,
      name: 'unique_persona_celebracion',
      fields: ['id_personas', 'motivo', 'dia', 'mes']
    }
  );

  console.log('📊 Creando índices de búsqueda...');

  // Índice para búsquedas por persona
  await queryInterface.addIndex('persona_celebracion', 
    ['id_personas'], 
    {
      name: 'idx_persona_celebracion_persona'
    }
  );

  // Índice para búsquedas por mes (útil para reportes mensuales)
  await queryInterface.addIndex('persona_celebracion', 
    ['mes'], 
    {
      name: 'idx_persona_celebracion_mes'
    }
  );

  // Índice para búsquedas por fecha completa
  await queryInterface.addIndex('persona_celebracion', 
    ['dia', 'mes'], 
    {
      name: 'idx_persona_celebracion_fecha'
    }
  );

  console.log('✅ Tabla persona_celebracion creada exitosamente con todos los índices');
}

export async function down(queryInterface, Sequelize) {
  console.log('🗑️ Eliminando tabla persona_celebracion...');
  
  await queryInterface.dropTable('persona_celebracion');
  
  console.log('✅ Tabla persona_celebracion eliminada');
}
