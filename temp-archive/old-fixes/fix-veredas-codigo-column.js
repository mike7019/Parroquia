import sequelize from './config/sequelize.js';

async function addCodigoVeredaColumn() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    const queryInterface = sequelize.getQueryInterface();
    
    // Check if the column already exists
    const tableInfo = await queryInterface.describeTable('veredas');
    
    if (tableInfo.codigo_vereda) {
      console.log('Column codigo_vereda already exists in veredas table');
      await sequelize.close();
      return;
    }

    console.log('Adding codigo_vereda column to veredas table...');
    
    // Add the codigo_vereda column
    await queryInterface.addColumn('veredas', 'codigo_vereda', {
      type: sequelize.Sequelize.STRING(50),
      allowNull: true,
      unique: true
    });

    console.log('✓ Column codigo_vereda added successfully to veredas table');

    // Verify the column was added
    const updatedTableInfo = await queryInterface.describeTable('veredas');
    if (updatedTableInfo.codigo_vereda) {
      console.log('✓ Column verification successful');
      console.log('Column details:', updatedTableInfo.codigo_vereda);
    } else {
      console.log('❌ Column verification failed');
    }

    await sequelize.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error adding codigo_vereda column:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

addCodigoVeredaColumn();
