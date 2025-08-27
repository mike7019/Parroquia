import { Persona, Familias, Sexo, TipoIdentificacion, Parentesco, Municipios, Veredas, Sector, DifuntosFamilia } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class FamiliasConsultasService {
  /**
   * Consultar por Madres - VERSIÓN COMPLETA
   * Obtiene todas las personas del sexo femenino que pueden ser consideradas madres (VIVAS)
   * Incluye toda la información disponible de la persona
   */
  async consultarPorMadres(filtros = {}) {
    try {
      console.log('🔍 Iniciando consulta de madres...');
      
      const whereClause = {};
      
      // Filtrar por sexo femenino - buscar directamente en la tabla sexos
      const sexoQuery = `
        SELECT id_sexo FROM sexos 
        WHERE nombre ILIKE '%femenino%' OR nombre ILIKE '%mujer%' OR nombre ILIKE '%f%'
        LIMIT 1
      `;
      
      const [sexoResult] = await sequelize.query(sexoQuery);
      
      if (sexoResult && sexoResult.length > 0) {
        whereClause.id_sexo = sexoResult[0].id_sexo;
      }

      // Excluir personas fallecidas
      const personasFallecidas = await this.obtenerPersonasFallecidas();
      if (personasFallecidas.length > 0) {
        whereClause.identificacion = {
          [Op.notIn]: personasFallecidas
        };
      }

      // Solo aplicar filtros si se proporcionan (consultar todas las madres por defecto)
      if (filtros.nombre) {
        whereClause[Op.or] = [
          { primer_nombre: { [Op.iLike]: `%${filtros.nombre}%` } },
          { segundo_nombre: { [Op.iLike]: `%${filtros.nombre}%` } },
          { primer_apellido: { [Op.iLike]: `%${filtros.nombre}%` } },
          { segundo_apellido: { [Op.iLike]: `%${filtros.nombre}%` } }
        ];
      }

      if (filtros.documento) {
        whereClause.identificacion = { [Op.iLike]: `%${filtros.documento}%` };
      }

      if (filtros.telefono) {
        whereClause.telefono = { [Op.iLike]: `%${filtros.telefono}%` };
      }

      // Consulta principal con TODOS los campos disponibles
      const madres = await Persona.findAll({
        where: whereClause,
        attributes: [
          'id_personas',
          'identificacion',
          'primer_nombre',
          'segundo_nombre', 
          'primer_apellido',
          'segundo_apellido',
          'fecha_nacimiento',
          'telefono',
          'correo_electronico',
          'direccion',
          'id_familia_familias',
          'id_sexo',
          'id_tipo_identificacion_tipo_identificacion',
          'id_estado_civil_estado_civil',
          'estudios',
          'en_que_eres_lider',
          'necesidad_enfermo',
          'id_profesion',
          'talla_camisa',
          'talla_pantalon',
          'talla_zapato',
          'id_familia',
          'id_parroquia'
        ],
        order: [['primer_apellido', 'ASC'], ['primer_nombre', 'ASC']],
        limit: filtros.limite || 100 // Aumentamos el límite por defecto
      });

      console.log(`✅ Encontradas ${madres.length} madres`);

      // Formatear respuesta con toda la información disponible
      const resultado = [];
      
      for (const madre of madres) {
        const edad = this.calcularEdad(madre.fecha_nacimiento);
        
        // Obtener información adicional por separado
        let apellidoFamiliar = 'No especificado';
        let telefonoFamiliar = '';
        let nombreSexo = 'Femenino';
        let tipoIdentificacion = 'No especificado';
        let estadoCivil = 'No especificado';
        let nombreParroquia = 'No especificado';
        
        // Información de familia
        if (madre.id_familia_familias) {
          try {
            const familia = await Familias.findByPk(madre.id_familia_familias, {
              attributes: ['apellido_familiar', 'telefono', 'direccion_familia', 'sector']
            });
            if (familia) {
              apellidoFamiliar = familia.apellido_familiar || 'No especificado';
              telefonoFamiliar = familia.telefono || '';
            }
          } catch (error) {
            console.log('⚠️ Error obteniendo familia:', error.message);
          }
        }
        
        // Información de sexo
        if (madre.id_sexo) {
          try {
            const sexo = await Sexo.findByPk(madre.id_sexo);
            if (sexo) {
              nombreSexo = sexo.nombre || 'Femenino';
            }
          } catch (error) {
            console.log('⚠️ Error obteniendo sexo:', error.message);
          }
        }
        
        // Información de tipo de identificación
        if (madre.id_tipo_identificacion_tipo_identificacion) {
          try {
            const tipoId = await TipoIdentificacion.findByPk(madre.id_tipo_identificacion_tipo_identificacion);
            if (tipoId) {
              tipoIdentificacion = tipoId.nombre || 'No especificado';
            }
          } catch (error) {
            console.log('⚠️ Error obteniendo tipo identificación:', error.message);
          }
        }
        
        resultado.push({
          // Información básica
          id: madre.id_personas,
          tipo_parentesco: 'Madre',
          parentesco: 'Madre',
          
          // Información personal completa
          documento: madre.identificacion,
          tipo_documento: tipoIdentificacion,
          primer_nombre: madre.primer_nombre,
          segundo_nombre: madre.segundo_nombre || '',
          primer_apellido: madre.primer_apellido,
          segundo_apellido: madre.segundo_apellido || '',
          nombre_completo: `${madre.primer_nombre} ${madre.segundo_nombre || ''} ${madre.primer_apellido} ${madre.segundo_apellido || ''}`.trim(),
          
          // Información demográfica
          sexo: nombreSexo,
          edad: edad,
          fecha_nacimiento: madre.fecha_nacimiento,
          
          // Información de contacto
          telefono: madre.telefono || telefonoFamiliar || 'No especificado',
          correo_electronico: madre.correo_electronico || 'No especificado',
          direccion: madre.direccion || 'No especificado',
          
          // Información familiar
          apellido_familiar: apellidoFamiliar,
          id_familia: madre.id_familia_familias,
          
          // Información adicional
          estudios: madre.estudios || 'No especificado',
          liderazgo: madre.en_que_eres_lider || 'No especificado',
          necesidades_medicas: madre.necesidad_enfermo || 'Ninguna',
          
          // Información de tallas
          talla_camisa: madre.talla_camisa || 'No especificado',
          talla_pantalon: madre.talla_pantalon || 'No especificado', 
          talla_zapato: madre.talla_zapato || 'No especificado',
          
          // IDs de referencia
          id_sexo: madre.id_sexo,
          id_tipo_identificacion: madre.id_tipo_identificacion_tipo_identificacion,
          id_estado_civil: madre.id_estado_civil_estado_civil,
          id_profesion: madre.id_profesion,
          id_parroquia: madre.id_parroquia,
          
          // Estado
          estado: 'Viva'
        });
      }

      return {
        exito: true,
        datos: resultado,
        total: resultado.length,
        filtros_aplicados: filtros,
        nota: 'Consulta completa de madres vivas con toda la información disponible. Use filtros específicos para refinar los resultados.'
      };

    } catch (error) {
      console.error('❌ Error en consulta de madres:', error);
      throw new Error(`Error al consultar madres: ${error.message}`);
    }
  }

  /**
   * Consultar por Padres - VERSIÓN COMPLETA
   * Obtiene todas las personas del sexo masculino que pueden ser consideradas padres (VIVOS)
   * Incluye toda la información disponible de la persona
   */
  async consultarPorPadres(filtros = {}) {
    try {
      console.log('🔍 Iniciando consulta de padres...');
      
      const whereClause = {};
      
      // Filtrar por sexo masculino - buscar directamente en la tabla sexos
      const sexoQuery = `
        SELECT id_sexo FROM sexos 
        WHERE nombre ILIKE '%masculino%' OR nombre ILIKE '%hombre%' OR nombre ILIKE '%m%'
        LIMIT 1
      `;
      
      const [sexoResult] = await sequelize.query(sexoQuery);
      
      if (sexoResult && sexoResult.length > 0) {
        whereClause.id_sexo = sexoResult[0].id_sexo;
      }

      // Excluir personas fallecidas
      const personasFallecidas = await this.obtenerPersonasFallecidas();
      if (personasFallecidas.length > 0) {
        whereClause.identificacion = {
          [Op.notIn]: personasFallecidas
        };
      }

      // Solo aplicar filtros si se proporcionan (consultar todos los padres por defecto)
      if (filtros.nombre) {
        whereClause[Op.or] = [
          { primer_nombre: { [Op.iLike]: `%${filtros.nombre}%` } },
          { segundo_nombre: { [Op.iLike]: `%${filtros.nombre}%` } },
          { primer_apellido: { [Op.iLike]: `%${filtros.nombre}%` } },
          { segundo_apellido: { [Op.iLike]: `%${filtros.nombre}%` } }
        ];
      }

      if (filtros.documento) {
        whereClause.identificacion = { [Op.iLike]: `%${filtros.documento}%` };
      }

      if (filtros.telefono) {
        whereClause.telefono = { [Op.iLike]: `%${filtros.telefono}%` };
      }

      // Consulta principal con TODOS los campos disponibles
      const padres = await Persona.findAll({
        where: whereClause,
        attributes: [
          'id_personas',
          'identificacion',
          'primer_nombre',
          'segundo_nombre', 
          'primer_apellido',
          'segundo_apellido',
          'fecha_nacimiento',
          'telefono',
          'correo_electronico',
          'direccion',
          'id_familia_familias',
          'id_sexo',
          'id_tipo_identificacion_tipo_identificacion',
          'id_estado_civil_estado_civil',
          'estudios',
          'en_que_eres_lider',
          'necesidad_enfermo',
          'id_profesion',
          'talla_camisa',
          'talla_pantalon',
          'talla_zapato',
          'id_familia',
          'id_parroquia'
        ],
        order: [['primer_apellido', 'ASC'], ['primer_nombre', 'ASC']],
        limit: filtros.limite || 100 // Aumentamos el límite por defecto
      });

      console.log(`✅ Encontrados ${padres.length} padres`);

      // Formatear respuesta con toda la información disponible
      const resultado = [];
      
      for (const padre of padres) {
        const edad = this.calcularEdad(padre.fecha_nacimiento);
        
        // Obtener información adicional por separado
        let apellidoFamiliar = 'No especificado';
        let telefonoFamiliar = '';
        let nombreSexo = 'Masculino';
        let tipoIdentificacion = 'No especificado';
        let estadoCivil = 'No especificado';
        let nombreParroquia = 'No especificado';
        
        // Información de familia
        if (padre.id_familia_familias) {
          try {
            const familia = await Familias.findByPk(padre.id_familia_familias, {
              attributes: ['apellido_familiar', 'telefono', 'direccion_familia', 'sector']
            });
            if (familia) {
              apellidoFamiliar = familia.apellido_familiar || 'No especificado';
              telefonoFamiliar = familia.telefono || '';
            }
          } catch (error) {
            console.log('⚠️ Error obteniendo familia:', error.message);
          }
        }
        
        // Información de sexo
        if (padre.id_sexo) {
          try {
            const sexo = await Sexo.findByPk(padre.id_sexo);
            if (sexo) {
              nombreSexo = sexo.nombre || 'Masculino';
            }
          } catch (error) {
            console.log('⚠️ Error obteniendo sexo:', error.message);
          }
        }
        
        // Información de tipo de identificación
        if (padre.id_tipo_identificacion_tipo_identificacion) {
          try {
            const tipoId = await TipoIdentificacion.findByPk(padre.id_tipo_identificacion_tipo_identificacion);
            if (tipoId) {
              tipoIdentificacion = tipoId.nombre || 'No especificado';
            }
          } catch (error) {
            console.log('⚠️ Error obteniendo tipo identificación:', error.message);
          }
        }
        
        resultado.push({
          // Información básica
          id: padre.id_personas,
          tipo_parentesco: 'Padre',
          parentesco: 'Padre',
          
          // Información personal completa
          documento: padre.identificacion,
          tipo_documento: tipoIdentificacion,
          primer_nombre: padre.primer_nombre,
          segundo_nombre: padre.segundo_nombre || '',
          primer_apellido: padre.primer_apellido,
          segundo_apellido: padre.segundo_apellido || '',
          nombre_completo: `${padre.primer_nombre} ${padre.segundo_nombre || ''} ${padre.primer_apellido} ${padre.segundo_apellido || ''}`.trim(),
          
          // Información demográfica
          sexo: nombreSexo,
          edad: edad,
          fecha_nacimiento: padre.fecha_nacimiento,
          
          // Información de contacto
          telefono: padre.telefono || telefonoFamiliar || 'No especificado',
          correo_electronico: padre.correo_electronico || 'No especificado',
          direccion: padre.direccion || 'No especificado',
          
          // Información familiar
          apellido_familiar: apellidoFamiliar,
          id_familia: padre.id_familia_familias,
          
          // Información adicional
          estudios: padre.estudios || 'No especificado',
          liderazgo: padre.en_que_eres_lider || 'No especificado',
          necesidades_medicas: padre.necesidad_enfermo || 'Ninguna',
          
          // Información de tallas
          talla_camisa: padre.talla_camisa || 'No especificado',
          talla_pantalon: padre.talla_pantalon || 'No especificado', 
          talla_zapato: padre.talla_zapato || 'No especificado',
          
          // IDs de referencia
          id_sexo: padre.id_sexo,
          id_tipo_identificacion: padre.id_tipo_identificacion_tipo_identificacion,
          id_estado_civil: padre.id_estado_civil_estado_civil,
          id_profesion: padre.id_profesion,
          id_parroquia: padre.id_parroquia,
          
          // Estado
          estado: 'Vivo'
        });
      }

      return {
        exito: true,
        datos: resultado,
        total: resultado.length,
        filtros_aplicados: filtros,
        nota: 'Consulta completa de padres vivos con toda la información disponible. Use filtros específicos para refinar los resultados.'
      };

    } catch (error) {
      console.error('❌ Error en consulta de padres:', error);
      throw new Error(`Error al consultar padres: ${error.message}`);
    }
  }

  /**
   * Consulta general de familias con información de padres y madres
   */
  async consultarFamiliasConPadresMadres(filtros = {}) {
    try {
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
                attributes: ['nombre']
              }
            ]
          }
        ],
        order: [['apellido_familiar', 'ASC']],
        limit: filtros.limite || 30
      });

      const resultado = familias.map(familia => {
        const padres = familia.personas?.filter(p => 
          p.sexo?.nombre?.toLowerCase().includes('masculino') ||
          p.sexo?.nombre?.toLowerCase().includes('hombre') ||
          p.sexo?.nombre?.toLowerCase().includes('m')
        ) || [];
        
        const madres = familia.personas?.filter(p => 
          p.sexo?.nombre?.toLowerCase().includes('femenino') ||
          p.sexo?.nombre?.toLowerCase().includes('mujer') ||
          p.sexo?.nombre?.toLowerCase().includes('f')
        ) || [];

        return {
          apellido_familiar: familia.apellido_familiar,
          sector: familia.sector,
          telefono: familia.telefono,
          padres: padres.map(p => ({
            nombre: `${p.primer_nombre} ${p.primer_apellido}`,
            documento: p.identificacion,
            edad: this.calcularEdad(p.fecha_nacimiento)
          })),
          madres: madres.map(m => ({
            nombre: `${m.primer_nombre} ${m.primer_apellido}`,
            documento: m.identificacion,
            edad: this.calcularEdad(m.fecha_nacimiento)
          })),
          total_personas: familia.personas?.length || 0
        };
      });

      return {
        exito: true,
        datos: resultado,
        total: resultado.length,
        filtros_aplicados: filtros
      };

    } catch (error) {
      throw new Error(`Error al consultar familias con padres y madres: ${error.message}`);
    }
  }

  /**
   * Consultar madres fallecidas
   * Obtiene todas las madres que han fallecido
   */
  async consultarMadresFallecidas(filtros = {}) {
    try {
      const whereClause = {};
      
      // Aplicar filtros
      if (filtros.nombre) {
        whereClause.nombre_completo = { [Op.iLike]: `%${filtros.nombre}%` };
      }

      if (filtros.apellido_familiar) {
        const familias = await Familias.findAll({
          where: {
            apellido_familiar: { [Op.iLike]: `%${filtros.apellido_familiar}%` }
          },
          attributes: ['id_familia']
        });
        
        if (familias.length > 0) {
          whereClause.id_familia_familias = {
            [Op.in]: familias.map(f => f.id_familia)
          };
        }
      }

      if (filtros.fecha_fallecimiento) {
        whereClause.fecha_fallecimiento = { [Op.gte]: filtros.fecha_fallecimiento };
      }

      // Filtrar por madres (usando observaciones o nombres que indiquen madre)
      whereClause[Op.or] = [
        { nombre_completo: { [Op.iRegexp]: '(madre|mamá|doña)' } },
        { observaciones: { [Op.iRegexp]: '(madre|mamá|doña)' } }
      ];

      const madresFallecidas = await DifuntosFamilia.findAll({
        where: whereClause,
        include: [
          {
            model: Familias,
            as: 'familia',
            required: false,
            attributes: ['apellido_familiar', 'sector', 'telefono']
          }
        ],
        order: [['fecha_fallecimiento', 'DESC']],
        limit: filtros.limite || 50
      });

      const resultado = madresFallecidas.map(madre => {
        const añosFallecida = this.calcularAñosDesde(madre.fecha_fallecimiento);
        
        return {
          tipo_parentesco: 'Madre',
          apellido_familiar: madre.familia?.apellido_familiar || 'No especificado',
          parentesco: 'Madre',
          documento: 'No disponible',
          nombre: madre.nombre_completo,
          sexo: 'Femenino',
          edad: 'No disponible',
          fecha_nacimiento: 'No disponible',
          telefono: madre.familia?.telefono || 'No especificado',
          estado: 'Fallecida',
          fecha_fallecimiento: madre.fecha_fallecimiento,
          años_fallecida: añosFallecida,
          observaciones: madre.observaciones
        };
      });

      return {
        exito: true,
        datos: resultado,
        total: resultado.length,
        filtros_aplicados: filtros,
        nota: 'Solo se incluyen madres fallecidas registradas en el sistema.'
      };

    } catch (error) {
      throw new Error(`Error al consultar madres fallecidas: ${error.message}`);
    }
  }

  /**
   * Consultar padres fallecidos
   * Obtiene todos los padres que han fallecido
   */
  async consultarPadresFallecidos(filtros = {}) {
    try {
      const whereClause = {};
      
      // Aplicar filtros
      if (filtros.nombre) {
        whereClause.nombre_completo = { [Op.iLike]: `%${filtros.nombre}%` };
      }

      if (filtros.apellido_familiar) {
        const familias = await Familias.findAll({
          where: {
            apellido_familiar: { [Op.iLike]: `%${filtros.apellido_familiar}%` }
          },
          attributes: ['id_familia']
        });
        
        if (familias.length > 0) {
          whereClause.id_familia_familias = {
            [Op.in]: familias.map(f => f.id_familia)
          };
        }
      }

      if (filtros.fecha_fallecimiento) {
        whereClause.fecha_fallecimiento = { [Op.gte]: filtros.fecha_fallecimiento };
      }

      // Filtrar por padres (usando observaciones o nombres que indiquen padre)
      whereClause[Op.or] = [
        { nombre_completo: { [Op.iRegexp]: '(padre|papá|don)' } },
        { observaciones: { [Op.iRegexp]: '(padre|papá|don)' } }
      ];

      const padresFallecidos = await DifuntosFamilia.findAll({
        where: whereClause,
        include: [
          {
            model: Familias,
            as: 'familia',
            required: false,
            attributes: ['apellido_familiar', 'sector', 'telefono']
          }
        ],
        order: [['fecha_fallecimiento', 'DESC']],
        limit: filtros.limite || 50
      });

      const resultado = padresFallecidos.map(padre => {
        const añosFallecido = this.calcularAñosDesde(padre.fecha_fallecimiento);
        
        return {
          tipo_parentesco: 'Padre',
          apellido_familiar: padre.familia?.apellido_familiar || 'No especificado',
          parentesco: 'Padre',
          documento: 'No disponible',
          nombre: padre.nombre_completo,
          sexo: 'Masculino',
          edad: 'No disponible',
          fecha_nacimiento: 'No disponible',
          telefono: padre.familia?.telefono || 'No especificado',
          estado: 'Fallecido',
          fecha_fallecimiento: padre.fecha_fallecimiento,
          años_fallecido: añosFallecido,
          observaciones: padre.observaciones
        };
      });

      return {
        exito: true,
        datos: resultado,
        total: resultado.length,
        filtros_aplicados: filtros,
        nota: 'Solo se incluyen padres fallecidos registrados en el sistema.'
      };

    } catch (error) {
      throw new Error(`Error al consultar padres fallecidos: ${error.message}`);
    }
  }

  /**
   * Obtener lista de identificaciones de personas fallecidas
   * (método auxiliar para excluir de consultas de vivos)
   */
  async obtenerPersonasFallecidas() {
    try {
      // Buscar en DifuntosFamilia nombres que puedan coincidir con personas en la tabla personas
      const difuntos = await DifuntosFamilia.findAll({
        attributes: ['nombre_completo'],
        raw: true
      });

      // Buscar en tabla personas aquellas que coincidan con nombres de difuntos
      const nombresDifuntos = difuntos.map(d => d.nombre_completo);
      
      if (nombresDifuntos.length === 0) {
        return [];
      }

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
      return []; // En caso de error, no excluir ninguna persona
    }
  }
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
   * Calcular años transcurridos desde una fecha
   */
  calcularAñosDesde(fecha) {
    if (!fecha) return 'No especificada';
    
    const hoy = new Date();
    const fechaReferencia = new Date(fecha);
    let años = hoy.getFullYear() - fechaReferencia.getFullYear();
    const mesActual = hoy.getMonth();
    const mesReferencia = fechaReferencia.getMonth();
    
    if (mesActual < mesReferencia || (mesActual === mesReferencia && hoy.getDate() < fechaReferencia.getDate())) {
      años--;
    }
    
    return años;
  }

  /**
   * Obtener estadísticas de padres y madres
   */
  async obtenerEstadisticasPadresMadres() {
    try {
      // Contar madres vivas
      const sexoFemenino = await Sexo.findOne({
        where: { nombre: { [Op.iLike]: '%femenino%' } }
      });
      
      const personasFallecidas = await this.obtenerPersonasFallecidas();
      
      const totalMadresVivas = await Persona.count({
        where: {
          id_sexo: sexoFemenino?.id_sexo || null,
          identificacion: {
            [Op.notIn]: personasFallecidas.length > 0 ? personasFallecidas : ['']
          }
        }
      });

      // Contar padres vivos
      const sexoMasculino = await Sexo.findOne({
        where: { nombre: { [Op.iLike]: '%masculino%' } }
      });
      
      const totalPadresVivos = await Persona.count({
        where: {
          id_sexo: sexoMasculino?.id_sexo || null,
          identificacion: {
            [Op.notIn]: personasFallecidas.length > 0 ? personasFallecidas : ['']
          }
        }
      });

      // Contar madres fallecidas
      const madresFallecidas = await DifuntosFamilia.count({
        where: {
          [Op.or]: [
            { nombre_completo: { [Op.iRegexp]: '(madre|mamá|doña)' } },
            { observaciones: { [Op.iRegexp]: '(madre|mamá|doña)' } }
          ]
        }
      });

      // Contar padres fallecidos
      const padresFallecidos = await DifuntosFamilia.count({
        where: {
          [Op.or]: [
            { nombre_completo: { [Op.iRegexp]: '(padre|papá|don)' } },
            { observaciones: { [Op.iRegexp]: '(padre|papá|don)' } }
          ]
        }
      });

      // Contar familias
      const totalFamilias = await Familias.count();

      return {
        total_madres_vivas: totalMadresVivas,
        total_padres_vivos: totalPadresVivos,
        total_madres_fallecidas: madresFallecidas,
        total_padres_fallecidos: padresFallecidos,
        total_madres: totalMadresVivas + madresFallecidas,
        total_padres: totalPadresVivos + padresFallecidos,
        total_familias: totalFamilias,
        total_personas_vivas: totalMadresVivas + totalPadresVivos,
        total_personas: totalMadresVivas + totalPadresVivos + madresFallecidas + padresFallecidos
      };

    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }
}

export default new FamiliasConsultasService();
