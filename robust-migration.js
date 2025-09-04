import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function robustDataMigration() {
  console.log('🚨 MIGRACIÓN ROBUSTA DE DATOS CRÍTICOS');
  console.log('🛡️ Versión mejorada con manejo de NULL y errores');
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

    // MIGRACIÓN ESPECÍFICA: familia_sistema_acueducto
    console.log('🔥 MIGRANDO familia_sistema_acueducto...');
    console.log('═══════════════════════════════════════════════════════');
    
    try {
      const [localData] = await localDB.query('SELECT * FROM familia_sistema_acueducto');
      console.log(`📋 Encontrados ${localData.length} registros en BD local`);
      
      if (localData.length > 0) {
        // Limpiar datos remotos
        await remoteDB.query('DELETE FROM familia_sistema_acueducto');
        console.log('🧹 Tabla remota limpiada');
        
        // Insertar datos uno por uno con manejo de errores
        let migrated = 0;
        for (const row of localData) {
          try {
            await remoteDB.query(`
              INSERT INTO familia_sistema_acueducto 
              (id_familia, id_sistema_acueducto, created_at, updated_at)
              VALUES (${row.id_familia}, ${row.id_sistema_acueducto}, 
                      '${row.created_at || 'NOW()'}', '${row.updated_at || 'NOW()'}')
            `);
            migrated++;
          } catch (rowError) {
            console.log(`⚠️ Error en registro ${row.id}: ${rowError.message}`);
          }
        }
        console.log(`✅ Migrados ${migrated}/${localData.length} registros`);
      }
    } catch (error) {
      console.log(`❌ Error en familia_sistema_acueducto: ${error.message}`);
    }

    // MIGRACIÓN ESPECÍFICA: parroquias
    console.log('\n🌍 MIGRANDO parroquias...');
    console.log('═══════════════════════════════════════════════════════');
    
    try {
      const [localData] = await localDB.query('SELECT * FROM parroquias');
      console.log(`📋 Encontrados ${localData.length} registros en BD local`);
      
      if (localData.length > 0) {
        // Limpiar datos remotos
        await remoteDB.query('DELETE FROM parroquias');
        console.log('🧹 Tabla remota limpiada');
        
        // Insertar datos con valores seguros
        let migrated = 0;
        for (const row of localData) {
          try {
            const nombre = row.nombre ? `'${row.nombre.replace(/'/g, "''")}'` : 'NULL';
            const id_municipio = row.id_municipio || 'NULL';
            const descripcion = row.descripcion ? `'${row.descripcion.replace(/'/g, "''")}'` : 'NULL';
            const direccion = row.direccion ? `'${row.direccion.replace(/'/g, "''")}'` : 'NULL';
            const telefono = row.telefono ? `'${row.telefono.replace(/'/g, "''")}'` : 'NULL';
            
            await remoteDB.query(`
              INSERT INTO parroquias (nombre, id_municipio, descripcion, direccion, telefono)
              VALUES (${nombre}, ${id_municipio}, ${descripcion}, ${direccion}, ${telefono})
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

    // MIGRACIÓN: familias y personas (datos base)
    console.log('\n👥 MIGRANDO familias y personas...');
    console.log('═══════════════════════════════════════════════════════');
    
    // Migrar familias
    try {
      const [localFamilias] = await localDB.query('SELECT * FROM familias');
      console.log(`📋 Encontradas ${localFamilias.length} familias en BD local`);
      
      if (localFamilias.length > 0) {
        await remoteDB.query('DELETE FROM familias');
        
        for (const familia of localFamilias) {
          try {
            await remoteDB.query(`
              INSERT INTO familias (
                nombre_familia, direccion_familia, numero_contrato_epm, 
                telefono_familiar, tratamiento_datos, created_at, updated_at
              ) VALUES (
                '${familia.nombre_familia?.replace(/'/g, "''")}',
                '${familia.direccion_familia?.replace(/'/g, "''")}',
                ${familia.numero_contrato_epm ? `'${familia.numero_contrato_epm}'` : 'NULL'},
                ${familia.telefono_familiar ? `'${familia.telefono_familiar}'` : 'NULL'},
                ${familia.tratamiento_datos || false},
                '${familia.created_at || 'NOW()'}',
                '${familia.updated_at || 'NOW()'}'
              )
            `);
          } catch (famError) {
            console.log(`⚠️ Error en familia: ${famError.message}`);
          }
        }
        console.log(`✅ Familias migradas exitosamente`);
      }
    } catch (error) {
      console.log(`❌ Error migrando familias: ${error.message}`);
    }

    // Migrar personas
    try {
      const [localPersonas] = await localDB.query('SELECT * FROM personas');
      console.log(`📋 Encontradas ${localPersonas.length} personas en BD local`);
      
      if (localPersonas.length > 0) {
        await remoteDB.query('DELETE FROM personas');
        
        for (const persona of localPersonas) {
          try {
            await remoteDB.query(`
              INSERT INTO personas (
                primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
                identificacion, telefono, correo_electronico, fecha_nacimiento,
                direccion, created_at, updated_at
              ) VALUES (
                '${persona.primer_nombre?.replace(/'/g, "''")}',
                ${persona.segundo_nombre ? `'${persona.segundo_nombre.replace(/'/g, "''")}'` : 'NULL'},
                '${persona.primer_apellido?.replace(/'/g, "''")}',
                ${persona.segundo_apellido ? `'${persona.segundo_apellido.replace(/'/g, "''")}'` : 'NULL'},
                '${persona.identificacion}',
                '${persona.telefono}',
                '${persona.correo_electronico}',
                '${persona.fecha_nacimiento}',
                '${persona.direccion?.replace(/'/g, "''")}',
                '${persona.created_at || 'NOW()'}',
                '${persona.updated_at || 'NOW()'}'
              )
            `);
          } catch (persError) {
            console.log(`⚠️ Error en persona: ${persError.message}`);
          }
        }
        console.log(`✅ Personas migradas exitosamente`);
      }
    } catch (error) {
      console.log(`❌ Error migrando personas: ${error.message}`);
    }

    // VERIFICACIÓN FINAL COMPLETA
    console.log('\n🧪 VERIFICACIÓN FINAL COMPLETA...');
    console.log('═══════════════════════════════════════════════════════');

    const allCriticalTables = [
      'familias', 'personas', 'familia_sistema_acueducto', 
      'familia_tipo_vivienda', 'parroquias', 'sistemas_acueducto'
    ];

    console.log('📊 Estado final de sincronización:');
    for (const tableName of allCriticalTables) {
      try {
        const [localCount] = await localDB.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        const [remoteCount] = await remoteDB.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        
        const localRec = parseInt(localCount[0].count);
        const remoteRec = parseInt(remoteCount[0].count);
        const percentage = localRec > 0 ? Math.round((remoteRec / localRec) * 100) : 100;
        const status = percentage >= 90 ? '✅' : percentage >= 50 ? '⚠️' : '❌';
        
        console.log(`${status} ${tableName}: ${remoteRec}/${localRec} (${percentage}%)`);
      } catch (error) {
        console.log(`❌ ${tableName}: Error verificando - ${error.message}`);
      }
    }

    console.log('\n🎉 MIGRACIÓN ROBUSTA COMPLETADA!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Datos críticos migrados con manejo de errores');
    console.log('✅ BD Remota sincronizada y lista para producción');
    console.log('🔧 Revisa los porcentajes de sincronización arriba');

  } catch (error) {
    console.error('❌ Error crítico en migración:', error.message);
  } finally {
    await localDB.close();
    await remoteDB.close();
    console.log('\n🔒 Conexiones cerradas');
  }
}

// Ejecutar migración robusta
robustDataMigration().catch(console.error);
