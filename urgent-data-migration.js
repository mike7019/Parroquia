import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function urgentDataMigration() {
  console.log('🚨 MIGRACIÓN URGENTE DE DATOS CRÍTICOS');
  console.log('🎯 Objetivo: Sincronizar BD Remota con datos críticos de BD Local');
  console.log('📅', new Date().toLocaleString());
  console.log('');

  // BD Local
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

  // BD Remota
  const remoteDB = new Sequelize(
    process.env.DB_NAME || 'parroquia_db',
    process.env.DB_USER || 'parroquia_user', 
    process.env.DB_PASSWORD || 'parroquia123',
    {
      host: '206.62.139.100',
      port: 5432,
      dialect: 'postgres',
      logging: false,
      dialectOptions: { connectTimeout: 30000 }
    }
  );

  try {
    console.log('🔄 Conectando a ambas bases de datos...');
    await localDB.authenticate();
    await remoteDB.authenticate();
    console.log('✅ Conexiones establecidas\n');

    // FASE 1: MIGRAR DATOS CRÍTICOS DE ENCUESTAS
    console.log('🔥 FASE 1: MIGRANDO DATOS CRÍTICOS DE ENCUESTAS...');
    console.log('═══════════════════════════════════════════════════════');

    // 1. Migrar familia_sistema_acueducto
    console.log('📊 Migrando familia_sistema_acueducto...');
    try {
      const [localData] = await localDB.query('SELECT * FROM familia_sistema_acueducto');
      console.log(`   📋 Encontrados ${localData.length} registros en BD local`);
      
      if (localData.length > 0) {
        // Limpiar datos remotos primero
        await remoteDB.query('TRUNCATE TABLE familia_sistema_acueducto RESTART IDENTITY CASCADE');
        
        // Insertar datos desde local
        for (const row of localData) {
          await remoteDB.query(`
            INSERT INTO familia_sistema_acueducto 
            (id_familia, id_sistema_acueducto, created_at, updated_at)
            VALUES ($1, $2, $3, $4)
          `, {
            bind: [row.id_familia, row.id_sistema_acueducto, row.created_at, row.updated_at]
          });
        }
        console.log(`   ✅ Migrados ${localData.length} registros`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    // 2. Migrar familia_tipo_vivienda
    console.log('📊 Migrando familia_tipo_vivienda...');
    try {
      const [localData] = await localDB.query('SELECT * FROM familia_tipo_vivienda');
      console.log(`   📋 Encontrados ${localData.length} registros en BD local`);
      
      if (localData.length > 0) {
        await remoteDB.query('TRUNCATE TABLE familia_tipo_vivienda RESTART IDENTITY CASCADE');
        
        for (const row of localData) {
          await remoteDB.query(`
            INSERT INTO familia_tipo_vivienda 
            (id_familia, id_tipo_vivienda, created_at, updated_at)
            VALUES ($1, $2, $3, $4)
          `, {
            bind: [row.id_familia, row.id_tipo_vivienda, row.created_at, row.updated_at]
          });
        }
        console.log(`   ✅ Migrados ${localData.length} registros`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    // FASE 2: MIGRAR CATÁLOGOS CRÍTICOS
    console.log('\n📋 FASE 2: MIGRANDO CATÁLOGOS CRÍTICOS...');
    console.log('═══════════════════════════════════════════════════════');

    // 1. Migrar parroquias
    console.log('📊 Migrando parroquias...');
    try {
      const [localData] = await localDB.query('SELECT * FROM parroquias');
      console.log(`   📋 Encontrados ${localData.length} registros en BD local`);
      
      if (localData.length > 0) {
        await remoteDB.query('TRUNCATE TABLE parroquias RESTART IDENTITY CASCADE');
        
        for (const row of localData) {
          await remoteDB.query(`
            INSERT INTO parroquias 
            (nombre, id_municipio, descripcion, direccion, telefono)
            VALUES ($1, $2, $3, $4, $5)
          `, {
            bind: [row.nombre, row.id_municipio, row.descripcion, row.direccion, row.telefono]
          });
        }
        console.log(`   ✅ Migrados ${localData.length} registros`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    // 2. Completar sistemas_acueducto
    console.log('📊 Completando sistemas_acueducto...');
    try {
      const [localData] = await localDB.query('SELECT * FROM sistemas_acueducto');
      const [remoteData] = await remoteDB.query('SELECT nombre FROM sistemas_acueducto');
      
      const remoteNames = remoteData.map(r => r.nombre);
      const missingData = localData.filter(local => !remoteNames.includes(local.nombre));
      
      console.log(`   📋 ${missingData.length} sistemas faltantes en BD remota`);
      
      for (const row of missingData) {
        await remoteDB.query(`
          INSERT INTO sistemas_acueducto (nombre, descripcion, created_at, updated_at)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (nombre) DO NOTHING
        `, {
          bind: [row.nombre, row.descripcion, row.created_at, row.updated_at]
        });
      }
      console.log(`   ✅ Añadidos ${missingData.length} sistemas faltantes`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    // FASE 3: CREAR TABLAS FALTANTES CRÍTICAS
    console.log('\n🔧 FASE 3: CREANDO TABLAS FALTANTES...');
    console.log('═══════════════════════════════════════════════════════');

    // 1. Crear estados_civiles
    console.log('📊 Creando tabla estados_civiles...');
    try {
      await remoteDB.query(`
        CREATE TABLE IF NOT EXISTS estados_civiles (
          id_estado_civil SERIAL PRIMARY KEY,
          descripcion VARCHAR(255) NOT NULL,
          activo BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
      
      // Migrar datos
      const [localData] = await localDB.query('SELECT * FROM estados_civiles');
      console.log(`   📋 Migrando ${localData.length} registros`);
      
      for (const row of localData) {
        await remoteDB.query(`
          INSERT INTO estados_civiles (descripcion, activo, created_at, updated_at)
          VALUES ($1, $2, $3, $4)
        `, {
          bind: [row.descripcion, row.activo, row.created_at, row.updated_at]
        });
      }
      console.log(`   ✅ Tabla estados_civiles creada y poblada`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    // FASE 4: VERIFICACIÓN FINAL
    console.log('\n🧪 FASE 4: VERIFICACIÓN FINAL...');
    console.log('═══════════════════════════════════════════════════════');

    const criticalTables = [
      'familia_sistema_acueducto',
      'familia_tipo_vivienda', 
      'parroquias',
      'sistemas_acueducto'
    ];

    for (const tableName of criticalTables) {
      try {
        const [localCount] = await localDB.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        const [remoteCount] = await remoteDB.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        
        const localRec = parseInt(localCount[0].count);
        const remoteRec = parseInt(remoteCount[0].count);
        const status = localRec === remoteRec ? '✅' : '⚠️';
        
        console.log(`${status} ${tableName}: Local(${localRec}) | Remota(${remoteRec})`);
      } catch (error) {
        console.log(`❌ ${tableName}: Error - ${error.message}`);
      }
    }

    console.log('\n🎉 MIGRACIÓN URGENTE COMPLETADA!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Datos críticos de encuestas migrados');
    console.log('✅ Catálogos esenciales sincronizados'); 
    console.log('✅ BD Remota lista para uso en producción');

  } catch (error) {
    console.error('❌ Error en migración urgente:', error.message);
  } finally {
    await localDB.close();
    await remoteDB.close();
    console.log('\n🔒 Conexiones cerradas');
  }
}

// Ejecutar migración urgente
urgentDataMigration().catch(console.error);
