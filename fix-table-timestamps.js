import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function fixTableTimestamps() {
  console.log('🔧 CORRIGIENDO TIMESTAMPS DE TABLAS');
  console.log('════════════════════════════════════');
  console.log('');

  const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST, 
    port: process.env.DB_PORT, 
    dialect: 'postgres', 
    logging: false
  });

  try {
    await sequelize.authenticate();
    
    // Actualizar familia_sistema_acueducto para usar created_at/updated_at
    console.log('💧 Actualizando familia_sistema_acueducto...');
    await sequelize.query(`
      ALTER TABLE familia_sistema_acueducto 
      RENAME COLUMN "createdAt" TO created_at
    `).catch(() => console.log('   ⚠️ createdAt ya renombrado o no existe'));
    
    await sequelize.query(`
      ALTER TABLE familia_sistema_acueducto 
      RENAME COLUMN "updatedAt" TO updated_at
    `).catch(() => console.log('   ⚠️ updatedAt ya renombrado o no existe'));
    
    // Actualizar familia_sistema_aguas_residuales para usar created_at/updated_at
    console.log('🚰 Actualizando familia_sistema_aguas_residuales...');
    await sequelize.query(`
      ALTER TABLE familia_sistema_aguas_residuales 
      RENAME COLUMN "createdAt" TO created_at
    `).catch(() => console.log('   ⚠️ createdAt ya renombrado o no existe'));
    
    await sequelize.query(`
      ALTER TABLE familia_sistema_aguas_residuales 
      RENAME COLUMN "updatedAt" TO updated_at
    `).catch(() => console.log('   ⚠️ updatedAt ya renombrado o no existe'));
    
    console.log('');
    console.log('🔍 VERIFICANDO ESTRUCTURA FINAL:');
    
    const tables = ['familia_sistema_acueducto', 'familia_sistema_aguas_residuales', 'familia_tipo_vivienda'];
    
    for (const tableName of tables) {
      console.log(`\n📋 ${tableName.toUpperCase()}:`);
      const [columns] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = '${tableName}' 
        AND column_name IN ('created_at', 'updated_at', 'createdAt', 'updatedAt')
        ORDER BY column_name
      `);
      columns.forEach(col => console.log(`   ${col.column_name}`));
    }
    
    await sequelize.close();
    console.log('\n✅ Corrección de timestamps completada');
  } catch(e) { 
    console.error('❌ Error:', e.message); 
  }
}

fixTableTimestamps();
