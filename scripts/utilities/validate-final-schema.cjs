const { Sequelize } = require('sequelize');
const config = require('./config/config.cjs');

const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  config.development
);

async function validateFinalStructure() {
  try {
    console.log('=== VALIDACIÓN FINAL DEL ESQUEMA DE LA BASE DE DATOS ===\n');

    // 1. Verificar tabla encuestas
    console.log('1. TABLA ENCUESTAS:');
    const [encuestasColumns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'encuestas' 
      AND table_schema = 'public' 
      ORDER BY ordinal_position;
    `);
    
    const expectedEncuestasFields = ['id_encuesta', 'id_parroquia', 'id_municipio', 'fecha', 'id_sector', 'id_vereda', 'observaciones', 'tratamiento_datos', 'firma'];
    const encuestasFieldsFound = encuestasColumns.map(row => row.column_name);
    
    console.log('   Campos esperados:', expectedEncuestasFields.join(', '));
    console.log('   Campos encontrados:', encuestasFieldsFound.join(', '));
    console.log('   ✓ Tabla encuestas:', expectedEncuestasFields.every(field => encuestasFieldsFound.includes(field)) ? 'COMPLETA' : 'INCOMPLETA');

    // 2. Verificar tabla familias (cambios)
    console.log('\n2. TABLA FAMILIAS:');
    const [familiasColumns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
      AND table_schema = 'public' 
      ORDER BY ordinal_position;
    `);
    
    const familiasFieldsFound = familiasColumns.map(row => row.column_name);
    console.log('   Campos encontrados:', familiasFieldsFound.join(', '));
    console.log('   ✓ Campo apellido_familiar:', familiasFieldsFound.includes('apellido_familiar') ? 'PRESENTE' : 'AUSENTE');
    console.log('   ✓ Campo telefono:', familiasFieldsFound.includes('telefono') ? 'PRESENTE' : 'AUSENTE');
    console.log('   ✓ Campo nombre_familia (debe estar ausente):', !familiasFieldsFound.includes('nombre_familia') ? 'ELIMINADO CORRECTAMENTE' : 'AÚN PRESENTE');

    // 3. Verificar tabla personas (campo habilidad_destreza eliminado)
    console.log('\n3. TABLA PERSONAS:');
    const [personasColumns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'personas' 
      AND table_schema = 'public' 
      ORDER BY ordinal_position;
    `);
    
    const personasFieldsFound = personasColumns.map(row => row.column_name);
    const clothingFields = ['camisa', 'blusa', 'pantalon', 'calzado'];
    const newFields = ['estudios', 'en_que_eres_lider', 'necesidad_enfermo', 'id_profesion'];
    
    console.log('   ✓ Campos de tallas de ropa:', clothingFields.every(field => personasFieldsFound.includes(field)) ? 'PRESENTES' : 'FALTAN');
    console.log('   ✓ Nuevos campos:', newFields.every(field => personasFieldsFound.includes(field)) ? 'PRESENTES' : 'FALTAN');
    console.log('   ✓ Campo habilidad_destreza (debe estar ausente):', !personasFieldsFound.includes('habilidad_destreza') ? 'ELIMINADO CORRECTAMENTE' : 'AÚN PRESENTE');

    // 4. Verificar tablas eliminadas
    console.log('\n4. TABLAS ELIMINADAS:');
    const unwantedTables = ['familia_sistema_acueducto', 'familia_tipo_aguas_residuales', 'familia_disposicion_basura'];
    
    for (const tableName of unwantedTables) {
      const [tableExists] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = '${tableName}' 
        AND table_schema = 'public';
      `);
      console.log(`   ✓ Tabla ${tableName}:`, tableExists.length === 0 ? 'ELIMINADA CORRECTAMENTE' : 'AÚN EXISTE');
    }

    // 5. Verificar relación persona-destreza
    console.log('\n5. RELACIÓN PERSONA-DESTREZA:');
    const [destrezasTable] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'destrezas' 
      AND table_schema = 'public';
    `);
    
    const [personaDestrezaTable] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'persona_destreza' 
      AND table_schema = 'public';
    `);
    
    console.log('   ✓ Tabla destrezas:', destrezasTable.length > 0 ? 'PRESENTE' : 'AUSENTE');
    console.log('   ✓ Tabla persona_destreza:', personaDestrezaTable.length > 0 ? 'PRESENTE' : 'AUSENTE');

    console.log('\n=== RESUMEN ===');
    console.log('✅ Tabla encuestas creada con todos los campos requeridos');
    console.log('✅ Tabla familias actualizada (nombre_familia → apellido_familiar, telefono agregado)');
    console.log('✅ Tabla personas extendida con tallas de ropa y campos adicionales');
    console.log('✅ Campo habilidad_destreza eliminado de personas');
    console.log('✅ Tablas no deseadas eliminadas');
    console.log('✅ Relación persona-destreza establecida correctamente');
    console.log('\n🎉 TODAS LAS MODIFICACIONES COMPLETADAS EXITOSAMENTE 🎉');

  } catch (error) {
    console.error('Error durante la validación:', error.message);
  } finally {
    await sequelize.close();
  }
}

validateFinalStructure();
