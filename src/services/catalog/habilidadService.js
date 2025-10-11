import { Op } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

class HabilidadService {
  constructor() {
    this.model = null;
  }

  // Método para obtener el modelo de forma lazy
  getModel() {
    if (!this.model) {
      this.model = sequelize.models.Habilidad;
      if (!this.model) {
        throw new Error('Modelo Habilidad no encontrado en sequelize.models');
      }
    }
    return this.model;
  }

  /**
   * Find the next available ID by checking for gaps in the sequence
   */
  async findNextAvailableId() {
    try {
      const Habilidad = this.getModel();
      
      // Get all existing IDs ordered
      const existingRecords = await Habilidad.findAll({
        attributes: ['id_habilidad'],
        order: [['id_habilidad', 'ASC']],
        raw: true
      });

      if (existingRecords.length === 0) {
        return 1; // Start with 1 if no records exist
      }

      const existingIds = existingRecords.map(record => parseInt(record.id_habilidad));
      
      // Find the first gap in the sequence
      for (let i = 1; i <= existingIds.length + 1; i++) {
        if (!existingIds.includes(i)) {
          return i;
        }
      }

      // If no gaps found, return the next sequential number
      return Math.max(...existingIds) + 1;
    } catch (error) {
      throw new Error(`Error finding next available ID: ${error.message}`);
    }
  }

  async getAllHabilidades(filters = {}) {
    try {
      const Habilidad = this.getModel();
      
      const whereClause = {};
      
      // Filtrar por activo
      if (filters.activo !== undefined) {
        whereClause.activo = filters.activo;
      }
      
      // Filtrar por categoría
      if (filters.categoria) {
        whereClause.categoria = filters.categoria;
      }
      
      const habilidades = await Habilidad.findAll({
        where: whereClause,
        order: [['nombre', 'ASC']],
        attributes: [
          'id_habilidad',
          'nombre', 
          'descripcion',
          'created_at',
          'updated_at'
        ]
      });
      
      const total = habilidades.length;
      
      return {
        status: 'success',
        data: habilidades,
        total: total,
        message: `Se encontraron ${total} habilidades`
      };
    } catch (error) {
      console.error('Error en getAllHabilidades:', error);
      return {
        status: 'error',
        data: [],
        total: 0,
        message: `Error al obtener habilidades: ${error.message}`
      };
    }
  }

  async getHabilidadById(id) {
    try {
      const Habilidad = this.getModel();
      
      const habilidad = await Habilidad.findByPk(id, {
        attributes: [
          'id_habilidad',
          'nombre',
          'descripcion',
          'created_at',
          'updated_at'
        ]
      });
      
      if (!habilidad) {
        const error = new Error('Habilidad no encontrada');
        error.statusCode = 404;
        error.code = 'HABILIDAD_NOT_FOUND';
        throw error;
      }
      
      return habilidad;
    } catch (error) {
      console.error('Error en getHabilidadById:', error);
      throw error;
    }
  }

  async createHabilidad(habilidadData) {
    try {
      const Habilidad = this.getModel();
      
      // Validar datos requeridos
      if (!habilidadData.nombre || habilidadData.nombre.trim() === '') {
        const error = new Error('El nombre de la habilidad es requerido');
        error.statusCode = 400;
        error.code = 'VALIDATION_ERROR';
        throw error;
      }
      
      if (!habilidadData.descripcion || habilidadData.descripcion.trim() === '') {
        const error = new Error('La descripción de la habilidad es requerida');
        error.statusCode = 400;
        error.code = 'VALIDATION_ERROR';
        throw error;
      }
      
      // Verificar si ya existe una habilidad con el mismo nombre
      const existingHabilidad = await Habilidad.findOne({
        where: { 
          nombre: habilidadData.nombre.trim()
        }
      });
      
      if (existingHabilidad) {
        const error = new Error('Ya existe una habilidad con este nombre');
        error.statusCode = 409;
        error.code = 'DUPLICATE_NAME';
        throw error;
      }
      
      // Find the next available ID
      const nextId = await this.findNextAvailableId();
      
      const nuevaHabilidad = await Habilidad.create({
        id_habilidad: nextId,
        nombre: habilidadData.nombre.trim(),
        descripcion: habilidadData.descripcion.trim()
      });
      
      return nuevaHabilidad;
    } catch (error) {
      console.error('Error en createHabilidad:', error);
      throw error;
    }
  }

  async updateHabilidad(id, habilidadData) {
    try {
      const Habilidad = this.getModel();
      
      const habilidad = await Habilidad.findByPk(id);
      
      if (!habilidad) {
        const error = new Error('Habilidad no encontrada');
        error.statusCode = 404;
        error.code = 'HABILIDAD_NOT_FOUND';
        throw error;
      }
      
      // Si se está actualizando el nombre, verificar que no exista otro con el mismo nombre
      if (habilidadData.nombre && habilidadData.nombre.trim() !== habilidad.nombre) {
        const existingHabilidad = await Habilidad.findOne({
          where: { 
            nombre: habilidadData.nombre.trim(),
            id_habilidad: { [Op.ne]: id }
          }
        });
        
        if (existingHabilidad) {
          const error = new Error('Ya existe una habilidad con este nombre');
          error.statusCode = 409;
          error.code = 'DUPLICATE_NAME';
          throw error;
        }
      }
      
      const datosActualizacion = {};
      
      if (habilidadData.nombre !== undefined) {
        datosActualizacion.nombre = habilidadData.nombre.trim();
      }
      if (habilidadData.descripcion !== undefined) {
        datosActualizacion.descripcion = habilidadData.descripcion?.trim() || null;
      }
      if (habilidadData.categoria !== undefined) {
        datosActualizacion.categoria = habilidadData.categoria?.trim() || null;
      }
      if (habilidadData.activo !== undefined) {
        datosActualizacion.activo = habilidadData.activo;
      }
      
      await habilidad.update(datosActualizacion);
      
      return habilidad;
    } catch (error) {
      console.error('Error en updateHabilidad:', error);
      throw error;
    }
  }

  async deleteHabilidad(id) {
    try {
      const Habilidad = this.getModel();
      
      const habilidad = await Habilidad.findByPk(id);
      
      if (!habilidad) {
        const error = new Error('Habilidad no encontrada');
        error.statusCode = 404;
        error.code = 'HABILIDAD_NOT_FOUND';
        throw error;
      }
      
      // Eliminar permanentemente
      await habilidad.destroy();
      
      return { message: 'Habilidad eliminada exitosamente' };
    } catch (error) {
      console.error('Error en deleteHabilidad:', error);
      throw error;
    }
  }

  async getEstadisticasHabilidades() {
    try {
      const { QueryTypes } = await import('sequelize');
      
      // 1. Totales básicos
      const [totales] = await sequelize.query(`
        SELECT 
          COUNT(*) as total_habilidades,
          COUNT(DISTINCT h.id_habilidad) FILTER (WHERE ph.id_persona IS NOT NULL) as habilidades_en_uso,
          COUNT(DISTINCT h.id_habilidad) FILTER (WHERE ph.id_persona IS NULL) as habilidades_sin_personas,
          COUNT(DISTINCT ph.id_persona) as total_personas_con_habilidades
        FROM habilidades h
        LEFT JOIN persona_habilidad ph ON h.id_habilidad = ph.id_habilidad
      `, { type: QueryTypes.SELECT });

      // 2. Top 10 habilidades más comunes
      const top10HabilidadesMasComunes = await sequelize.query(`
        SELECT 
          h.nombre as habilidad,
          h.descripcion,
          COUNT(DISTINCT ph.id_persona) as total_personas,
          ROUND(COUNT(DISTINCT ph.id_persona) * 100.0 / NULLIF((SELECT COUNT(DISTINCT id_persona) FROM persona_habilidad), 0), 2) as porcentaje_sobre_total,
          COUNT(DISTINCT p.id_familia) as familias,
          COUNT(CASE WHEN ph.nivel = 'Básico' THEN 1 END) as nivel_basico,
          COUNT(CASE WHEN ph.nivel = 'Intermedio' THEN 1 END) as nivel_intermedio,
          COUNT(CASE WHEN ph.nivel = 'Avanzado' THEN 1 END) as nivel_avanzado
        FROM habilidades h
        LEFT JOIN persona_habilidad ph ON h.id_habilidad = ph.id_habilidad
        LEFT JOIN personas p ON ph.id_persona = p.id_persona
        WHERE ph.id_persona IS NOT NULL
        GROUP BY h.id_habilidad, h.nombre, h.descripcion
        ORDER BY total_personas DESC
        LIMIT 10
      `, { type: QueryTypes.SELECT });

      // 3. Distribución por nivel
      const distribucionPorNivel = await sequelize.query(`
        SELECT 
          COALESCE(ph.nivel, 'sin especificar') as nivel,
          COUNT(DISTINCT ph.id_persona) as total_personas,
          COUNT(DISTINCT ph.id_habilidad) as habilidades_distintas,
          ROUND(COUNT(DISTINCT ph.id_persona) * 100.0 / NULLIF((SELECT COUNT(DISTINCT id_persona) FROM persona_habilidad), 0), 2) as porcentaje
        FROM persona_habilidad ph
        GROUP BY ph.nivel
        ORDER BY total_personas DESC
      `, { type: QueryTypes.SELECT });

      // 4. Distribución por familias
      const [familiasStats] = await sequelize.query(`
        SELECT 
          COUNT(DISTINCT p.id_familia) as familias_con_habilidades,
          ROUND(AVG(habilidades_por_familia), 2) as promedio_habilidades_por_familia,
          COUNT(DISTINCT CASE WHEN habilidades_por_familia > 1 THEN p.id_familia END) as familias_con_multiples_habilidades
        FROM (
          SELECT 
            p.id_familia,
            COUNT(DISTINCT ph.id_habilidad) as habilidades_por_familia
          FROM personas p
          JOIN persona_habilidad ph ON p.id_persona = ph.id_persona
          WHERE p.id_familia IS NOT NULL
          GROUP BY p.id_familia
        ) as fam_hab
      `, { type: QueryTypes.SELECT });

      // 5. Distribución geográfica por parroquia
      const distribucionPorParroquia = await sequelize.query(`
        SELECT 
          par.nombre as parroquia,
          COUNT(DISTINCT h.id_habilidad) as habilidades_distintas,
          COUNT(DISTINCT p.id_persona) as total_personas_con_habilidades,
          COUNT(DISTINCT f.id_familia) as familias,
          (
            SELECT hab.nombre 
            FROM habilidades hab
            JOIN persona_habilidad persh ON hab.id_habilidad = persh.id_habilidad
            JOIN personas pers ON persh.id_persona = pers.id_persona
            JOIN familias fams ON pers.id_familia = fams.id_familia
            WHERE fams.id_parroquia = par.id_parroquia
            GROUP BY hab.id_habilidad, hab.nombre
            ORDER BY COUNT(*) DESC
            LIMIT 1
          ) as habilidad_mas_comun
        FROM parroquia par
        LEFT JOIN familias f ON par.id_parroquia = f.id_parroquia
        LEFT JOIN personas p ON f.id_familia = p.id_familia
        LEFT JOIN persona_habilidad ph ON p.id_persona = ph.id_persona
        LEFT JOIN habilidades h ON ph.id_habilidad = h.id_habilidad
        GROUP BY par.id_parroquia, par.nombre
        HAVING COUNT(DISTINCT p.id_persona) > 0
        ORDER BY total_personas_con_habilidades DESC
      `, { type: QueryTypes.SELECT });

      // 6. Habilidades sin asignar (para limpieza)
      const habilidadesSinUso = await sequelize.query(`
        SELECT h.nombre as habilidad
        FROM habilidades h
        LEFT JOIN persona_habilidad ph ON h.id_habilidad = ph.id_habilidad
        WHERE ph.id_persona IS NULL
        ORDER BY h.nombre
      `, { type: QueryTypes.SELECT });

      // 7. Distribución por sexo
      const distribucionPorSexo = await sequelize.query(`
        SELECT 
          s.nombre as sexo,
          COUNT(DISTINCT p.id_persona) as total_personas,
          COUNT(DISTINCT ph.id_habilidad) as habilidades_distintas,
          ROUND(COUNT(DISTINCT p.id_persona) * 100.0 / NULLIF((SELECT COUNT(DISTINCT id_persona) FROM persona_habilidad), 0), 2) as porcentaje
        FROM sexo s
        LEFT JOIN personas p ON s.id_sexo = p.id_sexo
        LEFT JOIN persona_habilidad ph ON p.id_persona = ph.id_persona
        WHERE ph.id_persona IS NOT NULL
        GROUP BY s.id_sexo, s.nombre
        ORDER BY total_personas DESC
      `, { type: QueryTypes.SELECT });

      // 8. Estadísticas por usuario (si existe created_by)
      let distribucionPorUsuario = [];
      try {
        distribucionPorUsuario = await sequelize.query(`
          SELECT 
            u.nombre_completo as usuario,
            COUNT(DISTINCT ph.id_persona) as personas_registradas,
            COUNT(DISTINCT ph.id_habilidad) as habilidades_distintas,
            MAX(ph.createdAt) as ultimo_registro
          FROM persona_habilidad ph
          LEFT JOIN usuarios u ON ph.created_by = u.id
          WHERE u.id IS NOT NULL
          GROUP BY u.id, u.nombre_completo
          ORDER BY personas_registradas DESC
          LIMIT 10
        `, { type: QueryTypes.SELECT });
      } catch (error) {
        console.log('Campo created_by no disponible en persona_habilidad');
      }

      // Construir respuesta completa
      return {
        // Totales básicos
        totalHabilidades: parseInt(totales.total_habilidades) || 0,
        habilidadesEnUso: parseInt(totales.habilidades_en_uso) || 0,
        habilidadesSinPersonas: parseInt(totales.habilidades_sin_personas) || 0,
        totalPersonasConHabilidades: parseInt(totales.total_personas_con_habilidades) || 0,
        
        // Top 10 habilidades más comunes
        top10HabilidadesMasComunes: top10HabilidadesMasComunes.map(item => ({
          habilidad: item.habilidad,
          descripcion: item.descripcion,
          totalPersonas: parseInt(item.total_personas),
          porcentajeSobreTotal: parseFloat(item.porcentaje_sobre_total) || 0,
          familias: parseInt(item.familias),
          nivel: {
            basico: parseInt(item.nivel_basico) || 0,
            intermedio: parseInt(item.nivel_intermedio) || 0,
            avanzado: parseInt(item.nivel_avanzado) || 0
          }
        })),
        
        // Distribución por nivel
        distribucionPorNivel: distribucionPorNivel.map(item => ({
          nivel: item.nivel,
          totalPersonas: parseInt(item.total_personas),
          habilidadesDistintas: parseInt(item.habilidades_distintas),
          porcentaje: parseFloat(item.porcentaje) || 0
        })),
        
        // Distribución por familias
        familiasConHabilidades: parseInt(familiasStats.familias_con_habilidades) || 0,
        promedioHabilidadesPorFamilia: parseFloat(familiasStats.promedio_habilidades_por_familia) || 0,
        familiasConMultiplesHabilidades: parseInt(familiasStats.familias_con_multiples_habilidades) || 0,
        
        // Distribución geográfica
        distribucionPorParroquia: distribucionPorParroquia.map(item => ({
          parroquia: item.parroquia,
          habilidadesDistintas: parseInt(item.habilidades_distintas),
          totalPersonasConHabilidades: parseInt(item.total_personas_con_habilidades),
          familias: parseInt(item.familias),
          habilidadMasComun: item.habilidad_mas_comun
        })),
        
        // Distribución por sexo
        distribucionPorSexo: distribucionPorSexo.map(item => ({
          sexo: item.sexo,
          totalPersonas: parseInt(item.total_personas),
          habilidadesDistintas: parseInt(item.habilidades_distintas),
          porcentaje: parseFloat(item.porcentaje) || 0
        })),
        
        // Habilidades sin uso (para limpieza)
        habilidadesSinUso: habilidadesSinUso.map(item => item.habilidad),
        
        // Distribución por usuario (si disponible)
        ...(distribucionPorUsuario.length > 0 && {
          distribucionPorUsuario: distribucionPorUsuario.map(item => ({
            usuario: item.usuario,
            personasRegistradas: parseInt(item.personas_registradas),
            habilidadesDistintas: parseInt(item.habilidades_distintas),
            ultimoRegistro: item.ultimo_registro
          }))
        })
      };
    } catch (error) {
      console.error('Error en getEstadisticasHabilidades:', error);
      throw error;
    }
  }
}

export default new HabilidadService();
