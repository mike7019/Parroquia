const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('parroquia_db', 'parroquia_user', 'ParroquiaSecure2025', {
  host: '206.62.139.100',
  port: 5433,
  dialect: 'postgres',
  logging: false
});

async function addTimestampColumns() {
  try {
    console.log('🕒 Agregando columnas de timestamp a tabla parroquia...\n');

    await sequelize.authenticate();

    // Verificar si las columnas ya existen
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'parroquia' 
      AND table_schema = 'public'
      AND column_name IN ('created_at', 'updated_at');
    `);

    const existingColumns = columns.map(col => col.column_name);
    console.log('📋 Columnas de timestamp existentes:', existingColumns);

    // Agregar created_at si no existe
    if (!existingColumns.includes('created_at')) {
      console.log('   Agregando columna created_at...');
      await sequelize.query(`
        ALTER TABLE parroquia 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `);
      console.log('   ✅ Columna created_at agregada');
    } else {
      console.log('   ✅ Columna created_at ya existe');
    }

    // Agregar updated_at si no existe
    if (!existingColumns.includes('updated_at')) {
      console.log('   Agregando columna updated_at...');
      await sequelize.query(`
        ALTER TABLE parroquia 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `);
      console.log('   ✅ Columna updated_at agregada');
    } else {
      console.log('   ✅ Columna updated_at ya existe');
    }

    // Actualizar registros existentes que tengan NULL en los timestamps
    console.log('\n🔄 Actualizando registros existentes...');
    const [updateResult] = await sequelize.query(`
      UPDATE parroquia 
      SET 
        created_at = COALESCE(created_at, NOW()),
        updated_at = COALESCE(updated_at, NOW())
      WHERE created_at IS NULL OR updated_at IS NULL
    `);

    console.log(`   ✅ ${updateResult.rowCount || 0} registros actualizados`);

    // Verificar estructura final
    console.log('\n📋 Estructura final de tabla parroquia:');
    const [finalColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'parroquia' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);

    finalColumns.forEach(col => {
      const isNew = ['created_at', 'updated_at'].includes(col.column_name);
      const marker = isNew ? '🆕' : '  ';
      console.log(`${marker} • ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
      if (col.column_default) {
        console.log(`     Default: ${col.column_default}`);
      }
    });

    // Probar consulta con timestamps
    console.log('\n🧪 Probando consulta con timestamps...');
    const [testData] = await sequelize.query(`
      SELECT id_parroquia, nombre, created_at, updated_at 
      FROM parroquia 
      LIMIT 2
    `);

    testData.forEach(parroquia => {
      console.log(`   • ${parroquia.nombre}:`);
      console.log(`     Created: ${parroquia.created_at}`);
      console.log(`     Updated: ${parroquia.updated_at}`);
    });

    console.log('\n🎉 ¡Migración de timestamps completada exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

addTimestampColumns();