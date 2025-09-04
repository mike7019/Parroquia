import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

async function verificarEstructuras() {
  try {
    await sequelize.authenticate();
    console.log('� Verificando estructuras de tablas...');
    
    // Verificar columnas de sectores
    const sectorColumns = await sequelize.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'sectores' 
      ORDER BY ordinal_position
    `, { type: QueryTypes.SELECT });
    
    console.log('� Columnas de sectores:', sectorColumns.map(c => c.column_name));
    
    // Verificar columnas de veredas
    const veredaColumns = await sequelize.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'veredas' 
      ORDER BY ordinal_position
    `, { type: QueryTypes.SELECT });
    
    console.log('📋 Columnas de veredas:', veredaColumns.map(c => c.column_name));
    
    // Verificar columnas de parroquias
    const parroquiaColumns = await sequelize.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'parroquias' 
      ORDER BY ordinal_position
    `, { type: QueryTypes.SELECT });
    
    console.log('📋 Columnas de parroquias:', parroquiaColumns.map(c => c.column_name));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarEstructuras();
