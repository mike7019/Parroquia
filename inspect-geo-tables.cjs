// INSPECCIONAR TABLAS GEOGRÁFICAS
// Para ajustar los JOINs geográficos correctamente

async function inspectGeoTables() {
  console.log('🌍 INSPECCIONANDO TABLAS GEOGRÁFICAS');
  console.log('=====================================');
  
  try {
    const { sequelize } = await import('./src/models/index.js');
    const { QueryTypes } = await import('sequelize');
    
    // 1. Estructura tabla municipios
    console.log('\n🏘️  ESTRUCTURA TABLA MUNICIPIOS:');
    const colMunicipios = await sequelize.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'municipios' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `, { type: QueryTypes.SELECT });
    
    colMunicipios.forEach(col => console.log(`   ${col.column_name} (${col.data_type})`));
    
    // 2. Muestra de municipios
    console.log('\n📊 MUESTRA MUNICIPIOS:');
    const muestraMun = await sequelize.query(`SELECT * FROM municipios LIMIT 2;`, { type: QueryTypes.SELECT });
    if (muestraMun.length > 0) {
      console.log('Columnas:', Object.keys(muestraMun[0]));
      console.log('Primer municipio:', muestraMun[0]);
    }
    
    // 3. Estructura tabla departamentos
    console.log('\n🗺️  ESTRUCTURA TABLA DEPARTAMENTOS:');
    const colDepartamentos = await sequelize.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'departamentos' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `, { type: QueryTypes.SELECT });
    
    colDepartamentos.forEach(col => console.log(`   ${col.column_name} (${col.data_type})`));
    
    // 4. Estructura tabla parroquias
    console.log('\n⛪ ESTRUCTURA TABLA PARROQUIAS:');
    const colParroquias = await sequelize.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'parroquias' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `, { type: QueryTypes.SELECT });
    
    colParroquias.forEach(col => console.log(`   ${col.column_name} (${col.data_type})`));
    
    // 5. Estructura tabla sectores
    console.log('\n🏘️  ESTRUCTURA TABLA SECTORES:');
    const colSectores = await sequelize.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'sectores' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `, { type: QueryTypes.SELECT });
    
    colSectores.forEach(col => console.log(`   ${col.column_name} (${col.data_type})`));
    
    // 6. Estructura tabla veredas
    console.log('\n🌾 ESTRUCTURA TABLA VEREDAS:');
    const colVeredas = await sequelize.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'veredas' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `, { type: QueryTypes.SELECT });
    
    colVeredas.forEach(col => console.log(`   ${col.column_name} (${col.data_type})`));
    
    // 7. Verificar relaciones con una familia real
    console.log('\n🔗 DATOS GEOGRÁFICOS DE FAMILIA REAL:');
    const familiaGeo = await sequelize.query(`
      SELECT 
        f.id_familia,
        f.apellido_familiar,
        f.id_parroquia,
        f.id_municipio,
        f.id_sector,
        f.id_vereda
      FROM familias f 
      WHERE f.id_familia = '12';
    `, { type: QueryTypes.SELECT });
    
    if (familiaGeo.length > 0) {
      console.log('Familia con IDs geográficos:', familiaGeo[0]);
      
      // Buscar datos geográficos relacionados
      const geoData = await sequelize.query(`
        SELECT 
          p.nombre as parroquia_nombre,
          m.nombre as municipio_nombre,
          d.nombre as departamento_nombre,
          s.nombre as sector_nombre,
          v.nombre as vereda_nombre
        FROM familias f
        LEFT JOIN parroquias p ON f.id_parroquia = p.id_parroquia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio  
        LEFT JOIN departamentos d ON m.id_departamento = d.id_departamento
        LEFT JOIN sectores s ON f.id_sector = s.id_sector
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        WHERE f.id_familia = '12';
      `, { type: QueryTypes.SELECT });
      
      if (geoData.length > 0) {
        console.log('Datos geográficos resueltos:', geoData[0]);
      }
    }
    
    console.log('\n✅ INSPECCIÓN GEOGRÁFICA COMPLETADA');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    try {
      const { sequelize } = await import('./src/models/index.js');
      await sequelize.close();
    } catch (closeError) {
      console.error('Error cerrando conexión:', closeError.message);
    }
  }
}

inspectGeoTables();