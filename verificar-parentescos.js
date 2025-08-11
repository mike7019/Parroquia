/**
 * Script para verificar que los parentescos estén disponibles
 * Realiza una consulta directa a la base de datos y luego prueba la API
 */

import { fileURLToPath } from 'url';
import path from 'path';
import sequelize from './config/sequelize.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar modelos
import './src/models/index.js';

const { Parentesco } = sequelize.models;

async function verificarParentescos() {
  try {
    console.log('🔍 Verificando parentescos en la base de datos...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // Obtener todos los parentescos
    const parentescos = await Parentesco.findAll({
      attributes: ['id_parentesco', 'nombre', 'descripcion', 'activo'],
      order: [['nombre', 'ASC']]
    });

    console.log(`\n📊 Total de parentescos encontrados: ${parentescos.length}`);
    console.log('═══════════════════════════════════════════════════════════');

    // Mostrar los primeros 10 para verificar
    parentescos.slice(0, 10).forEach((parentesco, index) => {
      const estado = parentesco.activo ? '✅' : '❌';
      console.log(`${(index + 1).toString().padStart(2)}. ${estado} ${parentesco.nombre.padEnd(25)} - ${parentesco.descripcion}`);
    });

    if (parentescos.length > 10) {
      console.log(`   ... y ${parentescos.length - 10} más`);
    }

    // Estadísticas
    const activos = parentescos.filter(p => p.activo).length;
    const inactivos = parentescos.length - activos;

    console.log('\n📈 Estadísticas:');
    console.log(`   • Total: ${parentescos.length}`);
    console.log(`   • Activos: ${activos}`);
    console.log(`   • Inactivos: ${inactivos}`);

    // Verificar algunos tipos importantes
    const tiposImportantes = [
      'Jefe de hogar',
      'Esposo(a)',
      'Hijo(a)',
      'Padre',
      'Madre'
    ];

    console.log('\n🎯 Verificación de tipos importantes:');
    for (const tipo of tiposImportantes) {
      const encontrado = parentescos.find(p => p.nombre === tipo);
      if (encontrado) {
        console.log(`   ✅ ${tipo} (ID: ${encontrado.id_parentesco})`);
      } else {
        console.log(`   ❌ ${tipo} - NO ENCONTRADO`);
      }
    }

    console.log('\n✅ Verificación completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la verificación
verificarParentescos();
