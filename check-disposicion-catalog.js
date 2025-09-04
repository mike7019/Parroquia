import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function checkDisposicionCatalog() {
  const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST, 
    port: process.env.DB_PORT, 
    dialect: 'postgres', 
    logging: false
  });

  try {
    await sequelize.authenticate();
    
    console.log('🗑️ VERIFICANDO CATÁLOGO DE DISPOSICIÓN DE BASURA');
    console.log('═══════════════════════════════════════════════════');
    
    try {
      const [tipos] = await sequelize.query('SELECT * FROM tipos_disposicion_basura ORDER BY id_tipo_disposicion_basura');
      
      if (tipos.length > 0) {
        console.log('📋 TIPOS DE DISPOSICIÓN EXISTENTES:');
        tipos.forEach(tipo => {
          console.log(`   ${tipo.id_tipo_disposicion_basura}. ${tipo.nombre || tipo.descripcion}`);
        });
        console.log(`\nTotal: ${tipos.length} tipos`);
      } else {
        console.log('❌ La tabla existe pero no tiene datos');
      }
    } catch (error) {
      console.log('❌ Error accediendo a tipos_disposicion_basura:', error.message);
      
      // Verificar si existe la tabla
      const [tables] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%disposicion%'
      `);
      
      console.log('\n📋 TABLAS DE DISPOSICIÓN ENCONTRADAS:');
      tables.forEach(t => console.log(`   ${t.table_name}`));
    }
    
    await sequelize.close();
  } catch(e) { 
    console.error('Error de conexión:', e.message); 
  }
}

checkDisposicionCatalog();
