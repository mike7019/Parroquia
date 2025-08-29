import sequelize from './config/sequelize.js';

const tablasCapacidades = [
  'destrezas',
  'persona_destreza', 
  'profesiones',
  'comunidades_culturales',
  'sectores',
  'veredas'
];

try {
  console.log('🔍 Verificando tablas para capacidades/destrezas...\n');
  
  for (const tabla of tablasCapacidades) {
    try {
      const query = `SELECT COUNT(*) as count FROM ${tabla} LIMIT 1`;
      const [result] = await sequelize.query(query);
      console.log(`✅ ${tabla}: existe (${result[0].count} registros)`);
    } catch (error) {
      console.log(`❌ ${tabla}: no existe - ${error.message}`);
    }
  }
  
  process.exit(0);
} catch (error) {
  console.error('Error general:', error.message);
  process.exit(1);
}
