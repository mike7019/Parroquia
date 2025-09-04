#!/usr/bin/env node

import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

console.log('🔧 Creando datos básicos para foreign keys...');

async function crearDatosMinimos() {
  try {
    // Conectar
    await sequelize.authenticate();
    console.log('✅ Conectado a BD');

    // 1. Departamento
    await sequelize.query(`
      INSERT INTO departamentos (nombre_departamento, codigo_dane) 
      VALUES ('Antioquia', '05') 
      ON CONFLICT (codigo_dane) DO NOTHING;
    `);
    console.log('✅ Departamento');

    // 2. Municipio
    await sequelize.query(`
      INSERT INTO municipios (nombre_municipio, codigo_dane, id_departamento) 
      VALUES ('Medellín', '05001', 1) 
      ON CONFLICT (codigo_dane) DO NOTHING;
    `);
    console.log('✅ Municipio');

    // 3. Parroquia
    await sequelize.query(`
      INSERT INTO parroquias (nombre_parroquia, id_municipio) 
      VALUES ('Parroquia San José', 1) 
      ON CONFLICT (nombre_parroquia, id_municipio) DO NOTHING;
    `);
    console.log('✅ Parroquia');

    // 4. Sector
    await sequelize.query(`
      INSERT INTO sectores (nombre_sector, id_parroquia) 
      VALUES ('Centro', 1) 
      ON CONFLICT (nombre_sector, id_parroquia) DO NOTHING;
    `);
    console.log('✅ Sector');

    // 5. Vereda
    await sequelize.query(`
      INSERT INTO veredas (nombre_vereda, id_sector) 
      VALUES ('Vereda Centro', 1) 
      ON CONFLICT (nombre_vereda, id_sector) DO NOTHING;
    `);
    console.log('✅ Vereda');

    // 6. Tipos de vivienda
    await sequelize.query(`
      INSERT INTO tipos_vivienda (nombre_tipo_vivienda) 
      VALUES ('Casa'), ('Apartamento'), ('Finca'), ('Otro')
      ON CONFLICT (nombre_tipo_vivienda) DO NOTHING;
    `);
    console.log('✅ Tipos vivienda');

    // 7. Sexos
    await sequelize.query(`
      INSERT INTO sexos (descripcion) 
      VALUES ('Masculino'), ('Femenino'), ('Otro')
      ON CONFLICT (descripcion) DO NOTHING;
    `);
    console.log('✅ Sexos');

    // 8. Tipos ID
    await sequelize.query(`
      INSERT INTO tipos_identificacion (nombre, codigo) 
      VALUES 
        ('Cédula de Ciudadanía', 'CC'),
        ('Tarjeta de Identidad', 'TI'),
        ('Registro Civil', 'RC')
      ON CONFLICT (codigo) DO NOTHING;
    `);
    console.log('✅ Tipos ID');

    console.log('🎉 ¡Datos básicos creados exitosamente!');
    console.log('📝 Ahora las encuestas pueden usar IDs del 1 al 4 en todas las tablas');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

crearDatosMinimos();
