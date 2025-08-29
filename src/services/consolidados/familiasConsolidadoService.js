import { Persona, Familias, Sexo, Municipios, Veredas, Sector, Parroquia, DifuntosFamilia } from '../../models/index.js';
import { Op, QueryTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

class FamiliasConsolidadoService {
  /**
   * Consulta consolidada de familias y personas
   */
  async consultarFamilias(filtros = {}) {
    try {
      console.log('🔍 Iniciando consulta consolidada de familias...', filtros);
      
      const whereClausePersona = {};
      const whereClauseFamilia = {};
      
      // Obtener personas fallecidas para excluir
      const personasFallecidas = await this.obtenerPersonasFallecidas();

      // Excluir personas fallecidas
      if (personasFallecidas.length > 0) {
        whereClausePersona.identificacion = {
          [Op.notIn]: personasFallecidas
        };
      }

      // Filtrar por parroquia
      if (filtros.parroquia) {
        const parroquia = await Parroquia.findOne({
          where: { nombre: { [Op.iLike]: `%${filtros.parroquia}%` } }
        });
        if (parroquia) {
          whereClausePersona.id_parroquia = parroquia.id_parroquia;
        }
      }

      // Filtrar por municipio
      if (filtros.municipio) {
        const municipio = await Municipios.findOne({
          where: { nombre_municipio: { [Op.iLike]: `%${filtros.municipio}%` } }
        });
        if (municipio) {
          whereClauseFamilia.id_municipio = municipio.id_municipio;
        }
      }

      // Filtrar por sector
      if (filtros.sector) {
        whereClauseFamilia[Op.or] = [
          { sector: { [Op.iLike]: `%${filtros.sector}%` } },
          { '$sector_info.nombre$': { [Op.iLike]: `%${filtros.sector}%` } }
        ];
      }

      // Filtrar por sexo
      if (filtros.sexo) {
        const sexo = await Sexo.findOne({
          where: { 
            [Op.or]: [
              { descripcion: { [Op.iLike]: `%${filtros.sexo}%` } },
              { descripcion: { [Op.iLike]: filtros.sexo === 'M' ? '%masculino%' : '%femenino%' } }
            ]
          }
        });
        if (sexo) {
          whereClausePersona.id_sexo = sexo.id_sexo;
        }
      }

      // Filtrar por parentesco (inferido por sexo y edad temporalmente)
      if (filtros.parentesco) {
        if (filtros.parentesco.toLowerCase() === 'madre') {
          const sexoFemenino = await Sexo.findOne({
            where: { descripcion: { [Op.iLike]: '%femenino%' } }
          });
          if (sexoFemenino) {
            whereClausePersona.id_sexo = sexoFemenino.id_sexo;
            // Agregar filtro de edad mínima para madres (18+)
            const fechaMaxima = new Date();
            fechaMaxima.setFullYear(fechaMaxima.getFullYear() - 18);
            whereClausePersona.fecha_nacimiento = {
              [Op.lte]: fechaMaxima.toISOString().split('T')[0]
            };
          }
        } else if (filtros.parentesco.toLowerCase() === 'padre') {
          const sexoMasculino = await Sexo.findOne({
            where: { descripcion: { [Op.iLike]: '%masculino%' } }
          });
          if (sexoMasculino) {
            whereClausePersona.id_sexo = sexoMasculino.id_sexo;
            // Agregar filtro de edad mínima para padres (18+)
            const fechaMaxima = new Date();
            fechaMaxima.setFullYear(fechaMaxima.getFullYear() - 18);
            whereClausePersona.fecha_nacimiento = {
              [Op.lte]: fechaMaxima.toISOString().split('T')[0]
            };
          }
        }
      }

      // Filtrar por rango de edad
      if (filtros.edad_min || filtros.edad_max) {
        const fechaCondiciones = {};
        
        if (filtros.edad_min) {
          const fechaMaxima = new Date();
          fechaMaxima.setFullYear(fechaMaxima.getFullYear() - parseInt(filtros.edad_min));
          fechaCondiciones[Op.lte] = fechaMaxima.toISOString().split('T')[0];
        }
        
        if (filtros.edad_max) {
          const fechaMinima = new Date();
          fechaMinima.setFullYear(fechaMinima.getFullYear() - parseInt(filtros.edad_max) - 1);
          fechaCondiciones[Op.gte] = fechaMinima.toISOString().split('T')[0];
        }
        
        if (Object.keys(fechaCondiciones).length > 0) {
          whereClausePersona.fecha_nacimiento = {
            ...whereClausePersona.fecha_nacimiento,
            ...fechaCondiciones
          };
        }
      }

      // Configurar includes
      const includeClause = [
        {
          model: Familias,
          as: 'familia',
          where: Object.keys(whereClauseFamilia).length > 0 ? whereClauseFamilia : undefined,
          required: Object.keys(whereClauseFamilia).length > 0,
          include: [
            {
              model: Municipios,
              as: 'municipio',
              required: false,
              attributes: ['nombre']
            },
            {
              model: Veredas,
              as: 'vereda',
              required: false,
              attributes: ['nombre']
            },
            {
              model: Sector,
              as: 'sector_info',
              required: false,
              attributes: ['nombre']
            }
          ]
        },
        {
          model: Sexo,
          as: 'sexo',
          required: false,
          attributes: ['nombre']
        },
        {
          model: Parroquia,
          as: 'parroquia',
          required: false,
          attributes: ['nombre']
        }
      ];

      // Verificar si necesita buscar familias sin padre o madre
      let filtroEspecial = null;
      if (filtros.sinPadre === true || filtros.sinPadre === 'true') {
        filtroEspecial = 'sinPadre';
      } else if (filtros.sinMadre === true || filtros.sinMadre === 'true') {
        filtroEspecial = 'sinMadre';
      }

      let resultado = [];

      if (filtroEspecial) {
        // Consulta especial para familias sin padre o madre
        resultado = await this.consultarFamiliasSinPadreMadre(filtroEspecial, filtros);
      } else {
        // Usar consulta SQL simple para evitar problemas de asociaciones
        const limit = filtros.limite || 100;
        let whereConditions = ['1=1'];
        
        if (filtros.sexo) {
          whereConditions.push(`s.descripcion ILIKE '%${filtros.sexo}%'`);
        }
        if (filtros.municipio) {
          whereConditions.push(`m.nombre_municipio ILIKE '%${filtros.municipio}%'`);
        }
        if (filtros.parroquia) {
          whereConditions.push(`par.nombre ILIKE '%${filtros.parroquia}%'`);
        }
        if (filtros.nombre) {
          const partes = filtros.nombre.split(' ');
          partes.forEach(parte => {
            whereConditions.push(`(p.primer_nombre ILIKE '%${parte}%' OR p.segundo_nombre ILIKE '%${parte}%' OR p.primer_apellido ILIKE '%${parte}%' OR p.segundo_apellido ILIKE '%${parte}%')`);
          });
        }

        const query = `
          SELECT 
            p.id_personas,
            p.primer_nombre,
            p.segundo_nombre,
            p.primer_apellido,
            p.segundo_apellido,
            p.identificacion,
            p.telefono,
            p.fecha_nacimiento,
            p.direccion,
            p.id_familia_familias,
            p.id_sexo
          FROM personas p
          WHERE 1=1
          ORDER BY p.primer_apellido, p.primer_nombre
          LIMIT ${limit}
        `;

        console.log('🔍 Ejecutando consulta SQL:', query);
        const [personas] = await sequelize.query(query);
        
        resultado = personas.map(persona => ({
          id_personas: persona.id_personas,
          nombre: `${persona.primer_nombre || ''} ${persona.segundo_nombre || ''}`.trim(),
          apellidos: `${persona.primer_apellido || ''} ${persona.segundo_apellido || ''}`.trim(),
          identificacion: persona.identificacion,
          telefono: persona.telefono,
          fecha_nacimiento: persona.fecha_nacimiento,
          edad: persona.fecha_nacimiento ? new Date().getFullYear() - new Date(persona.fecha_nacimiento).getFullYear() : null,
          direccion: persona.direccion,
          id_familia: persona.id_familia_familias,
          id_sexo: persona.id_sexo
        }));
      }

      // Generar estadísticas si se incluyen detalles
      let estadisticas = {};
      if (filtros.incluir_detalles === true || filtros.incluir_detalles === 'true') {
        estadisticas = await this.generarEstadisticasFamilias(resultado);
      }

      return {
        exito: true,
        mensaje: "Consulta de familias exitosa",
        datos: resultado,
        total: resultado.length,
        estadisticas: Object.keys(estadisticas).length > 0 ? estadisticas : undefined,
        filtros_aplicados: filtros
      };

    } catch (error) {
      console.error('❌ Error en consulta de familias:', error);
      throw new Error(`Error al consultar familias: ${error.message}`);
    }
  }

  /**
   * Consultar familias sin padre o madre usando SQL directo simplificado
   */
  async consultarFamiliasSinPadreMadre(tipo, filtrosFamilia = {}) {
    try {
      console.log(`🔍 Consultando familias sin ${tipo} usando SQL directo...`);
      
      const sexoBuscado = tipo === 'sinPadre' ? 'masculino' : 'femenino';
      
      // Consulta SQL directa simplificada
      const query = `
        SELECT 
          f.id_familia,
          f.apellido_familiar,
          f.direccion_familia,
          f.telefono,
          f.sector,
          f.tamaño_familia,
          m.nombre_municipio as municipio,
          v.nombre as vereda,
          s.nombre as sector_nombre,
          '${tipo === 'sinPadre' ? 'Padre' : 'Madre'}' as falta
        FROM familias f
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        LEFT JOIN sectores s ON f.id_sector = s.id_sector
        GROUP BY f.id_familia, f.apellido_familiar, f.direccion_familia, f.telefono, f.sector, 
                 f.tamaño_familia, m.nombre_municipio, v.nombre, s.nombre
        HAVING COUNT(
          CASE WHEN EXISTS (
            SELECT 1 FROM personas p 
            LEFT JOIN sexos sx ON p.id_sexo = sx.id_sexo
            WHERE p.id_familia_familias = f.id_familia 
              AND sx.descripcion ILIKE '%${sexoBuscado}%'
              AND EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) >= 18
          ) THEN 1 END
        ) = 0
        ORDER BY f.apellido_familiar
        LIMIT 20
      `;

      const familiasSinPadreMadre = await sequelize.query(query, {
        type: QueryTypes.SELECT
      });

      // Obtener integrantes para cada familia
      const familiasConIntegrantes = await Promise.all(
        familiasSinPadreMadre.map(async (familia) => {
          const integrantesQuery = `
            SELECT 
              p.id_personas,
              p.primer_nombre,
              p.primer_apellido,
              p.identificacion,
              p.fecha_nacimiento,
              sx.descripcion as sexo,
              EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) as edad
            FROM personas p
            LEFT JOIN sexos sx ON p.id_sexo = sx.id_sexo
            WHERE p.id_familia_familias = $1
            ORDER BY p.fecha_nacimiento
          `;

          const integrantes = await sequelize.query(integrantesQuery, {
            type: QueryTypes.SELECT,
            bind: [familia.id_familia]
          });

          return {
            ...familia,
            integrantes: integrantes.map(persona => ({
              nombre: `${persona.primer_nombre} ${persona.primer_apellido}`,
              sexo: persona.sexo || 'No especificado',
              edad: parseInt(persona.edad),
              documento: persona.identificacion
            }))
          };
        })
      );

      console.log(`✅ Encontradas ${familiasConIntegrantes.length} familias sin ${tipo === 'sinPadre' ? 'padre' : 'madre'}`);

      return familiasConIntegrantes;

    } catch (error) {
      console.error(`❌ Error consultando familias sin ${tipo}:`, error);
      throw new Error(`Error al consultar familias sin ${tipo}: ${error.message}`);
    }
  }

  /**
   * Formatear resultado de personas en formato estándar
   */
  formatearResultadoPersonas(personas) {
    return personas.map(persona => {
      const edad = this.calcularEdad(persona.fecha_nacimiento);
      const parentesco = this.inferirParentesco(persona.sexo?.nombre, edad);
      
      return {
        id_persona: persona.id_personas,
        documento: persona.identificacion,
        nombre: `${persona.primer_nombre} ${persona.segundo_nombre || ''} ${persona.primer_apellido} ${persona.segundo_apellido || ''}`.trim(),
        sexo: persona.sexo?.nombre || 'No especificado',
        edad: edad,
        fecha_nacimiento: persona.fecha_nacimiento,
        telefono: persona.telefono || persona.familia?.telefono || 'No especificado',
        parentesco: parentesco,
        apellido_familiar: persona.familia?.apellido_familiar || 'No especificado',
        direccion: persona.direccion || persona.familia?.direccion_familia || 'No especificado',
        parroquia: persona.parroquia?.nombre || 'No especificado',
        municipio: persona.familia?.municipio?.nombre || 'No especificado',
        sector: persona.familia?.sector || persona.familia?.sector_info?.nombre || 'No especificado',
        vereda: persona.familia?.vereda?.nombre || 'No especificado',
        familia: {
          id_familia: persona.familia?.id_familia,
          apellido_familiar: persona.familia?.apellido_familiar,
          tipo_vivienda: persona.familia?.tipo_vivienda,
          tamaño_familia: persona.familia?.tamaño_familia
        }
      };
    });
  }

  /**
   * Obtener lista de identificaciones de personas fallecidas
   */
  async obtenerPersonasFallecidas() {
    try {
      const difuntos = await DifuntosFamilia.findAll({
        attributes: ['nombre_completo'],
        raw: true
      });

      if (difuntos.length === 0) return [];

      const nombresDifuntos = difuntos.map(d => d.nombre_completo);
      
      const personasConNombresSimilares = await Persona.findAll({
        attributes: ['identificacion'],
        where: {
          [Op.or]: nombresDifuntos.map(nombre => {
            const partesNombre = nombre.split(' ');
            return {
              [Op.and]: partesNombre.map(parte => ({
                [Op.or]: [
                  { primer_nombre: { [Op.iLike]: `%${parte}%` } },
                  { segundo_nombre: { [Op.iLike]: `%${parte}%` } },
                  { primer_apellido: { [Op.iLike]: `%${parte}%` } },
                  { segundo_apellido: { [Op.iLike]: `%${parte}%` } }
                ]
              }))
            };
          })
        },
        raw: true
      });

      return personasConNombresSimilares.map(p => p.identificacion);

    } catch (error) {
      console.error('Error obteniendo personas fallecidas:', error);
      return [];
    }
  }

  /**
   * Inferir parentesco basado en sexo y edad
   */
  inferirParentesco(sexo, edad) {
    if (!sexo || !edad) return 'No especificado';
    
    const sexoLower = sexo.toLowerCase();
    
    if (edad >= 18) {
      if (sexoLower.includes('femenino') || sexoLower.includes('mujer')) {
        return edad >= 40 ? 'Madre' : 'Adulta';
      } else if (sexoLower.includes('masculino') || sexoLower.includes('hombre')) {
        return edad >= 40 ? 'Padre' : 'Adulto';
      }
    } else {
      return sexoLower.includes('femenino') ? 'Hija' : 'Hijo';
    }
    
    return 'Familiar';
  }

  /**
   * Calcular edad a partir de fecha de nacimiento
   */
  calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return 'No especificada';
    
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getMonth();
    
    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }

  /**
   * Generar estadísticas de familias
   */
  async generarEstadisticasFamilias(datos) {
    try {
      const estadisticas = {
        total_personas: datos.length,
        por_sexo: {},
        por_parentesco: {},
        por_municipio: {},
        por_sector: {},
        distribucion_edades: {
          '0-18': 0,
          '19-35': 0,
          '36-60': 0,
          '60+': 0
        }
      };

      datos.forEach(persona => {
        // Por sexo
        const sexo = persona.sexo;
        estadisticas.por_sexo[sexo] = (estadisticas.por_sexo[sexo] || 0) + 1;

        // Por parentesco
        const parentesco = persona.parentesco;
        estadisticas.por_parentesco[parentesco] = (estadisticas.por_parentesco[parentesco] || 0) + 1;

        // Por municipio
        const municipio = persona.municipio;
        if (municipio !== 'No especificado') {
          estadisticas.por_municipio[municipio] = (estadisticas.por_municipio[municipio] || 0) + 1;
        }

        // Por sector
        const sector = persona.sector;
        if (sector !== 'No especificado') {
          estadisticas.por_sector[sector] = (estadisticas.por_sector[sector] || 0) + 1;
        }

        // Distribución por edades
        const edad = persona.edad;
        if (typeof edad === 'number') {
          if (edad <= 18) {
            estadisticas.distribucion_edades['0-18']++;
          } else if (edad <= 35) {
            estadisticas.distribucion_edades['19-35']++;
          } else if (edad <= 60) {
            estadisticas.distribucion_edades['36-60']++;
          } else {
            estadisticas.distribucion_edades['60+']++;
          }
        }
      });

      return estadisticas;

    } catch (error) {
      console.error('Error generando estadísticas:', error);
      return {};
    }
  }
}

export default new FamiliasConsolidadoService();
