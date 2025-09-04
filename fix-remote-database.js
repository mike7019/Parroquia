import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function fixRemoteDatabase() {
  console.log('🚨 APLICANDO CORRECCIÓN URGENTE A BD REMOTA...');
  console.log('🌐 Servidor: 206.62.139.100:5432');
  console.log('📅', new Date().toLocaleString());
  console.log('');

  // Conectar a BD remota
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'parroquia_db',
    process.env.DB_USER || 'parroquia_user', 
    process.env.DB_PASSWORD || 'parroquia123',
    {
      host: '206.62.139.100',
      port: 5432,
      dialect: 'postgres',
      logging: console.log, // Mostrar SQL ejecutado
      dialectOptions: {
        connectTimeout: 30000,
        statement_timeout: 60000,
      }
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a BD remota\n');

    // 1. Crear tabla sistemas_acueducto
    console.log('🔧 Creando tabla sistemas_acueducto...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS sistemas_acueducto (
        id_sistema_acueducto SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL UNIQUE,
        descripcion TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // 2. Crear tabla encuestas
    console.log('🔧 Creando tabla encuestas...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS encuestas (
        id_encuesta SERIAL PRIMARY KEY,
        id_familia INTEGER,
        fecha_encuesta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        estado VARCHAR(50) DEFAULT 'en_progreso',
        etapa_actual INTEGER DEFAULT 1,
        datos_etapa JSONB,
        observaciones TEXT,
        encuestador_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completada BOOLEAN DEFAULT FALSE
      )
    `);

    // 3. Crear tabla familia_sistema_acueducto
    console.log('🔧 Creando tabla familia_sistema_acueducto...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS familia_sistema_acueducto (
        id SERIAL PRIMARY KEY,
        id_familia INTEGER NOT NULL,
        id_sistema_acueducto INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(id_familia, id_sistema_acueducto)
      )
    `);

    // 4. Crear tabla familia_tipo_vivienda
    console.log('🔧 Creando tabla familia_tipo_vivienda...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS familia_tipo_vivienda (
        id SERIAL PRIMARY KEY,
        id_familia INTEGER NOT NULL,
        id_tipo_vivienda INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(id_familia, id_tipo_vivienda)
      )
    `);

    // 5. Crear tabla familia_disposicion_basuras
    console.log('🔧 Creando tabla familia_disposicion_basuras...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS familia_disposicion_basuras (
        id SERIAL PRIMARY KEY,
        id_familia INTEGER NOT NULL,
        disposicion VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // 6. Crear tabla familia_aguas_residuales
    console.log('🔧 Creando tabla familia_aguas_residuales...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS familia_aguas_residuales (
        id SERIAL PRIMARY KEY,
        id_familia INTEGER NOT NULL,
        tipo_tratamiento VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // 7. Insertar datos básicos en sistemas_acueducto
    console.log('💧 Insertando sistemas de acueducto básicos...');
    const sistemasAcueducto = [
      'Acueducto Municipal',
      'Pozo Propio',
      'Agua de Lluvia', 
      'Río o Quebrada',
      'Carro Tanque',
      'Otro'
    ];

    for (const sistema of sistemasAcueducto) {
      await sequelize.query(`
        INSERT INTO sistemas_acueducto (nombre, created_at, updated_at)
        VALUES (:nombre, NOW(), NOW())
        ON CONFLICT (nombre) DO NOTHING
      `, {
        replacements: { nombre: sistema }
      });
    }

    // 8. Verificar tablas creadas
    console.log('\n🔍 Verificando tablas creadas...');
    
    const tablesToCheck = [
      'sistemas_acueducto',
      'encuestas', 
      'familia_sistema_acueducto',
      'familia_tipo_vivienda',
      'familia_disposicion_basuras',
      'familia_aguas_residuales'
    ];

    for (const tableName of tablesToCheck) {
      try {
        const [result] = await sequelize.query(`
          SELECT COUNT(*) as count FROM ${tableName}
        `);
        console.log(`✅ ${tableName}: ${result[0].count} registros`);
      } catch (error) {
        console.log(`❌ ${tableName}: Error - ${error.message}`);
      }
    }

    // 9. Verificar que las encuestas ahora funcionen
    console.log('\n🧪 PRUEBA FINAL - Verificando funcionalidad de encuestas...');
    try {
      const [encuestasTest] = await sequelize.query(`
        SELECT COUNT(*) as count FROM encuestas;
      `);
      console.log(`✅ Tabla encuestas funcional: ${encuestasTest[0].count} registros`);
      
      const [junctionTest] = await sequelize.query(`
        SELECT COUNT(*) as count FROM familia_sistema_acueducto;
      `);
      console.log(`✅ Junction table funcional: ${junctionTest[0].count} registros`);
      
      console.log('\n🎉 ¡CORRECCIÓN APLICADA EXITOSAMENTE A BD REMOTA!');
      
    } catch (error) {
      console.log(`❌ Error en prueba final: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error aplicando corrección a BD remota:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n🔒 Conexión cerrada');
  }
}

// Ejecutar corrección
fixRemoteDatabase().catch(console.error);
