import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST, 
  port: process.env.DB_PORT, 
  dialect: 'postgres', 
  logging: false
});

try {
  await sequelize.authenticate();
  
  console.log('🚰 TIPOS DE AGUAS RESIDUALES EXISTENTES:');
  const [tipos] = await sequelize.query('SELECT * FROM tipos_aguas_residuales ORDER BY id_tipo_aguas_residuales');
  
  tipos.forEach(tipo => {
    console.log(`   ${tipo.id_tipo_aguas_residuales}. ${tipo.nombre} - ${tipo.descripcion}`);
  });
  
  console.log(`\nTotal: ${tipos.length} tipos`);
  
  console.log('\n🔍 VERIFICANDO TABLAS RELACIONADAS:');
  const [familias] = await sequelize.query('SELECT COUNT(*) as count FROM familia_sistema_aguas_residuales');
  console.log(`   familia_sistema_aguas_residuales: ${familias[0].count} registros`);
  
  await sequelize.close();
  console.log('\n✅ Verificación completada');
} catch(e) { 
  console.error('❌ Error:', e.message); 
}
