import sequelize from '../config/sequelize.js';
import { Role } from '../src/models/index.js';
import { v4 as uuidv4 } from 'uuid';

const rolesData = [
  { nombre: 'Administrador', descripcion: 'Usuario con acceso completo al sistema para gestión y configuración' },
  { nombre: 'Encuestador', descripcion: 'Usuario que realiza encuestas familiares y trabajo de campo' }
];

async function seedRoles() {
  try {
    console.log('🔄 Iniciando carga de roles básicos...');
    
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');

    let createdCount = 0;
    let existingCount = 0;

    for (const roleData of rolesData) {
      try {
        const [role, created] = await Role.findOrCreate({
          where: { nombre: roleData.nombre },
          defaults: {
            id: uuidv4(),
            nombre: roleData.nombre
          }
        });

        if (created) {
          console.log(`✅ Rol creado: ${roleData.nombre}`);
          console.log(`   Descripción: ${roleData.descripcion}`);
          createdCount++;
        } else {
          console.log(`ℹ️  Rol ya existe: ${roleData.nombre}`);
          existingCount++;
        }
      } catch (error) {
        console.error(`❌ Error creando rol ${roleData.nombre}:`, error.message);
      }
    }

    console.log('\n📊 Resumen de la carga de roles:');
    console.log(`   Roles creados: ${createdCount}`);
    console.log(`   Roles existentes: ${existingCount}`);
    console.log(`   Total procesados: ${rolesData.length}`);
    
    // Mostrar todos los roles disponibles
    console.log('\n📋 Roles disponibles en el sistema:');
    rolesData.forEach(role => {
      console.log(`   • ${role.nombre}: ${role.descripcion}`);
    });

    console.log('\n✅ Carga de roles completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la carga de roles:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRoles()
    .then(() => {
      console.log('\n🎯 Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en el proceso:', error.message);
      process.exit(1);
    });
}

export default seedRoles;
