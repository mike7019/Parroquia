#!/usr/bin/env node

import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

console.log('🔧 Creando datos básicos para foreign keys con nombres correctos...');

async function crearDatosCorrectos() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a BD');

    // 1. Departamento (usar 'nombre' no 'nombre_departamento')
    await sequelize.query(`
      INSERT INTO departamentos (nombre, codigo_dane) 
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

    // 3. Parroquia (usar 'nombre' no 'nombre_parroquia')
    await sequelize.query(`
      INSERT INTO parroquias (nombre, id_municipio) 
      VALUES ('Parroquia San José', 1) 
      ON CONFLICT (nombre, id_municipio) DO NOTHING;
    `);
    console.log('✅ Parroquia');

    // 4. Sector (usar 'nombre' y 'id_municipio' no 'id_parroquia')
    await sequelize.query(`
      INSERT INTO sectores (nombre, id_municipio) 
      VALUES ('Centro', 1) 
      ON CONFLICT (nombre, id_municipio) DO NOTHING;
    `);
    console.log('✅ Sector');

    // 5. Vereda (usar 'nombre' y 'id_municipio_municipios')
    await sequelize.query(`
      INSERT INTO veredas (nombre, codigo_vereda, id_municipio_municipios) 
      VALUES ('Vereda Centro', 'VC001', 1) 
      ON CONFLICT (codigo_vereda) DO NOTHING;
    `);
    console.log('✅ Vereda');

    // 6. Tipos de vivienda (usar 'nombre')
    await sequelize.query(`
      INSERT INTO tipos_vivienda (nombre, descripcion, activo) 
      VALUES 
        ('Casa', 'Casa independiente', true),
        ('Apartamento', 'Apartamento en edificio', true),
        ('Finca', 'Finca rural', true),
        ('Otro', 'Otro tipo de vivienda', true)
      ON CONFLICT (nombre) DO NOTHING;
    `);
    console.log('✅ Tipos vivienda');

    // 7. Sexos (usar 'nombre', 'codigo', 'descripcion')
    await sequelize.query(`
      INSERT INTO sexos (nombre, codigo, descripcion) 
      VALUES 
        ('Masculino', 'M', 'Sexo masculino'),
        ('Femenino', 'F', 'Sexo femenino'),
        ('Otro', 'O', 'Otro')
      ON CONFLICT (codigo) DO NOTHING;
    `);
    console.log('✅ Sexos');

    // 8. Tipos ID
    await sequelize.query(`
      INSERT INTO tipos_identificacion (nombre, codigo, descripcion) 
      VALUES 
        ('Cédula de Ciudadanía', 'CC', 'Documento de identidad para ciudadanos'),
        ('Tarjeta de Identidad', 'TI', 'Documento para menores de edad'),
        ('Registro Civil', 'RC', 'Registro civil de nacimiento')
      ON CONFLICT (codigo) DO NOTHING;
    `);
    console.log('✅ Tipos ID');

    // Verificar que se crearon los registros
    console.log('\n📊 Verificando registros creados:');
    
    const verificaciones = [
      { tabla: 'departamentos', query: 'SELECT id_departamento, nombre FROM departamentos WHERE id_departamento = 1' },
      { tabla: 'municipios', query: 'SELECT id_municipio, nombre_municipio FROM municipios WHERE id_municipio = 1' },
      { tabla: 'parroquias', query: 'SELECT id_parroquia, nombre FROM parroquias WHERE id_parroquia = 1' },
      { tabla: 'sectores', query: 'SELECT id_sector, nombre FROM sectores WHERE id_sector = 1' },
      { tabla: 'veredas', query: 'SELECT id_vereda, nombre FROM veredas WHERE id_vereda = 1' },
      { tabla: 'tipos_vivienda', query: 'SELECT id_tipo_vivienda, nombre FROM tipos_vivienda WHERE id_tipo_vivienda = 1' }
    ];

    for (const verif of verificaciones) {
      try {
        const [resultado] = await sequelize.query(verif.query, { type: QueryTypes.SELECT });
        if (resultado) {
          console.log(`✅ ${verif.tabla}: ID 1 existe`);
        } else {
          console.log(`❌ ${verif.tabla}: ID 1 NO existe`);
        }
      } catch (error) {
        console.log(`❌ ${verif.tabla}: Error - ${error.message}`);
      }
    }

    console.log('\n🎉 ¡Datos básicos creados exitosamente!');
    console.log('📝 Ahora las encuestas pueden usar los siguientes IDs:');
    console.log('   - id_municipio: 1');
    console.log('   - id_sector: 1');
    console.log('   - id_vereda: 1');
    console.log('   - tipo_vivienda: 1-4');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

crearDatosCorrectos();
