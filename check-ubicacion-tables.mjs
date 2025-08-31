import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

const verificarTablasUbicacion = async () => {
  try {
    await sequelize.authenticate();
    console.log('🔍 Verificando estructuras de tablas de ubicación...');
    
    // Verificar tabla veredas
    console.log('\n📊 TABLA VEREDAS:');
    console.log('=================');
    const columnasVeredas = await sequelize.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'veredas'
      ORDER BY ordinal_position;
    `, { type: QueryTypes.SELECT });
    
    if (columnasVeredas.length > 0) {
      columnasVeredas.forEach((col, i) => {
        console.log(`${i+1}. ${col.column_name} (${col.data_type})`);
      });
      
      // Ejemplo de datos
      const [ejemploVereda] = await sequelize.query(`
        SELECT * FROM veredas LIMIT 1
      `, { type: QueryTypes.SELECT });
      
      if (ejemploVereda) {
        console.log('\n📋 Ejemplo de datos veredas:');
        Object.keys(ejemploVereda).forEach(key => {
          console.log(`${key}: ${ejemploVereda[key]}`);
        });
      }
    } else {
      console.log('❌ Tabla veredas no encontrada');
    }
    
    // Verificar tabla sectores
    console.log('\n📊 TABLA SECTORES:');
    console.log('==================');
    const columnasSectores = await sequelize.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'sectores'
      ORDER BY ordinal_position;
    `, { type: QueryTypes.SELECT });
    
    if (columnasSectores.length > 0) {
      columnasSectores.forEach((col, i) => {
        console.log(`${i+1}. ${col.column_name} (${col.data_type})`);
      });
      
      // Ejemplo de datos
      const [ejemploSector] = await sequelize.query(`
        SELECT * FROM sectores LIMIT 1
      `, { type: QueryTypes.SELECT });
      
      if (ejemploSector) {
        console.log('\n📋 Ejemplo de datos sectores:');
        Object.keys(ejemploSector).forEach(key => {
          console.log(`${key}: ${ejemploSector[key]}`);
        });
      }
    } else {
      console.log('❌ Tabla sectores no encontrada');
    }
    
    // Verificar tabla municipios también
    console.log('\n📊 TABLA MUNICIPIOS:');
    console.log('====================');
    const columnasMunicipios = await sequelize.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'municipios'
      ORDER BY ordinal_position;
    `, { type: QueryTypes.SELECT });
    
    if (columnasMunicipios.length > 0) {
      columnasMunicipios.forEach((col, i) => {
        console.log(`${i+1}. ${col.column_name} (${col.data_type})`);
      });
    }
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

verificarTablasUbicacion();
