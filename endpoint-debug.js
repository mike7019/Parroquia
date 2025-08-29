// Backup temporal del endpoint original
export const obtenerEncuestasOriginal = async (req, res) => {
  try {
    console.log('📋 Endpoint simplificado para debugging...');
    
    // Solo obtener 3 familias con datos mínimos
    const familias = await Familias.findAll({
      limit: 3,
      attributes: ['id_familia', 'apellido_familiar', 'telefono'],
      order: [['id_familia', 'ASC']]
    });

    console.log(`Encontradas ${familias.length} familias`);

    const resultado = familias.map(familia => ({
      id: familia.id_familia,
      apellido: familia.apellido_familiar,
      telefono: familia.telefono
    }));

    res.json({
      status: 'success',
      data: resultado,
      message: 'Endpoint simplificado funcionando'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
