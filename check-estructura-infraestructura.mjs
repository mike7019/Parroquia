import sequelize from './config/sequelize.js';

const tablas = ['tipos_vivienda', 'sistemas_acueducto', 'tipos_aguas_residuales', 'tipos_disposicion_basura'];

try {
  for (const tabla of tablas) {
    console.log(`\n📋 Estructura de ${tabla}:`);
    const query = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = '${tabla}' 
      ORDER BY ordinal_position;
    `;
    const [results] = await sequelize.query(query);
    results.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
  }
  process.exit(0);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
