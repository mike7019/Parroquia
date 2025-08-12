import sequelize from './config/sequelize.js';
import { loadAllModels } from './syncDatabaseComplete.js';

/**
 * Script para sincronizar el modelo de TipoVivienda con la base de datos
 */
async function syncTipoViviendaModel() {
  try {
    console.log('🔄 Iniciando sincronización del modelo TipoVivienda...');
    
    // Conectar a la base de datos
    console.log('📡 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida exitosamente');
    
    // Cargar todos los modelos
    console.log('📦 Cargando todos los modelos...');
    await loadAllModels();
    console.log('✅ Modelos cargados exitosamente');
    
    // Verificar que el modelo TipoVivienda esté disponible
    if (!sequelize.models.TipoVivienda) {
      throw new Error('Modelo TipoVivienda no encontrado en sequelize.models');
    }
    
    // Sincronizar solo la tabla de tipos de vivienda
    console.log('🔄 Sincronizando tabla tipos_vivienda...');
    await sequelize.models.TipoVivienda.sync({ alter: true });
    console.log('✅ Tabla tipos_vivienda sincronizada exitosamente');
    
    // Mostrar información de la tabla
    const tableInfo = await sequelize.getQueryInterface().describeTable('tipos_vivienda');
    console.log('📋 Estructura de la tabla tipos_vivienda:');
    console.table(tableInfo);
    
    // Verificar datos existentes
    const count = await sequelize.models.TipoVivienda.count();
    console.log(`📊 Total de registros existentes: ${count}`);
    
    if (count === 0) {
      console.log('📝 Insertando datos de ejemplo...');
      
      const tiposViviendaEjemplo = [
        { 
          nombre: 'Casa Propia', 
          descripcion: 'Vivienda de propiedad de la familia',
          activo: true
        },
        { 
          nombre: 'Casa Arrendada', 
          descripcion: 'Vivienda alquilada o en arriendo',
          activo: true
        },
        { 
          nombre: 'Casa Familiar', 
          descripcion: 'Vivienda cedida por familiares',
          activo: true
        },
        { 
          nombre: 'Apartamento Propio', 
          descripcion: 'Apartamento de propiedad de la familia',
          activo: true
        },
        { 
          nombre: 'Apartamento Arrendado', 
          descripcion: 'Apartamento alquilado o en arriendo',
          activo: true
        },
        { 
          nombre: 'Cuarto', 
          descripcion: 'Habitación o cuarto en vivienda compartida',
          activo: true
        },
        { 
          nombre: 'Rancho o Choza', 
          descripcion: 'Vivienda rural de construcción sencilla',
          activo: true
        },
        { 
          nombre: 'Casa Lote', 
          descripcion: 'Vivienda en lote o terreno propio',
          activo: true
        },
        { 
          nombre: 'Vivienda de Interés Social', 
          descripcion: 'Vivienda subsidiada por el gobierno',
          activo: true
        },
        { 
          nombre: 'Otro', 
          descripcion: 'Otro tipo de vivienda no especificado',
          activo: true
        }
      ];
      
      await sequelize.models.TipoVivienda.bulkCreate(tiposViviendaEjemplo);
      console.log(`✅ Se insertaron ${tiposViviendaEjemplo.length} registros de ejemplo`);
      
      // Mostrar los registros insertados
      const tipos = await sequelize.models.TipoVivienda.findAll({
        order: [['nombre', 'ASC']]
      });
      
      console.log('\n📋 Tipos de Vivienda insertados:');
      tipos.forEach((tipo, index) => {
        console.log(`   ${index + 1}. ${tipo.nombre}`);
        if (tipo.descripcion) {
          console.log(`      📝 ${tipo.descripcion}`);
        }
      });
    } else {
      console.log(`ℹ️  La tabla ya contiene ${count} registros`);
      
      // Mostrar algunos registros existentes
      const tiposExistentes = await sequelize.models.TipoVivienda.findAll({
        limit: 5,
        order: [['nombre', 'ASC']]
      });
      
      console.log('\n📋 Primeros 5 tipos de vivienda existentes:');
      tiposExistentes.forEach((tipo, index) => {
        console.log(`   ${index + 1}. ${tipo.nombre} (Activo: ${tipo.activo})`);
      });
    }
    
    // Probar una consulta con ordenamiento para verificar que funciona
    console.log('\n🧪 Probando consulta con ordenamiento...');
    const tiposTest = await sequelize.models.TipoVivienda.findAll({
      order: [['nombre', 'ASC']],
      limit: 3
    });
    
    console.log('✅ Consulta con ordenamiento exitosa');
    console.log('   Resultados:');
    tiposTest.forEach((tipo, index) => {
      console.log(`   ${index + 1}. ${tipo.nombre}`);
    });
    
    console.log('\n🎉 Sincronización completada exitosamente');
    console.log('\n📚 Endpoints disponibles para pruebas:');
    console.log('   • GET    /api/catalog/tipos-vivienda - Listar tipos de vivienda');
    console.log('   • GET    /api/catalog/tipos-vivienda/stats - Obtener estadísticas');
    console.log('   • GET    /api/catalog/tipos-vivienda/:id - Obtener tipo por ID');
    console.log('   • POST   /api/catalog/tipos-vivienda - Crear nuevo tipo');
    console.log('   • PUT    /api/catalog/tipos-vivienda/:id - Actualizar tipo');
    console.log('   • DELETE /api/catalog/tipos-vivienda/:id - Eliminar tipo');
    
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    // Cerrar la conexión
    console.log('\n🔄 Cerrando conexión a la base de datos...');
    await sequelize.close();
    console.log('✅ Conexión cerrada');
  }
}

// Ejecutar la sincronización
syncTipoViviendaModel();
