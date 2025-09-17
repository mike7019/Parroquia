import { Persona, Familias, Sexo, Municipios, Veredas, Sector, Parroquia, DifuntosFamilia } from '../../models/index.js';
import { Op, QueryTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';
import ExcelJS from 'exceljs';

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

  /**
   * NUEVO MÉTODO: Obtener familias agrupadas para reportes completos
   * Implementado según diseño del notebook: diseño-opcion-b-familias-completas.ipynb
   */
  async obtenerFamiliasAgrupadas(filtros = {}) {
    try {
      console.log('🏠 Obteniendo familias agrupadas con filtros:', filtros);
      
      // Query SQL optimizada basada en la estructura real de la BD
      const sqlQuery = `
        WITH familias_base AS (
          -- Paso 1: Obtener familias únicas con su ubicación geográfica
          SELECT DISTINCT 
            f.id_familia,
            f.codigo_familia,
            f.apellido_familiar,
            -- Información geográfica directa de la familia
            p.nombre as parroquia_nombre,
            mun.nombre_municipio as municipio_nombre,
            dep.nombre as departamento_nombre,
            sec.nombre as sector_nombre,
            ver.nombre as vereda_nombre
          FROM familias f
          LEFT JOIN parroquias p ON f.id_parroquia = p.id_parroquia  
          LEFT JOIN municipios mun ON f.id_municipio = mun.id_municipio
          LEFT JOIN departamentos dep ON mun.id_departamento = dep.id_departamento
          LEFT JOIN sectores sec ON f.id_sector = sec.id_sector
          LEFT JOIN veredas ver ON f.id_vereda = ver.id_vereda
          WHERE f.id_familia IS NOT NULL
          ${filtros.parroquia ? 'AND p.nombre ILIKE :parroquia' : ''}
          ${filtros.municipio ? 'AND mun.nombre_municipio ILIKE :municipio' : ''}
          ${filtros.sector ? 'AND sec.nombre ILIKE :sector' : ''}
          ORDER BY f.codigo_familia
          LIMIT :limite OFFSET :offset
        ),

        miembros_completos AS (
          -- Paso 2: Obtener todos los miembros con sus datos completos
          SELECT 
            p.id_familia_familias as familia_id,
            p.id_personas as persona_id,
            p.primer_nombre,
            p.segundo_nombre,
            p.primer_apellido,
            p.segundo_apellido,
            CONCAT(
              COALESCE(p.primer_nombre, ''), ' ',
              COALESCE(p.segundo_nombre, ''), ' ', 
              COALESCE(p.primer_apellido, ''), ' ',
              COALESCE(p.segundo_apellido, '')
            ) as nombre_completo,
            p.identificacion as cedula,
            p.telefono,
            p.correo_electronico as email,
            p.fecha_nacimiento,
            EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) as edad,
            p.estudios,
            p.en_que_eres_lider as destrezas,
            p.necesidad_enfermo as salud,
            
            -- Determinar si es difunto
            CASE WHEN df.id_difunto IS NOT NULL THEN true ELSE false END as es_difunto,
            df.fecha_fallecimiento as fecha_defuncion,
            df.causa_fallecimiento as causa_muerte,
            df.observaciones as observaciones_difunto,
            
            -- Clasificar tipo de miembro (por ahora todos como 'miembro' hasta tener más datos)
            CASE 
              WHEN p.id_parentesco = 1 THEN 'padre'
              WHEN p.id_parentesco = 2 THEN 'madre' 
              WHEN p.id_parentesco = 3 THEN 'hijo'
              ELSE 'miembro'  -- Cambiar a 'miembro' para incluir en estadísticas
            END as tipo_miembro,
            
            -- Calcular si es menor
            CASE 
              WHEN EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) < 18 THEN true
              ELSE false
            END as es_menor
            
          FROM personas p
          LEFT JOIN difuntos_familia df ON p.id_personas = df.id_difunto 
          WHERE p.id_familia_familias IS NOT NULL
        )

        -- Consulta final: Combinar familias con sus miembros
        SELECT 
          fb.*,
          json_agg(
            json_build_object(
              'persona_id', mc.persona_id,
              'nombre_completo', TRIM(mc.nombre_completo),
              'cedula', mc.cedula,
              'telefono', mc.telefono,
              'email', mc.email,
              'edad', mc.edad,
              'salud', mc.salud,
              'destrezas', mc.destrezas,
              'tipo_miembro', mc.tipo_miembro,
              'es_difunto', mc.es_difunto,
              'es_menor', mc.es_menor,
              'fecha_defuncion', mc.fecha_defuncion,
              'causa_muerte', mc.causa_muerte,
              'observaciones_difunto', mc.observaciones_difunto
            )
          ) as miembros
        FROM familias_base fb
        LEFT JOIN miembros_completos mc ON fb.id_familia = mc.familia_id
        GROUP BY 
          fb.id_familia, fb.codigo_familia, fb.apellido_familiar,
          fb.parroquia_nombre, fb.municipio_nombre, fb.departamento_nombre, 
          fb.sector_nombre, fb.vereda_nombre
        ORDER BY fb.codigo_familia;
      `;

      const familiasBrutos = await sequelize.query(sqlQuery, {
        type: QueryTypes.SELECT,
        replacements: {
          parroquia: filtros.parroquia ? `%${filtros.parroquia}%` : null,
          municipio: filtros.municipio ? `%${filtros.municipio}%` : null, 
          sector: filtros.sector ? `%${filtros.sector}%` : null,
          limite: filtros.limite || 50,
          offset: filtros.offset || 0
        }
      });
      
      // Procesar y estructurar los datos
      const familiasEstructuradas = familiasBrutos.map(familia => {
        return this.estructurarFamiliaCompleta(familia);
      });
      
      console.log(`✅ Procesadas ${familiasEstructuradas.length} familias agrupadas`);
      
      return {
        familias: familiasEstructuradas,
        total: familiasEstructuradas.length,
        filtros_aplicados: filtros
      };
      
    } catch (error) {
      console.error('Error en obtenerFamiliasAgrupadas:', error);
      throw new Error(`Error al obtener familias agrupadas: ${error.message}`);
    }
  }

  /**
   * FUNCIÓN AUXILIAR: Estructurar familia completa según diseño del notebook
   */
  estructurarFamiliaCompleta(familiaRaw) {
    const miembros = familiaRaw.miembros || [];
    
    // Separar miembros por categorías
    const padres = miembros.filter(m => m.tipo_miembro === 'padre' && !m.es_difunto);
    const madres = miembros.filter(m => m.tipo_miembro === 'madre' && !m.es_difunto);
    const hijos_vivos = miembros.filter(m => m.tipo_miembro === 'hijo' && !m.es_difunto);
    const otros_miembros = miembros.filter(m => m.tipo_miembro === 'miembro' && !m.es_difunto);
    const difuntos = miembros.filter(m => m.es_difunto);
    
    // Calcular estadísticas
    const estadisticas = {
      total_miembros: miembros.length,
      total_vivos: miembros.filter(m => !m.es_difunto).length,
      total_difuntos: difuntos.length,
      total_menores: miembros.filter(m => !m.es_difunto && m.es_menor).length,
      total_adultos: miembros.filter(m => !m.es_difunto && !m.es_menor).length,
      tiene_telefono: miembros.some(m => m.telefono && m.telefono.trim() !== ''),
      tiene_email: miembros.some(m => m.email && m.email.trim() !== '')
    };
    
    // Generar resumen pastoral
    const resumen_pastoral = {
      necesidades_salud: miembros
        .filter(m => m.salud && m.salud.trim() !== '' && !m.es_difunto)
        .map(m => m.salud),
      destrezas_disponibles: miembros
        .filter(m => m.destrezas && m.destrezas.trim() !== '' && !m.es_difunto)
        .map(m => m.destrezas),
      observaciones_generales: miembros
        .filter(m => m.observaciones_difunto && m.observaciones_difunto.trim() !== '')
        .map(m => m.observaciones_difunto).join('; ')
    };
    
    return {
      familia_id: familiaRaw.id_familia,
      codigo_familia: familiaRaw.codigo_familia || `FAM-${familiaRaw.id_familia}`,
      apellido_familiar: familiaRaw.apellido_familiar,
      ubicacion: {
        parroquia: familiaRaw.parroquia_nombre,
        municipio: familiaRaw.municipio_nombre,
        departamento: familiaRaw.departamento_nombre,
        sector: familiaRaw.sector_nombre,
        vereda: familiaRaw.vereda_nombre
      },
      miembros: {
        padres,
        madres, 
        hijos_vivos,
        otros_miembros,
        difuntos
      },
      estadisticas,
      resumen_pastoral
    };
  }

  /**
   * NUEVO MÉTODO: Generar reporte Excel familiar completo
   * Implementado según diseño del notebook con 5 hojas profesionales
   */
  async generarReporteExcelFamiliar(filtros = {}) {
    const workbook = new ExcelJS.Workbook();
    
    // Configuración general del workbook
    workbook.creator = 'Sistema Parroquial';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.subject = 'Reporte Familiar Consolidado';
    
    try {
      console.log('📊 Generando reporte Excel familiar con filtros:', filtros);
      
      // 1. Obtener datos agrupados por familias
      const datosFamiliares = await this.obtenerFamiliasAgrupadas(filtros);
      console.log(`📋 Procesando ${datosFamiliares.familias.length} familias para Excel`);
      
      // 2. HOJA 1: RESUMEN FAMILIAR
      await this.crearHojaResumenFamiliar(workbook, datosFamiliares.familias);
      
      // 3. HOJA 2: DETALLE POR FAMILIA  
      await this.crearHojaDetalleFamiliar(workbook, datosFamiliares.familias);
      
      // 4. HOJA 3: ESTADÍSTICAS GENERALES
      await this.crearHojaEstadisticas(workbook, datosFamiliares.familias);
      
      // 5. HOJA 4: DIFUNTOS POR FAMILIA
      await this.crearHojaDifuntos(workbook, datosFamiliares.familias);
      
      // 6. HOJA 5: NECESIDADES PASTORALES
      await this.crearHojaNecesidadesPastorales(workbook, datosFamiliares.familias);
      
      console.log('✅ Excel familiar generado exitosamente');
      return workbook;
      
    } catch (error) {
      console.error('Error generando Excel familiar:', error);
      throw new Error(`Error en generación de Excel: ${error.message}`);
    }
  }

  /**
   * HOJA 1: RESUMEN FAMILIAR
   */
  async crearHojaResumenFamiliar(workbook, familias) {
    const hoja = workbook.addWorksheet('Resumen Familiar');
    
    // Configurar columnas
    hoja.columns = [
      { header: 'Código Familia', key: 'codigo', width: 20 },
      { header: 'Apellido Familiar', key: 'apellido', width: 25 },
      { header: 'Parroquia', key: 'parroquia', width: 20 },
      { header: 'Municipio', key: 'municipio', width: 20 },
      { header: 'Sector', key: 'sector', width: 15 },
      { header: 'Vereda', key: 'vereda', width: 15 },
      { header: 'Total Miembros', key: 'total_miembros', width: 15 },
      { header: 'Vivos', key: 'vivos', width: 10 },
      { header: 'Difuntos', key: 'difuntos', width: 10 },
      { header: 'Menores', key: 'menores', width: 10 },
      { header: 'Adultos', key: 'adultos', width: 10 },
      { header: 'Padres', key: 'padres', width: 10 },
      { header: 'Madres', key: 'madres', width: 10 },
      { header: 'Hijos', key: 'hijos', width: 10 },
      { header: 'Otros', key: 'otros', width: 10 },
      { header: 'Tiene Teléfono', key: 'telefono', width: 12 },
      { header: 'Tiene Email', key: 'email', width: 12 }
    ];
    
    // Agregar datos
    familias.forEach(familia => {
      hoja.addRow({
        codigo: familia.codigo_familia,
        apellido: familia.apellido_familiar,
        parroquia: familia.ubicacion.parroquia,
        municipio: familia.ubicacion.municipio,
        sector: familia.ubicacion.sector,
        vereda: familia.ubicacion.vereda,
        total_miembros: familia.estadisticas.total_miembros,
        vivos: familia.estadisticas.total_vivos,
        difuntos: familia.estadisticas.total_difuntos,
        menores: familia.estadisticas.total_menores,
        adultos: familia.estadisticas.total_adultos,
        padres: familia.miembros.padres.length,
        madres: familia.miembros.madres.length,
        hijos: familia.miembros.hijos_vivos.length,
        otros: familia.miembros.otros_miembros ? familia.miembros.otros_miembros.length : 0,
        telefono: familia.estadisticas.tiene_telefono ? 'SÍ' : 'NO',
        email: familia.estadisticas.tiene_email ? 'SÍ' : 'NO'
      });
    });
    
    this.aplicarFormatoTabla(hoja);
  }

  /**
   * HOJA 2: DETALLE COMPLETO POR FAMILIA
   */
  async crearHojaDetalleFamiliar(workbook, familias) {
    const hoja = workbook.addWorksheet('Detalle Familiar');
    
    hoja.columns = [
      { header: 'Código Familia', key: 'codigo_familia', width: 20 },
      { header: 'Apellido Familiar', key: 'apellido_familia', width: 25 },
      { header: 'Tipo Miembro', key: 'tipo', width: 12 },
      { header: 'Nombre Completo', key: 'nombre', width: 25 },
      { header: 'Cédula', key: 'cedula', width: 12 },
      { header: 'Edad', key: 'edad', width: 8 },
      { header: 'Es Menor', key: 'es_menor', width: 10 },
      { header: 'Teléfono', key: 'telefono', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Salud', key: 'salud', width: 20 },
      { header: 'Destrezas', key: 'destrezas', width: 20 },
      { header: 'Es Difunto', key: 'difunto', width: 10 },
      { header: 'Fecha Defunción', key: 'fecha_defuncion', width: 15 },
      { header: 'Causa Muerte', key: 'causa_muerte', width: 20 }
    ];
    
    // Agregar todos los miembros de todas las familias
    familias.forEach(familia => {
      // Función auxiliar para agregar miembros
      const agregarMiembros = (miembros, tipoLabel) => {
        miembros.forEach(miembro => {
          hoja.addRow({
            codigo_familia: familia.codigo_familia,
            apellido_familia: familia.apellido_familiar,
            tipo: tipoLabel,
            nombre: miembro.nombre_completo,
            cedula: miembro.cedula,
            edad: miembro.edad,
            es_menor: miembro.es_menor ? 'SÍ' : 'NO',
            telefono: miembro.telefono,
            email: miembro.email,
            salud: miembro.salud,
            destrezas: miembro.destrezas,
            difunto: miembro.es_difunto ? 'SÍ' : 'NO',
            fecha_defuncion: miembro.fecha_defuncion,
            causa_muerte: miembro.causa_muerte
          });
        });
      };
      
      // Agregar cada tipo de miembro
      agregarMiembros(familia.miembros.padres, 'PADRE');
      agregarMiembros(familia.miembros.madres, 'MADRE');
      agregarMiembros(familia.miembros.hijos_vivos, 'HIJO');
      agregarMiembros(familia.miembros.otros_miembros || [], 'MIEMBRO');
      agregarMiembros(familia.miembros.difuntos, 'DIFUNTO');
    });
    
    this.aplicarFormatoTabla(hoja);
  }

  /**
   * HOJA 3: ESTADÍSTICAS GENERALES
   */
  async crearHojaEstadisticas(workbook, familias) {
    const hoja = workbook.addWorksheet('Estadísticas');
    
    // Calcular estadísticas generales
    const stats = {
      total_familias: familias.length,
      total_personas: familias.reduce((sum, f) => sum + f.estadisticas.total_miembros, 0),
      total_vivos: familias.reduce((sum, f) => sum + f.estadisticas.total_vivos, 0),
      total_difuntos: familias.reduce((sum, f) => sum + f.estadisticas.total_difuntos, 0),
      total_menores: familias.reduce((sum, f) => sum + f.estadisticas.total_menores, 0),
      total_adultos: familias.reduce((sum, f) => sum + f.estadisticas.total_adultos, 0),
      familias_con_telefono: familias.filter(f => f.estadisticas.tiene_telefono).length,
      familias_con_email: familias.filter(f => f.estadisticas.tiene_email).length
    };
    
    // Agregar estadísticas como filas
    hoja.addRow(['ESTADÍSTICAS GENERALES DEL REPORTE']);
    hoja.addRow(['=================================']);
    hoja.addRow([]);
    hoja.addRow(['Métrica', 'Valor']);
    hoja.addRow(['Total de Familias', stats.total_familias]);
    hoja.addRow(['Total de Personas', stats.total_personas]);
    hoja.addRow(['Personas Vivas', stats.total_vivos]);
    hoja.addRow(['Personas Difuntas', stats.total_difuntos]);
    hoja.addRow(['Menores de Edad', stats.total_menores]);
    hoja.addRow(['Adultos', stats.total_adultos]);
    hoja.addRow(['Familias con Teléfono', stats.familias_con_telefono]);
    hoja.addRow(['Familias con Email', stats.familias_con_email]);
    
    // Formato especial para estadísticas
    hoja.getRow(1).font = { bold: true, size: 14 };
    hoja.getRow(4).font = { bold: true };
    hoja.getColumn(1).width = 25;
    hoja.getColumn(2).width = 15;
  }

  /**
   * HOJA 4: DIFUNTOS POR FAMILIA
   */
  async crearHojaDifuntos(workbook, familias) {
    const hoja = workbook.addWorksheet('Difuntos');
    
    hoja.columns = [
      { header: 'Código Familia', key: 'codigo_familia', width: 20 },
      { header: 'Apellido Familiar', key: 'apellido_familia', width: 25 },
      { header: 'Nombre Difunto', key: 'nombre', width: 25 },
      { header: 'Cédula', key: 'cedula', width: 12 },
      { header: 'Fecha Defunción', key: 'fecha_defuncion', width: 15 },
      { header: 'Causa Muerte', key: 'causa_muerte', width: 30 },
      { header: 'Observaciones', key: 'observaciones', width: 30 }
    ];
    
    // Agregar solo los difuntos
    familias.forEach(familia => {
      familia.miembros.difuntos.forEach(difunto => {
        hoja.addRow({
          codigo_familia: familia.codigo_familia,
          apellido_familia: familia.apellido_familiar,
          nombre: difunto.nombre_completo,
          cedula: difunto.cedula,
          fecha_defuncion: difunto.fecha_defuncion,
          causa_muerte: difunto.causa_muerte,
          observaciones: difunto.observaciones_difunto
        });
      });
    });
    
    this.aplicarFormatoTabla(hoja);
  }

  /**
   * HOJA 5: NECESIDADES PASTORALES
   */
  async crearHojaNecesidadesPastorales(workbook, familias) {
    const hoja = workbook.addWorksheet('Necesidades Pastorales');
    
    hoja.columns = [
      { header: 'Código Familia', key: 'codigo_familia', width: 20 },
      { header: 'Apellido Familiar', key: 'apellido_familia', width: 25 },
      { header: 'Necesidades Salud', key: 'salud', width: 30 },
      { header: 'Destrezas Disponibles', key: 'destrezas', width: 30 },
      { header: 'Observaciones', key: 'observaciones', width: 30 }
    ];
    
    // Agregar solo familias con necesidades o destrezas
    familias.forEach(familia => {
      const tieneNecesidades = familia.resumen_pastoral.necesidades_salud.length > 0;
      const tieneDestrezas = familia.resumen_pastoral.destrezas_disponibles.length > 0;
      const tieneObservaciones = familia.resumen_pastoral.observaciones_generales;
      
      if (tieneNecesidades || tieneDestrezas || tieneObservaciones) {
        hoja.addRow({
          codigo_familia: familia.codigo_familia,
          apellido_familia: familia.apellido_familiar,
          salud: familia.resumen_pastoral.necesidades_salud.join('; '),
          destrezas: familia.resumen_pastoral.destrezas_disponibles.join('; '),
          observaciones: familia.resumen_pastoral.observaciones_generales
        });
      }
    });
    
    this.aplicarFormatoTabla(hoja);
  }

  /**
   * FUNCIÓN AUXILIAR: Aplicar formato profesional a tablas
   */
  aplicarFormatoTabla(hoja) {
    // Formatear encabezados
    hoja.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Auto-ajustar altura de filas
    hoja.eachRow((row, rowNumber) => {
      row.height = rowNumber === 1 ? 25 : 20;
    });
    
    // Aplicar filtros automáticos si hay datos
    if (hoja.rowCount > 1) {
      hoja.autoFilter = {
        from: 'A1',
        to: hoja.lastColumn.letter + '1'
      };
    }
  }
}

export default new FamiliasConsolidadoService();
