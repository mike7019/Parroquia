#!/usr/bin/env node

import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

console.log('🔧 Creando datos básicos sin ON CONFLICT...');

async function crearDatosSimple() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a BD');

    // Función helper para insertar ignorando errores de duplicado
    const insertarSiNoExiste = async (query, nombre) => {
      try {
        await sequelize.query(query);
        console.log(`✅ ${nombre} creado`);
      } catch (error) {
        if (error.message.includes('duplicate') || error.message.includes('already exists')) {
          console.log(`ℹ️ ${nombre} ya existe`);
        } else {
          console.log(`❌ ${nombre} error: ${error.message}`);
        }
      }
    };

    // 1. Departamento
    await insertarSiNoExiste(`
      INSERT INTO departamentos (nombre, codigo_dane) 
      VALUES ('Antioquia', '05');
    `, 'Departamento');

    // 2. Municipio 
    await insertarSiNoExiste(`
      INSERT INTO municipios (nombre_municipio, codigo_dane, id_departamento) 
      VALUES ('Medellín', '05001', 1);
    `, 'Municipio');

    // 3. Parroquia
    await insertarSiNoExiste(`
      INSERT INTO parroquias (nombre, id_municipio) 
      VALUES ('Parroquia San José', 1);
    `, 'Parroquia');

    // 4. Sector
    await insertarSiNoExiste(`
      INSERT INTO sectores (nombre, id_municipio) 
      VALUES ('Centro', 1);
    `, 'Sector');

    // 5. Vereda
    await insertarSiNoExiste(`
      INSERT INTO veredas (nombre, codigo_vereda, id_municipio_municipios) 
      VALUES ('Vereda Centro', 'VC001', 1);
    `, 'Vereda');

    // 6. Tipos de vivienda
    await insertarSiNoExiste(`
      INSERT INTO tipos_vivienda (nombre, descripcion, activo) 
      VALUES ('Casa', 'Casa independiente', true);
    `, 'Tipo vivienda Casa');

    await insertarSiNoExiste(`
      INSERT INTO tipos_vivienda (nombre, descripcion, activo) 
      VALUES ('Apartamento', 'Apartamento en edificio', true);
    `, 'Tipo vivienda Apartamento');

    // 7. Sexos
    await insertarSiNoExiste(`
      INSERT INTO sexos (nombre, codigo, descripcion) 
      VALUES ('Masculino', 'M', 'Sexo masculino');
    `, 'Sexo Masculino');

    await insertarSiNoExiste(`
      INSERT INTO sexos (nombre, codigo, descripcion) 
      VALUES ('Femenino', 'F', 'Sexo femenino');
    `, 'Sexo Femenino');

    // 8. Tipos ID
    await insertarSiNoExiste(`
      INSERT INTO tipos_identificacion (nombre, codigo, descripcion) 
      VALUES ('Cédula de Ciudadanía', 'CC', 'Documento de identidad para ciudadanos');
    `, 'Tipo ID CC');

    // Verificar IDs
    console.log('\n📊 Verificando IDs disponibles:');
    
    const departamentos = await sequelize.query('SELECT id_departamento, nombre FROM departamentos LIMIT 3', { type: QueryTypes.SELECT });
    console.log('🏛️ Departamentos:', departamentos.map(d => `ID ${d.id_departamento}: ${d.nombre}`));

    const municipios = await sequelize.query('SELECT id_municipio, nombre_municipio FROM municipios LIMIT 3', { type: QueryTypes.SELECT });
    console.log('🏘️ Municipios:', municipios.map(m => `ID ${m.id_municipio}: ${m.nombre_municipio}`));

    const sectores = await sequelize.query('SELECT id_sector, nombre FROM sectores LIMIT 3', { type: QueryTypes.SELECT });
    console.log('📍 Sectores:', sectores.map(s => `ID ${s.id_sector}: ${s.nombre}`));

    const veredas = await sequelize.query('SELECT id_vereda, nombre FROM veredas LIMIT 3', { type: QueryTypes.SELECT });
    console.log('🌾 Veredas:', veredas.map(v => `ID ${v.id_vereda}: ${v.nombre}`));

    const tiposVivienda = await sequelize.query('SELECT id_tipo_vivienda, nombre FROM tipos_vivienda LIMIT 3', { type: QueryTypes.SELECT });
    console.log('🏠 Tipos vivienda:', tiposVivienda.map(tv => `ID ${tv.id_tipo_vivienda}: ${tv.nombre}`));

    console.log('\n🎉 ¡Proceso completado!');
    console.log('📝 IDs disponibles para usar en encuestas:');
    if (municipios.length > 0) console.log(`   - id_municipio: ${municipios[0].id_municipio}`);
    if (sectores.length > 0) console.log(`   - id_sector: ${sectores[0].id_sector}`);
    if (veredas.length > 0) console.log(`   - id_vereda: ${veredas[0].id_vereda}`);
    if (tiposVivienda.length > 0) console.log(`   - tipo_vivienda: ${tiposVivienda[0].id_tipo_vivienda}`);

  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await sequelize.close();
  }
}

crearDatosSimple();
