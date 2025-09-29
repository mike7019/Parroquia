const { Sequelize } = require('sequelize');

// Configuración para la base de datos remota
const sequelize = new Sequelize('parroquia_db', 'parroquia_user', 'ParroquiaSecure2025', {
  host: '206.62.139.100',
  port: 5433,
  dialect: 'postgres',
  logging: console.log
});

async function migrateRemoteDatabase() {
  try {
    console.log('🚀 Iniciando migración de base de datos remota...\n');

    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a BD remota establecida');

    // Verificar estructura actual
    console.log('\n🔍 Verificando estructura actual de tabla parroquias...');
    const [currentColumns] = await sequelize.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'parroquias' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Columnas actuales:');
    currentColumns.forEach(col => {
      const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      console.log(`   • ${col.column_name}: ${col.data_type}${length} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
    });

    // Verificar si los campos ya existen
    const existingFields = currentColumns.map(col => col.column_name);
    const fieldsToAdd = [];
    
    if (!existingFields.includes('direccion')) {
      fieldsToAdd.push({ name: 'direccion', sql: 'ADD COLUMN direccion VARCHAR(500)' });
    }
    if (!existingFields.includes('telefono')) {
      fieldsToAdd.push({ name: 'telefono', sql: 'ADD COLUMN telefono VARCHAR(20)' });
    }
    if (!existingFields.includes('email')) {
      fieldsToAdd.push({ name: 'email', sql: 'ADD COLUMN email VARCHAR(100)' });
    }

    if (fieldsToAdd.length === 0) {
      console.log('\n✅ Todos los campos ya existen en la tabla parroquias');
      return;
    }

    console.log(`\n📝 Campos a agregar: ${fieldsToAdd.map(f => f.name).join(', ')}`);

    // Ejecutar migraciones
    console.log('\n🔧 Ejecutando migraciones...');
    
    for (const field of fieldsToAdd) {
      try {
        console.log(`   Agregando campo ${field.name}...`);
        await sequelize.query(`ALTER TABLE parroquias ${field.sql}`);
        console.log(`   ✅ Campo ${field.name} agregado exitosamente`);
      } catch (error) {
        console.error(`   ❌ Error agregando ${field.name}: ${error.message}`);
        throw error;
      }
    }

    // Verificar estructura después de la migración
    console.log('\n🔍 Verificando estructura después de migración...');
    const [newColumns] = await sequelize.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'parroquias' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Nueva estructura:');
    newColumns.forEach(col => {
      const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      const isNew = fieldsToAdd.some(f => f.name === col.column_name);
      const marker = isNew ? '🆕' : '  ';
      console.log(`${marker} • ${col.column_name}: ${col.data_type}${length} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
    });

    console.log('\n✅ Migración completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    if (error.original) {
      console.error('   Error original:', error.original.message);
    }
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Función para probar la creación de una parroquia
async function testParroquiaCreation() {
  try {
    console.log('\n🧪 Probando creación de parroquia con nuevos campos...');
    
    const testSequelize = new Sequelize('parroquia_db', 'parroquia_user', 'ParroquiaSecure2025', {
      host: '206.62.139.100',
      port: 5433,
      dialect: 'postgres',
      logging: false
    });

    await testSequelize.authenticate();

    // Intentar insertar una parroquia de prueba
    const testData = {
      nombre: 'Parroquia de Prueba Migración',
      direccion: 'Calle 123 #45-67, Barrio Centro',
      telefono: '+57 300 123 4567',
      email: 'prueba.migracion@parroquia.com',
      id_municipio: 1
    };

    const [result] = await testSequelize.query(`
      INSERT INTO parroquias (nombre, direccion, telefono, email, id_municipio, created_at, updated_at)
      VALUES (:nombre, :direccion, :telefono, :email, :id_municipio, NOW(), NOW())
      RETURNING *;
    `, {
      replacements: testData
    });

    console.log('✅ Parroquia de prueba creada exitosamente:');
    console.log('   ID:', result[0].id_parroquia);
    console.log('   Nombre:', result[0].nombre);
    console.log('   Dirección:', result[0].direccion);
    console.log('   Teléfono:', result[0].telefono);
    console.log('   Email:', result[0].email);

    // Limpiar - eliminar la parroquia de prueba
    await testSequelize.query(`
      DELETE FROM parroquias WHERE id_parroquia = :id
    `, {
      replacements: { id: result[0].id_parroquia }
    });

    console.log('🧹 Parroquia de prueba eliminada (limpieza completada)');

    await testSequelize.close();

  } catch (error) {
    console.error('❌ Error en prueba de creación:', error.message);
    throw error;
  }
}

// Ejecutar migración y prueba
async function main() {
  try {
    await migrateRemoteDatabase();
    await testParroquiaCreation();
    console.log('\n🎉 ¡Proceso completado exitosamente!');
    console.log('La base de datos remota ahora tiene la misma estructura que tu base local.');
  } catch (error) {
    console.error('\n💥 Error en el proceso:', error.message);
    process.exit(1);
  }
}

main();