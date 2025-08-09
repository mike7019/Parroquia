const enfermedadesData = [
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

async function insertEnfermedades() {
  try {
    console.log('Conectando a la base de datos...');
    
    // Importar Sequelize dinámicamente
    const sequelizeModule = await import('../config/sequelize.js');
    const sequelize = sequelizeModule.default;
    
    console.log('Insertando enfermedades...');
    
    // Usar Sequelize para insertar datos
    const queryInterface = sequelize.getQueryInterface();
    
    await queryInterface.bulkInsert('enfermedades', enfermedadesData.map(enfermedad => ({
      ...enfermedad,
      createdAt: new Date(),
      updatedAt: new Date()
    })));
    
    console.log('✅ Enfermedades insertadas exitosamente');
    
    // Verificar la inserción
    const [results] = await sequelize.query('SELECT COUNT(*) FROM enfermedades');
    console.log(`Total de enfermedades en la base de datos: ${results[0].count}`);
    
    await sequelize.close();
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.original) {
      console.error('Error original:', error.original.message);
    }
  }
}

insertEnfermedades();
