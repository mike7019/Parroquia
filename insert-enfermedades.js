import sequelize from './config/sequelize.js';

/**
 * Script para insertar las enfermedades directamente usando el modelo Sequelize
 */

async function insertEnfermedades() {
  try {
    console.log('🔗 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // Obtener el modelo Enfermedad
    const EnfermedadModel = sequelize.models.Enfermedad;
    
    console.log('\n🌱 Insertando enfermedades...');

    const enfermedades = [
      { nombre: 'Diabetes tipo 1', descripcion: 'Enfermedad autoinmune en la cual el páncreas no produce insulina o produce muy poca cantidad.' },
      { nombre: 'Diabetes tipo 2', descripcion: 'Trastorno metabólico caracterizado por altos niveles de glucosa en sangre debido a resistencia a la insulina.' },
      { nombre: 'Hipertensión arterial', descripcion: 'Presión arterial elevada de forma sostenida por encima de los valores normales.' },
      { nombre: 'Asma bronquial', descripcion: 'Enfermedad inflamatoria crónica de las vías respiratorias que causa dificultad para respirar.' },
      { nombre: 'Artritis reumatoide', descripcion: 'Enfermedad autoinmune que causa inflamación crónica de las articulaciones.' },
      { nombre: 'Enfermedad cardiovascular', descripcion: 'Grupo de trastornos que afectan el corazón y los vasos sanguíneos.' },
      { nombre: 'Epilepsia', descripcion: 'Trastorno neurológico caracterizado por episodios recurrentes de convulsiones.' },
      { nombre: 'Depresión mayor', descripcion: 'Trastorno del estado de ánimo caracterizado por sentimientos persistentes de tristeza y pérdida de interés.' },
      { nombre: 'Ansiedad generalizada', descripcion: 'Trastorno de ansiedad caracterizado por preocupación excesiva y persistente.' },
      { nombre: 'Osteoporosis', descripcion: 'Enfermedad en la que los huesos se vuelven frágiles y más propensos a fracturas.' },
      { nombre: 'Insuficiencia renal crónica', descripcion: 'Pérdida gradual y permanente de la función renal a lo largo del tiempo.' },
      { nombre: 'Enfermedad pulmonar obstructiva crónica (EPOC)', descripcion: 'Grupo de enfermedades pulmonares que obstruyen el flujo de aire y dificultan la respiración.' },
      { nombre: 'Hipotiroidismo', descripcion: 'Condición en la que la glándula tiroides no produce suficientes hormonas tiroideas.' },
      { nombre: 'Hipertiroidismo', descripcion: 'Condición en la que la glándula tiroides produce demasiadas hormonas tiroideas.' },
      { nombre: 'Cáncer de mama', descripcion: 'Tipo de cáncer que se forma en los tejidos de la mama.' },
      { nombre: 'Cáncer de próstata', descripcion: 'Tipo de cáncer que se desarrolla en la glándula prostática.' },
      { nombre: 'Migraña', descripcion: 'Tipo de dolor de cabeza recurrente que puede ser severo y debilitante.' },
      { nombre: 'Fibromialgia', descripcion: 'Trastorno caracterizado por dolor musculoesquelético generalizado.' },
      { nombre: 'Enfermedad de Alzheimer', descripcion: 'Trastorno neurodegenerativo que causa problemas de memoria, pensamiento y comportamiento.' },
      { nombre: 'Enfermedad de Parkinson', descripcion: 'Trastorno neurodegenerativo que afecta principalmente el movimiento.' },
      { nombre: 'Síndrome del intestino irritable', descripcion: 'Trastorno gastrointestinal funcional que causa dolor abdominal y cambios en los hábitos intestinales.' },
      { nombre: 'Gastritis crónica', descripcion: 'Inflamación prolongada del revestimiento del estómago.' },
      { nombre: 'Úlcera péptica', descripcion: 'Llaga que se desarrolla en el revestimiento del estómago o duodeno.' },
      { nombre: 'Hepatitis B', descripcion: 'Infección viral que ataca el hígado y puede causar enfermedad aguda y crónica.' },
      { nombre: 'Hepatitis C', descripcion: 'Infección viral que causa inflamación del hígado y puede llevar a daño hepático grave.' },
      { nombre: 'VIH/SIDA', descripcion: 'Virus de inmunodeficiencia humana que ataca el sistema inmunitario.' },
      { nombre: 'Tuberculosis', descripcion: 'Infección bacteriana que afecta principalmente los pulmones.' },
      { nombre: 'Lupus eritematoso sistémico', descripcion: 'Enfermedad autoinmune que puede afectar múltiples órganos y sistemas.' },
      { nombre: 'Esclerosis múltiple', descripcion: 'Enfermedad autoinmune que afecta el sistema nervioso central.' },
      { nombre: 'Insuficiencia cardíaca', descripcion: 'Condición en la que el corazón no puede bombear sangre de manera eficiente.' }
    ];

    // Verificar si ya hay datos
    const count = await EnfermedadModel.count();
    
    if (count > 0) {
      console.log(`ℹ️  Ya existen ${count} enfermedades en la base de datos`);
      console.log('   Para reinstalar, ejecuta: DELETE FROM enfermedades;');
      return;
    }

    // Insertar usando bulkCreate
    const insertedEnfermedades = await EnfermedadModel.bulkCreate(enfermedades);
    
    console.log(`✅ ${insertedEnfermedades.length} enfermedades insertadas exitosamente`);
    
    // Mostrar algunas enfermedades insertadas
    console.log('\n📋 Ejemplos de enfermedades insertadas:');
    insertedEnfermedades.slice(0, 5).forEach((enfermedad, index) => {
      console.log(`  ${index + 1}. ${enfermedad.nombre}`);
      console.log(`     📝 ${enfermedad.descripcion.substring(0, 80)}...`);
    });

    console.log(`\n📊 Total de enfermedades en el catálogo: ${insertedEnfermedades.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.log('\n💡 Algunas enfermedades ya existen en la base de datos');
    }
  } finally {
    try {
      await sequelize.close();
      console.log('\n🔌 Conexión cerrada');
    } catch (closeError) {
      console.warn('⚠️  Error cerrando conexión:', closeError.message);
    }
  }
}

// Ejecutar inserción
insertEnfermedades();
