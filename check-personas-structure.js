import sequelize from './config/sequelize.js';

async function checkPersonasStructure() {
  try {
    const [results] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'personas' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Estructura de tabla personas:');
    console.log(JSON.stringify(results, null, 2));
    
    // Buscar primary key
    const [pk] = await sequelize.query(`
      SELECT c.column_name
      FROM information_schema.table_constraints tc 
      JOIN information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name) 
      JOIN information_schema.columns AS c ON c.table_schema = tc.constraint_schema
        AND tc.table_name = c.table_name AND ccu.column_name = c.column_name
      WHERE constraint_type = 'PRIMARY KEY' AND tc.table_name = 'personas'
    `);
    
    console.log('\n🔑 Primary Key:');
    console.log(JSON.stringify(pk, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkPersonasStructure();
