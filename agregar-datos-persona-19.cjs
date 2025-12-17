const { Sequelize, QueryTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
  }
);

async function agregarDatosPersona19() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');

    // Insertar celebraciones para persona 19
    console.log('📅 Insertando celebraciones...');
    await sequelize.query(`
      INSERT INTO persona_celebracion (id_persona, motivo, dia, mes, created_at, updated_at)
      VALUES 
        (19, 'Cumpleaños', 12, 11, NOW(), NOW()),
        (19, 'Dia de la madre', 8, 5, NOW(), NOW())
      ON CONFLICT (id_persona, motivo, dia, mes) DO NOTHING
    `);
    console.log('  ✅ 2 celebraciones insertadas');

    // Insertar enfermedades para persona 19
    console.log('\n🏥 Insertando enfermedades...');
    await sequelize.query(`
      INSERT INTO persona_enfermedad (id_persona, id_enfermedad, created_at, updated_at)
      VALUES 
        (19, 76, NOW(), NOW()),
        (19, 67, NOW(), NOW())
      ON CONFLICT (id_persona, id_enfermedad) DO NOTHING
    `);
    console.log('  ✅ 2 enfermedades insertadas');

    // Verificar
    console.log('\n🔍 Verificando datos insertados...');
    const celebraciones = await sequelize.query(`
      SELECT * FROM persona_celebracion WHERE id_persona = 19
    `, { type: QueryTypes.SELECT });
    
    const enfermedades = await sequelize.query(`
      SELECT pe.*, e.nombre 
      FROM persona_enfermedad pe
      JOIN enfermedades e ON pe.id_enfermedad = e.id_enfermedad
      WHERE pe.id_persona = 19
    `, { type: QueryTypes.SELECT });

    console.log(`\n📊 RESULTADO:`);
    console.log(`   Celebraciones: ${celebraciones.length}`);
    celebraciones.forEach(c => {
      console.log(`     - ${c.motivo}: ${c.dia}/${c.mes}`);
    });
    
    console.log(`   Enfermedades: ${enfermedades.length}`);
    enfermedades.forEach(e => {
      console.log(`     - ${e.nombre} (ID: ${e.id_enfermedad})`);
    });

    console.log('\n✅ ¡Datos agregados exitosamente!');
    console.log('Ahora puedes consultar la encuesta 23 y verás las celebraciones y enfermedades.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

agregarDatosPersona19();
