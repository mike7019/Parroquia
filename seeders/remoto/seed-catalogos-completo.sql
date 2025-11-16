-- ============================================================================
-- SCRIPT DE POBLACIÓN COMPLETA DE CATÁLOGOS - PARROQUIA DB
-- ============================================================================
-- Servidor: 206.62.139.100:5433
-- Base de datos: parroquia_db
-- Fecha: 2025-11-15
-- Descripción: Inserta todos los datos de catálogos necesarios para encuestas
-- ============================================================================

-- Limpiar catálogos existentes (opcional - comentar si no se desea limpiar)
-- TRUNCATE TABLE persona_habilidad, persona_destreza, persona_celebracion, persona_enfermedad CASCADE;
-- TRUNCATE TABLE familia_disposicion_basuras, familia_aguas_residuales CASCADE;
-- TRUNCATE TABLE destrezas, habilidades, enfermedades, profesiones CASCADE;
-- TRUNCATE TABLE comunidades_culturales, niveles_educativos, parentescos CASCADE;
-- TRUNCATE TABLE situaciones_civiles, estados_civiles, sexos, tipos_identificacion CASCADE;
-- TRUNCATE TABLE tipos_aguas_residuales, sistemas_acueducto, tipos_vivienda CASCADE;

-- ============================================================================
-- 1. TIPOS DE IDENTIFICACIÓN
-- ============================================================================
INSERT INTO tipos_identificacion (nombre, codigo, descripcion, created_at, updated_at)
VALUES
  ('Cédula de Ciudadanía', 'CC', 'Documento de identificación para ciudadanos colombianos mayores de edad', NOW(), NOW()),
  ('Tarjeta de Identidad', 'TI', 'Documento de identificación para menores de edad', NOW(), NOW()),
  ('Cédula de Extranjería', 'CE', 'Documento de identificación para extranjeros residentes', NOW(), NOW()),
  ('Pasaporte', 'PA', 'Documento de identificación internacional', NOW(), NOW()),
  ('NIT', 'NIT', 'Número de Identificación Tributaria', NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================================
-- 2. SEXOS
-- ============================================================================
INSERT INTO sexos (nombre, descripcion, created_at, updated_at)
VALUES
  ('Masculino', 'Sexo masculino', NOW(), NOW()),
  ('Femenino', 'Sexo femenino', NOW(), NOW()),
  ('Otro', 'Otro sexo o no especificado', NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================================
-- 3. ESTADOS CIVILES
-- ============================================================================
INSERT INTO estados_civiles (descripcion, activo, created_at, updated_at)
VALUES
  ('Soltero(a)', true, NOW(), NOW()),
  ('Casado(a)', true, NOW(), NOW()),
  ('Divorciado(a)', true, NOW(), NOW()),
  ('Viudo(a)', true, NOW(), NOW()),
  ('Unión Libre', true, NOW(), NOW()),
  ('Separado(a)', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. SITUACIONES CIVILES
-- ============================================================================
INSERT INTO situaciones_civiles (nombre, codigo, orden, activo, created_at, updated_at)
VALUES
  ('Soltero(a)', 'SOL', 1, true, NOW(), NOW()),
  ('Casado(a)', 'CAS', 2, true, NOW(), NOW()),
  ('Divorciado(a)', 'DIV', 3, true, NOW(), NOW()),
  ('Viudo(a)', 'VIU', 4, true, NOW(), NOW()),
  ('Unión Libre', 'UNL', 5, true, NOW(), NOW()),
  ('Separado(a)', 'SEP', 6, true, NOW(), NOW()),
  ('Religioso(a)', 'REL', 7, true, NOW(), NOW()),
  ('No especifica', 'NE', 8, true, NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================================
-- 5. TIPOS DE VIVIENDA
-- ============================================================================
INSERT INTO tipos_vivienda (nombre, descripcion, activo, created_at, updated_at)
VALUES
  ('Casa', 'Vivienda unifamiliar independiente', true, NOW(), NOW()),
  ('Apartamento', 'Vivienda en edificio multifamiliar', true, NOW(), NOW()),
  ('Finca', 'Vivienda rural con terreno', true, NOW(), NOW()),
  ('Rancho', 'Vivienda rural básica', true, NOW(), NOW()),
  ('Cuarto', 'Habitación en vivienda compartida', true, NOW(), NOW()),
  ('Inquilinato', 'Vivienda multifamiliar con servicios compartidos', true, NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================================
-- 6. SISTEMAS DE ACUEDUCTO
-- ============================================================================
INSERT INTO sistemas_acueducto (nombre, descripcion, created_at, updated_at)
VALUES
  ('Acueducto Público', 'Sistema de acueducto municipal o departamental', NOW(), NOW()),
  ('Pozo Propio', 'Pozo de agua subterránea privado', NOW(), NOW()),
  ('Aljibe', 'Depósito de agua de lluvia', NOW(), NOW()),
  ('Río o Quebrada', 'Toma directa de fuente natural', NOW(), NOW()),
  ('Carrotanque', 'Suministro por vehículo cisterna', NOW(), NOW()),
  ('Nacimiento', 'Manantial o nacedero', NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================================
-- 7. TIPOS DE AGUAS RESIDUALES
-- ============================================================================
INSERT INTO tipos_aguas_residuales (nombre, descripcion, created_at, updated_at)
VALUES
  ('Alcantarillado Público', 'Conexión al sistema de alcantarillado municipal', NOW(), NOW()),
  ('Pozo Séptico', 'Sistema de tratamiento individual', NOW(), NOW()),
  ('Letrina', 'Sistema básico de saneamiento', NOW(), NOW()),
  ('Campo Abierto', 'Sin sistema de tratamiento', NOW(), NOW()),
  ('Río o Quebrada', 'Descarga directa a fuente hídrica', NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================================
-- 8. TIPOS DE DISPOSICIÓN DE BASURA
-- ============================================================================
INSERT INTO tipos_disposicion_basura (nombre, descripcion, created_at, updated_at)
VALUES
  ('Recolección Pública', 'Servicio de recolección municipal', NOW(), NOW()),
  ('Quema', 'Incineración de residuos', NOW(), NOW()),
  ('Entierro', 'Enterramiento de basura', NOW(), NOW()),
  ('Río o Quebrada', 'Descarga en fuente hídrica', NOW(), NOW()),
  ('Campo Abierto', 'Disposición a campo abierto', NOW(), NOW()),
  ('Reciclaje', 'Separación y reciclaje', NOW(), NOW()),
  ('Compostaje', 'Compostaje de orgánicos', NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================================
-- 9. PROFESIONES
-- ============================================================================
INSERT INTO profesiones (nombre, descripcion, created_at, updated_at)
VALUES
  ('Ingeniero', 'Profesional de la ingeniería', NOW(), NOW()),
  ('Docente', 'Profesional de la educación', NOW(), NOW()),
  ('Médico', 'Profesional de la salud', NOW(), NOW()),
  ('Enfermero/a', 'Profesional de enfermería', NOW(), NOW()),
  ('Abogado', 'Profesional del derecho', NOW(), NOW()),
  ('Agricultor', 'Persona dedicada a la agricultura', NOW(), NOW()),
  ('Ganadero', 'Persona dedicada a la ganadería', NOW(), NOW()),
  ('Comerciante', 'Persona dedicada al comercio', NOW(), NOW()),
  ('Mecánico', 'Técnico en mecánica', NOW(), NOW()),
  ('Carpintero', 'Artesano de la madera', NOW(), NOW()),
  ('Electricista', 'Técnico en electricidad', NOW(), NOW()),
  ('Albañil', 'Trabajador de la construcción', NOW(), NOW()),
  ('Conductor', 'Conductor de vehículos', NOW(), NOW()),
  ('Cocinero/a', 'Profesional de la cocina', NOW(), NOW()),
  ('Empleado Doméstico', 'Trabajador del hogar', NOW(), NOW()),
  ('Estudiante', 'Persona en proceso de formación', NOW(), NOW()),
  ('Pensionado', 'Persona jubilada', NOW(), NOW()),
  ('Ama de Casa', 'Persona dedicada al hogar', NOW(), NOW()),
  ('Desempleado', 'Sin ocupación laboral actual', NOW(), NOW()),
  ('Otro', 'Otras profesiones no especificadas', NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================================
-- 10. PARENTESCOS (46 registros)
-- ============================================================================
INSERT INTO parentescos (nombre, genero, categoria, orden, activo, created_at, updated_at)
VALUES
  -- Jefes de Hogar
  ('Jefe de Hogar', 'M', 'Jefes de Hogar', 1, true, NOW(), NOW()),
  ('Jefa de Hogar', 'F', 'Jefes de Hogar', 2, true, NOW(), NOW()),
  
  -- Cónyuges/Parejas
  ('Esposo', 'M', 'Cónyuges/Parejas', 3, true, NOW(), NOW()),
  ('Esposa', 'F', 'Cónyuges/Parejas', 4, true, NOW(), NOW()),
  ('Compañero', 'M', 'Cónyuges/Parejas', 5, true, NOW(), NOW()),
  ('Compañera', 'F', 'Cónyuges/Parejas', 6, true, NOW(), NOW()),
  
  -- Hijos
  ('Hijo', 'M', 'Hijos', 7, true, NOW(), NOW()),
  ('Hija', 'F', 'Hijos', 8, true, NOW(), NOW()),
  
  -- Padres
  ('Padre', 'M', 'Padres', 9, true, NOW(), NOW()),
  ('Madre', 'F', 'Padres', 10, true, NOW(), NOW()),
  ('Suegro', 'M', 'Padres', 11, true, NOW(), NOW()),
  ('Suegra', 'F', 'Padres', 12, true, NOW(), NOW()),
  
  -- Hermanos
  ('Hermano', 'M', 'Hermanos', 13, true, NOW(), NOW()),
  ('Hermana', 'F', 'Hermanos', 14, true, NOW(), NOW()),
  ('Cuñado', 'M', 'Hermanos', 15, true, NOW(), NOW()),
  ('Cuñada', 'F', 'Hermanos', 16, true, NOW(), NOW()),
  
  -- Abuelos
  ('Abuelo', 'M', 'Abuelos', 17, true, NOW(), NOW()),
  ('Abuela', 'F', 'Abuelos', 18, true, NOW(), NOW()),
  ('Bisabuelo', 'M', 'Abuelos', 19, true, NOW(), NOW()),
  ('Bisabuela', 'F', 'Abuelos', 20, true, NOW(), NOW()),
  
  -- Nietos
  ('Nieto', 'M', 'Nietos', 21, true, NOW(), NOW()),
  ('Nieta', 'F', 'Nietos', 22, true, NOW(), NOW()),
  ('Bisnieto', 'M', 'Nietos', 23, true, NOW(), NOW()),
  ('Bisnieta', 'F', 'Nietos', 24, true, NOW(), NOW()),
  
  -- Tíos y Sobrinos
  ('Tío', 'M', 'Tíos y Sobrinos', 25, true, NOW(), NOW()),
  ('Tía', 'F', 'Tíos y Sobrinos', 26, true, NOW(), NOW()),
  ('Sobrino', 'M', 'Tíos y Sobrinos', 27, true, NOW(), NOW()),
  ('Sobrina', 'F', 'Tíos y Sobrinos', 28, true, NOW(), NOW()),
  
  -- Primos
  ('Primo', 'M', 'Primos', 29, true, NOW(), NOW()),
  ('Prima', 'F', 'Primos', 30, true, NOW(), NOW()),
  
  -- Yernos/Nueras
  ('Yerno', 'M', 'Yernos/Nueras', 31, true, NOW(), NOW()),
  ('Nuera', 'F', 'Yernos/Nueras', 32, true, NOW(), NOW()),
  
  -- Familia Política
  ('Padrastro', 'M', 'Familia Política', 33, true, NOW(), NOW()),
  ('Madrastra', 'F', 'Familia Política', 34, true, NOW(), NOW()),
  ('Hijastro', 'M', 'Familia Política', 35, true, NOW(), NOW()),
  ('Hijastra', 'F', 'Familia Política', 36, true, NOW(), NOW()),
  ('Hermanastro', 'M', 'Familia Política', 37, true, NOW(), NOW()),
  ('Hermanastra', 'F', 'Familia Política', 38, true, NOW(), NOW()),
  
  -- Compadrazgo
  ('Padrino', 'M', 'Compadrazgo', 39, true, NOW(), NOW()),
  ('Madrina', 'F', 'Compadrazgo', 40, true, NOW(), NOW()),
  ('Ahijado', 'M', 'Compadrazgo', 41, true, NOW(), NOW()),
  ('Ahijada', 'F', 'Compadrazgo', 42, true, NOW(), NOW()),
  
  -- Otros
  ('Empleado Doméstico', 'M', 'Otros', 43, true, NOW(), NOW()),
  ('Empleada Doméstica', 'F', 'Otros', 44, true, NOW(), NOW()),
  ('Pensionista', 'U', 'Otros', 45, true, NOW(), NOW()),
  ('Otro', 'U', 'Otros', 46, true, NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================================
-- 11. NIVELES EDUCATIVOS
-- ============================================================================
INSERT INTO niveles_educativos (nombre, orden, activo, created_at, updated_at)
VALUES
  ('Ninguno', 0, true, NOW(), NOW()),
  ('Preescolar', 1, true, NOW(), NOW()),
  ('Primaria Incompleta', 2, true, NOW(), NOW()),
  ('Primaria Completa', 3, true, NOW(), NOW()),
  ('Bachillerato Incompleto', 4, true, NOW(), NOW()),
  ('Bachillerato Completo', 5, true, NOW(), NOW()),
  ('Técnico', 6, true, NOW(), NOW()),
  ('Tecnológico', 7, true, NOW(), NOW()),
  ('Universitario Incompleto', 8, true, NOW(), NOW()),
  ('Universitario Completo', 9, true, NOW(), NOW()),
  ('Especialización', 10, true, NOW(), NOW()),
  ('Maestría', 11, true, NOW(), NOW()),
  ('Doctorado', 12, true, NOW(), NOW()),
  ('Otro', 13, true, NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================================
-- 12. COMUNIDADES CULTURALES
-- ============================================================================
INSERT INTO comunidades_culturales (nombre, descripcion, activo, created_at, updated_at)
VALUES
  ('Indígena', 'Comunidades indígenas generales', true, NOW(), NOW()),
  ('Wayúu', 'Pueblo indígena de La Guajira', true, NOW(), NOW()),
  ('Nasa', 'Pueblo indígena del Cauca', true, NOW(), NOW()),
  ('Zenú', 'Pueblo indígena de Córdoba y Sucre', true, NOW(), NOW()),
  ('Embera', 'Pueblo indígena del Chocó y Antioquia', true, NOW(), NOW()),
  ('Arhuaco', 'Pueblo indígena de la Sierra Nevada', true, NOW(), NOW()),
  ('Kogui', 'Pueblo indígena de la Sierra Nevada', true, NOW(), NOW()),
  ('Wiwa', 'Pueblo indígena de la Sierra Nevada', true, NOW(), NOW()),
  ('Afrocolombiano', 'Comunidad afrodescendiente', true, NOW(), NOW()),
  ('Raizal', 'Comunidad raizal de San Andrés y Providencia', true, NOW(), NOW()),
  ('Palenquero', 'Comunidad de San Basilio de Palenque', true, NOW(), NOW()),
  ('Rom (Gitano)', 'Comunidad gitana', true, NOW(), NOW()),
  ('Campesino', 'Población campesina', true, NOW(), NOW()),
  ('Mestizo', 'Población mestiza', true, NOW(), NOW()),
  ('Blanco/Caucásico', 'Población blanca o caucásica', true, NOW(), NOW()),
  ('Migrante/Extranjero', 'Población migrante o extranjera', true, NOW(), NOW()),
  ('No especifica', 'No especifica pertenencia étnica', true, NOW(), NOW()),
  ('Ninguna', 'No pertenece a ninguna comunidad cultural específica', true, NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================================
-- 13. ENFERMEDADES (89 registros)
-- ============================================================================
INSERT INTO enfermedades (nombre, "createdAt", "updatedAt")
VALUES
  -- Enfermedades Crónicas
  ('Diabetes tipo 1', NOW(), NOW()),
  ('Diabetes tipo 2', NOW(), NOW()),
  ('Hipertensión Arterial', NOW(), NOW()),
  ('Asma', NOW(), NOW()),
  ('Obesidad', NOW(), NOW()),
  ('Artritis', NOW(), NOW()),
  ('Osteoporosis', NOW(), NOW()),
  ('EPOC', NOW(), NOW()),
  ('Insuficiencia Renal', NOW(), NOW()),
  ('Insuficiencia Cardíaca', NOW(), NOW()),
  
  -- Enfermedades Neurológicas
  ('Cirrosis', NOW(), NOW()),
  ('Parkinson', NOW(), NOW()),
  ('Alzheimer', NOW(), NOW()),
  ('Epilepsia', NOW(), NOW()),
  ('Fibromialgia', NOW(), NOW()),
  ('Migraña', NOW(), NOW()),
  ('Cefalea', NOW(), NOW()),
  
  -- Enfermedades Cardiovasculares
  ('Cardiopatía', NOW(), NOW()),
  ('Arritmia', NOW(), NOW()),
  ('Angina de Pecho', NOW(), NOW()),
  ('Infarto', NOW(), NOW()),
  ('ACV', NOW(), NOW()),
  ('Trombosis', NOW(), NOW()),
  ('Várices', NOW(), NOW()),
  
  -- Enfermedades Metabólicas
  ('Hipertiroidismo', NOW(), NOW()),
  ('Hipotiroidismo', NOW(), NOW()),
  ('Colesterol Alto', NOW(), NOW()),
  ('Triglicéridos Altos', NOW(), NOW()),
  ('Gota', NOW(), NOW()),
  
  -- Enfermedades Respiratorias
  ('Bronquitis Crónica', NOW(), NOW()),
  ('Enfisema', NOW(), NOW()),
  ('Neumonía', NOW(), NOW()),
  ('Tuberculosis', NOW(), NOW()),
  ('Rinitis Alérgica', NOW(), NOW()),
  ('Sinusitis', NOW(), NOW()),
  
  -- Enfermedades Digestivas
  ('Gastritis', NOW(), NOW()),
  ('Úlcera Péptica', NOW(), NOW()),
  ('Reflujo', NOW(), NOW()),
  ('Colitis', NOW(), NOW()),
  ('Crohn', NOW(), NOW()),
  ('Colon Irritable', NOW(), NOW()),
  ('Hepatitis B', NOW(), NOW()),
  ('Hepatitis C', NOW(), NOW()),
  ('Cálculos Biliares', NOW(), NOW()),
  
  -- Enfermedades Renales/Urológicas
  ('Cálculos Renales', NOW(), NOW()),
  ('Infección Urinaria', NOW(), NOW()),
  ('Prostatitis', NOW(), NOW()),
  ('Hiperplasia Prostática', NOW(), NOW()),
  
  -- Enfermedades Autoinmunes
  ('Lupus', NOW(), NOW()),
  ('Artritis Reumatoide', NOW(), NOW()),
  ('Esclerosis Múltiple', NOW(), NOW()),
  ('Psoriasis', NOW(), NOW()),
  ('Celíacos', NOW(), NOW()),
  
  -- Enfermedades Mentales
  ('Depresión', NOW(), NOW()),
  ('Ansiedad', NOW(), NOW()),
  ('Trastorno Bipolar', NOW(), NOW()),
  ('Esquizofrenia', NOW(), NOW()),
  ('TOC', NOW(), NOW()),
  ('Estrés Postraumático', NOW(), NOW()),
  
  -- Enfermedades Oncológicas
  ('Cáncer de Mama', NOW(), NOW()),
  ('Cáncer de Próstata', NOW(), NOW()),
  ('Cáncer de Pulmón', NOW(), NOW()),
  ('Cáncer de Colon', NOW(), NOW()),
  ('Cáncer de Estómago', NOW(), NOW()),
  ('Leucemia', NOW(), NOW()),
  ('Linfoma', NOW(), NOW()),
  
  -- Enfermedades Dermatológicas
  ('Dermatitis', NOW(), NOW()),
  ('Eczema', NOW(), NOW()),
  ('Acné', NOW(), NOW()),
  ('Vitiligo', NOW(), NOW()),
  
  -- Enfermedades Oftalmológicas
  ('Cataratas', NOW(), NOW()),
  ('Glaucoma', NOW(), NOW()),
  ('Degeneración Macular', NOW(), NOW()),
  ('Retinopatía Diabética', NOW(), NOW()),
  
  -- Enfermedades Otorrinolaringológicas
  ('Sordera', NOW(), NOW()),
  ('Vértigo', NOW(), NOW()),
  ('Tinnitus', NOW(), NOW()),
  
  -- Enfermedades Hematológicas
  ('Anemia', NOW(), NOW()),
  ('Hemofilia', NOW(), NOW()),
  
  -- Enfermedades Musculoesqueléticas
  ('Hernia Discal', NOW(), NOW()),
  ('Escoliosis', NOW(), NOW()),
  ('Tendinitis', NOW(), NOW()),
  ('Túnel Carpiano', NOW(), NOW()),
  
  -- Enfermedades Infecciosas
  ('Chagas', NOW(), NOW()),
  ('VIH/SIDA', NOW(), NOW()),
  ('Dengue', NOW(), NOW()),
  ('Leishmaniasis', NOW(), NOW()),
  ('COVID-19', NOW(), NOW()),
  
  -- Otras
  ('Ninguna', NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================================
-- 14. DESTREZAS (45 registros)
-- ============================================================================
INSERT INTO destrezas (nombre, "createdAt", "updatedAt")
VALUES
  ('Carpintería', NOW(), NOW()),
  ('Mecánica', NOW(), NOW()),
  ('Electricidad', NOW(), NOW()),
  ('Plomería', NOW(), NOW()),
  ('Costura', NOW(), NOW()),
  ('Tejido', NOW(), NOW()),
  ('Artesanía', NOW(), NOW()),
  ('Pintura', NOW(), NOW()),
  ('Diseño Gráfico', NOW(), NOW()),
  ('Fotografía', NOW(), NOW()),
  ('Cocina', NOW(), NOW()),
  ('Repostería', NOW(), NOW()),
  ('Peluquería', NOW(), NOW()),
  ('Barbería', NOW(), NOW()),
  ('Belleza y Estética', NOW(), NOW()),
  ('Manualidades', NOW(), NOW()),
  ('Cerámica', NOW(), NOW()),
  ('Jardinería', NOW(), NOW()),
  ('Agricultura', NOW(), NOW()),
  ('Ganadería', NOW(), NOW()),
  ('Pesca', NOW(), NOW()),
  ('Albañilería', NOW(), NOW()),
  ('Soldadura', NOW(), NOW()),
  ('Herrería', NOW(), NOW()),
  ('Tapicería', NOW(), NOW()),
  ('Ebanistería', NOW(), NOW()),
  ('Zapatería', NOW(), NOW()),
  ('Sastrería', NOW(), NOW()),
  ('Bordado', NOW(), NOW()),
  ('Bisutería', NOW(), NOW()),
  ('Marroquinería', NOW(), NOW()),
  ('Panadería', NOW(), NOW()),
  ('Música', NOW(), NOW()),
  ('Canto', NOW(), NOW()),
  ('Danza', NOW(), NOW()),
  ('Teatro', NOW(), NOW()),
  ('Deportes', NOW(), NOW()),
  ('Informática', NOW(), NOW()),
  ('Reparación de Celulares', NOW(), NOW()),
  ('Reparación de Electrodomésticos', NOW(), NOW()),
  ('Conducción', NOW(), NOW()),
  ('Operación de Maquinaria', NOW(), NOW()),
  ('Masajes', NOW(), NOW()),
  ('Primeros Auxilios', NOW(), NOW()),
  ('Otra', NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================================
-- 15. HABILIDADES (20 registros)
-- ============================================================================
INSERT INTO habilidades (nombre, descripcion, created_at, updated_at)
VALUES
  ('Carpintería', 'Habilidad en Carpintería', NOW(), NOW()),
  ('Mecánica', 'Habilidad en Mecánica', NOW(), NOW()),
  ('Electricidad', 'Habilidad en Electricidad', NOW(), NOW()),
  ('Plomería', 'Habilidad en Plomería', NOW(), NOW()),
  ('Albañilería', 'Habilidad en Albañilería', NOW(), NOW()),
  ('Soldadura', 'Habilidad en Soldadura', NOW(), NOW()),
  ('Jardinería', 'Habilidad en Jardinería', NOW(), NOW()),
  ('Mecánica Automotriz', 'Habilidad en Mecánica Automotriz', NOW(), NOW()),
  ('Programación', 'Habilidad en Programación', NOW(), NOW()),
  ('Diseño Gráfico', 'Habilidad en Diseño Gráfico', NOW(), NOW()),
  ('Fotografía', 'Habilidad en Fotografía', NOW(), NOW()),
  ('Cocina', 'Habilidad en Cocina', NOW(), NOW()),
  ('Repostería', 'Habilidad en Repostería', NOW(), NOW()),
  ('Peluquería', 'Habilidad en Peluquería', NOW(), NOW()),
  ('Costura', 'Habilidad en Costura', NOW(), NOW()),
  ('Artesanía', 'Habilidad en Artesanía', NOW(), NOW()),
  ('Música', 'Habilidad en Música', NOW(), NOW()),
  ('Deportes', 'Habilidad en Deportes', NOW(), NOW()),
  ('Agricultura', 'Habilidad en Agricultura', NOW(), NOW()),
  ('Ganadería', 'Habilidad en Ganadería', NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================
-- Descomentar para ver el conteo de registros insertados

-- SELECT 'tipos_identificacion' as tabla, COUNT(*) as registros FROM tipos_identificacion
-- UNION ALL SELECT 'sexos', COUNT(*) FROM sexos
-- UNION ALL SELECT 'estados_civiles', COUNT(*) FROM estados_civiles
-- UNION ALL SELECT 'situaciones_civiles', COUNT(*) FROM situaciones_civiles
-- UNION ALL SELECT 'tipos_vivienda', COUNT(*) FROM tipos_vivienda
-- UNION ALL SELECT 'sistemas_acueducto', COUNT(*) FROM sistemas_acueducto
-- UNION ALL SELECT 'tipos_aguas_residuales', COUNT(*) FROM tipos_aguas_residuales
-- UNION ALL SELECT 'tipos_disposicion_basura', COUNT(*) FROM tipos_disposicion_basura
-- UNION ALL SELECT 'profesiones', COUNT(*) FROM profesiones
-- UNION ALL SELECT 'parentescos', COUNT(*) FROM parentescos
-- UNION ALL SELECT 'niveles_educativos', COUNT(*) FROM niveles_educativos
-- UNION ALL SELECT 'comunidades_culturales', COUNT(*) FROM comunidades_culturales
-- UNION ALL SELECT 'enfermedades', COUNT(*) FROM enfermedades
-- UNION ALL SELECT 'destrezas', COUNT(*) FROM destrezas
-- UNION ALL SELECT 'habilidades', COUNT(*) FROM habilidades
-- ORDER BY registros DESC;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
-- Total estimado de registros: 298
-- - tipos_identificacion: 5
-- - sexos: 3
-- - estados_civiles: 6
-- - situaciones_civiles: 8
-- - tipos_vivienda: 6
-- - sistemas_acueducto: 6
-- - tipos_aguas_residuales: 5
-- - tipos_disposicion_basura: 7
-- - profesiones: 20
-- - parentescos: 46
-- - niveles_educativos: 14
-- - comunidades_culturales: 18
-- - enfermedades: 89
-- - destrezas: 45
-- - habilidades: 20
-- ============================================================================
