import { Op, QueryTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';
import { 
  Familias, 
  Persona, 
  Sexo, 
  Municipios, 
  DifuntosFamilia 
} from '../models/index.js';

/**
 * Servicio para consultas avanzadas de familias
 * Incluye toda la información completa como el request original
 */
class FamiliasConsultasService {

  /**
   * Consulta completa de familias con toda la información estructurada igual al request original
   */
  async consultarFamiliasCompletas(filtros = {}) {
    try {
      console.log('🔍 Consultando familias con información completa...');
      
      const whereClauseFamilia = {};
      
      if (filtros.apellido_familiar) {
        whereClauseFamilia.apellido_familiar = { [Op.iLike]: `%${filtros.apellido_familiar}%` };
      }

      if (filtros.sector) {
        whereClauseFamilia.sector = { [Op.iLike]: `%${filtros.sector}%` };
      }

      // Obtener familias básicas
      const familias = await Familias.findAll({
        where: whereClauseFamilia,
        order: [['apellido_familiar', 'ASC']],
        limit: filtros.limite || 50
      });

      // Para cada familia, obtener toda la información completa
      const familiasCompletas = await Promise.all(
        familias.map(async (familia) => {
          // Obtener personas vivas de la familia
          const familyMembers = await sequelize.query(`
            SELECT 
              p.id_personas,
              p.primer_nombre,
              p.segundo_nombre,
              p.primer_apellido,
              p.segundo_apellido,
              p.identificacion,
              p.telefono,
              p.correo_electronico,
              p.fecha_nacimiento,
              p.direccion,
              p.estudios,
              p.talla_camisa,
              p.talla_pantalon,
              p.talla_zapato,
              p.id_sexo,
              p.id_tipo_identificacion_tipo_identificacion,
              p.id_estado_civil_estado_civil,
              s.id_sexo as sexo_id,
              s.descripcion as sexo_descripcion,
              ti.id_tipo_identificacion as tipo_id_id,
              ti.nombre as tipo_id_nombre,
              ti.codigo as tipo_id_codigo
            FROM personas p
            LEFT JOIN sexos s ON p.id_sexo = s.id_sexo
            LEFT JOIN tipos_identificacion ti ON p.id_tipo_identificacion_tipo_identificacion = ti.id_tipo_identificacion
            WHERE p.id_familia_familias = :familiaId 
          `, {
            replacements: { familiaId: familia.id_familia },
            type: QueryTypes.SELECT
          });

          // Obtener personas fallecidas (usar información directa de difuntos_familia)
          const deceasedMembers = await sequelize.query(`
            SELECT 
              df.id_difunto,
              df.nombre_completo,
              df.fecha_fallecimiento,
              df.observaciones
            FROM difuntos_familia df
            WHERE df.id_familia_familias = :familiaId
          `, {
            replacements: { familiaId: familia.id_familia },
            type: QueryTypes.SELECT
          });

          // Obtener información de municipio
          let municipioInfo = null;
          if (familia.id_municipio) {
            const municipio = await Municipios.findByPk(familia.id_municipio);
            if (municipio) {
              municipioInfo = {
                id: municipio.id_municipio,
                nombre: municipio.nombre_municipio
              };
            }
          }

          // Obtener información de disposición de basuras
          const disposicionBasuras = await sequelize.query(`
            SELECT 
              tdb.id_tipo_disposicion_basura as id,
              tdb.nombre,
              tdb.descripcion
            FROM familia_disposicion_basura fdb
            JOIN tipos_disposicion_basura tdb ON fdb.id_tipo_disposicion_basura = tdb.id_tipo_disposicion_basura
            WHERE fdb.id_familia = :familiaId
          `, {
            replacements: { familiaId: familia.id_familia },
            type: QueryTypes.SELECT
          });

          // Obtener información de sistema de acueducto
          const sistemasAcueducto = await sequelize.query(`
            SELECT 
              sa.id_sistema_acueducto as id,
              sa.nombre,
              sa.descripcion
            FROM familia_sistema_acueducto fsa
            JOIN sistemas_acueducto sa ON fsa.id_sistema_acueducto = sa.id_sistema_acueducto
            WHERE fsa.id_familia = :familiaId
          `, {
            replacements: { familiaId: familia.id_familia },
            type: QueryTypes.SELECT
          });

          // Formatear familyMembers con estructura completa
          const familyMembersFormateados = familyMembers.map(persona => ({
            nombres: `${persona.primer_nombre || ''} ${persona.segundo_nombre || ''}`.trim(),
            numeroIdentificacion: persona.identificacion,
            tipoIdentificacion: persona.tipo_id_id ? {
              id: persona.tipo_id_id,
              nombre: persona.tipo_id_nombre,
              codigo: persona.tipo_id_codigo
            } : null,
            fechaNacimiento: persona.fecha_nacimiento,
            sexo: persona.sexo_id ? {
              id: persona.sexo_id,
              nombre: persona.sexo_descripcion
            } : null,
            telefono: persona.telefono,
            situacionCivil: persona.id_estado_civil_estado_civil ? {
              id: persona.id_estado_civil_estado_civil
            } : null,
            estudio: {
              nombre: persona.estudios || 'No especificado'
            },
            "talla_camisa/blusa": persona.talla_camisa,
            talla_pantalon: persona.talla_pantalon,
            talla_zapato: persona.talla_zapato,
            motivoFechaCelebrar: {
              motivo: "Cumpleaños",
              dia: persona.fecha_nacimiento ? new Date(persona.fecha_nacimiento).getDate().toString().padStart(2, '0') : "01",
              mes: persona.fecha_nacimiento ? (new Date(persona.fecha_nacimiento).getMonth() + 1).toString().padStart(2, '0') : "01"
            }
          }));

          // Formatear deceasedMembers
          const deceasedMembersFormateados = deceasedMembers.map(difunto => ({
            nombres: difunto.nombre_completo || 'No especificado',
            fechaFallecimiento: difunto.fecha_fallecimiento,
            sexo: null, // Los difuntos no tienen sexo en esta tabla
            causaFallecimiento: difunto.observaciones || 'No especificada'
          }));

          // Estructura completa igual al request original
          return {
            id_encuesta: familia.id_familia,
            informacionGeneral: {
              municipio: municipioInfo,
              parroquia: null, // Se puede expandir luego
              sector: {
                nombre: familia.sector
              },
              vereda: null, // Se puede expandir luego
              fecha: familia.fecha_ultima_encuesta,
              apellido_familiar: familia.apellido_familiar,
              direccion: familia.direccion_familia,
              telefono: familia.telefono,
              numero_contrato_epm: null, // Campo adicional
              comunionEnCasa: familia.comunionEnCasa || false
            },
            vivienda: {
              tipo_vivienda: {
                nombre: familia.tipo_vivienda
              },
              disposicion_basuras: {
                recolector: disposicionBasuras.some(d => d.nombre?.toLowerCase().includes('recolect')),
                quemada: disposicionBasuras.some(d => d.nombre?.toLowerCase().includes('quem')),
                enterrada: disposicionBasuras.some(d => d.nombre?.toLowerCase().includes('enterr')),
                recicla: disposicionBasuras.some(d => d.nombre?.toLowerCase().includes('recicl')),
                aire_libre: disposicionBasuras.some(d => d.nombre?.toLowerCase().includes('aire')),
                no_aplica: disposicionBasuras.some(d => d.nombre?.toLowerCase().includes('otro'))
              }
            },
            servicios_agua: {
              sistema_acueducto: sistemasAcueducto.length > 0 ? {
                id: sistemasAcueducto[0].id,
                nombre: sistemasAcueducto[0].nombre
              } : null,
              aguas_residuales: null, // Se puede expandir
              pozo_septico: false,
              letrina: false,
              campo_abierto: false
            },
            observaciones: {
              sustento_familia: null, // Campo adicional
              observaciones_encuestador: null, // Campo adicional
              autorizacion_datos: true
            },
            familyMembers: familyMembersFormateados,
            deceasedMembers: deceasedMembersFormateados,
            metadata: {
              timestamp: familia.fecha_ultima_encuesta || new Date().toISOString(),
              completed: familia.estado_encuesta === 'completed',
              currentStage: 6,
              total_miembros: familyMembersFormateados.length,
              total_fallecidos: deceasedMembersFormateados.length
            }
          };
        })
      );

      return {
        exito: true,
        mensaje: `Se encontraron ${familiasCompletas.length} familias con información completa`,
        datos: familiasCompletas,
        total: familiasCompletas.length,
        filtros_aplicados: filtros,
        nota: 'Consulta completa con toda la información estructurada igual al request original'
      };

    } catch (error) {
      console.error('❌ Error en consulta completa de familias:', error);
      throw new Error(`Error al consultar familias completas: ${error.message}`);
    }
  }

  /**
   * Consulta general de familias con información de padres y madres
   * Redirige a la función completa que preserva toda la estructura
   */
  async consultarFamiliasConPadresMadres(filtros = {}) {
    try {
      console.log('🔍 Redirigiendo a consulta completa de familias...');
      
      // Usar la función que preserva toda la estructura del request
      return await this.consultarFamiliasCompletas(filtros);

    } catch (error) {
      console.error('❌ Error en consultarFamiliasConPadresMadres:', error);
      throw new Error(`Error al consultar familias: ${error.message}`);
    }
  }

  /**
   * Obtener lista de personas fallecidas para excluir de consultas
   */
  async obtenerPersonasFallecidas() {
    try {
      const difuntos = await DifuntosFamilia.findAll({
        attributes: ['id_persona']
      });

      return difuntos.map(d => d.id_persona);
    } catch (error) {
      console.error('Error obteniendo personas fallecidas:', error);
      return [];
    }
  }

  /**
   * Consultar por Madres - Mantener compatibilidad
   */
  async consultarPorMadres(filtros = {}) {
    try {
      // Usar el método completo pero filtrar solo madres
      const familias = await this.consultarFamiliasCompletas(filtros);
      
      // Extraer solo las madres de todas las familias
      const madres = [];
      
      familias.datos.forEach(familia => {
        familia.familyMembers?.forEach(persona => {
          if (persona.sexo?.nombre?.toLowerCase().includes('femenino') ||
              persona.sexo?.nombre?.toLowerCase().includes('mujer') ||
              persona.sexo?.nombre?.toLowerCase().includes('f')) {
            madres.push({
              ...persona,
              familia_info: {
                id_familia: familia.id_encuesta,
                apellido_familiar: familia.informacionGeneral.apellido_familiar,
                sector: familia.informacionGeneral.sector?.nombre,
                municipio: familia.informacionGeneral.municipio?.nombre
              }
            });
          }
        });
      });

      return {
        exito: true,
        mensaje: `Se encontraron ${madres.length} madres`,
        datos: madres,
        total: madres.length,
        filtros_aplicados: filtros
      };

    } catch (error) {
      console.error('❌ Error en consulta de madres:', error);
      throw new Error(`Error al consultar madres: ${error.message}`);
    }
  }

  /**
   * Consultar por Padres - Mantener compatibilidad
   */
  async consultarPorPadres(filtros = {}) {
    try {
      // Usar el método completo pero filtrar solo padres
      const familias = await this.consultarFamiliasCompletas(filtros);
      
      // Extraer solo los padres de todas las familias
      const padres = [];
      
      familias.datos.forEach(familia => {
        familia.familyMembers?.forEach(persona => {
          if (persona.sexo?.nombre?.toLowerCase().includes('masculino') ||
              persona.sexo?.nombre?.toLowerCase().includes('hombre') ||
              persona.sexo?.nombre?.toLowerCase().includes('m')) {
            padres.push({
              ...persona,
              familia_info: {
                id_familia: familia.id_encuesta,
                apellido_familiar: familia.informacionGeneral.apellido_familiar,
                sector: familia.informacionGeneral.sector?.nombre,
                municipio: familia.informacionGeneral.municipio?.nombre
              }
            });
          }
        });
      });

      return {
        exito: true,
        mensaje: `Se encontraron ${padres.length} padres`,
        datos: padres,
        total: padres.length,
        filtros_aplicados: filtros
      };

    } catch (error) {
      console.error('❌ Error en consulta de padres:', error);
      throw new Error(`Error al consultar padres: ${error.message}`);
    }
  }
}

export default new FamiliasConsultasService();
