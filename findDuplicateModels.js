import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';
import fs from 'fs';
import path from 'path';

async function findDuplicateModels() {
  try {
    console.log('🔍 Buscando modelos duplicados...\n');

    // Lista de tablas en la base de datos
    const allTables = await sequelize.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
      { type: QueryTypes.SELECT }
    );

    console.log('📋 Verificando coincidencias entre modelos y tablas:\n');

    // Buscar archivos de modelos
    const catalogModels = fs.readdirSync('src/models/catalog').filter(f => f.endsWith('.js'));
    const mainModels = fs.readdirSync('src/models/main').filter(f => f.endsWith('.cjs'));
    
    console.log('📁 Modelos en catalog:');
    catalogModels.forEach(model => console.log(`  - ${model}`));
    
    console.log('\n📁 Modelos en main:');
    mainModels.forEach(model => console.log(`  - ${model}`));

    // Buscar duplicados por nombre
    console.log('\n🚨 DUPLICADOS ENCONTRADOS:');
    const duplicados = [];
    
    catalogModels.forEach(catalogModel => {
      const baseName = catalogModel.replace('.js', '');
      const correspondingMain = `${baseName}.cjs`;
      
      if (mainModels.includes(correspondingMain)) {
        duplicados.push(baseName);
        console.log(`  ❌ ${baseName}: existe en catalog (.js) y main (.cjs)`);
      }
    });

    if (duplicados.length === 0) {
      console.log('  ✅ No se encontraron duplicados');
    }

    // Verificar qué tablas tienen modelos
    console.log('\n📊 ANÁLISIS DE COBERTURA:');
    console.log('\nTablas SIN modelo correspondiente:');
    
    const allModelNames = [
      ...catalogModels.map(m => m.replace('.js', '').toLowerCase()),
      ...mainModels.map(m => m.replace('.cjs', '').toLowerCase())
    ];

    const tablasOrfanas = allTables.filter(table => {
      const tableName = table.tablename;
      // Buscar coincidencias aproximadas
      const hasModel = allModelNames.some(modelName => {
        return modelName === tableName || 
               modelName === tableName.slice(0, -1) || // plural/singular
               tableName === modelName + 's' ||
               tableName.includes(modelName) ||
               modelName.includes(tableName);
      });
      return !hasModel;
    });

    tablasOrfanas.forEach(tabla => {
      console.log(`  ⚠️  ${tabla.tablename}`);
    });

    if (tablasOrfanas.length === 0) {
      console.log('  ✅ Todas las tablas tienen modelos');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

findDuplicateModels().catch(console.error);
