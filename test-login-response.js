import sequelize from './config/sequelize.js';
import { User, Role } from './src/models/index.js';

const testLoginResponse = async () => {
  try {
    console.log('🔧 Probando respuesta de login...');

    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Buscar el usuario admin con roles incluidos
    const user = await User.findOne({
      where: { correo_electronico: 'admin@parroquia.com' },
      include: [{
        model: Role,
        as: 'roles',
        through: { attributes: [] }
      }]
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('👤 Usuario encontrado');

    // Simular lo que devolvería el login
    const loginResponse = {
      status: 'success',
      message: 'Login exitoso',
      data: {
        user: user.toJSON(),
        accessToken: 'fake_access_token',
        refreshToken: 'fake_refresh_token'
      }
    };

    console.log('📄 Respuesta de login simulada:');
    console.log(JSON.stringify(loginResponse, null, 2));

    // Verificar que no hay campos en inglés
    const userJson = user.toJSON();
    const englishFields = ['email', 'firstName', 'secondName', 'lastName', 'secondLastName', 'isActive', 'role', 'status'];
    const foundEnglishFields = englishFields.filter(field => userJson.hasOwnProperty(field));
    
    if (foundEnglishFields.length > 0) {
      console.log('❌ Se encontraron campos en inglés:', foundEnglishFields);
    } else {
      console.log('✅ No se encontraron campos en inglés - solo campos en español');
    }

    console.log('✅ Prueba completada');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await sequelize.close();
  }
};

testLoginResponse();
