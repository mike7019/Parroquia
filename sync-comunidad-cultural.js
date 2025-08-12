import sequelize from './config/sequelize.js';
import { loadAllModels } from './syncDatabaseComplete.js';

/**
 * Script para sincronizar el modelo de ComunidadCultural con la base de datos
 */
async function syncComunidadCulturalModel() {
  try {
    console.log('🔄 Iniciando sincronización del modelo ComunidadCultural...');
    
    // Conectar a la base de datos
    console.log('📡 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida exitosamente');
    
    // Cargar todos los modelos
    console.log('📦 Cargando todos los modelos...');
    await loadAllModels();
    console.log('✅ Modelos cargados exitosamente');
    
    // Sincronizar solo la tabla de comunidades culturales
    console.log('🔄 Sincronizando tabla comunidades_culturales...');
    await sequelize.models.ComunidadCultural.sync({ alter: true });
    console.log('✅ Tabla comunidades_culturales sincronizada exitosamente');
    
    // Mostrar información de la tabla creada
    const tableInfo = await sequelize.getQueryInterface().describeTable('comunidades_culturales');
    console.log('📋 Estructura de la tabla comunidades_culturales:');
    console.table(tableInfo);
    
    // Insertar datos de ejemplo si la tabla está vacía
    const count = await sequelize.models.ComunidadCultural.count();
    if (count === 0) {
      console.log('📝 Insertando datos de ejemplo...');
      
      const comunidadesCulturalesEjemplo = [
        { 
          nombre: 'Afrodescendiente', 
          descripcion: 'Comunidad de personas descendientes de africanos que conservan tradiciones y cultura africana'
        },
        { 
          nombre: 'Indígena', 
          descripcion: 'Pueblos originarios que mantienen sus tradiciones ancestrales y estructura social propia'
        },
        { 
          nombre: 'Mestizo', 
          descripcion: 'Población resultado del mestizaje entre diferentes grupos étnicos'
        },
        { 
          nombre: 'Raizal', 
          descripcion: 'Grupo étnico del Archipiélago de San Andrés, Providencia y Santa Catalina'
        },
        { 
          nombre: 'Palenquero', 
          descripcion: 'Comunidad descendiente de cimarrones de San Basilio de Palenque'
        },
        { 
          nombre: 'Gitano - ROM', 
          descripcion: 'Pueblo nómada con tradiciones culturales específicas y lengua propia'
        },
        { 
          nombre: 'Campesino', 
          descripcion: 'Comunidad rural dedicada principalmente a actividades agropecuarias'
        },
        { 
          nombre: 'Wayuu', 
          descripcion: 'Pueblo indígena de La Guajira que mantiene sus tradiciones y organización social'
        },
        { 
          nombre: 'Embera', 
          descripcion: 'Pueblo indígena que habita principalmente en las regiones del Chocó y Antioquia'
        },
        { 
          nombre: 'Nasa', 
          descripcion: 'Pueblo indígena del Cauca que conserva su idioma y tradiciones ancestrales'
        },
        { 
          nombre: 'Zenú', 
          descripcion: 'Pueblo indígena de las sabanas de Córdoba, Sucre y Bolívar'
        },
        { 
          nombre: 'Arhuaco', 
          descripcion: 'Pueblo indígena de la Sierra Nevada de Santa Marta con profundas tradiciones espirituales'
        },
        { 
          nombre: 'Kogi', 
          descripcion: 'Pueblo indígena hermano mayor de la Sierra Nevada de Santa Marta'
        },
        { 
          nombre: 'Wiwa', 
          descripcion: 'Pueblo indígena de la Sierra Nevada conocido por su sabiduría ancestral'
        },
        { 
          nombre: 'Inga', 
          descripcion: 'Pueblo indígena del sur del país, principalmente en Putumayo y Nariño'
        },
        { 
          nombre: 'Guambiano', 
          descripcion: 'Pueblo indígena del Cauca conocido por sus tejidos y tradiciones'
        },
        { 
          nombre: 'Tikuna', 
          descripcion: 'Pueblo indígena de la Amazonía colombiana'
        },
        { 
          nombre: 'Cofán', 
          descripcion: 'Pueblo indígena de la región amazónica'
        },
        { 
          nombre: 'Urbano', 
          descripcion: 'Población que ha desarrollado cultura propia de las ciudades'
        },
        { 
          nombre: 'Ninguna', 
          descripcion: 'No se identifica con ninguna comunidad cultural específica'
        }
      ];
      
      await sequelize.models.ComunidadCultural.bulkCreate(comunidadesCulturalesEjemplo);
      console.log(`✅ Se insertaron ${comunidadesCulturalesEjemplo.length} registros de ejemplo`);
      
      // Mostrar los registros insertados
      const comunidades = await sequelize.models.ComunidadCultural.findAll({
        order: [['nombre', 'ASC']]
      });
      
      console.log('\n📋 Comunidades Culturales insertadas:');
      comunidades.forEach((comunidad, index) => {
        console.log(`   ${index + 1}. ${comunidad.nombre}`);
        if (comunidad.descripcion) {
          console.log(`      📝 ${comunidad.descripcion}`);
        }
      });
    } else {
      console.log(`ℹ️  La tabla ya contiene ${count} registros`);
    }
    
    console.log('\n🎉 Sincronización completada exitosamente');
    console.log('\n📚 Endpoints disponibles:');
    console.log('   • GET    /api/catalog/comunidades-culturales - Listar todas las comunidades culturales');
    console.log('   • GET    /api/catalog/comunidades-culturales/select - Obtener para dropdown');
    console.log('   • GET    /api/catalog/comunidades-culturales/stats - Obtener estadísticas');
    console.log('   • GET    /api/catalog/comunidades-culturales/:id - Obtener comunidad por ID');
    console.log('   • POST   /api/catalog/comunidades-culturales - Crear nueva comunidad cultural');
    console.log('   • PUT    /api/catalog/comunidades-culturales/:id - Actualizar comunidad cultural');
    console.log('   • DELETE /api/catalog/comunidades-culturales/:id - Eliminar comunidad cultural (soft delete)');
    
    // Verificar que las rutas estén disponibles
    console.log('\n🔍 Verificando disponibilidad de endpoints...');
    try {
      const stats = await sequelize.models.ComunidadCultural.count();
      console.log(`✅ Modelo funcional - Total de registros: ${stats}`);
    } catch (error) {
      console.error('❌ Error verificando el modelo:', error.message);
    }
    
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
syncComunidadCulturalModel();
