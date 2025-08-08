import fetch from 'node-fetch';

async function testSexosEndpoint() {
  try {
    // First, let's try to authenticate to get a token
    console.log('Testing sexos endpoint...');
    
    // For testing, let's first add some test data to the sexo table
    import('./config/sequelize.js').then(async ({ default: sequelize }) => {
      try {
        await sequelize.authenticate();
        console.log('Database connected successfully');
        
        // Insert some test data
        const [existingData] = await sequelize.query('SELECT COUNT(*) as count FROM sexo');
        if (existingData[0].count === '0') {
          await sequelize.query(`
            INSERT INTO sexo (descripcion) VALUES 
            ('Masculino'), 
            ('Femenino')
          `);
          console.log('Test data inserted successfully');
        } else {
          console.log('Test data already exists');
        }
        
        // Now test the model directly
        const Sexo = sequelize.models.Sexo;
        const sexos = await Sexo.findAll();
        console.log('Sexos from model:', sexos);
        
      } catch (error) {
        console.error('Database error:', error.message);
      } finally {
        await sequelize.close();
      }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSexosEndpoint();
