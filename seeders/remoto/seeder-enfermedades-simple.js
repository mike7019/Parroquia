/**
 * Seeder simple de enfermedades sin categorías
 */

import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: '206.62.139.100',
  port: 5433,
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

async function seedEnfermedades() {
  try {
    console.log('🏥 SEEDER SIMPLE DE ENFERMEDADES');
    console.log('='.repeat(80));
    
    await sequelize.authenticate();
    console.log('✅ Conectado\n');

    // Insertar enfermedades
    console.log(`📝 Insertando ${enfermedades.length} enfermedades...\n`);
    
    for (const nombre of enfermedades) {
      await sequelize.query(`
        INSERT INTO enfermedades (nombre, "createdAt", "updatedAt")
        VALUES (:nombre, NOW(), NOW())
        ON CONFLICT (nombre) DO NOTHING;
      `, {
        replacements: { nombre }
      });
    }

    // Verificar
    const [result] = await sequelize.query('SELECT COUNT(*) as count FROM enfermedades;');
    const total = parseInt(result[0].count);

    console.log('='.repeat(80));
    console.log(`✅ Total de enfermedades en BD: ${total}`);
    console.log('='.repeat(80));

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.original) {
      console.error('Detalles:', error.original.message);
    }
    process.exit(1);
  }
}

seedEnfermedades();
