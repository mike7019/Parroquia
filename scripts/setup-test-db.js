import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const { Client } = pg;

async function setupTestDatabase() {
  // Connect to postgres database to create test database
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres' // Connect to default postgres database
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // Check if database exists
    const checkDb = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME || 'parroquia_db_test']
    );

    if (checkDb.rows.length === 0) {
      // Create database
      await client.query(`CREATE DATABASE ${process.env.DB_NAME || 'parroquia_db_test'}`);
      console.log(`✅ Base de datos ${process.env.DB_NAME || 'parroquia_db_test'} creada`);
    } else {
      console.log(`ℹ️  Base de datos ${process.env.DB_NAME || 'parroquia_db_test'} ya existe`);
    }

    await client.end();

    // Now sync the models
    console.log('\n🔄 Sincronizando modelos...');
    
    const { default: sequelize } = await import('../src/config/database.js');
    await sequelize.sync({ force: true }); // Force recreate all tables
    console.log('✅ Modelos sincronizados');

    // Create test users (admin and regular user)
    const { default: Usuario } = await import('../src/models/Usuario.js');
    const { default: Role } = await import('../src/models/Role.js');

    console.log('\n👤 Creando usuarios de prueba...');

    // Create roles if they don't exist
    const [adminRole] = await Role.findOrCreate({
      where: { nombre: 'admin' },
      defaults: { nombre: 'admin', descripcion: 'Administrador del sistema' }
    });

    const [userRole] = await Role.findOrCreate({
      where: { nombre: 'user' },
      defaults: { nombre: 'user', descripcion: 'Usuario regular' }
    });

    // Create admin user
    const [adminUser] = await Usuario.findOrCreate({
      where: { email: 'admin@test.com' },
      defaults: {
        nombre: 'Admin',
        apellido: 'Test',
        email: 'admin@test.com',
        password: 'Admin123!',
        role_id: adminRole.id,
        status: 'activo'
      }
    });

    // Create regular user
    const [regularUser] = await Usuario.findOrCreate({
      where: { email: 'user@test.com' },
      defaults: {
        nombre: 'User',
        apellido: 'Test',
        email: 'user@test.com',
        password: 'User123!',
        role_id: userRole.id,
        status: 'activo'
      }
    });

    console.log('✅ Usuarios de prueba creados:');
    console.log('   - admin@test.com / Admin123! (role: admin)');
    console.log('   - user@test.com / User123! (role: user)');

    await sequelize.close();
    console.log('\n✅ Base de datos de prueba configurada correctamente');
    console.log('\n💡 Ahora puedes ejecutar: npm run test:user');

  } catch (error) {
    console.error('❌ Error configurando base de datos:', error.message);
    process.exit(1);
  }
}

setupTestDatabase();
