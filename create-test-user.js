import 'dotenv/config';
import sequelize from './config/sequelize.js';
import Usuario from './src/models/Usuario.js';
import bcrypt from 'bcryptjs';

async function createTestUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check if user exists
    const existingUser = await Usuario.findOne({ 
      where: { correo_electronico: 'admin@test.com' } 
    });

    if (existingUser) {
      console.log('✅ Test user already exists');
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const testUser = await Usuario.create({
      correo_electronico: 'admin@test.com',
      primer_nombre: 'Admin',
      segundo_nombre: '',
      primer_apellido: 'Test',
      segundo_apellido: '',
      contrasena: hashedPassword,
      activo: true
    });

    console.log('✅ Test user created:', testUser.correo_electronico);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

createTestUser();
