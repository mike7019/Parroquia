require('dotenv').config();
const sequelize = require('./config/sequelize');
const User = require('./src/models/User');

async function showUsers() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');

    // Consultar usuarios
    const users = await User.findAll({
      attributes: [
        'id', 
        'firstName', 
        'lastName', 
        'email', 
        'role', 
        'isActive', 
        'emailVerified', 
        'lastLoginAt',
        'createdAt', 
        'updatedAt'
      ],
      order: [['createdAt', 'DESC']]
    });

    if (users.length === 0) {
      console.log('📝 No hay usuarios registrados en la base de datos');
    } else {
      console.log(`👥 Usuarios registrados (${users.length} total):`);
      console.log('=' .repeat(150));
      console.log('ID | Nombre Completo                | Email                         | Rol         | Activo | Email Verificado | Último Login           | Creado');
      console.log('-'.repeat(150));
      
      users.forEach(user => {
        const fullName = `${user.firstName} ${user.lastName}`.padEnd(30);
        const email = user.email.padEnd(29);
        const role = user.role.padEnd(11);
        const isActive = (user.isActive ? '✅' : '❌').padEnd(6);
        const emailVerified = (user.emailVerified ? '✅' : '❌').padEnd(16);
        const lastLogin = user.lastLoginAt ? 
          new Date(user.lastLoginAt).toLocaleDateString('es-ES') + ' ' + 
          new Date(user.lastLoginAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) 
          : 'Nunca';
        const created = new Date(user.createdAt).toLocaleDateString('es-ES') + ' ' + 
          new Date(user.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        console.log(`${user.id.toString().padEnd(2)} | ${fullName} | ${email} | ${role} | ${isActive} | ${emailVerified} | ${lastLogin.padEnd(22)} | ${created}`);
      });
      
      console.log('-'.repeat(150));
      
      // Estadísticas
      const activeUsers = users.filter(u => u.isActive).length;
      const verifiedUsers = users.filter(u => u.emailVerified).length;
      const adminUsers = users.filter(u => u.role === 'admin').length;
      const regularUsers = users.filter(u => u.role === 'user').length;
      const moderatorUsers = users.filter(u => u.role === 'moderator').length;
      
      console.log('\n📊 Estadísticas:');
      console.log(`   • Total de usuarios: ${users.length}`);
      console.log(`   • Usuarios activos: ${activeUsers} (${((activeUsers/users.length)*100).toFixed(1)}%)`);
      console.log(`   • Emails verificados: ${verifiedUsers} (${((verifiedUsers/users.length)*100).toFixed(1)}%)`);
      console.log(`   • Administradores: ${adminUsers}`);
      console.log(`   • Usuarios regulares: ${regularUsers}`);
      console.log(`   • Moderadores: ${moderatorUsers}`);
    }

  } catch (error) {
    console.error('❌ Error al consultar usuarios:', error.message);
  } finally {
    // Cerrar conexión
    await sequelize.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

showUsers();
