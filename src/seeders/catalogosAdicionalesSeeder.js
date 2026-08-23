import sequelize from '../../config/sequelize.js';
import { safeInsert } from './seederUtils.js';

/**
 * Seeder para catálogos que faltaban en el sistema (no cubiertos por
 * configSeeder.js ni por profesionesSeeder.js/tallasSeeder.js).
 *
 * Los datos de cada catálogo se tomaron del contenido real ya cargado en
 * la base de datos de desarrollo, para no inventar valores nuevos.
 */

const now = () => new Date();

// Situaciones civiles (distinta de estados_civiles, usada en el módulo de
// encuestas/familia para el campo situacionCivil de cada miembro)
export async function seedSituacionesCiviles() {
  const data = [
    { nombre: 'Soltero(a)', orden: 0, activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Casado(a)', orden: 0, activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Unión Libre', orden: 0, activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Divorciado(a)', orden: 0, activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Separado(a)', orden: 0, activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Viudo(a)', orden: 0, activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Unión Marital de Hecho', orden: 0, activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Otro', orden: 0, activo: true, createdAt: now(), updatedAt: now() }
  ];
  return await safeInsert('situaciones_civiles', data, 'Situaciones Civiles');
}

export async function seedNivelesEducativos() {
  const data = [
    { nivel: 'Educación Primaria', descripcion: 'Nivel básico de educación formal', orden_nivel: 1, activo: true, createdAt: now(), updatedAt: now() },
    { nivel: 'Sin Educación Formal', descripcion: 'Persona sin educación formal', orden_nivel: 0, activo: true, createdAt: now(), updatedAt: now() },
    { nivel: 'Educación Secundaria', descripcion: 'Educación media o bachillerato', orden_nivel: 2, activo: true, createdAt: now(), updatedAt: now() },
    { nivel: 'Técnico', descripcion: 'Formación técnica especializada', orden_nivel: 3, activo: true, createdAt: now(), updatedAt: now() },
    { nivel: 'Tecnológico', descripcion: 'Formación tecnológica superior', orden_nivel: 4, activo: true, createdAt: now(), updatedAt: now() },
    { nivel: 'Universitario', descripcion: 'Educación universitaria de pregrado', orden_nivel: 5, activo: true, createdAt: now(), updatedAt: now() },
    { nivel: 'Especialización', descripcion: 'Estudios de especialización universitaria', orden_nivel: 6, activo: true, createdAt: now(), updatedAt: now() },
    { nivel: 'Maestría', descripcion: 'Estudios de maestría o magíster', orden_nivel: 7, activo: true, createdAt: now(), updatedAt: now() },
    { nivel: 'Doctorado', descripcion: 'Estudios doctorales', orden_nivel: 8, activo: true, createdAt: now(), updatedAt: now() }
  ];
  return await safeInsert('niveles_educativos', data, 'Niveles Educativos');
}

export async function seedComunidadesCulturales() {
  const data = [
    { nombre: 'Afrodescendiente', descripcion: 'Comunidad de personas afrodescendientes', activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Mestizo', descripcion: null, activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Indígena', descripcion: null, activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Blanco', descripcion: null, activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Otra', descripcion: null, activo: true, createdAt: now(), updatedAt: now() }
  ];
  return await safeInsert('comunidades_culturales', data, 'Comunidades Culturales');
}

export async function seedParentescos() {
  const data = [
    { nombre: 'Abuelo', descripcion: 'Abuelo paterno o materno', activo: true },
    { nombre: 'Padre', descripcion: 'Padre biológico o adoptivo', activo: true },
    { nombre: 'Madre', descripcion: 'Madre biológica o adoptiva', activo: true },
    { nombre: 'Hijo', descripcion: 'Hijo biológico o adoptivo', activo: true },
    { nombre: 'Hija', descripcion: 'Hija biológica o adoptiva', activo: true },
    { nombre: 'Hermano', descripcion: 'Hermano', activo: true },
    { nombre: 'Hermana', descripcion: 'Hermana', activo: true },
    { nombre: 'Abuela', descripcion: 'Abuela paterna o materna', activo: true },
    { nombre: 'Esposo', descripcion: 'Esposo', activo: true },
    { nombre: 'Esposa', descripcion: 'Esposa', activo: true },
    { nombre: 'Nieto', descripcion: 'Nieto', activo: true },
    { nombre: 'Nieta', descripcion: 'Nieta', activo: true },
    { nombre: 'Tío', descripcion: 'Tío', activo: true },
    { nombre: 'Tía', descripcion: 'Tía', activo: true },
    { nombre: 'Primo', descripcion: 'Primo', activo: true },
    { nombre: 'Prima', descripcion: 'Prima', activo: true },
    { nombre: 'Suegro', descripcion: 'Suegro', activo: true },
    { nombre: 'Suegra', descripcion: 'Suegra', activo: true },
    { nombre: 'Yerno', descripcion: 'Yerno', activo: true },
    { nombre: 'Nuera', descripcion: 'Nuera', activo: true },
    { nombre: 'Cuñado', descripcion: 'Cuñado', activo: true },
    { nombre: 'Cuñada', descripcion: 'Cuñada', activo: true },
    { nombre: 'Otro', descripcion: 'Otro parentesco no especificado', activo: true },
    { nombre: 'Yerna', descripcion: 'Novia del hijo', activo: true },
    { nombre: 'Jefa de Hogar', descripcion: 'Jefa de Hogar', activo: true },
    { nombre: 'Jefe de hogar', descripcion: 'Representante de hogar', activo: true }
  ];
  return await safeInsert('parentescos', data, 'Parentescos');
}

export async function seedTiposLiderazgo() {
  const data = [
    { nombre: 'Comunitario', descripcion: 'Liderazgo en actividades y organizaciones comunitarias', activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Religioso', descripcion: 'Liderazgo en grupos y actividades religiosas o pastorales', activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Juvenil', descripcion: 'Liderazgo en grupos y movimientos juveniles', activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Deportivo', descripcion: 'Liderazgo en actividades y equipos deportivos', activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Cultural', descripcion: 'Liderazgo en actividades artísticas y culturales', activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Social', descripcion: 'Liderazgo en organizaciones sociales y de voluntariado', activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Educativo', descripcion: 'Liderazgo en instituciones y procesos educativos', activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Político', descripcion: 'Liderazgo en organizaciones políticas o de participación ciudadana', activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Empresarial', descripcion: 'Liderazgo en iniciativas productivas y empresariales', activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Ambiental', descripcion: 'Liderazgo en procesos de conservación y medio ambiente', activo: true, createdAt: now(), updatedAt: now() }
  ];
  return await safeInsert('tipos_liderazgo', data, 'Tipos de Liderazgo');
}

export async function seedTiposNecesidadEnfermo() {
  const data = [
    { nombre: 'Medicamentos', descripcion: 'Necesidad de medicamentos para tratamiento médico continuo', activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Transporte médico', descripcion: 'Necesidad de transporte para asistir a citas y tratamientos médicos', activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Cuidador domiciliario', descripcion: 'Necesidad de una persona que brinde cuidado y asistencia en el hogar', activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Terapia física', descripcion: 'Necesidad de sesiones de fisioterapia o rehabilitación física', activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Apoyo psicológico', descripcion: 'Necesidad de acompañamiento y atención psicológica o emocional', activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Alimentación especial', descripcion: 'Necesidad de dieta especial o suplementos nutricionales por condición médica', activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Equipo médico', descripcion: 'Necesidad de equipos o dispositivos médicos para el cuidado en casa', activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Apoyo espiritual', descripcion: 'Necesidad de acompañamiento espiritual y pastoral en la enfermedad', activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Visita médica domiciliaria', descripcion: 'Necesidad de atención médica a domicilio por imposibilidad de desplazarse', activo: true, createdAt: now(), updatedAt: now() },
    { nombre: 'Gestión de citas médicas', descripcion: 'Necesidad de apoyo para tramitar y gestionar citas con el sistema de salud', activo: true, createdAt: now(), updatedAt: now() }
  ];
  return await safeInsert('tipos_necesidad_enfermo', data, 'Tipos de Necesidad del Enfermo');
}

export async function seedDestrezas() {
  const nombres = [
    'Carpintería', 'Mecánica', 'Electricidad', 'Plomería', 'Costura', 'Tejido', 'Artesanía',
    'Pintura', 'Diseño Gráfico', 'Fotografía', 'Cocina', 'Repostería', 'Peluquería', 'Barbería',
    'Belleza y Estética', 'Manualidades', 'Cerámica', 'Jardinería', 'Agricultura', 'Ganadería',
    'Pesca', 'Albañilería', 'Soldadura', 'Herrería', 'Tapicería', 'Ebanistería', 'Zapatería',
    'Sastrería', 'Bordado', 'Bisutería', 'Marroquinería', 'Panadería', 'Música', 'Canto', 'Danza',
    'Teatro', 'Deportes', 'Informática', 'Reparación de Celulares', 'Reparación de Electrodomésticos',
    'Conducción', 'Operación de Maquinaria', 'Masajes', 'Primeros Auxilios', 'Otra'
  ];
  const data = nombres.map(nombre => ({ nombre, createdAt: now(), updatedAt: now() }));
  return await safeInsert('destrezas', data, 'Destrezas');
}

export async function seedHabilidades() {
  const nombres = [
    'Carpintería', 'Mecánica', 'Electricidad', 'Plomería', 'Costura', 'Tejido', 'Jardinería',
    'Mecánica Automotriz', 'Programación', 'Diseño Gráfico', 'Fotografía', 'Cocina', 'Repostería',
    'Peluquería', 'Costura', 'Artesanía', 'Música', 'Deportes', 'Agricultura', 'Ganadería'
  ];
  const data = nombres.map(nombre => ({
    nombre,
    descripcion: `Habilidad en ${nombre}`,
    created_at: now(),
    updated_at: now()
  }));
  return await safeInsert('habilidades', data, 'Habilidades');
}

/** Ejecuta todos los seeders de este archivo, en orden. */
export async function runCatalogosAdicionalesSeeders() {
  console.log('\n🌱 Iniciando seeders de catálogos adicionales...');

  const seeders = [
    { name: 'Situaciones Civiles', fn: seedSituacionesCiviles },
    { name: 'Niveles Educativos', fn: seedNivelesEducativos },
    { name: 'Comunidades Culturales', fn: seedComunidadesCulturales },
    { name: 'Parentescos', fn: seedParentescos },
    { name: 'Tipos de Liderazgo', fn: seedTiposLiderazgo },
    { name: 'Tipos de Necesidad del Enfermo', fn: seedTiposNecesidadEnfermo },
    { name: 'Destrezas', fn: seedDestrezas },
    { name: 'Habilidades', fn: seedHabilidades }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const seeder of seeders) {
    try {
      console.log(`\n🌱 Ejecutando seeder: ${seeder.name}`);
      const result = await seeder.fn();
      if (result) successCount++;
    } catch (error) {
      console.error(`❌ Error en seeder ${seeder.name}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Resumen de catálogos adicionales:`);
  console.log(`  ✅ Exitosos: ${successCount}`);
  console.log(`  ❌ Con errores: ${errorCount}`);
  console.log(`  📋 Total: ${seeders.length}`);

  return { total: seeders.length, success: successCount, errors: errorCount };
}

/** Limpia los catálogos sembrados por este archivo (útil para testing). */
export async function cleanCatalogosAdicionales() {
  console.log('\n🧹 Limpiando catálogos adicionales...');
  const tables = [
    'situaciones_civiles', 'niveles_educativos', 'comunidades_culturales',
    'parentescos', 'tipos_liderazgo', 'tipos_necesidad_enfermo', 'destrezas', 'habilidades'
  ];
  const resultados = [];
  for (const table of tables) {
    try {
      await sequelize.getQueryInterface().bulkDelete(table, null, {});
      console.log(`✅ Tabla ${table} limpiada`);
      resultados.push(`${table}: OK`);
    } catch (error) {
      console.warn(`⚠️  No se pudo limpiar ${table}: ${error.message}`);
      resultados.push(`${table}: ERROR`);
    }
  }
  return resultados;
}

export default {
  runCatalogosAdicionalesSeeders,
  cleanCatalogosAdicionales,
  seedSituacionesCiviles,
  seedNivelesEducativos,
  seedComunidadesCulturales,
  seedParentescos,
  seedTiposLiderazgo,
  seedTiposNecesidadEnfermo,
  seedDestrezas,
  seedHabilidades
};
