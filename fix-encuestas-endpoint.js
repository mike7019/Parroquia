import sequelize from '../../config/sequelize.js';
import { QueryTypes } from 'sequelize';
import { Familias, Municipios, Parroquia, Sector, Veredas, Sexo, TipoIdentificacion, Persona } from '../models/index.js';
import crypto from 'crypto';

// Endpoint simplificado y funcional
export const obtenerEncuestas = async (req, res) => {
  try {
    console.log('📋 Obteniendo lista de encuestas (versión simplificada)...');
    
    // Parámetros de paginación con límite máximo de seguridad
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // máximo 50
    const offset = (page - 1) * limit;

    console.log(`📄 Paginación: página ${page}, límite ${limit}`);

    // Parámetros de filtros opcionales
    const { sector, apellido_familiar } = req.query;

    // Construir condiciones WHERE
    let whereConditions = {};
    if (sector) whereConditions.sector = { [sequelize.Op.iLike]: `%${sector}%` };
    if (apellido_familiar) whereConditions.apellido_familiar = { [sequelize.Op.iLike]: `%${apellido_familiar}%` };

    // Obtener encuestas con información BÁSICA solamente
    const { count, rows: encuestas } = await Familias.findAndCountAll({
      where: whereConditions,
      order: [['fecha_ultima_encuesta', 'DESC']],
      limit,
      offset,
      attributes: [
        'id_familia',
        'apellido_familiar', 
        'sector',
        'direccion_familia',
        'telefono',
        'email',
        'estado_encuesta',
        'fecha_ultima_encuesta',
        'numero_encuestas',
        'tamaño_familia'
      ]
    });

    console.log(`✅ Encontradas ${encuestas.length} familias de ${count} totales`);

    // Formatear respuesta simple SIN consultas adicionales
    const encuestasFormateadas = encuestas.map(familia => {
      const familiaData = familia.toJSON();
      return {
        id_familia: familiaData.id_familia,
        apellido_familiar: familiaData.apellido_familiar,
        sector: familiaData.sector,
        direccion_familia: familiaData.direccion_familia,
        telefono: familiaData.telefono,
        email: familiaData.email,
        estado_encuesta: familiaData.estado_encuesta,
        fecha_ultima_encuesta: familiaData.fecha_ultima_encuesta,
        numero_encuestas: familiaData.numero_encuestas,
        tamaño_familia: familiaData.tamaño_familia,
        metadatos: {
          fecha_creacion: familiaData.fecha_ultima_encuesta,
          estado: familiaData.estado_encuesta,
          version: '1.0-simple'
        }
      };
    });

    // Calcular información de paginación
    const totalPages = Math.ceil(count / limit);
    
    console.log(`✅ Respuesta preparada con ${encuestasFormateadas.length} encuestas`);

    res.status(200).json({
      status: 'success',
      message: `Se encontraron ${count} encuestas`,
      data: encuestasFormateadas,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo encuestas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor al obtener encuestas',
      error: error.message
    });
  }
};
