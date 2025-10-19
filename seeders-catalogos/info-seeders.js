/**
 * 📋 INFORMACIÓN DE SEEDERS
 * Muestra detalles sobre todos los seeders disponibles
 */

console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
console.log('║              📦 SEEDERS DE CATÁLOGOS - PARROQUIA DB                          ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');

const seeders = [
  {
    numero: 1,
    nombre: 'insert-catalogos-directo.js',
    titulo: 'Catálogos Básicos',
    tablas: [
      'tipos_identificacion (5)',
      'sistemas_acueducto (6)',
      'tipos_aguas_residuales (5)',
      'tipos_disposicion_basura (7)',
      'sexos (3)',
      'profesiones (20)',
      'destrezas (1)',
      'enfermedades (67)'
    ],
    totalRegistros: 114,
    critico: false,
    notas: 'Base de datos fundamental para el sistema'
  },
  {
    numero: 2,
    nombre: 'seeder-tipos-viviendas-remoto.js',
    titulo: 'Tipos de Vivienda',
    tablas: ['tipos_viviendas (6)'],
    totalRegistros: 6,
    critico: true,
    notas: '⚠️ CRÍTICO: Sin esto no se pueden crear familias (FK constraint error)'
  },
  {
    numero: 3,
    nombre: 'seeder-parentescos.js',
    titulo: 'Parentescos (con género)',
    tablas: ['parentescos (46)'],
    totalRegistros: 46,
    critico: false,
    notas: 'Incluye variantes masculino/femenino (Jefe/Jefa, Hijo/Hija, etc.)'
  },
  {
    numero: 4,
    nombre: 'seeder-situaciones-civiles.js',
    titulo: 'Situaciones Civiles (API)',
    tablas: ['situaciones_civiles (8)'],
    totalRegistros: 8,
    critico: true,
    notas: '⚠️ Tabla que usa el API/Frontend (códigos: SOL, CAS, DIV, etc.)'
  },
  {
    numero: 5,
    nombre: 'seeder-estados-civiles.js',
    titulo: 'Estados Civiles (Alternativa)',
    tablas: ['estados_civiles (8)'],
    totalRegistros: 8,
    critico: false,
    notas: 'Tabla alternativa para compatibilidad'
  },
  {
    numero: 6,
    nombre: 'seeder-comunidades-culturales.js',
    titulo: 'Comunidades Culturales',
    tablas: ['comunidades_culturales (18)'],
    totalRegistros: 18,
    critico: false,
    notas: 'Etnias colombianas: Indígena, Afrocolombiano, Wayúu, Nasa, etc.'
  },
  {
    numero: 7,
    nombre: 'seeder-niveles-educativos.js',
    titulo: 'Niveles Educativos',
    tablas: ['niveles_educativos (14)'],
    totalRegistros: 14,
    critico: false,
    notas: 'Sistema educativo colombiano: Preescolar → Doctorado'
  }
];

console.log('📊 SEEDERS DISPONIBLES:\n');

seeders.forEach(s => {
  console.log(`${s.numero}. ${s.titulo}`);
  console.log(`   📄 Archivo: ${s.nombre}`);
  console.log(`   📊 Registros: ${s.totalRegistros}`);
  console.log(`   📋 Tablas:`);
  s.tablas.forEach(tabla => console.log(`      • ${tabla}`));
  if (s.critico) {
    console.log(`   🔴 CRÍTICO`);
  }
  console.log(`   💡 ${s.notas}`);
  console.log('');
});

const totalRegistros = seeders.reduce((sum, s) => sum + s.totalRegistros, 0);
console.log('='.repeat(80));
console.log(`📊 TOTAL DE REGISTROS: ${totalRegistros} registros`);
console.log(`📦 TOTAL DE SEEDERS: ${seeders.length} seeders`);
console.log('='.repeat(80));

console.log('\n🚀 COMANDOS DISPONIBLES:\n');
console.log('# Ejecutar TODOS los seeders automáticamente:');
console.log('node seeders-catalogos/ejecutar-todos-los-seeders.js\n');

console.log('# Ejecutar seeder individual:');
console.log('node seeders-catalogos/<nombre-seeder>.js\n');

console.log('# Ver reporte completo de la base de datos:');
console.log('node seeders-catalogos/reporte-catalogos-completo-remoto.js\n');

console.log('# Ver información de seeders:');
console.log('node seeders-catalogos/info-seeders.js\n');

console.log('='.repeat(80));
console.log('📖 Para más información, consulta: seeders-catalogos/README.md');
console.log('='.repeat(80) + '\n');
