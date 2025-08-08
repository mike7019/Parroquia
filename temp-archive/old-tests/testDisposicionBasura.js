import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

async function testDisposicionBasura() {
  try {
    console.log('🧪 Probando inserción en tipos_disposicion_basura...');
    
    // Verificar si ya tiene datos
    const [countResult] = await sequelize.query(
      "SELECT COUNT(*) as count FROM tipos_disposicion_basura",
      { type: QueryTypes.SELECT }
    );
    
    console.log(`📊 Registros actuales: ${countResult.count}`);
    
    if (countResult.count > 0) {
      console.log('ℹ️  La tabla ya tiene datos, saltando inserción');
      return;
    }
    
    // Intentar inserción simple
    const data = [
      {
        nombre: 'Recolección Pública',
        descripcion: 'Servicio municipal de recolección de basuras',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    console.log('🔄 Intentando inserción con bulkInsert...');
    try {
      await sequelize.getQueryInterface().bulkInsert('tipos_disposicion_basura', data);
      console.log('✅ Inserción exitosa con bulkInsert');
    } catch (bulkError) {
      console.log('❌ bulkInsert falló:', bulkError.message);
      
      console.log('🔄 Intentando con query directa...');
      try {
        const query = `INSERT INTO tipos_disposicion_basura (nombre, descripcion, created_at, updated_at) VALUES ('${data[0].nombre}', '${data[0].descripcion}', '${data[0].created_at.toISOString()}', '${data[0].updated_at.toISOString()}')`;
        await sequelize.query(query);
        console.log('✅ Inserción exitosa con query directa');
      } catch (directError) {
        console.log('❌ Query directa también falló:', directError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await sequelize.close();
  }
}

testDisposicionBasura();
