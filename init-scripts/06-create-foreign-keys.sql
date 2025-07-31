-- Foreign key constraints for all tables
-- This script creates the relationships between tables

-- Log that we're creating foreign keys
DO $$
BEGIN
    RAISE NOTICE 'Creating foreign key constraints...';
END $$;

-- object: personas_pk1 | type: CONSTRAINT --
-- ALTER TABLE public.personas DROP CONSTRAINT IF EXISTS personas_pk1 CASCADE;
ALTER TABLE public.personas ADD CONSTRAINT personas_pk1 FOREIGN KEY (id_familia_familias)
REFERENCES public.familias (id_familia) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: personas_pk2 | type: CONSTRAINT --
-- ALTER TABLE public.personas DROP CONSTRAINT IF EXISTS personas_pk2 CASCADE;
ALTER TABLE public.personas ADD CONSTRAINT personas_pk2 FOREIGN KEY (id_tipo_identificacion_tipo_identificacion)
REFERENCES public.tipo_identificacion (id_tipo_identificacion) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: personas_pk3 | type: CONSTRAINT --
-- ALTER TABLE public.personas DROP CONSTRAINT IF EXISTS personas_pk3 CASCADE;
ALTER TABLE public.personas ADD CONSTRAINT personas_pk3 FOREIGN KEY (id_estado_civil_estado_civil)
REFERENCES public.estado_civil (id_estado_civil) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: parentesco_pk1 | type: CONSTRAINT --
-- ALTER TABLE public.parentesco DROP CONSTRAINT IF EXISTS parentesco_pk1 CASCADE;
ALTER TABLE public.parentesco ADD CONSTRAINT parentesco_pk1 FOREIGN KEY (id_personas_personas)
REFERENCES public.personas (id_personas) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: parentesco_uq | type: CONSTRAINT --
-- ALTER TABLE public.parentesco DROP CONSTRAINT IF EXISTS parentesco_uq CASCADE;
ALTER TABLE public.parentesco ADD CONSTRAINT parentesco_uq UNIQUE (id_personas_personas);
-- ddl-end --

-- object: liderazgos_pk1 | type: CONSTRAINT --
-- ALTER TABLE public.liderazgos DROP CONSTRAINT IF EXISTS liderazgos_pk1 CASCADE;
ALTER TABLE public.liderazgos ADD CONSTRAINT liderazgos_pk1 FOREIGN KEY (id_personas_personas)
REFERENCES public.personas (id_personas) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: liderazgos_pk2 | type: CONSTRAINT --
-- ALTER TABLE public.liderazgos DROP CONSTRAINT IF EXISTS liderazgos_pk2 CASCADE;
ALTER TABLE public.liderazgos ADD CONSTRAINT liderazgos_pk2 FOREIGN KEY (id_areas_liderazgo_areas_liderazgo)
REFERENCES public.areas_liderazgo (id_areas_liderazgo) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: tipo_viviendas_pk | type: CONSTRAINT --
-- ALTER TABLE public.tipo_viviendas DROP CONSTRAINT IF EXISTS tipo_viviendas_pk CASCADE;
ALTER TABLE public.tipo_viviendas ADD CONSTRAINT tipo_viviendas_pk FOREIGN KEY (id_familia_familias)
REFERENCES public.familias (id_familia) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: enfermedades_persona_pk1 | type: CONSTRAINT --
-- ALTER TABLE public.enfermedades_persona DROP CONSTRAINT IF EXISTS enfermedades_persona_pk1 CASCADE;
ALTER TABLE public.enfermedades_persona ADD CONSTRAINT enfermedades_persona_pk1 FOREIGN KEY (id_personas_personas)
REFERENCES public.personas (id_personas) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: enfermedades_persona_pk2 | type: CONSTRAINT --
-- ALTER TABLE public.enfermedades_persona DROP CONSTRAINT IF EXISTS enfermedades_persona_pk2 CASCADE;
ALTER TABLE public.enfermedades_persona ADD CONSTRAINT enfermedades_persona_pk2 FOREIGN KEY (id_enfermedades_enfermedades)
REFERENCES public.enfermedades (id_enfermedades) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: celebraciones_familia_pk1 | type: CONSTRAINT --
-- ALTER TABLE public.celebraciones_familia DROP CONSTRAINT IF EXISTS celebraciones_familia_pk1 CASCADE;
ALTER TABLE public.celebraciones_familia ADD CONSTRAINT celebraciones_familia_pk1 FOREIGN KEY (id_familia_familias)
REFERENCES public.familias (id_familia) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: celebraciones_personales_pk1 | type: CONSTRAINT --
-- ALTER TABLE public.celebraciones_personales DROP CONSTRAINT IF EXISTS celebraciones_personales_pk1 CASCADE;
ALTER TABLE public.celebraciones_personales ADD CONSTRAINT celebraciones_personales_pk1 FOREIGN KEY (id_personas_personas)
REFERENCES public.personas (id_personas) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: difuntos_familia_pk1 | type: CONSTRAINT --
-- ALTER TABLE public.difuntos_familia DROP CONSTRAINT IF EXISTS difuntos_familia_pk1 CASCADE;
ALTER TABLE public.difuntos_familia ADD CONSTRAINT difuntos_familia_pk1 FOREIGN KEY (id_familia_familias)
REFERENCES public.familias (id_familia) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: celebraciones_padre_madre_pk1 | type: CONSTRAINT --
-- ALTER TABLE public.celebraciones_padre_madre DROP CONSTRAINT IF EXISTS celebraciones_padre_madre_pk1 CASCADE;
ALTER TABLE public.celebraciones_padre_madre ADD CONSTRAINT celebraciones_padre_madre_pk1 FOREIGN KEY (id_parentesco_parentesco)
REFERENCES public.parentesco (id_parentesco) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: personas_pk4 | type: CONSTRAINT --
-- ALTER TABLE public.personas DROP CONSTRAINT IF EXISTS personas_pk4 CASCADE;
ALTER TABLE public.personas ADD CONSTRAINT personas_pk4 FOREIGN KEY (id_parroquia_parroquia)
REFERENCES public.parroquia (id_parroquia) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: personas_fk | type: CONSTRAINT --
-- ALTER TABLE public.persona_destreza DROP CONSTRAINT IF EXISTS personas_fk CASCADE;
ALTER TABLE public.persona_destreza ADD CONSTRAINT personas_fk FOREIGN KEY (id_personas_personas)
REFERENCES public.personas (id_personas) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: destrezas_fk | type: CONSTRAINT --
-- ALTER TABLE public.persona_destreza DROP CONSTRAINT IF EXISTS destrezas_fk CASCADE;
ALTER TABLE public.persona_destreza ADD CONSTRAINT destrezas_fk FOREIGN KEY (id_destrezas_destrezas)
REFERENCES public.destrezas (id_destrezas) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: familias_fk | type: CONSTRAINT --
-- ALTER TABLE public.sistemas_acueducto DROP CONSTRAINT IF EXISTS familias_fk CASCADE;
ALTER TABLE public.sistemas_acueducto ADD CONSTRAINT familias_fk FOREIGN KEY (id_familia_familias)
REFERENCES public.familias (id_familia) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: familias_fk_aguas | type: CONSTRAINT --
-- ALTER TABLE public.tipos_aguas_residuales DROP CONSTRAINT IF EXISTS familias_fk_aguas CASCADE;
ALTER TABLE public.tipos_aguas_residuales ADD CONSTRAINT familias_fk_aguas FOREIGN KEY (id_familia_familias)
REFERENCES public.familias (id_familia) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: familias_fk_parroquias | type: CONSTRAINT --
-- ALTER TABLE public.parroquias DROP CONSTRAINT IF EXISTS familias_fk_parroquias CASCADE;
ALTER TABLE public.parroquias ADD CONSTRAINT familias_fk_parroquias FOREIGN KEY (id_familia_familias)
REFERENCES public.familias (id_familia) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: personas_fk_educacion | type: CONSTRAINT --
-- ALTER TABLE public.niveles_educativos DROP CONSTRAINT IF EXISTS personas_fk_educacion CASCADE;
ALTER TABLE public.niveles_educativos ADD CONSTRAINT personas_fk_educacion FOREIGN KEY (id_personas_personas)
REFERENCES public.personas (id_personas) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: veredas_fk | type: CONSTRAINT --
-- ALTER TABLE public.familias DROP CONSTRAINT IF EXISTS veredas_fk CASCADE;
ALTER TABLE public.familias ADD CONSTRAINT veredas_fk FOREIGN KEY (id_vereda_veredas)
REFERENCES public.veredas (id_vereda) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: municipios_fk | type: CONSTRAINT --
-- ALTER TABLE public.veredas DROP CONSTRAINT IF EXISTS municipios_fk CASCADE;
ALTER TABLE public.veredas ADD CONSTRAINT municipios_fk FOREIGN KEY (id_municipio_municipios)
REFERENCES public.municipios (id_municipio) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: sexo_fk | type: CONSTRAINT --
-- ALTER TABLE public.personas DROP CONSTRAINT IF EXISTS sexo_fk CASCADE;
ALTER TABLE public.personas ADD CONSTRAINT sexo_fk FOREIGN KEY (id_sexo_sexo)
REFERENCES public.sexo (id_sexo) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: familias_fk_basura | type: CONSTRAINT --
-- ALTER TABLE public.tipos_disposicion_basura DROP CONSTRAINT IF EXISTS familias_fk_basura CASCADE;
ALTER TABLE public.tipos_disposicion_basura ADD CONSTRAINT familias_fk_basura FOREIGN KEY (id_familia_familias)
REFERENCES public.familias (id_familia) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: comunidades_culturales_fk | type: CONSTRAINT --
-- ALTER TABLE public.personas DROP CONSTRAINT IF EXISTS comunidades_culturales_fk CASCADE;
ALTER TABLE public.personas ADD CONSTRAINT comunidades_culturales_fk FOREIGN KEY (id_comunidades_culturales_comunidades_culturales)
REFERENCES public.comunidades_culturales (id_comunidades_culturales) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: sector_fk | type: CONSTRAINT --
-- ALTER TABLE public.veredas DROP CONSTRAINT IF EXISTS sector_fk CASCADE;
ALTER TABLE public.veredas ADD CONSTRAINT sector_fk FOREIGN KEY (id_sector_sector)
REFERENCES public.sector (id_sector) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: personas_fk_necesidades | type: CONSTRAINT --
-- ALTER TABLE public.necesidades_enfermo DROP CONSTRAINT IF EXISTS personas_fk_necesidades CASCADE;
ALTER TABLE public.necesidades_enfermo ADD CONSTRAINT personas_fk_necesidades FOREIGN KEY (id_personas_personas)
REFERENCES public.personas (id_personas) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: personas_fk_talla | type: CONSTRAINT --
-- ALTER TABLE public.talla_vestimenta DROP CONSTRAINT IF EXISTS personas_fk_talla CASCADE;
ALTER TABLE public.talla_vestimenta ADD CONSTRAINT personas_fk_talla FOREIGN KEY (id_personas_personas)
REFERENCES public.personas (id_personas) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: usuarios_roles_pk | type: CONSTRAINT --
-- ALTER TABLE public.usuarios_roles DROP CONSTRAINT IF EXISTS usuarios_roles_pk CASCADE;
ALTER TABLE public.usuarios_roles ADD CONSTRAINT usuarios_roles_pk FOREIGN KEY (id_usuarios)
REFERENCES public.usuarios (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: usuarios_roles_pk1 | type: CONSTRAINT --
-- ALTER TABLE public.usuarios_roles DROP CONSTRAINT IF EXISTS usuarios_roles_pk1 CASCADE;
ALTER TABLE public.usuarios_roles ADD CONSTRAINT usuarios_roles_pk1 FOREIGN KEY (id_roles)
REFERENCES public.roles (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Foreign key constraints created successfully!';
END $$;
