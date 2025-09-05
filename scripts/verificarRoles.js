import sequelize from '../config/sequelize.js';
import { Role } from '../src/models/index.js';

async function verificarRoles() {
  try {
    console.log('🔍 Verificando roles en la base de datos...\n');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');

    // Obtener todos los roles
    const roles = await Role.findAll({
      order: [['nombre', 'ASC']]
    });

    console.log(`\n📊 Total de roles encontrados: ${roles.length}\n`);

    // Roles esperados
    const rolesEsperados = ['Administrador', 'Encuestador'];
    const rolesEncontrados = roles.map(role => role.nombre);
    
    console.log('📋 Verificación de roles básicos:\n');

    let encontrados = 0;
    for (const rolEsperado of rolesEsperados) {
      const existe = rolesEncontrados.includes(rolEsperado);
      const estado = existe ? '✅' : '❌';
      console.log(`   ${estado} ${rolEsperado}`);
      if (existe) encontrados++;
    }
    
    console.log(`\n📊 ${encontrados}/${rolesEsperados.length} roles básicos encontrados`);

    // Verificar roles adicionales
    const rolesAdicionales = rolesEncontrados.filter(role => !rolesEsperados.includes(role));
    
    if (rolesAdicionales.length > 0) {
      console.log('\n🔍 Roles adicionales encontrados:');
      rolesAdicionales.forEach(role => {
        console.log(`   • ${role}`);
      });
    }

    // Mostrar estadísticas finales
    const totalEsperados = rolesEsperados.length;
    const totalEncontrados = roles.length;
    const porcentajeCobertura = ((encontrados / totalEsperados) * 100).toFixed(1);

    console.log('\n📈 Estadísticas finales:');
    console.log(`   Roles básicos esperados: ${totalEsperados}`);
    console.log(`   Total de roles en BD: ${totalEncontrados}`);
    console.log(`   Cobertura de roles básicos: ${porcentajeCobertura}%`);
    
    if (porcentajeCobertura === '100.0') {
      console.log('\n🎉 ¡Todos los roles básicos están presentes!');
    } else {
      console.log('\n⚠️  Algunos roles básicos no se encontraron. Ejecuta: npm run db:seed:roles');
    }

    // Verificar integridad de la tabla
    console.log('\n🔧 Verificación de integridad:');
    
    // Verificar duplicados
    const nombresDuplicados = await sequelize.query(`
      SELECT nombre, COUNT(*) as count 
      FROM roles 
      GROUP BY nombre 
      HAVING COUNT(*) > 1
    `, { type: sequelize.QueryTypes.SELECT });

    if (nombresDuplicados.length > 0) {
      console.log('❌ Roles duplicados encontrados:');
      nombresDuplicados.forEach(dup => {
        console.log(`   • ${dup.nombre} (${dup.count} veces)`);
      });
    } else {
      console.log('✅ No se encontraron roles duplicados');
    }

    // Verificar campos requeridos
    const rolesConCamposNulos = await Role.findAll({
      where: {
        nombre: null
      }
    });

    if (rolesConCamposNulos.length > 0) {
      console.log(`❌ ${rolesConCamposNulos.length} roles con nombre nulo encontrados`);
    } else {
      console.log('✅ Todos los roles tienen nombre válido');
    }

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    if (error.name === 'ConnectionError') {
      console.log('💡 Sugerencia: Verificar que la base de datos esté ejecutándose');
    }
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Función para listar todos los roles con detalles
async function listarRolesDetallado() {
  try {
    await sequelize.authenticate();
    
    const roles = await Role.findAll({
      order: [['nombre', 'ASC']]
    });

    console.log('\n📝 Lista detallada de roles:\n');
    console.log('ID'.padEnd(38) + 'Nombre'.padEnd(30) + 'Creado');
    console.log('-'.repeat(80));

    roles.forEach(role => {
      const id = role.id.toString().padEnd(37);
      const nombre = role.nombre.padEnd(29);
      const fecha = role.created_at ? new Date(role.created_at).toLocaleDateString() : 'N/A';
      console.log(`${id} ${nombre} ${fecha}`);
    });

  } catch (error) {
    console.error('❌ Error listando roles:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar función según argumentos
const comando = process.argv[2];

if (comando === 'listar') {
  listarRolesDetallado()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else {
  verificarRoles()
    .then(() => {
      console.log('\n🎯 Verificación completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la verificación:', error.message);
      process.exit(1);
    });
}

export { verificarRoles, listarRolesDetallado };
