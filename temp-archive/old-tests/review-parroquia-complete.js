import { sequelize } from './src/models/index.js';

async function reviewParroquia() {
  try {
    console.log('🔍 Iniciando revisión completa de la tabla Parroquia...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 1. Conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');
    
    // 2. Estructura de la tabla
    console.log('\n📊 Estructura de la tabla parroquia:');
    const tableInfo = await sequelize.getQueryInterface().describeTable('parroquia');
    Object.keys(tableInfo).forEach(column => {
      const col = tableInfo[column];
      const nullable = col.allowNull ? 'NULL' : 'NOT NULL';
      const pk = col.primaryKey ? ' (PK)' : '';
      const ai = col.autoIncrement ? ' (AI)' : '';
      console.log(`   • ${column}: ${col.type} ${nullable}${pk}${ai}`);
    });
    
    // 3. Total de registros
    const totalResult = await sequelize.query('SELECT COUNT(*) as total FROM parroquia');
    const total = totalResult[0][0].total;
    console.log(`\n📈 Total de registros: ${total}`);
    
    // 4. Primeras 10 parroquias
    console.log('\n🏘️ Primeras 10 parroquias:');
    const parroquias = await sequelize.query(`
      SELECT 
        p.id_parroquia,
        p.nombre,
        p.id_municipio,
        m.nombre as municipio_nombre
      FROM parroquia p
      LEFT JOIN municipios m ON p.id_municipio = m.id_municipio
      ORDER BY p.id_parroquia ASC
      LIMIT 10
    `);
    
    if (parroquias[0].length > 0) {
      parroquias[0].forEach((p, i) => {
        console.log(`   ${i+1}. ID: ${p.id_parroquia} | "${p.nombre}" | Municipio: ${p.municipio_nombre || 'N/A'}`);
      });
    }
    
    // 5. Parroquias sin municipio
    const sinMunicipio = await sequelize.query('SELECT COUNT(*) as total FROM parroquia WHERE id_municipio IS NULL');
    console.log(`\n🔍 Parroquias sin municipio: ${sinMunicipio[0][0].total}`);
    
    // 6. Nombres duplicados
    const duplicados = await sequelize.query(`
      SELECT nombre, COUNT(*) as total
      FROM parroquia
      WHERE nombre IS NOT NULL AND nombre != ''
      GROUP BY nombre
      HAVING COUNT(*) > 1
      ORDER BY total DESC
      LIMIT 5
    `);
    
    if (duplicados[0].length > 0) {
      console.log('\n🔄 Nombres duplicados:');
      duplicados[0].forEach((d, i) => {
        console.log(`   ${i+1}. "${d.nombre}": ${d.total} veces`);
      });
    } else {
      console.log('\n✅ No hay nombres duplicados');
    }
    
    // 7. Nombres vacíos
    const vacios = await sequelize.query(`
      SELECT COUNT(*) as total FROM parroquia 
      WHERE nombre IS NULL OR nombre = '' OR TRIM(nombre) = ''
    `);
    console.log(`\n📝 Parroquias con nombre vacío: ${vacios[0][0].total}`);
    
    // 8. Relación con municipios
    const conMunicipio = await sequelize.query(`
      SELECT 
        m.nombre as municipio,
        COUNT(p.id_parroquia) as total_parroquias
      FROM municipios m
      LEFT JOIN parroquia p ON m.id_municipio = p.id_municipio
      GROUP BY m.id_municipio, m.nombre
      HAVING COUNT(p.id_parroquia) > 0
      ORDER BY total_parroquias DESC
      LIMIT 5
    `);
    
    if (conMunicipio[0].length > 0) {
      console.log('\n🏙️ Municipios con más parroquias:');
      conMunicipio[0].forEach((m, i) => {
        console.log(`   ${i+1}. ${m.municipio}: ${m.total_parroquias} parroquias`);
      });
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Revisión completada');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.original) {
      console.error('Error DB:', error.original.message);
    }
  } finally {
    await sequelize.close();
  }
}

reviewParroquia();
