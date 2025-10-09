import { QueryTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

async function seedEnfermedades() {
  try {
    console.log('🏥 SEEDER DE ENFERMEDADES\n');
    console.log('='.repeat(80));

    // Verificar si ya hay enfermedades
    const [count] = await sequelize.query(`
      SELECT COUNT(*) as total FROM enfermedades
    `, { type: QueryTypes.SELECT });

    if (count.total > 0) {
      console.log(`⚠️  Ya existen ${count.total} enfermedades en la base de datos`);
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const respuesta = await new Promise(resolve => {
        rl.question('¿Deseas eliminarlas y crear nuevas? (s/n): ', resolve);
      });
      rl.close();

      if (respuesta.toLowerCase() !== 's') {
        console.log('❌ Operación cancelada');
        await sequelize.close();
        return;
      }

      console.log('🗑️  Eliminando enfermedades existentes...');
      await sequelize.query('DELETE FROM enfermedades', { type: QueryTypes.DELETE });
      console.log('✅ Enfermedades eliminadas');
    }

    // Lista completa de enfermedades comunes
    const enfermedades = [
      // Enfermedades crónicas
      { nombre: 'Diabetes Mellitus', descripcion: 'Enfermedad crónica que afecta la forma en que el cuerpo procesa el azúcar en la sangre' },
      { nombre: 'Hipertensión Arterial', descripcion: 'Presión arterial elevada de forma crónica' },
      { nombre: 'Asma', descripcion: 'Enfermedad respiratoria crónica que inflama y estrecha las vías respiratorias' },
      { nombre: 'Artritis', descripcion: 'Inflamación de las articulaciones que causa dolor y rigidez' },
      { nombre: 'Osteoporosis', descripcion: 'Debilitamiento de los huesos que los hace frágiles y propensos a fracturas' },
      { nombre: 'Enfermedad Pulmonar Obstructiva Crónica (EPOC)', descripcion: 'Enfermedad pulmonar crónica que dificulta la respiración' },
      { nombre: 'Insuficiencia Renal Crónica', descripcion: 'Pérdida gradual y permanente de la función renal' },
      { nombre: 'Insuficiencia Cardíaca', descripcion: 'Condición en la que el corazón no bombea sangre suficiente' },
      { nombre: 'Cirrosis Hepática', descripcion: 'Cicatrización crónica del hígado' },
      { nombre: 'Enfermedad de Parkinson', descripcion: 'Trastorno neurológico progresivo que afecta el movimiento' },
      { nombre: 'Enfermedad de Alzheimer', descripcion: 'Enfermedad neurodegenerativa que causa demencia progresiva' },
      { nombre: 'Epilepsia', descripcion: 'Trastorno neurológico que causa convulsiones recurrentes' },
      { nombre: 'Fibromialgia', descripcion: 'Trastorno que causa dolor musculoesquelético generalizado y fatiga' },
      
      // Enfermedades cardiovasculares
      { nombre: 'Cardiopatía Isquémica', categoria: 'Cardiovascular' },
      { nombre: 'Arritmia Cardíaca', categoria: 'Cardiovascular' },
      { nombre: 'Angina de Pecho', categoria: 'Cardiovascular' },
      { nombre: 'Infarto Agudo de Miocardio', categoria: 'Cardiovascular' },
      { nombre: 'Accidente Cerebrovascular (ACV)', categoria: 'Cardiovascular' },
      { nombre: 'Trombosis', categoria: 'Cardiovascular' },
      { nombre: 'Várices', categoria: 'Cardiovascular' },
      
      // Enfermedades metabólicas
      { nombre: 'Diabetes Tipo 1', categoria: 'Metabólica' },
      { nombre: 'Diabetes Tipo 2', categoria: 'Metabólica' },
      { nombre: 'Hipertiroidismo', categoria: 'Metabólica' },
      { nombre: 'Hipotiroidismo', categoria: 'Metabólica' },
      { nombre: 'Obesidad', categoria: 'Metabólica' },
      { nombre: 'Colesterol Alto', categoria: 'Metabólica' },
      { nombre: 'Triglicéridos Altos', categoria: 'Metabólica' },
      { nombre: 'Gota', categoria: 'Metabólica' },
      
      // Enfermedades respiratorias
      { nombre: 'Bronquitis Crónica', categoria: 'Respiratoria' },
      { nombre: 'Enfisema Pulmonar', categoria: 'Respiratoria' },
      { nombre: 'Neumonía', categoria: 'Respiratoria' },
      { nombre: 'Tuberculosis', categoria: 'Respiratoria' },
      { nombre: 'Rinitis Alérgica', categoria: 'Respiratoria' },
      { nombre: 'Sinusitis Crónica', categoria: 'Respiratoria' },
      
      // Enfermedades digestivas
      { nombre: 'Gastritis', categoria: 'Digestiva' },
      { nombre: 'Úlcera Péptica', categoria: 'Digestiva' },
      { nombre: 'Reflujo Gastroesofágico', categoria: 'Digestiva' },
      { nombre: 'Colitis', categoria: 'Digestiva' },
      { nombre: 'Enfermedad de Crohn', categoria: 'Digestiva' },
      { nombre: 'Síndrome de Intestino Irritable', categoria: 'Digestiva' },
      { nombre: 'Hepatitis B', categoria: 'Digestiva' },
      { nombre: 'Hepatitis C', categoria: 'Digestiva' },
      { nombre: 'Cálculos Biliares', categoria: 'Digestiva' },
      
      // Enfermedades renales y urinarias
      { nombre: 'Cálculos Renales', categoria: 'Renal' },
      { nombre: 'Infección Urinaria Recurrente', categoria: 'Renal' },
      { nombre: 'Prostatitis', categoria: 'Renal' },
      { nombre: 'Hiperplasia Prostática Benigna', categoria: 'Renal' },
      
      // Enfermedades autoinmunes
      { nombre: 'Lupus Eritematoso Sistémico', categoria: 'Autoinmune' },
      { nombre: 'Artritis Reumatoide', categoria: 'Autoinmune' },
      { nombre: 'Esclerosis Múltiple', categoria: 'Autoinmune' },
      { nombre: 'Psoriasis', categoria: 'Autoinmune' },
      { nombre: 'Enfermedad Celíaca', categoria: 'Autoinmune' },
      
      // Enfermedades mentales
      { nombre: 'Depresión', categoria: 'Mental' },
      { nombre: 'Ansiedad', categoria: 'Mental' },
      { nombre: 'Trastorno Bipolar', categoria: 'Mental' },
      { nombre: 'Esquizofrenia', categoria: 'Mental' },
      { nombre: 'Trastorno Obsesivo Compulsivo (TOC)', categoria: 'Mental' },
      { nombre: 'Trastorno de Estrés Postraumático', categoria: 'Mental' },
      
      // Enfermedades oncológicas
      { nombre: 'Cáncer de Mama', categoria: 'Oncológica' },
      { nombre: 'Cáncer de Próstata', categoria: 'Oncológica' },
      { nombre: 'Cáncer de Pulmón', categoria: 'Oncológica' },
      { nombre: 'Cáncer de Colon', categoria: 'Oncológica' },
      { nombre: 'Cáncer de Estómago', categoria: 'Oncológica' },
      { nombre: 'Leucemia', categoria: 'Oncológica' },
      { nombre: 'Linfoma', categoria: 'Oncológica' },
      
      // Enfermedades dermatológicas
      { nombre: 'Dermatitis', categoria: 'Dermatológica' },
      { nombre: 'Eczema', categoria: 'Dermatológica' },
      { nombre: 'Acné', categoria: 'Dermatológica' },
      { nombre: 'Vitiligo', categoria: 'Dermatológica' },
      
      // Enfermedades oftalmológicas
      { nombre: 'Cataratas', categoria: 'Oftalmológica' },
      { nombre: 'Glaucoma', categoria: 'Oftalmológica' },
      { nombre: 'Degeneración Macular', categoria: 'Oftalmológica' },
      { nombre: 'Retinopatía Diabética', categoria: 'Oftalmológica' },
      
      // Enfermedades otorrinolaringológicas
      { nombre: 'Sordera', categoria: 'Otorrinolaringológica' },
      { nombre: 'Vértigo', categoria: 'Otorrinolaringológica' },
      { nombre: 'Tinnitus', categoria: 'Otorrinolaringológica' },
      
      // Otras enfermedades comunes
      { nombre: 'Anemia', categoria: 'Hematológica' },
      { nombre: 'Hemofilia', categoria: 'Hematológica' },
      { nombre: 'Migraña', categoria: 'Neurológica' },
      { nombre: 'Cefalea Tensional', categoria: 'Neurológica' },
      { nombre: 'Hernia Discal', categoria: 'Musculoesquelética' },
      { nombre: 'Escoliosis', categoria: 'Musculoesquelética' },
      { nombre: 'Tendinitis', categoria: 'Musculoesquelética' },
      { nombre: 'Síndrome del Túnel Carpiano', categoria: 'Musculoesquelética' },
      { nombre: 'Enfermedad de Chagas', categoria: 'Infecciosa' },
      { nombre: 'VIH/SIDA', categoria: 'Infecciosa' },
      { nombre: 'Dengue', categoria: 'Infecciosa' },
      { nombre: 'Leishmaniasis', categoria: 'Infecciosa' },
    ];

    console.log(`\n📝 Insertando ${enfermedades.length} enfermedades...`);

    // Insertar enfermedades una por una
    let insertadas = 0;
    for (const enfermedad of enfermedades) {
      try {
        await sequelize.query(`
          INSERT INTO enfermedades (nombre, categoria, createdAt, updatedAt)
          VALUES (:nombre, :categoria, NOW(), NOW())
        `, {
          replacements: {
            nombre: enfermedad.nombre,
            categoria: enfermedad.categoria
          },
          type: QueryTypes.INSERT
        });
        insertadas++;
        
        // Mostrar progreso cada 10 enfermedades
        if (insertadas % 10 === 0) {
          console.log(`   ✅ ${insertadas}/${enfermedades.length} enfermedades insertadas`);
        }
      } catch (error) {
        console.log(`   ⚠️  Error insertando "${enfermedad.nombre}": ${error.message}`);
      }
    }

    console.log(`\n✅ Total insertadas: ${insertadas}/${enfermedades.length} enfermedades`);

    // Mostrar resumen por categoría
    console.log('\n📊 RESUMEN POR CATEGORÍA:');
    const categorias = await sequelize.query(`
      SELECT 
        categoria,
        COUNT(*) as total
      FROM enfermedades
      GROUP BY categoria
      ORDER BY total DESC
    `, { type: QueryTypes.SELECT });

    categorias.forEach(cat => {
      console.log(`   ${cat.categoria}: ${cat.total} enfermedades`);
    });

    // Mostrar algunas enfermedades de ejemplo
    console.log('\n📋 EJEMPLOS DE ENFERMEDADES REGISTRADAS:');
    const ejemplos = await sequelize.query(`
      SELECT id_enfermedad, nombre, categoria
      FROM enfermedades
      ORDER BY id_enfermedad
      LIMIT 10
    `, { type: QueryTypes.SELECT });

    ejemplos.forEach((e, i) => {
      console.log(`   ${i + 1}. [ID: ${e.id_enfermedad}] ${e.nombre} (${e.categoria})`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ Seeder de enfermedades completado exitosamente\n');

  } catch (error) {
    console.error('❌ Error en seeder:', error);
  } finally {
    await sequelize.close();
  }
}

seedEnfermedades();
