# 📊 Guía para Cargar Datos de Catálogos

Este documento explica cómo cargar los datos de catálogos (datos maestros) en la base de datos del proyecto Parroquia.

## 🎯 Datos de Catálogos Incluidos

El sistema incluye los siguientes catálogos base:

### **Catálogos Básicos:**
- **Tipos de Identificación**: CC, TI, CE, Pasaporte
- **Estado Civil**: Soltero, Casado, Divorciado, Viudo, Unión Libre
- **Sexo**: Masculino, Femenino, Otro
- **Tipos de Vivienda**: Casa, Apartamento, Finca, Habitación, Otro
- **Parroquias**: San José, Nuestra Señora de Fátima, San Pedro

### **Catálogos de Relaciones:**
- **Parentesco**: Padre, Madre, Hijo, Hija, Hermano, etc.
- **Niveles Educativos**: Desde "Sin educación" hasta "Doctorado"
- **Comunidades Culturales**: Indígena, Afrocolombiano, Raizal, etc.

### **Catálogos de Servicios:**
- **Sistemas de Acueducto**: Municipal, Pozo propio, Agua lluvia, etc.
- **Disposición de Basura**: Recolección municipal, Quema, Reciclaje, etc.
- **Aguas Residuales**: Alcantarillado, Pozo séptico, Letrina, etc.

### **Catálogos Organizacionales:**
- **Roles**: Administrador, Pastor, Secretario, Catequista, etc.
- **Áreas de Liderazgo**: Pastoral, Liturgia, Catequesis, Social, etc.
- **Destrezas**: Liderazgo, Comunicación, Organización, Música, etc.

### **Catálogos Geográficos:**
- **Municipios**: Principales ciudades de Colombia
- **Veredas**: Centro, Norte, Sur, Oriente, Occidente
- **Sectores**: Por cada vereda

### **Catálogos de Eventos:**
- **Celebraciones Personales**: Cumpleaños, Bautismo, Primera Comunión, etc.
- **Celebraciones Familiares**: Aniversarios, Navidad, Año Nuevo, etc.
- **Celebraciones Paternas**: Día del Padre, Día de la Madre, etc.

### **Catálogos de Salud:**
- **Enfermedades**: Hipertensión, Diabetes, Asma, Artritis, etc.
- **Necesidades de Enfermos**: Comunión, medicamentos, terapias, etc.

### **Otros Catálogos:**
- **Tallas de Vestimenta**: XS a XXL, Tallas numéricas 6-16

## 🚀 Métodos para Cargar los Datos

### **Método 1: Script Especializado (Recomendado)**

```bash
# Cargar solo datos de catálogos
node loadCatalogData.js

# O usando npm
npm run db:load-catalogs
```

### **Método 2: Usando Sequelize CLI (Si las tablas ya existen)**

```bash
# Ejecutar todos los seeders
npx sequelize-cli db:seed:all

# O usando npm
npm run db:seed
```

### **Método 3: Script migrate.js (Corregido)**

```bash
# Ejecutar seeders usando el script migrate
node migrate.js seed
```

### **Método 4: Script completo de setup**

```bash
# Migrar tablas y cargar datos
npm run db:setup
```

## ⚙️ Prerequisitos

### **1. Configuración de Base de Datos**

Asegúrate de tener PostgreSQL funcionando y crea un archivo `.env` basado en `.env.example`:

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita las variables según tu configuración
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parroquia_db
DB_USER=parroquia_user
DB_PASSWORD=admin
```

### **2. Base de Datos y Tablas**

Las tablas deben existir antes de cargar los datos. Si no existen:

```bash
# Crear base de datos
npm run db:create

# Ejecutar migraciones (crear tablas)
npm run db:migrate
```

## 🔧 Solución de Problemas

### **Error: "relation does not exist"**
Las tablas no existen. Ejecuta primero las migraciones:
```bash
npm run db:migrate
```

### **Error: "password authentication failed"**
Verifica tu configuración de base de datos en `.env` o `config/config.json`.

### **Error: "module is not defined" con Sequelize CLI**
El proyecto usa ES Modules. Usa el script especializado:
```bash
node loadCatalogData.js
```

## 📁 Ubicación de los Archivos

- **Script especializado**: `loadCatalogData.js`
- **Seeder original**: `seeders/20250717021741-demo-catalog-data.js`
- **Configuración DB**: `config/config.json`
- **Variables de entorno**: `.env`

## ✅ Verificación

Para verificar que los datos se cargaron correctamente, puedes ejecutar consultas SQL:

```sql
-- Verificar tipos de identificación
SELECT * FROM tipo_identificacion;

-- Verificar estados civiles
SELECT * FROM estado_civil;

-- Verificar niveles educativos
SELECT * FROM niveles_educativos ORDER BY orden_nivel;
```

## 🎯 Próximos Pasos

Una vez cargados los catálogos, puedes:

1. **Cargar datos de ejemplo**: Usar `seeders/20250717025000-sample-family-data.js`
2. **Iniciar la aplicación**: `npm start` o `npm run dev`
3. **Usar la API**: Los catálogos estarán disponibles para endpoints

## 📞 Soporte

Si tienes problemas cargando los datos, verifica:

1. ✅ PostgreSQL está funcionando
2. ✅ Base de datos existe
3. ✅ Tablas fueron creadas (migraciones ejecutadas)
4. ✅ Configuración de conexión es correcta
5. ✅ Permisos de usuario de base de datos
