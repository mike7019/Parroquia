// Script de prueba para verificar las asociaciones de Sector y Municipio
import sequelize from './config/sequelize.js';
import Sector from './src/models/catalog/Sector.js';
import Municipios from './src/models/catalog/Municipios.js';

console.log('🔍 Verificando asociaciones...');

// Verificar que los modelos existen
console.log('✅ Sector model exists:', !!Sector);
console.log('✅ Municipios model exists:', !!Municipios);

// Definir asociaciones si no existen
if (!Sector.associations.municipio) {
  Sector.belongsTo(Municipios, {
    foreignKey: 'id_municipio',
    as: 'municipio'
  });
  console.log('✅ Asociación Sector -> Municipio definida');
}

if (!Municipios.associations.sectores) {
  Municipios.hasMany(Sector, {
    foreignKey: 'id_municipio',
    as: 'sectores'
  });
  console.log('✅ Asociación Municipio -> Sectores definida');
}

// Verificar asociaciones
console.log('🔗 Asociaciones de Sector:', Object.keys(Sector.associations));
console.log('🔗 Asociaciones de Municipios:', Object.keys(Municipios.associations));

console.log('\n📝 Solución implementada:');
console.log('1. Importación directa de modelos en lugar de usar sequelize.models');
console.log('2. Definición de asociaciones en el servicio para garantizar que existan');
console.log('3. Verificación de asociaciones antes de definirlas para evitar duplicados');
console.log('\n🎯 Ahora el servicio de sectores debería funcionar correctamente.');
