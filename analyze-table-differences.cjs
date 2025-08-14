// Tablas que deberían existir según los modelos
const expectedTables = [
  'comunidades_culturales',
  'departamentos', 
  'destrezas',
  'encuestas',
  'enfermedades',
  'estados_civiles',
  'familia_disposicion_basura',
  'familia_sistema_acueducto',
  'familia_sistema_aguas_residuales',
  'familia_tipo_vivienda',
  'familias',
  'municipios',
  'niveles_educativos',
  'parentescos',
  'parroquia',
  'persona_enfermedad',
  'personas',
  'profesiones',
  'roles',
  'sector',     // ⚠️ Modelo Sector.js dice "sector"
  'sectores',   // pero existe "sectores" en BD
  'sexo',       // ⚠️ Modelo Sexo.js dice "sexo"  
  'sexos',      // pero existe "sexos" en BD
  'sistemas_acueducto',
  'situaciones_civiles',
  'tallas',
  'tipos_aguas_residuales',
  'tipos_disposicion_basura',
  'tipos_identificacion',
  'tipos_vivienda',
  'usuarios',
  'usuarios_roles',
  'veredas'
];

// Tablas que existen actualmente en la base de datos local (33 tablas)
const currentTables = [
  'SequelizeMeta',
  'comunidades_culturales',
  'departamentos',
  'destrezas', 
  'encuestas',
  'enfermedades',
  'estados_civiles',
  'familia_disposicion_basura',
  'familia_sistema_acueducto',
  'familia_sistema_aguas_residuales',
  'familia_tipo_vivienda',
  'familias',
  'municipios',
  'niveles_educativos',
  'parentescos',
  'parroquia',
  'persona_destreza',  // ⚠️ Esta tabla existe pero no hay modelo explícito
  'persona_enfermedad',
  'personas',
  'profesiones',
  'roles',
  'sectores',  // en BD está "sectores", no "sector"
  'sexos',     // en BD está "sexos", no "sexo" 
  'sistemas_acueducto',
  'situaciones_civiles',
  'tallas',
  'tipos_aguas_residuales',
  'tipos_disposicion_basura',
  'tipos_identificacion',
  'tipos_vivienda',
  'usuarios',
  'usuarios_roles',
  'veredas'
];

console.log('🔍 Análisis de diferencias entre modelos y base de datos local:\n');

// Excluir SequelizeMeta del análisis
const currentTablesFiltered = currentTables.filter(t => t !== 'SequelizeMeta');

console.log(`📊 Resumen:`);
console.log(`  - Tablas esperadas según modelos: ${expectedTables.length}`);
console.log(`  - Tablas actuales en BD local: ${currentTablesFiltered.length}`);
console.log('');

// Buscar tablas que están en modelos pero no en BD
const missingInDB = expectedTables.filter(t => !currentTablesFiltered.includes(t));
if (missingInDB.length > 0) {
  console.log(`❌ Tablas definidas en modelos pero que NO existen en BD local (${missingInDB.length}):`);
  missingInDB.forEach(table => console.log(`  - ${table}`));
  console.log('');
}

// Buscar tablas que están en BD pero no en modelos
const missingInModels = currentTablesFiltered.filter(t => !expectedTables.includes(t));
if (missingInModels.length > 0) {
  console.log(`⚠️  Tablas en BD local que NO tienen modelo definido (${missingInModels.length}):`);
  missingInModels.forEach(table => console.log(`  - ${table}`));
  console.log('');
}

// Problemas de nomenclatura
console.log(`🔧 Problemas de nomenclatura detectados:`);
console.log(`  1. Modelo Sector.js define tableName "sector" pero BD tiene "sectores"`);
console.log(`  2. Modelo Sexo.js define tableName "sexo" pero BD tiene "sexos"`);
console.log(`  3. Tabla "persona_destreza" existe en BD pero no tiene modelo explícito`);
console.log('');

console.log(`✅ Conclusiones:`);
console.log(`  - La discrepancia principal es la nomenclatura de "sector/sectores" y "sexo/sexos"`);
console.log(`  - Hay ${currentTablesFiltered.length} tablas vs ${expectedTables.length} esperadas`);
console.log(`  - Para sincronizar con servidor (32 tablas), necesitamos eliminar ${currentTablesFiltered.length - 32} tablas`);
console.log('');

console.log(`📋 Recomendaciones:`);
console.log(`  1. Corregir modelos Sector.js y Sexo.js para usar nombres plurales`);
console.log(`  2. Verificar si "persona_destreza" necesita modelo o se puede eliminar`);
console.log(`  3. Sincronizar con servidor para tener exactamente 32 tablas`);
