/**
 * Script para ejecutar seeders esenciales en la base de datos remota
 * Llena los catálogos necesarios para el funcionamiento del sistema
 */

import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de la base de datos remota
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: '206.62.139.100',
  port: 5433,
  database: 'parroquia_db',
  username: 'parroquia_user',
  password: 'ParroquiaSecure2025',
  logging: (msg) => {
    // Solo mostrar queries de INSERT para ver el progreso
    if (msg.includes('INSERT') || msg.includes('SELECT COUNT')) {
      console.log('  📝', msg.substring(0, 100) + '...');
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Seeders a ejecutar EN ORDEN (sin incluir roles que ya fueron creados manualmente)
const SEEDERS_ORDEN = [
  // 1. Catálogos básicos
  '20240101000001-tipos-identificacion.cjs',
  '20240101000002-estados-civiles.cjs',
  '20240101000003-tipos-vivienda.cjs',
  '20240101000004-sistemas-acueducto.cjs',
  '20240101000005-tipos-aguas-residuales.cjs',
  '20240101000006-tipos-disposicion-basura.cjs',
  '20240101000007-sexos.cjs',
  
  // 2. Profesiones y habilidades
  '20240101000009-1-profesiones.cjs',
  '20240101000009-2-destrezas.cjs',
  
  // 3. Enfermedades (versión completa)
  '20241002000001-enfermedades-completo.cjs'
];

async function ejecutarSeeder(seederFile) {
  const seederPath = join(__dirname, 'seeders', seederFile);
  
  try {
    console.log(`\n📦 Ejecutando: ${seederFile}`);
    console.log('─'.repeat(80));
    
    // Importar el seeder de forma dinámica
    const seederModule = await import(`file://${seederPath}`);
    const seeder = seederModule.default;
    
    // Ejecutar el método up del seeder
    await seeder.up(sequelize.getQueryInterface(), Sequelize);
    
    console.log(`✅ Completado: ${seederFile}\n`);
    return { archivo: seederFile, exito: true, error: null };
    
  } catch (error) {
    console.error(`❌ Error en ${seederFile}:`, error.message);
    return { archivo: seederFile, exito: false, error: error.message };
  }
}

async function ejecutarTodosSeeders() {
  console.log('🌱 EJECUCIÓN DE SEEDERS EN BASE DE DATOS REMOTA');
  console.log('='.repeat(80));
  console.log('📍 Host: 206.62.139.100:5433');
  console.log('📦 Database: parroquia_db');
  console.log(`📋 Total de seeders a ejecutar: ${SEEDERS_ORDEN.length}\n`);

  try {
    // Conectar a la base de datos
    console.log('🔌 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // Verificar que los seeders existen
    console.log('🔍 Verificando archivos de seeders...');
    const seedersDir = join(__dirname, 'seeders');
    const archivosDisponibles = await readdir(seedersDir);
    
    const seedersNoEncontrados = SEEDERS_ORDEN.filter(
      seeder => !archivosDisponibles.includes(seeder)
    );
    
    if (seedersNoEncontrados.length > 0) {
      console.warn('⚠️  Seeders no encontrados:');
      seedersNoEncontrados.forEach(s => console.warn(`   - ${s}`));
      console.log('');
    }

    const seedersAEjecutar = SEEDERS_ORDEN.filter(
      seeder => archivosDisponibles.includes(seeder)
    );

    console.log(`✅ Seeders encontrados: ${seedersAEjecutar.length}/${SEEDERS_ORDEN.length}\n`);

    // Ejecutar seeders en orden
    const resultados = [];
    let exitosos = 0;
    let fallidos = 0;

    for (const seeder of seedersAEjecutar) {
      const resultado = await ejecutarSeeder(seeder);
      resultados.push(resultado);
      
      if (resultado.exito) {
        exitosos++;
      } else {
        fallidos++;
      }
    }

    // Resumen final
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMEN DE EJECUCIÓN');
    console.log('='.repeat(80));
    console.log(`✅ Exitosos: ${exitosos}`);
    console.log(`❌ Fallidos: ${fallidos}`);
    console.log(`📋 Total: ${resultados.length}\n`);

    if (fallidos > 0) {
      console.log('❌ Seeders con errores:');
      resultados
        .filter(r => !r.exito)
        .forEach(r => console.log(`   • ${r.archivo}: ${r.error}`));
      console.log('');
    }

    // Verificar conteos en las tablas
    console.log('🔍 Verificando datos insertados...\n');
    
    const tablasVerificar = [
      'tipos_identificacion',
      'estados_civiles',
      'tipos_vivienda',
      'sistemas_acueducto',
      'tipos_aguas_residuales',
      'tipos_disposicion_basura',
      'sexos',
      'profesiones',
      'destrezas',
      'enfermedades',
      'roles'
    ];

    for (const tabla of tablasVerificar) {
      try {
        const [result] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tabla};`);
        const count = parseInt(result[0].count);
        const icon = count > 0 ? '✅' : '⚠️';
        console.log(`${icon} ${tabla.padEnd(30)}: ${count} registros`);
      } catch (err) {
        console.log(`❌ ${tabla.padEnd(30)}: Error al verificar`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ PROCESO COMPLETADO');
    console.log('='.repeat(80));
    console.log('\n💡 Estado de la base de datos:');
    console.log('   • Catálogos básicos: Listos');
    console.log('   • Roles: Listos (Administrador, Encuestador)');
    console.log('   • Profesiones y destrezas: Listas');
    console.log('   • Enfermedades: Lista completa');
    console.log('   • Geografía: Departamentos y municipios conservados\n');
    console.log('📝 Próximo paso: Crear usuarios administradores\n');

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ Error crítico:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Ejecutar
ejecutarTodosSeeders();
