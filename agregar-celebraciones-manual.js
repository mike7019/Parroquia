/**
 * Script para agregar celebraciones manualmente a la base de datos
 * Actualiza personas existentes con datos de celebración
 */

import { QueryTypes } from 'sequelize';
import sequelize from './config/sequelize.js';

async function agregarCelebracionesManualmente() {
  try {
    console.log('🎉 Agregando celebraciones manualmente a la base de datos...\n');

    // Datos de celebraciones para agregar
    const celebraciones = [
      {
        identificacion: '12345678',
        motivo: 'Cumpleaños',
        dia: 15,
        mes: 6,
        nombre: 'Carlos Test García'
      },
      {
        identificacion: '87654321445',
        motivo: 'Santo',
        dia: 24,
        mes: 12,
        nombre: 'Carlos Test 1 García Pérez'
      },
      {
        identificacion: '98765431445',
        motivo: 'Aniversario',
        dia: 14,
        mes: 2,
        nombre: 'María Test 1 López Rodríguez'
      },
      {
        identificacion: '11223341445',
        motivo: 'Cumpleaños',
        dia: 10,
        mes: 5,
        nombre: 'Juan Test 1 García López'
      },
      {
        identificacion: '55667781445',
        motivo: 'Cumpleaños',
        dia: 8,
        mes: 3,
        nombre: 'Ana Test 1 García López'
      },
      {
        identificacion: '87654322547',
        motivo: 'Cumpleaños',
        dia: 20,
        mes: 11,
        nombre: 'Carlos Test 2 García Pérez'
      },
      {
        identificacion: '98765432547',
        motivo: 'Santo',
        dia: 15,
        mes: 8,
        nombre: 'María Test 2 López Rodríguez'
      },
      {
        identificacion: '11223342547',
        motivo: 'Aniversario',
        dia: 5,
        mes: 7,
        nombre: 'Juan Test 2 García López'
      },
      {
        identificacion: '1082968374',
        motivo: 'Cumpleaños',
        dia: 25,
        mes: 9,
        nombre: 'Carlos Andrés Rodríguez Lozano'
      },
      {
        identificacion: '574485558',
        motivo: 'Cumpleaños',
        dia: 12,
        mes: 4,
        nombre: 'Carlos Javier Lopez Lozano'
      }
    ];

    let actualizados = 0;
    let errores = 0;

    console.log(`📋 Procesando ${celebraciones.length} celebraciones...\n`);

    for (const celebracion of celebraciones) {
      try {
        const [resultado] = await sequelize.query(`
          UPDATE personas 
          SET 
            motivo_celebrar = :motivo,
            dia_celebrar = :dia,
            mes_celebrar = :mes
          WHERE identificacion = :identificacion
          RETURNING id_personas, primer_nombre, primer_apellido
        `, {
          replacements: {
            motivo: celebracion.motivo,
            dia: celebracion.dia,
            mes: celebracion.mes,
            identificacion: celebracion.identificacion
          },
          type: QueryTypes.UPDATE
        });

        if (resultado && resultado.length > 0) {
          actualizados++;
          console.log(`✅ ${actualizados}. ${celebracion.nombre}`);
          console.log(`   Motivo: ${celebracion.motivo} | Día: ${celebracion.dia} | Mes: ${celebracion.mes}`);
          console.log(`   ID Identificación: ${celebracion.identificacion}`);
          console.log('');
        } else {
          console.warn(`⚠️  No se encontró persona con identificación: ${celebracion.identificacion}`);
          errores++;
        }

      } catch (error) {
        console.error(`❌ Error al actualizar ${celebracion.nombre}:`, error.message);
        errores++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE ACTUALIZACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Celebraciones agregadas: ${actualizados}`);
    console.log(`⚠️  Errores: ${errores}`);
    console.log(`📈 Total procesadas: ${celebraciones.length}`);
    console.log('');

    // Verificar resultados
    console.log('🔍 Verificando celebraciones agregadas...\n');
    
    const verificacion = await sequelize.query(`
      SELECT 
        COUNT(*) as total_personas,
        COUNT(CASE WHEN motivo_celebrar IS NOT NULL AND motivo_celebrar != '' THEN 1 END) as con_motivo,
        COUNT(CASE WHEN dia_celebrar IS NOT NULL THEN 1 END) as con_dia,
        COUNT(CASE WHEN mes_celebrar IS NOT NULL THEN 1 END) as con_mes,
        COUNT(CASE WHEN 
          motivo_celebrar IS NOT NULL AND motivo_celebrar != '' AND
          dia_celebrar IS NOT NULL AND 
          mes_celebrar IS NOT NULL 
        THEN 1 END) as celebraciones_completas
      FROM personas
    `, { type: QueryTypes.SELECT });

    const stats = verificacion[0];
    
    console.log('📊 Estadísticas actualizadas:');
    console.log(`   Total personas en BD: ${stats.total_personas}`);
    console.log(`   Con motivo: ${stats.con_motivo}`);
    console.log(`   Con día: ${stats.con_dia}`);
    console.log(`   Con mes: ${stats.con_mes}`);
    console.log(`   Celebraciones completas: ${stats.celebraciones_completas}`);
    console.log('');

    // Mostrar algunos ejemplos
    console.log('📋 Ejemplos de celebraciones agregadas:\n');
    
    const ejemplos = await sequelize.query(`
      SELECT 
        id_personas,
        CONCAT(primer_nombre, ' ', primer_apellido) as nombre,
        identificacion,
        motivo_celebrar,
        dia_celebrar,
        mes_celebrar
      FROM personas
      WHERE motivo_celebrar IS NOT NULL AND motivo_celebrar != ''
      LIMIT 5
    `, { type: QueryTypes.SELECT });

    ejemplos.forEach((ej, idx) => {
      const nombreMes = obtenerNombreMes(ej.mes_celebrar);
      console.log(`${idx + 1}. ${ej.nombre} (ID: ${ej.identificacion})`);
      console.log(`   Celebración: ${ej.motivo_celebrar} - ${ej.dia_celebrar} de ${nombreMes}`);
      console.log('');
    });

    console.log('✅ Proceso completado exitosamente!\n');

  } catch (error) {
    console.error('❌ Error general:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

function obtenerNombreMes(numeroMes) {
  const meses = {
    1: 'enero', 2: 'febrero', 3: 'marzo', 4: 'abril',
    5: 'mayo', 6: 'junio', 7: 'julio', 8: 'agosto', 
    9: 'septiembre', 10: 'octubre', 11: 'noviembre', 12: 'diciembre'
  };
  return meses[numeroMes] || 'desconocido';
}

// Ejecutar
agregarCelebracionesManualmente();
