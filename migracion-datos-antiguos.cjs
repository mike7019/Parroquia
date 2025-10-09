require('dotenv').config();
const { Sequelize, QueryTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log
  }
);

async function migrarDatosAntiguos() {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('🔄 INICIANDO MIGRACIÓN DE DATOS ANTIGUOS\n');
    
    // 1. Identificar personas sin los campos nuevos
    console.log('📋 1. Identificando personas sin datos en campos nuevos...');
    
    const personasSinDatos = await sequelize.query(`
      SELECT 
        id_personas,
        primer_nombre,
        primer_apellido,
        identificacion,
        id_familia_familias
      FROM personas
      WHERE id_parentesco IS NULL
         OR id_comunidad_cultural IS NULL
    `, { transaction, type: QueryTypes.SELECT });

    console.log(`   Encontradas: ${personasSinDatos.length} personas sin datos\n`);

    if (personasSinDatos.length === 0) {
      console.log('✅ No hay personas que requieran migración');
      await transaction.commit();
      await sequelize.close();
      process.exit(0);
    }

    // 2. Actualizar personas con valores por defecto
    console.log('📝 2. Actualizando personas con valores por defecto...\n');
    
    // Valores por defecto:
    // - id_parentesco: 23 (Otro) - porque no sabemos el parentesco real
    // - id_comunidad_cultural: 2 (Mestizo) - el más común
    // - motivo_celebrar: NULL (no podemos asumir)
    // - dia_celebrar: NULL
    // - mes_celebrar: NULL

    const resultPersonas = await sequelize.query(`
      UPDATE personas
      SET 
        id_parentesco = COALESCE(id_parentesco, 23),  -- Otro
        id_comunidad_cultural = COALESCE(id_comunidad_cultural, 2)  -- Mestizo
      WHERE id_parentesco IS NULL OR id_comunidad_cultural IS NULL
      RETURNING id_personas, primer_nombre
    `, { transaction, type: QueryTypes.UPDATE });

    console.log(`   ✅ Actualizadas ${resultPersonas[1].rowCount} personas`);
    
    // Mostrar algunas actualizadas
    if (resultPersonas[0].length > 0) {
      console.log('\n   Ejemplos de personas actualizadas:');
      resultPersonas[0].slice(0, 5).forEach(p => {
        console.log(`     - Persona ${p.id_personas}: ${p.primer_nombre}`);
      });
    }

    // 3. Identificar familias sin los campos nuevos
    console.log('\n📋 3. Identificando familias sin datos en campos nuevos...');
    
    const familiasSinDatos = await sequelize.query(`
      SELECT 
        id_familia,
        apellido_familiar,
        fecha_ultima_encuesta
      FROM familias
      WHERE id_tipo_vivienda IS NULL
         OR fecha_encuesta IS NULL
    `, { transaction, type: QueryTypes.SELECT });

    console.log(`   Encontradas: ${familiasSinDatos.length} familias sin datos\n`);

    if (familiasSinDatos.length > 0) {
      console.log('📝 4. Actualizando familias con valores por defecto...\n');
      
      // Valores por defecto:
      // - id_tipo_vivienda: 1 (Casa) - el más común
      // - fecha_encuesta: usar fecha_ultima_encuesta si existe, sino fecha actual

      const resultFamilias = await sequelize.query(`
        UPDATE familias
        SET 
          id_tipo_vivienda = COALESCE(id_tipo_vivienda, 1),  -- Casa
          fecha_encuesta = COALESCE(
            fecha_encuesta, 
            fecha_ultima_encuesta, 
            CURRENT_DATE
          )
        WHERE id_tipo_vivienda IS NULL OR fecha_encuesta IS NULL
        RETURNING id_familia, apellido_familiar
      `, { transaction, type: QueryTypes.UPDATE });

      console.log(`   ✅ Actualizadas ${resultFamilias[1].rowCount} familias`);
      
      if (resultFamilias[0].length > 0) {
        console.log('\n   Ejemplos de familias actualizadas:');
        resultFamilias[0].slice(0, 5).forEach(f => {
          console.log(`     - Familia ${f.id_familia}: ${f.apellido_familiar}`);
        });
      }
    }

    // 5. Verificar resultados
    console.log('\n📊 5. Verificando resultados de la migración...\n');
    
    const stats = await sequelize.query(`
      SELECT 
        COUNT(*) as total_personas,
        COUNT(id_parentesco) as con_parentesco,
        COUNT(*) - COUNT(id_parentesco) as sin_parentesco,
        COUNT(id_comunidad_cultural) as con_comunidad,
        COUNT(*) - COUNT(id_comunidad_cultural) as sin_comunidad
      FROM personas
    `, { transaction, type: QueryTypes.SELECT });

    console.log('   PERSONAS:');
    console.log(`     Total: ${stats[0].total_personas}`);
    console.log(`     Con parentesco: ${stats[0].con_parentesco}`);
    console.log(`     Sin parentesco: ${stats[0].sin_parentesco}`);
    console.log(`     Con comunidad cultural: ${stats[0].con_comunidad}`);
    console.log(`     Sin comunidad cultural: ${stats[0].sin_comunidad}`);

    const statsFamilias = await sequelize.query(`
      SELECT 
        COUNT(*) as total_familias,
        COUNT(id_tipo_vivienda) as con_tipo_vivienda,
        COUNT(*) - COUNT(id_tipo_vivienda) as sin_tipo_vivienda,
        COUNT(fecha_encuesta) as con_fecha_encuesta,
        COUNT(*) - COUNT(fecha_encuesta) as sin_fecha_encuesta
      FROM familias
    `, { transaction, type: QueryTypes.SELECT });

    console.log('\n   FAMILIAS:');
    console.log(`     Total: ${statsFamilias[0].total_familias}`);
    console.log(`     Con tipo vivienda: ${statsFamilias[0].con_tipo_vivienda}`);
    console.log(`     Sin tipo vivienda: ${statsFamilias[0].sin_tipo_vivienda}`);
    console.log(`     Con fecha encuesta: ${statsFamilias[0].con_fecha_encuesta}`);
    console.log(`     Sin fecha encuesta: ${statsFamilias[0].sin_fecha_encuesta}`);

    // 6. Confirmar transacción
    await transaction.commit();
    console.log('\n✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('\n📝 VALORES POR DEFECTO APLICADOS:');
    console.log('   Personas:');
    console.log('     - id_parentesco: 23 (Otro)');
    console.log('     - id_comunidad_cultural: 2 (Mestizo)');
    console.log('   Familias:');
    console.log('     - id_tipo_vivienda: 1 (Casa)');
    console.log('     - fecha_encuesta: fecha_ultima_encuesta o fecha actual');

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    await transaction.rollback();
    console.error('\n❌ ERROR EN LA MIGRACIÓN:', error.message);
    console.error('   La transacción fue revertida, no se aplicaron cambios');
    await sequelize.close();
    process.exit(1);
  }
}

// Confirmación antes de ejecutar
console.log('⚠️  MIGRACIÓN DE DATOS ANTIGUOS');
console.log('   Este script actualizará registros antiguos con valores por defecto:');
console.log('   - Parentesco: "Otro" (id: 23)');
console.log('   - Comunidad cultural: "Mestizo" (id: 2)');
console.log('   - Tipo vivienda: "Casa" (id: 1)');
console.log('   - Fecha encuesta: fecha última encuesta o fecha actual');
console.log('');
console.log('   Presiona Ctrl+C en los próximos 5 segundos para cancelar...\n');

setTimeout(() => {
  migrarDatosAntiguos();
}, 5000);
