import 'dotenv/config';
import sequelize from './config/sequelize.js';
import Usuario from './src/models/Usuario.js';
import bcrypt from 'bcryptjs';

async function updateTestUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Find and update the test user
    const user = await Usuario.findOne({ 
      where: { correo_electronico: 'admin@test.com' } 
    });

    if (user) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await user.update({ contrasena: hashedPassword });
      console.log('✅ Test user password updated');
    } else {
      // Create new user if doesn't exist
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Usuario.create({
        correo_electronico: 'admin@test.com',
        primer_nombre: 'Admin',
        segundo_nombre: '',
        primer_apellido: 'Test',
        segundo_apellido: '',
        contrasena: hashedPassword,
        activo: true
      });
      console.log('✅ Test user created');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

updateTestUser();
