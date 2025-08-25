import sequelize from './config/sequelize.js';
import './src/models/index.js'; // Cargar todos los modelos

/**
 * Script para sincronizar cambios en el modelo Familias
 * y corregir cualquier problema de secuencias
 */

async function syncFamiliasModel() {
  try {
    console.log('🔄 Iniciando sincronización del modelo Familias...');

    // 1. Verificar conexión
    console.log('🔍 Verificando conexión...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    // 2. Verificar estado actual de la tabla
    console.log('📊 Verificando estado actual...');
    
    const [tableInfo] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
      AND column_name = 'id_familia';
    `);

    if (tableInfo.length > 0) {
      const column = tableInfo[0];
      console.log(`📋 Configuración actual de id_familia:`);
      console.log(`   - Tipo: ${column.data_type}`);
      console.log(`   - Nullable: ${column.is_nullable}`);
      console.log(`   - Default: ${column.column_default}`);
    }

    // 3. Verificar y corregir secuencia
    console.log('🔢 Verificando secuencia...');
    
    const [sequences] = await sequelize.query(`
      SELECT schemaname, sequencename, last_value 
      FROM pg_sequences 
      WHERE sequencename = 'familias_id_familia_seq';
    `);

    if (sequences.length > 0) {
      const seq = sequences[0];
      console.log(`   - Secuencia encontrada: ${seq.sequencename}`);
      console.log(`   - Último valor: ${seq.last_value}`);

      // Verificar si la secuencia está correctamente asignada
      const [seqOwner] = await sequelize.query(`
        SELECT pg_get_serial_sequence('familias', 'id_familia') as sequence_name;
      `);

      if (seqOwner[0].sequence_name) {
        console.log(`   - Secuencia correctamente asignada: ${seqOwner[0].sequence_name}`);
      } else {
        console.log('⚠️ La secuencia no está asignada a la columna. Corrigiendo...');
        
        await sequelize.query(`
          ALTER TABLE familias 
          ALTER COLUMN id_familia 
          SET DEFAULT nextval('familias_id_familia_seq');
        `);
        
        console.log('✅ Secuencia asignada correctamente');
      }
    } else {
      console.log('⚠️ Secuencia no encontrada. Creando...');
      
      // Obtener el máximo ID actual
      const [maxResult] = await sequelize.query(`
        SELECT COALESCE(MAX(id_familia), 0) as max_id FROM familias;
      `);
      
      const nextValue = parseInt(maxResult[0].max_id) + 1;
      
      await sequelize.query(`
        CREATE SEQUENCE familias_id_familia_seq
        START WITH ${nextValue}
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
      `);
      
      await sequelize.query(`
        ALTER TABLE familias 
        ALTER COLUMN id_familia 
        SET DEFAULT nextval('familias_id_familia_seq');
      `);
      
      await sequelize.query(`
        ALTER SEQUENCE familias_id_familia_seq OWNED BY familias.id_familia;
      `);
      
      console.log(`✅ Secuencia creada y configurada (empezando en ${nextValue})`);
    }

    // 4. Sincronizar modelo (solo alter, no recrear)
    console.log('🔄 Sincronizando modelo...');
    
    await sequelize.sync({ 
      alter: true,
      force: false 
    });
    
    console.log('✅ Sincronización completada');

    // 5. Verificar que todo funciona
    console.log('🧪 Probando inserción de prueba...');
    
    const testResult = await sequelize.query(`
      INSERT INTO familias (
        apellido_familiar, sector, direccion_familia, 
        tamaño_familia, tipo_vivienda, estado_encuesta
      ) VALUES (
        'SYNC_TEST', 'TEST_SECTOR', 'TEST_ADDRESS',
        1, 'Casa', 'pending'
      ) RETURNING id_familia;
    `);
    
    const newId = testResult[0][0].id_familia;
    console.log(`✅ Inserción exitosa. Nuevo ID: ${newId}`);
    
    // Eliminar registro de prueba
    await sequelize.query(`
      DELETE FROM familias WHERE id_familia = ${newId};
    `);
    
    console.log('🧹 Registro de prueba eliminado');

    // 6. Mostrar estado final
    const [finalCount] = await sequelize.query(`
      SELECT COUNT(*) as count FROM familias;
    `);
    
    const [finalSeq] = await sequelize.query(`
      SELECT last_value FROM pg_sequences 
      WHERE sequencename = 'familias_id_familia_seq';
    `);

    console.log(`📊 Estado final:`);
    console.log(`   - Total familias: ${finalCount[0].count}`);
    console.log(`   - Secuencia en: ${finalSeq[0].last_value}`);

    console.log('🎉 Sincronización completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar solo si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  syncFamiliasModel()
    .then(() => {
      console.log('✅ Script de sincronización completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script:', error);
      process.exit(1);
    });
}

export default syncFamiliasModel;
