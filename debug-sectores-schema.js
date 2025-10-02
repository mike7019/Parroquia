import sequelize from './config/sequelize.js';

const testSchema = async () => {
  try {
    const result = await sequelize.query(
      `SELECT column_name, data_type, is_nullable, column_default 
       FROM information_schema.columns 
       WHERE table_name = 'sectores'
       ORDER BY ordinal_position;`, 
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('Esquema de tabla sectores:');
    result.forEach(col => {
      console.log(` - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
    // Verificar si hay campos adicionales que no esperamos
    const tableInfo = await sequelize.query(
      `SELECT * FROM sectores LIMIT 0;`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('\nProbando inserción directa...');
    const testInsert = await sequelize.query(
      `INSERT INTO sectores (nombre, id_municipio, created_at, updated_at) 
       VALUES ('Test Sector', 1, NOW(), NOW()) RETURNING *;`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('✅ Inserción exitosa:', testInsert[0]);
    
    // Limpiar
    await sequelize.query(
      `DELETE FROM sectores WHERE nombre = 'Test Sector';`
    );
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testSchema();