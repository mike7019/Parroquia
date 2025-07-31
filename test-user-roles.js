import sequelize from './config/sequelize.js';
import { User, Role, UsuarioRole } from './src/models/index.js';

const testUserWithRoles = async () => {
  try {
    console.log('🔧 Iniciando prueba de usuario con roles...');

    // Sincronizar modelos (solo para prueba)
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Buscar el usuario admin
    const adminUser = await User.findOne({
      where: { correo_electronico: 'admin@parroquia.com' }
    });

    if (!adminUser) {
      console.log('❌ Usuario admin no encontrado');
      return;
    }

    console.log('👤 Usuario encontrado:', {
      id: adminUser.id,
      correo_electronico: adminUser.correo_electronico,
      primer_nombre: adminUser.primer_nombre,
      primer_apellido: adminUser.primer_apellido,
      activo: adminUser.activo
    });

    // Buscar el rol de Administrador
    const adminRole = await Role.findOne({
      where: { nombre: 'Administrador' }
    });

    if (!adminRole) {
      console.log('❌ Rol Administrador no encontrado');
      return;
    }

    console.log('🎭 Rol encontrado:', adminRole.nombre);

    // Verificar si ya tiene el rol asignado
    const existingAssignment = await UsuarioRole.findOne({
      where: {
        id_usuarios: adminUser.id,
        id_roles: adminRole.id
      }
    });

    if (!existingAssignment) {
      // Asignar el rol de administrador al usuario
      await UsuarioRole.create({
        id_usuarios: adminUser.id,
        id_roles: adminRole.id
      });
      console.log('✅ Rol Administrador asignado al usuario');
    } else {
      console.log('ℹ️  El usuario ya tiene el rol de Administrador asignado');
    }

    // Verificar los roles del usuario con la asociación
    const userWithRoles = await User.findByPk(adminUser.id, {
      include: [{
        model: Role,
        as: 'roles',
        through: { attributes: [] }
      }]
    });

    console.log('👤 Usuario con roles:', {
      correo_electronico: userWithRoles.correo_electronico,
      primer_nombre: userWithRoles.primer_nombre,
      roles: userWithRoles.roles.map(role => role.nombre)
    });

    // Probar el método toJSON
    console.log('📄 Datos JSON del usuario:', userWithRoles.toJSON());

    console.log('✅ Prueba completada exitosamente');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await sequelize.close();
  }
};

testUserWithRoles();
