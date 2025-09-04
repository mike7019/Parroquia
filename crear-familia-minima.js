// Script mínimo para crear una familia de prueba
import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

async function crearFamiliaMinima() {
  try {
    console.log('🏗️ Creando familia mínima de prueba...');
    
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');
    
    // 1. Obtener datos existentes
    const departamentos = await sequelize.query(`SELECT * FROM departamentos LIMIT 1;`, { type: QueryTypes.SELECT });
    const municipios = await sequelize.query(`SELECT * FROM municipios LIMIT 1;`, { type: QueryTypes.SELECT });
    const sexos = await sequelize.query(`SELECT * FROM sexos ORDER BY descripcion;`, { type: QueryTypes.SELECT });
    const tiposId = await sequelize.query(`SELECT * FROM tipos_identificacion LIMIT 1;`, { type: QueryTypes.SELECT });
    
    if (departamentos.length === 0 || municipios.length === 0 || sexos.length === 0 || tiposId.length === 0) {
      console.log('⚠️ Faltan datos de referencia en la base de datos');
      return;
    }
    
    console.log('✅ Datos de referencia encontrados');
    
    // 2. Crear familia con campos mínimos requeridos
    const timestamp = Date.now();
    const [familia] = await sequelize.query(`
      INSERT INTO familias (
        apellido_familiar, 
        sector, 
        direccion_familia, 
        tamaño_familia, 
        tipo_vivienda, 
        estado_encuesta, 
        numero_encuestas,
        id_municipio
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *;
    `, {
      replacements: [
        `Familia Test ${timestamp}`,
        'Sector Prueba',
        'Calle Test # 123-45',
        2,
        'Casa',
        'completed',
        1,
        municipios[0].id_municipio
      ],
      type: QueryTypes.SELECT
    });
    
    console.log('✅ Familia creada:', familia.id_familia);
    
    // 3. Crear personas mínimas
    const personas = [
      {
        primer_nombre: 'Juan',
        primer_apellido: 'Test',
        identificacion: `CC${timestamp}01`,
        telefono: '3001234567',
        correo_electronico: `juan${timestamp}@test.com`,
        fecha_nacimiento: '1980-01-01',
        direccion: 'Calle Test # 123-45',
        id_sexo: sexos[0].id_sexo,
        id_tipo_identificacion_tipo_identificacion: tiposId[0].id_tipo_identificacion,
        id_familia_familias: familia.id_familia
      },
      {
        primer_nombre: 'Maria',
        primer_apellido: 'Test',
        identificacion: `CC${timestamp}02`,
        telefono: '3009876543',
        correo_electronico: `maria${timestamp}@test.com`,
        fecha_nacimiento: '1985-01-01',
        direccion: 'Calle Test # 123-45',
        id_sexo: sexos.length > 1 ? sexos[1].id_sexo : sexos[0].id_sexo,
        id_tipo_identificacion_tipo_identificacion: tiposId[0].id_tipo_identificacion,
        id_familia_familias: familia.id_familia
      }
    ];
    
    for (const persona of personas) {
      await sequelize.query(`
        INSERT INTO personas (${Object.keys(persona).join(', ')})
        VALUES (${Object.keys(persona).map(() => '?').join(', ')});
      `, {
        replacements: Object.values(persona)
      });
    }
    
    console.log('✅ Personas creadas:', personas.length);
    
    // 4. Crear difunto
    await sequelize.query(`
      INSERT INTO difuntos_familia (nombre_completo, fecha_fallecimiento, id_familia_familias)
      VALUES (?, ?, ?);
    `, {
      replacements: [`Abuelo Test ${timestamp}`, '2020-01-01', familia.id_familia]
    });
    
    console.log('✅ Difunto creado');
    
    await sequelize.close();
    
    console.log('\n🎉 FAMILIA DE PRUEBA CREADA EXITOSAMENTE');
    console.log('==========================================');
    console.log(`👥 Familia: "${familia.apellido_familiar}" (ID: ${familia.id_familia})`);
    console.log(`👨‍👩 Personas: ${personas.length}`);
    console.log(`🕊️ Difuntos: 1`);
    console.log('==========================================');
    
    return familia;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

crearFamiliaMinima()
  .then((familia) => {
    if (familia) {
      console.log('✅ ¡Listo para ejecutar pruebas!');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
