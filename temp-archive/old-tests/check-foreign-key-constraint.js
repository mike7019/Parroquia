import sequelize from './config/sequelize.js';

async function checkForeignKeyConstraint() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // Check the foreign key constraint details
    const constraints = await sequelize.query(`
      SELECT 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name='veredas';
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('Foreign key constraints on veredas table:');
    constraints.forEach(c => {
      console.log(`${c.column_name} -> ${c.foreign_table_name}.${c.foreign_column_name}`);
    });
    
    // Check municipios table structure
    console.log('\nMunicipios table structure:');
    const municipiosInfo = await sequelize.getQueryInterface().describeTable('municipios');
    Object.keys(municipiosInfo).forEach(column => {
      if (column.includes('id')) {
        console.log(`${column}: ${municipiosInfo[column].type}`);
      }
    });
    
    // Check what municipio IDs actually exist
    console.log('\nActual municipio IDs in database:');
    const municipios = await sequelize.query('SELECT id_municipio FROM municipios LIMIT 10', {
      type: sequelize.QueryTypes.SELECT
    });
    console.log('Available IDs:', municipios.map(m => m.id_municipio));
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    await sequelize.close();
  }
}

checkForeignKeyConstraint();
