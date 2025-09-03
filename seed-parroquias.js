import sequelize from './config/sequelize.js';

const sampleParroquias = [
  // Bogotá D.C. parishes
  { nombre: 'Parroquia San José', municipio_codigo: '00167' }, // Bogotá D.C.
  { nombre: 'Parroquia Sagrado Corazón', municipio_codigo: '00167' },
  { nombre: 'Parroquia Nuestra Señora de Fátima', municipio_codigo: '00167' },
  { nombre: 'Parroquia San Pedro Claver', municipio_codigo: '00167' },
  
  // Medellín parishes
  { nombre: 'Parroquia La Inmaculada', municipio_codigo: '00001' }, // Medellín
  { nombre: 'Parroquia San Judas Tadeo', municipio_codigo: '00001' },
  { nombre: 'Parroquia Santa Teresita', municipio_codigo: '00001' },
  
  // Cali parishes
  { nombre: 'Parroquia San Antonio', municipio_codigo: '01093' }, // Cali
  { nombre: 'Parroquia Nuestra Señora del Carmen', municipio_codigo: '01093' },
  { nombre: 'Parroquia Cristo Rey', municipio_codigo: '01093' },
  
  // Barranquilla parishes
  { nombre: 'Parroquia San Nicolás', municipio_codigo: '00144' }, // Barranquilla
  { nombre: 'Parroquia María Auxiliadora', municipio_codigo: '00144' },
  
  // Cartagena parishes
  { nombre: 'Parroquia San Pedro Claver', municipio_codigo: '00210' }, // Cartagena
  { nombre: 'Parroquia Santo Toribio', municipio_codigo: '00210' },
  
  // Bucaramanga parishes
  { nombre: 'Parroquia Sagrada Familia', municipio_codigo: '00915' }, // Bucaramanga
  { nombre: 'Parroquia San José Obrero', municipio_codigo: '00915' },
  
  // Pereira parishes
  { nombre: 'Parroquia Nuestra Señora de la Pobreza', municipio_codigo: '00897' }, // Pereira
  { nombre: 'Parroquia San Judas Tadeo', municipio_codigo: '00897' },
  
  // Santa Marta parishes
  { nombre: 'Parroquia Catedral Basílica', municipio_codigo: '00709' }, // Santa Marta
  { nombre: 'Parroquia San José', municipio_codigo: '00709' },
  
  // Ibagué parishes
  { nombre: 'Parroquia Catedral Inmaculada Concepción', municipio_codigo: '01042' }, // Ibagué
  { nombre: 'Parroquia San José', municipio_codigo: '01042' },
  
  // Additional parishes for coverage
  { nombre: 'Parroquia Nuestra Señora de Guadalupe', municipio_codigo: '00001' },
  { nombre: 'Parroquia San Francisco de Asís', municipio_codigo: '00167' },
  { nombre: 'Parroquia Santa María de los Angeles', municipio_codigo: '01093' },
  { nombre: 'Parroquia Divino Niño', municipio_codigo: '00144' },
  { nombre: 'Parroquia San Roque', municipio_codigo: '00210' }
];

async function seedParroquias() {
  try {
    console.log('🌱 Starting parroquia seeder...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Get municipio IDs for the sample data
    console.log('🔍 Fetching municipio IDs...');
    const municipioMap = new Map();
    
    for (const parroquia of sampleParroquias) {
      if (!municipioMap.has(parroquia.municipio_codigo)) {
        const [municipio] = await sequelize.query(`
          SELECT id_municipio, nombre_municipio 
          FROM municipios 
          WHERE codigo_dane = :codigo
        `, {
          replacements: { codigo: parroquia.municipio_codigo },
          type: sequelize.QueryTypes.SELECT
        });
        
        if (municipio) {
          municipioMap.set(parroquia.municipio_codigo, municipio);
        }
      }
    }
    
    console.log(`📊 Found ${municipioMap.size} municipios for parishes`);
    
    // Insert into parroquia table (main table used by models)
    console.log('🔄 Inserting into parroquia table...');
    let insertedCount = 0;
    
    for (const parroquia of sampleParroquias) {
      const municipio = municipioMap.get(parroquia.municipio_codigo);
      if (municipio) {
        try {
          await sequelize.query(`
            INSERT INTO parroquia (nombre, id_municipio)
            VALUES (:nombre, :id_municipio)
          `, {
            replacements: {
              nombre: parroquia.nombre,
              id_municipio: municipio.id_municipio
            }
          });
          insertedCount++;
        } catch (error) {
          if (!error.message.includes('duplicate')) {
            console.warn(`⚠️  Warning: ${error.message}`);
          }
        }
      } else {
        console.warn(`⚠️  Municipio not found for code: ${parroquia.municipio_codigo}`);
      }
    }
    
    // Also insert into parroquias table (with timestamps) for completeness
    console.log('🔄 Syncing with parroquias table...');
    await sequelize.query(`
      INSERT INTO parroquias (id_parroquia, nombre, id_municipio, created_at, updated_at)
      SELECT id_parroquia, nombre, id_municipio, NOW(), NOW()
      FROM parroquia
      ON CONFLICT (id_parroquia) DO NOTHING
    `);
    
    // Verify results
    const [parroquiaCount] = await sequelize.query(`SELECT COUNT(*) as count FROM parroquia`);
    const [parroquiasCount] = await sequelize.query(`SELECT COUNT(*) as count FROM parroquias`);
    
    console.log(`✅ Parroquia seeding completed!`);
    console.log(`📊 Results:`);
    console.log(`   - New parishes inserted: ${insertedCount}`);
    console.log(`   - Total in parroquia table: ${parroquiaCount[0].count}`);
    console.log(`   - Total in parroquias table: ${parroquiasCount[0].count}`);
    
    // Show sample of created parishes
    const [sampleData] = await sequelize.query(`
      SELECT p.id_parroquia, p.nombre, m.nombre_municipio, d.nombre as departamento
      FROM parroquia p
      JOIN municipios m ON p.id_municipio = m.id_municipio
      JOIN departamentos d ON m.id_departamento = d.id_departamento
      ORDER BY p.id_parroquia
      LIMIT 10
    `);
    
    console.log('\n📋 Sample parishes created:');
    sampleData.forEach(parish => {
      console.log(`   - ${parish.nombre} (${parish.nombre_municipio}, ${parish.departamento})`);
    });
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error seeding parroquias:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

seedParroquias();
