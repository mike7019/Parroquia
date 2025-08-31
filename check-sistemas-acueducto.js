import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: false
});

async function checkSistemasAcueducto() {
  try {
    const [sistemas] = await sequelize.query('SELECT * FROM sistemas_acueducto LIMIT 3');
    console.log('🚿 Sistemas de acueducto disponibles:');
    sistemas.forEach(s => console.log(`  - ID: ${s.id_sistema_acueducto}, Nombre: ${s.nombre}`));
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkSistemasAcueducto();
