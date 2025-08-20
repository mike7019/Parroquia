import tipoIdentificacionService from '../../services/catalog/tipoIdentificacionService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';

class TipoIdentificacionController {
    /**
     * Crear un nuevo tipo de identificación
     */
    async createTipoIdentificacion(req, res) {
        try {
            const { nombre, descripcion, codigo } = req.body;

            // Permitir que descripcion sea usado como nombre si no se proporciona nombre
            const nombreFinal = nombre || descripcion;

            if (!nombreFinal || !codigo) {
                return res.status(400).json(
                    createErrorResponse(
                        'nombre (or descripcion) and codigo are required',
                        null,
                        'VALIDATION_ERROR'
                    )
                );
            }

            const tipoIdentificacion = await tipoIdentificacionService.createTipoIdentificacion({
                nombre: nombreFinal,
                descripcion: descripcion || nombreFinal,
                codigo
            });

            res.status(201).json(
                createSuccessResponse(
                    'Tipo de identificación created successfully',
                    tipoIdentificacion
                )
            );
        } catch (error) {
            let statusCode = 500;
            if (error.message.includes('Ya existe')) statusCode = 409;

            res.status(statusCode).json(
                createErrorResponse(
                    'Error creating tipo de identificación',
                    error.message,
                    'CREATE_ERROR'
                )
            );
        }
    }

    /**
     * Obtener todos los tipos de identificación
     */
    async getAllTiposIdentificacion(req, res) {
        try {
            const {
                search,
                sortBy = 'nombre',
                sortOrder = 'ASC'
            } = req.query;

            const tiposIdentificacion = await tipoIdentificacionService.getAllTiposIdentificacion({
                search,
                sortBy,
                sortOrder
            });

            res.json(
                createSuccessResponse(
                    'Tipos de identificación retrieved successfully',
                    tiposIdentificacion
                )
            );
        } catch (error) {
            res.status(500).json(
                createErrorResponse(
                    'Error retrieving tipos de identificación',
                    error.message,
                    'FETCH_ERROR'
                )
            );
        }
    }

    /**
     * Obtener tipo de identificación por ID
     */
    async getTipoIdentificacionById(req, res) {
        try {
            const { id } = req.params;

            const tipoIdentificacion = await tipoIdentificacionService.getTipoIdentificacionById(id);

            res.json(
                createSuccessResponse(
                    'Tipo de identificación retrieved successfully',
                    tipoIdentificacion
                )
            );
        } catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json(
                createErrorResponse(
                    'Error retrieving tipo de identificación',
                    error.message,
                    'FETCH_ERROR'
                )
            );
        }
    }

    /**
     * Actualizar tipo de identificación
     */
    async updateTipoIdentificacion(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const tipoIdentificacion = await tipoIdentificacionService.updateTipoIdentificacion(id, updateData);

            res.json(
                createSuccessResponse(
                    'Tipo de identificación updated successfully',
                    tipoIdentificacion
                )
            );
        } catch (error) {
            let statusCode = 500;
            if (error.message.includes('not found')) statusCode = 404;
            if (error.message.includes('Ya existe')) statusCode = 409;

            res.status(statusCode).json(
                createErrorResponse(
                    'Error updating tipo de identificación',
                    error.message,
                    'UPDATE_ERROR'
                )
            );
        }
    }

    /**
     * Eliminar tipo de identificación
     */
    async deleteTipoIdentificacion(req, res) {
        try {
            const { id } = req.params;

            const result = await tipoIdentificacionService.deleteTipoIdentificacion(id);

            res.json(
                createSuccessResponse(
                    'Tipo de identificación deleted successfully',
                    result
                )
            );
        } catch (error) {
            let statusCode = 500;
            if (error.message.includes('not found')) statusCode = 404;
            if (error.message.includes('associated')) statusCode = 409;

            res.status(statusCode).json(
                createErrorResponse(
                    'Error deleting tipo de identificación',
                    error.message,
                    'DELETE_ERROR'
                )
            );
        }
    }

    /**
     * Obtener tipo de identificación por código
     */
    async getTipoIdentificacionByCode(req, res) {
        try {
            const { codigo } = req.params;

            const tipoIdentificacion = await tipoIdentificacionService.getTipoIdentificacionByCode(codigo);

            res.json(
                createSuccessResponse(
                    'Tipo de identificación retrieved successfully',
                    tipoIdentificacion
                )
            );
        } catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json(
                createErrorResponse(
                    'Error retrieving tipo de identificación by code',
                    error.message,
                    'FETCH_ERROR'
                )
            );
        }
    }
}

export default new TipoIdentificacionController();
