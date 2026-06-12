import sequelize from '../../../config/sequelize.js';
import { QueryTypes, Op } from 'sequelize';
import { NotFoundError, ConflictError, ValidationError } from '../../utils/errors.js';

const getTipoNecesidadEnfermoModel = () => sequelize.models.TipoNecesidadEnfermo;

class NecesidadEnfermoService {

  // ─── CATÁLOGO: tipos_necesidad_enfermo ────────────────────────────────────────

  /**
   * Obtener todos los tipos de necesidad del enfermo con paginación y filtros
   */
  async getAllTiposNecesidad(options = {}) {
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

      const { rows: datos, count: total } = await getTipoNecesidadEnfermoModel().findAndCountAll({
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
        message: `Se encontraron ${total} tipos de necesidad del enfermo`
      };
    } catch (error) {
      throw new Error(`Error al obtener tipos de necesidad del enfermo: ${error.message}`);
    }
  }

  /**
   * Obtener tipo de necesidad por ID (con personas asociadas opcional)
   */
  async getTipoNecesidadById(id, incluirPersonas = false) {
    try {
      const tipoNecesidad = await getTipoNecesidadEnfermoModel().findByPk(id);
      if (!tipoNecesidad) throw new NotFoundError('Tipo de necesidad del enfermo no encontrado');

      const result = tipoNecesidad.toJSON();

      if (incluirPersonas) {
        const personas = await sequelize.query(`
          SELECT
            p.id_personas,
            COALESCE(p.nombres, '') as nombre_completo,
            p.identificacion,
            pne.descripcion as descripcion_necesidad,
            pne.activo as necesidad_activa,
            pne."createdAt" as fecha_asignacion
          FROM persona_necesidad_enfermo pne
          INNER JOIN personas p ON pne.id_persona = p.id_personas
          WHERE pne.id_tipo_necesidad_enfermo = :id AND pne.activo = TRUE
          ORDER BY p.nombres
        `, { replacements: { id }, type: QueryTypes.SELECT });

        result.personas = personas;
        result.total_personas = personas.length;
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new Error(`Error al obtener tipo de necesidad del enfermo: ${error.message}`);
    }
  }

  /**
   * Crear tipo de necesidad del enfermo
   */
  async createTipoNecesidad(data) {
    try {
      const { nombre, descripcion } = data;

      if (!nombre || !nombre.trim()) {
        throw new ValidationError('El nombre del tipo de necesidad del enfermo es requerido');
      }

      const existe = await getTipoNecesidadEnfermoModel().findOne({
        where: { nombre: { [Op.iLike]: nombre.trim() } }
      });
      if (existe) throw new ConflictError('Ya existe un tipo de necesidad del enfermo con este nombre');

      const tipoNecesidad = await getTipoNecesidadEnfermoModel().create({
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        activo: true
      });

      return tipoNecesidad;
    } catch (error) {
      if (error instanceof ConflictError || error instanceof ValidationError) throw error;
      throw new Error(`Error al crear tipo de necesidad del enfermo: ${error.message}`);
    }
  }

  /**
   * Actualizar tipo de necesidad del enfermo
   */
  async updateTipoNecesidad(id, data) {
    try {
      const tipoNecesidad = await getTipoNecesidadEnfermoModel().findByPk(id);
      if (!tipoNecesidad) throw new NotFoundError('Tipo de necesidad del enfermo no encontrado');

      const { nombre, descripcion, activo } = data;

      if (nombre && nombre.trim() !== tipoNecesidad.nombre) {
        const existe = await getTipoNecesidadEnfermoModel().findOne({
          where: { nombre: { [Op.iLike]: nombre.trim() }, id_tipo_necesidad_enfermo: { [Op.ne]: id } }
        });
        if (existe) throw new ConflictError('Ya existe un tipo de necesidad del enfermo con este nombre');
      }

      await tipoNecesidad.update({
        nombre: nombre ? nombre.trim() : tipoNecesidad.nombre,
        descripcion: descripcion !== undefined ? (descripcion?.trim() || null) : tipoNecesidad.descripcion,
        activo: activo !== undefined ? activo : tipoNecesidad.activo
      });

      return tipoNecesidad;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) throw error;
      throw new Error(`Error al actualizar tipo de necesidad del enfermo: ${error.message}`);
    }
  }

  /**
   * Eliminar tipo de necesidad del enfermo (soft delete)
   */
  async deleteTipoNecesidad(id) {
    try {
      const tipoNecesidad = await getTipoNecesidadEnfermoModel().findByPk(id);
      if (!tipoNecesidad) throw new NotFoundError('Tipo de necesidad del enfermo no encontrado');

      const [{ total_personas }] = await sequelize.query(`
        SELECT COUNT(*) as total_personas
        FROM persona_necesidad_enfermo
        WHERE id_tipo_necesidad_enfermo = :id AND activo = TRUE
      `, { replacements: { id }, type: QueryTypes.SELECT });

      if (parseInt(total_personas) > 0) {
        throw new ConflictError(
          `No se puede eliminar: hay ${total_personas} persona(s) asociadas a este tipo de necesidad`
        );
      }

      await tipoNecesidad.update({ activo: false });

      return { mensaje: 'Tipo de necesidad del enfermo desactivado exitosamente' };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) throw error;
      throw new Error(`Error al eliminar tipo de necesidad del enfermo: ${error.message}`);
    }
  }

  /**
   * Para select/dropdown
   */
  async getTiposNecesidadSelect() {
    try {
      const tipos = await getTipoNecesidadEnfermoModel().findAll({
        where: { activo: true },
        attributes: ['id_tipo_necesidad_enfermo', 'nombre', 'descripcion'],
        order: [['nombre', 'ASC']]
      });
      return tipos.map(t => ({
        value: t.id_tipo_necesidad_enfermo,
        label: t.nombre,
        descripcion: t.descripcion
      }));
    } catch (error) {
      throw new Error(`Error al obtener tipos de necesidad del enfermo para select: ${error.message}`);
    }
  }

  /**
   * Estadísticas de tipos de necesidad del enfermo
   */
  async getStats() {
    try {
      const resumen = await sequelize.query(`
        SELECT
          COUNT(*) FILTER (WHERE activo = TRUE)  as activos,
          COUNT(*) FILTER (WHERE activo = FALSE) as inactivos,
          COUNT(*)                               as total
        FROM tipos_necesidad_enfermo
      `, { type: QueryTypes.SELECT });

      const distribucion = await sequelize.query(`
        SELECT
          tne.id_tipo_necesidad_enfermo,
          tne.nombre,
          COUNT(pne.id_persona_necesidad_enfermo) as total_personas,
          COUNT(pne.id_persona_necesidad_enfermo) FILTER (WHERE pne.activo = TRUE) as personas_activas
        FROM tipos_necesidad_enfermo tne
        LEFT JOIN persona_necesidad_enfermo pne ON tne.id_tipo_necesidad_enfermo = pne.id_tipo_necesidad_enfermo
        WHERE tne.activo = TRUE
        GROUP BY tne.id_tipo_necesidad_enfermo, tne.nombre
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

  // ─── RELACIÓN PERSONA ↔ NECESIDAD DEL ENFERMO ────────────────────────────────

  /**
   * Obtener las necesidades de una persona
   */
  async getNecesidadesByPersona(idPersona) {
    try {
      const persona = await sequelize.query(
        `SELECT id_personas FROM personas WHERE id_personas = :id`,
        { replacements: { id: idPersona }, type: QueryTypes.SELECT }
      );
      if (persona.length === 0) throw new NotFoundError('Persona no encontrada');

      const necesidades = await sequelize.query(`
        SELECT
          pne.id_persona_necesidad_enfermo,
          pne.id_tipo_necesidad_enfermo,
          tne.nombre  as tipo_necesidad,
          tne.descripcion as descripcion_tipo,
          pne.descripcion as descripcion_especifica,
          pne.activo,
          pne."createdAt" as fecha_asignacion,
          pne."updatedAt" as fecha_actualizacion
        FROM persona_necesidad_enfermo pne
        INNER JOIN tipos_necesidad_enfermo tne ON pne.id_tipo_necesidad_enfermo = tne.id_tipo_necesidad_enfermo
        WHERE pne.id_persona = :idPersona
        ORDER BY tne.nombre
      `, { replacements: { idPersona }, type: QueryTypes.SELECT });

      return necesidades;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new Error(`Error al obtener necesidades de la persona: ${error.message}`);
    }
  }

  /**
   * Asociar persona a un tipo de necesidad del enfermo
   */
  async asociarPersonaNecesidad(idPersona, idTipoNecesidad, descripcion = null) {
    try {
      const persona = await sequelize.query(
        `SELECT id_personas FROM personas WHERE id_personas = :id`,
        { replacements: { id: idPersona }, type: QueryTypes.SELECT }
      );
      if (persona.length === 0) throw new NotFoundError('Persona no encontrada');

      const tipo = await getTipoNecesidadEnfermoModel().findByPk(idTipoNecesidad);
      if (!tipo) throw new NotFoundError('Tipo de necesidad del enfermo no encontrado');
      if (!tipo.activo) throw new ValidationError('El tipo de necesidad del enfermo está inactivo');

      const existe = await sequelize.query(`
        SELECT id_persona_necesidad_enfermo FROM persona_necesidad_enfermo
        WHERE id_persona = :idPersona AND id_tipo_necesidad_enfermo = :idTipo
      `, { replacements: { idPersona, idTipo: idTipoNecesidad }, type: QueryTypes.SELECT });

      if (existe.length > 0) {
        await sequelize.query(`
          UPDATE persona_necesidad_enfermo
          SET activo = TRUE, descripcion = :desc, "updatedAt" = NOW()
          WHERE id_persona = :idPersona AND id_tipo_necesidad_enfermo = :idTipo
        `, {
          replacements: { idPersona, idTipo: idTipoNecesidad, desc: descripcion || null },
          type: QueryTypes.UPDATE
        });
        return { mensaje: 'Asociación de necesidad actualizada', accion: 'reactivada' };
      }

      await sequelize.query(`
        INSERT INTO persona_necesidad_enfermo (id_persona, id_tipo_necesidad_enfermo, descripcion, activo, "createdAt", "updatedAt")
        VALUES (:idPersona, :idTipo, :desc, TRUE, NOW(), NOW())
      `, {
        replacements: { idPersona, idTipo: idTipoNecesidad, desc: descripcion || null },
        type: QueryTypes.INSERT
      });

      return { mensaje: 'Necesidad del enfermo asignada a la persona exitosamente', accion: 'creada' };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
      throw new Error(`Error al asociar persona con necesidad del enfermo: ${error.message}`);
    }
  }

  /**
   * Sincronizar necesidades de una persona desde la encuesta.
   * Recibe un array de objetos { id, nombre } igual que liderazgos/destrezas.
   * Reactiva los que vuelven, desactiva los que ya no están en la lista.
   */
  async sincronizarNecesidadesPersona(idPersona, necesidades, transaction = null) {
    const idsToAssociate = (Array.isArray(necesidades) ? necesidades : [])
      .map(item => parseInt(typeof item === 'object' && item !== null ? item.id : item))
      .filter(id => !isNaN(id) && id > 0);

    if (idsToAssociate.length > 0) {
      const placeholders = idsToAssociate.map((_, i) => `:nid_${i}`).join(', ');
      const replacements = { idPersona };
      idsToAssociate.forEach((id, i) => { replacements[`nid_${i}`] = id; });

      await sequelize.query(`
        UPDATE persona_necesidad_enfermo SET activo = FALSE, "updatedAt" = NOW()
        WHERE id_persona = :idPersona AND activo = TRUE
          AND id_tipo_necesidad_enfermo NOT IN (${placeholders})
      `, { replacements, transaction, type: QueryTypes.UPDATE });
    } else {
      await sequelize.query(`
        UPDATE persona_necesidad_enfermo SET activo = FALSE, "updatedAt" = NOW()
        WHERE id_persona = :idPersona AND activo = TRUE
      `, { replacements: { idPersona }, transaction, type: QueryTypes.UPDATE });
    }

    for (const tipoId of idsToAssociate) {
      await sequelize.query(`
        INSERT INTO persona_necesidad_enfermo (id_persona, id_tipo_necesidad_enfermo, activo, "createdAt", "updatedAt")
        VALUES (:idPersona, :tipoId, TRUE, NOW(), NOW())
        ON CONFLICT (id_persona, id_tipo_necesidad_enfermo)
        DO UPDATE SET activo = TRUE, "updatedAt" = NOW()
      `, { replacements: { idPersona, tipoId }, transaction, type: QueryTypes.INSERT });
    }

    return { sincronizados: idsToAssociate.length };
  }

  /**
   * Desasociar persona de un tipo de necesidad del enfermo (soft delete)
   */
  async desasociarPersonaNecesidad(idPersona, idTipoNecesidad) {
    try {
      const [result] = await sequelize.query(`
        UPDATE persona_necesidad_enfermo
        SET activo = FALSE, "updatedAt" = NOW()
        WHERE id_persona = :idPersona AND id_tipo_necesidad_enfermo = :idTipo AND activo = TRUE
        RETURNING id_persona_necesidad_enfermo
      `, {
        replacements: { idPersona, idTipo: idTipoNecesidad },
        type: QueryTypes.UPDATE
      });

      if (!result || result.length === 0) {
        throw new NotFoundError('No existe una asociación activa entre esta persona y el tipo de necesidad del enfermo');
      }

      return { mensaje: 'Necesidad del enfermo desasociada de la persona exitosamente' };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new Error(`Error al desasociar persona de necesidad del enfermo: ${error.message}`);
    }
  }
}

export default new NecesidadEnfermoService();
