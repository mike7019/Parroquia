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
          ORDER BY f.id, p.id`
    console.log("📋 SQL Query Completed, executing...");
    const [familias] = await sequelize.query(query);
    console.log(`✅ Found ${familias.length} family records`);

    // Agrupar información adicional de salud y educación
    console.log("🔍 Adding health and education data...");
    for (let familia of familias) {
      // Obtener enfermedades del jefe y cónyuge
      if (familia.jefe_id) {
        const enfermedadesJefe = await sequelize.query(`
          SELECT e.descripcion 
          FROM enfermedades e
          INNER JOIN enfermedades_personas ep ON e.id = ep.enfermedad_id
          WHERE ep.persona_id = :jefeId
        `, { 
          replacements: { jefeId: familia.jefe_id },
          type: sequelize.QueryTypes.SELECT 
        });
        familia.enfermedades_jefe = enfermedadesJefe.map(e => e.descripcion).join(', ');
      }

      if (familia.conyuge_id) {
        const enfermedadesConyuge = await sequelize.query(`
          SELECT e.descripcion 
          FROM enfermedades e
          INNER JOIN enfermedades_personas ep ON e.id = ep.enfermedad_id
          WHERE ep.persona_id = :conyugeId
        `, { 
          replacements: { conyugeId: familia.conyuge_id },
          type: sequelize.QueryTypes.SELECT 
        });
        familia.enfermedades_conyuge = enfermedadesConyuge.map(e => e.descripcion).join(', ');
      }

      // Obtener destrezas familiares
      const destrezasFamilia = await sequelize.query(`
        SELECT DISTINCT d.descripcion 
        FROM destrezas d
        INNER JOIN destrezas_personas dp ON d.id = dp.destreza_id
        INNER JOIN personas p ON dp.persona_id = p.id
        WHERE p.familia_id = :familiaId
      `, { 
        replacements: { familiaId: familia.id },
        type: sequelize.QueryTypes.SELECT 
      });
      familia.destrezas_familia = destrezasFamilia.map(d => d.descripcion).join(', ');
    }

    return familias;
  } catch (error) {
    console.error('❌ Error obteniendo familias agrupadas:', error);
    throw error;
  }
}

  /**
   * Generar Excel con datos familiares completos agrupados
   */
  async formatearDatosParaExcelCompleto(familias) {
    try {
      console.log('📊 Formateando datos para Excel completo...');
      
      return familias.map(familia => ({
        'ID Familia': familia.id,
        'Jefe de Familia': familia.jefe_nombre,
        'Cédula Jefe': familia.jefe_cedula,
        'Edad Jefe': familia.jefe_edad,
        'Ocupación Jefe': familia.jefe_ocupacion,
        'Estado Civil Jefe': familia.jefe_estado_civil,
        'Nivel Educativo Jefe': familia.jefe_nivel_educativo,
        'Enfermedades Jefe': familia.enfermedades_jefe || 'Ninguna',
        
        'Cónyuge': familia.conyuge_nombre || 'N/A',
        'Cédula Cónyuge': familia.conyuge_cedula || 'N/A',
        'Edad Cónyuge': familia.conyuge_edad || 'N/A',
        'Ocupación Cónyuge': familia.conyuge_ocupacion || 'N/A',
        'Estado Civil Cónyuge': familia.conyuge_estado_civil || 'N/A',
        'Nivel Educativo Cónyuge': familia.conyuge_nivel_educativo || 'N/A',
        'Enfermedades Cónyuge': familia.enfermedades_conyuge || 'Ninguna',
        
        'Total Hijos': familia.total_hijos,
        'Hijos Vivos': familia.hijos_vivos,
        'Hijos Menores 18': familia.hijos_menores_18,
        'Hijos Mayores 18': familia.hijos_mayores_18,
        'Lista Hijos': familia.nombres_hijos,
        
        'Miembros Fallecidos': familia.total_difuntos,
        'Nombres Difuntos': familia.nombres_difuntos || 'Ninguno',
        
        'Destrezas Familia': familia.destrezas_familia || 'Ninguna',
        'Departamento': familia.departamento,
        'Municipio': familia.municipio,
        'Parroquia': familia.parroquia,
        'Vereda': familia.vereda,
        'Sector': familia.sector,
        'Dirección': familia.direccion,
        
        'Total Miembros': familia.total_miembros,
        'Teléfono Contacto': familia.telefono_contacto,
        'Observaciones': familia.observaciones || ''
      }));
      
    } catch (error) {
      console.error('❌ Error al formatear datos para Excel completo:', error);
      throw error;
    }
  }

  /**
   * Obtener encabezados para Excel completo
   */
  obtenerEncabezadosExcelCompleto() {
    return [
      'ID Familia', 'Jefe de Familia', 'Cédula Jefe', 'Edad Jefe', 'Ocupación Jefe',
      'Estado Civil Jefe', 'Nivel Educativo Jefe', 'Enfermedades Jefe',
      'Cónyuge', 'Cédula Cónyuge', 'Edad Cónyuge', 'Ocupación Cónyuge',
      'Estado Civil Cónyuge', 'Nivel Educativo Cónyuge', 'Enfermedades Cónyuge',
      'Total Hijos', 'Hijos Vivos', 'Hijos Menores 18', 'Hijos Mayores 18', 'Lista Hijos',
      'Miembros Fallecidos', 'Nombres Difuntos', 'Destrezas Familia',
      'Departamento', 'Municipio', 'Parroquia', 'Vereda', 'Sector', 'Dirección',
      'Total Miembros', 'Teléfono Contacto', 'Observaciones'
    ];
  }

  async consultarFamilias(filtros = {}) {
    try {
      let resultado = [];
      const limite = parseInt(filtros.limite) || 50;
      const pagina = parseInt(filtros.pagina) || 1;
      const offset = (pagina - 1) * limite;

      // Consulta SQL actualizada para la funcionalidad original
      const query = `
          SELECT DISTINCT
            p.id as id_personas,
            p.primer_nombre,
            p.segundo_nombre,
            p.primer_apellido,
            p.segundo_apellido,
            p.identificacion,
            p.telefono,
            p.fecha_nacimiento,
            p.direccion,
            f.id as id_familia_familias,
            p.id_sexo
          FROM personas p
          LEFT JOIN familias f ON p.familia_id = f.id
          WHERE p.id IS NOT NULL
          ORDER BY p.id
          LIMIT ${limite}
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

  // ========================================================================
  // CONSULTA DE FAMILIAS AGRUPADAS COMPLETA
  // ========================================================================

  /**
   * Obtener familias agrupadas con información completa
   * Agrupa personas por familia e incluye padre, madre, hijos, difuntos y datos detallados
   * @param {Object} filtros - Filtros para la consulta
   * @returns {Object} Familias agrupadas con información completa
   */
  async obtenerFamiliasAgrupadas(filtros = {}) {
    try {
      console.log('🏠 Obteniendo familias agrupadas con información completa...', filtros);

      const limit = filtros.limite || 100;
      let whereConditions = ['f.id_familia IS NOT NULL'];
      let joinConditions = '';
      
      // Construir filtros dinámicos
      if (filtros.municipio) {
        joinConditions += ' LEFT JOIN municipios m ON f.id_municipio = m.id_municipio';
        whereConditions.push(`m.nombre_municipio ILIKE '%${filtros.municipio}%'`);
      }
      
      if (filtros.parroquia) {
        joinConditions += ' LEFT JOIN parroquia par ON p.id_parroquia = par.id_parroquia';
        whereConditions.push(`par.nombre ILIKE '%${filtros.parroquia}%'`);
      }
      
      if (filtros.sector) {
        joinConditions += ' LEFT JOIN sector s ON f.id_sector = s.id_sector';
        whereConditions.push(`(f.sector ILIKE '%${filtros.sector}%' OR s.nombre ILIKE '%${filtros.sector}%')`);
      }

      // Consulta principal para obtener familias con información completa
      const queryFamilias = `
        WITH familias_base AS (
          SELECT DISTINCT
            f.id_familia,
            f.apellido_familiar,
            f.direccion_familia,
            f.telefono,
            f.email,
            f.sector as sector_nombre,
            f.tipo_vivienda,
            f.observaciones,
            f.comunionEnCasa,
            f.numero_contrato_epm,
            
            -- Información geográfica
            m.nombre_municipio,
            par.nombre as nombre_parroquia,
            v.nombre as nombre_vereda,
            s.nombre as nombre_sector_completo
            
          FROM familias f
          LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
          LEFT JOIN personas p ON f.id_familia = p.id_familia_familias
          LEFT JOIN parroquia par ON p.id_parroquia = par.id_parroquia
          LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
          LEFT JOIN sector s ON f.id_sector = s.id_sector
          ${joinConditions}
          WHERE ${whereConditions.join(' AND ')}
        ),
        
        miembros_familia AS (
          SELECT 
            p.id_familia_familias as id_familia,
            p.id_personas,
            p.primer_nombre,
            p.segundo_nombre,
            p.primer_apellido,
            p.segundo_apellido,
            p.identificacion,
            p.telefono as telefono_personal,
            p.fecha_nacimiento,
            p.direccion as direccion_personal,
            p.ocupacion,
            p.estado_civil,
            p.email as email_personal,
            
            -- Calcular edad
            EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.fecha_nacimiento)) as edad,
            
            -- Información de sexo
            sx.descripcion as sexo,
            
            -- Inferir parentesco básico por edad y sexo
            CASE 
              WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.fecha_nacimiento)) >= 18 
                   AND sx.descripcion ILIKE '%femenino%' THEN 'Madre'
              WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.fecha_nacimiento)) >= 18 
                   AND sx.descripcion ILIKE '%masculino%' THEN 'Padre'
              WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.fecha_nacimiento)) < 18 
                   AND sx.descripcion ILIKE '%femenino%' THEN 'Hija'
              WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.fecha_nacimiento)) < 18 
                   AND sx.descripcion ILIKE '%masculino%' THEN 'Hijo'
              ELSE 'Familiar'
            END as parentesco_inferido
            
          FROM personas p
          LEFT JOIN sexo sx ON p.id_sexo = sx.id_sexo
          WHERE p.id_familia_familias IN (SELECT id_familia FROM familias_base)
            AND p.identificacion NOT IN (
              SELECT COALESCE(nombre_completo, '') 
              FROM difuntos_familia 
              WHERE nombre_completo IS NOT NULL AND nombre_completo != ''
            )
        ),
        
        difuntos_por_familia AS (
          SELECT 
            f.id_familia,
            df.nombre_completo as nombre_difunto,
            df.fecha_fallecimiento,
            df.parentesco_inferido as parentesco_difunto
          FROM familias_base f
          LEFT JOIN difuntos_familia df ON df.id_familia = f.id_familia
          WHERE df.nombre_completo IS NOT NULL
        )
        
        SELECT 
          fb.*,
          
          -- Información del padre
          padre.primer_nombre || ' ' || COALESCE(padre.segundo_nombre, '') || ' ' || 
          padre.primer_apellido || ' ' || COALESCE(padre.segundo_apellido, '') as nombre_completo_padre,
          padre.identificacion as documento_padre,
          padre.telefono_personal as telefono_padre,
          padre.ocupacion as ocupacion_padre,
          padre.edad as edad_padre,
          padre.estado_civil as estado_civil_padre,
          padre.email_personal as email_padre,
          
          -- Información de la madre
          madre.primer_nombre || ' ' || COALESCE(madre.segundo_nombre, '') || ' ' || 
          madre.primer_apellido || ' ' || COALESCE(madre.segundo_apellido, '') as nombre_completo_madre,
          madre.identificacion as documento_madre,
          madre.telefono_personal as telefono_madre,
          madre.ocupacion as ocupacion_madre,
          madre.edad as edad_madre,
          madre.estado_civil as estado_civil_madre,
          madre.email_personal as email_madre,
          
          -- Estadísticas de familia
          (SELECT COUNT(*) FROM miembros_familia mf WHERE mf.id_familia = fb.id_familia) as total_miembros,
          (SELECT COUNT(*) FROM miembros_familia mf WHERE mf.id_familia = fb.id_familia AND mf.parentesco_inferido IN ('Hijo', 'Hija')) as total_hijos,
          (SELECT COUNT(*) FROM difuntos_por_familia dpf WHERE dpf.id_familia = fb.id_familia) as total_difuntos,
          
          -- Información de difuntos (concatenada)
          (SELECT STRING_AGG(nombre_difunto || ' (' || COALESCE(parentesco_difunto, 'Sin especificar') || ')', '; ')
           FROM difuntos_por_familia dpf WHERE dpf.id_familia = fb.id_familia) as difuntos_info
          
        FROM familias_base fb
        
        -- JOIN para obtener información del padre
        LEFT JOIN (
          SELECT DISTINCT ON (id_familia) *
          FROM miembros_familia 
          WHERE parentesco_inferido = 'Padre'
          ORDER BY id_familia, edad DESC
        ) padre ON padre.id_familia = fb.id_familia
        
        -- JOIN para obtener información de la madre
        LEFT JOIN (
          SELECT DISTINCT ON (id_familia) *
          FROM miembros_familia 
          WHERE parentesco_inferido = 'Madre'
          ORDER BY id_familia, edad DESC
        ) madre ON madre.id_familia = fb.id_familia
        
        ORDER BY fb.apellido_familiar, fb.id_familia
        LIMIT ${limit}
      `;

      console.log('🔍 Ejecutando consulta de familias agrupadas...');
      const [familias] = await sequelize.query(queryFamilias);

      console.log(`✅ Familias agrupadas obtenidas: ${familias.length}`);
      
      return {
        exito: true,
        mensaje: `Se encontraron ${familias.length} familias agrupadas`,
        datos: familias,
        total: familias.length,
        tipo_consulta: 'familias_agrupadas'
      };

    } catch (error) {
      console.error('❌ Error obteniendo familias agrupadas:', error);
      throw error;
    }
  }

  // ========================================================================
  // GENERACIÓN DE REPORTES EN EXCEL
  // ========================================================================

  /**
   * Generar reporte Excel completo con familias agrupadas
   * @param {Object} filtros - Filtros para la consulta
   * @returns {Object} Información del archivo Excel generado
   */
  async generarReporteExcelCompleto(filtros = {}) {
    try {
      console.log('📊 Generando reporte Excel completo de familias agrupadas...', filtros);

      // PASO 1: Obtener familias agrupadas con información completa
      const resultado = await this.obtenerFamiliasAgrupadas(filtros);
      
      if (!resultado.exito || !resultado.datos?.length) {
        console.log('⚠️ No hay datos de familias para generar Excel');
        return {
          exito: false,
          mensaje: 'No se encontraron familias para generar el reporte',
          archivo: null
        };
      }

      // PASO 2: Formatear datos para Excel completo
      const datosFormateados = await this.formatearDatosParaExcelCompleto(resultado.datos);
      const encabezados = this.obtenerEncabezadosExcelCompleto();

      // PASO 3: Generar archivo Excel usando ExcelJS
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      
      // Metadatos del workbook
      workbook.creator = 'Sistema Parroquial';
      workbook.lastModifiedBy = 'Sistema Parroquial';
      workbook.created = new Date();
      workbook.modified = new Date();

      // HOJA 1: Familias Completas
      const worksheet = workbook.addWorksheet('Familias Completas', {
        properties: { tabColor: { argb: 'FF4F81BD' } }
      });

      // Configurar encabezados con estilo
      worksheet.columns = encabezados.map(header => ({
        header: header,
        key: header.toLowerCase().replace(/\s+/g, '_'),
        width: header.length > 15 ? 25 : 15
      }));

      // Estilo de encabezados
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF366092' }
        };
        cell.font = {
          color: { argb: 'FFFFFFFF' },
          bold: true,
          size: 11
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
        cell.border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' }
        };
      });

      // Añadir datos con formateo
      datosFormateados.forEach((familia, index) => {
        const row = worksheet.addRow(familia);
        
        // Aplicar estilo alternado a las filas
        if (index % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF2F2F2' }
            };
          });
        }
        
        // Formatear celdas numéricas
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' }, bottom: { style: 'thin' },
            left: { style: 'thin' }, right: { style: 'thin' }
          };
          
          // Alineación según el tipo de dato
          if (typeof cell.value === 'number') {
            cell.alignment = { horizontal: 'center' };
          } else {
            cell.alignment = { horizontal: 'left', vertical: 'top' };
          }
        });
      });

      // HOJA 2: Resumen estadístico
      const statsWorksheet = workbook.addWorksheet('Estadísticas', {
        properties: { tabColor: { argb: 'FF70AD47' } }
      });

      const stats = this.generarEstadisticasFamiliasCompletas(resultado.datos);
      
      statsWorksheet.addRow(['ESTADÍSTICAS FAMILIARES']);
      statsWorksheet.addRow(['']);
      statsWorksheet.addRow(['Total de Familias:', resultado.total]);
      statsWorksheet.addRow(['Familias con Padre:', stats.familias_con_padre]);
      statsWorksheet.addRow(['Familias con Madre:', stats.familias_con_madre]);
      statsWorksheet.addRow(['Familias Completas (Padre y Madre):', stats.familias_completas]);
      statsWorksheet.addRow(['Familias Monoparentales:', stats.familias_monoparentales]);
      statsWorksheet.addRow(['Total de Hijos:', stats.total_hijos]);
      statsWorksheet.addRow(['Total de Difuntos:', stats.total_difuntos]);
      statsWorksheet.addRow(['']);
      statsWorksheet.addRow(['Promedio de Miembros por Familia:', stats.promedio_miembros.toFixed(2)]);
      statsWorksheet.addRow(['Promedio de Hijos por Familia:', stats.promedio_hijos.toFixed(2)]);

      // Estilo para la hoja de estadísticas
      statsWorksheet.getColumn(1).width = 35;
      statsWorksheet.getColumn(2).width = 15;
      
      const statsHeaderCell = statsWorksheet.getCell('A1');
      statsHeaderCell.font = { bold: true, size: 14, color: { argb: 'FF70AD47' } };

      // Generar buffer del archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const nombreArchivo = `familias_completas_${timestamp}.xlsx`;

      console.log(`✅ Reporte Excel completo generado: ${nombreArchivo}`);

      return {
        exito: true,
        mensaje: `Reporte Excel generado exitosamente con ${resultado.total} familias`,
        archivo: {
          buffer: buffer,
          nombre: nombreArchivo,
          tipo: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        estadisticas: stats,
        total_registros: resultado.total
      };

    } catch (error) {
      console.error('❌ Error generando reporte Excel completo:', error);
      throw new Error(`Error al generar reporte Excel completo: ${error.message}`);
    }
  }

  /**
   * Generar estadísticas para familias completas
   */
  generarEstadisticasFamiliasCompletas(familias) {
    const stats = {
      familias_con_padre: 0,
      familias_con_madre: 0,
      familias_completas: 0,
      familias_monoparentales: 0,
      total_hijos: 0,
      total_difuntos: 0,
      total_miembros: 0
    };

    familias.forEach(familia => {
      const tienePadre = familia.nombre_completo_padre && familia.nombre_completo_padre.trim() !== '';
      const tieneMadre = familia.nombre_completo_madre && familia.nombre_completo_madre.trim() !== '';
      
      if (tienePadre) stats.familias_con_padre++;
      if (tieneMadre) stats.familias_con_madre++;
      if (tienePadre && tieneMadre) stats.familias_completas++;
      if ((tienePadre && !tieneMadre) || (!tienePadre && tieneMadre)) stats.familias_monoparentales++;
      
      stats.total_hijos += parseInt(familia.total_hijos) || 0;
      stats.total_difuntos += parseInt(familia.total_difuntos) || 0;
      stats.total_miembros += parseInt(familia.total_miembros) || 0;
    });

    stats.promedio_miembros = familias.length > 0 ? stats.total_miembros / familias.length : 0;
    stats.promedio_hijos = familias.length > 0 ? stats.total_hijos / familias.length : 0;

    return stats;
  }

  /**
   * Generar reporte de familias en formato Excel (versión original)
   * Utiliza la misma función base que la consulta JSON para garantizar consistencia
   * @param {Object} filtros - Filtros para la consulta (mismo formato que consultarFamilias)
   * @returns {Object} Información del archivo Excel generado
   */
  async generarReporteExcel(filtros = {}) {
    try {
      console.log('📊 Generando reporte Excel de familias...', filtros);

      // PASO 1: Usar la función base para obtener los datos (igual que JSON)
      const resultado = await this.consultarFamilias(filtros);

      // PASO 2: Preparar datos para Excel
      const datosExcel = this.formatearDatosParaExcel(resultado.datos);
      
      // PASO 3: Generar metadatos del reporte
      const metadatos = {
        total_registros: resultado.total,
        fecha_generacion: new Date().toISOString(),
        filtros_aplicados: filtros,
        estadisticas: resultado.estadisticas || {},
        hay_datos: resultado.total > 0
      };

      console.log(`✅ Datos preparados para Excel: ${resultado.total} registros`);

      return {
        datos: datosExcel,
        metadatos,
        encabezados: this.obtenerEncabezadosExcel(),
        tiene_datos: resultado.total > 0
      };

    } catch (error) {
      console.error('❌ Error generando reporte Excel:', error);
      throw error;
    }
  }

  /**
   * Formatear datos de personas para exportación a Excel
   * Trabaja con la estructura real que devuelve consultarFamilias (personas individuales)
   * @param {Array} personas - Array de personas individuales
   * @returns {Array} Array de objetos formateados para Excel
   */
  formatearDatosParaExcel(personas) {
    return personas.map((persona, index) => ({
      'No.': index + 1,
      'Nombre Completo': `${persona.nombre || ''} ${persona.apellidos || ''}`.trim() || 'Sin nombre',
      'Documento': persona.identificacion || '',
      'Teléfono': persona.telefono || '',
      'Edad': persona.edad || 'No especificada',
      'Fecha Nacimiento': persona.fecha_nacimiento ? new Date(persona.fecha_nacimiento).toLocaleDateString('es-ES') : '',
      'Sexo': persona.sexo || 'No especificado',
      'Parentesco': persona.parentesco || 'No especificado',
      'Dirección': persona.direccion || '',
      'ID Familia': persona.id_familia || persona.id_familia_familias || '',
      'Apellido Familiar': persona.apellido_familiar || '',
      'Municipio': persona.municipio || 'No especificado',
      'Parroquia': persona.parroquia || 'No especificado',
      'Sector': persona.sector || 'No especificado',
      'Observaciones': persona.observaciones || ''
    }));
  }

  /**
   * Obtener encabezados para el archivo Excel
   * Corresponden exactamente con los campos de formatearDatosParaExcel()
   * @returns {Array} Array de nombres de columnas
   */
  obtenerEncabezadosExcel() {
    return [
      'No.',
      'Nombre Completo',
      'Documento',
      'Teléfono',
      'Edad',
      'Fecha Nacimiento',
      'Sexo',
      'Parentesco',
      'Dirección',
      'ID Familia',
      'Apellido Familiar',
      'Municipio',
      'Parroquia',
      'Sector',
      'Observaciones'
    ];
  }

  /**
   * Generar nombre de archivo Excel con timestamp y filtros
   * @param {Object} filtros - Filtros aplicados
   * @returns {string} Nombre del archivo
   */
  generarNombreArchivoExcel(filtros = {}) {
    const fecha = new Date();
    const timestamp = fecha.toISOString().slice(0, 19).replace(/[:.]/g, '-');
    
    let sufijo = '';
    if (filtros.apellido_familiar) sufijo += `_${filtros.apellido_familiar.replace(/\s+/g, '_')}`;
    if (filtros.sector) sufijo += `_${filtros.sector.replace(/\s+/g, '_')}`;
    if (filtros.municipio) sufijo += `_${filtros.municipio.replace(/\s+/g, '_')}`;
    
    return `reporte_familias${sufijo}_${timestamp}.xlsx`;
  }
}

export default new FamiliasConsolidadoService();
