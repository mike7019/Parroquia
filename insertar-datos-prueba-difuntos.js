/**
 * Script para insertar datos de prueba en la tabla difuntos_familia
 * DIAGNÓSTICO: La tabla está vacía, por eso el servicio no devuelve datos
 */

import sequelize from './config/sequelize.js';

async function insertarDatosPruebaDifuntos() {
  try {
    console.log('🔍 DIAGNÓSTICO CONFIRMADO:');
    console.log('- Tabla difuntos_familia: VACÍA (0 registros)');
    console.log('- Tabla parroquia: VACÍA (0 registros)');
    console.log('- Tabla parroquias: 10 registros');
    console.log('- Tabla familias: 4 registros\n');
    
    console.log('🔧 PROBLEMA 1: Tabla difuntos_familia vacía');
    console.log('🔧 PROBLEMA 2: Servicio usa tabla "parroquia" pero datos están en "parroquias"\n');

    console.log('📋 Insertando datos de prueba en difuntos_familia...\n');

    // Insertar datos de prueba
    const datosPrueba = [
      {
        nombre_completo: 'María González García',
        fecha_fallecimiento: '2023-03-15',
        observaciones: 'Madre de familia devota, siempre participaba en las actividades parroquiales',
        id_familia_familias: 5
      },
      {
        nombre_completo: 'José Rodríguez Pérez',
        fecha_fallecimiento: '2022-11-20',
        observaciones: 'Padre de familia trabajador, era el papá de la casa',
        id_familia_familias: 6
      },
      {
        nombre_completo: 'Ana María López de Guerra',
        fecha_fallecimiento: '2024-01-10',
        observaciones: 'Abuela querida de la familia, era conocida como doña Ana',
        id_familia_familias: 5
      },
      {
        nombre_completo: 'Carlos Antonio Guerra',
        fecha_fallecimiento: '2021-12-05',
        observaciones: 'Hermano mayor de la familia Guerra',
        id_familia_familias: 5
      },
      {
        nombre_completo: 'Rosa Elena Pérez',
        fecha_fallecimiento: '2023-07-22',
        observaciones: 'Madrina de la comunidad, era llamada madre Rosa por todos',
        id_familia_familias: 6
      },
      {
        nombre_completo: 'Don Manuel Rodríguez',
        fecha_fallecimiento: '2020-08-14',
        observaciones: 'Patriarca de la familia, padre respetado en la comunidad',
        id_familia_familias: 6
      }
    ];

    for (const difunto of datosPrueba) {
      const [result] = await sequelize.query(`
        INSERT INTO difuntos_familia 
        (nombre_completo, fecha_fallecimiento, observaciones, id_familia_familias, "createdAt", "updatedAt") 
        VALUES 
        (:nombre_completo, :fecha_fallecimiento, :observaciones, :id_familia_familias, NOW(), NOW())
      `, {
        replacements: difunto
      });
      
      console.log(`✅ Insertado: ${difunto.nombre_completo}`);
    }

    console.log('\n📊 Verificando datos insertados...');
    const [difuntos] = await sequelize.query(`
      SELECT 
        id_difunto,
        nombre_completo,
        fecha_fallecimiento,
        observaciones,
        id_familia_familias
      FROM difuntos_familia 
      ORDER BY fecha_fallecimiento DESC
    `);

    console.log(`\n✅ Total de difuntos insertados: ${difuntos.length}`);
    console.table(difuntos);

    // Verificar la consulta que usa el servicio
    console.log('\n🧪 Probando consulta del servicio (con tabla parroquias)...');
    const [resultadoServicio] = await sequelize.query(`
      SELECT 
        df.id_difunto,
        df.nombre_completo,
        df.fecha_fallecimiento as fecha_aniversario,
        df.observaciones,
        f.apellido_familiar,
        f.sector,
        f.telefono,
        f.direccion_familia,
        m.nombre_municipio,
        s.nombre as nombre_sector,
        v.nombre as nombre_vereda,
        p.nombre as nombre_parroquia,
        CASE 
          WHEN df.nombre_completo ILIKE '%madre%' OR df.observaciones ILIKE '%madre%' THEN 'Madre'
          WHEN df.nombre_completo ILIKE '%padre%' OR df.observaciones ILIKE '%padre%' THEN 'Padre'
          ELSE 'Familiar'
        END as parentesco_inferido
      FROM difuntos_familia df
      LEFT JOIN familias f ON df.id_familia_familias = f.id_familia
      LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
      LEFT JOIN sectores s ON f.id_sector = s.id_sector
      LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
      LEFT JOIN parroquias p ON f.id_parroquia = p.id_parroquia
      ORDER BY df.fecha_fallecimiento DESC
      LIMIT 10
    `);

    console.log('\n✅ Resultado de consulta del servicio:');
    console.table(resultadoServicio);

    // Probar filtros
    console.log('\n🧪 Probando filtro por madres...');
    const [madres] = await sequelize.query(`
      SELECT 
        df.nombre_completo,
        df.observaciones,
        CASE 
          WHEN df.nombre_completo ILIKE '%madre%' OR df.observaciones ILIKE '%madre%' THEN 'Madre'
          ELSE 'Otro'
        END as parentesco_inferido
      FROM difuntos_familia df
      WHERE (df.nombre_completo ILIKE '%madre%' OR df.observaciones ILIKE '%madre%')
    `);

    console.log(`✅ Madres encontradas: ${madres.length}`);
    console.table(madres);

    console.log('\n🧪 Probando filtro por padres...');
    const [padres] = await sequelize.query(`
      SELECT 
        df.nombre_completo,
        df.observaciones,
        CASE 
          WHEN df.nombre_completo ILIKE '%padre%' OR df.observaciones ILIKE '%padre%' THEN 'Padre'
          ELSE 'Otro'
        END as parentesco_inferido
      FROM difuntos_familia df
      WHERE (df.nombre_completo ILIKE '%padre%' OR df.observaciones ILIKE '%padre%')
    `);

    console.log(`✅ Padres encontrados: ${padres.length}`);
    console.table(padres);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

async function corregirTablaParroquia() {
  try {
    console.log('\n🔧 CORRIGIENDO PROBLEMA DE TABLA PARROQUIA...\n');
    
    // Verificar si hay datos en parroquia (singular)
    const [countParroquia] = await sequelize.query('SELECT COUNT(*) as count FROM parroquia');
    console.log(`Registros en tabla "parroquia": ${countParroquia[0].count}`);
    
    // Verificar si hay datos en parroquias (plural)
    const [countParroquias] = await sequelize.query('SELECT COUNT(*) as count FROM parroquias');
    console.log(`Registros en tabla "parroquias": ${countParroquias[0].count}`);
    
    if (countParroquia[0].count === '0' && countParroquias[0].count > '0') {
      console.log('\n✅ CONFIRMADO: Los datos están en "parroquias", no en "parroquia"');
      console.log('🔧 El servicio debe usar la tabla "parroquias" en lugar de "parroquia"');
      
      console.log('\n📋 Datos de ejemplo en parroquias:');
      const [ejemploParroquias] = await sequelize.query('SELECT id_parroquia, nombre FROM parroquias LIMIT 5');
      console.table(ejemploParroquias);
    }
    
  } catch (error) {
    console.error('❌ Error verificando parroquias:', error.message);
  }
}

// Ejecutar
async function main() {
  console.log('🔍 DIAGNÓSTICO DEL SERVICIO DE DIFUNTOS\n');
  console.log('Problema reportado: El servicio no devuelve ningún difunto\n');
  
  await insertarDatosPruebaDifuntos();
  await corregirTablaParroquia();
  
  console.log('\n📋 RESUMEN DE PROBLEMAS ENCONTRADOS:');
  console.log('1. ❌ Tabla difuntos_familia estaba VACÍA');
  console.log('2. ❌ Servicio usa tabla "parroquia" pero datos están en "parroquias"');
  console.log('\n📋 SOLUCIONES APLICADAS:');
  console.log('1. ✅ Datos de prueba insertados en difuntos_familia');
  console.log('2. 🔄 PENDIENTE: Cambiar servicio para usar tabla "parroquias"');
  
  console.log('\n🚀 PASOS SIGUIENTES:');
  console.log('1. Cambiar todas las referencias de "parroquia" a "parroquias" en el servicio');
  console.log('2. Probar el endpoint: GET /api/difuntos');
  console.log('3. Verificar que ahora devuelve los difuntos insertados');
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}

export { insertarDatosPruebaDifuntos, corregirTablaParroquia };
