#!/usr/bin/env node

import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

console.log('🚨 CORRECCIÓN URGENTE: Creando tablas de relaciones faltantes...');

async function crearTablasFaltantes() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a base de datos');
    
    console.log('🔧 Creando tabla familia_sistema_acueducto...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS familia_sistema_acueducto (
        id SERIAL PRIMARY KEY,
        id_familia INTEGER NOT NULL,
        id_sistema_acueducto INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(id_familia, id_sistema_acueducto)
      )
    `, { type: QueryTypes.RAW });
    
    console.log('🔧 Creando tabla familia_tipo_vivienda...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS familia_tipo_vivienda (
        id SERIAL PRIMARY KEY,
        id_familia INTEGER NOT NULL,
        id_tipo_vivienda INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(id_familia, id_tipo_vivienda)
      )
    `, { type: QueryTypes.RAW });
    
    console.log('🔧 Creando tabla familia_disposicion_basuras...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS familia_disposicion_basuras (
        id SERIAL PRIMARY KEY,
        id_familia INTEGER NOT NULL,
        disposicion VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, { type: QueryTypes.RAW });
    
    console.log('🔧 Creando tabla familia_aguas_residuales...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS familia_aguas_residuales (
        id SERIAL PRIMARY KEY,
        id_familia INTEGER NOT NULL,
        tipo_tratamiento VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, { type: QueryTypes.RAW });
    
    console.log('🔧 Creando tabla sistemas_acueducto...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS sistemas_acueducto (
        id_sistema_acueducto SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL UNIQUE,
        descripcion TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, { type: QueryTypes.RAW });
    
    console.log('💧 Insertando sistemas de acueducto básicos...');
    const sistemas = [
      'Acueducto Municipal',
      'Pozo Propio', 
      'Agua de Lluvia',
      'Río o Quebrada',
      'Carro Tanque',
      'Otro'
    ];
    
    for (const sistema of sistemas) {
      await sequelize.query(`
        INSERT INTO sistemas_acueducto (nombre, created_at, updated_at)
        VALUES ('${sistema}', NOW(), NOW())
        ON CONFLICT (nombre) DO NOTHING
      `, { type: QueryTypes.INSERT });
    }
    
    console.log('🔍 Verificando tablas creadas...');
    const verificaciones = [
      'familia_sistema_acueducto',
      'familia_tipo_vivienda', 
      'familia_disposicion_basuras',
      'familia_aguas_residuales',
      'sistemas_acueducto'
    ];
    
    let todasExisten = true;
    for (const tabla of verificaciones) {
      try {
        const [result] = await sequelize.query(`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = '${tabla}'
        `, { type: QueryTypes.SELECT });
        
        if (result) {
          const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tabla}`, { type: QueryTypes.SELECT });
          console.log(`✅ ${tabla}: Existe (${count.count} registros)`);
        } else {
          console.log(`❌ ${tabla}: NO EXISTE`);
          todasExisten = false;
        }
      } catch (error) {
        console.log(`❌ ${tabla}: Error - ${error.message}`);
        todasExisten = false;
      }
    }
    
    if (todasExisten) {
      console.log('\n🎉 ¡CORRECCIÓN EXITOSA!');
      console.log('✅ Todas las tablas de relaciones están creadas');
      console.log('🚀 Las encuestas ya deberían funcionar sin errores');
    } else {
      console.log('\n⚠️ Algunos problemas persisten');
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔒 Conexión cerrada');
  }
}

crearTablasFaltantes();
