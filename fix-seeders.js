const fs = require('fs');
const path = require('path');

// Lista de seeders a actualizar
const seeders = [
  { file: '20240101000004-sistemas-acueducto.cjs', table: 'sistemas_acueducto' },
  { file: '20240101000005-tipos-aguas-residuales.cjs', table: 'tipos_aguas_residuales' },
  { file: '20240101000006-tipos-disposicion-basura.cjs', table: 'tipos_disposicion_basura' }
];

const seedersDir = path.join(__dirname, 'seeders');

seeders.forEach(({ file, table }) => {
  const filePath = path.join(seedersDir, file);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Buscar el patrón actual
    const oldPattern = `async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('${table}',`;
    
    // Nuevo patrón con verificación
    const newPattern = `async up(queryInterface, Sequelize) {
    // Verificar si ya existen registros en la tabla ${table}
    const [results] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM ${table}"
    );

    // Solo insertar si no hay registros existentes
    if (results[0].count === 0) {
      await queryInterface.bulkInsert('${table}',`;
    
    // Reemplazar el patrón
    content = content.replace(oldPattern, newPattern);
    
    // Agregar la llave de cierre antes del último ], {});
    content = content.replace(/(\s+)\], \{\}\);(\s+)\},/, '$1], {});$1}$2},');
    
    // Escribir el archivo actualizado
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Actualizado: ${file}`);
  } else {
    console.log(`No encontrado: ${file}`);
  }
});

console.log('Todos los seeders han sido actualizados.');
