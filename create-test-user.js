import { Usuario, Role, sequelize } from './src/models/index.js';
import bcrypt from 'bcrypt';

async function createTestUser() {
  try {
    console.log('🔍 Creando usuario de prueba para debugging...');
    
    // Buscar el rol de administrador
    const adminRole = await Role.findOne({
      where: { nombre: 'Administrador' }
    });
    
    if (!adminRole) {
      throw new Error('No se encontró el rol Administrador');
    }
    
    console.log('✅ Rol encontrado:', adminRole.nombre);
    
    // Verificar si el usuario ya existe
    const existingUser = await Usuario.findOne({
      where: { correo_electronico: 'test.admin@yopmail.com' }
    });
    
    if (existingUser) {
      console.log('👤 Usuario de prueba ya existe:', existingUser.correo_electronico);
      console.log('Intentando actualizar contraseña...');
      
      const hashedPassword = await bcrypt.hash('testpassword123', 10);
      await existingUser.update({ contrasena: hashedPassword });
      
      console.log('✅ Contraseña actualizada');
      console.log('📧 Email:', existingUser.correo_electronico);
      console.log('🔑 Contraseña: testpassword123');
      return;
    }
    
    // Crear nuevo usuario
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    
    const testUser = await Usuario.create({
      correo_electronico: 'test.admin@yopmail.com',
      contrasena: hashedPassword,
      primer_nombre: 'Test',
      primer_apellido: 'Admin',
      activo: true,
      email_verificado: true
    });
    
    // Asignar rol de administrador
    await testUser.addRole(adminRole);
    
    console.log('✅ Usuario de prueba creado exitosamente:');
    console.log('📧 Email: test.admin@yopmail.com');
    console.log('🔑 Contraseña: testpassword123');
    console.log('👥 Rol: Administrador');
    console.log('🆔 UUID:', testUser.id);
    
  } catch (error) {
    console.error('❌ Error creando usuario de prueba:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

createTestUser().catch(console.error);
