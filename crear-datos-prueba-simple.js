// Script simplificado para crear datos de prueba
import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

async function crearDatosPruebaSimple() {
  try {
    console.log('🏗️ Creando datos de prueba simplificados...');
    
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');
    
    // 1. Verificar datos existentes primero
    const departamentosExistentes = await sequelize.query(`
      SELECT * FROM departamentos LIMIT 1;
    `, { type: QueryTypes.SELECT });
    
    let departamento;
    if (departamentosExistentes.length > 0) {
      departamento = departamentosExistentes[0];
      console.log('✅ Usando departamento existente:', departamento);
    } else {
      [departamento] = await sequelize.query(`
        INSERT INTO departamentos (nombre, codigo_dane) 
        VALUES ('Antioquia', '05') 
        RETURNING id_departamento, nombre;
      `, { type: QueryTypes.SELECT });
      console.log('✅ Departamento creado:', departamento);
    }
    
    // 2. Crear/obtener municipio
    const municipiosExistentes = await sequelize.query(`
      SELECT * FROM municipios WHERE id_departamento = ? LIMIT 1;
    `, { 
      replacements: [departamento.id_departamento],
      type: QueryTypes.SELECT 
    });
    
    let municipio;
    if (municipiosExistentes.length > 0) {
      municipio = municipiosExistentes[0];
      console.log('✅ Usando municipio existente:', municipio);
    } else {
      [municipio] = await sequelize.query(`
        INSERT INTO municipios (nombre_municipio, codigo_dane, id_departamento) 
        VALUES ('Medellín', '05001', ?) 
        RETURNING id_municipio, nombre_municipio;
      `, { 
        replacements: [departamento.id_departamento],
        type: QueryTypes.SELECT 
      });
      console.log('✅ Municipio creado:', municipio);
    }
    
    // 3. Verificar sexos
    const sexos = await sequelize.query(`
      SELECT id_sexo, descripcion FROM sexos ORDER BY descripcion;
    `, { type: QueryTypes.SELECT });
    
    console.log('✅ Sexos disponibles:', sexos.length);
    if (sexos.length === 0) {
      console.log('⚠️ No hay sexos en la base de datos, saltando creación de personas');
      return;
    }
    
    // 4. Verificar tipos de identificación
    const tiposId = await sequelize.query(`
      SELECT * FROM tipos_identificacion LIMIT 1;
    `, { type: QueryTypes.SELECT });
    
    let tipoId;
    if (tiposId.length > 0) {
      tipoId = tiposId[0];
      console.log('✅ Usando tipo ID existente:', tipoId);
    } else {
      console.log('⚠️ No hay tipos de identificación, saltando creación de personas');
      return;
    }
    
    // 5. Crear familia de prueba
    const timestamp = new Date().toISOString();
    const apellidoFamilia = `Familia Prueba ${Date.now()}`;
    
    const [familia] = await sequelize.query(`
      INSERT INTO familias (
        apellido_familiar, 
        sector, 
        direccion_familia, 
        numero_contacto, 
        telefono, 
        email, 
        tamaño_familia, 
        tipo_vivienda, 
        estado_encuesta, 
        numero_encuestas, 
        fecha_ultima_encuesta,
        id_municipio,
        comunionEnCasa
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *;
    `, {
      replacements: [
        apellidoFamilia,
        'Sector Test',
        'Calle 123 # 45-67',
        '6044445566',
        '6044445566',
        `familia${Date.now()}@test.com`,
        2,
        'Casa',
        'completed',
        1,
        timestamp.split('T')[0],
        municipio.id_municipio,
        true
      ],
      type: QueryTypes.SELECT
    });
    
    console.log('✅ Familia creada con ID:', familia.id_familia);
    
    // 6. Crear personas
    const personasData = [
      {
        primer_nombre: 'Juan',
        primer_apellido: 'Test',
        identificacion: `12345_${Date.now()}`,
        telefono: '3001234567',
        correo_electronico: `juan${Date.now()}@test.com`,
        fecha_nacimiento: '1980-01-01',
        direccion: 'Calle 123 # 45-67',
        id_sexo: sexos.find(s => s.descripcion === 'Masculino')?.id_sexo || sexos[0].id_sexo,
        id_tipo_identificacion_tipo_identificacion: tipoId.id_tipo_identificacion,
        id_familia_familias: familia.id_familia
      },
      {
        primer_nombre: 'Maria',
        primer_apellido: 'Test',
        identificacion: `67890_${Date.now()}`,
        telefono: '3009876543',
        correo_electronico: `maria${Date.now()}@test.com`,
        fecha_nacimiento: '1985-01-01',
        direccion: 'Calle 123 # 45-67',
        id_sexo: sexos.find(s => s.descripcion === 'Femenino')?.id_sexo || sexos[1]?.id_sexo || sexos[0].id_sexo,
        id_tipo_identificacion_tipo_identificacion: tipoId.id_tipo_identificacion,
        id_familia_familias: familia.id_familia
      }
    ];
    
    for (const persona of personasData) {
      await sequelize.query(`
        INSERT INTO personas (${Object.keys(persona).join(', ')})
        VALUES (${Object.keys(persona).map(() => '?').join(', ')});
      `, {
        replacements: Object.values(persona)
      });
    }
    
    console.log('✅ Personas creadas:', personasData.length);
    
    // 7. Crear difunto
    await sequelize.query(`
      INSERT INTO difuntos_familia (
        nombre_completo, 
        fecha_fallecimiento, 
        id_familia_familias
      )
      VALUES (?, ?, ?);
    `, {
      replacements: [
        'Abuelo José (Q.E.P.D.)', 
        '2020-01-01', 
        familia.id_familia
      ]
    });
    
    console.log('✅ Difunto creado');
    
    await sequelize.close();
    
    console.log('\n🎉 DATOS DE PRUEBA CREADOS EXITOSAMENTE');
    console.log('========================================');
    console.log(`👥 Familia: "${familia.apellido_familiar}" (ID: ${familia.id_familia})`);
    console.log(`👨‍👩 Personas: ${personasData.length}`);
    console.log(`🕊️ Difuntos: 1`);
    console.log('========================================');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

crearDatosPruebaSimple()
  .then(() => {
    console.log('✅ Completado');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
