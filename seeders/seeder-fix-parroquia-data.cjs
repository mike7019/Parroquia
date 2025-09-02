const { Sequelize } = require('sequelize');
const path = require('path');

// Configuración de la base de datos
const sequelize = new Sequelize({
  host: 'localhost',
  port: 5432,
  database: 'parroquia_db',
  username: 'parroquia_user',
  password: 'ParroquiaSecure2025',
  dialect: 'postgresql',
  logging: console.log
});

async function fixParroquiaData() {
  try {
    console.log('🔧 Iniciando corrección de datos de parroquia...');
    
    // 1. Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // 2. Verificar parroquias con municipios inexistentes
    const [problemParroquias] = await sequelize.query(`
      SELECT p.id_parroquia, p.nombre, p.id_municipio 
      FROM parroquia p 
      WHERE p.id_municipio NOT IN (SELECT id_municipio FROM municipios)
    `);

    if (problemParroquias.length > 0) {
      console.log('⚠️  Parroquias con municipios inexistentes encontradas:');
      problemParroquias.forEach(p => {
        console.log(`   - ID: ${p.id_parroquia}, Nombre: ${p.nombre}, Municipio inexistente: ${p.id_municipio}`);
      });

      // 3. Obtener el primer municipio válido disponible
      const [firstMunicipio] = await sequelize.query(`
        SELECT id_municipio, nombre_municipio 
        FROM municipios 
        ORDER BY id_municipio 
        LIMIT 1
      `);

      if (firstMunicipio.length > 0) {
        const validMunicipioId = firstMunicipio[0].id_municipio;
        const validMunicipioName = firstMunicipio[0].nombre_municipio;
        
        console.log(`🔄 Corrigiendo referencias a municipio válido: ${validMunicipioId} (${validMunicipioName})`);

        // 4. Actualizar parroquias problemáticas
        for (const parroquia of problemParroquias) {
          await sequelize.query(`
            UPDATE parroquia 
            SET id_municipio = :validMunicipioId 
            WHERE id_parroquia = :parroquiaId
          `, {
            replacements: { 
              validMunicipioId: validMunicipioId,
              parroquiaId: parroquia.id_parroquia 
            }
          });
          
          console.log(`   ✅ Parroquia "${parroquia.nombre}" actualizada a municipio ${validMunicipioId}`);
        }
      } else {
        console.error('❌ No se encontraron municipios válidos en la base de datos');
        return;
      }
    } else {
      console.log('✅ No se encontraron parroquias con referencias inválidas');
    }

    // 5. Verificar integridad final
    console.log('\n🔍 Verificando integridad final...');
    const [finalCheck] = await sequelize.query(`
      SELECT COUNT(*) as total_parroquias,
             COUNT(DISTINCT id_municipio) as municipios_referenciados
      FROM parroquia p
      WHERE p.id_municipio IN (SELECT id_municipio FROM municipios)
    `);

    console.log(`📊 Estadísticas finales:`);
    console.log(`   - Total parroquias: ${finalCheck[0].total_parroquias}`);
    console.log(`   - Municipios referenciados: ${finalCheck[0].municipios_referenciados}`);

    // 6. Mostrar algunas parroquias de ejemplo
    const [sampleParroquias] = await sequelize.query(`
      SELECT p.id_parroquia, p.nombre, p.id_municipio, m.nombre_municipio
      FROM parroquia p
      JOIN municipios m ON p.id_municipio = m.id_municipio
      ORDER BY p.id_parroquia
      LIMIT 5
    `);

    console.log('\n📋 Muestra de parroquias corregidas:');
    sampleParroquias.forEach(p => {
      console.log(`   - ${p.nombre} (Municipio: ${p.nombre_municipio})`);
    });

    console.log('\n✅ Corrección de datos completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la corrección:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  fixParroquiaData();
}

module.exports = { fixParroquiaData };
