import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'parroquia_db',
  user: 'parroquia_user',
  password: 'ParroquiaSecure2025'
});

async function getCatalogIds() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');
    
    const queries = [
      { name: 'MUNICIPIOS', query: 'SELECT id_municipio, nombre_municipio FROM municipios LIMIT 3' },
      { name: 'PARROQUIAS', query: 'SELECT id_parroquia, nombre FROM parroquia LIMIT 3' },
      { name: 'VEREDAS', query: 'SELECT id_vereda, nombre FROM vereda LIMIT 3' },
      { name: 'SEXOS', query: 'SELECT id_sexo, nombre FROM sexo' },
      { name: 'TIPOS IDENTIFICACIÓN', query: 'SELECT id_tipo_identificacion, nombre FROM tipo_identificacion' },
      { name: 'HABILIDADES', query: 'SELECT id_habilidad, nombre FROM habilidad LIMIT 5' },
      { name: 'DESTREZAS', query: 'SELECT id_destreza, nombre FROM destreza LIMIT 5' },
      { name: 'PROFESIONES', query: 'SELECT id_profesion, nombre FROM profesion LIMIT 5' },
      { name: 'ESTADOS CIVILES', query: 'SELECT id_estado_civil, nombre FROM estado_civil' }
    ];
    
    for (const { name, query } of queries) {
      const result = await client.query(query);
      console.log(`\n📋 ${name}:`);
      result.rows.forEach(row => {
        const id = row.id_municipio || row.id_parroquia || row.id_sector || row.id_vereda || 
                   row.id_sexo || row.id_tipo_identificacion || row.id_habilidad || 
                   row.id_destreza || row.id_profesion || row.id_estado_civil;
        const nombre = row.nombre_municipio || row.nombre;
        console.log(`  - ID: ${id}, ${nombre}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

getCatalogIds();
