import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parroquia_db',
  username: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD || 'ParroquiaSecure2025',
  dialect: 'postgresql',
  logging: false
});

async function checkMunicipios() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');

    const [municipios] = await sequelize.query(`
      SELECT id_municipio, nombre_municipio, codigo_dane
      FROM municipios
      ORDER BY id_municipio
      LIMIT 10
    `);

    console.log('📍 Primeros 10 municipios en la base de datos:');
    console.log('━'.repeat(70));
    
    if (municipios.length === 0) {
      console.log('⚠️  No hay municipios en la base de datos');
      console.log('\n💡 Necesitas cargar los municipios primero:');
      console.log('   node seed-geographic-data.js');
    } else {
      municipios.forEach(m => {
        console.log(`ID: ${String(m.id_municipio).padEnd(5)} | ${m.nombre_municipio.padEnd(30)} | DANE: ${m.codigo_dane || 'N/A'}`);
      });
      
      const [count] = await sequelize.query('SELECT COUNT(*) as total FROM municipios');
      console.log('━'.repeat(70));
      console.log(`\n📊 Total de municipios: ${count[0].total}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkMunicipios();
