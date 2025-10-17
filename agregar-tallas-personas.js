/**
 * Script para agregar tallas a personas existentes en la base de datos
 * Esto permitirá probar los filtros de tallas con edad y sexo
 */

import sequelize from './config/sequelize.js';
import { Persona } from './src/models/index.js';

async function agregarTallasPersonas() {
  try {
    console.log('👕 SCRIPT: Agregar Tallas a Personas');
    console.log('='.repeat(80));
    console.log('');

    // Obtener personas sin tallas
    console.log('1️⃣ BUSCANDO PERSONAS EN LA BASE DE DATOS:\n');
    
    const personas = await Persona.findAll({
      limit: 20,
      order: [['id_personas', 'ASC']]
    });

    console.log(`   ✅ Se encontraron ${personas.length} personas\n`);

    if (personas.length === 0) {
      console.log('   ⚠️  No hay personas en la base de datos');
      return;
    }

    // Definir tallas variadas
    const tallasConfig = {
      camisa: {
        hombres: ['S', 'M', 'L', 'XL', 'XXL'],
        mujeres: ['XS', 'S', 'M', 'L', 'XL']
      },
      pantalon: {
        hombres: ['30', '32', '34', '36', '38'],
        mujeres: ['6', '8', '10', '12', '14']
      },
      zapato: {
        hombres: ['38', '39', '40', '41', '42', '43'],
        mujeres: ['35', '36', '37', '38', '39']
      }
    };

    console.log('2️⃣ ASIGNANDO TALLAS:\n');

    let actualizadas = 0;
    
    for (let i = 0; i < personas.length; i++) {
      const persona = personas[i];
      
      // Determinar sexo (asumiendo id_sexo: 1=Masculino, 2=Femenino)
      const esHombre = persona.id_sexo === 1 || persona.id_sexo === '1';
      const categoriaGenero = esHombre ? 'hombres' : 'mujeres';
      
      // Seleccionar tallas aleatorias según el género
      const tallaCamisa = tallasConfig.camisa[categoriaGenero][
        Math.floor(Math.random() * tallasConfig.camisa[categoriaGenero].length)
      ];
      
      const tallaPantalon = tallasConfig.pantalon[categoriaGenero][
        Math.floor(Math.random() * tallasConfig.pantalon[categoriaGenero].length)
      ];
      
      const tallaZapato = tallasConfig.zapato[categoriaGenero][
        Math.floor(Math.random() * tallasConfig.zapato[categoriaGenero].length)
      ];

      // Actualizar persona
      await persona.update({
        talla_camisa: tallaCamisa,
        talla_pantalon: tallaPantalon,
        talla_zapato: tallaZapato
      });

      actualizadas++;

      const sexoText = esHombre ? '♂️ Hombre' : '♀️ Mujer';
      console.log(`   ${i + 1}. ID ${persona.id_personas} (${sexoText})`);
      console.log(`      Camisa: ${tallaCamisa}, Pantalón: ${tallaPantalon}, Zapato: ${tallaZapato}`);
    }

    console.log('');
    console.log('3️⃣ VERIFICANDO DISTRIBUCIÓN DE TALLAS:\n');

    // Contar por talla de camisa
    const distribucionCamisa = await sequelize.query(`
      SELECT 
        talla_camisa,
        COUNT(*) as total,
        COUNT(CASE WHEN id_sexo = 1 THEN 1 END) as hombres,
        COUNT(CASE WHEN id_sexo = 2 THEN 1 END) as mujeres
      FROM personas 
      WHERE talla_camisa IS NOT NULL
      GROUP BY talla_camisa
      ORDER BY talla_camisa
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('   📊 DISTRIBUCIÓN TALLAS DE CAMISA:\n');
    console.log('   ┌──────────┬───────┬─────────┬─────────┐');
    console.log('   │ Talla    │ Total │ Hombres │ Mujeres │');
    console.log('   ├──────────┼───────┼─────────┼─────────┤');
    
    distribucionCamisa.forEach(d => {
      const talla = (d.talla_camisa || 'N/A').padEnd(8, ' ');
      const total = String(d.total).padStart(5, ' ');
      const hombres = String(d.hombres).padStart(7, ' ');
      const mujeres = String(d.mujeres).padStart(7, ' ');
      console.log(`   │ ${talla} │ ${total} │ ${hombres} │ ${mujeres} │`);
    });
    
    console.log('   └──────────┴───────┴─────────┴─────────┘\n');

    // Contar por talla de pantalón
    const distribucionPantalon = await sequelize.query(`
      SELECT 
        talla_pantalon,
        COUNT(*) as total
      FROM personas 
      WHERE talla_pantalon IS NOT NULL
      GROUP BY talla_pantalon
      ORDER BY talla_pantalon
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('   📊 DISTRIBUCIÓN TALLAS DE PANTALÓN:\n');
    console.log('   ┌──────────┬───────┐');
    console.log('   │ Talla    │ Total │');
    console.log('   ├──────────┼───────┤');
    
    distribucionPantalon.forEach(d => {
      const talla = (d.talla_pantalon || 'N/A').padEnd(8, ' ');
      const total = String(d.total).padStart(5, ' ');
      console.log(`   │ ${talla} │ ${total} │`);
    });
    
    console.log('   └──────────┴───────┘\n');

    // Estadísticas finales
    console.log('='.repeat(80));
    console.log('✅ PROCESO COMPLETADO\n');
    console.log(`📊 RESUMEN:`);
    console.log(`   - Personas actualizadas: ${actualizadas}`);
    console.log(`   - Tallas de camisa diferentes: ${distribucionCamisa.length}`);
    console.log(`   - Tallas de pantalón diferentes: ${distribucionPantalon.length}\n`);

    console.log('🎯 AHORA PUEDES PROBAR LOS FILTROS:\n');
    console.log('   1. Ejecutar: node test-filtros-tallas-edad-sexo.js');
    console.log('   2. O usar el endpoint: GET /api/personas/consolidado/tallas');
    console.log('   3. Ejemplo: ?talla_camisa=M&edad_min=20&id_sexo=1&format=excel\n');

  } catch (error) {
    console.error('\n❌ ERROR:');
    console.error(`   Tipo: ${error.name}`);
    console.error(`   Mensaje: ${error.message}`);
    console.error(`   Stack: ${error.stack}\n`);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar script
agregarTallasPersonas();
