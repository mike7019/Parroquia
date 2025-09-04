import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

async function crearDatosCorrectos() {
  try {
    await sequelize.authenticate();
    console.log('🔧 Creando datos con estructura real...');
    
    // Obtener primer municipio disponible
    const [municipio] = await sequelize.query('SELECT id_municipio FROM municipios LIMIT 1', { type: QueryTypes.SELECT });
    console.log('📍 Usando municipio ID:', municipio.id_municipio);
    
    // Crear sector con estructura real
    try {
      const [sector] = await sequelize.query(`
        INSERT INTO sectores (nombre, id_municipio, created_at, updated_at) 
        VALUES ('Centro', ${municipio.id_municipio}, NOW(), NOW()) 
        RETURNING id_sector
      `, { type: QueryTypes.SELECT });
      console.log('✅ Sector creado con ID:', sector.id_sector);
    } catch (error) {
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        console.log('ℹ️ Sector ya existe');
      } else {
        console.error('❌ Error creando sector:', error.message);
      }
    }
    
    // Crear vereda con estructura real (apunta a municipio, no sector)
    try {
      const [vereda] = await sequelize.query(`
        INSERT INTO veredas (nombre, codigo_vereda, id_municipio_municipios, created_at, updated_at) 
        VALUES ('Vereda Central', 'VC001', ${municipio.id_municipio}, NOW(), NOW()) 
        RETURNING id_vereda
      `, { type: QueryTypes.SELECT });
      console.log('✅ Vereda creada con ID:', vereda.id_vereda);
    } catch (error) {
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        console.log('ℹ️ Vereda ya existe');
      } else {
        console.error('❌ Error creando vereda:', error.message);
      }
    }
    
    // Verificación final
    console.log('\n🔍 Verificación final...');
    const [sectorCheck] = await sequelize.query('SELECT id_sector FROM sectores WHERE id_sector = 1', { type: QueryTypes.SELECT });
    const [veredaCheck] = await sequelize.query('SELECT id_vereda FROM veredas WHERE id_vereda = 1', { type: QueryTypes.SELECT });
    const [municipioCheck] = await sequelize.query('SELECT id_municipio FROM municipios WHERE id_municipio = 1', { type: QueryTypes.SELECT });
    
    console.log('Municipio ID 1:', municipioCheck ? '✅ Disponible' : '❌ No disponible');
    console.log('Sector ID 1:', sectorCheck ? '✅ Disponible' : '❌ No disponible');
    console.log('Vereda ID 1:', veredaCheck ? '✅ Disponible' : '❌ No disponible');
    
    if (municipioCheck && sectorCheck && veredaCheck) {
      console.log('\n🎉 ¡Todos los foreign keys están listos para las encuestas!');
      console.log('📝 Usar en encuestas:');
      console.log('   - id_municipio: 1');
      console.log('   - id_sector: 1');
      console.log('   - id_vereda: 1');
    } else {
      console.log('\n⚠️ Aún faltan algunos foreign keys');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

crearDatosCorrectos();
