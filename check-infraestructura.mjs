import sequelize from './config/sequelize.js';

const tablasInfraestructura = [
  'tipos_vivienda',
  'sistemas_acueducto', 
  'tipos_aguas_residuales',
  'tipos_disposicion_basura'
];

try {
  console.log('Verificando tablas de infraestructura...\n');
  
  for (const tabla of tablasInfraestructura) {
    try {
      const query = `SELECT COUNT(*) as count FROM ${tabla} LIMIT 1`;
      const [result] = await sequelize.query(query);
      console.log(`✅ ${tabla}: existe (${result[0].count} registros)`);
    } catch (error) {
      console.log(`❌ ${tabla}: no existe o error - ${error.message}`);
    }
  }
  
  process.exit(0);
} catch (error) {
  console.error('Error general:', error.message);
  process.exit(1);
}
