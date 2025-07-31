import sequelize from './config/sequelize.js';
import authService from './src/services/authService.js';

const testSpanishFieldsLogin = async () => {
  try {
    console.log('🔐 Probando login con campos en español...');

    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Probar login con campos en español
    const loginResult = await authService.loginUser('admin@parroquia.com', 'admin123');

    console.log('✅ Login exitoso con campos en español');
    console.log('📄 Respuesta del login:');
    console.log(JSON.stringify(loginResult, null, 2));

    // Verificar que no hay campos en inglés
    const user = loginResult.user;
    const englishFields = ['email', 'firstName', 'secondName', 'lastName', 'secondLastName', 'isActive', 'role', 'status'];
    const foundEnglishFields = englishFields.filter(field => user.hasOwnProperty(field));
    
    if (foundEnglishFields.length > 0) {
      console.log('❌ Se encontraron campos en inglés:', foundEnglishFields);
    } else {
      console.log('✅ Perfecto: Solo campos en español encontrados');
    }

    // Verificar campos requeridos en español
    const spanishFields = ['correo_electronico', 'primer_nombre', 'primer_apellido', 'activo'];
    const missingSpanishFields = spanishFields.filter(field => !user.hasOwnProperty(field));
    
    if (missingSpanishFields.length === 0) {
      console.log('✅ Todos los campos requeridos en español están presentes');
    } else {
      console.log('❌ Campos faltantes en español:', missingSpanishFields);
    }

    // Verificar roles
    if (user.roles && Array.isArray(user.roles)) {
      console.log('✅ Roles encontrados:', user.roles);
    } else {
      console.log('❌ Roles no encontrados o formato incorrecto');
    }

    console.log('✅ Prueba completada');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  } finally {
    await sequelize.close();
  }
};

testSpanishFieldsLogin();
