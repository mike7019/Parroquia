import bcrypt from 'bcrypt';
import { Usuario, Role, UsuarioRole } from '../src/models/index.js';
import sequelize from '../config/sequelize.js';

async function createDefaultAdmin() {
  try {
    console.log('👤 CREANDO USUARIO ADMINISTRADOR POR DEFECTO');
    console.log('===========================================\n');

    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');

    // Datos por defecto
    const defaultData = {
      primer_nombre: 'Admin',
      segundo_nombre: null,
      primer_apellido: 'Sistema',
      segundo_apellido: null,
      correo_electronico: 'admin@parroquia.com',
      contrasena: 'Admin123!',
      numero_documento: '12345678',
      telefono: null
    };

    // Verificar si ya existe un usuario admin
    const existingAdmin = await Usuario.findOne({
      where: {
        correo_electronico: defaultData.correo_electronico
      }
    });

    if (existingAdmin) {
      console.log('⚠️  Usuario admin ya existe. Eliminando usuario anterior...');
      await existingAdmin.destroy();
      console.log('🗑️  Usuario admin anterior eliminado');
    }

    // Verificar o crear rol de Administrador
    console.log('🔐 Verificando rol de Administrador...');
    let adminRole = await Role.findOne({ where: { nombre: 'Administrador' } });
    
    if (!adminRole) {
      console.log('📝 Creando rol de Administrador...');
      adminRole = await Role.create({
        nombre: 'Administrador',
        descripcion: 'Administrador del sistema con todos los permisos'
      });
      console.log('✅ Rol de Administrador creado');
    } else {
      console.log('✅ Rol de Administrador encontrado');
    }

    // Encriptar contraseña
    console.log('🔒 Encriptando contraseña...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(defaultData.contrasena, saltRounds);

    // Crear usuario
    console.log('👤 Creando usuario administrador...');
    const adminUser = await Usuario.create({
      primer_nombre: defaultData.primer_nombre,
      segundo_nombre: defaultData.segundo_nombre,
      primer_apellido: defaultData.primer_apellido,
      segundo_apellido: defaultData.segundo_apellido,
      correo_electronico: defaultData.correo_electronico,
      contrasena: hashedPassword,
      numero_documento: defaultData.numero_documento,
      telefono: defaultData.telefono,
      activo: true,
      email_verificado: true,
      tipo_usuario: 'Administrador'
    });

    // Asignar rol
    console.log('🔗 Asignando rol de Administrador...');
    await UsuarioRole.create({
      id_usuarios: adminUser.id,
      id_roles: adminRole.id
    });

    console.log('\n🎉 ¡Usuario administrador creado exitosamente!');
    console.log('📋 CREDENCIALES POR DEFECTO:');
    console.log(`   Email: ${defaultData.correo_electronico}`);
    console.log(`   Contraseña: ${defaultData.contrasena}`);
    console.log(`   Nombre: ${defaultData.primer_nombre} ${defaultData.primer_apellido}`);
    console.log(`   Documento: ${defaultData.numero_documento}`);
    
    console.log('\n⚠️  IMPORTANTE: Cambie estas credenciales después del primer login');
    console.log('✅ Puede usar estas credenciales para hacer login en el sistema');

  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar creación
createDefaultAdmin()
  .then(() => {
    console.log('\n🎯 Proceso completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en el proceso:', error.message);
    process.exit(1);
  });
