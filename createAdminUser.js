import 'dotenv/config';
import bcrypt from 'bcrypt';
import sequelize from './config/sequelize.js';

const createAdminUser = async () => {
  try {
    console.log('🔧 Iniciando creación de usuario administrador...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Datos del usuario administrador
    const adminData = {
      id_usuario: 1,
      primer_nombre: 'Super',
      segundo_nombre: null,
      primer_apellido: 'Administrador',
      segundo_apellido: 'Parroquia',
      correo_electronico: 'admin@parroquia.com',
      password: 'Admin123!',
      status: 'active'
    };

    // Verificar si ya existe un usuario admin
    const [existingAdmin] = await sequelize.query(
      'SELECT * FROM usuarios WHERE correo_electronico = ?',
      {
        replacements: [adminData.correo_electronico],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (existingAdmin) {
      console.log('⚠️  El usuario administrador ya existe:');
      console.log(`   Email: ${existingAdmin.correo_electronico}`);
      console.log(`   Nombre: ${existingAdmin.primer_nombre} ${existingAdmin.primer_apellido}`);
      console.log(`   Estado: ${existingAdmin.status || 'active'}`);
      
      // Actualizar contraseña del admin existente
      const hashedPassword = await bcrypt.hash(adminData.password, 12);
      await sequelize.query(
        'UPDATE usuarios SET contrasena = ?, status = ? WHERE correo_electronico = ?',
        {
          replacements: [hashedPassword, 'active', adminData.correo_electronico]
        }
      );
      
      console.log('✅ Contraseña del administrador actualizada exitosamente');
      
    } else {
      // Crear nuevo usuario administrador
      const hashedPassword = await bcrypt.hash(adminData.password, 12);
      
      await sequelize.query(
        `INSERT INTO usuarios (id_usuario, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo_electronico, contrasena, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            adminData.id_usuario,
            adminData.primer_nombre,
            adminData.segundo_nombre,
            adminData.primer_apellido,
            adminData.segundo_apellido,
            adminData.correo_electronico,
            hashedPassword,
            adminData.status
          ]
        }
      );

      console.log('✅ Usuario administrador creado exitosamente');
    }

    console.log('\n📋 Credenciales del administrador:');
    console.log(`   Email: ${adminData.correo_electronico}`);
    console.log(`   Contraseña: ${adminData.password}`);
    console.log(`   Nombre: ${adminData.primer_nombre} ${adminData.primer_apellido}`);

    console.log('\n🔐 Información de seguridad:');
    console.log('   • Usuario activo por defecto');
    console.log('   • Contraseña encriptada con bcrypt');

    console.log('\n🌐 Para probar el login:');
    console.log('   POST /api/auth/login');
    console.log('   Body: {');
    console.log(`     "email": "${adminData.correo_electronico}",`);
    console.log(`     "password": "${adminData.password}"`);
    console.log('   }');

    console.log('\n⚠️  IMPORTANTE:');
    console.log('   • Cambia la contraseña después del primer login');
    console.log('   • No compartas estas credenciales');

  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión a la base de datos cerrada');
    process.exit(0);
  }
};

// Ejecutar el script
createAdminUser();
