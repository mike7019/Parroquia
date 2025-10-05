# Fix: Asociación de Personas con Parroquias

## 🐛 Problema Identificado

Las personas creadas mediante encuestas **NO estaban heredando el `id_parroquia`** de sus familias, causando que:

1. Todas las personas tenían `id_parroquia = NULL`
2. Los consolidados de salud por parroquia devolvían **0 personas** incluso cuando existían
3. No era posible filtrar personas por parroquia en los reportes

### Estado ANTES del Fix

```sql
SELECT COUNT(*) FROM personas WHERE id_parroquia IS NULL;
-- Resultado: 15 personas sin parroquia

SELECT COUNT(*) FROM familias WHERE id_parroquia IS NOT NULL;
-- Resultado: 6 familias CON parroquia asignada
```

## 🔍 Causa Raíz

En `src/controllers/encuestaController.js`, la función `procesarMiembrosFamilia` creaba el objeto `personaData` **SIN incluir `id_parroquia`**:

### ANTES (Código con bug)
```javascript
const personaData = {
  primer_nombre: primerNombre,
  // ... otros campos ...
  id_familia_familias: familiaId,
  id_sexo: sexoId,
  // ❌ FALTABA: id_parroquia
  estudios: miembro.estudio || null,
  // ... más campos ...
};
```

### DESPUÉS (Código corregido)
```javascript
const personaData = {
  primer_nombre: primerNombre,
  // ... otros campos ...
  id_familia_familias: familiaId,
  id_sexo: sexoId,
  // ✅ AGREGADO: Asociación geográfica
  id_parroquia: informacionGeneral.parroquia?.id ? parseInt(informacionGeneral.parroquia.id) : null,
  estudios: miembro.estudio || null,
  // ... más campos ...
};
```

## ✅ Solución Implementada

### 1. Corrección del Código (Preventivo)

**Archivo:** `src/controllers/encuestaController.js`  
**Línea:** ~248  
**Cambio:** Agregado `id_parroquia` al objeto `personaData`

```javascript
// Asociación geográfica (heredada de informacionGeneral)
id_parroquia: informacionGeneral.parroquia?.id ? parseInt(informacionGeneral.parroquia.id) : null,
```

### 2. Migración de Datos Existentes (Correctivo)

**Archivo:** `scripts/migrar-parroquia-personas.cjs`

Este script actualiza las personas existentes que tienen `id_parroquia = NULL` para que hereden el `id_parroquia` de su familia asociada.

#### Ejecución Local

```bash
# Ejecutar en la base de datos local
node scripts/migrar-parroquia-personas.cjs
```

#### Ejecución Remota

Para ejecutar en el servidor remoto (206.62.139.11):

```bash
# 1. Conectarse al servidor
ssh ubuntu@206.62.139.11

# 2. Navegar al proyecto
cd /ruta/del/proyecto

# 3. Ejecutar el script
node scripts/migrar-parroquia-personas.cjs
```

O bien, ejecutar remotamente sin SSH interactivo:

```bash
ssh ubuntu@206.62.139.11 "cd /ruta/del/proyecto && node scripts/migrar-parroquia-personas.cjs"
```

### Salida Esperada del Script

```
🔄 Iniciando migración de asociación geográfica de personas...

✅ Conexión a la base de datos establecida

📊 ESTADO ANTES DE LA MIGRACIÓN:
   - Personas sin parroquia: 15
   - Personas que pueden heredar parroquia de su familia: 15

🔧 Ejecutando actualización...
✅ Actualización completada: 15 personas actualizadas

📊 ESTADO DESPUÉS DE LA MIGRACIÓN:
   - Personas con parroquia: 15
   - Personas sin parroquia: 0

📋 MUESTRA DE PERSONAS ACTUALIZADAS (primeras 20):
────────────────────────────────────────────────────────────────────────────────
   1. Carlos García (Familia: Test García)
      📍 Parroquia: Parroquia San José

   23. Carlos García (Familia: Familia Test 1)
      📍 Parroquia: Parroquia San José

   [... más personas ...]

✅ Migración completada exitosamente

🔌 Conexión a la base de datos cerrada
```

## 📊 Verificación

### Verificar que las personas tienen parroquia asignada

```sql
SELECT 
  p.id_personas, 
  p.primer_nombre, 
  p.primer_apellido, 
  p.id_parroquia,
  pa.nombre as nombre_parroquia,
  f.apellido_familiar
FROM personas p
INNER JOIN familias f ON p.id_familia_familias = f.id_familia
LEFT JOIN parroquia pa ON p.id_parroquia = pa.id_parroquia
ORDER BY p.id_personas
LIMIT 10;
```

**Resultado esperado:**
```
 id_personas | primer_nombre | primer_apellido | id_parroquia |    nombre_parroquia    | apellido_familiar
-------------+---------------+-----------------+--------------+------------------------+-------------------
           1 | Carlos        | García          |            1 | Parroquia San José     | Test García
          23 | Carlos        | García          |            1 | Parroquia San José     | Familia Test 1
          ...
```

### Verificar endpoint de consolidado de salud

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo_electronico":"admin@parroquia.com","contrasena":"Admin123!"}'

# Obtener resumen de salud por parroquia ID 1
curl -X GET http://localhost:3000/api/personas/salud/parroquia/1 \
  -H "Authorization: Bearer <access_token>"
```

**Resultado esperado:**
```json
{
  "exito": true,
  "mensaje": "Resumen de salud obtenido exitosamente",
  "datos": {
    "nombre_parroquia": "Parroquia San José",
    "total_personas": 15,
    "con_enfermedades": 0,
    "sin_enfermedades": 15,
    // ... más estadísticas ...
  }
}
```

## 📝 Archivos Modificados

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `src/controllers/encuestaController.js` | **Modificado** | Agregado `id_parroquia` al objeto `personaData` (línea ~248) |
| `scripts/migrar-parroquia-personas.cjs` | **Nuevo** | Script de migración para actualizar personas existentes |
| `docs/fix-salud-asociacion-parroquia.md` | **Nuevo** | Esta documentación |

## ⚙️ Variables de Entorno Requeridas

El script de migración usa las variables de entorno del proyecto:

```env
DB_HOST=localhost          # o IP del servidor remoto
DB_PORT=5432
DB_NAME=parroquia_db
DB_USER=parroquia_user
DB_PASSWORD=<tu_password>
```

## 🚀 Próximos Pasos

1. ✅ Ejecutar script de migración en **base de datos local**
2. ⏳ Ejecutar script de migración en **base de datos remota (206.62.139.11)**
3. ⏳ Verificar que los consolidados de salud funcionan correctamente
4. ⏳ Hacer commit de los cambios en rama `fix-salud`
5. ⏳ Merge a `develop` y push a remoto

## 🔗 Relacionado

- Branch: `fix-salud`
- Issue original: Error "saludConsolidadoService.obtenerResumenSaludPorParroquia is not a function"
- Consolidado de salud: `/api/personas/salud/parroquia/:id`
