import { TipoIdentificacion } from '../../models/catalog/index.js';

/**
 * Obtener todos los tipos de identificación
 */
const getAllTiposIdentificacion = async () => {
    try {
        const tiposIdentificacion = await TipoIdentificacion.findAll({
            order: [['descripcion', 'ASC']]
        });
        
        return tiposIdentificacion;
    } catch (error) {
        console.error('Error en servicio al obtener tipos de identificación:', error);
        throw error;
    }
};

export default {
    getAllTiposIdentificacion
};
