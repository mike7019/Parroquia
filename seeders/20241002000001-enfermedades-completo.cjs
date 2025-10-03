'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🌱 Iniciando seeder completo de enfermedades...');
    
    try {
      // Primero limpiar datos existentes para evitar duplicados
      await queryInterface.bulkDelete('enfermedades', {}, {});
      console.log('✅ Datos existentes limpiados');

      // Insertar lista completa de enfermedades comunes en comunidades parroquiales
      const enfermedades = [
        // Enfermedades metabólicas y endocrinas
        {
          nombre: 'Diabetes tipo 1',
          descripcion: 'Enfermedad autoinmune en la cual el páncreas no produce insulina o produce muy poca cantidad.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Diabetes tipo 2',
          descripcion: 'Trastorno metabólico caracterizado por altos niveles de glucosa en sangre debido a resistencia a la insulina.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Hipotiroidismo',
          descripcion: 'Condición en la que la glándula tiroides no produce suficientes hormonas tiroideas.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Hipertiroidismo',
          descripcion: 'Condición en la que la glándula tiroides produce demasiadas hormonas tiroideas.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Obesidad',
          descripcion: 'Acumulación anormal o excesiva de grasa que puede ser perjudicial para la salud.',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // Enfermedades cardiovasculares
        {
          nombre: 'Hipertensión arterial',
          descripcion: 'Presión arterial elevada de forma sostenida por encima de los valores normales.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Enfermedad cardiovascular',
          descripcion: 'Grupo de trastornos que afectan el corazón y los vasos sanguíneos.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Insuficiencia cardíaca',
          descripcion: 'Condición en la que el corazón no puede bombear sangre de manera eficiente.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Arritmias cardíacas',
          descripcion: 'Alteración del ritmo normal del corazón.',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // Enfermedades respiratorias
        {
          nombre: 'Asma bronquial',
          descripcion: 'Enfermedad inflamatoria crónica de las vías respiratorias que causa dificultad para respirar.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Enfermedad pulmonar obstructiva crónica (EPOC)',
          descripcion: 'Grupo de enfermedades pulmonares que obstruyen el flujo de aire y dificultan la respiración.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Tuberculosis',
          descripcion: 'Infección bacteriana que afecta principalmente los pulmones.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Neumonía',
          descripcion: 'Infección que inflama los sacos de aire de uno o ambos pulmones.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Bronquitis crónica',
          descripcion: 'Inflamación prolongada de los bronquios que causa tos y dificultad respiratoria.',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // Enfermedades gastrointestinales
        {
          nombre: 'Gastritis crónica',
          descripcion: 'Inflamación prolongada del revestimiento del estómago.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Úlcera péptica',
          descripcion: 'Llaga que se desarrolla en el revestimiento del estómago o duodeno.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Síndrome del intestino irritable',
          descripcion: 'Trastorno gastrointestinal funcional que causa dolor abdominal y cambios en los hábitos intestinales.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Enfermedad de reflujo gastroesofágico',
          descripcion: 'Condición en la que el ácido del estómago regresa al esófago.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Colitis',
          descripcion: 'Inflamación del intestino grueso que causa dolor abdominal y diarrea.',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // Enfermedades musculoesqueléticas
        {
          nombre: 'Artritis reumatoide',
          descripcion: 'Enfermedad autoinmune que causa inflamación crónica de las articulaciones.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Osteoporosis',
          descripcion: 'Enfermedad en la que los huesos se vuelven frágiles y más propensos a fracturas.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Osteoartritis',
          descripcion: 'Degeneración del cartílago articular que causa dolor y rigidez en las articulaciones.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Fibromialgia',
          descripcion: 'Trastorno caracterizado por dolor musculoesquelético generalizado.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Lumbalgia crónica',
          descripcion: 'Dolor persistente en la parte baja de la espalda.',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // Enfermedades neurológicas
        {
          nombre: 'Epilepsia',
          descripcion: 'Trastorno neurológico caracterizado por episodios recurrentes de convulsiones.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Enfermedad de Alzheimer',
          descripcion: 'Trastorno neurodegenerativo que causa problemas de memoria, pensamiento y comportamiento.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Enfermedad de Parkinson',
          descripcion: 'Trastorno neurodegenerativo que afecta principalmente el movimiento.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Migraña',
          descripcion: 'Tipo de dolor de cabeza recurrente que puede ser severo y debilitante.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Esclerosis múltiple',
          descripcion: 'Enfermedad autoinmune que afecta el sistema nervioso central.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Accidente cerebrovascular (ACV)',
          descripcion: 'Interrupción del flujo sanguíneo al cerebro que causa daño neurológico.',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // Enfermedades mentales y psiquiátricas
        {
          nombre: 'Depresión mayor',
          descripcion: 'Trastorno del estado de ánimo caracterizado por sentimientos persistentes de tristeza y pérdida de interés.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Ansiedad generalizada',
          descripcion: 'Trastorno de ansiedad caracterizado por preocupación excesiva y persistente.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Trastorno bipolar',
          descripcion: 'Trastorno mental caracterizado por cambios extremos en el estado de ánimo.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Esquizofrenia',
          descripcion: 'Trastorno mental crónico que afecta el pensamiento, la percepción y el comportamiento.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Trastorno de estrés postraumático',
          descripcion: 'Condición mental que puede desarrollarse después de experimentar un evento traumático.',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // Enfermedades renales y urológicas
        {
          nombre: 'Insuficiencia renal crónica',
          descripcion: 'Pérdida gradual y permanente de la función renal a lo largo del tiempo.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Cálculos renales',
          descripcion: 'Formación de depósitos sólidos en los riñones que pueden causar dolor intenso.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Infección del tracto urinario',
          descripcion: 'Infección bacteriana que afecta cualquier parte del sistema urinario.',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // Enfermedades hepáticas
        {
          nombre: 'Hepatitis B',
          descripcion: 'Infección viral que ataca el hígado y puede causar enfermedad aguda y crónica.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Hepatitis C',
          descripcion: 'Infección viral que causa inflamación del hígado y puede llevar a daño hepático grave.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Cirrosis hepática',
          descripcion: 'Cicatrización avanzada del hígado causada por diversas enfermedades hepáticas.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Hígado graso',
          descripcion: 'Acumulación de grasa en las células del hígado.',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // Enfermedades infecciosas
        {
          nombre: 'VIH/SIDA',
          descripcion: 'Virus de inmunodeficiencia humana que ataca el sistema inmunitario.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Dengue',
          descripcion: 'Enfermedad viral transmitida por mosquitos que causa fiebre y dolores corporales.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Malaria',
          descripcion: 'Enfermedad transmitida por mosquitos que causa fiebre, escalofríos y síntomas similares a la gripe.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Chagas',
          descripcion: 'Enfermedad parasitaria transmitida por insectos que puede afectar el corazón y el sistema digestivo.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Leishmaniasis',
          descripcion: 'Enfermedad parasitaria transmitida por la picadura de flebótomos infectados.',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // Cánceres comunes
        {
          nombre: 'Cáncer de mama',
          descripcion: 'Tipo de cáncer que se forma en los tejidos de la mama.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Cáncer de próstata',
          descripcion: 'Tipo de cáncer que se desarrolla en la glándula prostática.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Cáncer de cuello uterino',
          descripcion: 'Tipo de cáncer que se desarrolla en el cuello del útero.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Cáncer de pulmón',
          descripcion: 'Tipo de cáncer que se forma en los tejidos del pulmón.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Cáncer colorrectal',
          descripcion: 'Cáncer que se desarrolla en el colon o el recto.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Cáncer de estómago',
          descripcion: 'Tipo de cáncer que se forma en los tejidos del estómago.',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // Enfermedades dermatológicas
        {
          nombre: 'Psoriasis',
          descripcion: 'Enfermedad autoinmune que causa parches escamosos y rojos en la piel.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Eczema',
          descripcion: 'Condición que hace que la piel se inflame, pique y se irrite.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Vitiligo',
          descripcion: 'Trastorno que causa la pérdida de pigmentación en parches de la piel.',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // Enfermedades oftalmológicas
        {
          nombre: 'Glaucoma',
          descripcion: 'Grupo de enfermedades oculares que pueden dañar el nervio óptico y causar pérdida de visión.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Cataratas',
          descripcion: 'Opacidad del cristalino del ojo que causa visión borrosa.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Retinopatía diabética',
          descripcion: 'Complicación de la diabetes que afecta los vasos sanguíneos de la retina.',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // Enfermedades autoinmunes adicionales
        {
          nombre: 'Lupus eritematoso sistémico',
          descripcion: 'Enfermedad autoinmune que puede afectar múltiples órganos y sistemas.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Enfermedad de Crohn',
          descripcion: 'Enfermedad inflamatoria intestinal que puede afectar cualquier parte del tracto digestivo.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Colitis ulcerosa',
          descripcion: 'Enfermedad inflamatoria intestinal que afecta el intestino grueso.',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // Enfermedades relacionadas con la edad
        {
          nombre: 'Demencia senil',
          descripcion: 'Deterioro de las funciones cognitivas asociado con el envejecimiento.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Artritis degenerativa',
          descripcion: 'Desgaste del cartílago articular relacionado con la edad.',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // Enfermedades nutricionales
        {
          nombre: 'Anemia',
          descripcion: 'Condición en la que el cuerpo no tiene suficientes glóbulos rojos sanos.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Desnutrición',
          descripcion: 'Estado que resulta de una ingesta insuficiente o desequilibrada de nutrientes.',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // Sin enfermedad
        {
          nombre: 'Ninguna',
          descripcion: 'La persona no presenta ninguna enfermedad conocida o diagnosticada.',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      await queryInterface.bulkInsert('enfermedades', enfermedades);
      
      console.log(`✅ Seeder completado: ${enfermedades.length} enfermedades insertadas`);
      console.log('📋 Enfermedades incluidas:');
      console.log('   - Enfermedades metabólicas y endocrinas');
      console.log('   - Enfermedades cardiovasculares');
      console.log('   - Enfermedades respiratorias');
      console.log('   - Enfermedades gastrointestinales');
      console.log('   - Enfermedades musculoesqueléticas');
      console.log('   - Enfermedades neurológicas');
      console.log('   - Enfermedades mentales y psiquiátricas');
      console.log('   - Enfermedades renales y urológicas');
      console.log('   - Enfermedades hepáticas');
      console.log('   - Enfermedades infecciosas');
      console.log('   - Cánceres comunes');
      console.log('   - Enfermedades dermatológicas');
      console.log('   - Enfermedades oftalmológicas');
      console.log('   - Enfermedades autoinmunes');
      console.log('   - Enfermedades relacionadas con la edad');
      console.log('   - Enfermedades nutricionales');
      console.log('   - Opción "Ninguna" para personas sanas');

    } catch (error) {
      console.error('❌ Error en seeder de enfermedades:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Revirtiendo seeder de enfermedades...');
    await queryInterface.bulkDelete('enfermedades', {}, {});
    console.log('✅ Datos de enfermedades eliminados');
  }
};