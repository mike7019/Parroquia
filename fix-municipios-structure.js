import sequelize from './config/sequelize.js';

async function fixMunicipiosStructure() {
  try {
    console.log('🔍 Verificando estructura de tabla municipios...');
    
    // Verificar estructura actual
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'municipios' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Estructura actual de municipios:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Verificar si existe la columna codigo_dane
    const hasCodigoDane = columns.some(col => col.column_name === 'codigo_dane');
    
    if (!hasCodigoDane) {
      console.log('\n⚠️  La columna codigo_dane no existe. Agregándola...');
      
      // Agregar la columna codigo_dane
      await sequelize.query(`
        ALTER TABLE municipios 
        ADD COLUMN codigo_dane VARCHAR(5);
      `);
      console.log('✅ Columna codigo_dane agregada');
      
      // Llenar con datos temporales si es necesario
      await sequelize.query(`
        UPDATE municipios 
        SET codigo_dane = LPAD(id_municipio::text, 5, '0') 
        WHERE codigo_dane IS NULL;
      `);
      console.log('✅ Datos temporales agregados a codigo_dane');
      
      // Hacer la columna NOT NULL
      await sequelize.query(`
        ALTER TABLE municipios 
        ALTER COLUMN codigo_dane SET NOT NULL;
      `);
      console.log('✅ Columna codigo_dane configurada como NOT NULL');
      
      // Agregar índice único
      try {
        await sequelize.query(`
          CREATE UNIQUE INDEX municipios_codigo_dane_unique 
          ON municipios (codigo_dane);
        `);
        console.log('✅ Índice único creado para codigo_dane');
      } catch (indexError) {
        console.log('⚠️  El índice ya existe o hay un error:', indexError.message);
      }
    } else {
      console.log('✅ La columna codigo_dane ya existe');
      
      // Verificar si existe el índice
      const [indexes] = await sequelize.query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'municipios' 
        AND indexname = 'municipios_codigo_dane_unique';
      `);
      
      if (indexes.length === 0) {
        console.log('🔧 Creando índice único para codigo_dane...');
        try {
          await sequelize.query(`
            CREATE UNIQUE INDEX municipios_codigo_dane_unique 
            ON municipios (codigo_dane);
          `);
          console.log('✅ Índice único creado para codigo_dane');
        } catch (indexError) {
          console.log('❌ Error creando índice:', indexError.message);
        }
      } else {
        console.log('✅ El índice único ya existe');
      }
    }
    
    // Mostrar estructura final
    const [finalColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'municipios' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Estructura final de municipios:');
    finalColumns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Contar registros
    const [count] = await sequelize.query('SELECT COUNT(*) as total FROM municipios');
    console.log(`\n📊 Total de municipios: ${count[0].total}`);
    
  } catch (error) {
    console.error('❌ Error al corregir estructura:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar corrección
fixMunicipiosStructure()
  .then(() => {
    console.log('\n🎉 Corrección de estructura completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script falló:', error.message);
    process.exit(1);
  });
