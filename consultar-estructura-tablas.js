#!/usr/bin/env node

import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

async function consultarEstructura() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a BD');

    // Consultar estructura de cada tabla
    const tablas = ['departamentos', 'municipios', 'parroquias', 'sectores', 'veredas', 'tipos_vivienda', 'sexos', 'tipos_identificacion'];
    
    for (const tabla of tablas) {
      console.log(`\n🔍 Estructura de tabla: ${tabla}`);
      try {
        const columnas = await sequelize.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = '${tabla}' 
          ORDER BY ordinal_position;
        `, { type: QueryTypes.SELECT });
        
        columnas.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type}`);
        });
      } catch (error) {
        console.log(`  ❌ Error consultando ${tabla}: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

consultarEstructura();
