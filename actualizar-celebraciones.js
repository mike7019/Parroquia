/**
 * Script para actualizar celebraciones en personas existentes
 * Opción A: Re-importar datos desde fuente original
 * 
 * Este script:
 * 1. Identifica personas sin datos de celebración
 * 2. Permite actualizar masivamente desde archivo JSON de encuestas
 * 3. Actualiza solo los campos de celebración sin afectar otros datos
 */

import { QueryTypes } from 'sequelize';
import sequelize from './config/sequelize.js';
import fs from 'fs/promises';
import path from 'path';

class ActualizadorCelebraciones {
  
  /**
   * Analizar personas sin celebraciones
   */
  async analizarPersonasSinCelebraciones() {
    try {
      console.log('🔍 Analizando personas sin datos de celebración...\n');
      
      const estadisticas = await sequelize.query(`
        SELECT 
          COUNT(*) as total_personas,
          COUNT(CASE WHEN motivo_celebrar IS NULL OR motivo_celebrar = '' THEN 1 END) as sin_motivo,
          COUNT(CASE WHEN dia_celebrar IS NULL THEN 1 END) as sin_dia,
          COUNT(CASE WHEN mes_celebrar IS NULL THEN 1 END) as sin_mes,
          COUNT(CASE WHEN 
            (motivo_celebrar IS NULL OR motivo_celebrar = '') AND
            dia_celebrar IS NULL AND 
            mes_celebrar IS NULL 
          THEN 1 END) as completamente_vacio
        FROM personas
      `, { type: QueryTypes.SELECT });
      
      const stats = estadisticas[0];
      
      console.log('📊 Estadísticas:');
      console.log(`   Total personas: ${stats.total_personas}`);
      console.log(`   Sin motivo: ${stats.sin_motivo}`);
      console.log(`   Sin día: ${stats.sin_dia}`);
      console.log(`   Sin mes: ${stats.sin_mes}`);
      console.log(`   Completamente vacío: ${stats.completamente_vacio}`);
      console.log('');
      
      return stats;
      
    } catch (error) {
      console.error('❌ Error al analizar:', error);
      throw error;
    }
  }
  
  /**
   * Actualizar celebraciones desde archivo JSON de encuesta
   */
  async actualizarDesdeArchivoJSON(rutaArchivo) {
    try {
      console.log(`📂 Leyendo archivo: ${rutaArchivo}\n`);
      
      // Leer archivo JSON
      const contenido = await fs.readFile(rutaArchivo, 'utf-8');
      const encuesta = JSON.parse(contenido);
      
      if (!encuesta.miembros || !Array.isArray(encuesta.miembros)) {
        throw new Error('El archivo JSON no tiene formato válido de encuesta (falta array "miembros")');
      }
      
      console.log(`📋 Encontrados ${encuesta.miembros.length} miembros en el archivo\n`);
      
      let actualizados = 0;
      let errores = 0;
      let sinCambios = 0;
      
      for (const miembro of encuesta.miembros) {
        try {
          // Extraer datos de celebración
          const motivoCelebrar = miembro.motivoFechaCelebrar?.motivo || null;
          const diaCelebrar = miembro.motivoFechaCelebrar?.dia ? parseInt(miembro.motivoFechaCelebrar.dia) : null;
          const mesCelebrar = miembro.motivoFechaCelebrar?.mes ? parseInt(miembro.motivoFechaCelebrar.mes) : null;
          
          // Si no hay datos de celebración, saltar
          if (!motivoCelebrar && !diaCelebrar && !mesCelebrar) {
            sinCambios++;
            continue;
          }
          
          // Buscar persona por identificación
          const identificacion = miembro.numeroIdentificacion;
          
          if (!identificacion) {
            console.warn(`⚠️  Miembro sin identificación: ${miembro.primerNombre} ${miembro.primerApellido}`);
            errores++;
            continue;
          }
          
          // Actualizar persona
          const [resultado] = await sequelize.query(`
            UPDATE personas 
            SET 
              motivo_celebrar = COALESCE(:motivo, motivo_celebrar),
              dia_celebrar = COALESCE(:dia, dia_celebrar),
              mes_celebrar = COALESCE(:mes, mes_celebrar),
              updated_at = NOW()
            WHERE identificacion = :identificacion
            RETURNING id_personas, primer_nombre, primer_apellido
          `, {
            replacements: {
              motivo: motivoCelebrar,
              dia: diaCelebrar,
              mes: mesCelebrar,
              identificacion: identificacion
            },
            type: QueryTypes.UPDATE
          });
          
          if (resultado && resultado.length > 0) {
            actualizados++;
            console.log(`✅ Actualizado: ${resultado[0].primer_nombre} ${resultado[0].primer_apellido} (ID: ${identificacion})`);
            console.log(`   Motivo: "${motivoCelebrar || 'N/A'}", Día: ${diaCelebrar || 'N/A'}, Mes: ${mesCelebrar || 'N/A'}`);
          } else {
            console.warn(`⚠️  No se encontró persona con ID: ${identificacion}`);
            errores++;
          }
          
        } catch (error) {
          console.error(`❌ Error al actualizar miembro:`, error.message);
          errores++;
        }
      }
      
      console.log('\n📊 Resumen de actualización:');
      console.log(`   ✅ Actualizados: ${actualizados}`);
      console.log(`   ⚠️  Errores: ${errores}`);
      console.log(`   ⏭️  Sin cambios: ${sinCambios}`);
      console.log('');
      
      return { actualizados, errores, sinCambios };
      
    } catch (error) {
      console.error('❌ Error al actualizar desde archivo:', error);
      throw error;
    }
  }
  
  /**
   * Actualizar celebración individual por ID de persona
   */
  async actualizarCelebracionIndividual(idPersona, { motivo, dia, mes }) {
    try {
      const [resultado] = await sequelize.query(`
        UPDATE personas 
        SET 
          motivo_celebrar = :motivo,
          dia_celebrar = :dia,
          mes_celebrar = :mes,
          updated_at = NOW()
        WHERE id_personas = :id_persona
        RETURNING id_personas, primer_nombre, primer_apellido
      `, {
        replacements: {
          motivo: motivo || null,
          dia: dia ? parseInt(dia) : null,
          mes: mes ? parseInt(mes) : null,
          id_persona: idPersona
        },
        type: QueryTypes.UPDATE
      });
      
      if (resultado && resultado.length > 0) {
        console.log(`✅ Actualizada celebración para: ${resultado[0].primer_nombre} ${resultado[0].primer_apellido}`);
        return resultado[0];
      } else {
        throw new Error(`No se encontró persona con ID: ${idPersona}`);
      }
      
    } catch (error) {
      console.error('❌ Error al actualizar celebración individual:', error);
      throw error;
    }
  }
  
  /**
   * Generar reporte de personas sin celebraciones
   */
  async generarReportePersonasSinCelebraciones(limite = 50) {
    try {
      console.log(`📋 Generando reporte de personas sin celebraciones (límite: ${limite})...\n`);
      
      const personas = await sequelize.query(`
        SELECT 
          p.id_personas,
          p.identificacion,
          CONCAT(p.primer_nombre, ' ', COALESCE(p.segundo_nombre, ''), ' ', 
                 p.primer_apellido, ' ', COALESCE(p.segundo_apellido, '')) as nombre_completo,
          p.telefono,
          p.motivo_celebrar,
          p.dia_celebrar,
          p.mes_celebrar,
          f.id_familia,
          f.apellido_familiar
        FROM personas p
        LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
        WHERE (p.motivo_celebrar IS NULL OR p.motivo_celebrar = '')
          AND p.dia_celebrar IS NULL
          AND p.mes_celebrar IS NULL
        ORDER BY f.id_familia, p.primer_apellido, p.primer_nombre
        LIMIT :limite
      `, {
        replacements: { limite },
        type: QueryTypes.SELECT
      });
      
      console.log(`✅ Encontradas ${personas.length} personas sin celebraciones:\n`);
      
      personas.forEach((p, idx) => {
        console.log(`${idx + 1}. ${p.nombre_completo}`);
        console.log(`   ID Persona: ${p.id_personas} | Identificación: ${p.identificacion || 'N/A'}`);
        console.log(`   Familia: ${p.apellido_familiar || 'N/A'} (ID: ${p.id_familia || 'N/A'})`);
        console.log(`   Teléfono: ${p.telefono || 'N/A'}`);
        console.log('');
      });
      
      return personas;
      
    } catch (error) {
      console.error('❌ Error al generar reporte:', error);
      throw error;
    }
  }
}

// ============================================================================
// FUNCIONES DE EJECUCIÓN
// ============================================================================

async function ejecutarAnalisis() {
  const actualizador = new ActualizadorCelebraciones();
  
  try {
    console.log('🎯 ANÁLISIS DE CELEBRACIONES\n');
    console.log('='.repeat(60));
    console.log('');
    
    // 1. Analizar estadísticas
    await actualizador.analizarPersonasSinCelebraciones();
    
    // 2. Generar reporte
    await actualizador.generarReportePersonasSinCelebraciones(20);
    
  } catch (error) {
    console.error('❌ Error en análisis:', error);
  } finally {
    await sequelize.close();
  }
}

async function ejecutarActualizacionDesdeJSON(rutaArchivo) {
  const actualizador = new ActualizadorCelebraciones();
  
  try {
    console.log('🎯 ACTUALIZACIÓN DESDE ARCHIVO JSON\n');
    console.log('='.repeat(60));
    console.log('');
    
    // Verificar que el archivo existe
    await fs.access(rutaArchivo);
    
    // Ejecutar actualización
    const resultado = await actualizador.actualizarDesdeArchivoJSON(rutaArchivo);
    
    console.log('✅ Actualización completada exitosamente!');
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`❌ Archivo no encontrado: ${rutaArchivo}`);
      console.log('\n💡 Uso correcto:');
      console.log('   node actualizar-celebraciones.js ruta/al/archivo-encuesta.json');
    } else {
      console.error('❌ Error en actualización:', error);
    }
  } finally {
    await sequelize.close();
  }
}

async function ejecutarActualizacionIndividual(idPersona, motivo, dia, mes) {
  const actualizador = new ActualizadorCelebraciones();
  
  try {
    console.log('🎯 ACTUALIZACIÓN INDIVIDUAL\n');
    console.log('='.repeat(60));
    console.log('');
    
    await actualizador.actualizarCelebracionIndividual(idPersona, { motivo, dia, mes });
    
    console.log('\n✅ Celebración actualizada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en actualización individual:', error);
  } finally {
    await sequelize.close();
  }
}

// ============================================================================
// INTERFAZ DE LÍNEA DE COMANDOS
// ============================================================================

const args = process.argv.slice(2);
const comando = args[0];

if (!comando) {
  console.log(`
🎉 ACTUALIZADOR DE CELEBRACIONES
=================================

Uso:

  1. Analizar personas sin celebraciones:
     node actualizar-celebraciones.js analizar

  2. Actualizar desde archivo JSON de encuesta:
     node actualizar-celebraciones.js archivo <ruta-archivo.json>

  3. Actualizar celebración individual:
     node actualizar-celebraciones.js individual <id_persona> "<motivo>" <dia> <mes>
     
     Ejemplo:
     node actualizar-celebraciones.js individual 123 "Cumpleaños" 15 6

Ejemplos:
  node actualizar-celebraciones.js analizar
  node actualizar-celebraciones.js archivo ./encuestas/encuesta-familia-1.json
  node actualizar-celebraciones.js individual 5 "Cumpleaños" 25 12
  `);
  process.exit(0);
}

// Ejecutar según comando
switch (comando) {
  case 'analizar':
    ejecutarAnalisis();
    break;
    
  case 'archivo':
    if (!args[1]) {
      console.error('❌ Falta la ruta del archivo JSON');
      console.log('💡 Uso: node actualizar-celebraciones.js archivo <ruta-archivo.json>');
      process.exit(1);
    }
    ejecutarActualizacionDesdeJSON(args[1]);
    break;
    
  case 'individual':
    if (args.length < 5) {
      console.error('❌ Faltan parámetros');
      console.log('💡 Uso: node actualizar-celebraciones.js individual <id_persona> "<motivo>" <dia> <mes>');
      process.exit(1);
    }
    ejecutarActualizacionIndividual(args[1], args[2], args[3], args[4]);
    break;
    
  default:
    console.error(`❌ Comando desconocido: ${comando}`);
    console.log('💡 Comandos válidos: analizar, archivo, individual');
    process.exit(1);
}
