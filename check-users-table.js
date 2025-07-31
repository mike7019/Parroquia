import sequelize from './config/sequelize.js';

async function checkUsersTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    console.log('\n📋 Estructura de la tabla usuarios:');
    const [structure] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    console.table(structure);

    console.log('\n📊 Datos existentes:');
    const [data] = await sequelize.query('SELECT * FROM usuarios;');
    console.table(data);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkUsersTable();
