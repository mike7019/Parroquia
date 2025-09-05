import sequelize from './config/sequelize.js';

async function checkRelationships() {
  try {
    console.log('🔍 Verificando relaciones de familia con servicios...\n');
    
    // Verificar familias y sus servicios
    const familias = await sequelize.query(`
      SELECT f.id_familia, f.apellido_familiar, f.codigo_familia
      FROM familias f 
      ORDER BY f.id_familia
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('📋 Familias encontradas:', familias.length);
    
    for (const familia of familias) {
      console.log(`\n--- Familia: ${familia.apellido_familiar} (ID: ${familia.id_familia}) ---`);
      
      // Verificar sistema de acueducto
      const acueducto = await sequelize.query(`
        SELECT fsa.id_familia, sa.id_sistema_acueducto, sa.nombre 
        FROM familia_sistema_acueducto fsa 
        JOIN sistemas_acueducto sa ON fsa.id_sistema_acueducto = sa.id_sistema_acueducto 
        WHERE fsa.id_familia = :familiaId
      `, {
        replacements: { familiaId: familia.id_familia },
        type: sequelize.QueryTypes.SELECT
      });
      
      console.log('💧 Acueducto:', acueducto.length > 0 ? acueducto[0] : 'SIN REGISTRO');
      
      // Verificar aguas residuales
      const aguasResiduales = await sequelize.query(`
        SELECT fsar.id_familia, tar.id_tipo_aguas_residuales, tar.nombre 
        FROM familia_sistema_aguas_residuales fsar 
        JOIN tipos_aguas_residuales tar ON fsar.id_tipo_aguas_residuales = tar.id_tipo_aguas_residuales 
        WHERE fsar.id_familia = :familiaId
      `, {
        replacements: { familiaId: familia.id_familia },
        type: sequelize.QueryTypes.SELECT
      });
      
      console.log('🚰 Aguas residuales:', aguasResiduales.length > 0 ? aguasResiduales[0] : 'SIN REGISTRO');
      
      // Verificar disposición de basuras
      const basuras = await sequelize.query(`
        SELECT fdb.id_familia, tdb.id_tipo_disposicion_basura, tdb.nombre 
        FROM familia_disposicion_basura fdb 
        JOIN tipos_disposicion_basura tdb ON fdb.id_tipo_disposicion_basura = tdb.id_tipo_disposicion_basura 
        WHERE fdb.id_familia = :familiaId
      `, {
        replacements: { familiaId: familia.id_familia },
        type: sequelize.QueryTypes.SELECT
      });
      
      console.log('🗑️ Basuras:', basuras.length > 0 ? basuras.map(b => b.nombre).join(', ') : 'SIN REGISTRO');
    }
    
    console.log('\n🔍 Verificando catálogos disponibles...\n');
    
    // Verificar catálogos de sistemas
    const sistemasAcueducto = await sequelize.query('SELECT * FROM sistemas_acueducto ORDER BY id_sistema_acueducto', { type: sequelize.QueryTypes.SELECT });
    console.log('💧 Sistemas de acueducto disponibles:', sistemasAcueducto);
    
    const tiposAguasResiduales = await sequelize.query('SELECT * FROM tipos_aguas_residuales ORDER BY id_tipo_aguas_residuales', { type: sequelize.QueryTypes.SELECT });
    console.log('🚰 Tipos de aguas residuales disponibles:', tiposAguasResiduales);
    
    const tiposBasura = await sequelize.query('SELECT * FROM tipos_disposicion_basura ORDER BY id_tipo_disposicion_basura', { type: sequelize.QueryTypes.SELECT });
    console.log('🗑️ Tipos de disposición de basura disponibles:', tiposBasura);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkRelationships();
