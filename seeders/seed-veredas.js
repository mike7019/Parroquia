import sequelize from '../config/sequelize.js';

/**
 * Seeder específico para veredas
 * Este seeder crea veredas usando municipios existentes en la base de datos
 */

async function seedVeredas() {
  try {
    console.log('🌾 INICIANDO SEEDER DE VEREDAS');
    console.log('==============================');

    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');

    // Primero, obtener municipios existentes
    console.log('\n🔍 Obteniendo municipios existentes...');
    const [municipios] = await sequelize.query(`
      SELECT codigo, nombre 
      FROM municipios 
      ORDER BY nombre 
      LIMIT 10
    `);

    if (municipios.length === 0) {
      console.log('⚠️ No hay municipios en la base de datos');
      console.log('📋 Ejecuta primero los seeders de departamentos y municipios');
      return false;
    }

    console.log(`📊 Encontrados ${municipios.length} municipios`);
    municipios.forEach(m => console.log(`   - ${m.nombre} (${m.codigo})`));

    // Crear veredas para cada municipio
    const veredasPorMunicipio = [
      'Centro Rural',
      'La Esperanza',
      'El Progreso',
      'San José',
      'La Paz',
      'Buenos Aires',
      'El Carmen',
      'Santa Rosa',
      'La Victoria',
      'San Antonio'
    ];

    console.log('\n🌾 Insertando veredas...');
    let veredasInsertadas = 0;

    for (const municipio of municipios.slice(0, 5)) { // Solo primeros 5 municipios
      for (const [index, nombreBase] of veredasPorMunicipio.entries()) {
        if (index >= 3) break; // Solo 3 veredas por municipio

        const nombreVereda = `${nombreBase} - ${municipio.nombre}`;

        try {
          // Verificar si la vereda ya existe
          const [existente] = await sequelize.query(`
            SELECT id FROM veredas 
            WHERE nombre = :nombre AND id_municipio_municipios = :municipio_id
          `, {
            replacements: {
              nombre: nombreVereda,
              municipio_id: municipio.codigo
            }
          });

          if (existente.length === 0) {
            await sequelize.query(`
              INSERT INTO veredas (nombre, id_municipio_municipios, created_at, updated_at)
              VALUES (:nombre, :municipio_id, NOW(), NOW())
            `, {
              replacements: {
                nombre: nombreVereda,
                municipio_id: municipio.codigo
              }
            });

            console.log(`   ✅ ${nombreVereda}`);
            veredasInsertadas++;
          } else {
            console.log(`   ⚠️ Ya existe: ${nombreVereda}`);
          }
        } catch (error) {
          console.log(`   ❌ Error con ${nombreVereda}: ${error.message}`);
        }
      }
    }

    // Obtener estadísticas finales
    const [totalVeredas] = await sequelize.query(`SELECT COUNT(*) as count FROM veredas`);

    console.log('\n📊 RESUMEN DE VEREDAS:');
    console.log(`   ✅ Veredas insertadas en esta ejecución: ${veredasInsertadas}`);
    console.log(`   📄 Total veredas en la base de datos: ${totalVeredas[0].count}`);

    // Mostrar muestra de veredas creadas
    if (veredasInsertadas > 0) {
      const [muestra] = await sequelize.query(`
        SELECT v.nombre, m.nombre as municipio_nombre
        FROM veredas v
        JOIN municipios m ON v.id_municipio_municipios = m.codigo
        ORDER BY v.created_at DESC
        LIMIT 5
      `);

      console.log('\n📋 Últimas veredas creadas:');
      muestra.forEach(v => {
        console.log(`   - ${v.nombre} (${v.municipio_nombre})`);
      });
    }

    console.log('\n🎯 SEEDER DE VEREDAS COMPLETADO EXITOSAMENTE');
    return true;

  } catch (error) {
    console.error('\n❌ ERROR EN SEEDER DE VEREDAS:');
    console.error(error);
    return false;
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedVeredas()
    .then((success) => {
      if (success) {
        console.log('\n✅ Seeder de veredas ejecutado exitosamente');
        process.exit(0);
      } else {
        console.log('\n❌ Seeder de veredas falló');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n💥 Error fatal en seeder de veredas:', error);
      process.exit(1);
    })
    .finally(() => {
      sequelize.close();
    });
}

export default seedVeredas;
