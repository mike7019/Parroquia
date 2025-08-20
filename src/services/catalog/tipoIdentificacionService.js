import { TipoIdentificacion } from '../../models/catalog/index.js';
import { Op } from 'sequelize';

class TipoIdentificacionService {
    /**
     * Crear un nuevo tipo de identificación
     */
    async createTipoIdentificacion(tipoIdentificacionData) {
        try {
            const { nombre, descripcion, codigo } = tipoIdentificacionData;

            // Verificar si ya existe un tipo con el mismo código
            const existingTipo = await TipoIdentificacion.findOne({
                where: { codigo }
            });

            if (existingTipo) {
                throw new Error('Ya existe un tipo de identificación con ese código');
            }

            const tipoIdentificacion = await TipoIdentificacion.create({
                nombre,
                descripcion,
                codigo
            });

            return tipoIdentificacion;
        } catch (error) {
            throw new Error(`Error creating tipo identificación: ${error.message}`);
        }
    }

    /**
     * Obtener todos los tipos de identificación
     */
    async getAllTiposIdentificacion(options = {}) {
        try {
            const {
                search = null,
                sortBy = 'nombre',
                sortOrder = 'ASC'
            } = options;

            const where = {};
            
            if (search) {
                where[Op.or] = [
                    { nombre: { [Op.iLike]: `%${search}%` } },
                    { descripcion: { [Op.iLike]: `%${search}%` } },
                    { codigo: { [Op.iLike]: `%${search}%` } }
                ];
            }

            const tiposIdentificacion = await TipoIdentificacion.findAll({
                where,
                order: [[sortBy, sortOrder]]
            });

            return tiposIdentificacion;
        } catch (error) {
            throw new Error(`Error fetching tipos identificación: ${error.message}`);
        }
    }

    /**
     * Obtener tipo de identificación por ID
     */
    async getTipoIdentificacionById(id) {
        try {
            const tipoIdentificacion = await TipoIdentificacion.findByPk(id);

            if (!tipoIdentificacion) {
                throw new Error('Tipo de identificación not found');
            }

            return tipoIdentificacion;
        } catch (error) {
            throw new Error(`Error fetching tipo identificación: ${error.message}`);
        }
    }

    /**
     * Actualizar tipo de identificación
     */
    async updateTipoIdentificacion(id, updateData) {
        try {
            const tipoIdentificacion = await TipoIdentificacion.findByPk(id);

            if (!tipoIdentificacion) {
                throw new Error('Tipo de identificación not found');
            }

            // Si se está actualizando el código, verificar que no exista otro con el mismo código
            if (updateData.codigo && updateData.codigo !== tipoIdentificacion.codigo) {
                const existingTipo = await TipoIdentificacion.findOne({
                    where: { 
                        codigo: updateData.codigo,
                        id_tipo_identificacion: { [Op.ne]: id }
                    }
                });

                if (existingTipo) {
                    throw new Error('Ya existe un tipo de identificación con ese código');
                }
            }

            await tipoIdentificacion.update(updateData);

            return tipoIdentificacion;
        } catch (error) {
            throw new Error(`Error updating tipo identificación: ${error.message}`);
        }
    }

    /**
     * Eliminar tipo de identificación
     */
    async deleteTipoIdentificacion(id) {
        try {
            const tipoIdentificacion = await TipoIdentificacion.findByPk(id);

            if (!tipoIdentificacion) {
                throw new Error('Tipo de identificación not found');
            }

            // Verificar si hay personas asociadas
            // Nota: Comentado por ahora, ajustar según la relación real en el modelo
            /*
            const personasCount = await TipoIdentificacion.count({
                include: [{
                    association: 'personas',
                    required: true
                }],
                where: { id_tipo_identificacion: id }
            });

            if (personasCount > 0) {
                throw new Error('Cannot delete tipo identificación: it has associated personas');
            }
            */

            await tipoIdentificacion.destroy();
            return { message: 'Tipo de identificación deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting tipo identificación: ${error.message}`);
        }
    }

    /**
     * Buscar tipo de identificación por código
     */
    async getTipoIdentificacionByCode(codigo) {
        try {
            const tipoIdentificacion = await TipoIdentificacion.findOne({
                where: { codigo }
            });

            if (!tipoIdentificacion) {
                throw new Error('Tipo de identificación not found');
            }

            return tipoIdentificacion;
        } catch (error) {
            throw new Error(`Error fetching tipo identificación by code: ${error.message}`);
        }
    }
}

export default new TipoIdentificacionService();
