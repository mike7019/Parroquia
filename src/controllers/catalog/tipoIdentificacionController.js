import tipoIdentificacionService from '../../services/catalog/tipoIdentificacionService.js';

/**
 * Obtener todos los tipos de identificación
 */
const getAllTiposIdentificacion = async (req, res) => {
    try {
        const tiposIdentificacion = await tipoIdentificacionService.getAllTiposIdentificacion();
        
        res.status(200).json({
            status: 'success',
            data: tiposIdentificacion
        });
    } catch (error) {
        console.error('Error al obtener tipos de identificación:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

export default {
    getAllTiposIdentificacion
};
