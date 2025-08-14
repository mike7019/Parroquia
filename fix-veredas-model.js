import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

async function fixVeredasModel() {
  console.log('🔧 Corrigiendo modelo y tabla de veredas...\n');
  
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');

    // 1. Eliminar constraint de la tabla sector que ya no existe
    console.log('\n1. 🗑️ Eliminando constraints obsoletos...');
    try {
      await sequelize.query(`
        ALTER TABLE veredas DROP CONSTRAINT IF EXISTS veredas_id_sector_sector_fkey;
      `, { type: QueryTypes.RAW });
      console.log('   ✅ Constraint obsoleto eliminado');
    } catch (error) {
      console.log('   ⚠️ Constraint ya estaba eliminado o no existía');
    }

    // 2. Eliminar la columna nombre_vereda que ya no se usa
    console.log('\n2. 🗑️ Eliminando columna nombre_vereda obsoleta...');
    try {
      await sequelize.query(`
        ALTER TABLE veredas DROP COLUMN IF EXISTS nombre_vereda;
      `, { type: QueryTypes.RAW });
      console.log('   ✅ Columna nombre_vereda eliminada');
    } catch (error) {
      console.log('   ⚠️ Columna ya estaba eliminada:', error.message);
    }

    // 3. Renombrar la columna id_sector_sector a id_sector
    console.log('\n3. 📝 Renombrando columna id_sector_sector...');
    try {
      await sequelize.query(`
        ALTER TABLE veredas RENAME COLUMN id_sector_sector TO id_sector;
      `, { type: QueryTypes.RAW });
      console.log('   ✅ Columna renombrada a id_sector');
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('   ⚠️ Columna id_sector_sector ya no existe o ya fue renombrada');
      } else {
        console.log('   ⚠️ Error renombrando:', error.message);
      }
    }

    // 4. Verificar si existe la tabla sectores antes de crear constraint
    console.log('\n4. 🔍 Verificando tabla sectores...');
    const sectoresExists = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sectores'
      );
    `, { type: QueryTypes.SELECT });
    
    if (sectoresExists[0].exists) {
      console.log('   ✅ Tabla sectores encontrada');
      
      // 5. Crear nuevo constraint hacia la tabla sectores
      console.log('\n5. 🔗 Creando nuevo constraint hacia sectores...');
      try {
        await sequelize.query(`
          ALTER TABLE veredas 
          ADD CONSTRAINT veredas_id_sector_fkey 
          FOREIGN KEY (id_sector) REFERENCES sectores (id_sector);
        `, { type: QueryTypes.RAW });
        console.log('   ✅ Constraint hacia sectores creado');
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('   ⚠️ Constraint ya existe');
        } else {
          console.log('   ⚠️ Error creando constraint:', error.message);
        }
      }
    } else {
      console.log('   ⚠️ Tabla sectores no encontrada, saltando creación de constraint');
    }

    // 6. Verificar estructura final
    console.log('\n6. 📊 Verificando estructura final de veredas...');
    const columns = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'veredas' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `, { type: QueryTypes.SELECT });
    
    console.log('   Columnas actuales:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    console.log('\n🎉 ¡Corrección de veredas completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error.message);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  fixVeredasModel().catch(console.error);
}

export { fixVeredasModel };
