import { Persona, Familias, Sexo, Enfermedad, Municipios, Veredas, Sector, Parroquia } from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

class SaludConsolidadoService {
  /**
   * Consulta consolidada de salud de personas
   */
  async consultarSalud(filtros = {}) {
    try {
      console.log('🔍 Iniciando consulta consolidada de salud...', filtros);
      
      const whereClause = {};
      const includeClause = [
        {
          model: Familias,
          as: 'familia',
          required: false,
          attributes: ['apellido_familiar', 'sector', 'telefono', 'direccion_familia'],
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

      // Filtrar por enfermedad específica
      if (filtros.enfermedad) {
        whereClause.necesidad_enfermo = { 
          [Op.iLike]: `%${filtros.enfermedad}%` 
        };
      }

      // Filtrar por rango de edad
      if (filtros.rango_edad) {
        const [edadMin, edadMax] = filtros.rango_edad.split('-').map(e => parseInt(e.trim()));
        if (edadMin && edadMax) {
          const fechaMax = new Date();
          fechaMax.setFullYear(fechaMax.getFullYear() - edadMin);
          const fechaMin = new Date();
          fechaMin.setFullYear(fechaMin.getFullYear() - edadMax - 1);
          
          whereClause.fecha_nacimiento = {
            [Op.between]: [fechaMin.toISOString().split('T')[0], fechaMax.toISOString().split('T')[0]]
          };
        }
      }

      // Filtrar por edad mínima y máxima individual
      if (filtros.edad_min) {
        const fechaMax = new Date();
        fechaMax.setFullYear(fechaMax.getFullYear() - parseInt(filtros.edad_min));
        whereClause.fecha_nacimiento = {
          ...whereClause.fecha_nacimiento,
          [Op.lte]: fechaMax.toISOString().split('T')[0]
        };
      }

      if (filtros.edad_max) {
        const fechaMin = new Date();
        fechaMin.setFullYear(fechaMin.getFullYear() - parseInt(filtros.edad_max) - 1);
        whereClause.fecha_nacimiento = {
          ...whereClause.fecha_nacimiento,
          [Op.gte]: fechaMin.toISOString().split('T')[0]
        };
      }

      // Filtrar por sexo
      if (filtros.sexo) {
        const sexoModelo = await Sexo.findOne({
          where: { 
            descripcion: { [Op.iLike]: `%${filtros.sexo}%` } 
          }
        });
        if (sexoModelo) {
          whereClause.id_sexo = sexoModelo.id_sexo;
        }
      }

      // Filtros geográficos
      if (filtros.parroquia) {
        includeClause[2].where = {
          nombre: { [Op.iLike]: `%${filtros.parroquia}%` }
        };
        includeClause[2].required = true;
      }

      if (filtros.municipio) {
        includeClause[0].include[0].where = {
          nombre_municipio: { [Op.iLike]: `%${filtros.municipio}%` }
        };
        includeClause[0].include[0].required = true;
        includeClause[0].required = true;
      }

      if (filtros.sector) {
        includeClause[0].where = {
          [Op.or]: [
            { sector: { [Op.iLike]: `%${filtros.sector}%` } },
            { '$familia.sector_info.nombre$': { [Op.iLike]: `%${filtros.sector}%` } }
          ]
        };
        includeClause[0].required = true;
      }

      // Ejecutar consulta
      const personas = await Persona.findAll({
        where: whereClause,
        include: includeClause,
        attributes: [
          'id_personas',
          'primer_nombre',
          'segundo_nombre',
          'primer_apellido',
          'segundo_apellido',
          'identificacion',
          'telefono',
          'fecha_nacimiento',
          'necesidad_enfermo',
          'id_familia_familias'
        ],
        order: [['primer_apellido', 'ASC'], ['primer_nombre', 'ASC']],
        limit: filtros.limite || 100
      });

      // Formatear resultados
      const resultado = personas.map(persona => {
        const edad = this.calcularEdad(persona.fecha_nacimiento);
        const enfermedades = this.procesarEnfermedades(persona.necesidad_enfermo);
        
        return {
          documento: persona.identificacion,
          nombre: `${persona.primer_nombre} ${persona.segundo_nombre || ''} ${persona.primer_apellido} ${persona.segundo_apellido || ''}`.trim(),
          apellido_familiar: persona.familia?.apellido_familiar || 'No especificado',
          sexo: persona.sexo?.nombre || 'No especificado',
          edad: edad,
          telefono: persona.telefono || persona.familia?.telefono || 'No especificado',
          parentesco: this.inferirParentesco(persona.sexo?.nombre, edad),
          parroquia: persona.parroquia?.nombre || 'No especificado',
          municipio: persona.familia?.municipio?.nombre || 'No especificado',
          sector: persona.familia?.sector || persona.familia?.sector_info?.nombre || 'No especificado',
          salud: {
            enfermedades: enfermedades,
            necesidades_medicas: persona.necesidad_enfermo || 'Ninguna reportada',
            tiene_enfermedades: enfermedades.length > 0
          },
          ubicacion: {
            parroquia: persona.parroquia?.nombre || 'No especificado',
            municipio: persona.familia?.municipio?.nombre || 'No especificado',
            sector: persona.familia?.sector || persona.familia?.sector_info?.nombre || 'No especificado',
            direccion: persona.familia?.direccion_familia || 'No especificado'
          }
        };
      });

      // Generar estadísticas
      const estadisticas = this.generarEstadisticasSalud(resultado);

      return {
        exito: true,
        mensaje: "Consulta de salud exitosa",
        datos: resultado,
        total: resultado.length,
        estadisticas: estadisticas,
        filtros_aplicados: filtros
      };

    } catch (error) {
      console.error('❌ Error en consulta de salud:', error);
      throw new Error(`Error al consultar información de salud: ${error.message}`);
    }
  }

  /**
   * Procesar texto de enfermedades y extraer lista
   */
  procesarEnfermedades(textoEnfermedades) {
    if (!textoEnfermedades || textoEnfermedades.trim() === '') {
      return [];
    }

    // Lista de enfermedades comunes a detectar
    const enfermedadesComunes = [
      'diabetes', 'hipertension', 'hipertensión', 'artritis', 'asma', 
      'cancer', 'cáncer', 'colesterol', 'tiroides', 'osteoporosis',
      'gastritis', 'migraña', 'depresion', 'depresión', 'ansiedad',
      'obesidad', 'anemia', 'bronquitis', 'sinusitis', 'alergia'
    ];

    const texto = textoEnfermedades.toLowerCase();
    const enfermedadesDetectadas = [];

    enfermedadesComunes.forEach(enfermedad => {
      if (texto.includes(enfermedad.toLowerCase())) {
        // Capitalizar primera letra
        const enfermedadFormateada = enfermedad.charAt(0).toUpperCase() + enfermedad.slice(1);
        if (!enfermedadesDetectadas.includes(enfermedadFormateada)) {
          enfermedadesDetectadas.push(enfermedadFormateada);
        }
      }
    });

    // Si no se detectaron enfermedades específicas pero hay texto, agregar como "Otra"
    if (enfermedadesDetectadas.length === 0 && texto.trim() !== 'ninguna' && texto.trim() !== 'no') {
      enfermedadesDetectadas.push('Otra condición médica');
    }

    return enfermedadesDetectadas;
  }

  /**
   * Inferir parentesco basado en sexo y edad
   */
  inferirParentesco(sexo, edad) {
    if (!sexo || !edad) return 'No especificado';
    
    const sexoLower = sexo.toLowerCase();
    
    if (edad >= 18) {
      if (sexoLower.includes('femenino') || sexoLower.includes('mujer')) {
        return edad >= 50 ? 'Madre' : 'Adulta joven';
      } else if (sexoLower.includes('masculino') || sexoLower.includes('hombre')) {
        return edad >= 50 ? 'Padre' : 'Adulto joven';
      }
    } else {
      return sexoLower.includes('femenino') ? 'Hija' : 'Hijo';
    }
    
    return 'No especificado';
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
   * Generar estadísticas de salud
   */
  generarEstadisticasSalud(personas) {
    const estadisticas = {
      enfermedades_mas_comunes: {},
      distribucion_edades: {
        '0-18': 0,
        '19-35': 0,
        '36-60': 0,
        '60+': 0
      },
      por_sexo: {},
      por_municipio: {},
      por_sector: {},
      con_enfermedades: 0,
      sin_enfermedades: 0
    };

    personas.forEach(persona => {
      // Enfermedades más comunes
      persona.salud.enfermedades.forEach(enfermedad => {
        estadisticas.enfermedades_mas_comunes[enfermedad] = 
          (estadisticas.enfermedades_mas_comunes[enfermedad] || 0) + 1;
      });

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

      // Por sexo
      const sexo = persona.sexo;
      estadisticas.por_sexo[sexo] = (estadisticas.por_sexo[sexo] || 0) + 1;

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

      // Con/sin enfermedades
      if (persona.salud.tiene_enfermedades) {
        estadisticas.con_enfermedades++;
      } else {
        estadisticas.sin_enfermedades++;
      }
    });

    return estadisticas;
  }

  /**
   * Obtener resumen de salud por parroquia
   */
  async obtenerResumenSaludPorParroquia(idParroquia = null) {
    try {
      const filtros = idParroquia ? { parroquia_id: idParroquia } : {};
      const resultado = await this.consultarSalud(filtros);
      
      return {
        exito: true,
        mensaje: "Resumen de salud por parroquia",
        datos: resultado.estadisticas,
        total_personas: resultado.total
      };

    } catch (error) {
      throw new Error(`Error al obtener resumen de salud: ${error.message}`);
    }
  }
}

export default new SaludConsolidadoService();
