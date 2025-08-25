import sequelize from './config/sequelize.js';

/**
 * Script para arreglar el problema de la secuencia de auto-incremento
 * en la tabla familias de PostgreSQL
 */

async function fixFamiliasSequence() {
  try {
    console.log('🔧 Iniciando corrección de secuencia de familias...');

    // 1. Verificar el estado actual de la tabla
    const [results] = await sequelize.query(`
      SELECT 
        MAX(id_familia) as max_id,
        COUNT(*) as total_records
      FROM familias;
    `);
    
    const maxId = results[0]?.max_id || 0;
    const totalRecords = results[0]?.total_records || 0;
    
    console.log(`📊 Estado actual de la tabla familias:`);
    console.log(`   - Registros totales: ${totalRecords}`);
    console.log(`   - ID máximo: ${maxId}`);

    // 2. Verificar la secuencia actual
    const [seqResults] = await sequelize.query(`
      SELECT 
        sequence_name,
        last_value,
        is_called
      FROM information_schema.sequences 
      WHERE sequence_name LIKE '%familias_id_familia_seq%';
    `);

    if (seqResults.length > 0) {
      const sequence = seqResults[0];
      console.log(`🔢 Estado de la secuencia:`);
      console.log(`   - Nombre: ${sequence.sequence_name}`);
      console.log(`   - Último valor: ${sequence.last_value}`);
      console.log(`   - Ha sido llamada: ${sequence.is_called}`);

      // 3. Ajustar la secuencia si es necesario
      const nextValue = maxId + 1;
      
      if (sequence.last_value <= maxId) {
        console.log(`⚠️ La secuencia está desincronizada. Ajustando...`);
        
        await sequelize.query(`
          SELECT setval('familias_id_familia_seq', ${nextValue}, false);
        `);
        
        console.log(`✅ Secuencia ajustada al valor ${nextValue}`);
      } else {
        console.log(`✅ La secuencia está correctamente sincronizada`);
      }
    } else {
      console.log(`⚠️ No se encontró la secuencia. Creando...`);
      
      // Crear la secuencia si no existe
      await sequelize.query(`
        CREATE SEQUENCE IF NOT EXISTS familias_id_familia_seq
        START WITH ${maxId + 1}
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
      `);
      
      // Asociar la secuencia a la columna
      await sequelize.query(`
        ALTER TABLE familias 
        ALTER COLUMN id_familia 
        SET DEFAULT nextval('familias_id_familia_seq');
      `);
      
      console.log(`✅ Secuencia creada y configurada`);
    }

    // 4. Verificar que la tabla puede insertar correctamente
    console.log(`🧪 Probando inserción de prueba...`);
    
    const testData = {
      apellido_familiar: 'TEST_FAMILY',
      sector: 'TEST_SECTOR',
      direccion_familia: 'Test Address',
      tamaño_familia: 1,
      tipo_vivienda: 'Casa',
      estado_encuesta: 'pending'
    };

    const [insertResult] = await sequelize.query(`
      INSERT INTO familias (
        apellido_familiar, sector, direccion_familia, 
        tamaño_familia, tipo_vivienda, estado_encuesta
      ) VALUES (
        :apellido_familiar, :sector, :direccion_familia,
        :tamaño_familia, :tipo_vivienda, :estado_encuesta
      ) RETURNING id_familia;
    `, {
      replacements: testData,
      type: sequelize.QueryTypes.INSERT
    });

    const newId = insertResult[0]?.id_familia;
    console.log(`✅ Inserción de prueba exitosa. Nuevo ID: ${newId}`);

    // 5. Eliminar el registro de prueba
    await sequelize.query(`
      DELETE FROM familias WHERE id_familia = :id;
    `, {
      replacements: { id: newId }
    });
    
    console.log(`🧹 Registro de prueba eliminado`);

    // 6. Verificar el estado final
    const [finalResults] = await sequelize.query(`
      SELECT 
        sequence_name,
        last_value,
        is_called
      FROM information_schema.sequences 
      WHERE sequence_name LIKE '%familias_id_familia_seq%';
    `);

    if (finalResults.length > 0) {
      const finalSeq = finalResults[0];
      console.log(`📋 Estado final de la secuencia:`);
      console.log(`   - Último valor: ${finalSeq.last_value}`);
      console.log(`   - Ha sido llamada: ${finalSeq.is_called}`);
    }

    console.log(`🎉 Corrección de secuencia completada exitosamente`);

  } catch (error) {
    console.error('❌ Error al corregir la secuencia de familias:', error);
    throw error;
  }
}

// Ejecutar solo si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  fixFamiliasSequence()
    .then(() => {
      console.log('✅ Script ejecutado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script:', error);
      process.exit(1);
    });
}

export default fixFamiliasSequence;
