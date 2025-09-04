import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function listAllTables() {
  console.log('🔍 LISTANDO TODAS LAS TABLAS EN LA BASE DE DATOS...\n');
  
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'parroquia_db',
    process.env.DB_USER || 'parroquia_user', 
    process.env.DB_PASSWORD || 'parroquia123',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false // Silenciar logs SQL
    }
  );

  try {
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');

    // Obtener todas las tablas de la base de datos
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

    console.log(`📊 RESUMEN: Se encontraron ${results.length} tablas\n`);
    console.log('📋 LISTA DE TABLAS:');
    console.log('════════════════════════════════════════════════════\n');

    results.forEach((table, index) => {
      console.log(`${index + 1}. ${table.tablename}`);
    });

    console.log('\n════════════════════════════════════════════════════');

    // Obtener información adicional de cada tabla
    console.log('\n📊 INFORMACIÓN DETALLADA DE TABLAS:\n');

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

    // Buscar tablas relacionadas con encuestas y familias
    console.log('\n🔍 TABLAS CRÍTICAS PARA ENCUESTAS:');
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
      'departamentos'
    ];

    const foundTables = results.map(r => r.tablename);
    
    criticalTables.forEach(tableName => {
      const exists = foundTables.includes(tableName);
      console.log(`${exists ? '✅' : '❌'} ${tableName} ${exists ? '' : '(FALTANTE)'}`);
    });

    // Buscar tablas junction/relación
    console.log('\n🔗 TABLAS DE RELACIÓN (Junction Tables):');
    console.log('════════════════════════════════════════════════════');
    
    const junctionTables = foundTables.filter(name => 
      name.includes('familia_') || 
      name.includes('_') && !name.startsWith('sequelize') &&
      !name.includes('difuntos') && !name.includes('usuarios')
    );
    
    if (junctionTables.length > 0) {
      junctionTables.forEach(table => {
        console.log(`🔗 ${table}`);
      });
    } else {
      console.log('❌ No se encontraron tablas junction');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n🔒 Conexión cerrada');
  }
}

// Ejecutar el script
listAllTables().catch(console.error);
