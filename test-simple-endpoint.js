// Endpoint simplificado temporal para debugging
export const obtenerEncuestasSimple = async (req, res) => {
  try {
    console.log('📋 Obteniendo encuestas (versión simplificada)...');
    
    // Solo obtener datos básicos de familias
    const { count, rows: encuestas } = await Familias.findAndCountAll({
      limit: 5,
      order: [['fecha_ultima_encuesta', 'DESC']],
      attributes: ['id_familia', 'apellido_familiar', 'sector', 'telefono']
    });

    const encuestasSimples = encuestas.map(familia => ({
      id_familia: familia.id_familia,
      apellido_familiar: familia.apellido_familiar,
      sector: familia.sector,
      telefono: familia.telefono
    }));

    res.status(200).json({
      status: 'success',
      message: `Se encontraron ${count} encuestas`,
      data: encuestasSimples,
      total: count
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};
