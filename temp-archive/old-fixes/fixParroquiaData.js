import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

async function fixParroquiaData() {
  try {
    console.log('🔧 Arreglando datos de la tabla parroquia...');
    
    // Verificar datos nulos en parroquia
    const nullMunicipios = await sequelize.query(
      'SELECT COUNT(*) as count FROM parroquia WHERE id_municipio IS NULL',
      { type: QueryTypes.SELECT }
    );
    
    console.log(`📊 Registros con id_municipio NULL: ${nullMunicipios[0].count}`);
    
    if (nullMunicipios[0].count > 0) {
      // Obtener el primer municipio disponible para usar como default
      const firstMunicipio = await sequelize.query(
        'SELECT id_municipio FROM municipios ORDER BY id_municipio LIMIT 1',
        { type: QueryTypes.SELECT }
      );
      
      if (firstMunicipio.length > 0) {
        const defaultMunicipioId = firstMunicipio[0].id_municipio;
        console.log(`🔄 Asignando municipio por defecto (ID: ${defaultMunicipioId}) a registros NULL...`);
        
        const result = await sequelize.query(
          'UPDATE parroquia SET id_municipio = :municipioId WHERE id_municipio IS NULL',
          {
            replacements: { municipioId: defaultMunicipioId },
            type: QueryTypes.UPDATE
          }
        );
        
        console.log(`✅ Actualizados ${result[1]} registros`);
      } else {
        console.log('❌ No hay municipios disponibles para asignar');
      }
    } else {
      console.log('✅ No hay registros con id_municipio NULL');
    }
    
    // Verificar otros posibles problemas de datos
    console.log('\n🔍 Verificando integridad de datos...');
    
    // Verificar parroquias huérfanas (que referencian municipios que no existen)
    const orphanParroquias = await sequelize.query(`
      SELECT p.id_parroquia, p.nombre, p.id_municipio 
      FROM parroquia p 
      LEFT JOIN municipios m ON p.id_municipio = m.id_municipio 
      WHERE m.id_municipio IS NULL
    `, { type: QueryTypes.SELECT });
    
    console.log(`📊 Parroquias huérfanas: ${orphanParroquias.length}`);
    
    if (orphanParroquias.length > 0) {
      console.log('⚠️  Parroquias que referencian municipios inexistentes:');
      orphanParroquias.forEach(p => {
        console.log(`  - ${p.nombre} (ID: ${p.id_parroquia}) -> municipio_id: ${p.id_municipio}`);
      });
      
      // Asignar el primer municipio disponible a las parroquias huérfanas
      const firstMunicipio = await sequelize.query(
        'SELECT id_municipio FROM municipios ORDER BY id_municipio LIMIT 1',
        { type: QueryTypes.SELECT }
      );
      
      if (firstMunicipio.length > 0) {
        const defaultMunicipioId = firstMunicipio[0].id_municipio;
        console.log(`🔄 Asignando municipio por defecto (ID: ${defaultMunicipioId}) a parroquias huérfanas...`);
        
        for (const parroquia of orphanParroquias) {
          await sequelize.query(
            'UPDATE parroquia SET id_municipio = :municipioId WHERE id_parroquia = :parroquiaId',
            {
              replacements: { 
                municipioId: defaultMunicipioId,
                parroquiaId: parroquia.id_parroquia
              },
              type: QueryTypes.UPDATE
            }
          );
        }
        
        console.log(`✅ Corregidas ${orphanParroquias.length} parroquias huérfanas`);
      }
    }
    
    console.log('✅ Corrección de datos completada');
    
  } catch (error) {
    console.error('❌ Error corrigiendo datos:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Solo ejecutar si el archivo se ejecuta directamente
if (process.argv[1] === new URL(import.meta.url).pathname) {
  fixParroquiaData();
}

export default fixParroquiaData;
