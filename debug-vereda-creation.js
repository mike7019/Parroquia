#!/usr/bin/env node

import sequelize from './config/sequelize.js';

async function debugVeredaCreation() {
  try {
    console.log('🔍 Debugging creación de vereda...');
    
    // Probar usando Sequelize model
    console.log('\n1️⃣ Probando con Sequelize Model...');
    
    const VeredasModel = sequelize.models.Veredas;
    console.log('Modelo disponible:', !!VeredasModel);
    
    if (VeredasModel) {
      console.log('Estructura del modelo:');
      console.log('- tableName:', VeredasModel.tableName);
      console.log('- primaryKey:', VeredasModel.primaryKeyAttribute);
      console.log('- attributes:', Object.keys(VeredasModel.rawAttributes));
      
      try {
        const nuevaVereda = await VeredasModel.create({
          nombre: 'Test Vereda Debug',
          codigo_vereda: 'DEBUG001',
          id_municipio_municipios: null
        });
        console.log('✅ Vereda creada con Sequelize:', nuevaVereda.toJSON());
        
        // Limpiar
        await nuevaVereda.destroy();
        console.log('🧹 Vereda eliminada');
        
      } catch (sequelizeError) {
        console.error('❌ Error con Sequelize:', sequelizeError.message);
        console.error('Full error:', sequelizeError);
      }
    }

    // Probar usando findOrCreate
    console.log('\n2️⃣ Probando findOrCreate...');
    try {
      const [vereda, created] = await VeredasModel.findOrCreate({
        where: { nombre: 'Test FindOrCreate' },
        defaults: {
          nombre: 'Test FindOrCreate',
          codigo_vereda: 'FINDCREATE001',
          id_municipio_municipios: null
        }
      });
      
      console.log('✅ FindOrCreate exitoso:', { created, vereda: vereda.toJSON() });
      
      // Limpiar
      await vereda.destroy();
      console.log('🧹 Vereda findOrCreate eliminada');
      
    } catch (findOrCreateError) {
      console.error('❌ Error con findOrCreate:', findOrCreateError.message);
      console.error('SQL:', findOrCreateError.sql);
      console.error('Full error:', findOrCreateError);
    }

    // Verificar si hay problemas con constraints únicos
    console.log('\n3️⃣ Verificando constraints únicos...');
    try {
      const [constraints] = await sequelize.query(`
        SELECT 
          tc.constraint_name, 
          tc.constraint_type,
          kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'veredas' 
          AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY')
      `);
      
      console.log('Constraints únicos:');
      constraints.forEach(c => {
        console.log(`  - ${c.constraint_name}: ${c.constraint_type} en ${c.column_name}`);
      });
    } catch (constraintError) {
      console.error('❌ Error verificando constraints:', constraintError.message);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

debugVeredaCreation();
