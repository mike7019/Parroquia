import authService from './src/services/authService.js';
import sequelize from './config/sequelize.js';

const testRealLogin = async () => {
  try {
    console.log('🔐 Probando login real con el servicio de autenticación...');

    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Intentar login con credenciales de admin
    const loginResult = await authService.loginUser('admin@parroquia.com', 'admin123');

    console.log('✅ Login exitoso');
    console.log('📄 Datos del usuario devueltos:');
    console.log(JSON.stringify(loginResult.user, null, 2));

    // Verificar que no hay campos en inglés
    const englishFields = ['email', 'firstName', 'secondName', 'lastName', 'secondLastName', 'isActive', 'role', 'status'];
    const foundEnglishFields = englishFields.filter(field => loginResult.user.hasOwnProperty(field));
    
    if (foundEnglishFields.length > 0) {
      console.log('❌ Se encontraron campos en inglés:', foundEnglishFields);
    } else {
      console.log('✅ No se encontraron campos en inglés - solo campos en español');
    }

    // Verificar roles
    if (loginResult.user.roles && loginResult.user.roles.includes('Administrador')) {
      console.log('✅ Rol de Administrador encontrado correctamente');
    } else {
      console.log('❌ Rol de Administrador no encontrado o incorrecto');
      console.log('Roles encontrados:', loginResult.user.roles);
    }

    console.log('✅ Prueba de login completada exitosamente');

  } catch (error) {
    console.error('❌ Error en el login:', error.message);
    console.error('Detalles:', error);
  } finally {
    await sequelize.close();
  }
};

testRealLogin();
