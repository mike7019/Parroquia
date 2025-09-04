// Script para crear datos de prueba en la base de datos
import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

async function crearDatosPrueba() {
  try {
    console.log('🏗️ Creando datos de prueba...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');
    
    // 1. Crear departamento de prueba
    const [departamento] = await sequelize.query(`
      INSERT INTO departamentos (nombre, codigo_dane) 
      VALUES ('Antioquia Test', '05') 
      ON CONFLICT (codigo_dane) DO UPDATE SET nombre = EXCLUDED.nombre
      RETURNING id_departamento, nombre;
    `, { type: QueryTypes.SELECT });
    
    console.log('✅ Departamento creado:', departamento);
    
    // 2. Crear municipio de prueba
    const [municipio] = await sequelize.query(`
      INSERT INTO municipios (nombre_municipio, codigo_dane, id_departamento) 
      VALUES ('Medellín Test', '05001', ${departamento.id_departamento}) 
      ON CONFLICT (codigo_dane) DO UPDATE SET nombre_municipio = EXCLUDED.nombre_municipio
      RETURNING id_municipio, nombre_municipio;
    `, { type: QueryTypes.SELECT });
    
    console.log('✅ Municipio creado:', municipio);
    
    // 3. Crear sexos
    await sequelize.query(`
      INSERT INTO sexos (descripcion) VALUES 
      ('Masculino'), ('Femenino')
      ON CONFLICT (descripcion) DO NOTHING;
    `);
    
    const sexos = await sequelize.query(`
      SELECT id_sexo, descripcion FROM sexos ORDER BY descripcion;
    `, { type: QueryTypes.SELECT });
    
    console.log('✅ Sexos disponibles:', sexos.length);
    
    // 4. Crear tipo de identificación
    const [tipoId] = await sequelize.query(`
      INSERT INTO tipos_identificacion (nombre, codigo) 
      VALUES ('Cédula de Ciudadanía', 'CC') 
      ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre
      RETURNING id_tipo_identificacion, nombre;
    `, { type: QueryTypes.SELECT });
    
    console.log('✅ Tipo identificación creado:', tipoId);
    
    // 5. Crear familia de prueba
    const timestamp = new Date().toISOString();
    const familiaData = {
      apellido_familiar: 'Familia Prueba Test',
      sector: 'Sector Central',
      direccion_familia: 'Calle 123 # 45-67',
      numero_contacto: '6044445566',
      telefono: '6044445566',
      email: `familia.prueba.${Date.now()}@test.com`,
      tamaño_familia: 3,
      tipo_vivienda: 'Casa',
      estado_encuesta: 'completed',
      numero_encuestas: 1,
      fecha_ultima_encuesta: timestamp.split('T')[0],
      codigo_familia: `FAM_TEST_${Date.now()}`,
      tutor_responsable: true,
      id_municipio: municipio.id_municipio,
      comunionEnCasa: true
    };
    
    const [familia] = await sequelize.query(`
      INSERT INTO familias (${Object.keys(familiaData).join(', ')})
      VALUES (${Object.keys(familiaData).map(() => '?').join(', ')})
      RETURNING *;
    `, {
      replacements: Object.values(familiaData),
      type: QueryTypes.SELECT
    });
    
    console.log('✅ Familia creada con ID:', familia.id_familia);
    
    // 6. Crear miembros de la familia
    const miembros = [
      {
        primer_nombre: 'Carlos',
        segundo_nombre: 'Alberto',
        primer_apellido: 'González',
        segundo_apellido: 'Pérez',
        identificacion: `1234567890_${Date.now()}`,
        telefono: '3201234567',
        correo_electronico: `carlos.${Date.now()}@test.com`,
        fecha_nacimiento: '1980-01-15',
        direccion: 'Calle 123 # 45-67',
        estudios: 'Ingeniero',
        talla_camisa: 'L',
        talla_pantalon: '32',
        talla_zapato: '42',
        id_sexo: sexos.find(s => s.descripcion === 'Masculino')?.id_sexo,
        id_tipo_identificacion_tipo_identificacion: tipoId.id_tipo_identificacion,
        id_familia_familias: familia.id_familia
      },
      {
        primer_nombre: 'María',
        segundo_nombre: 'Elena',
        primer_apellido: 'Rodríguez',
        segundo_apellido: 'López',
        identificacion: `9876543210_${Date.now()}`,
        telefono: '3209876543',
        correo_electronico: `maria.${Date.now()}@test.com`,
        fecha_nacimiento: '1985-05-20',
        direccion: 'Calle 123 # 45-67',
        estudios: 'Administradora',
        talla_camisa: 'M',
        talla_pantalon: '28',
        talla_zapato: '37',
        id_sexo: sexos.find(s => s.descripcion === 'Femenino')?.id_sexo,
        id_tipo_identificacion_tipo_identificacion: tipoId.id_tipo_identificacion,
        id_familia_familias: familia.id_familia
      }
    ];
    
    let miembrosCreados = 0;
    for (const miembro of miembros) {
      await sequelize.query(`
        INSERT INTO personas (${Object.keys(miembro).join(', ')})
        VALUES (${Object.keys(miembro).map(() => '?').join(', ')});
      `, {
        replacements: Object.values(miembro)
      });
      miembrosCreados++;
    }
    
    console.log('✅ Miembros de familia creados:', miembrosCreados);
    
    // 7. Crear difunto
    await sequelize.query(`
      INSERT INTO difuntos_familia (
        nombre_completo, 
        fecha_fallecimiento, 
        observaciones, 
        id_familia_familias
      )
      VALUES (
        'Abuelo José González (Q.E.P.D.)', 
        '2020-12-25', 
        'Falleció de causas naturales', 
        ?
      );
    `, {
      replacements: [familia.id_familia]
    });
    
    console.log('✅ Difunto registrado');
    
    await sequelize.close();
    
    console.log('\n🎉 DATOS DE PRUEBA CREADOS EXITOSAMENTE');
    console.log('========================================');
    console.log(`👥 Familia: "${familia.apellido_familiar}" (ID: ${familia.id_familia})`);
    console.log(`👨‍👩 Miembros vivos: ${miembrosCreados}`);
    console.log(`🕊️ Difuntos: 1`);
    console.log(`🏠 Municipio: ${municipio.nombre_municipio}`);
    console.log('========================================');
    
    return {
      familia,
      municipio,
      departamento,
      miembrosCreados
    };
    
  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
    throw error;
  }
}

crearDatosPrueba()
  .then(() => {
    console.log('✅ Script completado exitosamente');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
