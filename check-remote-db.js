import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function listTablesRemoteDB() {
  console.log('🔍 CONECTANDO A BASE DE DATOS REMOTA...');
  console.log('🌐 Servidor: 206.62.139.100:5432\n');
  
  // Configuración para BD remota
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'parroquia_db',
    process.env.DB_USER || 'parroquia_user', 
    process.env.DB_PASSWORD || 'parroquia123',
    {
      host: '206.62.139.100',  // BD remota
      port: 5432,
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        connectTimeout: 30000, // 30 segundos timeout
        statement_timeout: 60000, // 60 segundos statement timeout
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );

  try {
    console.log('🔄 Intentando conectar...');
    
    // Verificar conexión con timeout
    await sequelize.authenticate();
    console.log('✅ Conectado exitosamente a la BD remota\n');

    // Obtener todas las tablas de la base de datos
    console.log('📋 Obteniendo lista de tablas...');
    const [results] = await sequelize.query(`
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

    console.log(`📊 RESUMEN BD REMOTA: Se encontraron ${results.length} tablas\n`);
    console.log('📋 LISTA DE TABLAS EN BD REMOTA:');
    console.log('════════════════════════════════════════════════════\n');

    results.forEach((table, index) => {
      console.log(`${index + 1}. ${table.tablename}`);
    });

    console.log('\n════════════════════════════════════════════════════');

    // Obtener información adicional de cada tabla
    console.log('\n📊 INFORMACIÓN DETALLADA DE TABLAS (BD REMOTA):\n');

    for (const table of results) {
      try {
        const [countResult] = await sequelize.query(`
          SELECT COUNT(*) as count FROM "${table.tablename}";
        `);
        
        const [columnsResult] = await sequelize.query(`
          SELECT COUNT(*) as column_count 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = '${table.tablename}';
        `);

        const count = countResult[0].count;
        const columnCount = columnsResult[0].column_count;
        
        console.log(`📝 ${table.tablename}:`);
        console.log(`   📊 Registros: ${count}`);
        console.log(`   🏗️  Columnas: ${columnCount}`);
        console.log(`   🔑 Índices: ${table.hasindexes ? 'Sí' : 'No'}`);
        console.log(`   ⚡ Triggers: ${table.hastriggers ? 'Sí' : 'No'}`);
        console.log('');
        
      } catch (error) {
        console.log(`❌ Error obteniendo info de ${table.tablename}: ${error.message}`);
      }
    }

    // Verificar tablas críticas específicamente
    console.log('\n🔍 VERIFICACIÓN DE TABLAS CRÍTICAS EN BD REMOTA:');
    console.log('════════════════════════════════════════════════════');
    
    const criticalTables = [
      'familias',
      'personas', 
      'encuestas',
      'familia_sistema_acueducto',
      'familia_tipo_vivienda',
      'familia_disposicion_basuras', 
      'familia_aguas_residuales',
      'sistemas_acueducto',
      'parroquias',
      'sectores',
      'veredas',
      'municipios',
      'departamentos',
      'usuarios',
      'roles'
    ];

    const foundTables = results.map(r => r.tablename);
    
    console.log('🔍 Estado de tablas críticas:');
    let missingTables = [];
    
    criticalTables.forEach(tableName => {
      const exists = foundTables.includes(tableName);
      console.log(`${exists ? '✅' : '❌'} ${tableName} ${exists ? '' : '(FALTANTE)'}`);
      if (!exists) {
        missingTables.push(tableName);
      }
    });

    // Verificar tablas de junction específicamente
    console.log('\n🔗 TABLAS JUNCTION PARA ENCUESTAS:');
    console.log('════════════════════════════════════════════════════');
    
    const junctionTables = [
      'familia_sistema_acueducto',
      'familia_tipo_vivienda', 
      'familia_disposicion_basuras',
      'familia_aguas_residuales'
    ];
    
    junctionTables.forEach(tableName => {
      const exists = foundTables.includes(tableName);
      const table = results.find(r => r.tablename === tableName);
      console.log(`${exists ? '✅' : '❌'} ${tableName} ${exists ? `(${table ? 'Con triggers' : 'Sin triggers'})` : '(FALTANTE)'}`);
    });

    // Resumen final
    console.log('\n📋 RESUMEN DE COMPARACIÓN:');
    console.log('════════════════════════════════════════════════════');
    console.log(`🌐 BD Remota (206.62.139.100): ${results.length} tablas`);
    console.log(`🏠 BD Local: 40 tablas (según último análisis)`);
    
    if (missingTables.length > 0) {
      console.log(`❌ Tablas faltantes en BD remota: ${missingTables.length}`);
      console.log('🚨 Tablas que necesitan crearse:');
      missingTables.forEach(table => console.log(`   - ${table}`));
    } else {
      console.log('✅ Todas las tablas críticas están presentes');
    }

    // Verificar conectividad para encuestas
    console.log('\n🧪 PRUEBA DE FUNCIONALIDAD PARA ENCUESTAS:');
    console.log('════════════════════════════════════════════════════');
    
    try {
      const [encuestasTest] = await sequelize.query(`
        SELECT COUNT(*) as count FROM encuestas;
      `);
      console.log(`✅ Tabla encuestas accesible: ${encuestasTest[0].count} registros`);
      
      const [familiasTest] = await sequelize.query(`
        SELECT COUNT(*) as count FROM familias;
      `);
      console.log(`✅ Tabla familias accesible: ${familiasTest[0].count} registros`);
      
      // Probar junction tables
      const [junctionTest] = await sequelize.query(`
        SELECT COUNT(*) as count FROM familia_sistema_acueducto;
      `);
      console.log(`✅ Junction table familia_sistema_acueducto: ${junctionTest[0].count} registros`);
      
    } catch (error) {
      console.log(`❌ Error en prueba de funcionalidad: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error conectando a BD remota:', error.message);
    console.log('\n🔧 Posibles soluciones:');
    console.log('1. Verificar que el servidor esté accesible');
    console.log('2. Comprobar credenciales de conexión');
    console.log('3. Verificar firewall/reglas de red');
    console.log('4. Confirmar que PostgreSQL esté ejecutándose en el puerto 5432');
  } finally {
    await sequelize.close();
    console.log('\n🔒 Conexión cerrada');
  }
}

// Ejecutar el script
listTablesRemoteDB().catch(console.error);
