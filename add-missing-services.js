import sequelize from './config/sequelize.js';

async function addMissingServices() {
  try {
    console.log('🔧 Agregando servicios faltantes a familias...');
    
    // Verificar familias sin servicios de acueducto
    const familiassinAcueducto = await sequelize.query(`
      SELECT f.id_familia, f.apellido_familiar
      FROM familias f
      LEFT JOIN familia_sistema_acueducto fsa ON f.id_familia = fsa.id_familia
      WHERE fsa.id_familia IS NULL
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('💧 Familias sin acueducto:', familiassinAcueducto);
    
    // Verificar familias sin servicios de aguas residuales
    const familiasSinAguasResiduales = await sequelize.query(`
      SELECT f.id_familia, f.apellido_familiar
      FROM familias f
      LEFT JOIN familia_sistema_aguas_residuales fsar ON f.id_familia = fsar.id_familia
      WHERE fsar.id_familia IS NULL
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('🚰 Familias sin aguas residuales:', familiasSinAguasResiduales);
    
    // Agregar acueducto público (ID=1) a familias sin acueducto
    for (const familia of familiassinAcueducto) {
      await sequelize.query(`
        INSERT INTO familia_sistema_acueducto (id_familia, id_sistema_acueducto, created_at, updated_at)
        VALUES (:familiaId, 1, NOW(), NOW())
      `, {
        replacements: { familiaId: familia.id_familia }
      });
      console.log(`✅ Acueducto agregado a familia ${familia.apellido_familiar} (ID: ${familia.id_familia})`);
    }
    
    // Agregar alcantarillado (ID=1) a familias sin aguas residuales
    for (const familia of familiasSinAguasResiduales) {
      await sequelize.query(`
        INSERT INTO familia_sistema_aguas_residuales (id_familia, id_tipo_aguas_residuales, created_at, updated_at)
        VALUES (:familiaId, 1, NOW(), NOW())
      `, {
        replacements: { familiaId: familia.id_familia }
      });
      console.log(`✅ Aguas residuales agregadas a familia ${familia.apellido_familiar} (ID: ${familia.id_familia})`);
    }
    
    console.log('\n🎉 Servicios agregados exitosamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

addMissingServices();
