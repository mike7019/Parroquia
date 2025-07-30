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

async function fixDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Verificar datos en tablas principales
    console.log('\n📊 Checking data in key tables...');
    
    const [municipios] = await sequelize.query('SELECT COUNT(*) as count FROM municipios');
    console.log(`📍 Municipios found: ${municipios[0].count}`);
    
    const [veredas] = await sequelize.query('SELECT COUNT(*) as count FROM veredas');
    console.log(`🏘️ Veredas found: ${veredas[0].count}`);
    
    // Verificar si la tabla sectors existe
    let sectorsCount = 0;
    try {
      const [sectors] = await sequelize.query('SELECT COUNT(*) as count FROM sectors');
      sectorsCount = sectors[0].count;
      console.log(`🏢 Sectors found: ${sectorsCount}`);
    } catch (error) {
      console.log('🏢 Sectors table does not exist yet (this is normal after fresh setup)');
    }

    // Verificar foreign keys problemáticas en veredas
    console.log('\n🔍 Checking foreign key violations in veredas...');
    const [invalidVeredas] = await sequelize.query(`
      SELECT v.id_vereda, v.nombre, v.id_municipio 
      FROM veredas v 
      LEFT JOIN municipios m ON v.id_municipio = m.id_municipio 
      WHERE v.id_municipio IS NOT NULL AND m.id_municipio IS NULL
    `);
    
    if (invalidVeredas.length > 0) {
      console.log(`⚠️ Found ${invalidVeredas.length} veredas with invalid municipio references:`);
      invalidVeredas.forEach(v => {
        console.log(`   - Vereda "${v.nombre}" (ID: ${v.id_vereda}) references non-existent municipio ${v.id_municipio}`);
      });
      
      console.log('🧹 Cleaning invalid foreign key references in veredas...');
      await sequelize.query(`
        UPDATE veredas 
        SET id_municipio = NULL 
        WHERE id_municipio NOT IN (SELECT id_municipio FROM municipios)
      `);
      console.log('✅ Invalid foreign key references cleaned');
    } else {
      console.log('✅ No foreign key violations found in veredas');
    }

    console.log('\n🗑️ Dropping sectors table if exists...');
    await sequelize.query('DROP TABLE IF EXISTS "sectors" CASCADE');
    console.log('✅ Sectors table dropped successfully');

    console.log('🗑️ Dropping related ENUM types if they exist...');
    await sequelize.query('DROP TYPE IF EXISTS "public"."enum_sectors_status" CASCADE');
    console.log('✅ ENUM types dropped successfully');

    // Verificar que tenemos datos básicos para que la app funcione
    if (municipios[0].count == 0) {
      console.log('\n⚠️ WARNING: No municipios found in database');
      console.log('� Inserting basic municipios data...');
      
      try {
        await sequelize.query(`
          INSERT INTO municipios (nombre, codigo_dane, departamento) VALUES 
          ('Bogotá', '11001', 'Bogotá D.C.'),
          ('Medellín', '05001', 'Antioquia'),
          ('Cali', '76001', 'Valle del Cauca'),
          ('Barranquilla', '08001', 'Atlántico'),
          ('Cartagena', '13001', 'Bolívar')
        `);
        console.log('✅ Basic municipios data inserted successfully');
        
        // Actualizar el conteo
        const [newMunicipios] = await sequelize.query('SELECT COUNT(*) as count FROM municipios');
        console.log(`📍 Municipios now available: ${newMunicipios[0].count}`);
        
      } catch (insertError) {
        console.error('⚠️ Error inserting municipios:', insertError.message);
        console.log('�💡 You may need to run: npm run db:seed or manually insert municipios');
      }
    }

    // Verificar y cargar datos de sexo
    const [sexos] = await sequelize.query('SELECT COUNT(*) as count FROM sexo');
    console.log(`🚻 Sexo records found: ${sexos[0].count}`);
    
    if (sexos[0].count == 0) {
      console.log('🔧 Inserting basic sexo data...');
      try {
        await sequelize.query(`
          INSERT INTO sexo (sexo) VALUES 
          ('Masculino'),
          ('Femenino'),
          ('Otro')
        `);
        console.log('✅ Basic sexo data inserted successfully');
      } catch (insertError) {
        console.error('⚠️ Error inserting sexo data:', insertError.message);
      }
    }

    // Verificar y cargar veredas básicas si hay municipios
    const [finalMunicipios] = await sequelize.query('SELECT COUNT(*) as count FROM municipios');
    if (finalMunicipios[0].count > 0) {
      const [currentVeredas] = await sequelize.query('SELECT COUNT(*) as count FROM veredas');
      if (currentVeredas[0].count == 0) {
        console.log('🔧 Inserting basic veredas data...');
        try {
          const [firstMunicipio] = await sequelize.query('SELECT id_municipio FROM municipios LIMIT 1');
          const municipioId = firstMunicipio[0].id_municipio;
          
          await sequelize.query(`
            INSERT INTO veredas (nombre, codigo_vereda, id_municipio) VALUES 
            ('Centro', 'V001', ${municipioId}),
            ('Norte', 'V002', ${municipioId}),
            ('Sur', 'V003', ${municipioId}),
            ('Oriente', 'V004', ${municipioId}),
            ('Occidente', 'V005', ${municipioId})
          `);
          console.log('✅ Basic veredas data inserted successfully');
        } catch (insertError) {
          console.error('⚠️ Error inserting veredas:', insertError.message);
        }
      }
    }

    console.log('\n✅ Database cleanup completed successfully!');
    console.log('📝 You can now run "npm start" to recreate the table with correct foreign keys');

  } catch (error) {
    console.error('❌ Error fixing database:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixDatabase();
