import sequelize from './config/sequelize.js';

const checkTableStructure = async () => {
  try {
    const query = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios_roles'
      ORDER BY ordinal_position;
    `;
    
    const [results] = await sequelize.query(query);
    console.log('Estructura de la tabla usuarios_roles:', results);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
};

checkTableStructure();
