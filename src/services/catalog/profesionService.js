import { Op } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

class ProfesionService {
  constructor() {
    this.model = null;
  }

  // Método para obtener el modelo de forma lazy
  getModel() {
    if (!this.model) {
      this.model = sequelize.models.Profesion;
      if (!this.model) {
        throw new Error('Modelo Profesion no encontrado en sequelize.models');
      }
    }
    return this.model;
  }

  /**
   * Find the next available ID by checking for gaps in the sequence
   */
  async findNextAvailableId() {
    try {
      const Profesion = this.getModel();
      
      // Get all existing IDs ordered
      const existingRecords = await Profesion.findAll({
        attributes: ['id_profesion'],
        order: [['id_profesion', 'ASC']],
        raw: true
      });

      if (existingRecords.length === 0) {
        return 1; // Start with 1 if no records exist
      }

      const existingIds = existingRecords.map(record => parseInt(record.id_profesion));
      
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

  async getAllProfesiones(filters = {}) {
    try {
      const Profesion = this.getModel();
      
      // Sin filtros - retorna todas las profesiones
      const profesiones = await Profesion.findAll({
        order: [['nombre', 'ASC']],
        attributes: [
          'id_profesion',
          'nombre', 
          'descripcion',
          'created_at',
          'updated_at'
        ]
      });
      
      const total = profesiones.length;
      
      return {
        status: 'success',
        data: profesiones,
        total: total,
        message: `Se encontraron ${total} profesiones`
      };
    } catch (error) {
      console.error('Error en getAllProfesiones:', error);
      return {
        status: 'error',
        data: [],
        total: 0,
        message: `Error al obtener profesiones: ${error.message}`
      };
    }
  }

  async getProfesionById(id) {
    try {
      const Profesion = this.getModel();
      
      const profesion = await Profesion.findByPk(id, {
        attributes: [
          'id_profesion',
          'nombre',
          'descripcion', 
          'created_at',
          'updated_at'
        ]
      });
      
      if (!profesion) {
        const error = new Error('Profesión no encontrada');
        error.statusCode = 404;
        error.code = 'PROFESION_NOT_FOUND';
        throw error;
      }
      
      return profesion;
    } catch (error) {
      console.error('Error en getProfesionById:', error);
      throw error;
    }
  }

  async createProfesion(profesionData) {
    try {
      const Profesion = this.getModel();
      
      // Validar datos requeridos
      if (!profesionData.nombre || profesionData.nombre.trim() === '') {
        const error = new Error('El nombre de la profesión es requerido');
        error.statusCode = 400;
        error.code = 'VALIDATION_ERROR';
        throw error;
      }
      
      // Verificar si ya existe una profesión con el mismo nombre
      const existingProfesion = await Profesion.findOne({
        where: { 
          nombre: profesionData.nombre.trim()
        }
      });
      
      if (existingProfesion) {
        const error = new Error('Ya existe una profesión con este nombre');
        error.statusCode = 409;
        error.code = 'DUPLICATE_NAME';
        throw error;
      }
      
      // Find the next available ID
      const nextId = await this.findNextAvailableId();
      
      const nuevaProfesion = await Profesion.create({
        id_profesion: nextId,
        nombre: profesionData.nombre.trim(),
        descripcion: profesionData.descripcion?.trim() || null
      });
      
      return nuevaProfesion;
    } catch (error) {
      console.error('Error en createProfesion:', error);
      throw error;
    }
  }

  async updateProfesion(id, profesionData) {
    try {
      const Profesion = this.getModel();
      
      const profesion = await Profesion.findByPk(id);
      
      if (!profesion) {
        const error = new Error('Profesión no encontrada');
        error.statusCode = 404;
        error.code = 'PROFESION_NOT_FOUND';
        throw error;
      }
      
      // Si se está actualizando el nombre, verificar que no exista otro con el mismo nombre
      if (profesionData.nombre && profesionData.nombre.trim() !== profesion.nombre) {
        const existingProfesion = await Profesion.findOne({
          where: { 
            nombre: profesionData.nombre.trim(),
            id_profesion: { [Op.ne]: id }
          }
        });
        
        if (existingProfesion) {
          const error = new Error('Ya existe una profesión con este nombre');
          error.statusCode = 409;
          error.code = 'DUPLICATE_NAME';
          throw error;
        }
      }
      
      const datosActualizacion = {};
      
      if (profesionData.nombre !== undefined) {
        datosActualizacion.nombre = profesionData.nombre.trim();
      }
      if (profesionData.descripcion !== undefined) {
        datosActualizacion.descripcion = profesionData.descripcion?.trim() || null;
      }
      
      await profesion.update(datosActualizacion);
      
      return profesion;
    } catch (error) {
      console.error('Error en updateProfesion:', error);
      throw error;
    }
  }

  async deleteProfesion(id) {
    try {
      const Profesion = this.getModel();
      
      const profesion = await Profesion.findByPk(id);
      
      if (!profesion) {
        const error = new Error('Profesión no encontrada');
        error.statusCode = 404;
        error.code = 'PROFESION_NOT_FOUND';
        throw error;
      }
      
      // Hard delete por ahora (hasta que tengamos la columna activo)
      await profesion.destroy();
      
      return { message: 'Profesión eliminada exitosamente' };
    } catch (error) {
      console.error('Error en deleteProfesion:', error);
      throw error;
    }
  }

  async getProfesionesPorCategoria() {
    try {
      const Profesion = this.getModel();
      
      // Retornar array vacío por ahora ya que no tenemos columna categoria
      return [];
    } catch (error) {
      console.error('Error en getProfesionesPorCategoria:', error);
      throw error;
    }
  }

  async getEstadisticasProfesiones() {
    try {
      const { QueryTypes } = await import('sequelize');
      
      // 1. Totales básicos
      const [totales] = await sequelize.query(`
        SELECT 
          COUNT(*) as total_profesiones,
          COUNT(DISTINCT p.id_profesion) FILTER (WHERE per.id_persona IS NOT NULL) as profesiones_en_uso,
          COUNT(DISTINCT p.id_profesion) FILTER (WHERE per.id_persona IS NULL) as profesiones_sin_personas,
          COUNT(DISTINCT per.id_persona) as total_personas_con_profesion
        FROM profesiones p
        LEFT JOIN personas per ON p.id_profesion = per.id_profesion
      `, { type: QueryTypes.SELECT });

      // 2. Top 10 profesiones más comunes
      const top10ProfesionesMasComunes = await sequelize.query(`
        SELECT 
          p.nombre as profesion,
          p.descripcion,
          COUNT(DISTINCT per.id_persona) as total_personas,
          ROUND(COUNT(DISTINCT per.id_persona) * 100.0 / NULLIF((SELECT COUNT(DISTINCT id_persona) FROM personas WHERE id_profesion IS NOT NULL), 0), 2) as porcentaje_sobre_total,
          COUNT(DISTINCT per.id_familia) as familias
        FROM profesiones p
        LEFT JOIN personas per ON p.id_profesion = per.id_profesion
        WHERE per.id_persona IS NOT NULL
        GROUP BY p.id_profesion, p.nombre, p.descripcion
        ORDER BY total_personas DESC
        LIMIT 10
      `, { type: QueryTypes.SELECT });

      // 3. Distribución por familias
      const [familiasStats] = await sequelize.query(`
        SELECT 
          COUNT(DISTINCT per.id_familia) as familias_con_profesionales,
          ROUND(AVG(profesionales_por_familia), 2) as promedio_profesionales_por_familia
        FROM (
          SELECT 
            id_familia,
            COUNT(*) as profesionales_por_familia
          FROM personas
          WHERE id_profesion IS NOT NULL AND id_familia IS NOT NULL
          GROUP BY id_familia
        ) as fam_prof
      `, { type: QueryTypes.SELECT });

      // 4. Distribución geográfica por parroquia
      const distribucionPorParroquia = await sequelize.query(`
        SELECT 
          par.nombre as parroquia,
          COUNT(DISTINCT p.id_profesion) as profesiones_distintas,
          COUNT(DISTINCT per.id_persona) as total_personas_con_profesion,
          COUNT(DISTINCT per.id_familia) as familias,
          (
            SELECT prof.nombre 
            FROM profesiones prof
            JOIN personas pers ON prof.id_profesion = pers.id_profesion
            JOIN familias fams ON pers.id_familia = fams.id_familia
            WHERE fams.id_parroquia = par.id_parroquia
            GROUP BY prof.id_profesion, prof.nombre
            ORDER BY COUNT(*) DESC
            LIMIT 1
          ) as profesion_mas_comun
        FROM parroquia par
        LEFT JOIN familias f ON par.id_parroquia = f.id_parroquia
        LEFT JOIN personas per ON f.id_familia = per.id_familia AND per.id_profesion IS NOT NULL
        LEFT JOIN profesiones p ON per.id_profesion = p.id_profesion
        GROUP BY par.id_parroquia, par.nombre
        HAVING COUNT(DISTINCT per.id_persona) > 0
        ORDER BY total_personas_con_profesion DESC
      `, { type: QueryTypes.SELECT });

      // 5. Profesiones sin asignar (para limpieza)
      const profesionesSinUso = await sequelize.query(`
        SELECT p.nombre as profesion
        FROM profesiones p
        LEFT JOIN personas per ON p.id_profesion = per.id_profesion
        WHERE per.id_persona IS NULL
        ORDER BY p.nombre
      `, { type: QueryTypes.SELECT });

      // 6. Distribución por sexo
      const distribucionPorSexo = await sequelize.query(`
        SELECT 
          s.nombre as sexo,
          COUNT(DISTINCT per.id_persona) as total_personas,
          COUNT(DISTINCT per.id_profesion) as profesiones_distintas,
          ROUND(COUNT(DISTINCT per.id_persona) * 100.0 / NULLIF((SELECT COUNT(DISTINCT id_persona) FROM personas WHERE id_profesion IS NOT NULL), 0), 2) as porcentaje
        FROM sexo s
        LEFT JOIN personas per ON s.id_sexo = per.id_sexo AND per.id_profesion IS NOT NULL
        WHERE per.id_persona IS NOT NULL
        GROUP BY s.id_sexo, s.nombre
        ORDER BY total_personas DESC
      `, { type: QueryTypes.SELECT });

      // 7. Estadísticas por usuario (si existe created_by)
      let distribucionPorUsuario = [];
      try {
        distribucionPorUsuario = await sequelize.query(`
          SELECT 
            u.nombre_completo as usuario,
            COUNT(DISTINCT per.id_persona) as personas_registradas,
            COUNT(DISTINCT per.id_profesion) as profesiones_distintas,
            MAX(per.created_at) as ultimo_registro
          FROM personas per
          LEFT JOIN usuarios u ON per.created_by = u.id
          WHERE per.id_profesion IS NOT NULL AND u.id IS NOT NULL
          GROUP BY u.id, u.nombre_completo
          ORDER BY personas_registradas DESC
          LIMIT 10
        `, { type: QueryTypes.SELECT });
      } catch (error) {
        // Si no existe created_by, ignorar este error
        console.log('Campo created_by no disponible en personas');
      }

      // Construir respuesta completa
      return {
        // Totales básicos
        totalProfesiones: parseInt(totales.total_profesiones) || 0,
        profesionesEnUso: parseInt(totales.profesiones_en_uso) || 0,
        profesionesSinPersonas: parseInt(totales.profesiones_sin_personas) || 0,
        totalPersonasConProfesion: parseInt(totales.total_personas_con_profesion) || 0,
        
        // Top 10 profesiones más comunes
        top10ProfesionesMasComunes: top10ProfesionesMasComunes.map(item => ({
          profesion: item.profesion,
          descripcion: item.descripcion,
          totalPersonas: parseInt(item.total_personas),
          porcentajeSobreTotal: parseFloat(item.porcentaje_sobre_total) || 0,
          familias: parseInt(item.familias)
        })),
        
        // Distribución por familias
        familiasConProfesionales: parseInt(familiasStats.familias_con_profesionales) || 0,
        promedioProfesionalesPorFamilia: parseFloat(familiasStats.promedio_profesionales_por_familia) || 0,
        
        // Distribución geográfica
        distribucionPorParroquia: distribucionPorParroquia.map(item => ({
          parroquia: item.parroquia,
          profesionesDistintas: parseInt(item.profesiones_distintas),
          totalPersonasConProfesion: parseInt(item.total_personas_con_profesion),
          familias: parseInt(item.familias),
          profesionMasComun: item.profesion_mas_comun
        })),
        
        // Distribución por sexo
        distribucionPorSexo: distribucionPorSexo.map(item => ({
          sexo: item.sexo,
          totalPersonas: parseInt(item.total_personas),
          profesionesDistintas: parseInt(item.profesiones_distintas),
          porcentaje: parseFloat(item.porcentaje) || 0
        })),
        
        // Profesiones sin uso (para limpieza)
        profesionesSinUso: profesionesSinUso.map(item => item.profesion),
        
        // Distribución por usuario (si disponible)
        ...(distribucionPorUsuario.length > 0 && {
          distribucionPorUsuario: distribucionPorUsuario.map(item => ({
            usuario: item.usuario,
            personasRegistradas: parseInt(item.personas_registradas),
            profesionesDistintas: parseInt(item.profesiones_distintas),
            ultimoRegistro: item.ultimo_registro
          }))
        })
      };
    } catch (error) {
      console.error('Error en getEstadisticasProfesiones:', error);
      throw error;
    }
  }
}

export default new ProfesionService();
