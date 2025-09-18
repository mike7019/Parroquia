// Script para verificar el nombre correcto de la tabla de parroquias
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DB_NAME || 'parroquia_db', process.env.DB_USER || 'parroquia_user', process.env.DB_PASSWORD || 'Closter2024*', {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: false
});

async function verificarTablaParroquias() {
  try {
    console.log('🔍 Verificando qué tabla de parroquias existe...');
    
    // Probar con 'parroquia' (singular)
    try {
      const result1 = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_name = 'parroquia'");
      if (result1[0].length > 0) {
        console.log('✅ Tabla encontrada: "parroquia" (singular)');
        const columns = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'parroquia'");
        console.log('📋 Columnas:', columns[0].map(c => c.column_name));
      }
    } catch (error) {
      console.log('❌ Tabla "parroquia" no encontrada');
    }
    
    // Probar con 'parroquias' (plural)
    try {
      const result2 = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_name = 'parroquias'");
      if (result2[0].length > 0) {
        console.log('✅ Tabla encontrada: "parroquias" (plural)');
        const columns = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'parroquias'");  
        console.log('📋 Columnas:', columns[0].map(c => c.column_name));
      }
    } catch (error) {
      console.log('❌ Tabla "parroquias" no encontrada');
    }
    
    // Listar todas las tablas que contengan 'parroq'
    const todasTablas = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%parroq%'");
    console.log('🔍 Tablas que contienen "parroq":', todasTablas[0].map(t => t.table_name));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarTablaParroquias();