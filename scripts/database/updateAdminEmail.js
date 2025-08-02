import 'dotenv/config';
import bcrypt from 'bcrypt';
import sequelize from './config/sequelize.js';

const updateAdminEmail = async () => {
  try {
    console.log('🔧 Actualizando email del administrador...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Tu nuevo email
    const newEmail = 'amph7019@gmail.com';
    const adminPassword = 'Admin123!';

    // Verificar si existe un usuario administrador
    const [existingAdmin] = await sequelize.query(
      'SELECT * FROM usuarios WHERE id_usuario = 1',
      {
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (existingAdmin) {
      console.log('📧 Actualizando email del administrador existente...');
      
      // Actualizar el email del administrador
      await sequelize.query(
        'UPDATE usuarios SET correo_electronico = ? WHERE id_usuario = 1',
        {
          replacements: [newEmail]
        }
      );
      
      console.log('✅ Email del administrador actualizado exitosamente');
      
    } else {
      console.log('👤 Creando nuevo usuario administrador con tu email...');
      
      // Crear nuevo usuario administrador con tu email
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      await sequelize.query(
        `INSERT INTO usuarios (id_usuario, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo_electronico, contrasena, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            1,
            'Super',
            null,
            'Administrador',
            'Parroquia',
            newEmail,
            hashedPassword,
            'active'
          ]
        }
      );

      console.log('✅ Usuario administrador creado exitosamente');
    }

    console.log('\n📋 Credenciales del administrador:');
    console.log(`   Email: ${newEmail}`);
    console.log(`   Contraseña: ${adminPassword}`);
    console.log(`   Nombre: Super Administrador`);

    console.log('\n📧 Configuración de Email:');
    console.log('   • Email actualizado para verificación de códigos');
    console.log('   • Configurar variables de entorno para SMTP si es necesario');

    console.log('\n🌐 Para probar el login:');
    console.log('   POST /api/auth/login');
    console.log('   Body: {');
    console.log(`     "email": "${newEmail}",`);
    console.log(`     "password": "${adminPassword}"`);
    console.log('   }');

    console.log('\n📧 Variables de entorno para email (opcional):');
    console.log('   EMAIL_SERVICE=gmail');
    console.log('   EMAIL_USER=amph7019@gmail.com');
    console.log('   EMAIL_PASS=tu_app_password_de_gmail');
    console.log('   EMAIL_FROM=amph7019@gmail.com');

  } catch (error) {
    console.error('❌ Error al actualizar email del administrador:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión a la base de datos cerrada');
    process.exit(0);
  }
};

// Ejecutar el script
updateAdminEmail();
