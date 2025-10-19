import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

/**
 * Script de depuración para verificar encuesta ID 50
 */
async function debugEncuesta50() {
  console.log('═'.repeat(80));
  console.log('🔍 DEBUG: Verificando Encuesta ID 50');
  console.log('═'.repeat(80));
  console.log('');

  try {
    // 1. Consulta directa a tabla familias
    console.log('📋 PASO 1: Consulta directa a tabla familias');
    console.log('-'.repeat(80));
    
    const [familia] = await sequelize.query(`
      SELECT 
        id_familia,
        apellido_familiar,
        id_municipio,
        id_vereda,
        id_sector,
        id_parroquia,
        id_corregimiento
      FROM familias 
      WHERE id_familia = 50
    `, { type: QueryTypes.SELECT });

    if (!familia) {
      console.log('❌ ERROR: No se encontró familia con ID 50');
      process.exit(1);
    }

    console.log('✅ Familia encontrada:');
    console.log('   - ID Familia:', familia.id_familia);
    console.log('   - Apellido:', familia.apellido_familiar);
    console.log('   - id_municipio:', familia.id_municipio);
    console.log('   - id_vereda:', familia.id_vereda);
    console.log('   - id_sector:', familia.id_sector);
    console.log('   - id_parroquia:', familia.id_parroquia);
    console.log('   - id_corregimiento:', familia.id_corregimiento, familia.id_corregimiento ? '✅' : '❌ NULL');
    console.log('');

    // 2. Verificar si existe el corregimiento en la tabla
    if (familia.id_corregimiento) {
      console.log('📋 PASO 2: Verificando corregimiento en tabla corregimientos');
      console.log('-'.repeat(80));
      
      const [corregimiento] = await sequelize.query(`
        SELECT 
          id_corregimiento,
          codigo_corregimiento,
          nombre,
          id_municipio_municipios
        FROM corregimientos 
        WHERE id_corregimiento = :id
      `, { 
        replacements: { id: familia.id_corregimiento },
        type: QueryTypes.SELECT 
      });

      if (corregimiento) {
        console.log('✅ Corregimiento encontrado:');
        console.log('   - ID:', corregimiento.id_corregimiento);
        console.log('   - Código:', corregimiento.codigo_corregimiento);
        console.log('   - Nombre:', corregimiento.nombre);
        console.log('   - ID Municipio:', corregimiento.id_municipio_municipios);
      } else {
        console.log('❌ ERROR: Corregimiento ID', familia.id_corregimiento, 'no existe en tabla');
      }
      console.log('');
    }

    // 3. Consulta con LEFT JOIN (como en el servicio)
    console.log('📋 PASO 3: Consulta con LEFT JOIN (simulando servicio)');
    console.log('-'.repeat(80));
    
    const [encuestaCompleta] = await sequelize.query(`
      SELECT 
        f.id_familia,
        f.apellido_familiar,
        f.id_corregimiento,
        m.nombre_municipio,
        v.nombre as nombre_vereda,
        s.nombre as nombre_sector,
        p.nombre as nombre_parroquia,
        corr.id_corregimiento as corr_id,
        corr.nombre as nombre_corregimiento,
        corr.codigo_corregimiento
      FROM familias f
      LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
      LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
      LEFT JOIN sectores s ON f.id_sector = s.id_sector
      LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia
      LEFT JOIN corregimientos corr ON f.id_corregimiento = corr.id_corregimiento
      WHERE f.id_familia = 50
    `, { type: QueryTypes.SELECT });

    console.log('✅ Resultado de LEFT JOIN:');
    console.log('   - ID Familia:', encuestaCompleta.id_familia);
    console.log('   - Apellido:', encuestaCompleta.apellido_familiar);
    console.log('   - id_corregimiento (familia):', encuestaCompleta.id_corregimiento);
    console.log('   - corr_id (join):', encuestaCompleta.corr_id);
    console.log('   - nombre_corregimiento:', encuestaCompleta.nombre_corregimiento, encuestaCompleta.nombre_corregimiento ? '✅' : '❌ NULL');
    console.log('   - codigo_corregimiento:', encuestaCompleta.codigo_corregimiento);
    console.log('   - nombre_municipio:', encuestaCompleta.nombre_municipio);
    console.log('   - nombre_vereda:', encuestaCompleta.nombre_vereda);
    console.log('   - nombre_sector:', encuestaCompleta.nombre_sector);
    console.log('   - nombre_parroquia:', encuestaCompleta.nombre_parroquia);
    console.log('');

    // 4. Consulta completa con JSON_AGG (como en obtenerEncuestaPorIdOptimizado)
    console.log('📋 PASO 4: Consulta completa con JSON_AGG (método real del servicio)');
    console.log('-'.repeat(80));
    
    const [encuestaReal] = await sequelize.query(`
      SELECT 
        f.*,
        m.nombre_municipio,
        v.nombre as nombre_vereda,
        s.nombre as nombre_sector,
        p.nombre as nombre_parroquia,
        corr.nombre as nombre_corregimiento,
        tv.nombre as nombre_tipo_vivienda,
        COALESCE(
          JSON_AGG(
            DISTINCT CASE 
              WHEN per.id_personas IS NOT NULL THEN
                JSON_BUILD_OBJECT('id', per.id_personas, 'nombre', per.primer_nombre)
              END
          ) FILTER (WHERE per.id_personas IS NOT NULL), 
          '[]'::json
        ) as personas_vivas
      FROM familias f
      LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
      LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
      LEFT JOIN sectores s ON f.id_sector = s.id_sector
      LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia
      LEFT JOIN corregimientos corr ON f.id_corregimiento = corr.id_corregimiento
      LEFT JOIN tipos_vivienda tv ON f.id_tipo_vivienda = tv.id_tipo_vivienda
      LEFT JOIN personas per ON f.id_familia = per.id_familia_familias 
        AND per.identificacion NOT LIKE 'FALLECIDO%'
      WHERE f.id_familia = 50
      GROUP BY f.id_familia, m.nombre_municipio, v.nombre, s.nombre, p.nombre, corr.nombre, tv.nombre
    `, { type: QueryTypes.SELECT });

    console.log('✅ Resultado de consulta completa (método real):');
    console.log('   - id_familia:', encuestaReal.id_familia);
    console.log('   - apellido_familiar:', encuestaReal.apellido_familiar);
    console.log('   - id_corregimiento:', encuestaReal.id_corregimiento);
    console.log('   - nombre_corregimiento:', encuestaReal.nombre_corregimiento, encuestaReal.nombre_corregimiento ? '✅ CORRECTO' : '❌ NULL - PROBLEMA AQUÍ');
    console.log('   - nombre_municipio:', encuestaReal.nombre_municipio);
    console.log('   - nombre_vereda:', encuestaReal.nombre_vereda);
    console.log('   - personas_vivas:', JSON.stringify(encuestaReal.personas_vivas).substring(0, 100));
    console.log('');

    // 5. Diagnóstico final
    console.log('═'.repeat(80));
    console.log('📊 DIAGNÓSTICO FINAL:');
    console.log('═'.repeat(80));
    
    if (!familia.id_corregimiento) {
      console.log('❌ PROBLEMA: id_corregimiento es NULL en tabla familias');
      console.log('   → La encuesta NO se guardó con corregimiento');
      console.log('   → Revisar controlador encuestaController.refactored.js línea ~228');
    } else if (!encuestaReal.nombre_corregimiento) {
      console.log('❌ PROBLEMA: LEFT JOIN no encuentra el corregimiento');
      console.log('   → id_corregimiento existe pero no hay registro en tabla corregimientos');
      console.log('   → O hay problema con el nombre de columna en el JOIN');
    } else {
      console.log('✅ TODO CORRECTO: El corregimiento está guardado y se puede consultar');
      console.log('   → Si el API no lo devuelve, revisar el controlador o middleware');
    }
    console.log('═'.repeat(80));

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ ERROR FATAL:', error.message);
    console.error(error);
    await sequelize.close();
    process.exit(1);
  }
}

// Ejecutar debug
debugEncuesta50();
