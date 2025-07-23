import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

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

async function runMigrations() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida exitosamente.');

    // Create SequelizeMeta table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        "name" VARCHAR(255) NOT NULL,
        PRIMARY KEY ("name")
      );
    `);

    const migrationsDir = join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    console.log(`📁 Encontradas ${migrationFiles.length} migraciones`);

    for (const file of migrationFiles) {
      // Check if migration already executed
      const [results] = await sequelize.query(
        'SELECT name FROM "SequelizeMeta" WHERE name = ?',
        { replacements: [file] }
      );

      if (results.length > 0) {
        console.log(`⏭️  Migración ya ejecutada: ${file}`);
        continue;
      }

      console.log(`🚀 Ejecutando migración: ${file}`);

      try {
        // Read and execute migration file content manually
        const migrationPath = join(migrationsDir, file);
        const migrationContent = fs.readFileSync(migrationPath, 'utf8');
        
        // Execute the migration based on the file content
        if (file.includes('create-base-catalog-tables')) {
          await createBaseCatalogTables();
        } else if (file.includes('create-main-entities')) {
          await createMainEntities();
        } else if (file.includes('create-additional-tables')) {
          await createAdditionalTables();
        } else if (file.includes('create-celebration-and-event-tables')) {
          await createCelebrationTables();
        } else if (file.includes('add-missing-fields-to-personas')) {
          await addMissingFieldsToPersonas();
        } else if (file.includes('create-relationship-tables')) {
          await createRelationshipTables();
        } else if (file.includes('create-celebration-relationship-tables')) {
          await createCelebrationRelationshipTables();
        } else if (file.includes('add-geographic-relationships')) {
          await addGeographicRelationships();
        }

        // Mark migration as completed
        await sequelize.query(
          'INSERT INTO "SequelizeMeta" (name) VALUES (?)',
          { replacements: [file] }
        );

        console.log(`✅ Migración completada: ${file}`);
      } catch (error) {
        console.error(`❌ Error en migración ${file}:`, error.message);
        throw error;
      }
    }

    console.log('🎉 Todas las migraciones ejecutadas exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Migration functions
async function createBaseCatalogTables() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "TipoIdentificacion" (
      "id" SERIAL PRIMARY KEY,
      "nombre" VARCHAR(50) NOT NULL UNIQUE,
      "codigo" VARCHAR(10) NOT NULL UNIQUE,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "Sexo" (
      "id" SERIAL PRIMARY KEY,
      "nombre" VARCHAR(20) NOT NULL UNIQUE,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "EstadoCivil" (
      "id" SERIAL PRIMARY KEY,
      "nombre" VARCHAR(30) NOT NULL UNIQUE,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "NivelesEducativos" (
      "id" SERIAL PRIMARY KEY,
      "nombre" VARCHAR(50) NOT NULL UNIQUE,
      "orden" INTEGER NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "Destrezas" (
      "id" SERIAL PRIMARY KEY,
      "nombre" VARCHAR(100) NOT NULL UNIQUE,
      "descripcion" TEXT,
      "categoria" VARCHAR(50),
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "ComunidadesCulturales" (
      "id" SERIAL PRIMARY KEY,
      "nombre" VARCHAR(100) NOT NULL UNIQUE,
      "descripcion" TEXT,
      "region" VARCHAR(50),
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "Parentesco" (
      "id" SERIAL PRIMARY KEY,
      "nombre" VARCHAR(30) NOT NULL UNIQUE,
      "descripcion" TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);
}

async function createMainEntities() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "Municipios" (
      "id" SERIAL PRIMARY KEY,
      "nombre" VARCHAR(100) NOT NULL,
      "codigo_dane" VARCHAR(10) UNIQUE,
      "departamento" VARCHAR(50) NOT NULL,
      "region" VARCHAR(50),
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "Veredas" (
      "id" SERIAL PRIMARY KEY,
      "nombre" VARCHAR(100) NOT NULL,
      "municipio_id" INTEGER REFERENCES "Municipios"("id") ON DELETE CASCADE,
      "codigo" VARCHAR(20),
      "descripcion" TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "Parroquia" (
      "id" SERIAL PRIMARY KEY,
      "nombre" VARCHAR(100) NOT NULL,
      "direccion" TEXT,
      "telefono" VARCHAR(20),
      "email" VARCHAR(100),
      "parroco" VARCHAR(100),
      "municipio_id" INTEGER REFERENCES "Municipios"("id"),
      "fundacion" DATE,
      "descripcion" TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "Familia" (
      "id" SERIAL PRIMARY KEY,
      "nombre_familia" VARCHAR(100) NOT NULL,
      "direccion" TEXT,
      "telefono" VARCHAR(20),
      "vereda_id" INTEGER REFERENCES "Veredas"("id"),
      "parroquia_id" INTEGER REFERENCES "Parroquia"("id"),
      "observaciones" TEXT,
      "fecha_registro" DATE DEFAULT CURRENT_DATE,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "Persona" (
      "id" SERIAL PRIMARY KEY,
      "nombres" VARCHAR(100) NOT NULL,
      "apellidos" VARCHAR(100) NOT NULL,
      "tipo_identificacion_id" INTEGER REFERENCES "TipoIdentificacion"("id"),
      "numero_identificacion" VARCHAR(20) UNIQUE,
      "fecha_nacimiento" DATE,
      "lugar_nacimiento" VARCHAR(100),
      "sexo_id" INTEGER REFERENCES "Sexo"("id"),
      "estado_civil_id" INTEGER REFERENCES "EstadoCivil"("id"),
      "nivel_educativo_id" INTEGER REFERENCES "NivelesEducativos"("id"),
      "ocupacion" VARCHAR(100),
      "telefono" VARCHAR(20),
      "email" VARCHAR(100),
      "direccion" TEXT,
      "vereda_id" INTEGER REFERENCES "Veredas"("id"),
      "familia_id" INTEGER REFERENCES "Familia"("id"),
      "comunidad_cultural_id" INTEGER REFERENCES "ComunidadesCulturales"("id"),
      "observaciones" TEXT,
      "fecha_registro" DATE DEFAULT CURRENT_DATE,
      "activo" BOOLEAN DEFAULT true,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);
}

async function createAdditionalTables() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "PersonaDestreza" (
      "id" SERIAL PRIMARY KEY,
      "persona_id" INTEGER REFERENCES "Persona"("id") ON DELETE CASCADE,
      "destreza_id" INTEGER REFERENCES "Destrezas"("id") ON DELETE CASCADE,
      "nivel_experiencia" VARCHAR(20) DEFAULT 'Básico',
      "fecha_adquisicion" DATE,
      "observaciones" TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      UNIQUE("persona_id", "destreza_id")
    );

    CREATE TABLE IF NOT EXISTS "FamiliaParentesco" (
      "id" SERIAL PRIMARY KEY,
      "familia_id" INTEGER REFERENCES "Familia"("id") ON DELETE CASCADE,
      "persona_id" INTEGER REFERENCES "Persona"("id") ON DELETE CASCADE,
      "parentesco_id" INTEGER REFERENCES "Parentesco"("id"),
      "es_jefe_familia" BOOLEAN DEFAULT false,
      "fecha_vinculacion" DATE DEFAULT CURRENT_DATE,
      "observaciones" TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      UNIQUE("familia_id", "persona_id")
    );
  `);
}

async function createCelebrationTables() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "TiposCelebracion" (
      "id" SERIAL PRIMARY KEY,
      "nombre" VARCHAR(50) NOT NULL UNIQUE,
      "descripcion" TEXT,
      "categoria" VARCHAR(30),
      "requiere_preparacion" BOOLEAN DEFAULT false,
      "duracion_preparacion_dias" INTEGER,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "Celebraciones" (
      "id" SERIAL PRIMARY KEY,
      "tipo_celebracion_id" INTEGER REFERENCES "TiposCelebracion"("id"),
      "persona_principal_id" INTEGER REFERENCES "Persona"("id"),
      "fecha_celebracion" DATE NOT NULL,
      "lugar" VARCHAR(200),
      "parroco_celebrante" VARCHAR(100),
      "observaciones" TEXT,
      "estado" VARCHAR(20) DEFAULT 'Programada',
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "EventosParroquiales" (
      "id" SERIAL PRIMARY KEY,
      "nombre" VARCHAR(100) NOT NULL,
      "descripcion" TEXT,
      "fecha_inicio" DATE NOT NULL,
      "fecha_fin" DATE,
      "lugar" VARCHAR(200),
      "responsable" VARCHAR(100),
      "tipo_evento" VARCHAR(50),
      "publico_objetivo" VARCHAR(100),
      "costo" DECIMAL(10,2),
      "capacidad_maxima" INTEGER,
      "estado" VARCHAR(20) DEFAULT 'Planificado',
      "parroquia_id" INTEGER REFERENCES "Parroquia"("id"),
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);
}

async function addMissingFieldsToPersonas() {
  await sequelize.query(`
    ALTER TABLE "Persona" 
    ADD COLUMN IF NOT EXISTS "profesion" VARCHAR(100),
    ADD COLUMN IF NOT EXISTS "estado_salud" VARCHAR(50),
    ADD COLUMN IF NOT EXISTS "discapacidad" TEXT,
    ADD COLUMN IF NOT EXISTS "contacto_emergencia" VARCHAR(100),
    ADD COLUMN IF NOT EXISTS "telefono_emergencia" VARCHAR(20),
    ADD COLUMN IF NOT EXISTS "fecha_bautismo" DATE,
    ADD COLUMN IF NOT EXISTS "fecha_confirmacion" DATE,
    ADD COLUMN IF NOT EXISTS "fecha_primera_comunion" DATE,
    ADD COLUMN IF NOT EXISTS "fecha_matrimonio" DATE,
    ADD COLUMN IF NOT EXISTS "padrino_bautismo" VARCHAR(200),
    ADD COLUMN IF NOT EXISTS "padrino_confirmacion" VARCHAR(200),
    ADD COLUMN IF NOT EXISTS "estado_pastoral" VARCHAR(50) DEFAULT 'Activo';
  `);
}

async function createRelationshipTables() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "ParticipacionEventos" (
      "id" SERIAL PRIMARY KEY,
      "persona_id" INTEGER REFERENCES "Persona"("id") ON DELETE CASCADE,
      "evento_id" INTEGER REFERENCES "EventosParroquiales"("id") ON DELETE CASCADE,
      "rol_participacion" VARCHAR(50) DEFAULT 'Participante',
      "fecha_inscripcion" DATE DEFAULT CURRENT_DATE,
      "confirmado" BOOLEAN DEFAULT false,
      "observaciones" TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      UNIQUE("persona_id", "evento_id")
    );

    CREATE TABLE IF NOT EXISTS "MinisteriosParroquiales" (
      "id" SERIAL PRIMARY KEY,
      "nombre" VARCHAR(100) NOT NULL UNIQUE,
      "descripcion" TEXT,
      "responsable_id" INTEGER REFERENCES "Persona"("id"),
      "fecha_creacion" DATE DEFAULT CURRENT_DATE,
      "activo" BOOLEAN DEFAULT true,
      "parroquia_id" INTEGER REFERENCES "Parroquia"("id"),
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "ParticipacionMinisterios" (
      "id" SERIAL PRIMARY KEY,
      "persona_id" INTEGER REFERENCES "Persona"("id") ON DELETE CASCADE,
      "ministerio_id" INTEGER REFERENCES "MinisteriosParroquiales"("id") ON DELETE CASCADE,
      "cargo" VARCHAR(50) DEFAULT 'Miembro',
      "fecha_inicio" DATE DEFAULT CURRENT_DATE,
      "fecha_fin" DATE,
      "activo" BOOLEAN DEFAULT true,
      "observaciones" TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      UNIQUE("persona_id", "ministerio_id", "activo") WHERE "activo" = true
    );
  `);
}

async function createCelebrationRelationshipTables() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "ParticipantesCelebracion" (
      "id" SERIAL PRIMARY KEY,
      "celebracion_id" INTEGER REFERENCES "Celebraciones"("id") ON DELETE CASCADE,
      "persona_id" INTEGER REFERENCES "Persona"("id") ON DELETE CASCADE,
      "rol" VARCHAR(50) DEFAULT 'Participante',
      "observaciones" TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      UNIQUE("celebracion_id", "persona_id")
    );

    CREATE TABLE IF NOT EXISTS "GruposParroquiales" (
      "id" SERIAL PRIMARY KEY,
      "nombre" VARCHAR(100) NOT NULL,
      "descripcion" TEXT,
      "tipo_grupo" VARCHAR(50),
      "lider_id" INTEGER REFERENCES "Persona"("id"),
      "fecha_creacion" DATE DEFAULT CURRENT_DATE,
      "dia_reunion" VARCHAR(20),
      "hora_reunion" TIME,
      "lugar_reunion" VARCHAR(200),
      "activo" BOOLEAN DEFAULT true,
      "parroquia_id" INTEGER REFERENCES "Parroquia"("id"),
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "MiembrosGrupo" (
      "id" SERIAL PRIMARY KEY,
      "grupo_id" INTEGER REFERENCES "GruposParroquiales"("id") ON DELETE CASCADE,
      "persona_id" INTEGER REFERENCES "Persona"("id") ON DELETE CASCADE,
      "fecha_ingreso" DATE DEFAULT CURRENT_DATE,
      "fecha_salida" DATE,
      "rol_grupo" VARCHAR(50) DEFAULT 'Miembro',
      "activo" BOOLEAN DEFAULT true,
      "observaciones" TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      UNIQUE("grupo_id", "persona_id", "activo") WHERE "activo" = true
    );
  `);
}

async function addGeographicRelationships() {
  await sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_persona_vereda ON "Persona"("vereda_id");
    CREATE INDEX IF NOT EXISTS idx_persona_familia ON "Persona"("familia_id");
    CREATE INDEX IF NOT EXISTS idx_familia_vereda ON "Familia"("vereda_id");
    CREATE INDEX IF NOT EXISTS idx_familia_parroquia ON "Familia"("parroquia_id");
    CREATE INDEX IF NOT EXISTS idx_veredas_municipio ON "Veredas"("municipio_id");
    CREATE INDEX IF NOT EXISTS idx_parroquia_municipio ON "Parroquia"("municipio_id");
    CREATE INDEX IF NOT EXISTS idx_persona_identificacion ON "Persona"("numero_identificacion");
    CREATE INDEX IF NOT EXISTS idx_celebraciones_fecha ON "Celebraciones"("fecha_celebracion");
    CREATE INDEX IF NOT EXISTS idx_eventos_fecha_inicio ON "EventosParroquiales"("fecha_inicio");
  `);
}

// Run migrations
runMigrations();
