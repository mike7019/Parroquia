import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || 'parroquia_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgresql',
    logging: console.log,
  }
);

async function populateDatabase() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida exitosamente.');

    console.log('📝 Poblando catálogos base...');
    await populateBaseCatalogs();

    console.log('🏛️ Poblando datos geográficos...');
    await populateGeographicData();

    console.log('⛪ Creando parroquia...');
    await createParroquia();

    console.log('👥 Creando datos de ejemplo...');
    await createSampleData();

    console.log('🎉 Base de datos poblada exitosamente');
  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

async function populateBaseCatalogs() {
  // Tipos de Identificación
  await sequelize.query(`
    INSERT INTO "TipoIdentificacion" (nombre, codigo) VALUES
    ('Cédula de Ciudadanía', 'CC'),
    ('Tarjeta de Identidad', 'TI'),
    ('Cédula de Extranjería', 'CE'),
    ('Pasaporte', 'PP'),
    ('Registro Civil', 'RC'),
    ('NIT', 'NIT'),
    ('NUIP', 'NUIP')
    ON CONFLICT (codigo) DO NOTHING;
  `);

  // Sexos
  await sequelize.query(`
    INSERT INTO "Sexo" (nombre) VALUES
    ('Masculino'),
    ('Femenino'),
    ('Otro')
    ON CONFLICT (nombre) DO NOTHING;
  `);

  // Estados Civiles
  await sequelize.query(`
    INSERT INTO "EstadoCivil" (nombre) VALUES
    ('Soltero/a'),
    ('Casado/a'),
    ('Unión Libre'),
    ('Divorciado/a'),
    ('Viudo/a'),
    ('Separado/a'),
    ('Religioso/a')
    ON CONFLICT (nombre) DO NOTHING;
  `);

  // Niveles Educativos
  await sequelize.query(`
    INSERT INTO "NivelesEducativos" (nombre, orden) VALUES
    ('Sin Educación Formal', 1),
    ('Preescolar', 2),
    ('Primaria Incompleta', 3),
    ('Primaria Completa', 4),
    ('Bachillerato Incompleto', 5),
    ('Bachillerato Completo', 6),
    ('Técnico', 7),
    ('Tecnológico', 8),
    ('Universitario Incompleto', 9),
    ('Universitario Completo', 10),
    ('Especialización', 11),
    ('Maestría', 12),
    ('Doctorado', 13)
    ON CONFLICT (nombre) DO NOTHING;
  `);

  // Destrezas
  await sequelize.query(`
    INSERT INTO "Destrezas" (nombre, descripcion, categoria) VALUES
    ('Agricultura', 'Conocimientos en cultivos y manejo de tierras', 'Agropecuaria'),
    ('Ganadería', 'Manejo de ganado bovino, porcino, avícola', 'Agropecuaria'),
    ('Carpintería', 'Trabajo en madera y construcción', 'Artesanía'),
    ('Albañilería', 'Construcción y mampostería', 'Construcción'),
    ('Cocina', 'Preparación de alimentos', 'Gastronomía'),
    ('Costura', 'Confección y reparación de ropa', 'Textil'),
    ('Mecánica', 'Reparación de vehículos y maquinaria', 'Técnica'),
    ('Electricidad', 'Instalaciones y reparaciones eléctricas', 'Técnica'),
    ('Música', 'Instrumentos musicales y canto', 'Arte'),
    ('Catequesis', 'Enseñanza religiosa', 'Pastoral'),
    ('Enfermería', 'Cuidados básicos de salud', 'Salud'),
    ('Educación', 'Enseñanza y pedagogía', 'Educación'),
    ('Comercio', 'Ventas y atención al cliente', 'Comercial'),
    ('Panadería', 'Elaboración de pan y repostería', 'Gastronomía'),
    ('Tejido', 'Elaboración de productos tejidos', 'Artesanía')
    ON CONFLICT (nombre) DO NOTHING;
  `);

  // Comunidades Culturales
  await sequelize.query(`
    INSERT INTO "ComunidadesCulturales" (nombre, descripcion, region) VALUES
    ('Mestizo', 'Población mestiza colombiana', 'Nacional'),
    ('Indígena Embera', 'Comunidad indígena Embera', 'Pacífico'),
    ('Indígena Wayuu', 'Comunidad indígena Wayuu', 'Caribe'),
    ('Afrocolombiano', 'Comunidad afrocolombiana', 'Nacional'),
    ('Raizal', 'Población raizal del Archipiélago', 'Insular'),
    ('Palenquero', 'Comunidad palenquera', 'Caribe'),
    ('Rom (Gitano)', 'Pueblo Rom', 'Nacional'),
    ('Campesino', 'Comunidad campesina tradicional', 'Rural'),
    ('Indígena Zenú', 'Comunidad indígena Zenú', 'Caribe'),
    ('Indígena Nasa', 'Comunidad indígena Nasa', 'Andina')
    ON CONFLICT (nombre) DO NOTHING;
  `);

  // Parentescos
  await sequelize.query(`
    INSERT INTO "Parentesco" (nombre, descripcion) VALUES
    ('Padre', 'Progenitor masculino'),
    ('Madre', 'Progenitor femenino'),
    ('Hijo/a', 'Descendiente directo'),
    ('Esposo/a', 'Cónyuge'),
    ('Hermano/a', 'Hermano o hermana'),
    ('Abuelo/a', 'Progenitor del padre o madre'),
    ('Nieto/a', 'Hijo/a del hijo/a'),
    ('Tío/a', 'Hermano/a del padre o madre'),
    ('Sobrino/a', 'Hijo/a del hermano/a'),
    ('Primo/a', 'Hijo/a del tío/a'),
    ('Cuñado/a', 'Hermano/a del cónyuge'),
    ('Suegro/a', 'Padre/madre del cónyuge'),
    ('Yerno/Nuera', 'Cónyuge del hijo/a'),
    ('Padrastro/Madrastra', 'Cónyuge del progenitor'),
    ('Hijastro/a', 'Hijo/a del cónyuge'),
    ('Otro', 'Otro tipo de parentesco')
    ON CONFLICT (nombre) DO NOTHING;
  `);

  // Tipos de Celebración
  await sequelize.query(`
    INSERT INTO "TiposCelebracion" (nombre, descripcion, categoria, requiere_preparacion, duracion_preparacion_dias) VALUES
    ('Bautismo', 'Sacramento del bautismo', 'Sacramento', true, 30),
    ('Primera Comunión', 'Primera comunión eucarística', 'Sacramento', true, 365),
    ('Confirmación', 'Sacramento de la confirmación', 'Sacramento', true, 180),
    ('Matrimonio', 'Sacramento del matrimonio', 'Sacramento', true, 180),
    ('Unción de Enfermos', 'Sacramento para enfermos', 'Sacramento', false, 0),
    ('Funeral', 'Ceremonia fúnebre', 'Liturgia', false, 0),
    ('Quinceaños', 'Celebración de quinceaños', 'Celebración', true, 60),
    ('Bendición de Casa', 'Bendición del hogar', 'Bendición', false, 0),
    ('Misa de Acción de Gracias', 'Misa especial de agradecimiento', 'Liturgia', true, 7),
    ('Presentación en el Templo', 'Presentación de niños', 'Celebración', true, 14)
    ON CONFLICT (nombre) DO NOTHING;
  `);
}

async function populateGeographicData() {
  // Municipios de Colombia (algunos ejemplos principales)
  await sequelize.query(`
    INSERT INTO "Municipios" (nombre, codigo_dane, departamento, region) VALUES
    ('Bogotá D.C.', '11001', 'Bogotá D.C.', 'Andina'),
    ('Medellín', '05001', 'Antioquia', 'Andina'),
    ('Cali', '76001', 'Valle del Cauca', 'Pacífica'),
    ('Barranquilla', '08001', 'Atlántico', 'Caribe'),
    ('Cartagena', '13001', 'Bolívar', 'Caribe'),
    ('Cúcuta', '54001', 'Norte de Santander', 'Andina'),
    ('Bucaramanga', '68001', 'Santander', 'Andina'),
    ('Pereira', '66001', 'Risaralda', 'Andina'),
    ('Santa Marta', '47001', 'Magdalena', 'Caribe'),
    ('Ibagué', '73001', 'Tolima', 'Andina'),
    ('Pasto', '52001', 'Nariño', 'Andina'),
    ('Manizales', '17001', 'Caldas', 'Andina'),
    ('Neiva', '41001', 'Huila', 'Andina'),
    ('Villavicencio', '50001', 'Meta', 'Orinoquía'),
    ('Armenia', '63001', 'Quindío', 'Andina'),
    ('Soacha', '25754', 'Cundinamarca', 'Andina'),
    ('Valledupar', '20001', 'Cesar', 'Caribe'),
    ('Montería', '23001', 'Córdoba', 'Caribe'),
    ('Soledad', '08758', 'Atlántico', 'Caribe'),
    ('Floridablanca', '68276', 'Santander', 'Andina')
    ON CONFLICT (codigo_dane) DO NOTHING;
  `);

  // Obtener IDs de municipios para crear veredas
  const [municipios] = await sequelize.query('SELECT id, nombre FROM "Municipios" LIMIT 5');
  
  for (const municipio of municipios) {
    await sequelize.query(`
      INSERT INTO "Veredas" (nombre, municipio_id, codigo, descripcion) VALUES
      ('Vereda Centro', ${municipio.id}, 'VC001', 'Vereda central del municipio'),
      ('Vereda Norte', ${municipio.id}, 'VN001', 'Vereda al norte del municipio'),
      ('Vereda Sur', ${municipio.id}, 'VS001', 'Vereda al sur del municipio'),
      ('Vereda Oriente', ${municipio.id}, 'VO001', 'Vereda oriental del municipio'),
      ('Vereda Occidente', ${municipio.id}, 'VX001', 'Vereda occidental del municipio')
      ON CONFLICT DO NOTHING;
    `);
  }
}

async function createParroquia() {
  const [municipioResult] = await sequelize.query('SELECT id FROM "Municipios" LIMIT 1');
  const municipioId = municipioResult[0]?.id || 1;

  await sequelize.query(`
    INSERT INTO "Parroquia" (nombre, direccion, telefono, email, parroco, municipio_id, fundacion, descripcion) VALUES
    ('Parroquia San José', 'Calle Principal #123', '310-555-0123', 'parroquia@sanjose.org', 'Padre José María García', ${municipioId}, '1950-03-19', 'Parroquia católica dedicada a San José, patrono de los trabajadores')
    ON CONFLICT DO NOTHING;
  `);

  // Crear ministerios parroquiales
  const [parroquiaResult] = await sequelize.query('SELECT id FROM "Parroquia" LIMIT 1');
  const parroquiaId = parroquiaResult[0]?.id || 1;

  await sequelize.query(`
    INSERT INTO "MinisteriosParroquiales" (nombre, descripcion, fecha_creacion, activo, parroquia_id) VALUES
    ('Catequesis', 'Ministerio de enseñanza religiosa para niños y adultos', CURRENT_DATE, true, ${parroquiaId}),
    ('Coro Parroquial', 'Ministerio de música litúrgica', CURRENT_DATE, true, ${parroquiaId}),
    ('Acólitos', 'Ministerio de servicio al altar', CURRENT_DATE, true, ${parroquiaId}),
    ('Lectores', 'Ministerio de la Palabra', CURRENT_DATE, true, ${parroquiaId}),
    ('Ministros Eucarísticos', 'Ministerio de distribución de la Eucaristía', CURRENT_DATE, true, ${parroquiaId}),
    ('Pastoral Social', 'Ministerio de ayuda a necesitados', CURRENT_DATE, true, ${parroquiaId}),
    ('Pastoral Juvenil', 'Ministerio para jóvenes', CURRENT_DATE, true, ${parroquiaId}),
    ('Pastoral Familiar', 'Ministerio para familias', CURRENT_DATE, true, ${parroquiaId})
    ON CONFLICT (nombre) DO NOTHING;
  `);

  // Crear grupos parroquiales
  await sequelize.query(`
    INSERT INTO "GruposParroquiales" (nombre, descripcion, tipo_grupo, fecha_creacion, dia_reunion, hora_reunion, lugar_reunion, activo, parroquia_id) VALUES
    ('Grupo de Oración', 'Grupo de oración y reflexión bíblica', 'Espiritual', CURRENT_DATE, 'Miércoles', '19:00:00', 'Salón Parroquial', true, ${parroquiaId}),
    ('Legión de María', 'Grupo mariano de apostolado', 'Mariano', CURRENT_DATE, 'Sábado', '15:00:00', 'Capilla', true, ${parroquiaId}),
    ('Cursillos de Cristiandad', 'Movimiento de renovación cristiana', 'Formación', CURRENT_DATE, 'Domingo', '16:00:00', 'Aula 1', true, ${parroquiaId}),
    ('Renovación Carismática', 'Grupo carismático católico', 'Carismático', CURRENT_DATE, 'Viernes', '20:00:00', 'Templo', true, ${parroquiaId}),
    ('Grupo Juvenil', 'Jóvenes católicos en formación', 'Juvenil', CURRENT_DATE, 'Sábado', '18:00:00', 'Salón Juvenil', true, ${parroquiaId})
    ON CONFLICT DO NOTHING;
  `);
}

async function createSampleData() {
  // Obtener IDs necesarios
  const [veredaResult] = await sequelize.query('SELECT id FROM "Veredas" LIMIT 1');
  const [parroquiaResult] = await sequelize.query('SELECT id FROM "Parroquia" LIMIT 1');
  const [tipoIdResult] = await sequelize.query('SELECT id FROM "TipoIdentificacion" WHERE codigo = \'CC\' LIMIT 1');
  const [sexoMResult] = await sequelize.query('SELECT id FROM "Sexo" WHERE nombre = \'Masculino\' LIMIT 1');
  const [sexoFResult] = await sequelize.query('SELECT id FROM "Sexo" WHERE nombre = \'Femenino\' LIMIT 1');
  const [estadoCivilResult] = await sequelize.query('SELECT id FROM "EstadoCivil" WHERE nombre = \'Casado/a\' LIMIT 1');
  const [nivelEducativoResult] = await sequelize.query('SELECT id FROM "NivelesEducativos" WHERE nombre = \'Bachillerato Completo\' LIMIT 1');
  const [comunidadResult] = await sequelize.query('SELECT id FROM "ComunidadesCulturales" WHERE nombre = \'Mestizo\' LIMIT 1');

  const veredaId = veredaResult[0]?.id || 1;
  const parroquiaId = parroquiaResult[0]?.id || 1;
  const tipoIdCC = tipoIdResult[0]?.id || 1;
  const sexoM = sexoMResult[0]?.id || 1;
  const sexoF = sexoFResult[0]?.id || 2;
  const estadoCivil = estadoCivilResult[0]?.id || 2;
  const nivelEducativo = nivelEducativoResult[0]?.id || 6;
  const comunidadId = comunidadResult[0]?.id || 1;

  // Crear familia de ejemplo
  await sequelize.query(`
    INSERT INTO "Familia" (nombre_familia, direccion, telefono, vereda_id, parroquia_id, observaciones, fecha_registro) VALUES
    ('Familia García Rodríguez', 'Carrera 15 #25-30', '310-555-0001', ${veredaId}, ${parroquiaId}, 'Familia católica activa en la parroquia', CURRENT_DATE),
    ('Familia López Martínez', 'Calle 8 #12-45', '320-555-0002', ${veredaId}, ${parroquiaId}, 'Nueva familia en la parroquia', CURRENT_DATE),
    ('Familia Pérez Gómez', 'Avenida Principal #67-89', '315-555-0003', ${veredaId}, ${parroquiaId}, 'Familia comprometida con la pastoral social', CURRENT_DATE)
    ON CONFLICT DO NOTHING;
  `);

  // Obtener IDs de familias creadas
  const [familiaResult] = await sequelize.query('SELECT id FROM "Familia" ORDER BY id LIMIT 3');
  
  if (familiaResult.length > 0) {
    const familia1Id = familiaResult[0].id;
    const familia2Id = familiaResult[1]?.id || familia1Id;
    const familia3Id = familiaResult[2]?.id || familia1Id;

    // Crear personas de ejemplo
    await sequelize.query(`
      INSERT INTO "Persona" (nombres, apellidos, tipo_identificacion_id, numero_identificacion, fecha_nacimiento, lugar_nacimiento, sexo_id, estado_civil_id, nivel_educativo_id, ocupacion, telefono, email, direccion, vereda_id, familia_id, comunidad_cultural_id, observaciones, fecha_registro, activo, profesion, estado_salud, fecha_bautismo, estado_pastoral) VALUES
      ('José María', 'García Rodríguez', ${tipoIdCC}, '12345678', '1975-05-15', 'Bogotá', ${sexoM}, ${estadoCivil}, ${nivelEducativo}, 'Agricultor', '310-555-0001', 'jose.garcia@email.com', 'Carrera 15 #25-30', ${veredaId}, ${familia1Id}, ${comunidadId}, 'Jefe de familia, activo en ministerios', CURRENT_DATE, true, 'Ingeniero Agrónomo', 'Buena', '1975-06-15', 'Muy Activo'),
      ('María Elena', 'Rodríguez de García', ${tipoIdCC}, '23456789', '1978-08-22', 'Medellín', ${sexoF}, ${estadoCivil}, ${nivelEducativo}, 'Ama de casa', '310-555-0001', 'maria.garcia@email.com', 'Carrera 15 #25-30', ${veredaId}, ${familia1Id}, ${comunidadId}, 'Líder del grupo de oración', CURRENT_DATE, true, 'Enfermera', 'Buena', '1978-09-22', 'Muy Activo'),
      ('Carlos Andrés', 'García Rodríguez', ${tipoIdCC}, '34567890', '2005-03-10', 'Local', ${sexoM}, 1, 5, 'Estudiante', '320-555-0010', 'carlos.garcia@email.com', 'Carrera 15 #25-30', ${veredaId}, ${familia1Id}, ${comunidadId}, 'Hijo mayor, confirmado', CURRENT_DATE, true, 'Estudiante', 'Buena', '2005-04-10', 'Activo'),
      ('Ana Sofía', 'García Rodríguez', ${tipoIdCC}, '45678901', '2008-11-18', 'Local', ${sexoF}, 1, 4, 'Estudiante', '320-555-0011', 'ana.garcia@email.com', 'Carrera 15 #25-30', ${veredaId}, ${familia1Id}, ${comunidadId}, 'Hija menor, primera comunión', CURRENT_DATE, true, 'Estudiante', 'Buena', '2008-12-18', 'Activo'),
      ('Pedro Luis', 'López Martínez', ${tipoIdCC}, '56789012', '1980-01-25', 'Cali', ${sexoM}, ${estadoCivil}, ${nivelEducativo}, 'Mecánico', '320-555-0002', 'pedro.lopez@email.com', 'Calle 8 #12-45', ${veredaId}, ${familia2Id}, ${comunidadId}, 'Nuevo feligrés', CURRENT_DATE, true, 'Técnico Mecánico', 'Buena', '1980-02-25', 'Nuevo'),
      ('Carmen Isabel', 'Martínez de López', ${tipoIdCC}, '67890123', '1982-07-14', 'Barranquilla', ${sexoF}, ${estadoCivil}, ${nivelEducativo}, 'Comerciante', '320-555-0002', 'carmen.lopez@email.com', 'Calle 8 #12-45', ${veredaId}, ${familia2Id}, ${comunidadId}, 'Activa en pastoral familiar', CURRENT_DATE, true, 'Administradora', 'Buena', '1982-08-14', 'Activo')
      ON CONFLICT (numero_identificacion) DO NOTHING;
    `);

    // Crear relaciones de parentesco
    const [personaResult] = await sequelize.query('SELECT id, familia_id FROM "Persona" ORDER BY id LIMIT 6');
    const [parentescoResult] = await sequelize.query('SELECT id, nombre FROM "Parentesco"');

    if (personaResult.length > 0 && parentescoResult.length > 0) {
      // Buscar IDs de parentesco
      const padreId = parentescoResult.find(p => p.nombre === 'Padre')?.id || 1;
      const madreId = parentescoResult.find(p => p.nombre === 'Madre')?.id || 2;
      const hijoId = parentescoResult.find(p => p.nombre === 'Hijo/a')?.id || 3;

      // Crear relaciones familiares para la familia García
      if (personaResult.length >= 4) {
        const joseMaria = personaResult[0];
        const mariaElena = personaResult[1];
        const carlosAndres = personaResult[2];
        const anaSofia = personaResult[3];

        await sequelize.query(`
          INSERT INTO "FamiliaParentesco" (familia_id, persona_id, parentesco_id, es_jefe_familia, fecha_vinculacion) VALUES
          (${joseMaria.familia_id}, ${joseMaria.id}, ${padreId}, true, CURRENT_DATE),
          (${mariaElena.familia_id}, ${mariaElena.id}, ${madreId}, false, CURRENT_DATE),
          (${carlosAndres.familia_id}, ${carlosAndres.id}, ${hijoId}, false, CURRENT_DATE),
          (${anaSofia.familia_id}, ${anaSofia.id}, ${hijoId}, false, CURRENT_DATE)
          ON CONFLICT (familia_id, persona_id) DO NOTHING;
        `);
      }
    }

    // Asignar destrezas a personas
    const [destrezaResult] = await sequelize.query('SELECT id, nombre FROM "Destrezas" LIMIT 5');
    if (personaResult.length > 0 && destrezaResult.length > 0) {
      await sequelize.query(`
        INSERT INTO "PersonaDestreza" (persona_id, destreza_id, nivel_experiencia, fecha_adquisicion, observaciones) VALUES
        (${personaResult[0].id}, ${destrezaResult[0].id}, 'Experto', '2010-01-01', 'Más de 10 años de experiencia'),
        (${personaResult[1].id}, ${destrezaResult[4].id}, 'Intermedio', '2015-01-01', 'Cocina tradicional'),
        (${personaResult[4].id}, ${destrezaResult[2].id}, 'Avanzado', '2018-01-01', 'Taller propio')
        ON CONFLICT (persona_id, destreza_id) DO NOTHING;
      `);
    }

    // Crear eventos parroquiales
    await sequelize.query(`
      INSERT INTO "EventosParroquiales" (nombre, descripcion, fecha_inicio, fecha_fin, lugar, responsable, tipo_evento, publico_objetivo, costo, capacidad_maxima, estado, parroquia_id) VALUES
      ('Retiro Espiritual Familiar', 'Retiro de fin de semana para familias', '2024-02-15', '2024-02-16', 'Casa de Retiros San Francisco', 'Padre José María', 'Retiro', 'Familias', 50000.00, 50, 'Programado', ${parroquiaId}),
      ('Festival de la Familia', 'Celebración anual de la familia', '2024-05-01', '2024-05-01', 'Patio Parroquial', 'Pastoral Familiar', 'Festival', 'Toda la comunidad', 0.00, 200, 'Planificado', ${parroquiaId}),
      ('Curso de Preparación Matrimonial', 'Curso pre-matrimonial', '2024-03-01', '2024-03-30', 'Salón Parroquial', 'Pastoral Familiar', 'Formación', 'Novios', 30000.00, 20, 'Programado', ${parroquiaId})
      ON CONFLICT DO NOTHING;
    `);

    // Crear algunas celebraciones
    const [tipoCelebracionResult] = await sequelize.query('SELECT id, nombre FROM "TiposCelebracion" LIMIT 3');
    if (personaResult.length > 0 && tipoCelebracionResult.length > 0) {
      await sequelize.query(`
        INSERT INTO "Celebraciones" (tipo_celebracion_id, persona_principal_id, fecha_celebracion, lugar, parroco_celebrante, observaciones, estado) VALUES
        (${tipoCelebracionResult[0].id}, ${personaResult[2].id}, '2024-02-10', 'Templo Parroquial', 'Padre José María', 'Bautismo programado', 'Programada'),
        (${tipoCelebracionResult[1].id}, ${personaResult[3].id}, '2024-04-15', 'Templo Parroquial', 'Padre José María', 'Primera comunión', 'Preparación'),
        (${tipoCelebracionResult[2].id}, ${personaResult[4].id}, '2024-06-20', 'Templo Parroquial', 'Padre José María', 'Confirmación', 'Programada')
        ON CONFLICT DO NOTHING;
      `);
    }
  }

  console.log('✅ Datos de ejemplo creados exitosamente');
}

// Ejecutar población
populateDatabase();
