import sequelize from '../../config/sequelize.js';

const seedComunidadesCulturales = async () => {
  try {
    const ComunidadCultural = sequelize.models.ComunidadCultural;
    
    if (!ComunidadCultural) {
      throw new Error('Modelo ComunidadCultural no encontrado');
    }

    // Verificar si ya existen datos
    const count = await ComunidadCultural.count();
    
    if (count > 0) {
      console.log('✅ Las comunidades culturales ya existen en la base de datos');
      return;
    }

    // Datos iniciales de comunidades culturales comunes en Colombia
    const comunidadesCulturales = [
      {
        nombre: 'Afrodescendiente',
        descripcion: 'Comunidad de personas afrodescendientes con herencia cultural africana'
      },
      {
        nombre: 'Indígena',
        descripcion: 'Pueblos originarios con tradiciones ancestrales'
      },
      {
        nombre: 'Mestizo',
        descripcion: 'Comunidad de origen mixto entre diferentes grupos étnicos'
      },
      {
        nombre: 'Raizal',
        descripcion: 'Población nativa del Archipiélago de San Andrés, Providencia y Santa Catalina'
      },
      {
        nombre: 'Palenquero',
        descripcion: 'Descendientes de comunidades cimarronas, principalmente de San Basilio de Palenque'
      },
      {
        nombre: 'Rom (Gitano)',
        descripcion: 'Pueblo rom o gitano con tradiciones nómadas'
      },
      {
        nombre: 'Ninguna',
        descripcion: 'No se identifica con ninguna comunidad cultural específica'
      },
      {
        nombre: 'Otra',
        descripcion: 'Otra comunidad cultural no especificada'
      }
    ];

    // Insertar las comunidades culturales
    await ComunidadCultural.bulkCreate(comunidadesCulturales);
    
    console.log('✅ Seeders de comunidades culturales ejecutados correctamente');
    console.log(`📊 Se insertaron ${comunidadesCulturales.length} comunidades culturales`);

  } catch (error) {
    console.error('❌ Error ejecutando seeders de comunidades culturales:', error.message);
    throw error;
  }
};

export default seedComunidadesCulturales;
