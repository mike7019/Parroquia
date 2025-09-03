import sequelize from './config/sequelize.js';

const sampleSectores = [
  // Bogotá sectors
  { nombre: 'Centro Histórico', municipio_codigo: '00167' },
  { nombre: 'Chapinero', municipio_codigo: '00167' },
  { nombre: 'La Candelaria', municipio_codigo: '00167' },
  { nombre: 'Zona Rosa', municipio_codigo: '00167' },
  { nombre: 'Usaquén', municipio_codigo: '00167' },
  
  // Medellín sectors  
  { nombre: 'El Poblado', municipio_codigo: '00001' },
  { nombre: 'Laureles', municipio_codigo: '00001' },
  { nombre: 'Centro', municipio_codigo: '00001' },
  { nombre: 'Envigado', municipio_codigo: '00001' },
  
  // Cali sectors
  { nombre: 'San Antonio', municipio_codigo: '01093' },
  { nombre: 'Granada', municipio_codigo: '01093' },
  { nombre: 'Ciudad Jardín', municipio_codigo: '01093' },
  { nombre: 'Versalles', municipio_codigo: '01093' },
  
  // Barranquilla sectors
  { nombre: 'Centro', municipio_codigo: '00144' },
  { nombre: 'El Prado', municipio_codigo: '00144' },
  { nombre: 'Riomar', municipio_codigo: '00144' },
  
  // Cartagena sectors
  { nombre: 'Centro Histórico', municipio_codigo: '00210' },
  { nombre: 'Bocagrande', municipio_codigo: '00210' },
  { nombre: 'Getsemaní', municipio_codigo: '00210' },
  
  // Additional sectors for other cities
  { nombre: 'Cabecera', municipio_codigo: '00915' }, // Bucaramanga
  { nombre: 'Centro', municipio_codigo: '00897' }, // Pereira
  { nombre: 'Rodadero', municipio_codigo: '00709' }, // Santa Marta
  { nombre: 'Centro', municipio_codigo: '01042' }, // Ibagué
];

const sampleVeredas = [
  // Rural areas around major cities
  { nombre: 'Vereda La Calera', municipio_codigo: '00167' },
  { nombre: 'Vereda Usme', municipio_codigo: '00167' },
  { nombre: 'Vereda Sumapaz', municipio_codigo: '00167' },
  
  { nombre: 'Vereda Santa Elena', municipio_codigo: '00001' },
  { nombre: 'Vereda San Sebastián de Palmitas', municipio_codigo: '00001' },
  { nombre: 'Vereda San Cristóbal', municipio_codigo: '00001' },
  
  { nombre: 'Vereda Los Andes', municipio_codigo: '01093' },
  { nombre: 'Vereda La Buitrera', municipio_codigo: '01093' },
  { nombre: 'Vereda La Elvira', municipio_codigo: '01093' },
  
  { nombre: 'Vereda La Playa', municipio_codigo: '00144' },
  { nombre: 'Vereda Las Flores', municipio_codigo: '00144' },
  
  { nombre: 'Vereda Tierra Baja', municipio_codigo: '00210' },
  { nombre: 'Vereda Ararca', municipio_codigo: '00210' },
  
  { nombre: 'Vereda Café Madrid', municipio_codigo: '00915' },
  { nombre: 'Vereda El Rasgón', municipio_codigo: '00915' },
  
  { nombre: 'Vereda La Florida', municipio_codigo: '00897' },
  { nombre: 'Vereda Tribunas', municipio_codigo: '00897' },
  
  { nombre: 'Vereda Taganga', municipio_codigo: '00709' },
  { nombre: 'Vereda Bonda', municipio_codigo: '00709' },
  
  { nombre: 'Vereda Juntas', municipio_codigo: '01042' },
  { nombre: 'Vereda Villa Restrepo', municipio_codigo: '01042' },
];

async function seedGeographicData() {
  try {
    console.log('🌱 Starting geographic data seeder...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Get municipio IDs
    console.log('🔍 Fetching municipio IDs...');
    const municipioMap = new Map();
    
    const allCodes = [
      ...new Set([
        ...sampleSectores.map(s => s.municipio_codigo),
        ...sampleVeredas.map(v => v.municipio_codigo)
      ])
    ];
    
    for (const codigo of allCodes) {
      const [municipio] = await sequelize.query(`
        SELECT id_municipio, nombre_municipio 
        FROM municipios 
        WHERE codigo_dane = :codigo
      `, {
        replacements: { codigo },
        type: sequelize.QueryTypes.SELECT
      });
      
      if (municipio) {
        municipioMap.set(codigo, municipio);
      }
    }
    
    console.log(`📊 Found ${municipioMap.size} municipios for geographic data`);
    
    // Insert sectores
    console.log('🔄 Inserting sectores...');
    let sectoresInserted = 0;
    
    for (const sector of sampleSectores) {
      const municipio = municipioMap.get(sector.municipio_codigo);
      if (municipio) {
        try {
          await sequelize.query(`
            INSERT INTO sectores (nombre, id_municipio, created_at, updated_at)
            VALUES (:nombre, :id_municipio, NOW(), NOW())
          `, {
            replacements: {
              nombre: sector.nombre,
              id_municipio: municipio.id_municipio
            }
          });
          sectoresInserted++;
        } catch (error) {
          if (!error.message.includes('duplicate')) {
            console.warn(`⚠️  Warning inserting sector: ${error.message}`);
          }
        }
      }
    }
    
    // Insert veredas
    console.log('🔄 Inserting veredas...');
    let veredasInserted = 0;
    
    for (const vereda of sampleVeredas) {
      const municipio = municipioMap.get(vereda.municipio_codigo);
      if (municipio) {
        try {
          await sequelize.query(`
            INSERT INTO veredas (nombre, id_municipio_municipios, created_at, updated_at)
            VALUES (:nombre, :id_municipio, NOW(), NOW())
          `, {
            replacements: {
              nombre: vereda.nombre,
              id_municipio: municipio.id_municipio
            }
          });
          veredasInserted++;
        } catch (error) {
          if (!error.message.includes('duplicate')) {
            console.warn(`⚠️  Warning inserting vereda: ${error.message}`);
          }
        }
      }
    }
    
    // Verify results
    const [sectorCount] = await sequelize.query(`SELECT COUNT(*) as count FROM sectores`);
    const [veredaCount] = await sequelize.query(`SELECT COUNT(*) as count FROM veredas`);
    
    console.log(`✅ Geographic data seeding completed!`);
    console.log(`📊 Results:`);
    console.log(`   - New sectores inserted: ${sectoresInserted}`);
    console.log(`   - Total sectores: ${sectorCount[0].count}`);
    console.log(`   - New veredas inserted: ${veredasInserted}`);
    console.log(`   - Total veredas: ${veredaCount[0].count}`);
    
    // Show sample data
    const [sectorSample] = await sequelize.query(`
      SELECT s.nombre, m.nombre_municipio, d.nombre as departamento
      FROM sectores s
      JOIN municipios m ON s.id_municipio = m.id_municipio
      JOIN departamentos d ON m.id_departamento = d.id_departamento
      ORDER BY s.id_sector
      LIMIT 5
    `);
    
    const [veredaSample] = await sequelize.query(`
      SELECT v.nombre, m.nombre_municipio, d.nombre as departamento
      FROM veredas v
      JOIN municipios m ON v.id_municipio_municipios = m.id_municipio
      JOIN departamentos d ON m.id_departamento = d.id_departamento
      ORDER BY v.id_vereda
      LIMIT 5
    `);
    
    console.log('\n📋 Sample sectores created:');
    sectorSample.forEach(sector => {
      console.log(`   - ${sector.nombre} (${sector.nombre_municipio}, ${sector.departamento})`);
    });
    
    console.log('\n📋 Sample veredas created:');
    veredaSample.forEach(vereda => {
      console.log(`   - ${vereda.nombre} (${vereda.nombre_municipio}, ${vereda.departamento})`);
    });
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error seeding geographic data:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

seedGeographicData();
