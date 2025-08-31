import { Op, QueryTypes } from 'sequelize';
import { db } from '../config/database.js';

const { 
  Familias, 
  Persona, 
  Sexo, 
  Municipios, 
  DifuntosFamilia, 
  sequelize 
} = db;

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
            LEFT JOIN difuntos_familia df ON p.id_personas = df.id_persona
            WHERE p.id_familia_familias = :familiaId 
              AND df.id_persona IS NULL
          `, {
            replacements: { familiaId: familia.id_familia },
            type: QueryTypes.SELECT
          });

          // Obtener personas fallecidas
          const deceasedMembers = await sequelize.query(`
            SELECT 
              p.id_personas,
              p.primer_nombre,
              p.segundo_nombre,
              p.primer_apellido,
              p.segundo_apellido,
              p.identificacion,
              p.estudios,
              p.id_sexo,
              s.descripcion as sexo_descripcion,
              df.fecha_fallecimiento,
              df.causa_fallecimiento
            FROM personas p
            LEFT JOIN sexos s ON p.id_sexo = s.id_sexo
            INNER JOIN difuntos_familia df ON p.id_personas = df.id_persona
            WHERE p.id_familia_familias = :familiaId
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
          const deceasedMembersFormateados = deceasedMembers.map(persona => ({
            nombres: `${persona.primer_nombre || ''} ${persona.segundo_nombre || ''}`.trim(),
            fechaFallecimiento: persona.fecha_fallecimiento,
            sexo: persona.sexo_id ? {
              id: persona.sexo_id,
              nombre: persona.sexo_descripcion
            } : null,
            causaFallecimiento: persona.causa_fallecimiento || 'No especificada'
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
   */
  async consultarFamiliasConPadresMadres(filtros = {}) {
    try {
      console.log('🔍 Consultando familias con información completa...');
      
      const whereClauseFamilia = {};
      
      if (filtros.apellido_familiar) {
        whereClauseFamilia.apellido_familiar = { [Op.iLike]: `%${filtros.apellido_familiar}%` };
      }

      if (filtros.sector) {
        whereClauseFamilia.sector = { [Op.iLike]: `%${filtros.sector}%` };
      }

      const familias = await Familias.findAll({
        where: whereClauseFamilia,
        include: [
          {
            model: Persona,
            as: 'personas',
            required: false,
            include: [
              {
                model: Sexo,
                as: 'sexo',
                attributes: ['descripcion']
              }
            ]
          },
          {
            model: Municipios,
            as: 'municipio',
            attributes: ['nombre_municipio'],
            required: false
          }
        ],
        order: [['apellido_familiar', 'ASC']],
        limit: filtros.limite || 50
      });

      const resultado = familias.map(familia => {
        // Filtrar personas vivas (excluir fallecidos)
        const personasVivas = familia.personas?.filter(p => 
          !p.identificacion?.startsWith('FALLECIDO')
        ) || [];

        // Separar por género
        const padres = personasVivas.filter(p => 
          p.sexo?.descripcion?.toLowerCase().includes('masculino') ||
          p.sexo?.descripcion?.toLowerCase().includes('hombre') ||
          p.sexo?.descripcion?.toLowerCase().includes('m')
        );

        const madres = personasVivas.filter(p => 
          p.sexo?.descripcion?.toLowerCase().includes('femenino') ||
          p.sexo?.descripcion?.toLowerCase().includes('mujer') ||
          p.sexo?.descripcion?.toLowerCase().includes('f')
        );

        return {
          // Información de la familia
          id_familia: familia.id_familia,
          apellido_familiar: familia.apellido_familiar || 'Sin apellido',
          sector: familia.sector || 'Sin sector',
          direccion_familia: familia.direccion_familia || 'Sin dirección',
          telefono: familia.telefono || familia.numero_contacto || 'Sin teléfono',
          email: familia.email || 'Sin email',
          tamaño_familia: familia.tamaño_familia || personasVivas.length,
          tipo_vivienda: familia.tipo_vivienda || 'No especificado',
          municipio: familia.municipio?.nombre_municipio || 'Sin municipio',
          estado_encuesta: familia.estado_encuesta || 'Pendiente',
          
          // Conteos
          total_personas: personasVivas.length,
          total_padres: padres.length,
          total_madres: madres.length,
          
          // Información detallada de padres
          padres: padres.map(p => ({
            id_persona: p.id_personas,
            nombre_completo: `${p.primer_nombre || ''} ${p.segundo_nombre || ''} ${p.primer_apellido || ''} ${p.segundo_apellido || ''}`.trim(),
            primer_nombre: p.primer_nombre,
            segundo_nombre: p.segundo_nombre,
            primer_apellido: p.primer_apellido,
            segundo_apellido: p.segundo_apellido,
            identificacion: p.identificacion || 'Sin documento',
            telefono: p.telefono || 'Sin teléfono',
            correo_electronico: p.correo_electronico || 'Sin correo',
            fecha_nacimiento: p.fecha_nacimiento,
            direccion: p.direccion || 'Sin dirección',
            estudios: p.estudios || 'No especificado'
          })),
          
          // Información detallada de madres
          madres: madres.map(p => ({
            id_persona: p.id_personas,
            nombre_completo: `${p.primer_nombre || ''} ${p.segundo_nombre || ''} ${p.primer_apellido || ''} ${p.segundo_apellido || ''}`.trim(),
            primer_nombre: p.primer_nombre,
            segundo_nombre: p.segundo_nombre,
            primer_apellido: p.primer_apellido,
            segundo_apellido: p.segundo_apellido,
            identificacion: p.identificacion || 'Sin documento',
            telefono: p.telefono || 'Sin teléfono',
            correo_electronico: p.correo_electronico || 'Sin correo',
            fecha_nacimiento: p.fecha_nacimiento,
            direccion: p.direccion || 'Sin dirección',
            estudios: p.estudios || 'No especificado'
          })),

          // Fecha de consulta
          fecha_consulta: new Date().toISOString()
        };
      });

      console.log(`✅ Consulta completada: ${resultado.length} familias encontradas`);
      
      return {
        exito: true,
        mensaje: `Se encontraron ${resultado.length} familias con padres y madres`,
        datos: resultado,
        total: resultado.length,
        filtros_aplicados: filtros,
        fecha_consulta: new Date().toISOString()
      };

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

export default FamiliasConsultasService;
