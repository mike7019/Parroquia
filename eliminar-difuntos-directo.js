/**
 * Script directo para eliminar difuntos de la base de datos
 * Eliminación inmediata sin backup
 */

import 'dotenv/config';
import { Sequelize } from 'sequelize';

// Configuración de la base de datos
const sequelize = new Sequelize(
  process.env.DB_NAME || 'parroquia_db',
  process.env.DB_USER || 'parroquia_user', 
  process.env.DB_PASSWORD || 'admin',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false // Sin logs para ejecución limpia
  }
);

async function eliminarDifuntos() {
  try {
    console.log('🗑️ Eliminando difuntos...');

    // Eliminar Pedro Antonio Los Alvarez (ID: 1)
    const resultado1 = await sequelize.query(
      "DELETE FROM difuntos_familia WHERE id_difunto = 1 AND nombre_completo = 'Pedro Antonio Los Alvarez'",
      { type: Sequelize.QueryTypes.DELETE }
    );

    // Eliminar Pecas Garzon Rodriguez (ID: 2)
    const resultado2 = await sequelize.query(
      "DELETE FROM difuntos_familia WHERE id_difunto = 2 AND nombre_completo = 'Pecas Garzon Rodriguez'",
      { type: Sequelize.QueryTypes.DELETE }
    );

    console.log(`✅ Pedro Antonio Los Alvarez eliminado: ${resultado1[1] > 0 ? 'Sí' : 'No encontrado'}`);
    console.log(`✅ Pecas Garzon Rodriguez eliminado: ${resultado2[1] > 0 ? 'Sí' : 'No encontrado'}`);

    // Verificar que no queden difuntos
    const restantes = await sequelize.query(
      'SELECT COUNT(*) as total FROM difuntos_familia',
      { type: Sequelize.QueryTypes.SELECT }
    );

    console.log(`📊 Difuntos restantes: ${restantes[0].total}`);

    // Resetear secuencia para próximos registros
    await sequelize.query(
      "SELECT setval('difuntos_familia_id_difunto_seq', 1, false)",
      { type: Sequelize.QueryTypes.SELECT }
    );

    console.log('🔄 Secuencia de IDs reseteada');
    console.log('✅ Eliminación completada exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar eliminación
eliminarDifuntos();