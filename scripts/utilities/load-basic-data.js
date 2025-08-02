import { Sequelize } from 'sequelize';
import 'dotenv/config';

// Database connection using the same config as the app
const sequelize = new Sequelize(
  process.env.DB_NAME || 'parroquia_db',
  process.env.DB_USER || 'parroquia_user',
  process.env.DB_PASSWORD || 'admin',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log
  }
);

async function checkAndLoadBasicData() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');

    // Verificar tablas existentes
    console.log('\n📊 Verificando tablas existentes...');
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`📋 Tablas encontradas: ${tables.length}`);
    tables.forEach(table => console.log(`   - ${table.table_name}`));

    // Verificar datos en municipios
    console.log('\n🏛️ Verificando datos de municipios...');
    const [municipios] = await sequelize.query('SELECT COUNT(*) as count FROM municipios');
    console.log(`📍 Municipios en DB: ${municipios[0].count}`);

    if (municipios[0].count === 0) {
      console.log('🔧 Insertando municipios básicos de Colombia...');
      await sequelize.query(`
        INSERT INTO municipios (nombre, codigo_dane, departamento) VALUES 
        ('Bogotá', '11001', 'Bogotá D.C.'),
        ('Medellín', '05001', 'Antioquia'),
        ('Cali', '76001', 'Valle del Cauca'),
        ('Barranquilla', '08001', 'Atlántico'),
        ('Cartagena', '13001', 'Bolívar'),
        ('Cúcuta', '54001', 'Norte de Santander'),
        ('Bucaramanga', '68001', 'Santander'),
        ('Pereira', '66001', 'Risaralda'),
        ('Manizales', '17001', 'Caldas'),
        ('Santa Marta', '47001', 'Magdalena')
        ON CONFLICT (codigo_dane) DO NOTHING
      `);
      console.log('✅ Municipios básicos insertados');
    }

    // Verificar datos en veredas
    console.log('\n🏘️ Verificando datos de veredas...');
    const [veredas] = await sequelize.query('SELECT COUNT(*) as count FROM veredas');
    console.log(`🏞️ Veredas en DB: ${veredas[0].count}`);

    if (veredas[0].count === 0) {
      console.log('🔧 Insertando veredas básicas...');
      const [firstMunicipio] = await sequelize.query('SELECT id_municipio FROM municipios LIMIT 1');
      
      if (firstMunicipio.length > 0) {
        const municipioId = firstMunicipio[0].id_municipio;
        await sequelize.query(`
          INSERT INTO veredas (nombre, codigo_vereda, id_municipio) VALUES 
          ('Centro', 'V001', ${municipioId}),
          ('Norte', 'V002', ${municipioId}),
          ('Sur', 'V003', ${municipioId}),
          ('Oriente', 'V004', ${municipioId}),
          ('Occidente', 'V005', ${municipioId})
          ON CONFLICT (codigo_vereda) DO NOTHING
        `);
        console.log('✅ Veredas básicas insertadas');
      }
    }

    // Verificar datos en sexo
    console.log('\n👥 Verificando datos de sexo...');
    const [sexos] = await sequelize.query('SELECT COUNT(*) as count FROM sexo');
    console.log(`🚻 Registros de sexo en DB: ${sexos[0].count}`);

    if (sexos[0].count === 0) {
      console.log('🔧 Insertando datos de sexo...');
      await sequelize.query(`
        INSERT INTO sexo (sexo) VALUES 
        ('Masculino'),
        ('Femenino'),
        ('Otro')
        ON CONFLICT DO NOTHING
      `);
      console.log('✅ Datos de sexo insertados');
    }

    // Verificar datos en parroquia
    console.log('\n⛪ Verificando datos de parroquia...');
    const [parroquias] = await sequelize.query('SELECT COUNT(*) as count FROM parroquia');
    console.log(`🏛️ Parroquias en DB: ${parroquias[0].count}`);

    if (parroquias[0].count === 0) {
      console.log('🔧 Insertando parroquia por defecto...');
      await sequelize.query(`
        INSERT INTO parroquia (nombre) VALUES 
        ('Parroquia San José'),
        ('Parroquia Nuestra Señora de la Paz'),
        ('Parroquia San Pedro')
        ON CONFLICT DO NOTHING
      `);
      console.log('✅ Parroquias por defecto insertadas');
    }

    console.log('\n✅ Verificación y carga de datos básicos completada!');
    console.log('🎯 Ahora deberías poder crear veredas, sectores y otros registros sin errores de foreign key');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📋 Detalles:', error);
  } finally {
    await sequelize.close();
  }
}

checkAndLoadBasicData();
