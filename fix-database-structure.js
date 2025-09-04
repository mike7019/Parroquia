#!/usr/bin/env node

import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

console.log('🔍 Verificando estructura completa de base de datos...');

async function verificarTablaExiste(nombreTabla) {
  try {
    const [result] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = '${nombreTabla}'
    `, { type: QueryTypes.SELECT });
    
    return !!result;
  } catch (error) {
    return false;
  }
}

async function crearTablaParroquias() {
  try {
    console.log('🏗️ Creando tabla parroquias...');
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS parroquias (
        id_parroquia SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        id_municipio INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT fk_parroquias_municipio 
          FOREIGN KEY (id_municipio) 
          REFERENCES municipios(id_municipio)
      )
    `, { type: QueryTypes.RAW });
    
    console.log('✅ Tabla parroquias creada');
    
  } catch (error) {
    console.error('❌ Error creando tabla parroquias:', error.message);
    throw error;
  }
}

async function crearTablaSectores() {
  try {
    console.log('🏗️ Verificando/creando tabla sectores...');
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS sectores (
        id_sector SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        id_municipio INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT fk_sectores_municipio 
          FOREIGN KEY (id_municipio) 
          REFERENCES municipios(id_municipio)
      )
    `, { type: QueryTypes.RAW });
    
    console.log('✅ Tabla sectores verificada/creada');
    
  } catch (error) {
    console.error('❌ Error con tabla sectores:', error.message);
  }
}

async function crearTablaVeredas() {
  try {
    console.log('🏗️ Verificando/creando tabla veredas...');
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS veredas (
        id_vereda SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        codigo_vereda VARCHAR(50),
        id_municipio_municipios INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT fk_veredas_municipio 
          FOREIGN KEY (id_municipio_municipios) 
          REFERENCES municipios(id_municipio)
      )
    `, { type: QueryTypes.RAW });
    
    console.log('✅ Tabla veredas verificada/creada');
    
  } catch (error) {
    console.error('❌ Error con tabla veredas:', error.message);
  }
}

async function crearTablaTiposVivienda() {
  try {
    console.log('🏗️ Verificando/creando tabla tipos_vivienda...');
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS tipos_vivienda (
        id_tipo_vivienda SERIAL PRIMARY KEY,
        nombre_tipo_vivienda VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, { type: QueryTypes.RAW });
    
    console.log('✅ Tabla tipos_vivienda verificada/creada');
    
  } catch (error) {
    console.error('❌ Error con tabla tipos_vivienda:', error.message);
  }
}

async function crearTablaSexos() {
  try {
    console.log('🏗️ Verificando/creando tabla sexos...');
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS sexos (
        id_sexo SERIAL PRIMARY KEY,
        descripcion VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, { type: QueryTypes.RAW });
    
    console.log('✅ Tabla sexos verificada/creada');
    
  } catch (error) {
    console.error('❌ Error con tabla sexos:', error.message);
  }
}

async function crearTablaTiposIdentificacion() {
  try {
    console.log('🏗️ Verificando/creando tabla tipos_identificacion...');
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS tipos_identificacion (
        id_tipo_identificacion SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        codigo VARCHAR(10) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, { type: QueryTypes.RAW });
    
    console.log('✅ Tabla tipos_identificacion verificada/creada');
    
  } catch (error) {
    console.error('❌ Error con tabla tipos_identificacion:', error.message);
  }
}

async function crearTablasRelaciones() {
  try {
    console.log('🔗 Creando tablas de relaciones...');
    
    // Tabla familia_sistema_acueducto
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS familia_sistema_acueducto (
        id SERIAL PRIMARY KEY,
        id_familia INTEGER NOT NULL,
        id_sistema_acueducto INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT fk_familia_sistema_acueducto_familia
          FOREIGN KEY (id_familia) 
          REFERENCES familias(id_familia) ON DELETE CASCADE,
        UNIQUE(id_familia, id_sistema_acueducto)
      )
    `, { type: QueryTypes.RAW });
    
    // Tabla familia_tipo_vivienda  
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS familia_tipo_vivienda (
        id SERIAL PRIMARY KEY,
        id_familia INTEGER NOT NULL,
        id_tipo_vivienda INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT fk_familia_tipo_vivienda_familia
          FOREIGN KEY (id_familia) 
          REFERENCES familias(id_familia) ON DELETE CASCADE,
        CONSTRAINT fk_familia_tipo_vivienda_tipo
          FOREIGN KEY (id_tipo_vivienda) 
          REFERENCES tipos_vivienda(id_tipo_vivienda),
        UNIQUE(id_familia, id_tipo_vivienda)
      )
    `, { type: QueryTypes.RAW });
    
    // Tabla familia_disposicion_basuras
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS familia_disposicion_basuras (
        id SERIAL PRIMARY KEY,
        id_familia INTEGER NOT NULL,
        disposicion VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT fk_familia_disposicion_basuras_familia
          FOREIGN KEY (id_familia) 
          REFERENCES familias(id_familia) ON DELETE CASCADE
      )
    `, { type: QueryTypes.RAW });
    
    // Tabla familia_aguas_residuales  
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS familia_aguas_residuales (
        id SERIAL PRIMARY KEY,
        id_familia INTEGER NOT NULL,
        tipo_tratamiento VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT fk_familia_aguas_residuales_familia
          FOREIGN KEY (id_familia) 
          REFERENCES familias(id_familia) ON DELETE CASCADE
      )
    `, { type: QueryTypes.RAW });
    
    // Tabla sistemas_acueducto (catálogo)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS sistemas_acueducto (
        id_sistema_acueducto SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL UNIQUE,
        descripcion TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, { type: QueryTypes.RAW });
    
    console.log('✅ Tablas de relaciones creadas/verificadas');
    
  } catch (error) {
    console.error('❌ Error creando tablas de relaciones:', error.message);
  }
}

async function insertarDatosSistemasAcueducto() {
  try {
    console.log('🚰 Insertando sistemas de acueducto básicos...');
    
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
        INSERT INTO sistemas_acueducto (nombre)
        VALUES ('${sistema}')
        ON CONFLICT (nombre) DO NOTHING
      `, { type: QueryTypes.INSERT });
    }
    
    console.log('✅ Sistemas de acueducto insertados');
    
  } catch (error) {
    console.error('❌ Error insertando sistemas de acueducto:', error.message);
  }
}

async function insertarDatosBasicos() {
  try {
    console.log('📊 Insertando datos básicos...');
    
    // Verificar que hay municipios
    const [municipio] = await sequelize.query(
      'SELECT id_municipio FROM municipios LIMIT 1', 
      { type: QueryTypes.SELECT }
    );
    
    if (!municipio) {
      console.log('⚠️ No hay municipios disponibles. Ejecuta primero: npm run db:seed:config');
      return;
    }
    
    console.log('📍 Usando municipio ID:', municipio.id_municipio);
    
    // Insertar parroquia básica
    await sequelize.query(`
      INSERT INTO parroquias (nombre, id_municipio)
      VALUES ('Parroquia San José', ${municipio.id_municipio})
      ON CONFLICT (nombre, id_municipio) DO NOTHING
    `, { type: QueryTypes.INSERT });
    
    // Insertar sector básico
    await sequelize.query(`
      INSERT INTO sectores (id_sector, nombre, id_municipio, created_at, updated_at)
      VALUES (1, 'Sector Principal', ${municipio.id_municipio}, NOW(), NOW())
      ON CONFLICT (id_sector) DO NOTHING
    `, { type: QueryTypes.INSERT });
    
    // Insertar vereda básica si no existe ID 1
    const [veredaExiste] = await sequelize.query(
      'SELECT id_vereda FROM veredas WHERE id_vereda = 1', 
      { type: QueryTypes.SELECT }
    );
    
    if (!veredaExiste) {
      await sequelize.query(`
        INSERT INTO veredas (id_vereda, nombre, codigo_vereda, id_municipio_municipios, created_at, updated_at)
        VALUES (1, 'Vereda Principal', 'VP001', ${municipio.id_municipio}, NOW(), NOW())
      `, { type: QueryTypes.INSERT });
    }
    
    // Insertar tipos de vivienda
    const tiposVivienda = ['Casa', 'Apartamento', 'Finca', 'Otro'];
    for (const tipo of tiposVivienda) {
      await sequelize.query(`
        INSERT INTO tipos_vivienda (nombre_tipo_vivienda)
        VALUES ('${tipo}')
        ON CONFLICT (nombre_tipo_vivienda) DO NOTHING
      `, { type: QueryTypes.INSERT });
    }
    
    // Insertar sexos
    const sexos = ['Masculino', 'Femenino', 'Otro'];
    for (const sexo of sexos) {
      await sequelize.query(`
        INSERT INTO sexos (descripcion)
        VALUES ('${sexo}')
        ON CONFLICT (descripcion) DO NOTHING
      `, { type: QueryTypes.INSERT });
    }
    
    // Insertar tipos de identificación
    const tiposId = [
      { nombre: 'Cédula de Ciudadanía', codigo: 'CC' },
      { nombre: 'Tarjeta de Identidad', codigo: 'TI' },
      { nombre: 'Registro Civil', codigo: 'RC' },
      { nombre: 'Cédula de Extranjería', codigo: 'CE' }
    ];
    
    for (const tipo of tiposId) {
      await sequelize.query(`
        INSERT INTO tipos_identificacion (nombre, codigo)
        VALUES ('${tipo.nombre}', '${tipo.codigo}')
        ON CONFLICT (codigo) DO NOTHING
      `, { type: QueryTypes.INSERT });
    }
    
    // Actualizar secuencias
    await sequelize.query(`
      SELECT setval('sectores_id_sector_seq', (SELECT MAX(id_sector) FROM sectores))
    `, { type: QueryTypes.SELECT });
    
    await sequelize.query(`
      SELECT setval('veredas_id_vereda_seq', (SELECT MAX(id_vereda) FROM veredas))
    `, { type: QueryTypes.SELECT });
    
    console.log('✅ Datos básicos insertados');
    
  } catch (error) {
    console.error('❌ Error insertando datos básicos:', error.message);
  }
}

async function verificarEstructuraFinal() {
  try {
    console.log('\n🔍 Verificación final de estructura...');
    
    const tablas = [
      'departamentos', 'municipios', 'parroquias', 'sectores', 
      'veredas', 'tipos_vivienda', 'sexos', 'tipos_identificacion',
      'sistemas_acueducto', 'familia_sistema_acueducto', 
      'familia_tipo_vivienda', 'familia_disposicion_basuras',
      'familia_aguas_residuales'
    ];
    
    const resultados = {};
    
    for (const tabla of tablas) {
      const existe = await verificarTablaExiste(tabla);
      resultados[tabla] = existe;
      
      if (existe) {
        const [count] = await sequelize.query(
          `SELECT COUNT(*) as count FROM ${tabla}`, 
          { type: QueryTypes.SELECT }
        );
        console.log(`✅ ${tabla}: ${count.count} registros`);
      } else {
        console.log(`❌ ${tabla}: NO EXISTE`);
      }
    }
    
    const todasExisten = Object.values(resultados).every(existe => existe);
    
    console.log('\n📊 RESUMEN:');
    console.log('===========');
    if (todasExisten) {
      console.log('🎉 ¡Todas las tablas necesarias existen!');
      console.log('🚀 El sistema está listo para procesar encuestas');
    } else {
      console.log('⚠️ Faltan algunas tablas. Revisa los errores anteriores.');
    }
    
    return todasExisten;
    
  } catch (error) {
    console.error('❌ Error en verificación final:', error.message);
    return false;
  }
}

async function main() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');
    
    // Verificar si parroquias existe
    const parroquiasExiste = await verificarTablaExiste('parroquias');
    
    if (!parroquiasExiste) {
      console.log('❌ Tabla parroquias no existe. Creándola...');
      await crearTablaParroquias();
    } else {
      console.log('✅ Tabla parroquias ya existe');
    }
    
    // Crear/verificar otras tablas necesarias
    await crearTablaSectores();
    await crearTablaVeredas();
    await crearTablaTiposVivienda();
    await crearTablaSexos();
    await crearTablaTiposIdentificacion();
    
    // Crear tablas de relaciones (CRÍTICO para encuestas)
    await crearTablasRelaciones();
    
    // Insertar datos básicos
    await insertarDatosBasicos();
    await insertarDatosSistemasAcueducto();
    
    // Verificación final
    const estructuraCompleta = await verificarEstructuraFinal();
    
    if (estructuraCompleta) {
      console.log('\n🎯 ¡ÉXITO! La base de datos está completamente configurada');
      console.log('📝 Ahora puedes ejecutar: npm run db:seed:config');
    } else {
      console.log('\n⚠️ Algunos problemas persisten. Revisa los logs anteriores.');
    }
    
  } catch (error) {
    console.error('💥 Error principal:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔒 Conexión cerrada');
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default main;
