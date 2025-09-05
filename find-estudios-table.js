/**
 * Find the correct estudios table name and structure
 */
import { sequelize } from './src/models/index.js';
import { QueryTypes } from 'sequelize';

async function findEstudiosTable() {
  try {
    console.log('🔍 Finding the correct estudios table...\n');
    
    // 1. List all tables in the database
    console.log('📋 1. All tables in the database:');
    const tables = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `, { type: QueryTypes.SELECT });
    
    console.table(tables);
    
    // 2. Look for tables with "estudio" in the name
    console.log('\n🎓 2. Tables containing "estudio":');
    const estudioTables = tables.filter(table => 
      table.table_name.toLowerCase().includes('estudio')
    );
    
    if (estudioTables.length > 0) {
      console.table(estudioTables);
      
      // Check the structure of each table
      for (const table of estudioTables) {
        console.log(`\n📊 Structure of table "${table.table_name}":`);
        const structure = await sequelize.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = '${table.table_name}'
          ORDER BY ordinal_position;
        `, { type: QueryTypes.SELECT });
        
        console.table(structure);
        
        // Sample data
        console.log(`\n📝 Sample data from "${table.table_name}":`);
        try {
          const sampleData = await sequelize.query(`
            SELECT * FROM ${table.table_name} LIMIT 10;
          `, { type: QueryTypes.SELECT });
          
          console.table(sampleData);
        } catch (error) {
          console.log(`❌ Error getting sample data: ${error.message}`);
        }
      }
    } else {
      console.log('❌ No tables with "estudio" found');
    }
    
    // 3. Check the Estudio model configuration
    console.log('\n🔧 3. Checking Estudio model configuration:');
    try {
      const estudioModel = sequelize.models.Estudio;
      if (estudioModel) {
        console.log(`✅ Estudio model found`);
        console.log(`📊 Table name: ${estudioModel.tableName}`);
        console.log(`🔑 Primary key: ${estudioModel.primaryKeyAttribute}`);
        
        // Try to get data through the model
        console.log('\n📝 Sample data through Estudio model:');
        const modelData = await estudioModel.findAll({ limit: 10 });
        console.table(modelData.map(item => item.toJSON()));
        
      } else {
        console.log('❌ Estudio model not found in sequelize.models');
        console.log('Available models:', Object.keys(sequelize.models));
      }
    } catch (error) {
      console.log(`❌ Error with Estudio model: ${error.message}`);
    }
    
    // 4. Check what's stored in personas.estudios field
    console.log('\n👥 4. Sample estudios values from personas table:');
    const personasEstudios = await sequelize.query(`
      SELECT DISTINCT estudios, COUNT(*) as count
      FROM personas 
      WHERE estudios IS NOT NULL 
        AND estudios != ''
        AND estudios NOT LIKE 'FALLECIDO%'
      GROUP BY estudios 
      ORDER BY count DESC 
      LIMIT 15;
    `, { type: QueryTypes.SELECT });
    
    console.table(personasEstudios);
    
    console.log('\n✅ Analysis completed');
    
  } catch (error) {
    console.error('❌ Error finding estudios table:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the analysis
findEstudiosTable();
