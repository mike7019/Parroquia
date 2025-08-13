import { Op } from 'sequelize';

export async function seedProfesiones(sequelize) {
  try {
    console.log('💼 Iniciando seeding de Profesiones...');
    
    const { Profesion } = sequelize.models;
    
    // Verificar si ya existen datos
    const profesionesExistentes = await Profesion.count();
    console.log(`📊 Profesiones existentes: ${profesionesExistentes}`);
    
    if (profesionesExistentes > 0) {
      console.log('📋 Las profesiones ya están cargadas. Actualizando si es necesario...');
    }

    // Datos de profesiones
    const profesionesData = [
      { nombre: 'Médico(a)', descripcion: 'Profesional de la salud especializado en el diagnóstico y tratamiento de enfermedades' },
      { nombre: 'Enfermero(a)', descripcion: 'Profesional de la salud que brinda cuidados directos a pacientes' },
      { nombre: 'Docente', descripcion: 'Profesional dedicado a la enseñanza y educación' },
      { nombre: 'Ingeniero(a)', descripcion: 'Profesional especializado en el diseño y construcción de sistemas técnicos' },
      { nombre: 'Abogado(a)', descripcion: 'Profesional del derecho que asesora y representa en asuntos legales' },
      { nombre: 'Contador(a)', descripcion: 'Profesional especializado en contabilidad y finanzas' },
      { nombre: 'Agricultor(a)', descripcion: 'Persona dedicada a la agricultura y cultivo de la tierra' },
      { nombre: 'Comerciante', descripcion: 'Persona dedicada a la compra y venta de productos' },
      { nombre: 'Conductor', descripcion: 'Persona que maneja vehículos de transporte' },
      { nombre: 'Electricista', descripcion: 'Técnico especializado en instalaciones eléctricas' },
      { nombre: 'Plomero', descripcion: 'Técnico especializado en instalaciones de agua y desagüe' },
      { nombre: 'Carpintero', descripcion: 'Artesano especializado en trabajos con madera' },
      { nombre: 'Albañil', descripcion: 'Trabajador especializado en construcción' },
      { nombre: 'Mecánico', descripcion: 'Técnico especializado en reparación de vehículos y maquinaria' },
      { nombre: 'Cocinero(a)', descripcion: 'Profesional especializado en preparación de alimentos' },
      { nombre: 'Costurero(a)', descripcion: 'Artesano especializado en confección de ropa' },
      { nombre: 'Peluquero(a)', descripcion: 'Profesional especializado en cuidado del cabello' },
      { nombre: 'Vendedor(a)', descripcion: 'Persona dedicada a la venta de productos o servicios' },
      { nombre: 'Secretario(a)', descripcion: 'Profesional de apoyo administrativo' },
      { nombre: 'Estudiante', descripcion: 'Persona dedicada al estudio y aprendizaje' },
      { nombre: 'Ama de casa', descripcion: 'Persona dedicada al cuidado del hogar y la familia' }
    ];

    console.log(`📝 Procesando ${profesionesData.length} profesiones...`);

    // Procesar cada profesión usando upsert
    let profesionesCreadas = 0;
    let profesionesActualizadas = 0;

    for (const profesionData of profesionesData) {
      const [profesion, created] = await Profesion.upsert(
        {
          ...profesionData,
          activo: true,
          updated_at: new Date()
        },
        {
          conflictFields: ['nombre'], // Campo único para evitar duplicados
          returning: true
        }
      );

      if (created) {
        profesionesCreadas++;
        console.log(`✅ Creada: ${profesionData.nombre}`);
      } else {
        profesionesActualizadas++;
        console.log(`🔄 Actualizada: ${profesionData.nombre}`);
      }
    }

    // Verificación final
    const profesionesFinales = await Profesion.count();
    const profesionesActivas = await Profesion.count({ where: { activo: true } });

    console.log(`\n📋 RESUMEN SEEDING PROFESIONES:`);
    console.log(`   • Total profesiones en BD: ${profesionesFinales}`);
    console.log(`   • Profesiones activas: ${profesionesActivas}`);
    console.log(`   • Profesiones creadas: ${profesionesCreadas}`);
    console.log(`   • Profesiones actualizadas: ${profesionesActualizadas}`);

    return {
      success: true,
      profesionesCreadas,
      profesionesActualizadas,
      totalProfesiones: profesionesFinales,
      profesionesActivas
    };

  } catch (error) {
    console.error('❌ Error en seeding de Profesiones:', error);
    throw error;
  }
}
