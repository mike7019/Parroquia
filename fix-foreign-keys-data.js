#!/usr/bin/env node

import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

console.log('🔧 Iniciando corrección de datos de referencia para foreign keys...');

async function crearDatosReferencia() {
  try {
    console.log('📋 Verificando y creando datos básicos de referencia...');

    // 1. Crear departamento básico
    console.log('🌍 Creando departamento básico...');
    const [departamento] = await sequelize.query(`
      INSERT INTO departamentos (nombre_departamento, codigo_dane) 
      VALUES ('Antioquia', '05') 
      ON CONFLICT (codigo_dane) DO UPDATE SET nombre_departamento = EXCLUDED.nombre_departamento
      RETURNING id_departamento, nombre_departamento;
    `, { type: QueryTypes.SELECT });
    
    console.log('✅ Departamento creado:', departamento);

    // 2. Crear municipio básico
    console.log('🏘️ Creando municipio básico...');
    const [municipio] = await sequelize.query(`
      INSERT INTO municipios (nombre_municipio, codigo_dane, id_departamento) 
      VALUES ('Medellín', '05001', ${departamento.id_departamento}) 
      ON CONFLICT (codigo_dane) DO UPDATE SET nombre_municipio = EXCLUDED.nombre_municipio
      RETURNING id_municipio, nombre_municipio;
    `, { type: QueryTypes.SELECT });
    
    console.log('✅ Municipio creado:', municipio);

    // 3. Crear parroquia básica
    console.log('⛪ Creando parroquia básica...');
    const [parroquia] = await sequelize.query(`
      INSERT INTO parroquias (nombre_parroquia, id_municipio) 
      VALUES ('Parroquia San José', ${municipio.id_municipio}) 
      ON CONFLICT (nombre_parroquia, id_municipio) DO UPDATE SET nombre_parroquia = EXCLUDED.nombre_parroquia
      RETURNING id_parroquia, nombre_parroquia;
    `, { type: QueryTypes.SELECT });
    
    console.log('✅ Parroquia creada:', parroquia);

    // 4. Crear sector básico
    console.log('📍 Creando sector básico...');
    const [sector] = await sequelize.query(`
      INSERT INTO sectores (nombre_sector, id_parroquia) 
      VALUES ('Centro', ${parroquia.id_parroquia}) 
      ON CONFLICT (nombre_sector, id_parroquia) DO UPDATE SET nombre_sector = EXCLUDED.nombre_sector
      RETURNING id_sector, nombre_sector;
    `, { type: QueryTypes.SELECT });
    
    console.log('✅ Sector creado:', sector);

    // 5. Crear vereda básica
    console.log('🌾 Creando vereda básica...');
    const [vereda] = await sequelize.query(`
      INSERT INTO veredas (nombre_vereda, id_sector) 
      VALUES ('Vereda Centro', ${sector.id_sector}) 
      ON CONFLICT (nombre_vereda, id_sector) DO UPDATE SET nombre_vereda = EXCLUDED.nombre_vereda
      RETURNING id_vereda, nombre_vereda;
    `, { type: QueryTypes.SELECT });
    
    console.log('✅ Vereda creada:', vereda);

    // 6. Crear tipo de vivienda básico
    console.log('🏠 Creando tipos de vivienda básicos...');
    const tiposVivienda = await sequelize.query(`
      INSERT INTO tipos_vivienda (nombre_tipo_vivienda) 
      VALUES ('Casa'), ('Apartamento'), ('Finca'), ('Otro')
      ON CONFLICT (nombre_tipo_vivienda) DO UPDATE SET nombre_tipo_vivienda = EXCLUDED.nombre_tipo_vivienda
      RETURNING id_tipo_vivienda, nombre_tipo_vivienda;
    `, { type: QueryTypes.SELECT });
    
    console.log('✅ Tipos de vivienda creados:', tiposVivienda.length);

    // 7. Crear sexos básicos
    console.log('👤 Creando sexos básicos...');
    const sexos = await sequelize.query(`
      INSERT INTO sexos (descripcion) 
      VALUES ('Masculino'), ('Femenino'), ('Otro')
      ON CONFLICT (descripcion) DO UPDATE SET descripcion = EXCLUDED.descripcion
      RETURNING id_sexo, descripcion;
    `, { type: QueryTypes.SELECT });
    
    console.log('✅ Sexos creados:', sexos.length);

    // 8. Crear tipos de identificación básicos
    console.log('🆔 Creando tipos de identificación básicos...');
    const tiposId = await sequelize.query(`
      INSERT INTO tipos_identificacion (nombre, codigo) 
      VALUES 
        ('Cédula de Ciudadanía', 'CC'),
        ('Tarjeta de Identidad', 'TI'),
        ('Registro Civil', 'RC'),
        ('Cédula de Extranjería', 'CE')
      ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre
      RETURNING id_tipo_identificacion, nombre, codigo;
    `, { type: QueryTypes.SELECT });
    
    console.log('✅ Tipos de identificación creados:', tiposId.length);

    // 9. Verificar datos creados
    console.log('\n📊 Verificando datos creados:');
    console.log('=================================');
    console.log(`📍 Departamento: ${departamento.nombre_departamento} (ID: ${departamento.id_departamento})`);
    console.log(`🏘️ Municipio: ${municipio.nombre_municipio} (ID: ${municipio.id_municipio})`);
    console.log(`⛪ Parroquia: ${parroquia.nombre_parroquia} (ID: ${parroquia.id_parroquia})`);
    console.log(`📍 Sector: ${sector.nombre_sector} (ID: ${sector.id_sector})`);
    console.log(`🌾 Vereda: ${vereda.nombre_vereda} (ID: ${vereda.id_vereda})`);
    console.log(`🏠 Tipos de vivienda: ${tiposVivienda.length} registros`);
    console.log(`👤 Sexos: ${sexos.length} registros`);
    console.log(`🆔 Tipos de identificación: ${tiposId.length} registros`);
    console.log('=================================');

    return {
      departamento,
      municipio, 
      parroquia,
      sector,
      vereda,
      tiposVivienda,
      sexos,
      tiposId
    };

  } catch (error) {
    console.error('❌ Error creando datos de referencia:', error);
    throw error;
  }
}

async function verificarConstraints() {
  try {
    console.log('\n🔍 Verificando constraints de foreign keys...');
    
    // Verificar que los IDs básicos existen
    const verificaciones = [
      { tabla: 'departamentos', id: 1, nombre: 'id_departamento' },
      { tabla: 'municipios', id: 1, nombre: 'id_municipio' },
      { tabla: 'parroquias', id: 1, nombre: 'id_parroquia' },
      { tabla: 'sectores', id: 1, nombre: 'id_sector' },
      { tabla: 'veredas', id: 1, nombre: 'id_vereda' },
      { tabla: 'tipos_vivienda', id: 1, nombre: 'id_tipo_vivienda' },
      { tabla: 'sexos', id: 1, nombre: 'id_sexo' },
      { tabla: 'tipos_identificacion', id: 1, nombre: 'id_tipo_identificacion' }
    ];

    for (const verif of verificaciones) {
      const [resultado] = await sequelize.query(`
        SELECT ${verif.nombre} FROM ${verif.tabla} WHERE ${verif.nombre} = ${verif.id};
      `, { type: QueryTypes.SELECT });
      
      if (resultado) {
        console.log(`✅ ${verif.tabla}: ID ${verif.id} existe`);
      } else {
        console.log(`❌ ${verif.tabla}: ID ${verif.id} NO existe`);
      }
    }

  } catch (error) {
    console.error('❌ Error verificando constraints:', error);
  }
}

async function main() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');

    // Crear datos de referencia
    const datos = await crearDatosReferencia();

    // Verificar constraints
    await verificarConstraints();

    console.log('\n🎉 ¡CORRECCIÓN COMPLETADA EXITOSAMENTE!');
    console.log('📝 Ahora las encuestas pueden usar:');
    console.log(`   - id_municipio: ${datos.municipio.id_municipio}`);
    console.log(`   - id_parroquia: ${datos.parroquia.id_parroquia}`);
    console.log(`   - id_sector: ${datos.sector.id_sector}`);
    console.log(`   - id_vereda: ${datos.vereda.id_vereda}`);
    console.log(`   - tipo_vivienda: 1-${datos.tiposVivienda.length}`);
    console.log(`   - id_sexo: 1-${datos.sexos.length}`);
    console.log(`   - id_tipo_identificacion: 1-${datos.tiposId.length}`);

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
