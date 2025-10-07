import { QueryTypes } from 'sequelize';
import sequelize from './config/sequelize.js';

async function verificarEnfermedades() {
  try {
    const enfermedades = await sequelize.query(`
      SELECT id_enfermedad, nombre 
      FROM enfermedades 
      ORDER BY nombre 
      LIMIT 20
    `, { type: QueryTypes.SELECT });

    const [total] = await sequelize.query(`
      SELECT COUNT(*) as total FROM enfermedades
    `, { type: QueryTypes.SELECT });

    console.log('✅ ENFERMEDADES EN LA BASE DE DATOS\n');
    console.log(`Total: ${total.total} enfermedades\n`);
    console.log('Primeras 20 enfermedades (ordenadas alfabéticamente):\n');
    enfermedades.forEach((e, i) => {
      console.log(`  ${i + 1}. [ID: ${e.id_enfermedad}] ${e.nombre}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

verificarEnfermedades();
