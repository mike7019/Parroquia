import sequelize from './config/sequelize.js';

async function checkSistemasAcueducto() {
  try {
    console.log('🔍 Verificando tablas con "acueducto"...');
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%acueducto%'"
    );
    console.log('Tablas encontradas:', tables);
    
    console.log('\n🔍 Verificando columnas de sistemas_acueducto...');
    const [columns] = await sequelize.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'sistemas_acueducto'"
    );
    console.log('Columnas:', columns);
    
    console.log('\n🔍 Verificando datos en sistemas_acueducto...');
    const [data] = await sequelize.query('SELECT * FROM sistemas_acueducto LIMIT 5');
    console.log('Datos:', data);
    
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    await sequelize.close();
    process.exit(1);
  }
}

checkSistemasAcueducto();
