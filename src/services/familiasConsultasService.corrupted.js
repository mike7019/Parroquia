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
   * Consulta general de familias con información completa y detallada
   */
  async consultarFamiliasConPadresMadres(filtros = {}) {
    try {
      console.log('🔍 Consultando familias con información completa y detallada...');
      
      // Construir condiciones WHERE
      let whereClause = '1=1';
      let replacements = {};
      
      if (filtros.apellido_familiar) {
        whereClause += ' AND f.apellido_familiar ILIKE :apellido_familiar';
        replacements.apellido_familiar = `%${filtros.apellido_familiar}%`;
      }

      if (filtros.sector) {
        whereClause += ' AND f.sector ILIKE :sector';
        replacements.sector = `%${filtros.sector}%`;
      }

      if (filtros.limite) {
        replacements.limite = filtros.limite;
      }

      // Consulta principal para obtener familias con toda la información relacionada
      const familias = await sequelize.query(`
        SELECT 
          f.id_familia,
          f.apellido_familiar,
          f.sector,
          f.direccion_familia,
          f.numero_contacto,
          f.telefono,
          f.email,
          f.tamaño_familia,
          f.tipo_vivienda,
          f.estado_encuesta,
          f.numero_encuestas,
          f.fecha_ultima_encuesta,
          f.codigo_familia,
          f.tutor_responsable,
          f.id_municipio,
          f.id_vereda,
          f.id_sector,
          f."comunionEnCasa",
          
          -- Información de municipio
          m.id_municipio as municipio_id,
          m.nombre_municipio as municipio_nombre,
          
          -- Información de departamento
          d.id_departamento as departamento_id,
          d.nombre_departamento as departamento_nombre,
          
          -- Información de vereda
          v.id_vereda as vereda_id,
          v.nombre as vereda_nombre,
          
          -- Información de sector específico
          s.id_sector as sector_especifico_id,
          s.nombre as sector_especifico_nombre,
          
          -- Información de parroquia
          par.id_parroquia as parroquia_id,
          par.nombre_parroquia as parroquia_nombre
          
        FROM familias f
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN departamentos d ON m.id_departamento = d.id_departamento
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        LEFT JOIN sectores s ON f.id_sector = s.id_sector
        LEFT JOIN parroquias par ON f.id_parroquia = par.id_parroquia
        WHERE ${whereClause}
        ORDER BY f.apellido_familiar ASC
        ${filtros.limite ? 'LIMIT :limite' : ''}
      `, {
        replacements,
        type: QueryTypes.SELECT
      });

      // Para cada familia, obtener información completa
      const familiasCompletas = await Promise.all(
        familias.map(async (familia) => {
          
          // 1. Obtener personas de la familia con información completa
          const personas = await sequelize.query(`
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
              p.en_que_eres_lider,
              p.necesidad_enfermo,
              p.talla_camisa,
              p.talla_pantalon,
              p.talla_zapato,
              p.id_sexo,
              p.id_tipo_identificacion_tipo_identificacion,
              p.id_estado_civil_estado_civil,
              p.id_profesion,
              p.id_parroquia as persona_parroquia_id,
              
              -- Información de sexo
              sex.id_sexo as sexo_id,
              sex.descripcion as sexo_descripcion,
              
              -- Información de tipo de identificación
              ti.id_tipo_identificacion as tipo_id_id,
              ti.nombre as tipo_id_nombre,
              ti.codigo as tipo_id_codigo,
              ti.descripcion as tipo_id_descripcion,
              
              -- Información de estudios
              est.id_estudio as estudio_id,
              est.nombre as estudio_nombre,
              est.descripcion as estudio_descripcion,
              
              -- Información de profesión
              prof.id_profesion as profesion_id,
              prof.nombre as profesion_nombre,
              
              -- Información de parroquia de la persona
              ppar.id_parroquia as persona_parroquia_id_real,
              ppar.nombre_parroquia as persona_parroquia_nombre
              
            FROM personas p
            LEFT JOIN sexos sex ON p.id_sexo = sex.id_sexo
            LEFT JOIN tipos_identificacion ti ON p.id_tipo_identificacion_tipo_identificacion = ti.id_tipo_identificacion
            LEFT JOIN estudios est ON p.estudios = est.nombre
            LEFT JOIN profesiones prof ON p.id_profesion = prof.id_profesion
            LEFT JOIN parroquias ppar ON p.id_parroquia = ppar.id_parroquia
            WHERE p.id_familia_familias = :familiaId
            AND p.identificacion NOT LIKE 'FALLECIDO%'
          `, {
            replacements: { familiaId: familia.id_familia },
            type: QueryTypes.SELECT
          });

          // 2. Obtener personas fallecidas
          const personasFallecidas = await sequelize.query(`
            SELECT 
              p.id_personas,
              p.primer_nombre,
              p.segundo_nombre,
              p.primer_apellido,
              p.segundo_apellido,
              p.identificacion,
              p.estudios as fallecido_data,
              sex.descripcion as sexo_descripcion
            FROM personas p
            LEFT JOIN sexos sex ON p.id_sexo = sex.id_sexo
            WHERE p.id_familia_familias = :familiaId
            AND p.identificacion LIKE 'FALLECIDO%'
          `, {
            replacements: { familiaId: familia.id_familia },
            type: QueryTypes.SELECT
          });

          // 3. Obtener disposición de basuras
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

          // 4. Obtener sistemas de acueducto
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

          // 5. Obtener tipos de vivienda
          const tiposVivienda = await sequelize.query(`
            SELECT 
              tv.id_tipo_vivienda as id,
              tv.nombre,
              tv.descripcion
            FROM familia_tipo_vivienda ftv
            JOIN tipos_vivienda tv ON ftv.id_tipo_vivienda = tv.id_tipo_vivienda
            WHERE ftv.id_familia = :familiaId
          `, {
            replacements: { familiaId: familia.id_familia },
            type: QueryTypes.SELECT
          });

          // Formatear miembros de la familia con información completa
          const familyMembers = personas.map(persona => ({
            id: persona.id_personas,
            nombres: `${persona.primer_nombre} ${persona.segundo_nombre || ''}`.trim(),
            numeroIdentificacion: persona.identificacion,
            tipoIdentificacion: persona.tipo_id_id ? {
              id: persona.tipo_id_id,
              nombre: persona.tipo_id_nombre,
              codigo: persona.tipo_id_codigo,
              descripcion: persona.tipo_id_descripcion
            } : null,
            fechaNacimiento: persona.fecha_nacimiento,
            sexo: persona.sexo_id ? {
              id: persona.sexo_id,
              nombre: persona.sexo_descripcion
            } : null,
            telefono: persona.telefono,
            situacionCivil: {
              id: persona.id_estado_civil_estado_civil
            },
            estudio: persona.estudio_id ? {
              id: persona.estudio_id,
              nombre: persona.estudio_nombre,
              descripcion: persona.estudio_descripcion
            } : { nombre: persona.estudios },
            parentesco: {
              // Se puede expandir con consulta a tabla parentescos
              nombre: "Por definir"
            },
            comunidadCultural: {
              // Se puede expandir con consulta a tabla comunidades_culturales
              nombre: "Por definir"
            },
            enfermedad: {
              // Se puede expandir basado en necesidad_enfermo
              nombre: persona.necesidad_enfermo || "Ninguna"
            },
            "talla_camisa/blusa": persona.talla_camisa,
            talla_pantalon: persona.talla_pantalon,
            talla_zapato: persona.talla_zapato,
            profesion: persona.profesion_id ? {
              id: persona.profesion_id,
              nombre: persona.profesion_nombre
            } : null,
            motivoFechaCelebrar: {
              motivo: "Cumpleaños",
              dia: persona.fecha_nacimiento ? new Date(persona.fecha_nacimiento).getDate().toString().padStart(2, '0') : null,
              mes: persona.fecha_nacimiento ? (new Date(persona.fecha_nacimiento).getMonth() + 1).toString().padStart(2, '0') : null
            },
            informacion_adicional: {
              correo_electronico: persona.correo_electronico,
              direccion: persona.direccion,
              liderazgo: persona.en_que_eres_lider,
              parroquia: persona.persona_parroquia_id_real ? {
                id: persona.persona_parroquia_id_real,
                nombre: persona.persona_parroquia_nombre
              } : null
            }
          }));

          // Formatear personas fallecidas
          const deceasedMembers = personasFallecidas.map(fallecido => {
            let fallecidoData = {};
            try {
              fallecidoData = JSON.parse(fallecido.fallecido_data || '{}');
            } catch (error) {
              fallecidoData = {};
            }

            return {
              nombres: `${fallecido.primer_nombre} ${fallecido.segundo_nombre || ''}`.trim(),
              fechaFallecimiento: fallecidoData.fecha_aniversario || null,
              sexo: {
                nombre: fallecido.sexo_descripcion
              },
              parentesco: {
                id: fallecidoData.era_padre ? "PADRE" : (fallecidoData.era_madre ? "MADRE" : "FAMILIAR"),
                nombre: fallecidoData.era_padre ? "Padre" : (fallecidoData.era_madre ? "Madre" : "Familiar")
              },
              causaFallecimiento: fallecidoData.causa_fallecimiento || "No especificada"
            };
          });

          // Construir estructura completa igual al request
          return {
            id_encuesta: familia.id_familia,
            
            informacionGeneral: {
              municipio: familia.municipio_id ? {
                id: familia.municipio_id,
                nombre: familia.municipio_nombre
              } : null,
              parroquia: familia.parroquia_id ? {
                id: familia.parroquia_id,
                nombre: familia.parroquia_nombre
              } : null,
              sector: familia.sector_especifico_id ? {
                id: familia.sector_especifico_id,
                nombre: familia.sector_especifico_nombre
              } : { nombre: familia.sector },
              vereda: familia.vereda_id ? {
                id: familia.vereda_id,
                nombre: familia.vereda_nombre
              } : null,
              fecha: familia.fecha_ultima_encuesta,
              apellido_familiar: familia.apellido_familiar,
              direccion: familia.direccion_familia,
              telefono: familia.telefono,
              numero_contrato_epm: familia.numero_contacto,
              comunionEnCasa: familia.comunionEnCasa || false
            },
            
            vivienda: {
              tipo_vivienda: tiposVivienda.length > 0 ? {
                id: tiposVivienda[0].id,
                nombre: tiposVivienda[0].nombre
              } : { nombre: familia.tipo_vivienda },
              disposicion_basuras: {
                recolector: disposicionBasuras.some(d => d.nombre.includes('Recolección')),
                quemada: disposicionBasuras.some(d => d.nombre.includes('Quema')),
                enterrada: disposicionBasuras.some(d => d.nombre.includes('Entierro')),
                recicla: disposicionBasuras.some(d => d.nombre.includes('Reciclaje')),
                aire_libre: disposicionBasuras.some(d => d.nombre.includes('Botadero')),
                no_aplica: disposicionBasuras.some(d => d.nombre.includes('Otro'))
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
              sustento_familia: "Por definir", // Se puede agregar campo a tabla familias
              observaciones_encuestador: "Por definir", // Se puede agregar campo a tabla familias  
              autorizacion_datos: true
            },
            
            familyMembers,
            deceasedMembers,
            
            metadata: {
              timestamp: familia.fecha_ultima_encuesta,
              completed: familia.estado_encuesta === 'completed',
              currentStage: 6,
              version: "2.0",
              total_miembros: familyMembers.length,
              total_fallecidos: deceasedMembers.length
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
   * Consulta de madres con información detallada
   */
  async consultarMadresConInformacion(filtros = {}) {
    try {
      // Esta función mantiene compatibilidad con código existente
      return await this.consultarFamiliasCompletas(filtros);
    } catch (error) {
      console.error('❌ Error en consulta de madres:', error);
      throw new Error(`Error al consultar madres: ${error.message}`);
    }
  }

  /**
   * Consulta original de familias con padres y madres (mantenida por compatibilidad)
   */
  async consultarFamiliasConPadresMadres(filtros = {}) {
    try {
      // Redirigir a la nueva función completa
      const resultado = await this.consultarFamiliasCompletas(filtros);
      return {
        exito: true,
        datos: resultado.datos,
        total: resultado.total,
        mensaje: `Se encontraron ${resultado.total} familias`
      };
    } catch (error) {
      console.error('❌ Error en consultarFamiliasConPadresMadres:', error);
      throw new Error(`Error al consultar familias: ${error.message}`);
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
