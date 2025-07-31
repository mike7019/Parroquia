import sequelize from './config/sequelize.js';
import authService from './src/services/authService.js';

const testSpanishFieldsRegister = async () => {
  try {
    console.log('📝 Probando registro con campos en español...');

    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Datos de prueba en español
    const userData = {
      correo_electronico: 'prueba.campos@test.com',
      contrasena: 'MiPassword123!',
      primer_nombre: 'Carlos',
      segundo_nombre: 'Eduardo',
      primer_apellido: 'Ramírez',
      segundo_apellido: 'González',
      telefono: '+57 300 123 4567'
    };

    console.log('📋 Datos de registro en español:', userData);

    // Verificar si el usuario ya existe y eliminarlo
    const existingUser = await sequelize.query(
      'SELECT id FROM usuarios WHERE correo_electronico = $1',
      {
        bind: [userData.correo_electronico],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (existingUser.length > 0) {
      await sequelize.query('DELETE FROM usuarios_roles WHERE id_usuarios = $1', {
        bind: [existingUser[0].id]
      });
      await sequelize.query('DELETE FROM usuarios WHERE correo_electronico = $1', {
        bind: [userData.correo_electronico]
      });
      console.log('🧹 Usuario de prueba anterior eliminado');
    }

    // Probar registro
    const registerResult = await authService.registerUser(userData);

    console.log('✅ Registro exitoso con campos en español');
    console.log('📄 Respuesta del registro:');
    console.log(JSON.stringify(registerResult.user, null, 2));

    // Verificar que no hay campos en inglés
    const user = registerResult.user;
    const englishFields = ['email', 'firstName', 'secondName', 'lastName', 'secondLastName', 'isActive', 'role', 'status'];
    const foundEnglishFields = englishFields.filter(field => user.hasOwnProperty(field));
    
    if (foundEnglishFields.length > 0) {
      console.log('❌ Se encontraron campos en inglés:', foundEnglishFields);
    } else {
      console.log('✅ Perfecto: Solo campos en español encontrados');
    }

    // Verificar roles por defecto
    if (user.roles && user.roles.includes('Encuestador')) {
      console.log('✅ Rol por defecto "Encuestador" asignado correctamente');
    } else {
      console.log('❌ Rol por defecto no asignado correctamente. Roles:', user.roles);
    }

    // Limpiar usuario de prueba
    await sequelize.query('DELETE FROM usuarios_roles WHERE id_usuarios = $1', {
      bind: [user.id]
    });
    await sequelize.query('DELETE FROM usuarios WHERE id = $1', {
      bind: [user.id]
    });
    console.log('🧹 Usuario de prueba eliminado');

    console.log('✅ Prueba de registro completada exitosamente');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Detalles:', error);
  } finally {
    await sequelize.close();
  }
};

testSpanishFieldsRegister();
