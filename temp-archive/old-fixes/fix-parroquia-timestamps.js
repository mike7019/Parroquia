import sequelize from './config/sequelize.js';

async function fixParroquiaTimestamps() {
  try {
    console.log('🔄 Iniciando corrección de timestamps en tabla parroquia...');
    
    // Verificar qué columnas ya existen
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'parroquia' AND table_schema = 'public'
    `);
    
    const existingColumns = columns.map(col => col.column_name);
    console.log('📊 Columnas existentes:', existingColumns);
    
    // Agregar columnas de timestamp con valores por defecto para registros existentes
    if (!existingColumns.includes('created_at')) {
      console.log('➕ Agregando columna created_at...');
      await sequelize.query(`
        ALTER TABLE parroquia 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `);
      
      // Actualizar registros existentes que tienen NULL
      await sequelize.query(`
        UPDATE parroquia 
        SET created_at = NOW() 
        WHERE created_at IS NULL
      `);
      
      // Hacer la columna NOT NULL después de llenar los valores
      await sequelize.query(`
        ALTER TABLE parroquia 
        ALTER COLUMN created_at SET NOT NULL
      `);
    }
    
    if (!existingColumns.includes('updated_at')) {
      console.log('➕ Agregando columna updated_at...');
      await sequelize.query(`
        ALTER TABLE parroquia 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `);
      
      // Actualizar registros existentes que tienen NULL
      await sequelize.query(`
        UPDATE parroquia 
        SET updated_at = NOW() 
        WHERE updated_at IS NULL
      `);
      
      // Hacer la columna NOT NULL después de llenar los valores
      await sequelize.query(`
        ALTER TABLE parroquia 
        ALTER COLUMN updated_at SET NOT NULL
      `);
    }
    
    // Agregar las otras columnas si no existen
    const newColumns = {
      'descripcion': 'TEXT',
      'direccion': 'VARCHAR(500)',
      'telefono': 'VARCHAR(20)',
      'email': 'VARCHAR(100)',
      'activo': 'BOOLEAN DEFAULT true'
    };
    
    for (const [columnName, columnType] of Object.entries(newColumns)) {
      if (!existingColumns.includes(columnName)) {
        console.log(`➕ Agregando columna ${columnName}...`);
        await sequelize.query(`
          ALTER TABLE parroquia 
          ADD COLUMN ${columnName} ${columnType}
        `);
      }
    }
    
    // Agregar constraint de foreign key si no existe
    const [constraints] = await sequelize.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'parroquia' 
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name LIKE '%municipio%'
    `);
    
    if (constraints.length === 0) {
      console.log('🔗 Agregando foreign key constraint...');
      await sequelize.query(`
        ALTER TABLE parroquia 
        ADD CONSTRAINT fk_parroquia_municipio 
        FOREIGN KEY (id_municipio) REFERENCES municipios (id_municipio)
      `);
    }
    
    // Crear índices
    const indexes = [
      { name: 'idx_parroquia_municipio', column: 'id_municipio' },
      { name: 'idx_parroquia_nombre', column: 'nombre' },
      { name: 'idx_parroquia_activo', column: 'activo' }
    ];
    
    for (const idx of indexes) {
      try {
        console.log(`📋 Creando índice ${idx.name}...`);
        await sequelize.query(`
          CREATE INDEX IF NOT EXISTS ${idx.name} ON parroquia (${idx.column})
        `);
      } catch (error) {
        if (error.original?.code !== '42P07') { // 42P07 = index already exists
          console.log(`⚠️ Error creando índice ${idx.name}:`, error.message);
        }
      }
    }
    
    console.log('✅ Corrección de tabla parroquia completada exitosamente');
    
    // Verificar la estructura final
    const [finalColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'parroquia' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Estructura final de la tabla parroquia:');
    finalColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}) (default: ${col.column_default})`);
    });
    
  } catch (error) {
    console.error('❌ Error al corregir timestamps:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

fixParroquiaTimestamps();
