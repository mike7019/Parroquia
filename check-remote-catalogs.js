import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: '206.62.139.11',
  port: 5433,
  user: 'parroquia_user',
  password: 'parroquia2024',
  database: 'parroquia_db'
});

async function checkCatalogs() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos remota');

    // Verificar sectores
    const sectores = await client.query('SELECT id_sector, nombre, id_municipio FROM sectores ORDER BY id_sector');
    console.log('\n=== SECTORES DISPONIBLES ===');
    sectores.rows.forEach(r => console.log(`ID: ${r.id_sector}, Nombre: ${r.nombre}, Municipio: ${r.id_municipio}`));

    // Verificar veredas
    const veredas = await client.query('SELECT id_vereda, nombre, id_municipio FROM veredas ORDER BY id_vereda');
    console.log('\n=== VEREDAS DISPONIBLES ===');
    veredas.rows.forEach(r => console.log(`ID: ${r.id_vereda}, Nombre: ${r.nombre}, Municipio: ${r.id_municipio}`));

    // Verificar corregimientos
    const corregimientos = await client.query('SELECT id_corregimiento, nombre, id_municipio FROM corregimientos ORDER BY id_corregimiento');
    console.log('\n=== CORREGIMIENTOS DISPONIBLES ===');
    corregimientos.rows.forEach(r => console.log(`ID: ${r.id_corregimiento}, Nombre: ${r.nombre}, Municipio: ${r.id_municipio}`));

    // Verificar centros poblados
    const centros = await client.query('SELECT id_centro_poblado, nombre, id_municipio FROM centros_poblados ORDER BY id_centro_poblado');
    console.log('\n=== CENTROS POBLADOS DISPONIBLES ===');
    centros.rows.forEach(r => console.log(`ID: ${r.id_centro_poblado}, Nombre: ${r.nombre}, Municipio: ${r.id_municipio}`));

    // Verificar municipio 905
    const municipio = await client.query('SELECT id_municipio, nombre_municipio FROM municipios WHERE id_municipio = 905');
    console.log('\n=== MUNICIPIO 905 ===');
    if (municipio.rows.length > 0) {
      console.log(municipio.rows[0]);
    } else {
      console.log('❌ Municipio 905 no existe');
    }

    // Verificar parroquia 4
    const parroquia = await client.query('SELECT id_parroquia, nombre FROM parroquia WHERE id_parroquia = 4');
    console.log('\n=== PARROQUIA 4 ===');
    if (parroquia.rows.length > 0) {
      console.log(parroquia.rows[0]);
    } else {
      console.log('❌ Parroquia 4 no existe');
    }

    // Verificar tipos de vivienda
    const tiposVivienda = await client.query('SELECT id_tipo_vivienda, nombre FROM tipos_vivienda ORDER BY id_tipo_vivienda');
    console.log('\n=== TIPOS DE VIVIENDA DISPONIBLES ===');
    tiposVivienda.rows.forEach(r => console.log(`ID: ${r.id_tipo_vivienda}, Nombre: ${r.nombre}`));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkCatalogs();
