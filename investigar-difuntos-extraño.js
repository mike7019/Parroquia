#!/usr/bin/env node

import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';
import difuntosConsolidadoService from './src/services/consolidados/difuntosConsolidadoService.js';

async function investigarInformacionExtraña() {
  try {
    console.log('🔍 Investigando información extraña en difuntos...\n');

    // 1. Revisar datos directos de personas fallecidas
    console.log('1️⃣ DATOS DIRECTOS DE PERSONAS FALLECIDAS:');
    const personasDirectas = await sequelize.query(`
      SELECT 
        id_personas,
        primer_nombre,
        segundo_nombre, 
        primer_apellido,
        segundo_apellido,
        estudios,
        id_familia_familias
      FROM personas 
      WHERE estudios IS NOT NULL 
        AND estudios LIKE '%es_fallecido%'
    `, { type: QueryTypes.SELECT });

    console.log('Raw data from personas table:');
    console.log(JSON.stringify(personasDirectas, null, 2));

    // 2. Revisar datos con JOINS del servicio
    console.log('\n2️⃣ DATOS CON JOINS DEL SERVICIO:');
    const conJoins = await sequelize.query(`
      SELECT 
        pe.id_personas,
        TRIM(CONCAT(pe.primer_nombre, ' ', COALESCE(pe.segundo_nombre, ''), ' ', COALESCE(pe.primer_apellido, ''), ' ', COALESCE(pe.segundo_apellido, ''))) as nombre_completo,
        (pe.estudios::json->>'fecha_aniversario')::date as fecha_aniversario,
        pe.estudios::json->>'causa_fallecimiento' as observaciones,
        f.apellido_familiar,
        f.sector,
        f.telefono,
        f.direccion_familia,
        f.id_familia,
        m.nombre_municipio,
        s.nombre as nombre_sector,
        v.nombre as nombre_vereda,
        p.nombre as nombre_parroquia,
        pe.id_familia_familias as persona_familia_id
      FROM personas pe
      LEFT JOIN familias f ON pe.id_familia_familias = f.id_familia
      LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
      LEFT JOIN sectores s ON f.id_sector = s.id_sector
      LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
      LEFT JOIN parroquias p ON f.id_parroquia = p.id_parroquia
      WHERE pe.estudios IS NOT NULL 
        AND pe.estudios LIKE '%es_fallecido%'
        AND pe.estudios::json->>'es_fallecido' = 'true'
    `, { type: QueryTypes.SELECT });

    console.log('Data with JOINs:');
    console.log(JSON.stringify(conJoins, null, 2));

    // 3. Revisar datos usando el servicio consolidado
    console.log('\n3️⃣ DATOS DEL SERVICIO CONSOLIDADO:');
    const resultadoServicio = await difuntosConsolidadoService.consultarDifuntos({});
    
    console.log('Service result:');
    console.log(JSON.stringify(resultadoServicio, null, 2));

    // 4. Verificar datos de la familia
    console.log('\n4️⃣ DATOS DE LA FAMILIA RELACIONADA:');
    if (conJoins.length > 0 && conJoins[0].persona_familia_id) {
      const familia = await sequelize.query(`
        SELECT * FROM familias WHERE id_familia = :familiaId
      `, { 
        replacements: { familiaId: conJoins[0].persona_familia_id },
        type: QueryTypes.SELECT 
      });
      
      console.log('Family data:');
      console.log(JSON.stringify(familia, null, 2));
    }

  } catch (error) {
    console.error('❌ Error investigando:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

investigarInformacionExtraña();
