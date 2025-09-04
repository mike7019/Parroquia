import sequelize from './config/sequelize.js';

async function checkTableStructure() {
  try {
    await sequelize.authenticate();
    console.log('🔗 Conexión a DB exitosa');
    
    // Consultar estructura de la tabla destrezas
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'destrezas' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Estructura de la tabla destrezas:');
    results.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
    });
    
    // También consultar los datos actuales
    const [data] = await sequelize.query('SELECT * FROM destrezas ORDER BY id_destreza;');
    console.log(`\n📊 Datos actuales en destrezas (${data.length} registros):`);
    data.forEach((row, i) => {
      console.log(`  ${i+1}. ID: ${row.id_destreza}, Nombre: ${row.nombre}`);
      // Mostrar otros campos si existen
      Object.keys(row).forEach(key => {
        if (key !== 'id_destreza' && key !== 'nombre' && row[key] !== null && row[key] !== undefined) {
          console.log(`      ${key}: ${row[key]}`);
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTableStructure();
