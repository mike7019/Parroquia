import sequelize from './config/sequelize.js';
import './src/models/index.js'; // Importar todos los modelos

async function checkDatabase() {
  try {
    console.log('🔍 Verificando conexión y estado de la base de datos...');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    
    // Obtener información de la base de datos
    const dialect = sequelize.getDialect();
    const dbName = sequelize.getDatabaseName();
    
    console.log(`📊 Base de datos: ${dbName}`);
    console.log(`🔧 Motor: ${dialect}`);
    console.log(`🌐 Host: ${sequelize.config.host}:${sequelize.config.port}`);
    
    // Listar tablas existentes
    console.log('\n📋 Verificando tablas existentes...');
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    
    if (tables.length > 0) {
      console.log('✅ Tablas encontradas:');
      tables.forEach(table => {
        console.log(`   - ${table}`);
      });
    } else {
      console.log('⚠️  No se encontraron tablas en la base de datos');
    }
    
    // Verificar modelos definidos
    console.log('\n🏗️  Modelos definidos en Sequelize:');
    const models = Object.keys(sequelize.models);
    if (models.length > 0) {
      models.forEach(model => {
        console.log(`   - ${model}`);
      });
    } else {
      console.log('⚠️  No se encontraron modelos definidos');
    }
    
    console.log('\n🎯 Próximos pasos sugeridos:');
    console.log('   - Para sincronizar modelos con la DB: npm run db:sync');
    console.log('   - Para modificar tablas existentes: npm run db:sync:alter');
    console.log('   - Para recrear completamente: npm run db:sync:force');
    
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    console.error('Detalles del error:', error.message);
    
    console.log('\n🔧 Posibles soluciones:');
    console.log('   - Verificar que PostgreSQL esté ejecutándose');
    console.log('   - Revisar variables de entorno en .env');
    console.log('   - Verificar credenciales de conexión');
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

checkDatabase();
