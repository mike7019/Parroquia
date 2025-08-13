import { Op } from 'sequelize';

export async function seedTallas(sequelize) {
  try {
    console.log('🏷️  Iniciando seeding de Tallas...');
    
    const { Talla } = sequelize.models;
    
    // Verificar si ya existen datos
    const tallasExistentes = await Talla.count();
    console.log(`📊 Tallas existentes: ${tallasExistentes}`);
    
    if (tallasExistentes > 0) {
      console.log('📋 Las tallas ya están cargadas. Actualizando si es necesario...');
    }

    // Datos completos de tallas para zapatos, camisas y pantalones
    const tallasData = [
      // ZAPATOS MASCULINOS
      { tipo_prenda: 'zapato', talla: '37', genero: 'masculino', equivalencia_numerica: 37, descripcion: 'Talla 37 europea para zapatos masculinos' },
      { tipo_prenda: 'zapato', talla: '38', genero: 'masculino', equivalencia_numerica: 38, descripcion: 'Talla 38 europea para zapatos masculinos' },
      { tipo_prenda: 'zapato', talla: '39', genero: 'masculino', equivalencia_numerica: 39, descripcion: 'Talla 39 europea para zapatos masculinos' },
      { tipo_prenda: 'zapato', talla: '40', genero: 'masculino', equivalencia_numerica: 40, descripcion: 'Talla 40 europea para zapatos masculinos' },
      { tipo_prenda: 'zapato', talla: '41', genero: 'masculino', equivalencia_numerica: 41, descripcion: 'Talla 41 europea para zapatos masculinos' },
      { tipo_prenda: 'zapato', talla: '42', genero: 'masculino', equivalencia_numerica: 42, descripcion: 'Talla 42 europea para zapatos masculinos' },
      { tipo_prenda: 'zapato', talla: '43', genero: 'masculino', equivalencia_numerica: 43, descripcion: 'Talla 43 europea para zapatos masculinos' },
      { tipo_prenda: 'zapato', talla: '44', genero: 'masculino', equivalencia_numerica: 44, descripcion: 'Talla 44 europea para zapatos masculinos' },
      { tipo_prenda: 'zapato', talla: '45', genero: 'masculino', equivalencia_numerica: 45, descripcion: 'Talla 45 europea para zapatos masculinos' },
      { tipo_prenda: 'zapato', talla: '46', genero: 'masculino', equivalencia_numerica: 46, descripcion: 'Talla 46 europea para zapatos masculinos' },

      // ZAPATOS FEMENINOS
      { tipo_prenda: 'zapato', talla: '34', genero: 'femenino', equivalencia_numerica: 34, descripcion: 'Talla 34 europea para zapatos femeninos' },
      { tipo_prenda: 'zapato', talla: '35', genero: 'femenino', equivalencia_numerica: 35, descripcion: 'Talla 35 europea para zapatos femeninos' },
      { tipo_prenda: 'zapato', talla: '36', genero: 'femenino', equivalencia_numerica: 36, descripcion: 'Talla 36 europea para zapatos femeninos' },
      { tipo_prenda: 'zapato', talla: '37', genero: 'femenino', equivalencia_numerica: 37, descripcion: 'Talla 37 europea para zapatos femeninos' },
      { tipo_prenda: 'zapato', talla: '38', genero: 'femenino', equivalencia_numerica: 38, descripcion: 'Talla 38 europea para zapatos femeninos' },
      { tipo_prenda: 'zapato', talla: '39', genero: 'femenino', equivalencia_numerica: 39, descripcion: 'Talla 39 europea para zapatos femeninos' },
      { tipo_prenda: 'zapato', talla: '40', genero: 'femenino', equivalencia_numerica: 40, descripcion: 'Talla 40 europea para zapatos femeninos' },
      { tipo_prenda: 'zapato', talla: '41', genero: 'femenino', equivalencia_numerica: 41, descripcion: 'Talla 41 europea para zapatos femeninos' },

      // CAMISAS MASCULINAS
      { tipo_prenda: 'camisa', talla: 'XS', genero: 'masculino', equivalencia_numerica: 1, descripcion: 'Talla extra pequeña para camisas masculinas' },
      { tipo_prenda: 'camisa', talla: 'S', genero: 'masculino', equivalencia_numerica: 2, descripcion: 'Talla pequeña para camisas masculinas' },
      { tipo_prenda: 'camisa', talla: 'M', genero: 'masculino', equivalencia_numerica: 3, descripcion: 'Talla mediana para camisas masculinas' },
      { tipo_prenda: 'camisa', talla: 'L', genero: 'masculino', equivalencia_numerica: 4, descripcion: 'Talla grande para camisas masculinas' },
      { tipo_prenda: 'camisa', talla: 'XL', genero: 'masculino', equivalencia_numerica: 5, descripcion: 'Talla extra grande para camisas masculinas' },
      { tipo_prenda: 'camisa', talla: 'XXL', genero: 'masculino', equivalencia_numerica: 6, descripcion: 'Talla doble extra grande para camisas masculinas' },
      { tipo_prenda: 'camisa', talla: 'XXXL', genero: 'masculino', equivalencia_numerica: 7, descripcion: 'Talla triple extra grande para camisas masculinas' },

      // CAMISAS FEMENINAS
      { tipo_prenda: 'camisa', talla: 'XS', genero: 'femenino', equivalencia_numerica: 1, descripcion: 'Talla extra pequeña para camisas femeninas' },
      { tipo_prenda: 'camisa', talla: 'S', genero: 'femenino', equivalencia_numerica: 2, descripcion: 'Talla pequeña para camisas femeninas' },
      { tipo_prenda: 'camisa', talla: 'M', genero: 'femenino', equivalencia_numerica: 3, descripcion: 'Talla mediana para camisas femeninas' },
      { tipo_prenda: 'camisa', talla: 'L', genero: 'femenino', equivalencia_numerica: 4, descripcion: 'Talla grande para camisas femeninas' },
      { tipo_prenda: 'camisa', talla: 'XL', genero: 'femenino', equivalencia_numerica: 5, descripcion: 'Talla extra grande para camisas femeninas' },
      { tipo_prenda: 'camisa', talla: 'XXL', genero: 'femenino', equivalencia_numerica: 6, descripcion: 'Talla doble extra grande para camisas femeninas' },

      // PANTALONES MASCULINOS
      { tipo_prenda: 'pantalon', talla: '28', genero: 'masculino', equivalencia_numerica: 28, descripcion: 'Talla 28 de cintura para pantalones masculinos' },
      { tipo_prenda: 'pantalon', talla: '30', genero: 'masculino', equivalencia_numerica: 30, descripcion: 'Talla 30 de cintura para pantalones masculinos' },
      { tipo_prenda: 'pantalon', talla: '32', genero: 'masculino', equivalencia_numerica: 32, descripcion: 'Talla 32 de cintura para pantalones masculinos' },
      { tipo_prenda: 'pantalon', talla: '34', genero: 'masculino', equivalencia_numerica: 34, descripcion: 'Talla 34 de cintura para pantalones masculinos' },
      { tipo_prenda: 'pantalon', talla: '36', genero: 'masculino', equivalencia_numerica: 36, descripcion: 'Talla 36 de cintura para pantalones masculinos' },
      { tipo_prenda: 'pantalon', talla: '38', genero: 'masculino', equivalencia_numerica: 38, descripcion: 'Talla 38 de cintura para pantalones masculinos' },
      { tipo_prenda: 'pantalon', talla: '40', genero: 'masculino', equivalencia_numerica: 40, descripcion: 'Talla 40 de cintura para pantalones masculinos' },
      { tipo_prenda: 'pantalon', talla: '42', genero: 'masculino', equivalencia_numerica: 42, descripcion: 'Talla 42 de cintura para pantalones masculinos' },
      { tipo_prenda: 'pantalon', talla: '44', genero: 'masculino', equivalencia_numerica: 44, descripcion: 'Talla 44 de cintura para pantalones masculinos' },

      // PANTALONES FEMENINOS
      { tipo_prenda: 'pantalon', talla: '24', genero: 'femenino', equivalencia_numerica: 24, descripcion: 'Talla 24 de cintura para pantalones femeninos' },
      { tipo_prenda: 'pantalon', talla: '26', genero: 'femenino', equivalencia_numerica: 26, descripcion: 'Talla 26 de cintura para pantalones femeninos' },
      { tipo_prenda: 'pantalon', talla: '28', genero: 'femenino', equivalencia_numerica: 28, descripcion: 'Talla 28 de cintura para pantalones femeninos' },
      { tipo_prenda: 'pantalon', talla: '30', genero: 'femenino', equivalencia_numerica: 30, descripcion: 'Talla 30 de cintura para pantalones femeninos' },
      { tipo_prenda: 'pantalon', talla: '32', genero: 'femenino', equivalencia_numerica: 32, descripcion: 'Talla 32 de cintura para pantalones femeninos' },
      { tipo_prenda: 'pantalon', talla: '34', genero: 'femenino', equivalencia_numerica: 34, descripcion: 'Talla 34 de cintura para pantalones femeninos' },
      { tipo_prenda: 'pantalon', talla: '36', genero: 'femenino', equivalencia_numerica: 36, descripcion: 'Talla 36 de cintura para pantalones femeninos' },
      { tipo_prenda: 'pantalon', talla: '38', genero: 'femenino', equivalencia_numerica: 38, descripcion: 'Talla 38 de cintura para pantalones femeninos' },

      // TALLAS UNISEX ADICIONALES
      { tipo_prenda: 'camisa', talla: 'S', genero: 'unisex', equivalencia_numerica: 2, descripcion: 'Talla pequeña unisex para camisas' },
      { tipo_prenda: 'camisa', talla: 'M', genero: 'unisex', equivalencia_numerica: 3, descripcion: 'Talla mediana unisex para camisas' },
      { tipo_prenda: 'camisa', talla: 'L', genero: 'unisex', equivalencia_numerica: 4, descripcion: 'Talla grande unisex para camisas' },
      { tipo_prenda: 'camisa', talla: 'XL', genero: 'unisex', equivalencia_numerica: 5, descripcion: 'Talla extra grande unisex para camisas' }
    ];

    console.log(`📝 Procesando ${tallasData.length} tallas...`);

    // Procesar cada talla usando upsert
    let tallasCreadasus = 0;
    let tallasActualizadas = 0;

    for (const tallaData of tallasData) {
      const [talla, created] = await Talla.upsert(
        {
          ...tallaData,
          activo: true,
          updated_at: new Date()
        },
        {
          conflictFields: ['tipo_prenda', 'talla', 'genero'], // Campos únicos para evitar duplicados
          returning: true
        }
      );

      if (created) {
        tallasCreadasus++;
        console.log(`✅ Creada: ${tallaData.tipo_prenda} - ${tallaData.talla} (${tallaData.genero})`);
      } else {
        tallasActualizadas++;
        console.log(`🔄 Actualizada: ${tallaData.tipo_prenda} - ${tallaData.talla} (${tallaData.genero})`);
      }
    }

    // Verificación final
    const tallasFinales = await Talla.count();
    const tallasActivas = await Talla.count({ where: { activo: true } });

    console.log(`\n📋 RESUMEN SEEDING TALLAS:`);
    console.log(`   • Total tallas en BD: ${tallasFinales}`);
    console.log(`   • Tallas activas: ${tallasActivas}`);
    console.log(`   • Tallas creadas: ${tallasCreadasus}`);
    console.log(`   • Tallas actualizadas: ${tallasActualizadas}`);

    // Mostrar estadísticas por tipo
    const estadisticas = await Talla.findAll({
      attributes: [
        'tipo_prenda',
        'genero',
        [sequelize.fn('COUNT', sequelize.col('id_talla')), 'total']
      ],
      where: { activo: true },
      group: ['tipo_prenda', 'genero'],
      order: [['tipo_prenda', 'ASC'], ['genero', 'ASC']]
    });

    console.log(`\n📊 ESTADÍSTICAS POR TIPO:`);
    estadisticas.forEach(stat => {
      console.log(`   • ${stat.tipo_prenda} ${stat.genero}: ${stat.get('total')} tallas`);
    });

    return {
      success: true,
      tallasCreadas: tallasCreadasus,
      tallasActualizadas,
      totalTallas: tallasFinales,
      tallasActivas
    };

  } catch (error) {
    console.error('❌ Error en seeding de Tallas:', error);
    throw error;
  }
}
