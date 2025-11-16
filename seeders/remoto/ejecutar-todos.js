/**
 * 🚀 EJECUTOR MAESTRO DE SEEDERS
 * Ejecuta todos los seeders de catálogos en el orden correcto
 * para el servidor remoto 206.62.139.100:5433
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lista de seeders en orden de ejecución
const seeders = [
  {
    nombre: 'Catálogos Básicos',
    archivo: 'seed-catalogos-basicos.js',
    descripcion: 'tipos_identificacion, sexos, profesiones, enfermedades, etc.'
  },
  {
    nombre: 'Tipos de Vivienda',
    archivo: 'seeder-tipos-viviendas-remoto.js',
    descripcion: 'Casa, Apartamento, Rancho/Finca, etc. (CRÍTICO para FK)'
  },
  {
    nombre: 'Parentescos',
    archivo: 'seeder-parentescos.js',
    descripcion: 'Relaciones familiares con género (46 registros)'
  },
  {
    nombre: 'Situaciones Civiles',
    archivo: 'seeder-situaciones-civiles.js',
    descripcion: 'Estados civiles para API (8 registros)'
  },
  {
    nombre: 'Estados Civiles',
    archivo: 'seeder-estados-civiles.js',
    descripcion: 'Estados civiles alternativa (8 registros)'
  },
  {
    nombre: 'Comunidades Culturales',
    archivo: 'seeder-comunidades-culturales.js',
    descripcion: 'Etnias y comunidades colombianas (18 registros)'
  },
  {
    nombre: 'Niveles Educativos',
    archivo: 'seeder-niveles-educativos.js',
    descripcion: 'Sistema educativo colombiano (14 registros)'
  }
];

// Función para ejecutar un seeder
function ejecutarSeeder(seeder) {
  return new Promise((resolve, reject) => {
    console.log('\n' + '='.repeat(80));
    console.log(`🌱 EJECUTANDO: ${seeder.nombre}`);
    console.log(`📄 Archivo: ${seeder.archivo}`);
    console.log(`📝 ${seeder.descripcion}`);
    console.log('='.repeat(80) + '\n');

    const rutaSeeder = join(__dirname, seeder.archivo);
    const proceso = spawn('node', [rutaSeeder], {
      stdio: 'inherit',
      shell: true
    });

    proceso.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${seeder.nombre} completado exitosamente\n`);
        resolve();
      } else {
        console.error(`\n❌ ${seeder.nombre} falló con código ${code}\n`);
        reject(new Error(`Seeder ${seeder.nombre} falló`));
      }
    });

    proceso.on('error', (error) => {
      console.error(`\n❌ Error ejecutando ${seeder.nombre}:`, error.message);
      reject(error);
    });
  });
}

// Función principal
async function ejecutarTodosSeeders() {
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                  🚀 EJECUTOR MAESTRO DE SEEDERS - PARROQUIA DB                ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n📍 Servidor: 206.62.139.100:5433');
  console.log('📊 Total de seeders: ' + seeders.length);
  console.log('⏱️  Tiempo estimado: 1-2 minutos\n');

  const horaInicio = new Date();
  let exitos = 0;
  let fallos = 0;

  try {
    // Ejecutar seeders secuencialmente
    for (let i = 0; i < seeders.length; i++) {
      console.log(`\n[${i + 1}/${seeders.length}] Procesando: ${seeders[i].nombre}...`);
      try {
        await ejecutarSeeder(seeders[i]);
        exitos++;
      } catch (error) {
        fallos++;
        console.error(`⚠️  Continuando con siguiente seeder...`);
      }
    }

    // Ejecutar reporte final
    console.log('\n' + '='.repeat(80));
    console.log('📊 GENERANDO REPORTE FINAL DE VERIFICACIÓN');
    console.log('='.repeat(80) + '\n');

    await ejecutarSeeder({
      nombre: 'Reporte Final',
      archivo: 'reporte-catalogos-completo-remoto.js',
      descripcion: 'Verificación completa de todas las tablas'
    });

    // Resumen
    const horaFin = new Date();
    const duracion = Math.round((horaFin - horaInicio) / 1000);

    console.log('\n╔═══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                           📊 RESUMEN DE EJECUCIÓN                             ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');
    console.log(`✅ Seeders exitosos:  ${exitos}/${seeders.length}`);
    console.log(`❌ Seeders fallidos:   ${fallos}/${seeders.length}`);
    console.log(`⏱️  Duración total:     ${duracion} segundos`);
    console.log(`📅 Completado:         ${horaFin.toLocaleString('es-CO')}\n`);

    if (fallos === 0) {
      console.log('🎉 ¡TODOS LOS SEEDERS SE EJECUTARON EXITOSAMENTE!');
      console.log('✅ La base de datos está lista para crear encuestas.\n');
    } else {
      console.log('⚠️  Algunos seeders fallaron. Revisa los logs arriba.');
      console.log('💡 Puedes ejecutar los seeders individuales manualmente.\n');
    }

  } catch (error) {
    console.error('\n❌ Error fatal en el proceso:', error.message);
    process.exit(1);
  }
}

// Ejecutar
console.clear();
ejecutarTodosSeeders().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
