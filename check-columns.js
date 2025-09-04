import { Sequelize } from 'sequelize';

const remoteDB = new Sequelize('parroquia_db', 'parroquia_user', 'ParroquiaSecure2025', {
  host: '206.62.139.100', port: 5432, dialect: 'postgres', logging: false
});

try {
  await remoteDB.authenticate();
  
  console.log('📋 COLUMNAS COMUNION EN FAMILIAS:');
  const [famCols] = await remoteDB.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'familias' AND column_name LIKE '%comunion%'
  `);
  famCols.forEach(col => console.log(`   ${col.column_name}`));
  
  console.log('\n📋 COLUMNAS IDENTIFICACION EN PERSONAS:');
  const [persCols] = await remoteDB.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'personas' AND column_name LIKE '%identif%'
  `);
  persCols.forEach(col => console.log(`   ${col.column_name}`));
  
  await remoteDB.close();
  console.log('\n✅ Verificación completada');
} catch(e) { 
  console.error('❌ Error:', e.message); 
}
