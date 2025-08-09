-- Script para insertar tipos de disposición de basura
INSERT INTO tipos_disposicion_basura (nombre, descripcion, created_at, updated_at) VALUES 
('Recolección Pública', 'Servicio de recolección municipal', NOW(), NOW()),
('Quema', 'Incineración de residuos', NOW(), NOW()),
('Entierro', 'Enterramiento de residuos', NOW(), NOW()),
('Río o Quebrada', 'Disposición en fuente hídrica', NOW(), NOW()),
('Campo Abierto', 'Disposición al aire libre', NOW(), NOW()),
('Reciclaje', 'Separación y reciclaje de materiales', NOW(), NOW()),
('Compostaje', 'Compostaje de residuos orgánicos', NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- Script para insertar profesiones
INSERT INTO profesiones (nombre, descripcion, created_at, updated_at) VALUES 
('Agricultor', 'Persona dedicada a la agricultura', NOW(), NOW()),
('Ganadero', 'Persona dedicada a la ganadería', NOW(), NOW()),
('Comerciante', 'Persona dedicada al comercio', NOW(), NOW()),
('Docente', 'Profesional de la educación', NOW(), NOW()),
('Enfermero/a', 'Profesional de la salud', NOW(), NOW()),
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
('Trabajador Independiente', 'Trabajador por cuenta propia', NOW(), NOW()),
('Técnico en Sistemas', 'Profesional en tecnología', NOW(), NOW()),
('Vendedor', 'Persona dedicada a las ventas', NOW(), NOW()),
('Otros', 'Otras profesiones no especificadas', NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- Script para insertar destrezas
INSERT INTO destrezas (nombre, descripcion, created_at, updated_at) VALUES 
('Manualidades', 'Habilidades para trabajos manuales y artesanías', NOW(), NOW()),
('Cocina', 'Habilidades culinarias y preparación de alimentos', NOW(), NOW()),
('Costura', 'Habilidades para coser y confeccionar', NOW(), NOW()),
('Carpintería', 'Trabajos en madera y construcción', NOW(), NOW()),
('Agricultura', 'Conocimientos en cultivos y agricultura', NOW(), NOW()),
('Ganadería', 'Manejo de ganado y animales', NOW(), NOW()),
('Mecánica', 'Reparación de vehículos y maquinaria', NOW(), NOW()),
('Electricidad', 'Instalaciones y reparaciones eléctricas', NOW(), NOW()),
('Plomería', 'Instalaciones y reparaciones de agua', NOW(), NOW()),
('Música', 'Habilidades musicales e instrumentos', NOW(), NOW()),
('Deportes', 'Habilidades deportivas y recreativas', NOW(), NOW()),
('Tecnología', 'Conocimientos en computación y tecnología', NOW(), NOW()),
('Liderazgo', 'Habilidades de liderazgo y organización', NOW(), NOW()),
('Comunicación', 'Habilidades de comunicación y oratoria', NOW(), NOW()),
('Primeros Auxilios', 'Conocimientos básicos de salud y primeros auxilios', NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;
