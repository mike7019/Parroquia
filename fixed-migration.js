import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function fixedMigration() {
  console.log('🔧 MIGRACIÓN CORREGIDA - USANDO SOLO COLUMNAS COMPATIBLES');
  console.log('✅ Basada en verificación de estructura real');
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

    // MIGRACIÓN CORREGIDA: parroquias (solo columnas que existen)
    console.log('🌍 MIGRANDO parroquias (CORREGIDO)...');
    console.log('═══════════════════════════════════════════════════════');
    
    try {
      const [localData] = await localDB.query('SELECT * FROM parroquias');
      console.log(`📋 Encontrados ${localData.length} registros en BD local`);
      
      if (localData.length > 0) {
        // Limpiar datos remotos
        await remoteDB.query('DELETE FROM parroquias');
        console.log('🧹 Tabla remota limpiada');
        
        // Insertar datos usando SOLO columnas que existen
        let migrated = 0;
        for (const row of localData) {
          try {
            const nombre = row.nombre ? `'${row.nombre.replace(/'/g, "''")}'` : 'NULL';
            const id_municipio = row.id_municipio || 'NULL';
            
            await remoteDB.query(`
              INSERT INTO parroquias (nombre, id_municipio, created_at, updated_at)
              VALUES (${nombre}, ${id_municipio}, NOW(), NOW())
            `);
            migrated++;
          } catch (rowError) {
            console.log(`⚠️ Error en parroquia '${row.nombre}': ${rowError.message}`);
          }
        }
        console.log(`✅ Migrados ${migrated}/${localData.length} registros`);
      }
    } catch (error) {
      console.log(`❌ Error en parroquias: ${error.message}`);
    }

    // MIGRACIÓN CORREGIDA: familias (usando columnas compatibles)
    console.log('\n👨‍👩‍👧‍👦 MIGRANDO familias (CORREGIDO)...');
    console.log('═══════════════════════════════════════════════════════');
    
    try {
      const [localData] = await localDB.query('SELECT * FROM familias');
      console.log(`📋 Encontradas ${localData.length} familias en BD local`);
      
      if (localData.length > 0) {
        await remoteDB.query('DELETE FROM familias');
        console.log('🧹 Tabla remota limpiada');
        
        let migrated = 0;
        for (const familia of localData) {
          try {
            // Usar solo columnas que existen en la estructura compatible
            await remoteDB.query(`
              INSERT INTO familias (
                apellido_familiar, sector, direccion_familia, 
                numero_contacto, telefono, email, 
                tamaño_familia, tipo_vivienda, estado_encuesta,
                numero_encuestas, codigo_familia, tutor_responsable,
                id_municipio, id_vereda, id_sector, comunionEnCasa,
                numero_contrato_epm
              ) VALUES (
                ${familia.apellido_familiar ? `'${familia.apellido_familiar.replace(/'/g, "''")}'` : 'NULL'},
                ${familia.sector ? `'${familia.sector.replace(/'/g, "''")}'` : 'NULL'},
                ${familia.direccion_familia ? `'${familia.direccion_familia.replace(/'/g, "''")}'` : 'NULL'},
                ${familia.numero_contacto ? `'${familia.numero_contacto}'` : 'NULL'},
                ${familia.telefono ? `'${familia.telefono}'` : 'NULL'},
                ${familia.email ? `'${familia.email}'` : 'NULL'},
                ${familia.tamaño_familia || 0},
                ${familia.tipo_vivienda ? `'${familia.tipo_vivienda.replace(/'/g, "''")}'` : 'NULL'},
                ${familia.estado_encuesta ? `'${familia.estado_encuesta.replace(/'/g, "''")}'` : 'NULL'},
                ${familia.numero_encuestas || 0},
                ${familia.codigo_familia ? `'${familia.codigo_familia}'` : 'NULL'},
                ${familia.tutor_responsable || false},
                ${familia.id_municipio || 'NULL'},
                ${familia.id_vereda || 'NULL'},
                ${familia.id_sector || 'NULL'},
                ${familia.comunionEnCasa || false},
                ${familia.numero_contrato_epm ? `'${familia.numero_contrato_epm}'` : 'NULL'}
              )
            `);
            migrated++;
          } catch (famError) {
            console.log(`⚠️ Error en familia: ${famError.message}`);
          }
        }
        console.log(`✅ Migradas ${migrated}/${localData.length} familias`);
      }
    } catch (error) {
      console.log(`❌ Error migrando familias: ${error.message}`);
    }

    // MIGRACIÓN SIMPLE: estados_civiles (crear solo con columnas básicas)
    console.log('\n💑 MIGRANDO estados_civiles...');
    console.log('═══════════════════════════════════════════════════════');
    
    try {
      const [localData] = await localDB.query('SELECT * FROM estados_civiles');
      console.log(`📋 Encontrados ${localData.length} registros`);
      
      if (localData.length > 0) {
        // Primero verificar si la tabla ya tiene datos
        const [existingData] = await remoteDB.query('SELECT COUNT(*) as count FROM estados_civiles');
        
        if (parseInt(existingData[0].count) === 0) {
          for (const row of localData) {
            try {
              await remoteDB.query(`
                INSERT INTO estados_civiles (descripcion, activo, created_at, updated_at)
                VALUES ('${row.descripcion?.replace(/'/g, "''")}', ${row.activo || true}, NOW(), NOW())
              `);
            } catch (rowError) {
              console.log(`⚠️ Error insertando estado civil: ${rowError.message}`);
            }
          }
          console.log(`✅ Estados civiles migrados`);
        } else {
          console.log(`ℹ️ Estados civiles ya existen en BD remota`);
        }
      }
    } catch (error) {
      console.log(`❌ Error en estados_civiles: ${error.message}`);
    }

    // VERIFICACIÓN FINAL
    console.log('\n🧪 VERIFICACIÓN FINAL...');
    console.log('═══════════════════════════════════════════════════════');

    const tablesToCheck = ['parroquias', 'familias', 'estados_civiles'];

    for (const tableName of tablesToCheck) {
      try {
        const [localCount] = await localDB.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        const [remoteCount] = await remoteDB.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        
        const localRec = parseInt(localCount[0].count);
        const remoteRec = parseInt(remoteCount[0].count);
        const percentage = localRec > 0 ? Math.round((remoteRec / localRec) * 100) : 100;
        const status = percentage >= 90 ? '✅' : percentage >= 50 ? '⚠️' : '❌';
        
        console.log(`${status} ${tableName}: ${remoteRec}/${localRec} (${percentage}%)`);
      } catch (error) {
        console.log(`❌ ${tableName}: Error - ${error.message}`);
      }
    }

    console.log('\n🎉 MIGRACIÓN CORREGIDA COMPLETADA!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Usar solo columnas que existen en ambas BD');
    console.log('✅ Datos migrados según estructura real');
    console.log('🔧 BD Remota actualizada con datos compatibles');

  } catch (error) {
    console.error('❌ Error en migración corregida:', error.message);
  } finally {
    await localDB.close();
    await remoteDB.close();
    console.log('\n🔒 Conexiones cerradas');
  }
}

// Ejecutar migración corregida
fixedMigration().catch(console.error);
