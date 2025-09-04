#!/usr/bin/env node

import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

console.log('🏗️ Creando datos locales de parroquia (sin tocar departamentos/municipios de API externa)...');

async function verificarDatosExistentes() {
  try {
    console.log('🔍 Verificando departamentos y municipios existentes...');
    
    // Verificar departamentos
    const departamentos = await sequelize.query(`
      SELECT id_departamento, nombre_departamento FROM departamentos LIMIT 5;
    `, { type: QueryTypes.SELECT });
    
    console.log('📍 Departamentos encontrados:', departamentos.length);
    if (departamentos.length > 0) {
      console.log('   Ejemplo:', departamentos[0]);
    }
    
    // Verificar municipios
    const municipios = await sequelize.query(`
      SELECT id_municipio, nombre_municipio, id_departamento FROM municipios LIMIT 5;
    `, { type: QueryTypes.SELECT });
    
    console.log('🏘️ Municipios encontrados:', municipios.length);
    if (municipios.length > 0) {
      console.log('   Ejemplo:', municipios[0]);
    }
    
    return { departamentos, municipios };
    
  } catch (error) {
    console.error('❌ Error verificando datos existentes:', error);
    throw error;
  }
}

async function crearDatosLocales(municipioRef) {
  try {
    console.log('🏗️ Creando datos locales de parroquia...');
    
    // 1. Crear parroquia
    console.log('⛪ Creando parroquia...');
    let parroquia;
    try {
      const [parroquiaResult] = await sequelize.query(`
        INSERT INTO parroquias (nombre_parroquia, id_municipio) 
        VALUES ('Parroquia San José', ${municipioRef.id_municipio}) 
        RETURNING id_parroquia, nombre_parroquia;
      `, { type: QueryTypes.SELECT });
      parroquia = parroquiaResult;
      console.log('✅ Parroquia creada:', parroquia);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        const [existing] = await sequelize.query(`
          SELECT id_parroquia, nombre_parroquia FROM parroquias 
          WHERE nombre_parroquia = 'Parroquia San José' AND id_municipio = ${municipioRef.id_municipio};
        `, { type: QueryTypes.SELECT });
        parroquia = existing;
        console.log('ℹ️ Parroquia ya existe:', parroquia);
      } else {
        throw error;
      }
    }

    // 2. Crear sector
    console.log('📍 Creando sector...');
    let sector;
    try {
      const [sectorResult] = await sequelize.query(`
        INSERT INTO sectores (nombre_sector, id_parroquia) 
        VALUES ('Centro', ${parroquia.id_parroquia}) 
        RETURNING id_sector, nombre_sector;
      `, { type: QueryTypes.SELECT });
      sector = sectorResult;
      console.log('✅ Sector creado:', sector);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        const [existing] = await sequelize.query(`
          SELECT id_sector, nombre_sector FROM sectores 
          WHERE nombre_sector = 'Centro' AND id_parroquia = ${parroquia.id_parroquia};
        `, { type: QueryTypes.SELECT });
        sector = existing;
        console.log('ℹ️ Sector ya existe:', sector);
      } else {
        throw error;
      }
    }

    // 3. Crear vereda
    console.log('🌾 Creando vereda...');
    let vereda;
    try {
      const [veredaResult] = await sequelize.query(`
        INSERT INTO veredas (nombre_vereda, id_sector) 
        VALUES ('Vereda Centro', ${sector.id_sector}) 
        RETURNING id_vereda, nombre_vereda;
      `, { type: QueryTypes.SELECT });
      vereda = veredaResult;
      console.log('✅ Vereda creada:', vereda);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        const [existing] = await sequelize.query(`
          SELECT id_vereda, nombre_vereda FROM veredas 
          WHERE nombre_vereda = 'Vereda Centro' AND id_sector = ${sector.id_sector};
        `, { type: QueryTypes.SELECT });
        vereda = existing;
        console.log('ℹ️ Vereda ya existe:', vereda);
      } else {
        throw error;
      }
    }

    return { parroquia, sector, vereda };
    
  } catch (error) {
    console.error('❌ Error creando datos locales:', error);
    throw error;
  }
}

async function crearDatosCatalogo() {
  try {
    console.log('📚 Creando datos de catálogo...');
    
    // Tipos de vivienda
    console.log('🏠 Creando tipos de vivienda...');
    const tiposVivienda = [];
    const tipos = ['Casa', 'Apartamento', 'Finca', 'Otro'];
    
    for (const tipo of tipos) {
      try {
        const [resultado] = await sequelize.query(`
          INSERT INTO tipos_vivienda (nombre_tipo_vivienda) 
          VALUES ('${tipo}') 
          RETURNING id_tipo_vivienda, nombre_tipo_vivienda;
        `, { type: QueryTypes.SELECT });
        tiposVivienda.push(resultado);
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          const [existing] = await sequelize.query(`
            SELECT id_tipo_vivienda, nombre_tipo_vivienda FROM tipos_vivienda 
            WHERE nombre_tipo_vivienda = '${tipo}';
          `, { type: QueryTypes.SELECT });
          if (existing) tiposVivienda.push(existing);
        }
      }
    }
    console.log(`✅ Tipos de vivienda: ${tiposVivienda.length} registros`);

    // Sexos
    console.log('👤 Creando sexos...');
    const sexos = [];
    const tiposSexo = ['Masculino', 'Femenino', 'Otro'];
    
    for (const sexo of tiposSexo) {
      try {
        const [resultado] = await sequelize.query(`
          INSERT INTO sexos (descripcion) 
          VALUES ('${sexo}') 
          RETURNING id_sexo, descripcion;
        `, { type: QueryTypes.SELECT });
        sexos.push(resultado);
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          const [existing] = await sequelize.query(`
            SELECT id_sexo, descripcion FROM sexos 
            WHERE descripcion = '${sexo}';
          `, { type: QueryTypes.SELECT });
          if (existing) sexos.push(existing);
        }
      }
    }
    console.log(`✅ Sexos: ${sexos.length} registros`);

    // Tipos de identificación
    console.log('🆔 Creando tipos de identificación...');
    const tiposId = [];
    const tiposIdentificacion = [
      { nombre: 'Cédula de Ciudadanía', codigo: 'CC' },
      { nombre: 'Tarjeta de Identidad', codigo: 'TI' },
      { nombre: 'Registro Civil', codigo: 'RC' },
      { nombre: 'Cédula de Extranjería', codigo: 'CE' }
    ];
    
    for (const tipo of tiposIdentificacion) {
      try {
        const [resultado] = await sequelize.query(`
          INSERT INTO tipos_identificacion (nombre, codigo) 
          VALUES ('${tipo.nombre}', '${tipo.codigo}') 
          RETURNING id_tipo_identificacion, nombre, codigo;
        `, { type: QueryTypes.SELECT });
        tiposId.push(resultado);
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          const [existing] = await sequelize.query(`
            SELECT id_tipo_identificacion, nombre, codigo FROM tipos_identificacion 
            WHERE codigo = '${tipo.codigo}';
          `, { type: QueryTypes.SELECT });
          if (existing) tiposId.push(existing);
        }
      }
    }
    console.log(`✅ Tipos de identificación: ${tiposId.length} registros`);

    return { tiposVivienda, sexos, tiposId };
    
  } catch (error) {
    console.error('❌ Error creando datos de catálogo:', error);
    throw error;
  }
}

async function verificarForeignKeys() {
  try {
    console.log('\n🔍 Verificando que los foreign keys necesarios existen...');
    
    const verificaciones = [
      { tabla: 'municipios', id: 1, campo: 'id_municipio' },
      { tabla: 'parroquias', id: 1, campo: 'id_parroquia' },
      { tabla: 'sectores', id: 1, campo: 'id_sector' },
      { tabla: 'veredas', id: 1, campo: 'id_vereda' },
      { tabla: 'tipos_vivienda', id: 1, campo: 'id_tipo_vivienda' },
      { tabla: 'sexos', id: 1, campo: 'id_sexo' },
      { tabla: 'tipos_identificacion', id: 1, campo: 'id_tipo_identificacion' }
    ];

    let todosExisten = true;
    
    for (const verif of verificaciones) {
      try {
        const [resultado] = await sequelize.query(`
          SELECT ${verif.campo} FROM ${verif.tabla} WHERE ${verif.campo} = ${verif.id};
        `, { type: QueryTypes.SELECT });
        
        if (resultado) {
          console.log(`✅ ${verif.tabla}: ID ${verif.id} existe`);
        } else {
          console.log(`❌ ${verif.tabla}: ID ${verif.id} NO existe`);
          todosExisten = false;
        }
      } catch (error) {
        console.log(`❌ ${verif.tabla}: Error consultando - ${error.message}`);
        todosExisten = false;
      }
    }

    return todosExisten;
    
  } catch (error) {
    console.error('❌ Error verificando foreign keys:', error);
    return false;
  }
}

async function main() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');

    // Verificar datos existentes
    const datosExistentes = await verificarDatosExistentes();
    
    if (datosExistentes.municipios.length === 0) {
      console.log('⚠️ No hay municipios en la base de datos. Asegúrate de que la API externa haya cargado los datos.');
      console.log('💡 Puedes ejecutar: npm run db:seed:config');
      return;
    }

    // Usar el primer municipio encontrado como referencia
    const municipioRef = datosExistentes.municipios[0];
    console.log('📍 Usando municipio de referencia:', municipioRef.nombre_municipio);

    // Crear datos locales de parroquia
    const datosLocales = await crearDatosLocales(municipioRef);

    // Crear datos de catálogo
    const datosCatalogo = await crearDatosCatalogo();

    // Verificar que todos los foreign keys existen
    const foreignKeysOK = await verificarForeignKeys();

    console.log('\n📊 RESUMEN DE CREACIÓN:');
    console.log('========================');
    console.log(`⛪ Parroquia: ${datosLocales.parroquia.nombre_parroquia} (ID: ${datosLocales.parroquia.id_parroquia})`);
    console.log(`📍 Sector: ${datosLocales.sector.nombre_sector} (ID: ${datosLocales.sector.id_sector})`);
    console.log(`🌾 Vereda: ${datosLocales.vereda.nombre_vereda} (ID: ${datosLocales.vereda.id_vereda})`);
    console.log(`🏠 Tipos de vivienda: ${datosCatalogo.tiposVivienda.length} registros`);
    console.log(`👤 Sexos: ${datosCatalogo.sexos.length} registros`);
    console.log(`🆔 Tipos de identificación: ${datosCatalogo.tiposId.length} registros`);
    console.log('========================');

    if (foreignKeysOK) {
      console.log('🎉 ¡ÉXITO! Todos los foreign keys necesarios están disponibles');
      console.log('📝 Las encuestas ahora pueden usar:');
      console.log(`   - id_municipio: ${municipioRef.id_municipio}`);
      console.log(`   - id_parroquia: ${datosLocales.parroquia.id_parroquia}`);
      console.log(`   - id_sector: ${datosLocales.sector.id_sector}`);
      console.log(`   - id_vereda: ${datosLocales.vereda.id_vereda}`);
      console.log(`   - tipo_vivienda: 1-${datosCatalogo.tiposVivienda.length}`);
    } else {
      console.log('⚠️ Algunos foreign keys fallan. Revisa los errores anteriores.');
    }

  } catch (error) {
    console.error('💥 Error en el proceso principal:', error);
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
