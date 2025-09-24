import { QueryTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

class FamiliasConsolidadoService {
  
  async consultarFamilias(filtros = {}) {
    try {
      console.log('🔍 Consultando familias consolidadas...', filtros);
      
      const limite = filtros.limite || 5;
      const offset = filtros.offset || 0;
      
      // Build WHERE conditions dynamically
      const whereConditions = ['f.id_familia IS NOT NULL'];
      const bindParams = [];
      let paramIndex = 1;
      
      if (filtros.id_parroquia) {
        whereConditions.push(`f.id_parroquia = $${paramIndex}`);
        bindParams.push(filtros.id_parroquia);
        paramIndex++;
      }
      
      if (filtros.id_municipio) {
        whereConditions.push(`f.id_municipio = $${paramIndex}`);
        bindParams.push(filtros.id_municipio);
        paramIndex++;
      }
      
      if (filtros.id_sector) {
        whereConditions.push(`f.id_sector = $${paramIndex}`);
        bindParams.push(filtros.id_sector);
        paramIndex++;
      }
      
      if (filtros.id_vereda) {
        whereConditions.push(`f.id_vereda = $${paramIndex}`);
        bindParams.push(filtros.id_vereda);
        paramIndex++;
      }
      
      // Add limite and offset to bind params
      bindParams.push(limite, offset);
      
      // Enhanced query with geographic data and filters
      const query = `
        SELECT 
          f.id_familia,
          f.codigo_familia,
          f.apellido_familiar,
          f.direccion_familia,
          f.telefono,
          p.nombre as parroquia_nombre,
          mun.nombre_municipio as municipio_nombre,
          dep.nombre as departamento_nombre,
          sec.nombre as sector_nombre,
          ver.nombre as vereda_nombre
        FROM familias f
        LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia  
        LEFT JOIN municipios mun ON f.id_municipio = mun.id_municipio
        LEFT JOIN departamentos dep ON mun.id_departamento = dep.id_departamento
        LEFT JOIN sectores sec ON f.id_sector = sec.id_sector
        LEFT JOIN veredas ver ON f.id_vereda = ver.id_vereda
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY f.apellido_familiar
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      const familias = await sequelize.query(query, {
        bind: bindParams,
        type: QueryTypes.SELECT
      });
      
      // Formatear respuesta básica
      const datosFormateados = familias.map(familia => ({
        id_familia: familia.id_familia.toString(),
        codigo_familia: familia.codigo_familia || '',
        apellido_familiar: familia.apellido_familiar,
        direccion_familia: familia.direccion_familia,
        telefono: familia.telefono,
        parroquia_nombre: familia.parroquia_nombre,
        municipio_nombre: familia.municipio_nombre,
        departamento_nombre: familia.departamento_nombre,
        sector_nombre: familia.sector_nombre,
        vereda_nombre: familia.vereda_nombre,
        tipo_vivienda: 'No especificado',
        dispocision_basura: 'No especificado',
        tipos_agua_residuales: 'No especificado',
        sistema_acueducto: 'No especificado',
        miembros_familia: [],
        difuntos_familia: []
      }));
      
      // Now enhance each family with member and housing data
      const familiasCompletas = [];
      for (const familia of datosFormateados) {
        const miembros = await this.obtenerMiembrosFamilia(familia.id_familia);
        const difuntos = await this.obtenerDifuntosFamilia(familia.id_familia);
        const infoVivienda = await this.obtenerInfoVivienda(familia.id_familia);
        
        familiasCompletas.push({
          ...familia,
          ...infoVivienda,
          miembros_familia: miembros,
          difuntos_familia: difuntos
        });
      }
      
      return {
        exito: true,
        mensaje: 'Consulta consolidada de familias exitosa',
        datos: familiasCompletas
      };
      
    } catch (error) {
      console.error('❌ Error en consultarFamilias:', error);
      throw new Error(`Error al consultar familias consolidadas: ${error.message}`);
    }
  }

  async obtenerMiembrosFamilia(idFamilia) {
    try {
        const query = `
        SELECT
          -- ID para consultar destrezas
          p.id_personas,
          
          -- Identificación
          COALESCE(ti.descripcion, 'Cédula') as tipo_identificacion,
          p.identificacion as numero_identificacion,
          
          -- Información personal
          TRIM(CONCAT(
            COALESCE(p.primer_nombre, ''), ' ',
            COALESCE(p.segundo_nombre, ''), ' ', 
            COALESCE(p.primer_apellido, ''), ' ',
            COALESCE(p.segundo_apellido, '')
          )) as nombre_completo,
          p.telefono as telefono_personal,
          p.correo_electronico as email_personal,
          TO_CHAR(p.fecha_nacimiento, 'YYYY-MM-DD') as fecha_nacimiento,
          EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.fecha_nacimiento))::INTEGER as edad,
          
          -- Información demográfica
          COALESCE(s.nombre, 'No especificado') as sexo,
          COALESCE(par.nombre, 'Familiar') as parentesco,
          COALESCE(ec.descripcion, 'No especificado') as situacion_civil,
          
          -- Información educativa y laboral
          COALESCE(p.estudios, '') as estudios,
          COALESCE(prof.nombre, 'No especificado') as profesion,
          COALESCE(cc.nombre, 'No especificado') as comunidad_cultural,
          COALESCE(p.necesidad_enfermo, '') as enfermedades,
          COALESCE(p.en_que_eres_lider, '') as liderazgo,
          
          -- Tallas
          COALESCE(p.talla_camisa, '') as talla_camisa,
          COALESCE(p.talla_pantalon, '') as talla_pantalon,
          COALESCE(p.talla_zapato, '') as talla_zapato,
          
          -- Celebraciones
          COALESCE(p.motivo_celebrar, '') as motivo_celebrar,
          p.dia_celebrar,
          p.mes_celebrar
          
        FROM personas p
        LEFT JOIN tipo_identificacion ti ON p.id_tipo_identificacion_tipo_identificacion = ti.id_tipo_identificacion
        LEFT JOIN sexos s ON p.id_sexo = s.id_sexo
        LEFT JOIN parentescos par ON p.id_parentesco = par.id_parentesco
        LEFT JOIN estados_civiles ec ON p.id_estado_civil_estado_civil = ec.id_estado
        LEFT JOIN profesiones prof ON p.id_profesion = prof.id_profesion
        LEFT JOIN comunidades_culturales cc ON p.id_comunidad_cultural = cc.id_comunidad_cultural
        WHERE p.id_familia_familias = $1
        ORDER BY 
          CASE 
            WHEN COALESCE(par.nombre, 'Familiar') LIKE '%Padre%' THEN 1
            WHEN COALESCE(par.nombre, 'Familiar') LIKE '%Madre%' THEN 2
            ELSE 3
          END,
          p.fecha_nacimiento DESC
      `;
      
      const miembros = await sequelize.query(query, {
        bind: [idFamilia],
        type: QueryTypes.SELECT
      });
      
      const miembrosConDestrezas = await Promise.all(
        miembros.map(async (miembro) => {
          const destrezas = await this.obtenerDestrezasPersona(miembro.id_personas);
          
          return {
            tipo_identificacio: miembro.tipo_identificacion,
            numero_identificacion: miembro.numero_identificacion || '',
            nombre_completo: miembro.nombre_completo,
            telefono_personal: miembro.telefono_personal || '',
            email_personal: miembro.email_personal || '',
            fecha_nacimiento: miembro.fecha_nacimiento,
            edad: miembro.edad,
            sexo: miembro.sexo,
            parentesco: miembro.parentesco,
            situacion_civil: miembro.situacion_civil,
            estudios: miembro.estudios,
            profesion: miembro.profesion,
            comunidad_cultural: miembro.comunidad_cultural,
            enfermedades: miembro.enfermedades,
            liderazgo: miembro.liderazgo,
            destrezas: destrezas.length > 0 ? destrezas.join(', ') : '',
            necesidades_enfermo: miembro.enfermedades, // mismo que enfermedades
            comunion_casa: true,
            tallas: {
              camisa_blusa: miembro.talla_camisa,
              pantalon: miembro.talla_pantalon,
              calzado: miembro.talla_zapato
            },
            celebracion: {
              motivo: miembro.motivo_celebrar,
              dia: miembro.dia_celebrar ? miembro.dia_celebrar.toString() : '',
              mes: this.obtenerNombreMes(miembro.mes_celebrar) || ''
            }
          };
        })
      );
      
      return miembrosConDestrezas;
      
    } catch (error) {
      console.error('❌ Error en obtenerMiembrosFamilia:', error);
      return [];
    }
  }

  async obtenerDestrezasPersona(idPersona) {
    try {
      const query = `
        SELECT d.nombre
        FROM persona_destreza pd
        JOIN destrezas d ON pd.id_destrezas_destrezas = d.id_destreza
        WHERE pd.id_personas_personas = $1
      `;
      
      const destrezas = await sequelize.query(query, {
        bind: [idPersona],
        type: QueryTypes.SELECT
      });
      
      return destrezas.map(d => d.nombre);
      
    } catch (error) {
      console.error('❌ Error en obtenerDestrezasPersona:', error);
      return [];
    }
  }

  async obtenerDifuntosFamilia(idFamilia) {
    try {
      const query = `
        SELECT 
          df.nombre_completo as nombre_difunto,
          TO_CHAR(df.fecha_fallecimiento, 'YYYY-MM-DD') as fecha_fallecimiento,
          COALESCE(s.nombre, 'No especificado') as sexo,
          COALESCE(par.nombre, 'No especificado') as parentesco,
          df.causa_fallecimiento
        FROM difuntos_familia df
        LEFT JOIN sexos s ON df.id_sexo = s.id_sexo
        LEFT JOIN parentescos par ON df.id_parentesco = par.id_parentesco
        WHERE df.id_familia_familias = $1
        ORDER BY df.fecha_fallecimiento DESC
      `;
      
      const difuntos = await sequelize.query(query, {
        bind: [idFamilia],
        type: QueryTypes.SELECT
      });
      
      return difuntos.map(difunto => ({
        nombre_difunto: difunto.nombre_difunto,
        fecha_fallecimiento: difunto.fecha_fallecimiento,
        sexo: difunto.sexo,
        parentesco: difunto.parentesco,
        causa_fallecimiento: difunto.causa_fallecimiento || 'natural'
      }));
      
    } catch (error) {
      console.error('❌ Error en obtenerDifuntosFamilia:', error);
      return [];
    }
  }

  async obtenerInfoVivienda(idFamilia) {
    try {
      // 1. Obtener tipo de vivienda
      const queryVivienda = `
        SELECT 
          COALESCE(
            tv1.nombre, 
            tv2.nombre, 
            CASE 
              WHEN f.tipo_vivienda IS NOT NULL THEN f.tipo_vivienda
              ELSE 'No especificado'
            END
          ) as tipo_vivienda
        FROM familias f
        LEFT JOIN tipos_vivienda tv1 ON f.id_tipo_vivienda = tv1.id_tipo_vivienda
        LEFT JOIN tipos_vivienda tv2 ON f.tipo_vivienda::text = tv2.id_tipo_vivienda::text
        WHERE f.id_familia = $1
      `;
      
      const [infoVivienda] = await sequelize.query(queryVivienda, {
        bind: [idFamilia],
        type: QueryTypes.SELECT
      });

      // 2. Obtener disposición de basura (puede ser múltiple)
      const queryBasura = `
        SELECT tdb.nombre
        FROM familia_disposicion_basura fdb
        JOIN tipos_disposicion_basura tdb ON fdb.id_tipo_disposicion_basura = tdb.id_tipo_disposicion_basura
        WHERE fdb.id_familia = $1
      `;
      
      const disposicionBasura = await sequelize.query(queryBasura, {
        bind: [idFamilia],
        type: QueryTypes.SELECT
      });

      // 3. Obtener sistema de aguas residuales
      const queryAguasResiduales = `
        SELECT tar.nombre
        FROM familia_sistema_aguas_residuales fsar
        JOIN tipos_aguas_residuales tar ON fsar.id_tipo_aguas_residuales = tar.id_tipo_aguas_residuales
        WHERE fsar.id_familia = $1
      `;
      
      const aguasResiduales = await sequelize.query(queryAguasResiduales, {
        bind: [idFamilia],
        type: QueryTypes.SELECT
      });

      // 4. Obtener sistema de acueducto
      const queryAcueducto = `
        SELECT sa.nombre
        FROM familia_sistema_acueducto fsa
        JOIN sistemas_acueducto sa ON fsa.id_sistema_acueducto = sa.id_sistema_acueducto
        WHERE fsa.id_familia = $1
      `;
      
      const sistemaAcueducto = await sequelize.query(queryAcueducto, {
        bind: [idFamilia],
        type: QueryTypes.SELECT
      });
      
      return {
        tipo_vivienda: infoVivienda?.tipo_vivienda || 'No especificado',
        dispocision_basura: disposicionBasura.length > 0 
          ? disposicionBasura.map(d => d.nombre).join(', ') 
          : 'No especificado',
        tipos_agua_residuales: aguasResiduales.length > 0 
          ? aguasResiduales.map(a => a.nombre).join(', ') 
          : 'No especificado',
        sistema_acueducto: sistemaAcueducto.length > 0 
          ? sistemaAcueducto.map(s => s.nombre).join(', ') 
          : 'No especificado'
      };
      
    } catch (error) {
      console.error('❌ Error en obtenerInfoVivienda:', error);
      return {
        tipo_vivienda: 'No especificado',
        dispocision_basura: 'No especificado',
        tipos_agua_residuales: 'No especificado',
        sistema_acueducto: 'No especificado'
      };
    }
  }

  obtenerNombreMes(numeroMes) {
    const meses = {
      1: 'enero', 2: 'febrero', 3: 'marzo', 4: 'abril',
      5: 'mayo', 6: 'junio', 7: 'julio', 8: 'agosto', 
      9: 'septiembre', 10: 'octubre', 11: 'noviembre', 12: 'diciembre'
    };
    return meses[numeroMes] || '';
  }
}

export default new FamiliasConsolidadoService();