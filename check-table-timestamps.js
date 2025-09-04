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
  
  console.log('🔍 VERIFICANDO ESTRUCTURA DE TABLAS CRÍTICAS:');
  console.log('');
  
  // Verificar familia_sistema_acueducto
  console.log('💧 FAMILIA_SISTEMA_ACUEDUCTO:');
  const [acueducto] = await sequelize.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'familia_sistema_acueducto' 
    ORDER BY ordinal_position
  `);
  acueducto.forEach(col => console.log(`   ${col.column_name} (${col.data_type})`));
  
  console.log('');
  
  // Verificar familia_sistema_aguas_residuales
  console.log('🚰 FAMILIA_SISTEMA_AGUAS_RESIDUALES:');
  const [residuales] = await sequelize.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'familia_sistema_aguas_residuales' 
    ORDER BY ordinal_position
  `);
  residuales.forEach(col => console.log(`   ${col.column_name} (${col.data_type})`));
  
  console.log('');
  
  // Verificar familia_tipo_vivienda
  console.log('🏠 FAMILIA_TIPO_VIVIENDA:');
  const [vivienda] = await sequelize.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'familia_tipo_vivienda' 
    ORDER BY ordinal_position
  `);
  vivienda.forEach(col => console.log(`   ${col.column_name} (${col.data_type})`));
  
  await sequelize.close();
  console.log('\n✅ Verificación completada');
} catch(e) { 
  console.error('❌ Error:', e.message); 
}
