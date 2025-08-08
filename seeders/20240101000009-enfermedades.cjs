'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si ya existen registros en la tabla enfermedades
    const [results] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM enfermedades"
    );

    // Solo insertar si no hay registros existentes
    if (results[0].count === 0) {
      await queryInterface.bulkInsert('enfermedades', [
        {
          nombre: 'Diabetes tipo 1',
          descripcion: 'Enfermedad autoinmune en la cual el páncreas no produce insulina o produce muy poca cantidad.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Diabetes tipo 2',
          descripcion: 'Trastorno metabólico caracterizado por altos niveles de glucosa en sangre debido a resistencia a la insulina.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Hipertensión arterial',
          descripcion: 'Presión arterial elevada de forma sostenida por encima de los valores normales.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Asma bronquial',
          descripcion: 'Enfermedad inflamatoria crónica de las vías respiratorias que causa dificultad para respirar.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Artritis reumatoide',
          descripcion: 'Enfermedad autoinmune que causa inflamación crónica de las articulaciones.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Enfermedad cardiovascular',
          descripcion: 'Grupo de trastornos que afectan el corazón y los vasos sanguíneos.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Epilepsia',
          descripcion: 'Trastorno neurológico caracterizado por episodios recurrentes de convulsiones.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Depresión mayor',
          descripcion: 'Trastorno del estado de ánimo caracterizado por sentimientos persistentes de tristeza y pérdida de interés.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Ansiedad generalizada',
          descripcion: 'Trastorno de ansiedad caracterizado por preocupación excesiva y persistente.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Osteoporosis',
          descripcion: 'Enfermedad en la que los huesos se vuelven frágiles y más propensos a fracturas.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Insuficiencia renal crónica',
          descripcion: 'Pérdida gradual y permanente de la función renal a lo largo del tiempo.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Enfermedad pulmonar obstructiva crónica (EPOC)',
          descripcion: 'Grupo de enfermedades pulmonares que obstruyen el flujo de aire y dificultan la respiración.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Hipotiroidismo',
          descripcion: 'Condición en la que la glándula tiroides no produce suficientes hormonas tiroideas.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Hipertiroidismo',
          descripcion: 'Condición en la que la glándula tiroides produce demasiadas hormonas tiroideas.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Cáncer de mama',
          descripcion: 'Tipo de cáncer que se forma en los tejidos de la mama.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Cáncer de próstata',
          descripcion: 'Tipo de cáncer que se desarrolla en la glándula prostática.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Migraña',
          descripcion: 'Tipo de dolor de cabeza recurrente que puede ser severo y debilitante.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Fibromialgia',
          descripcion: 'Trastorno caracterizado por dolor musculoesquelético generalizado.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Enfermedad de Alzheimer',
          descripcion: 'Trastorno neurodegenerativo que causa problemas de memoria, pensamiento y comportamiento.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Enfermedad de Parkinson',
          descripcion: 'Trastorno neurodegenerativo que afecta principalmente el movimiento.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Síndrome del intestino irritable',
          descripcion: 'Trastorno gastrointestinal funcional que causa dolor abdominal y cambios en los hábitos intestinales.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Gastritis crónica',
          descripcion: 'Inflamación prolongada del revestimiento del estómago.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Úlcera péptica',
          descripcion: 'Llaga que se desarrolla en el revestimiento del estómago o duodeno.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Hepatitis B',
          descripcion: 'Infección viral que ataca el hígado y puede causar enfermedad aguda y crónica.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Hepatitis C',
          descripcion: 'Infección viral que causa inflamación del hígado y puede llevar a daño hepático grave.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'VIH/SIDA',
          descripcion: 'Virus de inmunodeficiencia humana que ataca el sistema inmunitario.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Tuberculosis',
          descripcion: 'Infección bacteriana que afecta principalmente los pulmones.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Lupus eritematoso sistémico',
          descripcion: 'Enfermedad autoinmune que puede afectar múltiples órganos y sistemas.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Esclerosis múltiple',
          descripcion: 'Enfermedad autoinmune que afecta el sistema nervioso central.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Insuficiencia cardíaca',
          descripcion: 'Condición en la que el corazón no puede bombear sangre de manera eficiente.',
          created_at: new Date(),
          updated_at: new Date()
        }
      ], {});

      console.log('✅ Seeder de enfermedades ejecutado correctamente - 30 enfermedades insertadas');
    } else {
      console.log('ℹ️  Seeder de enfermedades omitido - La tabla ya contiene datos');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('enfermedades', null, {});
    console.log('🗑️  Seeder de enfermedades revertido - Todos los registros eliminados');
  }
};
