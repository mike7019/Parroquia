// TEST QUERY FAMILIAS - Paso 2 del plan de implementación
// Prueba directa de la query SQL optimizada para familias agrupadas

// Usar import dinámico para ESM modules

async function testQueryFamilias() {
  console.log('🔍 INICIANDO TEST DE QUERY SQL FAMILIAS AGRUPADAS');
  console.log('================================================');
  
  try {
    console.log('📡 Importando módulos y conectando a la base de datos...');
    
    // Import dinámico para ESM
    const { sequelize } = await import('./src/models/index.js');
    const { QueryTypes } = await import('sequelize');
    
    // Query SQL ajustada según estructura real de la BD
    const sqlQuery = `
      WITH familias_base AS (
        -- Paso 1: Obtener familias únicas con su ubicación geográfica
        SELECT DISTINCT 
          f.id_familia,
          f.codigo_familia,
          f.apellido_familiar,
          -- Información geográfica directa de la familia
          p.nombre as parroquia_nombre,
          mun.nombre_municipio as municipio_nombre,
          dep.nombre as departamento_nombre,
          sec.nombre as sector_nombre,
          ver.nombre as vereda_nombre
        FROM familias f
        LEFT JOIN parroquias p ON f.id_parroquia = p.id_parroquia  
        LEFT JOIN municipios mun ON f.id_municipio = mun.id_municipio
        LEFT JOIN departamentos dep ON mun.id_departamento = dep.id_departamento
        LEFT JOIN sectores sec ON f.id_sector = sec.id_sector
        LEFT JOIN veredas ver ON f.id_vereda = ver.id_vereda
        WHERE f.id_familia IS NOT NULL
        LIMIT 5  -- Limitar para prueba inicial
      ),

      miembros_completos AS (
        -- Paso 2: Obtener todos los miembros con sus datos completos
        SELECT 
          p.id_familia_familias as familia_id,
          p.id_personas as persona_id,
          p.primer_nombre,
          p.segundo_nombre,
          p.primer_apellido,
          p.segundo_apellido,
          CONCAT(
            COALESCE(p.primer_nombre, ''), ' ',
            COALESCE(p.segundo_nombre, ''), ' ', 
            COALESCE(p.primer_apellido, ''), ' ',
            COALESCE(p.segundo_apellido, '')
          ) as nombre_completo,
          p.identificacion as cedula,
          p.telefono,
          p.correo_electronico as email,
          p.fecha_nacimiento,
          EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) as edad,
          p.estudios,
          p.en_que_eres_lider as destrezas,
          p.necesidad_enfermo as salud,
          
          -- Determinar si es difunto (verificar si existe en difuntos_familia)
          CASE WHEN df.id_difunto IS NOT NULL THEN true ELSE false END as es_difunto,
          df.fecha_fallecimiento as fecha_defuncion,
          df.causa_fallecimiento as causa_muerte,
          df.observaciones as observaciones_difunto,
          
          -- Clasificar tipo de miembro simplificado (usaremos el parentesco_id como aproximación)
          CASE 
            WHEN p.id_parentesco = 1 THEN 'padre'
            WHEN p.id_parentesco = 2 THEN 'madre' 
            WHEN p.id_parentesco = 3 THEN 'hijo'
            ELSE 'otro'
          END as tipo_miembro,
          
          -- Calcular si es menor (menos de 18 años)
          CASE 
            WHEN EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) < 18 THEN true
            ELSE false
          END as es_menor
          
        FROM personas p
        LEFT JOIN difuntos_familia df ON p.id_personas = df.id_difunto 
        WHERE p.id_familia_familias IS NOT NULL
      )

      -- Consulta final: Combinar familias con sus miembros
      SELECT 
        fb.*,
        json_agg(
          json_build_object(
            'persona_id', mc.persona_id,
            'nombre_completo', TRIM(mc.nombre_completo),
            'cedula', mc.cedula,
            'telefono', mc.telefono,
            'email', mc.email,
            'edad', mc.edad,
            'salud', mc.salud,
            'destrezas', mc.destrezas,
            'tipo_miembro', mc.tipo_miembro,
            'es_difunto', mc.es_difunto,
            'es_menor', mc.es_menor,
            'fecha_defuncion', mc.fecha_defuncion,
            'causa_muerte', mc.causa_muerte,
            'observaciones_difunto', mc.observaciones_difunto
          )
        ) as miembros
      FROM familias_base fb
      LEFT JOIN miembros_completos mc ON fb.id_familia = mc.familia_id
      GROUP BY 
        fb.id_familia, fb.codigo_familia, fb.apellido_familiar,
        fb.parroquia_nombre, fb.municipio_nombre, fb.departamento_nombre, 
        fb.sector_nombre, fb.vereda_nombre
      ORDER BY fb.codigo_familia;
    `;

    console.log('⚡ Ejecutando query SQL...');
    const startTime = Date.now();
    
    const resultado = await sequelize.query(sqlQuery, {
      type: QueryTypes.SELECT
    });
    
    const timeElapsed = Date.now() - startTime;
    
    console.log('✅ Query ejecutada exitosamente!');
    console.log(`⏱️  Tiempo de ejecución: ${timeElapsed}ms`);
    console.log(`📊 Familias encontradas: ${resultado.length}`);
    
    if (resultado.length > 0) {
      console.log('\n🏠 PRIMERA FAMILIA ENCONTRADA:');
      console.log('=====================================');
      console.log(`🆔 ID: ${resultado[0].id_familia}`);
      console.log(`📝 Código: ${resultado[0].codigo_familia || 'Sin código'}`);
      console.log(`👨‍👩‍👧‍👦 Apellido: ${resultado[0].apellido_familiar}`);
      console.log(`📍 Ubicación: ${resultado[0].parroquia_nombre} - ${resultado[0].municipio_nombre}`);
      console.log(`🏘️  Sector: ${resultado[0].sector_nombre || 'No definido'}`);
      console.log(`🌾 Vereda: ${resultado[0].vereda_nombre || 'No definida'}`);
      
      const miembros = resultado[0].miembros || [];
      console.log(`👥 Total miembros: ${miembros.length}`);
      
      if (miembros.length > 0) {
        const padres = miembros.filter(m => m.tipo_miembro === 'padre');
        const madres = miembros.filter(m => m.tipo_miembro === 'madre');
        const hijos = miembros.filter(m => m.tipo_miembro === 'hijo');
        const difuntos = miembros.filter(m => m.es_difunto);
        
        console.log(`👨 Padres: ${padres.length}`);
        console.log(`👩 Madres: ${madres.length}`);
        console.log(`👶 Hijos: ${hijos.length}`);
        console.log(`⚰️  Difuntos: ${difuntos.length}`);
        
        console.log('\n👤 PRIMER MIEMBRO:');
        console.log(`   Nombre: ${miembros[0].nombre_completo}`);
        console.log(`   Tipo: ${miembros[0].tipo_miembro}`);
        console.log(`   Edad: ${miembros[0].edad || 'No definida'}`);
        console.log(`   Es difunto: ${miembros[0].es_difunto ? 'Sí' : 'No'}`);
      }
      
      console.log('\n📋 ESTRUCTURA COMPLETA DE LA PRIMERA FAMILIA:');
      console.log(JSON.stringify(resultado[0], null, 2));
    }
    
    // Validaciones de calidad
    console.log('\n🔍 VALIDACIONES DE CALIDAD:');
    console.log('============================');
    
    let errores = 0;
    
    if (resultado.length === 0) {
      console.log('❌ No se encontraron familias');
      errores++;
    } else {
      console.log('✅ Se encontraron familias');
    }
    
    if (timeElapsed > 5000) {
      console.log('⚠️  Query tardó más de 5 segundos');
      errores++;
    } else {
      console.log('✅ Query ejecutada en tiempo aceptable');
    }
    
    // Validar que cada familia tenga miembros
    const familiasSinMiembros = resultado.filter(f => !f.miembros || f.miembros.length === 0);
    if (familiasSinMiembros.length > 0) {
      console.log(`⚠️  ${familiasSinMiembros.length} familias sin miembros`);
    } else {
      console.log('✅ Todas las familias tienen miembros');
    }
    
    // Validar estructura de datos
    const familiaConMiembros = resultado.find(f => f.miembros && f.miembros.length > 0);
    if (familiaConMiembros) {
      const miembro = familiaConMiembros.miembros[0];
      if (miembro.nombre_completo && miembro.tipo_miembro !== undefined) {
        console.log('✅ Estructura de miembros correcta');
      } else {
        console.log('❌ Estructura de miembros incorrecta');
        errores++;
      }
    }
    
    if (errores === 0) {
      console.log('\n🎉 TODAS LAS VALIDACIONES PASARON!');
      console.log('✅ Query SQL lista para implementación');
      process.exit(0);
    } else {
      console.log(`\n⚠️  ${errores} problemas encontrados. Revisar antes de continuar.`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ ERROR EJECUTANDO QUERY:');
    console.error('============================');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    // Diagnóstico adicional
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.error('\n🔧 DIAGNÓSTICO: Tabla no existe');
      console.error('   - Verificar nombres de tablas en la query');
      console.error('   - Revisar migraciones de base de datos');
    } else if (error.message.includes('column') && error.message.includes('does not exist')) {
      console.error('\n🔧 DIAGNÓSTICO: Columna no existe');
      console.error('   - Verificar nombres de columnas en la query');
      console.error('   - Revisar estructura actual de tablas');
    } else if (error.message.includes('syntax error')) {
      console.error('\n🔧 DIAGNÓSTICO: Error de sintaxis SQL');
      console.error('   - Revisar sintaxis de CTEs y JOINs');
      console.error('   - Verificar compatibilidad con PostgreSQL');
    }
    
    process.exit(1);
  } finally {
    try {
      await sequelize.close();
      console.log('\n📊 Conexión a base de datos cerrada');
    } catch (closeError) {
      console.error('Error cerrando conexión:', closeError.message);
    }
  }
}

// Ejecutar test
console.log('🚀 INICIANDO TEST DE QUERY FAMILIAS SQL');
console.log('Basado en el diseño del notebook: diseño-opcion-b-familias-completas.ipynb');
console.log('');

testQueryFamilias();