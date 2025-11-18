import { QueryTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

async function verificarCentroPoblado() {
  try {
    console.log('🔍 Verificando centro poblado para familia ID 3...\n');
    
    const [familia] = await sequelize.query(`
      SELECT 
        f.id_familia,
        f.apellido_familiar,
        f.id_centro_poblado,
        f.id_corregimiento,
        f.id_municipio,
        cp.nombre as nombre_centro_poblado,
        corr.nombre as nombre_corregimiento,
        m.nombre_municipio
      FROM familias f
      LEFT JOIN centros_poblados cp ON f.id_centro_poblado = cp.id_centro_poblado
      LEFT JOIN corregimientos corr ON f.id_corregimiento = corr.id_corregimiento
      LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
      WHERE f.id_familia = 3
    `, {
      type: QueryTypes.SELECT
    });
    
    if (!familia) {
      console.log('❌ No se encontró la familia con ID 3');
    } else {
      console.log('✅ Familia encontrada:');
      console.log('   Apellido:', familia.apellido_familiar);
      console.log('   ID Centro Poblado:', familia.id_centro_poblado || 'NULL');
      console.log('   Nombre Centro Poblado:', familia.nombre_centro_poblado || 'NULL');
      console.log('   ID Corregimiento:', familia.id_corregimiento || 'NULL');
      console.log('   Nombre Corregimiento:', familia.nombre_corregimiento || 'NULL');
      console.log('   ID Municipio:', familia.id_municipio || 'NULL');
      console.log('   Nombre Municipio:', familia.nombre_municipio || 'NULL');
      
      if (!familia.id_centro_poblado) {
        console.log('\n⚠️  La familia NO tiene centro poblado asignado en la base de datos');
        console.log('   Esto es normal si no se seleccionó un centro poblado al crear/editar la familia');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarCentroPoblado();
