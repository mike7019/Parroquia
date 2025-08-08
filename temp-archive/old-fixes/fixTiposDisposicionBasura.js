import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

async function fixTiposDisposicionBasura() {
  try {
    console.log('🔧 Arreglando tabla tipos_disposicion_basura...');
    
    // Verificar estado de la tabla
    const columns = await sequelize.query(
      `SELECT column_name, data_type, is_nullable, column_default 
       FROM information_schema.columns 
       WHERE table_name = 'tipos_disposicion_basura' 
       ORDER BY ordinal_position`,
      { type: QueryTypes.SELECT }
    );
    
    console.log('📋 Columnas actuales:');
    columns.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}) ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Verificar si hay columnas duplicadas o problemáticas
    const problematicColumn = columns.find(c => c.column_name === 'id_tipos_disposicion_basura' && !c.column_default);
    
    if (problematicColumn) {
      console.log('🚨 Encontrada columna problemática id_tipos_disposicion_basura sin DEFAULT');
      
      // Intentar eliminar la columna problemática
      try {
        await sequelize.query('ALTER TABLE tipos_disposicion_basura DROP COLUMN IF EXISTS id_tipos_disposicion_basura CASCADE');
        console.log('✅ Columna problemática eliminada');
      } catch (dropError) {
        console.error('❌ Error eliminando columna:', dropError.message);
      }
      
      // Intentar eliminar otras columnas duplicadas si existen
      try {
        await sequelize.query('ALTER TABLE tipos_disposicion_basura DROP COLUMN IF EXISTS metodo CASCADE');
        await sequelize.query('ALTER TABLE tipos_disposicion_basura DROP COLUMN IF EXISTS "createdAt" CASCADE');
        await sequelize.query('ALTER TABLE tipos_disposicion_basura DROP COLUMN IF EXISTS "updatedAt" CASCADE');
        console.log('✅ Columnas duplicadas eliminadas');
      } catch (cleanError) {
        console.warn('⚠️  Error limpiando columnas duplicadas:', cleanError.message);
      }
    }
    
    // Verificar estructura final
    const finalColumns = await sequelize.query(
      `SELECT column_name, data_type, is_nullable, column_default 
       FROM information_schema.columns 
       WHERE table_name = 'tipos_disposicion_basura' 
       ORDER BY ordinal_position`,
      { type: QueryTypes.SELECT }
    );
    
    console.log('\n📋 Estructura final:');
    finalColumns.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}) ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Intentar insertar datos de prueba
    console.log('\n🧪 Probando inserción...');
    const testData = {
      nombre: 'Recolección Pública',
      descripcion: 'Servicio municipal de recolección de basuras',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const [countResult] = await sequelize.query(
      "SELECT COUNT(*) as count FROM tipos_disposicion_basura",
      { type: QueryTypes.SELECT }
    );
    
    if (countResult.count === 0) {
      await sequelize.getQueryInterface().bulkInsert('tipos_disposicion_basura', [testData]);
      console.log('✅ Inserción de prueba exitosa');
    } else {
      console.log('ℹ️  La tabla ya tiene datos');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixTiposDisposicionBasura();
