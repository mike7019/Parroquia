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
  logging: false
});

async function verifyDatabase() {
  try {
    console.log('🔍 Verificando estado de la base de datos...\n');
    
    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');

    // Verificar catálogos
    console.log('📊 CATÁLOGOS CARGADOS:');
    console.log('━'.repeat(50));
    
    const catalogTables = [
      { name: 'tipos_identificacion', label: 'Tipos de Identificación' },
      { name: 'estados_civiles', label: 'Estados Civiles' },
      { name: 'tipos_vivienda', label: 'Tipos de Vivienda' },
      { name: 'sistemas_acueducto', label: 'Sistemas de Acueducto' },
      { name: 'tipos_aguas_residuales', label: 'Tipos de Aguas Residuales' },
      { name: 'tipos_disposicion_basura', label: 'Tipos de Disposición de Basura' },
      { name: 'sexos', label: 'Sexos' },
      { name: 'roles', label: 'Roles' },
      { name: 'enfermedades', label: 'Enfermedades' },
      { name: 'profesiones', label: 'Profesiones' },
      { name: 'destrezas', label: 'Destrezas/Habilidades' }
    ];

    for (const table of catalogTables) {
      try {
        const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table.name}`);
        const count = parseInt(results[0].count);
        const icon = count > 0 ? '✅' : '⚠️ ';
        console.log(`   ${icon} ${table.label.padEnd(35)} ${count} registros`);
      } catch (error) {
        console.log(`   ❌ ${table.label.padEnd(35)} Tabla no existe`);
      }
    }

    // Verificar tablas vacías (familias, personas, encuestas)
    console.log('\n📭 TABLAS VACÍAS (sin datos QA):');
    console.log('━'.repeat(50));
    
    const emptyTables = [
      { name: 'familias', label: 'Familias' },
      { name: 'personas', label: 'Personas' },
      { name: 'usuarios', label: 'Usuarios' }
    ];

    for (const table of emptyTables) {
      try {
        const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table.name}`);
        const count = parseInt(results[0].count);
        
        if (table.name === 'usuarios' && count > 0) {
          console.log(`   ✅ ${table.label.padEnd(35)} ${count} usuario(s) (admin creado)`);
        } else if (count === 0) {
          console.log(`   ✅ ${table.label.padEnd(35)} ${count} registros (limpio)`);
        } else {
          console.log(`   ⚠️  ${table.label.padEnd(35)} ${count} registros`);
        }
      } catch (error) {
        console.log(`   ❌ ${table.label.padEnd(35)} Error: ${error.message}`);
      }
    }

    // Verificar usuario admin
    console.log('\n👤 USUARIOS:');
    console.log('━'.repeat(50));
    
    const [users] = await sequelize.query(`
      SELECT 
        u.id,
        u.correo_electronico,
        u.primer_nombre,
        u.primer_apellido,
        u.activo,
        r.nombre as rol
      FROM usuarios u
      LEFT JOIN usuarios_roles ur ON u.id = ur.id_usuarios
      LEFT JOIN roles r ON ur.id_roles = r.id
    `);

    if (users.length === 0) {
      console.log('   ⚠️  No hay usuarios creados');
    } else {
      users.forEach(user => {
        console.log(`   ✅ ${user.primer_nombre} ${user.primer_apellido}`);
        console.log(`      Email: ${user.correo_electronico}`);
        console.log(`      Rol: ${user.rol || 'Sin rol'}`);
        console.log(`      Estado: ${user.activo ? 'Activo' : 'Inactivo'}`);
        console.log('');
      });
    }

    console.log('━'.repeat(50));
    console.log('\n✅ Base de datos lista para usar');
    console.log('📝 Puedes empezar a cargar datos reales de familias y personas');
    console.log('🔐 Usa admin@parroquia.com / Admin123! para hacer login\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

verifyDatabase()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Verificación fallida:', error);
    process.exit(1);
  });
