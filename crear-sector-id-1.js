import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

async function crearSectorID1() {
  try {
    await sequelize.authenticate();
    console.log('🔧 Creando sector con ID 1 específicamente...');
    
    // Crear sector con ID 1 específico
    try {
      await sequelize.query(`
        INSERT INTO sectores (id_sector, nombre, id_municipio, created_at, updated_at) 
        VALUES (1, 'Sector Principal', 1, NOW(), NOW())
      `, { type: QueryTypes.INSERT });
      
      // Actualizar secuencia para evitar conflictos futuros
      await sequelize.query(`
        SELECT setval('sectores_id_sector_seq', (SELECT MAX(id_sector) FROM sectores))
      `, { type: QueryTypes.SELECT });
      
      console.log('✅ Sector ID 1 creado exitosamente');
      
      // Verificar
      const [sector] = await sequelize.query('SELECT * FROM sectores WHERE id_sector = 1', { type: QueryTypes.SELECT });
      console.log('🎯 Sector verificado:', sector);
      
    } catch (error) {
      if (error.message.includes('duplicate') || error.message.includes('already exists')) {
        console.log('ℹ️ Sector ID 1 ya existe');
      } else {
        console.error('❌ Error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('Error general:', error.message);
  } finally {
    await sequelize.close();
  }
}

crearSectorID1();
