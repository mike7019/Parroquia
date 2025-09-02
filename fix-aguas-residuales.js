import { Sequelize, DataTypes } from 'sequelize';
import 'dotenv/config';

// Configuración de la base de datos
const sequelize = new Sequelize({
  username: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'parroquia_db',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: console.log
});

async function verificarYCrearTablaAguasResiduales() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    // Verificar si existe la tabla tipos_aguas_residuales
    console.log('\n🔍 Verificando tabla tipos_aguas_residuales...');
    const tiposAguasResiduales = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'tipos_aguas_residuales'
    `);
    
    if (tiposAguasResiduales[0].length > 0) {
      console.log('✅ Tabla tipos_aguas_residuales existe');
      
      // Mostrar contenido
      const tipos = await sequelize.query('SELECT * FROM tipos_aguas_residuales LIMIT 5');
      console.log('📋 Tipos disponibles:', tipos[0]);
    } else {
      console.log('❌ Tabla tipos_aguas_residuales NO existe');
      return;
    }

    // Verificar si existe la tabla familia_aguas_residuales
    console.log('\n🔍 Verificando tabla familia_aguas_residuales...');
    const familiaAguasResiduales = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'familia_aguas_residuales'
    `);
    
    if (familiaAguasResiduales[0].length > 0) {
      console.log('✅ Tabla familia_aguas_residuales ya existe');
    } else {
      console.log('❌ Tabla familia_aguas_residuales NO existe');
      console.log('🔧 Creando tabla familia_aguas_residuales...');
      
      // Crear la tabla de relación
      await sequelize.query(`
        CREATE TABLE familia_aguas_residuales (
          id_familia INTEGER NOT NULL REFERENCES familias(id_familia) ON DELETE CASCADE,
          id_tipo_aguas_residuales INTEGER NOT NULL REFERENCES tipos_aguas_residuales(id_tipo_aguas_residuales) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          PRIMARY KEY (id_familia, id_tipo_aguas_residuales)
        );
      `);
      
      console.log('✅ Tabla familia_aguas_residuales creada exitosamente');
      
      // Crear algunos registros de ejemplo (opcional)
      console.log('🔧 Agregando registros de ejemplo...');
      
      // Obtener familias existentes
      const familias = await sequelize.query('SELECT id_familia FROM familias LIMIT 3');
      
      // Obtener tipos de aguas residuales
      const tipos = await sequelize.query('SELECT id_tipo_aguas_residuales FROM tipos_aguas_residuales LIMIT 2');
      
      if (familias[0].length > 0 && tipos[0].length > 0) {
        // Insertar algunos registros de ejemplo
        for (let i = 0; i < Math.min(2, familias[0].length); i++) {
          const familiaId = familias[0][i].id_familia;
          const tipoId = tipos[0][0].id_tipo_aguas_residuales; // Usar el primer tipo
          
          await sequelize.query(`
            INSERT INTO familia_aguas_residuales (id_familia, id_tipo_aguas_residuales)
            VALUES (${familiaId}, ${tipoId})
            ON CONFLICT (id_familia, id_tipo_aguas_residuales) DO NOTHING
          `);
        }
        console.log('✅ Registros de ejemplo agregados');
      }
    }

    // Verificar otras tablas relacionadas
    console.log('\n🔍 Verificando otras tablas relacionadas...');
    
    const tablasRelacionadas = [
      'familia_disposicion_basura',
      'familia_sistema_acueducto',
      'tipos_disposicion_basura',
      'sistemas_acueducto'
    ];
    
    for (const tabla of tablasRelacionadas) {
      const existe = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '${tabla}'
      `);
      
      if (existe[0].length > 0) {
        console.log(`✅ ${tabla} existe`);
      } else {
        console.log(`❌ ${tabla} NO existe`);
      }
    }

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
verificarYCrearTablaAguasResiduales();
