import { QueryTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

async function verificarFamilia4() {
  try {
    console.log('🔍 Verificando familia ID 4 y su centro poblado...\n');
    
    const [familia] = await sequelize.query(`
      SELECT 
        f.id_familia,
        f.apellido_familiar,
        f.id_centro_poblado,
        f.id_corregimiento,
        f.id_municipio,
        f.id_sector,
        f.id_vereda,
        cp.nombre as nombre_centro_poblado,
        corr.nombre as nombre_corregimiento,
        m.nombre_municipio
      FROM familias f
      LEFT JOIN centros_poblados cp ON f.id_centro_poblado = cp.id_centro_poblado
      LEFT JOIN corregimientos corr ON f.id_corregimiento = corr.id_corregimiento
      LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
      WHERE f.id_familia = 4
    `, {
      type: QueryTypes.SELECT
    });
    
    if (!familia) {
      console.log('❌ No se encontró la familia con ID 4');
    } else {
      console.log('✅ Familia encontrada:');
      console.log('   ID:', familia.id_familia);
      console.log('   Apellido:', familia.apellido_familiar);
      console.log('\n📍 Datos geográficos:');
      console.log('   ID Municipio:', familia.id_municipio || 'NULL', '→', familia.nombre_municipio || 'NULL');
      console.log('   ID Sector:', familia.id_sector || 'NULL');
      console.log('   ID Vereda:', familia.id_vereda || 'NULL');
      console.log('   ID Corregimiento:', familia.id_corregimiento || 'NULL', '→', familia.nombre_corregimiento || 'NULL');
      console.log('   ID Centro Poblado:', familia.id_centro_poblado || 'NULL', '→', familia.nombre_centro_poblado || 'NULL');
      
      if (!familia.id_centro_poblado) {
        console.log('\n⚠️  PROBLEMA: La familia NO tiene id_centro_poblado en la base de datos');
        console.log('   Esto significa que el campo NO se está guardando al crear/actualizar la familia');
        console.log('   Revisa el controlador de creación de encuestas para ver si está mapeando centro_poblado.id');
      } else {
        console.log('\n✅ La familia SÍ tiene centro poblado en la BD, el API debería devolverlo correctamente');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarFamilia4();
