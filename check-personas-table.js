import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'parroquia_db',
  user: 'parroquia_user',
  password: 'admin'
});

try {
  await client.connect();
  console.log('✅ Conectado a PostgreSQL');
  
  // Verificar estructura de la tabla personas
  const query = `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'personas' 
    ORDER BY ordinal_position
  `;
  
  const result = await client.query(query);
  console.log('\n📋 ESTRUCTURA DE LA TABLA PERSONAS:');
  console.log('='.repeat(80));
  
  result.rows.forEach(row => {
    console.log(`${row.column_name.padEnd(35)} | ${row.data_type.padEnd(20)} | ${row.is_nullable}`);
  });
  
  console.log('\n🔍 Buscando campos de timestamp...');
  const timestampFields = result.rows.filter(row => 
    row.column_name.includes('created') || 
    row.column_name.includes('updated') ||
    row.column_name.includes('At')
  );
  
  if (timestampFields.length > 0) {
    console.log('✅ Campos de timestamp encontrados:');
    timestampFields.forEach(field => {
      console.log(`   - ${field.column_name} (${field.data_type})`);
    });
  } else {
    console.log('❌ NO se encontraron campos de timestamp (createdAt/updatedAt)');
    console.log('⚠️  El modelo tiene timestamps: true pero la tabla no tiene estos campos');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await client.end();
}
