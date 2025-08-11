import TipoVivienda from './src/models/catalog/TipoVivienda.js';
import sequelize from './config/sequelize.js';

async function seedTiposVivienda() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('🔗 Conectado a la base de datos');

    // Verificar si ya existen tipos de vivienda
    const existingCount = await TipoVivienda.count();
    
    if (existingCount > 0) {
      console.log(`ℹ️  Ya existen ${existingCount} tipos de vivienda en la base de datos`);
      return;
    }

    // Datos de tipos de vivienda a insertar
    const tiposVivienda = [
      {
        nombre: 'Casa',
        descripcion: 'Vivienda unifamiliar independiente con espacios propios',
        activo: true
      },
      {
        nombre: 'Apartamento',
        descripcion: 'Vivienda en edificio multifamiliar con servicios compartidos',
        activo: true
      },
      {
        nombre: 'Finca',
        descripcion: 'Vivienda rural de construcción tradicional en zona campestre',
        activo: true
      },
      {
        nombre: 'Rancho',
        descripcion: 'Vivienda rústica en propiedad rural dedicada a la ganadería o agricultura',
        activo: true
      },
      {
        nombre: 'Cuarto',
        descripcion: 'Habitación individual en casa o edificio con servicios compartidos',
        activo: true
      },
      {
        nombre: 'Casa Lote',
        descripcion: 'Vivienda construida en lote propio con jardín o patio',
        activo: true
      },
      {
        nombre: 'Inquilinato',
        descripcion: 'Habitación en edificio con servicios básicos compartidos',
        activo: true
      },
      {
        nombre: 'Casa Campestre',
        descripcion: 'Vivienda en zona rural o periurbana con amplios espacios verdes',
        activo: true
      },
      {
        nombre: 'Vivienda de Interés Social',
        descripcion: 'Vivienda subsidiada por programas gubernamentales',
        activo: true
      },
      {
        nombre: 'Otro',
        descripcion: 'Otro tipo de vivienda no especificado en las categorías anteriores',
        activo: true
      }
    ];

    // Insertar tipos de vivienda
    console.log('🌱 Insertando tipos de vivienda...');
    const insertedTipos = await TipoVivienda.bulkCreate(tiposVivienda, {
      validate: true,
      returning: true
    });

    console.log(`✅ Se insertaron ${insertedTipos.length} tipos de vivienda exitosamente:`);
    insertedTipos.forEach((tipo, index) => {
      console.log(`   ${index + 1}. ${tipo.nombre} (ID: ${tipo.id_tipo_vivienda})`);
    });

    // Mostrar estadísticas finales
    const finalCount = await TipoVivienda.count();
    const activosCount = await TipoVivienda.count({ where: { activo: true } });
    
    console.log('\n📊 Estadísticas finales:');
    console.log(`   - Total de tipos: ${finalCount}`);
    console.log(`   - Tipos activos: ${activosCount}`);
    console.log(`   - Tipos inactivos: ${finalCount - activosCount}`);

  } catch (error) {
    console.error('❌ Error al insertar tipos de vivienda:', error.message);
    if (error.errors) {
      error.errors.forEach(validationError => {
        console.error(`   - ${validationError.message}`);
      });
    }
  } finally {
    // Cerrar conexión
    await sequelize.close();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

// Verificar si el script se está ejecutando directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🏠 Iniciando seeder de Tipos de Vivienda\n');
  seedTiposVivienda()
    .then(() => {
      console.log('\n✅ Seeder ejecutado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error al ejecutar seeder:', error);
      process.exit(1);
    });
}

export default seedTiposVivienda;
