/**
 * Script para sincronizar el modelo Estudio con la tabla niveles_educativos existente
 * Este script verifica y actualiza la estructura de la tabla según el modelo
 */

import sequelize from './config/sequelize.js';
import Estudio from './src/models/catalog/Estudio.js';

async function syncEstudioModel() {
  try {
    console.log('🔄 Iniciando sincronización del modelo Estudio...');

    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Verificar si la tabla existe
    const tableExists = await sequelize.getQueryInterface().showAllTables()
      .then(tables => tables.includes('niveles_educativos'));

    if (!tableExists) {
      console.log('❌ La tabla niveles_educativos no existe');
      console.log('🔨 Creando tabla niveles_educativos...');
      
      // Crear la tabla con la estructura completa
      await sequelize.getQueryInterface().createTable('niveles_educativos', {
        id_niveles_educativos: {
          type: sequelize.Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        nivel: {
          type: sequelize.Sequelize.STRING(100),
          allowNull: false,
          unique: true
        },
        descripcion: {
          type: sequelize.Sequelize.TEXT,
          allowNull: true
        },
        orden_nivel: {
          type: sequelize.Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0
        },
        activo: {
          type: sequelize.Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        createdAt: {
          type: sequelize.Sequelize.DATE,
          allowNull: false,
          defaultValue: sequelize.Sequelize.NOW
        },
        updatedAt: {
          type: sequelize.Sequelize.DATE,
          allowNull: false,
          defaultValue: sequelize.Sequelize.NOW
        },
        deletedAt: {
          type: sequelize.Sequelize.DATE,
          allowNull: true
        }
      });
      
      console.log('✅ Tabla niveles_educativos creada exitosamente');
      
      // Crear índices adicionales
      await sequelize.getQueryInterface().addIndex('niveles_educativos', ['nivel'], {
        name: 'idx_niveles_educativos_nivel'
      });
      await sequelize.getQueryInterface().addIndex('niveles_educativos', ['activo'], {
        name: 'idx_niveles_educativos_activo'
      });
      await sequelize.getQueryInterface().addIndex('niveles_educativos', ['orden_nivel'], {
        name: 'idx_niveles_educativos_orden'
      });
      
      console.log('✅ Índices creados exitosamente');
      
      // No necesitamos continuar con las verificaciones ya que la tabla es nueva
      console.log('🔄 Sincronizando modelo con tabla recién creada...');
      await Estudio.sync({ alter: false });
      console.log('✅ Modelo sincronizado exitosamente');
      return;
    }

    console.log('✅ Tabla niveles_educativos encontrada');

    // Describir la estructura actual de la tabla
    console.log('📋 Estructura actual de la tabla:');
    const tableDescription = await sequelize.getQueryInterface().describeTable('niveles_educativos');
    console.log(JSON.stringify(tableDescription, null, 2));

    // Verificar si necesita agregar la columna 'activo'
    if (!tableDescription.activo) {
      console.log('🔧 Agregando columna activo...');
      await sequelize.getQueryInterface().addColumn('niveles_educativos', 'activo', {
        type: sequelize.Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      });
      console.log('✅ Columna activo agregada');
    }

    // Verificar si necesita agregar columnas de timestamp
    if (!tableDescription.createdAt) {
      console.log('🔧 Agregando columna createdAt...');
      await sequelize.getQueryInterface().addColumn('niveles_educativos', 'createdAt', {
        type: sequelize.Sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.Sequelize.NOW
      });
      console.log('✅ Columna createdAt agregada');
    }

    if (!tableDescription.updatedAt) {
      console.log('🔧 Agregando columna updatedAt...');
      await sequelize.getQueryInterface().addColumn('niveles_educativos', 'updatedAt', {
        type: sequelize.Sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.Sequelize.NOW
      });
      console.log('✅ Columna updatedAt agregada');
    }

    if (!tableDescription.deletedAt) {
      console.log('🔧 Agregando columna deletedAt...');
      await sequelize.getQueryInterface().addColumn('niveles_educativos', 'deletedAt', {
        type: sequelize.Sequelize.DATE,
        allowNull: true
      });
      console.log('✅ Columna deletedAt agregada');
    }

    // Sincronizar el modelo (alter: true para no eliminar datos)
    console.log('🔄 Sincronizando modelo con la tabla...');
    await Estudio.sync({ alter: true });
    console.log('✅ Modelo Estudio sincronizado correctamente');

    // Verificar registros existentes
    const count = await Estudio.count();
    console.log(`📊 Registros existentes en la tabla: ${count}`);

    // Actualizar registros existentes para establecer valores por defecto
    if (count > 0) {
      console.log('🔧 Actualizando registros existentes...');
      
      // Actualizar activo = true para registros que no lo tengan
      const updated = await Estudio.update(
        { 
          activo: true,
          updatedAt: new Date()
        },
        { 
          where: { activo: null },
          paranoid: false
        }
      );
      
      console.log(`✅ ${updated[0]} registros actualizados`);
    }

    // Mostrar algunos registros de ejemplo
    console.log('📋 Primeros 5 registros:');
    const estudios = await Estudio.findAll({ 
      limit: 5,
      order: [['ordenNivel', 'ASC'], ['nivel', 'ASC']]
    });
    
    estudios.forEach(estudio => {
      console.log(`  - ${estudio.id}: ${estudio.nivel} (Orden: ${estudio.ordenNivel})`);
    });

    console.log('🎉 Sincronización del modelo Estudio completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar si es llamado directamente
const isMainModule = process.argv[1].endsWith('sync-estudio-model.js');
if (isMainModule) {
  syncEstudioModel()
    .then(() => {
      console.log('✅ Script ejecutado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script:', error);
      process.exit(1);
    });
}

export default syncEstudioModel;
