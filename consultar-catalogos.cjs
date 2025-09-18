const { Sequelize } = require('sequelize');

// Usar credenciales locales de desarrollo
const sequelize = new Sequelize('parroquia_db', 'postgres', 'Sistemas2024*', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

async function checkTables() {
  try {
    console.log('📊 CONSULTANDO TABLAS DE CATÁLOGO:');
    
    const [sexos] = await sequelize.query('SELECT * FROM sexo ORDER BY id_sexo');
    console.log('\n🚻 SEXOS:');
    sexos.forEach(s => console.log(`ID: ${s.id_sexo}, Nombre: ${s.descripcion}`));
    
    const [tipos_id] = await sequelize.query('SELECT * FROM tipo_identificacion ORDER BY id_tipo_identificacion LIMIT 5');
    console.log('\n🆔 TIPOS DE IDENTIFICACIÓN:');
    tipos_id.forEach(t => console.log(`ID: ${t.id_tipo_identificacion}, Nombre: ${t.nombre}`));
    
    const [estudios] = await sequelize.query('SELECT * FROM estudios ORDER BY id_estudios LIMIT 10');
    console.log('\n🎓 ESTUDIOS:');
    estudios.forEach(e => console.log(`ID: ${e.id_estudios}, Nombre: ${e.nombre}`));
    
    const [parentescos] = await sequelize.query('SELECT * FROM parentesco ORDER BY id_parentesco LIMIT 10');
    console.log('\n👨‍👩‍👧‍👦 PARENTESCOS:');
    parentescos.forEach(p => console.log(`ID: ${p.id_parentesco}, Nombre: ${p.nombre}`));
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkTables();