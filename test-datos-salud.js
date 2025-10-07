import { QueryTypes } from 'sequelize';
import sequelize from './config/sequelize.js';

async function diagnosticarDatosSalud() {
  try {
    console.log('🔍 DIAGNÓSTICO DE DATOS DE SALUD\n');
    console.log('='.repeat(80));

    // 1. Total de personas en la base de datos
    const [totalPersonas] = await sequelize.query(`
      SELECT COUNT(*) as total FROM personas
    `, { type: QueryTypes.SELECT });
    
    console.log('\n📊 1. TOTAL DE PERSONAS:');
    console.log(`   Total: ${totalPersonas.total} personas`);

    // 2. Personas con enfermedades
    const [personasConEnfermedades] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN necesidad_enfermo IS NOT NULL AND necesidad_enfermo != '' THEN 1 END) as con_enfermedades,
        COUNT(CASE WHEN necesidad_enfermo IS NULL OR necesidad_enfermo = '' THEN 1 END) as sin_enfermedades
      FROM personas
    `, { type: QueryTypes.SELECT });
    
    console.log('\n📋 2. ESTADO DE ENFERMEDADES:');
    console.log(`   Con enfermedades: ${personasConEnfermedades.con_enfermedades}`);
    console.log(`   Sin enfermedades: ${personasConEnfermedades.sin_enfermedades}`);

    // 3. Ejemplos de enfermedades registradas
    const enfermedadesEjemplo = await sequelize.query(`
      SELECT 
        id_personas,
        CONCAT(primer_nombre, ' ', primer_apellido) as nombre,
        necesidad_enfermo
      FROM personas
      WHERE necesidad_enfermo IS NOT NULL 
        AND necesidad_enfermo != ''
      LIMIT 10
    `, { type: QueryTypes.SELECT });
    
    console.log('\n📝 3. EJEMPLOS DE ENFERMEDADES REGISTRADAS:');
    if (enfermedadesEjemplo.length > 0) {
      enfermedadesEjemplo.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.nombre} (ID: ${p.id_personas})`);
        console.log(`      Enfermedades: "${p.necesidad_enfermo}"`);
      });
    } else {
      console.log('   ⚠️  No hay personas con enfermedades registradas');
    }

    // 4. Búsqueda específica de "diabetes"
    const conDiabetes = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        string_agg(DISTINCT necesidad_enfermo, ' | ') as enfermedades_encontradas
      FROM personas
      WHERE necesidad_enfermo ILIKE '%diabetes%'
    `, { type: QueryTypes.SELECT });
    
    console.log('\n🔍 4. BÚSQUEDA DE "DIABETES":');
    console.log(`   Personas con diabetes: ${conDiabetes[0].total}`);
    if (conDiabetes[0].total > 0) {
      console.log(`   Ejemplos: ${conDiabetes[0].enfermedades_encontradas}`);
    }

    // 5. Distribución por sexo
    const porSexo = await sequelize.query(`
      SELECT 
        s.id_sexo,
        s.descripcion as sexo,
        COUNT(p.id_personas) as total
      FROM sexos s
      LEFT JOIN personas p ON s.id_sexo = p.id_sexo
      GROUP BY s.id_sexo, s.descripcion
      ORDER BY total DESC
    `, { type: QueryTypes.SELECT });
    
    console.log('\n👥 5. DISTRIBUCIÓN POR SEXO:');
    porSexo.forEach(s => {
      console.log(`   ${s.sexo} (ID: ${s.id_sexo}): ${s.total} personas`);
    });

    // 6. Distribución por municipio
    const porMunicipio = await sequelize.query(`
      SELECT 
        m.id_municipio,
        m.nombre_municipio,
        COUNT(DISTINCT f.id_familia) as familias,
        COUNT(DISTINCT p.id_personas) as personas
      FROM municipios m
      LEFT JOIN familias f ON m.id_municipio = f.id_municipio
      LEFT JOIN personas p ON f.id_familia = p.id_familia_familias
      GROUP BY m.id_municipio, m.nombre_municipio
      HAVING COUNT(DISTINCT p.id_personas) > 0
      ORDER BY personas DESC
      LIMIT 10
    `, { type: QueryTypes.SELECT });
    
    console.log('\n🏙️  6. TOP 10 MUNICIPIOS CON PERSONAS:');
    if (porMunicipio.length > 0) {
      porMunicipio.forEach((m, i) => {
        console.log(`   ${i + 1}. ${m.nombre_municipio} (ID: ${m.id_municipio})`);
        console.log(`      Familias: ${m.familias}, Personas: ${m.personas}`);
      });
    } else {
      console.log('   ⚠️  No hay personas asociadas a municipios');
    }

    // 7. Distribución por parroquia
    const porParroquia = await sequelize.query(`
      SELECT 
        pr.id_parroquia,
        pr.nombre,
        COUNT(p.id_personas) as total
      FROM parroquia pr
      LEFT JOIN personas p ON pr.id_parroquia = p.id_parroquia
      GROUP BY pr.id_parroquia, pr.nombre
      HAVING COUNT(p.id_personas) > 0
      ORDER BY total DESC
    `, { type: QueryTypes.SELECT });
    
    console.log('\n⛪ 7. DISTRIBUCIÓN POR PARROQUIA:');
    if (porParroquia.length > 0) {
      porParroquia.forEach((pr, i) => {
        console.log(`   ${i + 1}. ${pr.nombre} (ID: ${pr.id_parroquia}): ${pr.total} personas`);
      });
    } else {
      console.log('   ⚠️  No hay personas asociadas a parroquias');
    }

    // 8. Personas con múltiples filtros combinados
    console.log('\n🔎 8. PRUEBA DE FILTROS COMBINADOS:');
    
    // Prueba 1: Solo enfermedad
    const [soloEnfermedad] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM personas p
      WHERE p.necesidad_enfermo ILIKE '%diabetes%'
    `, { type: QueryTypes.SELECT });
    console.log(`   Solo "diabetes": ${soloEnfermedad.total} personas`);

    // Prueba 2: Enfermedad + Sexo masculino (ID=1)
    const [enfermedadSexo] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM personas p
      WHERE p.necesidad_enfermo ILIKE '%diabetes%'
        AND p.id_sexo = 1
    `, { type: QueryTypes.SELECT });
    console.log(`   "diabetes" + Sexo masculino (ID=1): ${enfermedadSexo.total} personas`);

    // Prueba 3: Enfermedad + Sexo + Parroquia
    const [enfermedadSexoParroquia] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM personas p
      WHERE p.necesidad_enfermo ILIKE '%diabetes%'
        AND p.id_sexo = 1
        AND p.id_parroquia = 1
    `, { type: QueryTypes.SELECT });
    console.log(`   "diabetes" + Sexo masculino + Parroquia 1: ${enfermedadSexoParroquia.total} personas`);

    // Prueba 4: Todos los filtros
    const [todosFiltros] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM personas p
      LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
      WHERE p.necesidad_enfermo ILIKE '%diabetes%'
        AND p.id_sexo = 1
        AND p.id_parroquia = 1
        AND f.id_municipio = 1
        AND f.id_sector = 1
    `, { type: QueryTypes.SELECT });
    console.log(`   Todos los filtros combinados: ${todosFiltros.total} personas`);

    // 9. Sugerencia de filtros que SÍ funcionan
    console.log('\n✅ 9. SUGERENCIAS DE FILTROS QUE FUNCIONAN:');
    
    const sugerencias = await sequelize.query(`
      SELECT 
        p.id_sexo,
        s.descripcion as sexo,
        p.id_parroquia,
        pr.nombre as parroquia,
        f.id_municipio,
        m.nombre_municipio,
        COUNT(*) as personas_disponibles
      FROM personas p
      LEFT JOIN sexos s ON p.id_sexo = s.id_sexo
      LEFT JOIN parroquia pr ON p.id_parroquia = pr.id_parroquia
      LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
      LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
      WHERE p.necesidad_enfermo IS NOT NULL AND p.necesidad_enfermo != ''
      GROUP BY p.id_sexo, s.descripcion, p.id_parroquia, pr.nombre, f.id_municipio, m.nombre_municipio
      HAVING COUNT(*) > 0
      ORDER BY personas_disponibles DESC
      LIMIT 5
    `, { type: QueryTypes.SELECT });

    if (sugerencias.length > 0) {
      sugerencias.forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.personas_disponibles} personas con enfermedades`);
        console.log(`      Sexo: ${s.sexo || 'No especificado'} (ID: ${s.id_sexo || 'NULL'})`);
        console.log(`      Parroquia: ${s.parroquia || 'No especificada'} (ID: ${s.id_parroquia || 'NULL'})`);
        console.log(`      Municipio: ${s.nombre_municipio || 'No especificado'} (ID: ${s.id_municipio || 'NULL'})`);
      });
    } else {
      console.log('   ⚠️  No se encontraron combinaciones de filtros con datos');
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Diagnóstico completado\n');

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  } finally {
    await sequelize.close();
  }
}

diagnosticarDatosSalud();
