import sequelize from './config/sequelize.js';
import { Familias, Persona, Usuario, Municipios, Departamentos, Sector, Veredas } from './src/models/index.js';

const verifyDatabaseSync = async () => {
  try {
    console.log('🔍 VERIFICACIÓN COMPLETA DE SINCRONIZACIÓN BD vs MODELOS');
    console.log('========================================================');
    console.log('📅 Fecha:', new Date().toLocaleString());
    console.log('');

    // Conectar a la base de datos
    console.log('🔗 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    const [dbInfo] = await sequelize.query(`
      SELECT current_database() as db_name, 
             current_user as db_user,
             version() as db_version;
    `);
    
    console.log(`📊 Base de datos: ${dbInfo[0].db_name}`);
    console.log(`👤 Usuario: ${dbInfo[0].db_user}`);
    console.log(`🐘 PostgreSQL: ${dbInfo[0].db_version.split(' ')[0]} ${dbInfo[0].db_version.split(' ')[1]}`);
    console.log('');

    // Obtener todas las tablas de la BD
    const [allTables] = await sequelize.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns 
              WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('📋 TABLAS EN LA BASE DE DATOS:');
    console.log('==============================');
    allTables.forEach(table => {
      console.log(`  📁 ${table.table_name}: ${table.column_count} columnas`);
    });
    console.log('');

    // Modelos definidos en Sequelize
    const modelTables = {
      'familias': Familias,
      'personas': Persona,  
      'usuarios': Usuario,
      'municipios': Municipios,
      'departamentos': Departamentos,
      'sectores': Sector,
      'veredas': Veredas
    };

    console.log('🏗️  MODELOS DEFINIDOS EN SEQUELIZE:');
    console.log('===================================');
    Object.keys(modelTables).forEach(tableName => {
      const model = modelTables[tableName];
      if (model) {
        const attributes = Object.keys(model.rawAttributes || {});
        console.log(`  🔧 ${tableName}: ${attributes.length} atributos definidos`);
      } else {
        console.log(`  ⚠️  ${tableName}: Modelo no encontrado`);
      }
    });
    console.log('');

    // Verificación detallada por tabla
    console.log('🔍 VERIFICACIÓN DETALLADA POR TABLA:');
    console.log('====================================');

    for (const [tableName, model] of Object.entries(modelTables)) {
      if (!model) {
        console.log(`❌ ${tableName}: Modelo no disponible`);
        continue;
      }

      console.log(`\n📊 Analizando tabla: ${tableName.toUpperCase()}`);
      console.log(`${'='.repeat(40)}`);

      // Verificar si la tabla existe en BD
      const tableExists = allTables.find(t => t.table_name === tableName);
      if (!tableExists) {
        console.log(`❌ Tabla ${tableName} NO EXISTE en la base de datos`);
        continue;
      }

      // Obtener columnas de la BD
      const [dbColumns] = await sequelize.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns 
        WHERE table_name = '${tableName}' AND table_schema = 'public'
        ORDER BY ordinal_position;
      `);

      // Obtener atributos del modelo
      const modelAttributes = model.rawAttributes || {};
      const modelKeys = Object.keys(modelAttributes);

      console.log(`   📁 Columnas en BD: ${dbColumns.length}`);
      console.log(`   🔧 Atributos en modelo: ${modelKeys.length}`);

      // Verificar columnas de BD vs modelo
      console.log(`\n   🔍 Verificación columna por columna:`);
      
      const dbColumnNames = dbColumns.map(col => col.column_name);
      const missingInModel = [];
      const missingInDB = [];
      const typeConflicts = [];

      // Verificar columnas de BD que faltan en modelo
      dbColumns.forEach(dbCol => {
        if (!modelAttributes[dbCol.column_name]) {
          missingInModel.push(dbCol.column_name);
        } else {
          // Verificar tipos de datos
          const modelAttr = modelAttributes[dbCol.column_name];
          const modelType = modelAttr.type?.toString() || '';
          const dbType = dbCol.data_type;
          
          // Mapeo básico de tipos Sequelize a PostgreSQL
          const typeMapping = {
            'INTEGER': ['integer', 'int4'],
            'BIGINT': ['bigint', 'int8'],
            'STRING': ['character varying', 'varchar', 'text'],
            'TEXT': ['text'],
            'BOOLEAN': ['boolean', 'bool'],
            'DATE': ['timestamp without time zone', 'timestamp'],
            'DATEONLY': ['date'],
            'DECIMAL': ['numeric'],
            'FLOAT': ['real', 'float4'],
            'DOUBLE': ['double precision', 'float8']
          };

          let typeMatches = false;
          for (const [seqType, pgTypes] of Object.entries(typeMapping)) {
            if (modelType.includes(seqType) && pgTypes.includes(dbType)) {
              typeMatches = true;
              break;
            }
          }

          if (!typeMatches && !modelType.includes('VIRTUAL')) {
            typeConflicts.push({
              column: dbCol.column_name,
              dbType: dbType,
              modelType: modelType
            });
          }
        }
      });

      // Verificar atributos del modelo que faltan en BD
      modelKeys.forEach(modelKey => {
        const modelAttr = modelAttributes[modelKey];
        // Excluir campos virtuales y asociaciones
        if (!modelAttr.type?.toString().includes('VIRTUAL') && 
            !dbColumnNames.includes(modelKey)) {
          missingInDB.push(modelKey);
        }
      });

      // Mostrar resultados
      if (missingInModel.length === 0 && missingInDB.length === 0 && typeConflicts.length === 0) {
        console.log(`   ✅ Tabla ${tableName} COMPLETAMENTE SINCRONIZADA`);
      } else {
        if (missingInModel.length > 0) {
          console.log(`   ⚠️  Columnas en BD que NO están en modelo:`);
          missingInModel.forEach(col => console.log(`      - ${col}`));
        }
        
        if (missingInDB.length > 0) {
          console.log(`   ❌ Atributos del modelo que NO están en BD:`);
          missingInDB.forEach(attr => console.log(`      - ${attr}`));
        }
        
        if (typeConflicts.length > 0) {
          console.log(`   ⚠️  Conflictos de tipos de datos:`);
          typeConflicts.forEach(conflict => {
            console.log(`      - ${conflict.column}: BD(${conflict.dbType}) vs Modelo(${conflict.modelType})`);
          });
        }
      }

      // Verificar foreign keys
      const [foreignKeys] = await sequelize.query(`
        SELECT 
          tc.constraint_name, 
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = '${tableName}';
      `);

      if (foreignKeys.length > 0) {
        console.log(`   🔗 Foreign Keys en BD:`);
        foreignKeys.forEach(fk => {
          console.log(`      - ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        });
      }

      // Verificar índices
      const [indexes] = await sequelize.query(`
        SELECT 
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE tablename = '${tableName}' 
        AND schemaname = 'public'
        AND indexname NOT LIKE '%_pkey';
      `);

      if (indexes.length > 0) {
        console.log(`   📇 Índices en BD:`);
        indexes.forEach(idx => {
          console.log(`      - ${idx.indexname}`);
        });
      }
    }

    // Verificar campo específico comunionEnCasa
    console.log(`\n🎯 VERIFICACIÓN ESPECÍFICA: Campo comunionEnCasa`);
    console.log('===============================================');
    
    const [comunionField] = await sequelize.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
      AND LOWER(column_name) LIKE '%comunion%';
    `);

    if (comunionField.length > 0) {
      console.log(`✅ Campo de comunión encontrado en BD:`);
      comunionField.forEach(field => {
        console.log(`   - Nombre: ${field.column_name}`);
        console.log(`   - Tipo: ${field.data_type}`);
        console.log(`   - Nullable: ${field.is_nullable}`);
        console.log(`   - Default: ${field.column_default}`);
      });

      // Verificar en modelo Familias
      const familiasModel = Familias.rawAttributes;
      const comunionAttr = familiasModel.comunionEnCasa || familiasModel.comunionencasa;
      
      if (comunionAttr) {
        console.log(`✅ Campo también definido en modelo Familias:`);
        console.log(`   - Tipo: ${comunionAttr.type}`);
        console.log(`   - Default: ${comunionAttr.defaultValue}`);
      } else {
        console.log(`⚠️  Campo NO encontrado en modelo Familias`);
      }
    } else {
      console.log(`❌ Campo de comunión NO encontrado en BD`);
    }

    // Verificar datos de prueba
    console.log(`\n📊 VERIFICACIÓN DE DATOS:`);
    console.log('========================');
    
    const counts = {};
    for (const tableName of Object.keys(modelTables)) {
      try {
        const [result] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName};`);
        counts[tableName] = result[0].count;
      } catch (error) {
        counts[tableName] = 'Error: ' + error.message;
      }
    }

    console.log('Registros por tabla:');
    Object.entries(counts).forEach(([table, count]) => {
      console.log(`   📁 ${table}: ${count}`);
    });

    // Resumen final
    console.log(`\n🎉 RESUMEN DE SINCRONIZACIÓN:`);
    console.log('============================');
    
    const totalTables = Object.keys(modelTables).length;
    const existingTables = allTables.filter(t => modelTables[t.table_name]).length;
    
    console.log(`📊 Tablas totales en modelos: ${totalTables}`);
    console.log(`✅ Tablas existentes en BD: ${existingTables}`);
    console.log(`📈 Porcentaje de sincronización: ${Math.round((existingTables/totalTables)*100)}%`);

    if (existingTables === totalTables) {
      console.log(`🎉 ¡BASE DE DATOS COMPLETAMENTE SINCRONIZADA!`);
    } else {
      console.log(`⚠️  Algunas tablas requieren sincronización`);
    }

    await sequelize.close();
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

// Ejecutar verificación
verifyDatabaseSync();
