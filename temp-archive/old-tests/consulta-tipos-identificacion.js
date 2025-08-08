import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de la base de datos
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parroquia_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  dialect: 'postgres',
  logging: false
});

async function consultarTiposIdentificacion() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');
    
    // Consultar estructura de la tabla
    console.log('\n📋 Estructura de la tabla tipos_identificacion:');
    const [estructura] = await sequelize.query(`
      SELECT 
        column_name as "Columna", 
        data_type as "Tipo", 
        is_nullable as "Permite NULL", 
        column_default as "Valor por defecto"
      FROM information_schema.columns 
      WHERE table_name = 'tipos_identificacion'
      ORDER BY ordinal_position;
    `);
    console.table(estructura);
    
    // Consultar datos de la tabla
    console.log('\n📊 Datos en la tabla tipos_identificacion:');
    const [datos] = await sequelize.query(`
      SELECT * FROM tipos_identificacion 
      ORDER BY id_tipo_identificacion;
    `);
    console.table(datos);
    
    console.log(`\n📈 Total de registros: ${datos.length}`);
    
    // Información adicional
    console.log('\n🔍 Información adicional:');
    const [info] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(DISTINCT descripcion) as descripciones_unicas,
        COUNT(DISTINCT codigo) as codigos_unicos
      FROM tipos_identificacion;
    `);
    console.table(info);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión a la base de datos cerrada');
  }
}

consultarTiposIdentificacion();
