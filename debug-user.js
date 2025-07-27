import sequelize from './config/sequelize.js';

async function checkUser() {
  try {
    const result = await sequelize.query('SELECT id, email, status, "isActive" FROM users WHERE id = 39', { 
      type: sequelize.QueryTypes.SELECT 
    });
    console.log('Usuario 39:', result);
    
    // También vamos a ver todos los usuarios recientes
    const recent = await sequelize.query('SELECT id, email, status, "isActive" FROM users ORDER BY id DESC LIMIT 5', { 
      type: sequelize.QueryTypes.SELECT 
    });
    console.log('Usuarios recientes:', recent);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUser();
