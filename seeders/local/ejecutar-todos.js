/**
 * 🚀 EJECUTOR MAESTRO DE SEEDERS - BASE DE DATOS LOCAL
 * 
 * Este script ejecuta todos los seeders para la base de datos LOCAL (localhost:5432)
 * en el orden correcto para mantener la integridad referencial.
 * 
 * Base de datos: localhost:5432
 * Usuario: parroquia_user
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lista de seeders en orden de ejecución
const seeders = [
  {
    file: 'seed-sexos.js',
    name: 'Sexos',
    description: '3 registros (Masculino, Femenino, Otro)'
  },
  {
    file: 'seed-tipos-identificacion.js',
    name: 'Tipos de Identificación',
    description: '9 tipos de documentos colombianos (CC, TI, CE, etc.)'
  },
  {
    file: 'seed-situaciones-civiles.js',
    name: 'Situaciones Civiles',
    description: '8 estados civiles'
  },
  {
    file: 'seed-sistemas-acueducto.js',
    name: 'Sistemas de Acueducto',
    description: '6 tipos de sistemas de agua'
  },
  {
    file: 'seed-enfermedades.js',
    name: 'Enfermedades',
    description: '89 enfermedades catalogadas'
  },
  {
    file: 'seed-tallas.js',
    name: 'Tallas',
    description: '24 tallas (Camiseta, Pantalón, Calzado, General)'
  },
  {
    file: 'seed-destrezas-habilidades.js',
    name: 'Destrezas y Habilidades',
    description: '45 destrezas + 20 habilidades'
  },
  {
    file: 'seed-roles.js',
    name: 'Roles de Usuario',
    description: 'Roles del sistema (admin, usuario, etc.)'
  }
];

let totalSeedersPorEjecutar = seeders.length;
let seedersEjecutados = 0;
let seedersConError = 0;

console.log('');
console.log('═'.repeat(80));
console.log('🚀 EJECUTOR MAESTRO DE SEEDERS - BASE DE DATOS LOCAL');
console.log('═'.repeat(80));
console.log('📍 Base de datos: localhost:5432');
console.log(`📊 Total de seeders: ${totalSeedersPorEjecutar}`);
console.log('⏱️  Tiempo estimado: 30-60 segundos');
console.log('═'.repeat(80));
console.log('');

/**
 * Ejecuta un seeder y retorna una promesa
 */
function ejecutarSeeder(seederInfo, index) {
  return new Promise((resolve, reject) => {
    const seederPath = join(__dirname, seederInfo.file);
    
    console.log('─'.repeat(80));
    console.log(`[${index + 1}/${totalSeedersPorEjecutar}] Ejecutando: ${seederInfo.name}`);
    console.log(`    📝 ${seederInfo.description}`);
    console.log(`    📄 ${seederInfo.file}`);
    console.log('─'.repeat(80));

    const proceso = spawn('node', [seederPath], {
      stdio: 'inherit',
      shell: true
    });

    proceso.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${seederInfo.name} completado exitosamente\n`);
        resolve();
      } else {
        console.error(`❌ ${seederInfo.name} falló con código ${code}\n`);
        reject(new Error(`Seeder ${seederInfo.name} falló`));
      }
    });

    proceso.on('error', (error) => {
      console.error(`❌ Error al ejecutar ${seederInfo.name}:`, error.message);
      reject(error);
    });
  });
}

/**
 * Ejecuta todos los seeders secuencialmente
 */
async function ejecutarTodosSeeders() {
  const inicio = Date.now();

  for (let i = 0; i < seeders.length; i++) {
    try {
      await ejecutarSeeder(seeders[i], i);
      seedersEjecutados++;
    } catch (error) {
      seedersConError++;
      console.error(`\n⚠️  ADVERTENCIA: El seeder "${seeders[i].name}" falló pero continuamos...\n`);
      // Continuamos con el siguiente seeder
    }
  }

  const fin = Date.now();
  const duracion = ((fin - inicio) / 1000).toFixed(2);

  // Reporte final
  console.log('');
  console.log('═'.repeat(80));
  console.log('📊 REPORTE FINAL DE EJECUCIÓN');
  console.log('═'.repeat(80));
  console.log(`⏱️  Duración total: ${duracion} segundos`);
  console.log(`✅ Seeders exitosos: ${seedersEjecutados}/${totalSeedersPorEjecutar}`);
  console.log(`❌ Seeders con error: ${seedersConError}/${totalSeedersPorEjecutar}`);
  console.log('═'.repeat(80));

  if (seedersConError === 0) {
    console.log('');
    console.log('🎉 ¡Todos los seeders se ejecutaron exitosamente!');
    console.log('📍 Base de datos LOCAL lista para usar');
    console.log('');
    console.log('═'.repeat(80));
  } else {
    console.log('');
    console.log('⚠️  Algunos seeders fallaron. Revisa los mensajes de error arriba.');
    console.log('');
    console.log('═'.repeat(80));
  }

  process.exit(seedersConError > 0 ? 1 : 0);
}

// Iniciar ejecución
ejecutarTodosSeeders().catch(error => {
  console.error('\n❌ Error fatal:', error.message);
  process.exit(1);
});
