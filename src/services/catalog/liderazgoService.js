import sequelize from '../../../config/sequelize.js';
import { QueryTypes, Op } from 'sequelize';
import { NotFoundError, ConflictError, ValidationError } from '../../utils/errors.js';

const getTipoLiderazgoModel = () => sequelize.models.TipoLiderazgo;

class LiderazgoService {

  // ─── CATÁLOGO: tipos_liderazgo ────────────────────────────────────────────

  /**
   * Obtener todos los tipos de liderazgo con paginación y filtros
   */
  async getAllTiposLiderazgo(options = {}) {
    try {
      const {
        search = '',
        activo,
        sortBy = 'nombre',
        sortOrder = 'ASC',
        page = 1,
        limit = 50
      } = options;

      const where = {};
      if (search && search.trim()) {
        where.nombre = { [Op.iLike]: `%${search.trim()}%` };
      }
      if (activo !== null && activo !== undefined) {
        where.activo = activo;
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { rows: datos, count: total } = await getTipoLiderazgoModel().findAndCountAll({
        where,
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset
      });

      return {
        status: 'success',
        data: datos,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
        message: `Se encontraron ${total} tipos de liderazgo`
      };
    } catch (error) {
      throw new Error(`Error al obtener tipos de liderazgo: ${error.message}`);
    }
  }

  /**
   * Obtener tipo de liderazgo por ID (con personas asociadas opcional)
   */
  async getTipoLiderazgoById(id, incluirPersonas = false) {
    try {
      const tipoLiderazgo = await getTipoLiderazgoModel().findByPk(id);
      if (!tipoLiderazgo) throw new NotFoundError('Tipo de liderazgo no encontrado');

      const result = tipoLiderazgo.toJSON();

      if (incluirPersonas) {
        const personas = await sequelize.query(`
          SELECT
            p.id_personas,
            TRIM(CONCAT(
              COALESCE(p.primer_nombre, ''), ' ',
              COALESCE(p.segundo_nombre, ''), ' ',
              COALESCE(p.primer_apellido, ''), ' ',
              COALESCE(p.segundo_apellido, '')
            )) as nombre_completo,
            p.identificacion,
            pl.descripcion as descripcion_liderazgo,
            pl.activo as liderazgo_activo,
            pl."createdAt" as fecha_asignacion
          FROM persona_liderazgo pl
          INNER JOIN personas p ON pl.id_persona = p.id_personas
          WHERE pl.id_tipo_liderazgo = :id AND pl.activo = TRUE
          ORDER BY p.primer_apellido, p.primer_nombre
        `, { replacements: { id }, type: QueryTypes.SELECT });

        result.personas = personas;
        result.total_personas = personas.length;
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new Error(`Error al obtener tipo de liderazgo: ${error.message}`);
    }
  }

  /**
   * Crear tipo de liderazgo
   */
  async createTipoLiderazgo(data) {
    try {
      const { nombre, descripcion } = data;

      if (!nombre || !nombre.trim()) {
        throw new ValidationError('El nombre del tipo de liderazgo es requerido');
      }

      const existe = await getTipoLiderazgoModel().findOne({
        where: { nombre: { [Op.iLike]: nombre.trim() } }
      });
      if (existe) throw new ConflictError('Ya existe un tipo de liderazgo con este nombre');

      const tipoLiderazgo = await getTipoLiderazgoModel().create({
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        activo: true
      });

      return tipoLiderazgo;
    } catch (error) {
      if (error instanceof ConflictError || error instanceof ValidationError) throw error;
      throw new Error(`Error al crear tipo de liderazgo: ${error.message}`);
    }
  }

  /**
   * Actualizar tipo de liderazgo
   */
  async updateTipoLiderazgo(id, data) {
    try {
      const tipoLiderazgo = await getTipoLiderazgoModel().findByPk(id);
      if (!tipoLiderazgo) throw new NotFoundError('Tipo de liderazgo no encontrado');

      const { nombre, descripcion, activo } = data;

      if (nombre && nombre.trim() !== tipoLiderazgo.nombre) {
        const existe = await getTipoLiderazgoModel().findOne({
          where: { nombre: { [Op.iLike]: nombre.trim() }, id_tipo_liderazgo: { [Op.ne]: id } }
        });
        if (existe) throw new ConflictError('Ya existe un tipo de liderazgo con este nombre');
      }

      await tipoLiderazgo.update({
        nombre: nombre ? nombre.trim() : tipoLiderazgo.nombre,
        descripcion: descripcion !== undefined ? (descripcion?.trim() || null) : tipoLiderazgo.descripcion,
        activo: activo !== undefined ? activo : tipoLiderazgo.activo
      });

      return tipoLiderazgo;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) throw error;
      throw new Error(`Error al actualizar tipo de liderazgo: ${error.message}`);
    }
  }

  /**
   * Eliminar tipo de liderazgo (soft delete)
   */
  async deleteTipoLiderazgo(id) {
    try {
      const tipoLiderazgo = await getTipoLiderazgoModel().findByPk(id);
      if (!tipoLiderazgo) throw new NotFoundError('Tipo de liderazgo no encontrado');

      const [{ total_personas }] = await sequelize.query(`
        SELECT COUNT(*) as total_personas
        FROM persona_liderazgo
        WHERE id_tipo_liderazgo = :id AND activo = TRUE
      `, { replacements: { id }, type: QueryTypes.SELECT });

      if (parseInt(total_personas) > 0) {
        throw new ConflictError(
          `No se puede eliminar: hay ${total_personas} persona(s) asociadas a este tipo de liderazgo`
        );
      }

      await tipoLiderazgo.update({ activo: false });

      return { mensaje: 'Tipo de liderazgo desactivado exitosamente' };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) throw error;
      throw new Error(`Error al eliminar tipo de liderazgo: ${error.message}`);
    }
  }

  /**
   * Para select/dropdown
   */
  async getTiposLiderazgoSelect() {
    try {
      const tipos = await getTipoLiderazgoModel().findAll({
        where: { activo: true },
        attributes: ['id_tipo_liderazgo', 'nombre', 'descripcion'],
        order: [['nombre', 'ASC']]
      });
      return tipos.map(t => ({
        value: t.id_tipo_liderazgo,
        label: t.nombre,
        descripcion: t.descripcion
      }));
    } catch (error) {
      throw new Error(`Error al obtener tipos de liderazgo para select: ${error.message}`);
    }
  }

  /**
   * Estadísticas de tipos de liderazgo
   */
  async getStats() {
    try {
      const resumen = await sequelize.query(`
        SELECT
          COUNT(*) FILTER (WHERE activo = TRUE)  as activos,
          COUNT(*) FILTER (WHERE activo = FALSE) as inactivos,
          COUNT(*)                               as total
        FROM tipos_liderazgo
      `, { type: QueryTypes.SELECT });

      const distribucion = await sequelize.query(`
        SELECT
          tl.id_tipo_liderazgo,
          tl.nombre,
          COUNT(pl.id_persona_liderazgo) as total_personas,
          COUNT(pl.id_persona_liderazgo) FILTER (WHERE pl.activo = TRUE) as personas_activas
        FROM tipos_liderazgo tl
        LEFT JOIN persona_liderazgo pl ON tl.id_tipo_liderazgo = pl.id_tipo_liderazgo
        WHERE tl.activo = TRUE
        GROUP BY tl.id_tipo_liderazgo, tl.nombre
        ORDER BY total_personas DESC
      `, { type: QueryTypes.SELECT });

      return {
        resumen: resumen[0],
        distribucion_por_tipo: distribucion
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  // ─── RELACIÓN PERSONA ↔ LIDERAZGO ─────────────────────────────────────────

  /**
   * Obtener los liderazgos de una persona
   */
  async getLiderazgosByPersona(idPersona) {
    try {
      const persona = await sequelize.query(
        `SELECT id_personas FROM personas WHERE id_personas = :id`,
        { replacements: { id: idPersona }, type: QueryTypes.SELECT }
      );
      if (persona.length === 0) throw new NotFoundError('Persona no encontrada');

      const liderazgos = await sequelize.query(`
        SELECT
          pl.id_persona_liderazgo,
          pl.id_tipo_liderazgo,
          tl.nombre  as tipo_liderazgo,
          tl.descripcion as descripcion_tipo,
          pl.descripcion as descripcion_especifica,
          pl.activo,
          pl."createdAt" as fecha_asignacion,
          pl."updatedAt" as fecha_actualizacion
        FROM persona_liderazgo pl
        INNER JOIN tipos_liderazgo tl ON pl.id_tipo_liderazgo = tl.id_tipo_liderazgo
        WHERE pl.id_persona = :idPersona
        ORDER BY tl.nombre
      `, { replacements: { idPersona }, type: QueryTypes.SELECT });

      return liderazgos;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new Error(`Error al obtener liderazgos de la persona: ${error.message}`);
    }
  }

  /**
   * Asociar persona a un tipo de liderazgo
   */
  async asociarPersonaLiderazgo(idPersona, idTipoLiderazgo, descripcion = null) {
    try {
      const persona = await sequelize.query(
        `SELECT id_personas FROM personas WHERE id_personas = :id`,
        { replacements: { id: idPersona }, type: QueryTypes.SELECT }
      );
      if (persona.length === 0) throw new NotFoundError('Persona no encontrada');

      const tipo = await getTipoLiderazgoModel().findByPk(idTipoLiderazgo);
      if (!tipo) throw new NotFoundError('Tipo de liderazgo no encontrado');
      if (!tipo.activo) throw new ValidationError('El tipo de liderazgo está inactivo');

      const existe = await sequelize.query(`
        SELECT id_persona_liderazgo FROM persona_liderazgo
        WHERE id_persona = :idPersona AND id_tipo_liderazgo = :idTipo
      `, { replacements: { idPersona, idTipo: idTipoLiderazgo }, type: QueryTypes.SELECT });

      if (existe.length > 0) {
        // Si existe pero está inactivo, lo reactiva
        await sequelize.query(`
          UPDATE persona_liderazgo
          SET activo = TRUE, descripcion = :desc, "updatedAt" = NOW()
          WHERE id_persona = :idPersona AND id_tipo_liderazgo = :idTipo
        `, {
          replacements: { idPersona, idTipo: idTipoLiderazgo, desc: descripcion || null },
          type: QueryTypes.UPDATE
        });
        return { mensaje: 'Asociación de liderazgo actualizada', accion: 'reactivada' };
      }

      await sequelize.query(`
        INSERT INTO persona_liderazgo (id_persona, id_tipo_liderazgo, descripcion, activo, "createdAt", "updatedAt")
        VALUES (:idPersona, :idTipo, :desc, TRUE, NOW(), NOW())
      `, {
        replacements: { idPersona, idTipo: idTipoLiderazgo, desc: descripcion || null },
        type: QueryTypes.INSERT
      });

      return { mensaje: 'Liderazgo asignado a la persona exitosamente', accion: 'creada' };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
      throw new Error(`Error al asociar persona con liderazgo: ${error.message}`);
    }
  }

  /**
   * Desasociar persona de un tipo de liderazgo (soft delete)
   */
  async desasociarPersonaLiderazgo(idPersona, idTipoLiderazgo) {
    try {
      const [result] = await sequelize.query(`
        UPDATE persona_liderazgo
        SET activo = FALSE, "updatedAt" = NOW()
        WHERE id_persona = :idPersona AND id_tipo_liderazgo = :idTipo AND activo = TRUE
        RETURNING id_persona_liderazgo
      `, {
        replacements: { idPersona, idTipo: idTipoLiderazgo },
        type: QueryTypes.UPDATE
      });

      if (!result || result.length === 0) {
        throw new NotFoundError('No existe una asociación activa entre esta persona y el tipo de liderazgo');
      }

      return { mensaje: 'Liderazgo desasociado de la persona exitosamente' };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new Error(`Error al desasociar persona de liderazgo: ${error.message}`);
    }
  }
}

export default new LiderazgoService();
