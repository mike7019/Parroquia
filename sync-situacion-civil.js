/**
 * Script para sincronizar el modelo SituacionCivil con la base de datos
 * Crea la tabla si no existe y actualiza su estructura
 */

import { fileURLToPath } from 'url';
import path from 'path';
import sequelize from './config/sequelize.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar modelos
import './src/models/index.js';

const { SituacionCivil } = sequelize.models;

async function syncSituacionCivil() {
  try {
    console.log('🔄 Sincronizando modelo SituacionCivil...');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Verificar si el modelo está registrado
    if (!SituacionCivil) {
      console.error('❌ El modelo SituacionCivil no está registrado');
      process.exit(1);
    }

    console.log('📋 Información del modelo:');
    console.log(`   • Nombre: ${SituacionCivil.name}`);
    console.log(`   • Tabla: ${SituacionCivil.tableName}`);
    console.log(`   • Campos: ${Object.keys(SituacionCivil.rawAttributes).join(', ')}`);

    // Sincronizar el modelo con la base de datos
    console.log('\n🛠️  Sincronizando tabla...');
    await SituacionCivil.sync({ alter: true });
    console.log('✅ Tabla situaciones_civiles sincronizada');

    // Verificar que la tabla se creó correctamente
    const tableInfo = await sequelize.getQueryInterface().describeTable('situaciones_civiles');
    console.log('\n📊 Estructura de la tabla:');
    
    Object.entries(tableInfo).forEach(([columnName, columnInfo]) => {
      const nullable = columnInfo.allowNull ? 'NULL' : 'NOT NULL';
      const defaultValue = columnInfo.defaultValue ? ` DEFAULT ${columnInfo.defaultValue}` : '';
      console.log(`   • ${columnName}: ${columnInfo.type} ${nullable}${defaultValue}`);
    });

    // Verificar índices
    const indexes = await sequelize.getQueryInterface().showIndex('situaciones_civiles');
    console.log(`\n🔍 Índices creados: ${indexes.length}`);
    indexes.forEach((index, i) => {
      const unique = index.unique ? ' (UNIQUE)' : '';
      console.log(`   ${i + 1}. ${index.name}: [${index.fields.map(f => f.attribute).join(', ')}]${unique}`);
    });

    // Verificar registros existentes
    const count = await SituacionCivil.count();
    console.log(`\n📈 Registros existentes: ${count}`);

    if (count === 0) {
      console.log('\n💡 La tabla está vacía. Ejecuta el seeder para poblar con datos iniciales:');
      console.log('   node seed-situaciones-civiles.js');
    } else {
      // Mostrar algunos registros de ejemplo
      const samples = await SituacionCivil.findAll({
        limit: 5,
        order: [['orden', 'ASC'], ['nombre', 'ASC']],
        attributes: ['id_situacion_civil', 'nombre', 'codigo', 'activo']
      });
      
      console.log('\n📋 Primeros 5 registros:');
      samples.forEach((situacion, index) => {
        const estado = situacion.activo ? '✅' : '❌';
        const codigo = situacion.codigo ? `(${situacion.codigo})` : '';
        console.log(`   ${index + 1}. ${estado} ${situacion.nombre} ${codigo}`);
      });
    }

    console.log('\n🎉 Sincronización completada exitosamente');

  } catch (error) {
    console.error('❌ Error en la sincronización:', error);
    
    if (error.name === 'SequelizeConnectionError') {
      console.error('💡 Verifica que la base de datos esté corriendo y las credenciales sean correctas');
    } else if (error.name === 'SequelizeDatabaseError') {
      console.error('💡 Error en la base de datos:', error.message);
    }
    
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔄 Conexión cerrada');
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  syncSituacionCivil();
}

export default syncSituacionCivil;
