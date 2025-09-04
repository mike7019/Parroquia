import { Usuario, Role, UsuarioRole } from '../src/models/index.js';
import sequelize from '../config/sequelize.js';

async function checkAndCleanUsers() {
  try {
    console.log('🔍 VERIFICANDO USUARIOS EXISTENTES');
    console.log('==================================\n');

    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida\n');

    // Buscar todos los usuarios admin
    const adminUsers = await Usuario.findAll({
      where: {
        correo_electronico: 'admin@parroquia.com'
      },
      include: [{
        model: Role,
        as: 'roles',
        through: { attributes: [] }
      }]
    });

    console.log(`📊 Usuarios encontrados con email admin@parroquia.com: ${adminUsers.length}`);

    if (adminUsers.length === 0) {
      console.log('ℹ️  No hay usuarios admin existentes');
      return;
    }

    // Mostrar detalles de usuarios existentes
    console.log('\n📋 Detalles de usuarios encontrados:');
    adminUsers.forEach((user, index) => {
      console.log(`\n  Usuario ${index + 1}:`);
      console.log(`    ID: ${user.id}`);
      console.log(`    Nombre: ${user.primer_nombre} ${user.primer_apellido}`);
      console.log(`    Email: ${user.correo_electronico}`);
      console.log(`    Activo: ${user.activo ? 'Sí' : 'No'}`);
      console.log(`    Email verificado: ${user.email_verificado ? 'Sí' : 'No'}`);
      console.log(`    Tipo: ${user.tipo_usuario}`);
      console.log(`    Creado: ${user.created_at}`);
      if (user.roles && user.roles.length > 0) {
        console.log(`    Roles: ${user.roles.map(r => r.nombre).join(', ')}`);
      } else {
        console.log(`    Roles: Sin roles asignados`);
      }
    });

    // Eliminar usuarios duplicados
    if (adminUsers.length > 0) {
      console.log(`\n🗑️  Eliminando ${adminUsers.length} usuario(s) admin existente(s)...`);
      
      for (const user of adminUsers) {
        // Eliminar asociaciones de roles primero
        await UsuarioRole.destroy({
          where: { id_usuarios: user.id }
        });
        console.log(`  ✅ Roles eliminados para usuario ID ${user.id}`);
        
        // Eliminar usuario
        await user.destroy();
        console.log(`  ✅ Usuario ID ${user.id} eliminado`);
      }
      
      console.log('\n🎉 Todos los usuarios admin eliminados exitosamente');
    }

    // Verificar que no queden usuarios
    const remainingUsers = await Usuario.findAll({
      where: {
        correo_electronico: 'admin@parroquia.com'
      }
    });

    if (remainingUsers.length === 0) {
      console.log('✅ Confirmado: No quedan usuarios admin en la base de datos');
      console.log('\n📝 Próximos pasos:');
      console.log('   1. Ejecutar: npm run admin:create:default');
      console.log('   2. O ejecutar: npm run admin:create (para crear interactivamente)');
    } else {
      console.log(`⚠️  Aún quedan ${remainingUsers.length} usuario(s) admin`);
    }

  } catch (error) {
    console.error('❌ Error verificando usuarios:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar verificación
checkAndCleanUsers()
  .then(() => {
    console.log('\n🎯 Verificación completada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la verificación:', error.message);
    process.exit(1);
  });
