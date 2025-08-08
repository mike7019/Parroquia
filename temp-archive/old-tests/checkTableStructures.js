import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

async function checkTables() {
  try {
    const tables = [
      'tipos_disposicion_basura',
      'tipos_aguas_residuales',
      'sistemas_acueducto',
      'tipos_vivienda',
      'estados_civiles',
      'tipos_identificacion'
    ];

    for (const table of tables) {
      try {
        console.log(`\n=== Estructura de ${table} ===`);
        const columns = await sequelize.query(
          `SELECT column_name, data_type, is_nullable, column_default 
           FROM information_schema.columns 
           WHERE table_name = '${table}' 
           ORDER BY ordinal_position`,
          { type: QueryTypes.SELECT }
        );
        
        columns.forEach(col => {
          console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}) ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
        });
      } catch (error) {
        console.warn(`⚠️  Error verificando ${table}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTables();
