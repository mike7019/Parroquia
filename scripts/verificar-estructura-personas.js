import sequelize from '../config/sequelize.js';

async function verificarEstructura() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');

    // Verificar estructura de personas
    console.log('📋 Estructura de la tabla personas:\n');
    const [columnas] = await sequelize.query(`
      SELECT 
        column_name, 
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'personas'
      ORDER BY ordinal_position;
    `);

    console.table(columnas);

    // Verificar primary key
    console.log('\n🔑 Primary Key de personas:\n');
    const [pk] = await sequelize.query(`
      SELECT 
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'personas' 
        AND tc.constraint_type = 'PRIMARY KEY';
    `);

    console.table(pk);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

verificarEstructura();
