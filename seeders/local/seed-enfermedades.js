/**
 * Seeder de enfermedades para BASE DE DATOS LOCAL
 */

import { Sequelize } from 'sequelize';

// CONFIGURACIÓN PARA BASE DE DATOS LOCAL
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',      // BASE DE DATOS LOCAL
  port: 5432,             // PUERTO LOCAL
  database: 'parroquia_db',
  username: 'parroquia_user',
  password: 'ParroquiaSecure2025',
  logging: false
});

const enfermedades = [
  'Diabetes tipo 1',
  'Diabetes tipo 2',
  'Hipertensión Arterial',
  'Asma',
  'Obesidad',
  'Artritis',
  'Osteoporosis',
  'EPOC',
  'Insuficiencia Renal',
  'Insuficiencia Cardíaca',
  'Cirrosis',
  'Parkinson',
  'Alzheimer',
  'Epilepsia',
  'Fibromialgia',
  'Cardiopatía',
  'Arritmia',
  'Angina de Pecho',
  'Infarto',
  'ACV',
  'Trombosis',
  'Várices',
  'Hipertiroidismo',
  'Hipotiroidismo',
  'Colesterol Alto',
  'Triglicéridos Altos',
  'Gota',
  'Bronquitis Crónica',
  'Enfisema',
  'Neumonía',
  'Tuberculosis',
  'Rinitis Alérgica',
  'Sinusitis',
  'Gastritis',
  'Úlcera Péptica',
  'Reflujo',
  'Colitis',
  'Crohn',
  'Colon Irritable',
  'Hepatitis B',
  'Hepatitis C',
  'Cálculos Biliares',
  'Cálculos Renales',
  'Infección Urinaria',
  'Prostatitis',
  'Hiperplasia Prostática',
  'Lupus',
  'Artritis Reumatoide',
  'Esclerosis Múltiple',
  'Psoriasis',
  'Celíacos',
  'Depresión',
  'Ansiedad',
  'Trastorno Bipolar',
  'Esquizofrenia',
  'TOC',
  'Estrés Postraumático',
  'Cáncer de Mama',
  'Cáncer de Próstata',
  'Cáncer de Pulmón',
  'Cáncer de Colon',
  'Cáncer de Estómago',
  'Leucemia',
  'Linfoma',
  'Dermatitis',
  'Eczema',
  'Acné',
  'Vitiligo',
  'Cataratas',
  'Glaucoma',
  'Degeneración Macular',
  'Retinopatía Diabética',
  'Sordera',
  'Vértigo',
  'Tinnitus',
  'Anemia',
  'Hemofilia',
  'Migraña',
  'Cefalea',
  'Hernia Discal',
  'Escoliosis',
  'Tendinitis',
  'Túnel Carpiano',
  'Chagas',
  'VIH/SIDA',
  'Dengue',
  'Leishmaniasis',
  'COVID-19',
  'Ninguna'
];

async function seedEnfermedadesLocal() {
  try {
    console.log('🏥 SEEDER DE ENFERMEDADES - BASE DE DATOS LOCAL');
    console.log('='.repeat(80));
    console.log('🖥️  Servidor: localhost:5432');
    console.log('📦 Base de datos: parroquia_db');
    console.log('='.repeat(80));
    console.log('\n');
    
    await sequelize.authenticate();
    console.log('✅ Conectado a base de datos LOCAL\n');

    // Limpiar tabla primero
    console.log('🗑️  Limpiando tabla enfermedades...');
    await sequelize.query('DELETE FROM persona_enfermedad;'); // Limpiar relaciones primero
    await sequelize.query('DELETE FROM enfermedades;');
    await sequelize.query('ALTER SEQUENCE enfermedades_id_enfermedad_seq RESTART WITH 1;');
    console.log('✅ Tabla limpiada y secuencia reseteada\n');

    // Insertar enfermedades
    console.log(`📝 Insertando ${enfermedades.length} enfermedades...\n`);
    
    let insertadas = 0;
    for (let i = 0; i < enfermedades.length; i++) {
      await sequelize.query(`
        INSERT INTO enfermedades (nombre, "createdAt", "updatedAt")
        VALUES (:nombre, NOW(), NOW());
      `, {
        replacements: { nombre: enfermedades[i] }
      });
      insertadas++;
      
      if ((i + 1) % 20 === 0) {
        console.log(`   ✓ ${i + 1} enfermedades insertadas...`);
      }
    }
    console.log(`   ✓ ${insertadas} enfermedades insertadas\n`);

    // Verificar
    console.log('='.repeat(80));
    console.log('📊 VERIFICACIÓN FINAL:\n');
    
    const [result] = await sequelize.query(`
      SELECT MIN(id_enfermedad) as min_id, MAX(id_enfermedad) as max_id, COUNT(*) as total 
      FROM enfermedades;
    `);
    
    console.log(`✅ ENFERMEDADES:`);
    console.log(`   - Total registros: ${result[0].total}`);
    console.log(`   - ID mínimo: ${result[0].min_id}`);
    console.log(`   - ID máximo: ${result[0].max_id}\n`);

    // Mostrar primeras 10 enfermedades
    const [primeras] = await sequelize.query(`
      SELECT id_enfermedad, nombre 
      FROM enfermedades 
      ORDER BY id_enfermedad 
      LIMIT 10;
    `);
    
    console.log('   Primeras 10 enfermedades:');
    primeras.forEach(e => {
      console.log(`   ${e.id_enfermedad}. ${e.nombre}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('🎉 ¡SEEDER COMPLETADO EXITOSAMENTE!');
    console.log(`✅ ${insertadas} enfermedades con IDs 1-${insertadas}\n`);

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.original) {
      console.error('Detalles:', error.original.message);
    }
    console.error('\n💡 Verifica que:');
    console.error('   - PostgreSQL esté corriendo en localhost:5432');
    console.error('   - La tabla enfermedades exista');
    console.error('   - Las credenciales sean correctas\n');
    process.exit(1);
  }
}

seedEnfermedadesLocal();
