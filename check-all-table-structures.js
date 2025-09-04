import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function checkAllTableStructures() {
  console.log('🔍 VERIFICANDO ESTRUCTURA DE TODAS LAS TABLAS PROBLEMÁTICAS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST, 
    port: process.env.DB_PORT, 
    dialect: 'postgres', 
    logging: false
  });

  try {
    await sequelize.authenticate();
    
    const problematicTables = [
      'familia_disposicion_basura',
      'familia_disposicion_basuras', 
      'familia_sistema_acueducto',
      'familia_sistema_aguas_residuales',
      'familia_tipo_vivienda'
    ];
    
    for (const tableName of problematicTables) {
      console.log(`📋 ${tableName.toUpperCase()}:`);
      
      try {
        const [columns] = await sequelize.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = '${tableName}' 
          ORDER BY ordinal_position
        `);
        
        if (columns.length > 0) {
          columns.forEach(col => {
            if (col.column_name.includes('created') || col.column_name.includes('updated') || col.column_name.includes('At')) {
              console.log(`   🕒 ${col.column_name} (${col.data_type}) ⭐`);
            } else {
              console.log(`   📄 ${col.column_name} (${col.data_type})`);
            }
          });
        } else {
          console.log('   ❌ Tabla no existe');
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      
      console.log('');
    }
    
    await sequelize.close();
    console.log('✅ Verificación completada');
    
  } catch(e) { 
    console.error('❌ Error de conexión:', e.message); 
  }
}

checkAllTableStructures();
