const { Sequelize } = require('sequelize');

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

async function seedSectores() {
  try {
    console.log('🌱 Creando datos de prueba para sectores...');
    
    // 1. Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // 2. Obtener algunos municipios válidos
    const [municipios] = await sequelize.query(`
      SELECT id_municipio, nombre_municipio 
      FROM municipios 
      ORDER BY id_municipio 
      LIMIT 3
    `);

    if (municipios.length === 0) {
      throw new Error('No hay municipios disponibles para crear sectores');
    }

    console.log(`📍 Municipios disponibles para crear sectores:`);
    municipios.forEach(m => {
      console.log(`   - ID: ${m.id_municipio}, Nombre: ${m.nombre_municipio}`);
    });

    // 3. Crear sectores de prueba
    const sectoresData = [
      { nombre: 'Centro', id_municipio: municipios[0].id_municipio },
      { nombre: 'Norte', id_municipio: municipios[0].id_municipio },
      { nombre: 'Sur', id_municipio: municipios[0].id_municipio },
      { nombre: 'Centro', id_municipio: municipios[1].id_municipio },
      { nombre: 'Oriente', id_municipio: municipios[1].id_municipio },
      { nombre: 'Occidente', id_municipio: municipios[2].id_municipio },
      { nombre: 'Rural', id_municipio: municipios[2].id_municipio }
    ];

    console.log('\n🏗️  Creando sectores...');
    
    for (const sectorData of sectoresData) {
      await sequelize.query(`
        INSERT INTO sectores (nombre, id_municipio, created_at, updated_at) 
        VALUES (:nombre, :id_municipio, NOW(), NOW())
      `, {
        replacements: sectorData
      });
      
      console.log(`   ✅ Creado: ${sectorData.nombre} (Municipio: ${sectorData.id_municipio})`);
    }

    // 4. Verificar resultados
    const [createdSectores] = await sequelize.query(`
      SELECT s.id_sector, s.nombre, s.id_municipio, m.nombre_municipio
      FROM sectores s
      JOIN municipios m ON s.id_municipio = m.id_municipio
      ORDER BY s.id_sector
    `);

    console.log('\n📊 Sectores creados exitosamente:');
    createdSectores.forEach(s => {
      console.log(`   - ID: ${s.id_sector}, Nombre: ${s.nombre}, Municipio: ${s.nombre_municipio}`);
    });

    console.log(`\n✅ Se crearon ${createdSectores.length} sectores de prueba`);

  } catch (error) {
    console.error('❌ Error durante la creación de sectores:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedSectores();
}

module.exports = { seedSectores };
