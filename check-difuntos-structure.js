import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: false
});

async function checkDifuntosStructure() {
  try {
    console.log('🔍 Verificando estructura de tabla difuntos_familia...');
    
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'difuntos_familia' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Estructura de tabla difuntos_familia:');
    results.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''} ${col.column_default ? '(Default: ' + col.column_default + ')' : ''}`);
    });
    
    const [sequences] = await sequelize.query(`
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_name LIKE '%difunto%'
    `);
    
    console.log('\n🔢 Secuencias relacionadas con difuntos:');
    sequences.forEach(seq => console.log(`  - ${seq.sequence_name}`));
    
    // Obtener el siguiente valor de la secuencia
    const [nextVal] = await sequelize.query(`SELECT nextval('difuntos_familia_id_difunto_seq') as next_id`);
    console.log(`\n🆔 Próximo ID disponible: ${nextVal[0].next_id}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkDifuntosStructure();
