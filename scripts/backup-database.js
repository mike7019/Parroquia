import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'parroquia_db',
  user: 'parroquia_user',
  password: 'ParroquiaSecure2025'
};

async function createBackup() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupDir = path.join(__dirname, '..', 'backups');
    
    // Crear directorio de backups si no existe
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupFile = path.join(backupDir, `backup-parroquia-${timestamp}.sql`);
    
    console.log('📊 Obteniendo lista de tablas...');
    
    // Obtener todas las tablas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    let sqlContent = `-- Backup de parroquia_db\n-- Fecha: ${new Date().toISOString()}\n-- Generado por backup-database.js\n\n`;
    sqlContent += `SET client_encoding = 'UTF8';\n`;
    sqlContent += `SET standard_conforming_strings = on;\n\n`;
    
    for (const row of tablesResult.rows) {
      const tableName = row.table_name;
      console.log(`📋 Procesando tabla: ${tableName}`);
      
      // Obtener estructura de la tabla
      const structureResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [tableName]);
      
      // Crear comando CREATE TABLE
      sqlContent += `-- Tabla: ${tableName}\n`;
      sqlContent += `DROP TABLE IF EXISTS "${tableName}" CASCADE;\n`;
      sqlContent += `CREATE TABLE "${tableName}" (\n`;
      
      const columns = structureResult.rows.map(col => {
        let def = `  "${col.column_name}" ${col.data_type.toUpperCase()}`;
        if (col.is_nullable === 'NO') def += ' NOT NULL';
        if (col.column_default) def += ` DEFAULT ${col.column_default}`;
        return def;
      });
      
      sqlContent += columns.join(',\n');
      sqlContent += `\n);\n\n`;
      
      // Obtener datos de la tabla
      const dataResult = await client.query(`SELECT * FROM "${tableName}"`);
      
      if (dataResult.rows.length > 0) {
        sqlContent += `-- Datos para ${tableName}\n`;
        
        for (const dataRow of dataResult.rows) {
          const values = Object.values(dataRow).map(val => {
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (val instanceof Date) return `'${val.toISOString()}'`;
            return val;
          });
          
          const columns = Object.keys(dataRow).map(col => `"${col}"`).join(', ');
          sqlContent += `INSERT INTO "${tableName}" (${columns}) VALUES (${values.join(', ')});\n`;
        }
        sqlContent += `\n`;
      }
    }
    
    // Guardar archivo
    fs.writeFileSync(backupFile, sqlContent, 'utf8');
    
    console.log(`✅ Backup completado exitosamente`);
    console.log(`📁 Archivo: ${backupFile}`);
    console.log(`📊 Tablas procesadas: ${tablesResult.rows.length}`);
    
    // Mostrar estadísticas
    const stats = fs.statSync(backupFile);
    console.log(`📏 Tamaño del archivo: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
  } catch (error) {
    console.error('❌ Error durante el backup:', error.message);
  } finally {
    await client.end();
  }
}

// Ejecutar backup
createBackup().catch(console.error);