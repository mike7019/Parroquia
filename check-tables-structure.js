import { sequelize } from './src/models/index.js';

async function checkTables() {
  try {
    console.log('🔍 Verificando estructura de tablas...');
    
    await sequelize.authenticate();
    
    // Ver estructura de parroquia
    console.log('\n📊 Tabla PARROQUIA:');
    const parroquiaInfo = await sequelize.getQueryInterface().describeTable('parroquia');
    Object.keys(parroquiaInfo).forEach(column => {
      const col = parroquiaInfo[column];
      console.log(`   • ${column}: ${col.type}`);
    });
    
    // Ver estructura de municipios
    console.log('\n📊 Tabla MUNICIPIOS:');
    const municipiosInfo = await sequelize.getQueryInterface().describeTable('municipios');
    Object.keys(municipiosInfo).forEach(column => {
      const col = municipiosInfo[column];
      console.log(`   • ${column}: ${col.type}`);
    });
    
    // Ver datos de muestra de parroquia
    console.log('\n🏘️ Datos de parroquia:');
    const parroquiaData = await sequelize.query('SELECT * FROM parroquia LIMIT 3');
    console.log(JSON.stringify(parroquiaData[0], null, 2));
    
    // Ver datos de muestra de municipios
    console.log('\n🏙️ Datos de municipios (primeros 3):');
    const municipiosData = await sequelize.query('SELECT * FROM municipios LIMIT 3');
    console.log(JSON.stringify(municipiosData[0], null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTables();
