import { sequelize } from './src/models/index.js';

async function testParroquiaBasic() {
  try {
    console.log('Iniciando test básico de Parroquia...');
    
    await sequelize.authenticate();
    console.log('Conexión exitosa');
    
    const result = await sequelize.query('SELECT COUNT(*) as total FROM parroquia');
    console.log('Total parroquias:', result[0][0].total);
    
    await sequelize.close();
    console.log('Test completado');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testParroquiaBasic();
