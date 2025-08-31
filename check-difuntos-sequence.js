import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: false
});

async function checkDifuntosSequence() {
  try {
    // Buscar todas las secuencias
    const [allSeqs] = await sequelize.query('SELECT sequence_name FROM information_schema.sequences');
    console.log('🔢 Todas las secuencias:');
    allSeqs.forEach(seq => console.log(`  - ${seq.sequence_name}`));
    
    // Verificar si el campo tiene auto increment
    const [colInfo] = await sequelize.query(`
      SELECT column_name, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'difuntos_familia' AND column_name = 'id_difunto'
    `);
    console.log('\n🆔 Info del campo id_difunto:');
    console.log(colInfo[0]);
    
    // Obtener el máximo ID actual
    const [maxId] = await sequelize.query('SELECT COALESCE(MAX(id_difunto), 0) as max_id FROM difuntos_familia');
    console.log(`\n📊 ID máximo actual en difuntos_familia: ${maxId[0].max_id}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkDifuntosSequence();
