import fs from 'fs';
import path from 'path';

console.log('📁 NUEVA ORGANIZACIÓN DE MODELOS\n');

// Analizar src/models/main (CommonJS)
console.log('🔧 MODELOS PRINCIPALES (CommonJS) - src/models/main/:');
const mainFiles = fs.readdirSync('src/models/main')
  .filter(file => file.endsWith('.js') && file !== 'index.js')
  .sort();

mainFiles.forEach(file => {
  console.log(`  📄 ${file}`);
});

console.log(`\n📊 Total modelos principales: ${mainFiles.length}\n`);

// Analizar src/models/catalog (ES6)
console.log('📋 MODELOS DE CATÁLOGO (ES6) - src/models/catalog/:');
const catalogFiles = fs.readdirSync('src/models/catalog')
  .filter(file => file.endsWith('.js') && file !== 'index.js' && !file.includes('.backup'))
  .sort();

catalogFiles.forEach(file => {
  console.log(`  📄 ${file}`);
});

console.log(`\n📊 Total modelos de catálogo: ${catalogFiles.length}\n`);

// Analizar src/models raíz (ES6)
console.log('🔐 MODELOS DE AUTENTICACIÓN (ES6) - src/models/:');
const rootFiles = fs.readdirSync('src/models')
  .filter(file => file.endsWith('.js') && file !== 'index.js')
  .sort();

rootFiles.forEach(file => {
  console.log(`  📄 ${file}`);
});

console.log(`\n📊 Total modelos de autenticación: ${rootFiles.length}\n`);

console.log('🎯 CLASIFICACIÓN POR PROPÓSITO:\n');

console.log('📍 MODELOS GEOGRÁFICOS:');
console.log('  catalog/Departamentos.js - Departamentos de Colombia');
console.log('  catalog/Municipios.js - Municipios');
console.log('  catalog/Municipio.js - Municipio simple');
console.log('  catalog/Parroquia.js - Parroquias');
console.log('  catalog/Veredas.js - Veredas y sectores');
console.log('  catalog/Sector.js - Sectores');
console.log('  main/Departamento.js - Departamentos (versión principal)');
console.log('  main/Municipio.js - Municipios (versión principal)');
console.log('  main/Parroquia.js - Parroquias (versión principal)');
console.log('  main/Sector.js - Sectores (versión principal)');
console.log('  main/Vereda.js - Veredas (versión principal)');

console.log('\n👥 MODELOS DE PERSONAS Y FAMILIAS:');
console.log('  catalog/Persona.js - Personas (catálogo)');
console.log('  catalog/Familias.js - Familias (catálogo)');
console.log('  main/Persona.js - Personas (principal)');
console.log('  main/Familia.js - Familias (principal)');

console.log('\n🔐 MODELOS DE AUTENTICACIÓN:');
console.log('  Role.js - Roles de usuario');
console.log('  Usuario.js - Usuarios del sistema');
console.log('  UsuarioRole.js - Relación usuarios-roles');

console.log('\n📊 MODELOS DE ENCUESTAS:');
console.log('  main/Encuesta.js - Encuestas');

console.log('\n🏠 MODELOS DE VIVIENDA Y SERVICIOS:');
console.log('  main/TipoVivienda.js - Tipos de vivienda');
console.log('  main/SistemaAcueducto.js - Sistemas de acueducto');
console.log('  main/TipoAguasResiduales.js - Tipos de aguas residuales');
console.log('  main/TipoDisposicionBasura.js - Disposición de basura');

console.log('\n🎓 MODELOS DE CLASIFICACIÓN:');
console.log('  catalog/Sexo.js - Géneros/sexos (catálogo)');
console.log('  catalog/TipoIdentificacion.js - Tipos de identificación');
console.log('  main/Sexo.js - Géneros/sexos (principal)');
console.log('  main/Profesion.js - Profesiones');
console.log('  main/Enfermedad.js - Enfermedades');
console.log('  main/Destreza.js - Destrezas');

console.log('\n🔗 MODELOS DE RELACIÓN:');
console.log('  main/PersonaEnfermedad.js - Personas-Enfermedades');
console.log('  main/FamiliaDisposicionBasura.js - Familias-Basura');
console.log('  main/FamiliaSistemaAcueducto.js - Familias-Acueducto');
console.log('  main/FamiliaSistemaAguasResiduales.js - Familias-Aguas');
console.log('  main/FamiliaTipoVivienda.js - Familias-Vivienda');

console.log('\n⚠️ NOTA: Algunos modelos aparecen duplicados entre catalog/ y main/');
console.log('Esto requiere análisis para determinar cuáles usar en cada contexto.');
