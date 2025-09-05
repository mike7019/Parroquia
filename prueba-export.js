/**
 * SCRIPT DE PRUEBA RÁPIDA - EXPORTAR BD
 * Versión simplificada para verificar funcionalidad
 */

import { Sequelize } from 'sequelize';
import fs from 'fs/promises';
import path from 'path';

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parroquia_db',
  username: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD,
  dialect: 'postgres',
  logging: false
};

async function pruebaRapidaExport() {
  try {
    console.log('🧪 PRUEBA RÁPIDA DE EXPORTACIÓN');
    console.log('===============================');
    
    // Conectar
    console.log('📡 Conectando a base de datos...');
    const sequelize = new Sequelize(
      DB_CONFIG.database,
      DB_CONFIG.username,
      DB_CONFIG.password,
      DB_CONFIG
    );
    
    await sequelize.authenticate();
    console.log(`✅ Conectado a: ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`);
    
    // Listar tablas
    console.log('\n📋 Obteniendo lista de tablas...');
    const [tablas] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log(`📊 ${tablas.length} tablas encontradas:`);
    
    let contenidoSQL = `-- EXPORT RÁPIDO DE PARROQUIA DB\n`;
    contenidoSQL += `-- Generado: ${new Date().toISOString()}\n`;
    contenidoSQL += `-- Tablas: ${tablas.length}\n\n`;
    
    // Exportar estructura de algunas tablas importantes
    const tablasImportantes = ['departamentos_municipios', 'municipios_municipios', 'familias_familias'];
    
    for (const tabla of tablasImportantes) {
      const tablaObj = tablas.find(t => t.table_name === tabla.table_name);
      if (tablaObj) {
        console.log(`📄 Procesando: ${tabla.table_name}`);
        
        // Obtener estructura
        const [columnas] = await sequelize.query(`
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' 
          AND table_name = '${tabla.table_name}'
          ORDER BY ordinal_position;
        `);
        
        contenidoSQL += `-- Tabla: ${tabla.table_name}\n`;
        contenidoSQL += `-- Columnas: ${columnas.length}\n`;
        
        // Contar registros
        try {
          const [count] = await sequelize.query(`SELECT COUNT(*) as total FROM "${tabla.table_name}";`);
          contenidoSQL += `-- Registros: ${count[0].total}\n\n`;
          console.log(`   📊 ${count[0].total} registros`);
        } catch (error) {
          contenidoSQL += `-- Registros: Error\n\n`;
          console.log(`   ❌ Error contando registros`);
        }
      }
    }
    
    // Información general
    contenidoSQL += `-- RESUMEN GENERAL\n`;
    contenidoSQL += `-- Total de tablas: ${tablas.length}\n`;
    
    tablas.forEach(tabla => {
      contenidoSQL += `-- ${tabla.table_name}\n`;
    });
    
    // Guardar archivo
    const nombreArchivo = `prueba_export_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
    await fs.writeFile(nombreArchivo, contenidoSQL);
    
    console.log(`\n✅ Archivo generado: ${nombreArchivo}`);
    console.log(`📊 Tamaño: ${(contenidoSQL.length / 1024).toFixed(2)} KB`);
    
    await sequelize.close();
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

pruebaRapidaExport();
