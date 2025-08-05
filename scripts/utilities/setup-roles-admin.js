import sequelize from './config/sequelize.js';
import { User, Role, UsuarioRole } from './src/models/index.js';

const setupRolesAndAssignToAdmin = async () => {
  try {
    console.log('🔧 Configurando roles y asignando al administrador...');

    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Limpiar roles duplicados
    await sequelize.query('DELETE FROM usuarios_roles;');
    await sequelize.query('DELETE FROM roles;');
    console.log('🧹 Roles existentes eliminados');

    // Crear roles básicos
    const adminRole = await Role.create({
      id: '00000000-0000-0000-0000-000000000001',
      nombre: 'Administrador'
    });

    const userRole = await Role.create({
      id: '00000000-0000-0000-0000-000000000002', 
      nombre: 'Usuario'
    });

    const surveyorRole = await Role.create({
      id: '00000000-0000-0000-0000-000000000003',
      nombre: 'Encuestador'
    });

    console.log('✅ Roles creados:', {
      admin: adminRole.nombre,
      user: userRole.nombre,
      surveyor: surveyorRole.nombre
    });

    // Buscar el usuario admin
    const adminUser = await User.findOne({
      where: { correo_electronico: 'admin@parroquia.com' }
    });

    if (!adminUser) {
      console.log('❌ Usuario admin no encontrado');
      return;
    }

    // Asignar rol de administrador
    await UsuarioRole.create({
      id_usuarios: adminUser.id,
      id_roles: adminRole.id
    });

    console.log('✅ Rol Administrador asignado al usuario admin');

    // Verificar la asignación
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

    // Probar el método toJSON actualizado
    const userData = userWithRoles.toJSON();
    console.log('📄 Datos JSON del usuario (solo campos en español):', userData);

    console.log('✅ Configuración completada exitosamente');

  } catch (error) {
    console.error('❌ Error en la configuración:', error);
  } finally {
    await sequelize.close();
  }
};

setupRolesAndAssignToAdmin();
