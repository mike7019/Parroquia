import sequelize from '../../config/sequelize.js';
import { QueryTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

/**
 * Seeder consolidado para tablas de configuración
 * Este archivo contiene todos los seeders para las tablas básicas de configuración
 * que se ejecutarán automáticamente durante la sincronización de la base de datos
 */

// Función auxiliar para verificar si una tabla existe y tiene datos
async function tableHasData(tableName) {
  try {
    const [results] = await sequelize.query(
      `SELECT COUNT(*) as count FROM ${tableName}`,
      { type: QueryTypes.SELECT }
    );
    return results.count > 0;
  } catch (error) {
    console.warn(`⚠️  Tabla ${tableName} no existe o no se puede consultar:`, error.message);
    return false;
  }
}

// Función auxiliar para insertar datos de forma segura
async function safeInsert(tableName, data, description) {
  try {
    const hasData = await tableHasData(tableName);
    
    if (!hasData) {
      // Intentar inserción simple primero
      try {
        await sequelize.getQueryInterface().bulkInsert(tableName, data);
        console.log(`✅ ${description}: ${data.length} registros insertados`);
        return true;
      } catch (insertError) {
        // Si falla la inserción simple, intentar con query directa
        console.warn(`⚠️  Inserción normal falló para ${tableName}, intentando query directa...`);
        
        // Crear query manual para evitar problemas con campos auto-incrementales
        const fields = Object.keys(data[0]).filter(key => !key.includes('id_')); // Excluir campos ID
        const fieldNames = fields.join(', ');
        const values = data.map(item => {
          const itemValues = fields.map(field => {
            const value = item[field];
            if (value instanceof Date) {
              return `'${value.toISOString()}'`;
            } else if (typeof value === 'string') {
              return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
            } else {
              return value;
            }
          });
          return `(${itemValues.join(', ')})`;
        }).join(', ');
        
        const query = `INSERT INTO ${tableName} (${fieldNames}) VALUES ${values}`;
        await sequelize.query(query);
        console.log(`✅ ${description}: ${data.length} registros insertados (query directa)`);
        return true;
      }
    } else {
      console.log(`ℹ️  ${description}: datos ya existen, saltando inserción`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error insertando ${description}:`, error.message);
    return false;
  }
}

// Seeder para tipos de identificación
export async function seedTiposIdentificacion() {
  const data = [
    {
      nombre: 'Cédula de Ciudadanía',
      codigo: 'CC',
      descripcion: 'Documento de identificación para ciudadanos colombianos mayores de edad',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Tarjeta de Identidad',
      codigo: 'TI',
      descripcion: 'Documento de identificación para menores de edad',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Cédula de Extranjería',
      codigo: 'CE',
      descripcion: 'Documento de identificación para extranjeros residentes',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Pasaporte',
      codigo: 'PA',
      descripcion: 'Documento de identificación internacional',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'NIT',
      codigo: 'NIT',
      descripcion: 'Número de Identificación Tributaria',
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  return await safeInsert('tipos_identificacion', data, 'Tipos de Identificación');
}

// Seeder para estados civiles
export async function seedEstadosCiviles() {
  const data = [
    {
      nombre: 'Soltero(a)',
      descripcion: 'Persona que no ha contraído matrimonio',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Casado(a)',
      descripcion: 'Persona que ha contraído matrimonio',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Divorciado(a)',
      descripcion: 'Persona que ha disuelto su matrimonio',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Viudo(a)',
      descripcion: 'Persona cuyo cónyuge ha fallecido',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Unión Libre',
      descripcion: 'Persona que vive en unión marital de hecho',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Separado(a)',
      descripcion: 'Persona que vive separada de su cónyuge',
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  return await safeInsert('estados_civiles', data, 'Estados Civiles');
}

// Seeder para tipos de vivienda
export async function seedTiposVivienda() {
  const data = [
    {
      nombre: 'Casa',
      descripcion: 'Vivienda unifamiliar independiente',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Apartamento',
      descripcion: 'Vivienda en edificio multifamiliar',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Finca',
      descripcion: 'Vivienda rural de construcción tradicional',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Rancho',
      descripcion: 'Vivienda en propiedad rural',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Cuarto',
      descripcion: 'Habitación en casa o edificio compartido',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Otro',
      descripcion: 'Otro tipo de vivienda no especificado',
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  return await safeInsert('tipos_vivienda', data, 'Tipos de Vivienda');
}

// Seeder para sistemas de acueducto
export async function seedSistemasAcueducto() {
  const data = [
    {
      nombre: 'Acueducto Municipal',
      descripcion: 'Sistema de acueducto municipal o público mediante red pública',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Pozo Propio',
      descripcion: 'Agua extraída de pozo profundo o artesiano privado',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Aljibe',
      descripcion: 'Depósito subterráneo para recoger y conservar agua de lluvia',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Fuente Natural',
      descripcion: 'Agua tomada directamente de río, quebrada o manantial',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Recolección de Lluvia',
      descripcion: 'Sistema de captación y almacenamiento de agua de lluvia',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Compra a Terceros',
      descripcion: 'Agua adquirida mediante carrotanques u otros proveedores',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Otro Sistema',
      descripcion: 'Otro tipo de sistema de abastecimiento de agua no especificado',
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  return await safeInsert('sistemas_acueducto', data, 'Sistemas de Acueducto');
}

// Seeder para tipos de aguas residuales
export async function seedTiposAguasResiduales() {
  const data = [
    {
      nombre: 'Alcantarillado Público',
      descripcion: 'Sistema de alcantarillado municipal',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Pozo Séptico',
      descripcion: 'Sistema de tratamiento individual',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Letrina',
      descripcion: 'Sistema básico de saneamiento',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Campo Abierto',
      descripcion: 'Sin sistema de tratamiento',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Otro',
      descripcion: 'Otro sistema no especificado',
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  return await safeInsert('tipos_aguas_residuales', data, 'Tipos de Aguas Residuales');
}

// Seeder para tipos de disposición de basura
export async function seedTiposDisposicionBasura() {
  const data = [
    {
      nombre: 'Recolección Pública',
      descripcion: 'Servicio de recolección municipal',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Quema',
      descripcion: 'Incineración de residuos',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Entierro',
      descripcion: 'Enterramiento de residuos',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Reciclaje',
      descripcion: 'Separación y reciclaje de materiales',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Compostaje',
      descripcion: 'Compostaje de residuos orgánicos',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Botadero',
      descripcion: 'Disposición en botadero',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Otro',
      descripcion: 'Otro método no especificado',
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  return await safeInsert('tipos_disposicion_basura', data, 'Tipos de Disposición de Basura');
}

// Seeder para sexos
export async function seedSexos() {
  const data = [
    {
      nombre: 'Masculino',
      codigo: 'M',
      descripcion: 'Sexo masculino',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Femenino',
      codigo: 'F',
      descripcion: 'Sexo femenino',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Otro',
      codigo: 'O',
      descripcion: 'Otro sexo o no especificado',
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  return await safeInsert('sexos', data, 'Sexos');
}

// Seeder para roles
export async function seedRoles() {
  const data = [
    {
      id: uuidv4(),
      nombre: 'Administrador',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: uuidv4(),
      nombre: 'Encuestador',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: uuidv4(),
      nombre: 'Supervisor',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: uuidv4(),
      nombre: 'Consultor',
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  return await safeInsert('roles', data, 'Roles de Usuario');
}

// Seeder para departamentos
export async function seedDepartamentos() {
  const data = [
    { nombre: 'Amazonas', codigo_dane: '91', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Antioquia', codigo_dane: '05', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Arauca', codigo_dane: '81', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Atlántico', codigo_dane: '08', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Bogotá D.C.', codigo_dane: '11', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Bolívar', codigo_dane: '13', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Boyacá', codigo_dane: '15', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Caldas', codigo_dane: '17', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Caquetá', codigo_dane: '18', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Casanare', codigo_dane: '85', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Cauca', codigo_dane: '19', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Cesar', codigo_dane: '20', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Chocó', codigo_dane: '27', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Córdoba', codigo_dane: '23', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Cundinamarca', codigo_dane: '25', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Guainía', codigo_dane: '94', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Guaviare', codigo_dane: '95', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Huila', codigo_dane: '41', created_at: new Date(), updated_at: new Date() },
    { nombre: 'La Guajira', codigo_dane: '44', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Magdalena', codigo_dane: '47', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Meta', codigo_dane: '50', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Nariño', codigo_dane: '52', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Norte de Santander', codigo_dane: '54', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Putumayo', codigo_dane: '86', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Quindío', codigo_dane: '63', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Risaralda', codigo_dane: '66', created_at: new Date(), updated_at: new Date() },
    { nombre: 'San Andrés y Providencia', codigo_dane: '88', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Santander', codigo_dane: '68', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Sucre', codigo_dane: '70', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Tolima', codigo_dane: '73', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Valle del Cauca', codigo_dane: '76', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Vaupés', codigo_dane: '97', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Vichada', codigo_dane: '99', created_at: new Date(), updated_at: new Date() }
  ];

  return await safeInsert('departamentos', data, 'Departamentos de Colombia');
}

// Seeder para enfermedades
export async function seedEnfermedades() {
  const data = [
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
      nombre: 'Hipertensión arterial',
      descripcion: 'Presión arterial elevada de forma sostenida por encima de los valores normales.',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      nombre: 'Asma bronquial',
      descripcion: 'Enfermedad inflamatoria crónica de las vías respiratorias que causa dificultad para respirar.',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      nombre: 'Artritis reumatoide',
      descripcion: 'Enfermedad autoinmune que causa inflamación crónica de las articulaciones.',
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
      nombre: 'Epilepsia',
      descripcion: 'Trastorno neurológico caracterizado por episodios recurrentes de convulsiones.',
      createdAt: new Date(),
      updatedAt: new Date()
    },
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
      nombre: 'Osteoporosis',
      descripcion: 'Enfermedad en la que los huesos se vuelven frágiles y más propensos a fracturas.',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      nombre: 'Insuficiencia renal crónica',
      descripcion: 'Pérdida gradual y permanente de la función renal a lo largo del tiempo.',
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
      nombre: 'Migraña',
      descripcion: 'Tipo de dolor de cabeza recurrente que puede ser severo y debilitante.',
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
      nombre: 'Síndrome del intestino irritable',
      descripcion: 'Trastorno gastrointestinal funcional que causa dolor abdominal y cambios en los hábitos intestinales.',
      createdAt: new Date(),
      updatedAt: new Date()
    },
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
      nombre: 'VIH/SIDA',
      descripcion: 'Virus de inmunodeficiencia humana que ataca el sistema inmunitario.',
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
      nombre: 'Lupus eritematoso sistémico',
      descripcion: 'Enfermedad autoinmune que puede afectar múltiples órganos y sistemas.',
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
      nombre: 'Insuficiencia cardíaca',
      descripcion: 'Condición en la que el corazón no puede bombear sangre de manera eficiente.',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  return await safeInsert('enfermedades', data, 'Enfermedades Comunes');
}

// Función principal que ejecuta todos los seeders
export async function runConfigSeeders() {
  console.log('\n🌱 Iniciando seeders de configuración...');
  
  const seeders = [
    { name: 'Tipos de Identificación', fn: seedTiposIdentificacion },
    { name: 'Estados Civiles', fn: seedEstadosCiviles },
    { name: 'Tipos de Vivienda', fn: seedTiposVivienda },
    { name: 'Sistemas de Acueducto', fn: seedSistemasAcueducto },
    { name: 'Tipos de Aguas Residuales', fn: seedTiposAguasResiduales },
    { name: 'Tipos de Disposición de Basura', fn: seedTiposDisposicionBasura },
    { name: 'Sexos', fn: seedSexos },
    { name: 'Roles', fn: seedRoles },
    { name: 'Departamentos', fn: seedDepartamentos },
    { name: 'Enfermedades', fn: seedEnfermedades }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const seeder of seeders) {
    try {
      console.log(`\n🌱 Ejecutando seeder: ${seeder.name}`);
      const result = await seeder.fn();
      if (result) {
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Error en seeder ${seeder.name}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Resumen de seeders:`);
  console.log(`  ✅ Exitosos: ${successCount}`);
  console.log(`  ❌ Con errores: ${errorCount}`);
  console.log(`  📋 Total: ${seeders.length}`);

  return {
    total: seeders.length,
    success: successCount,
    errors: errorCount
  };
}

// Función para limpiar todos los datos de configuración (útil para testing)
export async function cleanConfigData() {
  console.log('\n🧹 Limpiando datos de configuración...');
  
  const tables = [
    'enfermedades',
    'roles',
    'sexos',
    'tipos_disposicion_basura',
    'tipos_aguas_residuales',
    'sistemas_acueducto',
    'tipos_vivienda',
    'estados_civiles',
    'tipos_identificacion',
    'departamentos'
  ];

  for (const table of tables) {
    try {
      await sequelize.getQueryInterface().bulkDelete(table, null, {});
      console.log(`✅ Tabla ${table} limpiada`);
    } catch (error) {
      console.warn(`⚠️  No se pudo limpiar ${table}: ${error.message}`);
    }
  }
}

export default {
  runConfigSeeders,
  cleanConfigData,
  seedTiposIdentificacion,
  seedEstadosCiviles,
  seedTiposVivienda,
  seedSistemasAcueducto,
  seedTiposAguasResiduales,
  seedTiposDisposicionBasura,
  seedSexos,
  seedRoles,
  seedDepartamentos,
  seedEnfermedades
};
