import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parroquia_db',
  username: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD || 'ParroquiaSecure2025',
  dialect: 'postgresql',
  logging: console.log
});

async function deleteAdminUser() {
  try {
    console.log('🗑️  Eliminando usuario administrador...\n');
    
    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');

    // 1. Verificar si existe el usuario
    const [users] = await sequelize.query(`
      SELECT id, correo_electronico, primer_nombre, primer_apellido
      FROM usuarios
      WHERE correo_electronico = 'admin@parroquia.com'
    `);

    if (users.length === 0) {
      console.log('⚠️  No se encontró el usuario admin@parroquia.com');
      console.log('   La base de datos ya está sin usuarios.\n');
      return;
    }

    const userId = users[0].id;
    console.log('📋 Usuario encontrado:');
    console.log(`   ID: ${userId}`);
    console.log(`   Nombre: ${users[0].primer_nombre} ${users[0].primer_apellido}`);
    console.log(`   Email: ${users[0].correo_electronico}\n`);

    // 2. Eliminar relación usuario-rol
    console.log('🔗 Eliminando relación usuario-rol...');
    await sequelize.query(`
      DELETE FROM usuarios_roles
      WHERE id_usuarios = '${userId}'
    `);
    console.log('   ✅ Relación eliminada\n');

    // 3. Eliminar usuario
    console.log('👤 Eliminando usuario...');
    await sequelize.query(`
      DELETE FROM usuarios
      WHERE id = '${userId}'
    `);
    console.log('   ✅ Usuario eliminado\n');

    // 4. Verificar
    const [remainingUsers] = await sequelize.query(`
      SELECT COUNT(*) as count FROM usuarios
    `);
    
    console.log('═'.repeat(60));
    console.log(`✅ Usuario eliminado exitosamente`);
    console.log(`📊 Usuarios restantes: ${remainingUsers[0].count}`);
    console.log('💡 Ahora puedes crear el usuario manualmente con:');
    console.log('   npm run admin:create\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

deleteAdminUser()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Proceso fallido:', error);
    process.exit(1);
  });
