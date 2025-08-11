#!/usr/bin/env node

import sequelize from './config/sequelize.js';

async function checkDatabase() {
  try {
    console.log('🔍 Checking database tables...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection OK');
    
    // Get all tables
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Available tables:');
    results.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Check if we need to create surveys table
    const surveyTableExists = results.some(row => row.table_name === 'encuestas' || row.table_name === 'surveys');
    
    if (!surveyTableExists) {
      console.log('\n⚠️  No surveys/encuestas table found. Creating it...');
      
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS encuestas (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id INTEGER REFERENCES usuarios(id),
          family_id BIGINT REFERENCES familias(id_familia),
          sector VARCHAR(100) NOT NULL,
          family_head VARCHAR(200) NOT NULL,
          address TEXT NOT NULL,
          phone VARCHAR(20),
          email VARCHAR(100),
          family_size INTEGER NOT NULL DEFAULT 1,
          housing_type VARCHAR(100) NOT NULL,
          observations TEXT,
          status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled')),
          current_stage INTEGER DEFAULT 1,
          total_stages INTEGER DEFAULT 4,
          progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
          stages_data JSONB DEFAULT '[]'::jsonb,
          family_members JSONB DEFAULT '[]'::jsonb,
          temp_data JSONB,
          completed_at TIMESTAMP,
          last_auto_save TIMESTAMP,
          version INTEGER DEFAULT 1,
          last_saved_stage INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Create indexes
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_encuestas_user_id ON encuestas(user_id);
        CREATE INDEX IF NOT EXISTS idx_encuestas_family_id ON encuestas(family_id);
        CREATE INDEX IF NOT EXISTS idx_encuestas_status ON encuestas(status);
        CREATE INDEX IF NOT EXISTS idx_encuestas_sector ON encuestas(sector);
      `);
      
      console.log('✅ Created encuestas table with indexes');
    } else {
      console.log('\n✅ Surveys table already exists');
    }
    
    console.log('\n🎉 Database check completed!');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();
