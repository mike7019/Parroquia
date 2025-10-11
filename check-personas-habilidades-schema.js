import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

async function checkSchema() {
  try {
    console.log('🔍 Verificando estructura de tabla persona_habilidad...\n');
    
    const columns = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'persona_habilidad'
      ORDER BY ordinal_position;
    `, { type: QueryTypes.SELECT });

    console.log('Columnas en persona_habilidad:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    console.log('\n📊 Verificando datos de ejemplo...\n');
    const sample = await sequelize.query(`
      SELECT * FROM persona_habilidad LIMIT 3;
    `, { type: QueryTypes.SELECT });

    console.log('Ejemplo de datos:');
    console.log(JSON.stringify(sample, null, 2));

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkSchema();
