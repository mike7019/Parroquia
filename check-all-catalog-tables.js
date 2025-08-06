import { Client } from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parroquia_db',
  user: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD || 'admin'
});

async function checkAllCatalogTables() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente\n');
    
    const catalogTables = ['municipios', 'departamentos', 'veredas', 'parroquia', 'sexo', 'sector'];
    
    for (const tableName of catalogTables) {
      console.log(`📋 Verificando tabla: ${tableName}`);
      console.log('=' .repeat(50));
      
      // Verificar si la tabla existe
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        );
      `, [tableName]);
      
      if (!tableExists.rows[0].exists) {
        console.log(`❌ La tabla "${tableName}" no existe\n`);
        continue;
      }
      
      // Obtener información sobre created_at y updated_at
      const timestampColumns = await client.query(`
        SELECT 
          column_name, 
          data_type, 
          is_nullable, 
          column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND column_name IN ('created_at', 'updated_at')
        ORDER BY column_name;
      `, [tableName]);
      
      if (timestampColumns.rows.length === 0) {
        console.log(`✅ Sin columnas timestamp - timestamps: false es correcto`);
      } else {
        console.log(`⚠️  Tiene columnas timestamp:`);
        timestampColumns.rows.forEach(col => {
          console.log(`   ${col.column_name}: ${col.data_type}, nullable: ${col.is_nullable}, default: ${col.column_default || 'Sin default'}`);
        });
        
        const hasNonNullableTimestamps = timestampColumns.rows.some(col => col.is_nullable === 'NO');
        if (hasNonNullableTimestamps) {
          console.log(`❌ REQUIERE timestamps: true en el modelo`);
        } else {
          console.log(`✅ timestamps: false puede funcionar`);
        }
      }
      
      console.log(''); // Línea vacía
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔚 Conexión cerrada');
  }
}

// Ejecutar la verificación
checkAllCatalogTables().catch(console.error);
