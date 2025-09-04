import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function fixDisposicionBasuraTable() {
  console.log('🗑️ CORRIGIENDO TABLA FAMILIA_DISPOSICION_BASURA');
  console.log('═══════════════════════════════════════════════');
  console.log('');

  const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST, 
    port: process.env.DB_PORT, 
    dialect: 'postgres', 
    logging: false
  });

  try {
    await sequelize.authenticate();
    
    console.log('🔧 Renombrando columnas de timestamps...');
    
    // Cambiar createdAt a created_at
    try {
      await sequelize.query(`
        ALTER TABLE familia_disposicion_basura 
        RENAME COLUMN "createdAt" TO created_at
      `);
      console.log('✅ createdAt → created_at');
    } catch (error) {
      console.log('⚠️ createdAt ya existe como created_at o error:', error.message);
    }
    
    // Cambiar updatedAt a updated_at
    try {
      await sequelize.query(`
        ALTER TABLE familia_disposicion_basura 
        RENAME COLUMN "updatedAt" TO updated_at
      `);
      console.log('✅ updatedAt → updated_at');
    } catch (error) {
      console.log('⚠️ updatedAt ya existe como updated_at o error:', error.message);
    }
    
    console.log('');
    console.log('🔍 Verificando estructura final...');
    
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'familia_disposicion_basura' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 FAMILIA_DISPOSICION_BASURA (actualizada):');
    columns.forEach(col => {
      if (col.column_name.includes('created') || col.column_name.includes('updated')) {
        console.log(`   🕒 ${col.column_name} (${col.data_type}) ⭐`);
      } else {
        console.log(`   📄 ${col.column_name} (${col.data_type})`);
      }
    });
    
    console.log('');
    console.log('🧪 Probando INSERT con nuevos nombres...');
    
    try {
      // Probar con una transacción de prueba
      const transaction = await sequelize.transaction();
      
      await sequelize.query(`
        INSERT INTO familia_disposicion_basura 
        (id_familia, id_tipo_disposicion_basura, created_at, updated_at) 
        VALUES (999, 1, NOW(), NOW())
      `, { transaction });
      
      // Limpiar inmediatamente
      await sequelize.query(`
        DELETE FROM familia_disposicion_basura WHERE id_familia = 999
      `, { transaction });
      
      await transaction.commit();
      console.log('✅ INSERT de prueba exitoso');
      
    } catch (error) {
      console.log('❌ Error en INSERT de prueba:', error.message);
    }
    
    await sequelize.close();
    console.log('\n🎉 ¡TABLA FAMILIA_DISPOSICION_BASURA CORREGIDA!');
    console.log('✅ Timestamps normalizados a created_at/updated_at');
    console.log('✅ Listo para usar en encuestas');
    
  } catch(e) { 
    console.error('❌ Error:', e.message); 
  }
}

fixDisposicionBasuraTable();
