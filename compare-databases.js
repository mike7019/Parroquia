import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function compareLocalAndRemoteDB() {
  console.log('🔍 COMPARACIÓN COMPLETA: BD LOCAL vs BD REMOTA');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📅', new Date().toLocaleString());
  console.log('');

  // Configuración BD Local
  const localDB = new Sequelize(
    process.env.DB_NAME || 'parroquia_db',
    process.env.DB_USER || 'parroquia_user', 
    process.env.DB_PASSWORD || 'parroquia123',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false
    }
  );

  // Configuración BD Remota
  const remoteDB = new Sequelize(
    process.env.DB_NAME || 'parroquia_db',
    process.env.DB_USER || 'parroquia_user', 
    process.env.DB_PASSWORD || 'parroquia123',
    {
      host: '206.62.139.100',
      port: 5432,
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        connectTimeout: 30000,
      }
    }
  );

  try {
    // Conectar a ambas bases de datos
    console.log('🔄 Conectando a BD Local...');
    await localDB.authenticate();
    console.log('✅ BD Local conectada');

    console.log('🔄 Conectando a BD Remota...');
    await remoteDB.authenticate();
    console.log('✅ BD Remota conectada\n');

    // Función para obtener información de tablas
    async function getTableInfo(db, dbName) {
      const [tables] = await db.query(`
        SELECT 
          schemaname,
          tablename,
          tableowner,
          hasindexes,
          hasrules,
          hastriggers
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `);

      const tableDetails = {};
      for (const table of tables) {
        try {
          const [countResult] = await db.query(`SELECT COUNT(*) as count FROM "${table.tablename}"`);
          const [columnsResult] = await db.query(`
            SELECT COUNT(*) as column_count 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = '${table.tablename}'
          `);
          
          tableDetails[table.tablename] = {
            name: table.tablename,
            records: parseInt(countResult[0].count),
            columns: parseInt(columnsResult[0].column_count),
            hasIndexes: table.hasindexes,
            hasTriggers: table.hastriggers,
            exists: true
          };
        } catch (error) {
          tableDetails[table.tablename] = {
            name: table.tablename,
            error: error.message,
            exists: true
          };
        }
      }

      return { tables: tables.map(t => t.tablename), details: tableDetails };
    }

    // Obtener información de ambas bases de datos
    console.log('📊 Analizando BD Local...');
    const localInfo = await getTableInfo(localDB, 'Local');
    
    console.log('📊 Analizando BD Remota...');
    const remoteInfo = await getTableInfo(remoteDB, 'Remota');

    // Análisis comparativo
    console.log('\n📋 RESUMEN COMPARATIVO:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`🏠 BD Local:  ${localInfo.tables.length} tablas`);
    console.log(`🌐 BD Remota: ${remoteInfo.tables.length} tablas`);
    console.log(`📊 Diferencia: ${localInfo.tables.length - remoteInfo.tables.length} tablas\n`);

    // Encontrar diferencias
    const allTables = new Set([...localInfo.tables, ...remoteInfo.tables]);
    const onlyLocal = localInfo.tables.filter(t => !remoteInfo.tables.includes(t));
    const onlyRemote = remoteInfo.tables.filter(t => !localInfo.tables.includes(t));
    const common = localInfo.tables.filter(t => remoteInfo.tables.includes(t));

    console.log('🔍 ANÁLISIS DE DIFERENCIAS:');
    console.log('═══════════════════════════════════════════════════════');
    
    if (onlyLocal.length > 0) {
      console.log(`\n❌ TABLAS SOLO EN BD LOCAL (${onlyLocal.length}):`);
      onlyLocal.forEach(table => {
        const details = localInfo.details[table];
        console.log(`   📝 ${table} (${details.records || 0} registros, ${details.columns || 0} columnas)`);
      });
    }

    if (onlyRemote.length > 0) {
      console.log(`\n❌ TABLAS SOLO EN BD REMOTA (${onlyRemote.length}):`);
      onlyRemote.forEach(table => {
        const details = remoteInfo.details[table];
        console.log(`   📝 ${table} (${details.records || 0} registros, ${details.columns || 0} columnas)`);
      });
    }

    console.log(`\n✅ TABLAS COMUNES (${common.length}):`);
    console.log('═══════════════════════════════════════════════════════');

    // Comparar tablas comunes en detalle
    let significantDifferences = [];
    
    for (const tableName of common.sort()) {
      const localDetail = localInfo.details[tableName];
      const remoteDetail = remoteInfo.details[tableName];
      
      const localRecords = localDetail.records || 0;
      const remoteRecords = remoteDetail.records || 0;
      const recordDiff = localRecords - remoteRecords;
      
      const statusIcon = recordDiff === 0 ? '✅' : (Math.abs(recordDiff) > 0 ? '⚠️' : '❌');
      
      console.log(`${statusIcon} ${tableName}:`);
      console.log(`   🏠 Local:  ${localRecords} registros, ${localDetail.columns || 0} columnas`);
      console.log(`   🌐 Remota: ${remoteRecords} registros, ${remoteDetail.columns || 0} columnas`);
      
      if (recordDiff !== 0) {
        console.log(`   📊 Diferencia: ${recordDiff > 0 ? '+' : ''}${recordDiff} registros`);
        if (Math.abs(recordDiff) > 5) {
          significantDifferences.push({
            table: tableName,
            localRecords,
            remoteRecords,
            difference: recordDiff
          });
        }
      }
      console.log('');
    }

    // Análisis de tablas críticas
    console.log('\n🔍 ANÁLISIS DE TABLAS CRÍTICAS:');
    console.log('═══════════════════════════════════════════════════════');
    
    const criticalTables = [
      'usuarios', 'roles', 'familias', 'personas', 'encuestas',
      'familia_sistema_acueducto', 'familia_tipo_vivienda', 
      'familia_disposicion_basuras', 'familia_aguas_residuales',
      'sistemas_acueducto', 'parroquias', 'sectores', 'veredas',
      'municipios', 'departamentos', 'tipos_vivienda', 'enfermedades'
    ];

    criticalTables.forEach(tableName => {
      const inLocal = localInfo.tables.includes(tableName);
      const inRemote = remoteInfo.tables.includes(tableName);
      
      if (inLocal && inRemote) {
        const localRec = localInfo.details[tableName]?.records || 0;
        const remoteRec = remoteInfo.details[tableName]?.records || 0;
        console.log(`✅ ${tableName}: Local(${localRec}) | Remota(${remoteRec})`);
      } else if (inLocal && !inRemote) {
        console.log(`❌ ${tableName}: Solo en Local (${localInfo.details[tableName]?.records || 0} registros)`);
      } else if (!inLocal && inRemote) {
        console.log(`❌ ${tableName}: Solo en Remota (${remoteInfo.details[tableName]?.records || 0} registros)`);
      } else {
        console.log(`❌ ${tableName}: NO EXISTE en ninguna BD`);
      }
    });

    // Recomendaciones
    console.log('\n💡 RECOMENDACIONES:');
    console.log('═══════════════════════════════════════════════════════');
    
    if (onlyLocal.length > 0) {
      console.log(`🔄 Sincronizar ${onlyLocal.length} tablas faltantes en BD Remota:`);
      onlyLocal.forEach(table => {
        console.log(`   - Crear tabla: ${table}`);
      });
    }
    
    if (significantDifferences.length > 0) {
      console.log(`📊 Sincronizar datos en ${significantDifferences.length} tablas con diferencias significativas:`);
      significantDifferences.forEach(diff => {
        console.log(`   - ${diff.table}: ${diff.difference > 0 ? 'Migrar' : 'Verificar'} ${Math.abs(diff.difference)} registros`);
      });
    }

    if (onlyLocal.length === 0 && significantDifferences.length === 0) {
      console.log('🎉 ¡Las bases de datos están prácticamente sincronizadas!');
      console.log('✅ Solo diferencias menores en número de registros');
    }

    console.log('\n📋 RESUMEN FINAL:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`🔧 Tablas que necesitan creación en remota: ${onlyLocal.length}`);
    console.log(`📊 Tablas con diferencias significativas: ${significantDifferences.length}`);
    console.log(`✅ Tablas críticas funcionales: ${criticalTables.filter(t => 
      localInfo.tables.includes(t) && remoteInfo.tables.includes(t)
    ).length}/${criticalTables.length}`);

  } catch (error) {
    console.error('❌ Error en comparación:', error.message);
  } finally {
    await localDB.close();
    await remoteDB.close();
    console.log('\n🔒 Conexiones cerradas');
  }
}

// Ejecutar comparación
compareLocalAndRemoteDB().catch(console.error);
