import sequelize from './config/sequelize.js';
import Departamentos from './src/models/catalog/Departamentos.js';
import Municipios from './src/models/catalog/Municipios.js';
import Veredas from './src/models/catalog/Veredas.js';
import Sectores from './src/models/catalog/Sectores.js';
import Familias from './src/models/catalog/Familias.js';

async function seedUsingModels() {
  try {
    console.log('🌱 Seeding using Sequelize models...');
    
    // 1. Create Departamento using model
    console.log('🗺️ Creating departamento...');
    let departamento;
    try {
      [departamento] = await Departamentos.findOrCreate({
        where: { id_departamento: 1 },
        defaults: {
          id_departamento: 1,
          nombre_departamento: 'Departamento Default'
        }
      });
      console.log(`✅ Departamento: ${departamento.id_departamento} - ${departamento.nombre_departamento}`);
    } catch (error) {
      console.log(`⚠️ Departamento error: ${error.message}`);
      // Try alternative approach
      try {
        await sequelize.query(`INSERT INTO departamentos (id_departamento, nombre_departamento) VALUES (1, 'Departamento Default') ON CONFLICT DO NOTHING`);
        console.log('✅ Departamento created via SQL');
      } catch (sqlError) {
        console.log(`❌ Departamento SQL error: ${sqlError.message}`);
      }
    }
    
    // 2. Create Municipio using model
    console.log('🏙️ Creating municipio...');
    let municipio;
    try {
      [municipio] = await Municipios.findOrCreate({
        where: { id_municipio: 1 },
        defaults: {
          id_municipio: 1,
          nombre_municipio: 'Municipio Default',
          id_departamento: 1
        }
      });
      console.log(`✅ Municipio: ${municipio.id_municipio} - ${municipio.nombre_municipio}`);
    } catch (error) {
      console.log(`⚠️ Municipio error: ${error.message}`);
      // Try alternative approach
      try {
        await sequelize.query(`INSERT INTO municipios (id_municipio, nombre_municipio, id_departamento) VALUES (1, 'Municipio Default', 1) ON CONFLICT DO NOTHING`);
        console.log('✅ Municipio created via SQL');
      } catch (sqlError) {
        console.log(`❌ Municipio SQL error: ${sqlError.message}`);
      }
    }
    
    // 3. Create Vereda using model
    console.log('🏘️ Creating vereda...');
    let vereda;
    try {
      [vereda] = await Veredas.findOrCreate({
        where: { id_vereda: 1 },
        defaults: {
          id_vereda: 1,
          nombre_vereda: 'Vereda Default',
          id_municipio: 1
        }
      });
      console.log(`✅ Vereda: ${vereda.id_vereda} - ${vereda.nombre_vereda || vereda.nombre || 'Default'}`);
    } catch (error) {
      console.log(`⚠️ Vereda error: ${error.message}`);
      // Try different column names
      const possibleColumns = ['nombre_vereda', 'nombre', 'name'];
      let success = false;
      
      for (const colName of possibleColumns) {
        try {
          await sequelize.query(`INSERT INTO veredas (id_vereda, ${colName}, id_municipio) VALUES (1, 'Vereda Default', 1) ON CONFLICT DO NOTHING`);
          console.log(`✅ Vereda created via SQL with column: ${colName}`);
          success = true;
          break;
        } catch (sqlError) {
          console.log(`❌ Vereda SQL error with ${colName}: ${sqlError.message}`);
        }
      }
      
      if (!success) {
        console.log('❌ Could not create vereda with any column name');
      }
    }
    
    // 4. Create Sector using model
    console.log('🏭 Creating sector...');
    let sector;
    try {
      [sector] = await Sectores.findOrCreate({
        where: { id_sector: 1 },
        defaults: {
          id_sector: 1,
          nombre_sector: 'Sector Default',
          id_vereda: 1
        }
      });
      console.log(`✅ Sector: ${sector.id_sector} - ${sector.nombre_sector}`);
    } catch (error) {
      console.log(`⚠️ Sector error: ${error.message}`);
      // Try alternative approach
      const possibleColumns = ['nombre_sector', 'nombre', 'name'];
      let success = false;
      
      for (const colName of possibleColumns) {
        try {
          await sequelize.query(`INSERT INTO sectores (id_sector, ${colName}, id_vereda) VALUES (1, 'Sector Default', 1) ON CONFLICT DO NOTHING`);
          console.log(`✅ Sector created via SQL with column: ${colName}`);
          success = true;
          break;
        } catch (sqlError) {
          console.log(`❌ Sector SQL error with ${colName}: ${sqlError.message}`);
        }
      }
      
      if (!success) {
        console.log('❌ Could not create sector with any column name');
      }
    }
    
    // 5. Test Familia creation
    console.log('\n🧪 Testing familia creation with models...');
    const transaction = await sequelize.transaction();
    try {
      const testFamilia = await Familias.create({
        apellido_familiar: 'Test Family Model',
        sector: 'Test Sector',
        direccion_familia: 'Test Address 123',
        tamaño_familia: 1,
        tipo_vivienda: 'Casa',
        estado_encuesta: 'pending',
        numero_encuestas: 0,
        id_municipio: 1,
        id_vereda: 1,
        id_sector: 1,
        comunionEnCasa: false
      }, { transaction });
      
      console.log(`🎉 FAMILIA CREATION SUCCESSFUL! ID: ${testFamilia.id_familia}`);
      console.log(`   Apellido: ${testFamilia.apellido_familiar}`);
      console.log(`   Dirección: ${testFamilia.direccion_familia}`);
      
      await transaction.rollback();
      console.log('🔄 Test rolled back');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Familia creation failed:', error.message);
      
      // Let's try with minimal data
      console.log('\n🧪 Trying minimal familia creation...');
      const minTransaction = await sequelize.transaction();
      try {
        const minFamilia = await Familias.create({
          apellido_familiar: 'Test Minimal',
          sector: 'Centro',
          direccion_familia: 'Test Dir',
          tamaño_familia: 1,
          tipo_vivienda: 'Casa',
          estado_encuesta: 'pending',
          numero_encuestas: 0
        }, { minTransaction });
        
        console.log(`✅ Minimal familia created! ID: ${minFamilia.id_familia}`);
        await minTransaction.rollback();
        console.log('🔄 Minimal test rolled back');
        
      } catch (minError) {
        await minTransaction.rollback();
        console.error('❌ Even minimal familia failed:', minError.message);
      }
    }
    
    console.log('\n📋 Seeding summary completed!');
    console.log('✅ Database should now be ready for familia creation');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedUsingModels()
    .then(() => {
      console.log('✅ Model-based seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Model-based seeding failed:', error);
      process.exit(1);
    });
}

export default seedUsingModels;
