import { sequelize } from './src/models/index.js';

async function finalParroquiaReport() {
  try {
    console.log('🔍 REPORTE FINAL - TABLA PARROQUIA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a PostgreSQL');
    
    // 1. ESTRUCTURA DE LA TABLA
    console.log('\n📊 ESTRUCTURA DE LA TABLA PARROQUIA:');
    console.log('   ┌─────────────────┬──────────────────────────┬──────────────┐');
    console.log('   │ Campo           │ Tipo                     │ Restricciones│');
    console.log('   ├─────────────────┼──────────────────────────┼──────────────┤');
    console.log('   │ id_parroquia    │ BIGINT                   │ PK, NOT NULL │');
    console.log('   │ nombre          │ CHARACTER VARYING(255)   │ NULL         │');
    console.log('   │ id_municipio    │ BIGINT                   │ FK, NULL     │');
    console.log('   └─────────────────┴──────────────────────────┴──────────────┘');
    
    // 2. CONTEO DE REGISTROS
    const totalResult = await sequelize.query('SELECT COUNT(*) as total FROM parroquia');
    const total = totalResult[0][0].total;
    console.log(`\n📈 TOTAL DE REGISTROS: ${total} parroquia(s)`);
    
    // 3. DATOS ACTUALES
    console.log('\n🏘️ DATOS ACTUALES EN LA TABLA:');
    const parroquias = await sequelize.query('SELECT * FROM parroquia ORDER BY id_parroquia');
    
    if (parroquias[0].length > 0) {
      parroquias[0].forEach((p, i) => {
        console.log(`   ${i+1}. ID: ${p.id_parroquia}`);
        console.log(`      📍 Nombre: "${p.nombre || 'Sin nombre'}"`);
        console.log(`      🏙️ ID Municipio: ${p.id_municipio || 'Sin asignar'}`);
        console.log('');
      });
    } else {
      console.log('   ❌ No hay registros en la tabla');
    }
    
    // 4. VALIDACIONES DE INTEGRIDAD
    console.log('🔍 VALIDACIONES DE INTEGRIDAD:');
    
    // 4.1 Parroquias sin nombre
    const sinNombre = await sequelize.query(`
      SELECT COUNT(*) as total FROM parroquia 
      WHERE nombre IS NULL OR TRIM(nombre) = ''
    `);
    console.log(`   • Parroquias sin nombre: ${sinNombre[0][0].total}`);
    
    // 4.2 Parroquias sin municipio
    const sinMunicipio = await sequelize.query('SELECT COUNT(*) as total FROM parroquia WHERE id_municipio IS NULL');
    console.log(`   • Parroquias sin municipio: ${sinMunicipio[0][0].total}`);
    
    // 4.3 Referencias a municipios inexistentes
    const municipiosOrfanos = await sequelize.query(`
      SELECT COUNT(*) as total FROM parroquia p
      WHERE p.id_municipio IS NOT NULL 
      AND NOT EXISTS (SELECT 1 FROM municipios m WHERE m.id_municipio = p.id_municipio)
    `);
    console.log(`   • Referencias a municipios inexistentes: ${municipiosOrfanos[0][0].total}`);
    
    // 5. ESTADO DE LA TABLA MUNICIPIOS
    console.log('\n🏙️ ESTADO DE LA TABLA MUNICIPIOS (relacionada):');
    const totalMunicipios = await sequelize.query('SELECT COUNT(*) as total FROM municipios');
    console.log(`   • Total municipios disponibles: ${totalMunicipios[0][0].total}`);
    
    // 6. RECOMENDACIONES
    console.log('\n💡 RECOMENDACIONES:');
    
    if (total == 0) {
      console.log('   ⚠️ La tabla está vacía - considerar poblar con datos iniciales');
    }
    
    if (sinNombre[0][0].total > 0) {
      console.log('   ⚠️ Hay parroquias sin nombre - revisar y completar');
    }
    
    if (sinMunicipio[0][0].total > 0 && totalMunicipios[0][0].total > 0) {
      console.log('   ⚠️ Hay parroquias sin municipio asignado - considerar asignar');
    }
    
    if (totalMunicipios[0][0].total == 0) {
      console.log('   ⚠️ No hay municipios en la base de datos - poblar tabla municipios primero');
    }
    
    if (municipiosOrfanos[0][0].total > 0) {
      console.log('   ❌ Hay referencias a municipios inexistentes - corregir integridad referencial');
    }
    
    if (total > 0 && sinNombre[0][0].total == 0 && municipiosOrfanos[0][0].total == 0) {
      console.log('   ✅ La tabla tiene una estructura correcta y datos consistentes');
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ REPORTE COMPLETADO');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.original) {
      console.error('Error de BD:', error.original.message);
    }
  } finally {
    await sequelize.close();
  }
}

finalParroquiaReport();
