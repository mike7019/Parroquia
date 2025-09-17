// Script para diagnosticar el problema con la creación de sectores
import sequelize from './config/sequelize.js';

async function testSectorCreation() {
  try {
    console.log('🔍 Probando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    // Cargar modelos primero
    console.log('🔍 Cargando modelos...');
    const modelsModule = await import('./src/models/index.js');
    console.log('Modelos importados:', Object.keys(modelsModule.default || modelsModule));

    // Obtener el modelo directamente
    const Sector = sequelize.models.Sector;
    const Municipios = sequelize.models.Municipios;

    console.log('🔍 Verificando modelos en sequelize...');
    console.log('Modelos disponibles:', Object.keys(sequelize.models));
    console.log('Sector model:', !!Sector);
    console.log('Municipios model:', !!Municipios);

    if (!Sector) {
      console.log('❌ Modelo Sector no encontrado');
      return;
    }

    if (!Municipios) {
      console.log('❌ Modelo Municipios no encontrado');
      return;
    }

    // Verificar municipio
    console.log('🔍 Verificando municipio con ID 1...');
    const municipio = await Municipios.findByPk(1);
    console.log('Municipio encontrado:', !!municipio);

    if (!municipio) {
      console.log('❌ Municipio con ID 1 no existe');
      return;
    }

    // Crear sector de prueba
    console.log('🔍 Creando sector de prueba...');
    const now = new Date();
    const sectorData = {
      nombre: 'Sector Debug Test',
      id_municipio: 1,
      created_at: now,
      updated_at: now
    };

    console.log('Datos a insertar:', sectorData);
    
    // Intentar con query builder directo y diferentes tipos
    console.log('🔍 Probando con QueryInterface y diferentes tipos...');
    
    // Probar con BigInt explícito
    try {
      const result = await sequelize.getQueryInterface().insert(
        null, 
        'sectores', 
        {
          nombre: 'Test Simple',
          id_municipio: BigInt(1),
          created_at: new Date(),
          updated_at: new Date()
        }
      );
      console.log('✅ QueryInterface con BigInt exitoso:', result);
    } catch (qiError) {
      console.log('❌ QueryInterface con BigInt falló:', qiError.message);
    }
    
    // Probar sin timestamps explícitos
    try {
      const result2 = await sequelize.getQueryInterface().insert(
        null, 
        'sectores', 
        {
          nombre: 'Test Sin Timestamps',
          id_municipio: 1
        }
      );
      console.log('✅ QueryInterface sin timestamps exitoso:', result2);
    } catch (qiError2) {
      console.log('❌ QueryInterface sin timestamps falló:', qiError2.message);
    }
    
    // Ahora intentar con el modelo
    console.log('🔍 Probando con modelo Sequelize...');
    const sector = await Sector.create(sectorData);
    console.log('✅ Sector creado exitosamente:');
    console.log('ID:', sector.id_sector);
    console.log('Nombre:', sector.nombre);
    console.log('Municipio ID:', sector.id_municipio);

    // Intentar serializar
    console.log('🔍 Probando serialización...');
    const sectorJson = JSON.stringify(sector);
    console.log('✅ Serialización exitosa');

    // Probar dataValues
    console.log('🔍 Probando dataValues...');
    const plainObject = sector.dataValues;
    console.log('✅ dataValues obtenido:', plainObject);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testSectorCreation();
