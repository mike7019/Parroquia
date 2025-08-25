import sequelize from './config/sequelize.js';
import Familias from './src/models/catalog/Familias.js';

async function testFamiliasInsertion() {
  try {
    console.log('🧪 Probando inserción en tabla familias...');
    
    // 1. Verificar estado actual
    const [currentState] = await sequelize.query(`
      SELECT 
        COUNT(*) as count,
        MAX(id_familia) as max_id
      FROM familias;
    `);
    
    console.log(`📊 Estado actual:`);
    console.log(`   - Total familias: ${currentState[0].count}`);
    console.log(`   - ID máximo: ${currentState[0].max_id}`);
    
    // 2. Verificar secuencia
    const [seqState] = await sequelize.query(`
      SELECT last_value FROM pg_sequences 
      WHERE sequencename = 'familias_id_familia_seq';
    `);
    
    console.log(`🔢 Secuencia actual: ${seqState[0].last_value}`);
    
    // 3. Probar inserción directa con SQL
    console.log('🔧 Probando inserción directa con SQL...');
    
    try {
      const [sqlResult] = await sequelize.query(`
        INSERT INTO familias (
          apellido_familiar, sector, direccion_familia, 
          tamaño_familia, tipo_vivienda, estado_encuesta
        ) VALUES (
          'TEST_SQL', 'TEST_SECTOR', 'TEST_ADDRESS',
          1, 'Casa', 'pending'
        ) RETURNING id_familia;
      `);
      
      const sqlId = sqlResult[0].id_familia;
      console.log(`✅ Inserción SQL exitosa. ID: ${sqlId}`);
      
      // Eliminar registro de prueba
      await sequelize.query(`DELETE FROM familias WHERE id_familia = ${sqlId}`);
      console.log(`🧹 Registro SQL eliminado`);
      
    } catch (sqlError) {
      console.error(`❌ Error en inserción SQL:`, sqlError.message);
    }
    
    // 4. Probar inserción con Sequelize
    console.log('🔧 Probando inserción con Sequelize...');
    
    try {
      const testData = {
        apellido_familiar: 'TEST_SEQUELIZE',
        sector: 'TEST_SECTOR',
        direccion_familia: 'TEST_ADDRESS',
        tamaño_familia: 1,
        tipo_vivienda: 'Casa',
        estado_encuesta: 'pending'
      };
      
      const familia = await Familias.create(testData);
      console.log(`✅ Inserción Sequelize exitosa. ID: ${familia.id_familia}`);
      
      // Eliminar registro de prueba
      await familia.destroy();
      console.log(`🧹 Registro Sequelize eliminado`);
      
    } catch (seqError) {
      console.error(`❌ Error en inserción Sequelize:`, seqError.message);
      console.error(`   Stack:`, seqError.stack);
    }
    
    // 5. Verificar estado final
    const [finalState] = await sequelize.query(`
      SELECT 
        COUNT(*) as count,
        MAX(id_familia) as max_id
      FROM familias;
    `);
    
    console.log(`📊 Estado final:`);
    console.log(`   - Total familias: ${finalState[0].count}`);
    console.log(`   - ID máximo: ${finalState[0].max_id}`);
    
    console.log(`🎉 Prueba completada`);
    
  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await sequelize.close();
  }
}

testFamiliasInsertion();
