#!/usr/bin/env node
/**
 * Generador de Diagrama ER Optimizado
 * Genera documentación completa del esquema optimizado
 */

const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const config = require('./config/config.cjs');

const sequelize = new Sequelize(config.development);

async function generateOptimizedERDiagram() {
  try {
    console.log('📊 GENERANDO DIAGRAMA ER OPTIMIZADO...\n');
    
    await sequelize.authenticate();

    // ================================================================
    // 1. OBTENER TODAS LAS TABLAS Y SUS COLUMNAS
    // ================================================================
    
    const [tables] = await sequelize.query(`
      SELECT t.table_name,
             c.column_name,
             c.data_type,
             c.character_maximum_length,
             c.is_nullable,
             c.column_default,
             tc.constraint_type,
             ccu.table_name AS foreign_table_name,
             ccu.column_name AS foreign_column_name
      FROM information_schema.tables t
      LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
      LEFT JOIN information_schema.constraint_column_usage ccu ON c.column_name = ccu.column_name AND c.table_name = ccu.table_name
      LEFT JOIN information_schema.table_constraints tc ON ccu.constraint_name = tc.constraint_name
      WHERE t.table_schema = 'public' 
      AND t.table_type = 'BASE TABLE'
      AND t.table_name NOT LIKE '%SequelizeMeta%'
      ORDER BY t.table_name, c.ordinal_position;
    `);

    // ================================================================
    // 2. ORGANIZAR DATOS POR TABLA
    // ================================================================
    
    const tablesMap = {};
    const relationships = [];

    tables.forEach(row => {
      const tableName = row.table_name;
      
      if (!tablesMap[tableName]) {
        tablesMap[tableName] = {
          name: tableName,
          columns: [],
          primaryKeys: [],
          foreignKeys: []
        };
      }

      if (row.column_name) {
        const column = {
          name: row.column_name,
          type: row.data_type,
          length: row.character_maximum_length,
          nullable: row.is_nullable === 'YES',
          default: row.column_default,
          isPK: row.constraint_type === 'PRIMARY KEY',
          isFK: row.constraint_type === 'FOREIGN KEY',
          referencedTable: row.foreign_table_name,
          referencedColumn: row.foreign_column_name
        };

        tablesMap[tableName].columns.push(column);

        if (column.isPK) {
          tablesMap[tableName].primaryKeys.push(column.name);
        }

        if (column.isFK && row.foreign_table_name) {
          tablesMap[tableName].foreignKeys.push({
            column: column.name,
            referencedTable: row.foreign_table_name,
            referencedColumn: row.foreign_column_name
          });

          relationships.push({
            from: tableName,
            fromColumn: column.name,
            to: row.foreign_table_name,
            toColumn: row.foreign_column_name,
            type: 'one-to-many'
          });
        }
      }
    });

    // ================================================================
    // 3. IDENTIFICAR TABLAS INTERMEDIAS (MUCHOS A MUCHOS)
    // ================================================================
    
    const intermediaryTables = [];
    Object.keys(tablesMap).forEach(tableName => {
      const table = tablesMap[tableName];
      const fkCount = table.foreignKeys.length;
      const columnCount = table.columns.length;
      
      // Si tiene exactamente 2 FK y pocas columnas adicionales, es tabla intermedia
      if (fkCount === 2 && columnCount <= 5) {
        intermediaryTables.push({
          name: tableName,
          table1: table.foreignKeys[0].referencedTable,
          table2: table.foreignKeys[1].referencedTable
        });
      }
    });

    // ================================================================
    // 4. CATEGORIZAR TABLAS POR DOMINIO
    // ================================================================
    
    const tableCategories = {
      'Gestión Territorial': ['departamentos', 'municipios', 'sector', 'veredas'],
      'Entidades Principales': ['familias', 'personas'],
      'Catálogos': ['tipo_identificacion', 'estado_civil', 'sexo', 'comunidades_culturales', 'parroquias'],
      'Características Personas': ['profesiones', 'destrezas', 'enfermedades', 'niveles_educativos', 'talla_vestimenta'],
      'Características Familias': ['tipo_viviendas', 'sistemas_acueducto', 'tipos_disposicion_basura', 'tipos_aguas_residuales'],
      'Eventos y Celebraciones': ['celebraciones_familia', 'celebraciones_personales', 'celebraciones_padre_madre', 'difuntos_familia'],
      'Liderazgo': ['areas_liderazgo', 'liderazgos'],
      'Relaciones': ['parentesco', 'necesidades_enfermo'],
      'Encuestas': ['encuestas'],
      'Usuarios y Seguridad': ['usuarios', 'roles', 'usuarios_roles'],
      'Tablas Intermedias': intermediaryTables.map(t => t.name)
    };

    // ================================================================
    // 5. GENERAR DOCUMENTACIÓN MARKDOWN
    // ================================================================
    
    let markdown = `# 📊 DIAGRAMA ER OPTIMIZADO - SISTEMA PARROQUIAL\n\n`;
    markdown += `*Generado automáticamente el ${new Date().toISOString().split('T')[0]}*\n\n`;
    
    markdown += `## 📋 RESUMEN DEL ESQUEMA\n\n`;
    markdown += `- **Total de tablas**: ${Object.keys(tablesMap).length}\n`;
    markdown += `- **Relaciones FK**: ${relationships.length}\n`;
    markdown += `- **Tablas intermedias**: ${intermediaryTables.length}\n`;
    markdown += `- **Categorías de dominio**: ${Object.keys(tableCategories).length}\n\n`;

    // Generar documentación por categoría
    Object.keys(tableCategories).forEach(category => {
      markdown += `## 🏷️ ${category.toUpperCase()}\n\n`;
      
      tableCategories[category].forEach(tableName => {
        if (tablesMap[tableName]) {
          const table = tablesMap[tableName];
          markdown += `### 📋 \`${tableName}\`\n\n`;
          markdown += `| Campo | Tipo | Nulo | Clave | Referencia |\n`;
          markdown += `|-------|------|------|-------|------------|\n`;
          
          table.columns.forEach(col => {
            const keyType = col.isPK ? '🔑 PK' : col.isFK ? '🔗 FK' : '';
            const reference = col.isFK ? `→ \`${col.referencedTable}.\${col.referencedColumn}\`` : '';
            const typeDisplay = col.length ? `${col.type}(${col.length})` : col.type;
            
            markdown += `| \`${col.name}\` | ${typeDisplay} | ${col.nullable ? '✅' : '❌'} | ${keyType} | ${reference} |\n`;
          });
          
          markdown += `\n`;
        }
      });
    });

    // ================================================================
    // 6. GENERAR DIAGRAMA MERMAID
    // ================================================================
    
    markdown += `## 🎨 DIAGRAMA ENTIDAD-RELACIÓN (Mermaid)\n\n`;
    markdown += `\`\`\`mermaid\n`;
    markdown += `erDiagram\n`;
    
    // Definir entidades principales
    const mainEntities = ['departamentos', 'municipios', 'sector', 'veredas', 'familias', 'personas'];
    
    mainEntities.forEach(tableName => {
      if (tablesMap[tableName]) {
        const table = tablesMap[tableName];
        markdown += `    ${tableName.toUpperCase()} {\n`;
        
        table.columns.slice(0, 5).forEach(col => { // Limitar a 5 campos principales
          const keyIndicator = col.isPK ? ' PK' : col.isFK ? ' FK' : '';
          markdown += `        ${col.type} ${col.name}${keyIndicator}\n`;
        });
        
        if (table.columns.length > 5) {
          markdown += `        string "... ${table.columns.length - 5} campos más"\n`;
        }
        
        markdown += `    }\n`;
      }
    });

    // Definir relaciones principales
    relationships.forEach(rel => {
      if (mainEntities.includes(rel.from) && mainEntities.includes(rel.to)) {
        markdown += `    ${rel.from.toUpperCase()} ||--o{ ${rel.to.toUpperCase()} : "tiene"\n`;
      }
    });

    markdown += `\`\`\`\n\n`;

    // ================================================================
    // 7. GENERAR ÍNDICES Y OPTIMIZACIONES
    // ================================================================
    
    markdown += `## 🚀 ÍNDICES Y OPTIMIZACIONES\n\n`;
    
    const [indexes] = await sequelize.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname;
    `);

    if (indexes.length > 0) {
      markdown += `### 📚 Índices Personalizados\n\n`;
      indexes.forEach(idx => {
        markdown += `- **\`${idx.indexname}\`** en \`${idx.tablename}\`\n`;
        markdown += `  \`\`\`sql\n  ${idx.indexdef}\n  \`\`\`\n\n`;
      });
    }

    // ================================================================
    // 8. GUARDAR DOCUMENTACIÓN
    // ================================================================
    
    const outputPath = path.join(__dirname, 'docs', 'OPTIMIZED_ER_DIAGRAM.md');
    
    // Crear directorio si no existe
    if (!fs.existsSync(path.join(__dirname, 'docs'))) {
      fs.mkdirSync(path.join(__dirname, 'docs'));
    }
    
    fs.writeFileSync(outputPath, markdown);
    
    console.log(`✅ Diagrama ER optimizado generado: ${outputPath}`);
    console.log(`📊 Tablas documentadas: ${Object.keys(tablesMap).length}`);
    console.log(`🔗 Relaciones documentadas: ${relationships.length}`);
    console.log(`📚 Índices documentados: ${indexes.length}`);

  } catch (error) {
    console.error('❌ Error generando diagrama ER:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar generación
generateOptimizedERDiagram();
