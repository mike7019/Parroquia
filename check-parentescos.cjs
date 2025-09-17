// VERIFICAR PARENTESCOS REALES
async function checkParentescos() {
  try {
    const { sequelize } = await import('./src/models/index.js');
    const { QueryTypes } = await import('sequelize');
    
    console.log('🔍 VERIFICANDO PARENTESCOS REALES');
    
    // Ver datos reales de personas con sus parentescos
    const personas = await sequelize.query(`
      SELECT 
        p.id_personas,
        p.primer_nombre,
        p.primer_apellido,
        p.id_parentesco,
        p.id_familia_familias
      FROM personas p 
      WHERE p.id_familia_familias IS NOT NULL
      LIMIT 5;
    `, { type: QueryTypes.SELECT });
    
    console.log('Personas encontradas:');
    personas.forEach(p => {
      console.log(`  ID: ${p.id_personas}, Nombre: ${p.primer_nombre} ${p.primer_apellido}, Parentesco ID: ${p.id_parentesco}, Familia: ${p.id_familia_familias}`);
    });
    
    // Ver qué parentescos existen
    const parentescosUnicos = await sequelize.query(`
      SELECT DISTINCT id_parentesco, COUNT(*) as cantidad
      FROM personas 
      WHERE id_parentesco IS NOT NULL
      GROUP BY id_parentesco
      ORDER BY id_parentesco;
    `, { type: QueryTypes.SELECT });
    
    console.log('\nParentescos únicos en la BD:');
    parentescosUnicos.forEach(p => {
      console.log(`  ID Parentesco: ${p.id_parentesco}, Cantidad: ${p.cantidad}`);
    });
    
    await sequelize.close();
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkParentescos();