#!/usr/bin/env node

import sequelize from './config/sequelize.js';
import { Veredas, Municipios } from './src/models/index.js';

async function testVeredaCreation() {
  try {
    console.log('🔍 Testing vereda creation...');
    
    console.log('Modelos disponibles:');
    console.log('- Veredas:', !!Veredas);
    console.log('- Municipios:', !!Municipios);
    console.log('- sequelize.models.Veredas:', !!sequelize.models.Veredas);
    
    console.log('\n🧪 Probando crear vereda usando import directo...');
    
    try {
      const nuevaVereda = await Veredas.create({
        nombre: 'Test Vereda Import',
        codigo_vereda: 'IMPORT001',
        id_municipio_municipios: null
      });
      
      console.log('✅ Vereda creada exitosamente:', nuevaVereda.toJSON());
      
      // Limpiar
      await nuevaVereda.destroy();
      console.log('🧹 Vereda eliminada');
      
    } catch (createError) {
      console.error('❌ Error creando vereda:', createError.message);
      console.error('Details:', createError);
    }

    console.log('\n🔄 Probando findOrCreate...');
    
    try {
      const [vereda, created] = await Veredas.findOrCreate({
        where: { nombre: 'Test FindOrCreate Import' },
        defaults: {
          nombre: 'Test FindOrCreate Import',
          codigo_vereda: 'FINDCREATE002',
          id_municipio_municipios: null
        }
      });
      
      console.log('✅ FindOrCreate exitoso:', { 
        created, 
        vereda: vereda.toJSON() 
      });
      
      // Limpiar
      await vereda.destroy();
      console.log('🧹 Vereda findOrCreate eliminada');
      
    } catch (findOrCreateError) {
      console.error('❌ Error con findOrCreate:', findOrCreateError.message);
      console.error('Details:', findOrCreateError);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testVeredaCreation();
