import 'dotenv/config';
import sequelize from './config/sequelize.js';

console.log('🔍 Adding test data to difuntos_familia...');

try {
  // First, let's check if we have some families to reference
  const [familias] = await sequelize.query('SELECT id_familia, apellido_familiar FROM familias LIMIT 5');
  
  if (familias.length === 0) {
    console.log('❌ No families found. Need to add some families first.');
    process.exit(1);
  }
  
  console.log('📋 Found families:', familias.map(f => `${f.id_familia}: ${f.apellido_familiar}`));
  
  // Add some test difuntos data
  const testDifuntos = [
    {
      nombre_completo: 'María García López (madre)',
      fecha_fallecimiento: '2020-03-15',
      observaciones: 'Madre de familia, muy querida por la comunidad',
      id_familia_familias: familias[0].id_familia
    },
    {
      nombre_completo: 'José Rodríguez Pérez (padre)',
      fecha_fallecimiento: '2019-07-20',
      observaciones: 'Padre trabajador, líder de la comunidad',
      id_familia_familias: familias[1]?.id_familia || familias[0].id_familia
    },
    {
      nombre_completo: 'Ana Martínez Ruiz',
      fecha_fallecimiento: '2021-12-05',
      observaciones: 'Abuela querida por todos',
      id_familia_familias: familias[2]?.id_familia || familias[0].id_familia
    },
    {
      nombre_completo: 'Carlos López Torres (padre)',
      fecha_fallecimiento: '2018-05-10',
      observaciones: 'Don Carlos, papá de la familia López',
      id_familia_familias: familias[3]?.id_familia || familias[0].id_familia
    },
    {
      nombre_completo: 'Esperanza Morales (doña Esperanza)',
      fecha_fallecimiento: '2022-01-30',
      observaciones: 'Madre y abuela, muy respetada',
      id_familia_familias: familias[4]?.id_familia || familias[0].id_familia
    }
  ];
  
  // Insert test data
  for (let i = 0; i < testDifuntos.length; i++) {
    const difunto = testDifuntos[i];
    const id_difunto = Date.now() + i; // Generate a unique ID
    await sequelize.query(`
      INSERT INTO difuntos_familia (id_difunto, nombre_completo, fecha_fallecimiento, observaciones, id_familia_familias, "createdAt", "updatedAt")
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `, {
      replacements: [id_difunto, difunto.nombre_completo, difunto.fecha_fallecimiento, difunto.observaciones, difunto.id_familia_familias]
    });
  }
  
  console.log(`✅ Added ${testDifuntos.length} test difuntos records`);
  
  // Verify the data
  const [count] = await sequelize.query('SELECT COUNT(*) as count FROM difuntos_familia');
  console.log(`📊 Total difuntos_familia records: ${count[0].count}`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await sequelize.close();
}
