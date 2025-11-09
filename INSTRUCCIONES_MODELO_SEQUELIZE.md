# 🎯 INSTRUCCIONES DEFINITIVAS - Con Modelo Sequelize

## ✨ SOLUCIÓN USANDO SEQUELIZE (Recomendado)

Ya he creado:
- ✅ Modelo: `src/models/catalog/PersonaCelebracion.js`
- ✅ Migración: `migrations/20251108000001-create-persona-celebracion.js`
- ✅ Script ejecutor: `scripts/ejecutar-migracion-persona-celebracion.js`
- ✅ Modelo registrado en `src/models/index.js`

---

## 📋 PASOS EN TU SERVIDOR DE PRODUCCIÓN

### 1. Subir archivos al servidor

Desde tu máquina Windows (PowerShell):

```powershell
# Ir a tu proyecto
cd C:\Users\ASUS\Desktop\Parroquia

# Subir modelo
scp src/models/catalog/PersonaCelebracion.js ubuntu@206.62.139.11:~/Parroquia/src/models/catalog/

# Subir migración
scp migrations/20251108000001-create-persona-celebracion.js ubuntu@206.62.139.11:~/Parroquia/migrations/

# Subir script ejecutor
scp scripts/ejecutar-migracion-persona-celebracion.js ubuntu@206.62.139.11:~/Parroquia/scripts/

# Subir models/index.js actualizado
scp src/models/index.js ubuntu@206.62.139.11:~/Parroquia/src/models/

# Subir controlador corregido
scp src/controllers/encuestaController.js ubuntu@206.62.139.11:~/Parroquia/src/controllers/
```

### 2. Ejecutar en el servidor

```bash
# Conectar al servidor
ssh ubuntu@206.62.139.11

# Ir al proyecto
cd ~/Parroquia

# Ejecutar la migración
node scripts/ejecutar-migracion-persona-celebracion.js
```

**Output esperado:**
```
╔════════════════════════════════════════════════════════════════╗
║    MIGRACIÓN: Crear tabla persona_celebracion                 ║
╚════════════════════════════════════════════════════════════════╝

✅ Conexión a base de datos establecida

🚀 Ejecutando migración...

🎉 Creando tabla persona_celebracion...
📊 Creando índice único persona_celebracion...
📊 Creando índices de búsqueda...
✅ Tabla persona_celebracion creada exitosamente con todos los índices

📋 Verificando estructura de la tabla...
✅ Columnas creadas: [tabla con columnas]
✅ Índices creados: [tabla con índices]
✅ Constraints creados: [tabla con constraints]
🧪 Ejecutando prueba de inserción...
   ✅ Inserción de prueba exitosa
   🧹 Registro de prueba eliminado

╔════════════════════════════════════════════════════════════════╗
║          ✅ MIGRACIÓN COMPLETADA EXITOSAMENTE                  ║
╚════════════════════════════════════════════════════════════════╝
```

### 3. Reiniciar el servicio

```bash
# Con Docker
docker-compose restart api

# O con PM2
pm2 restart all

# Ver logs
docker-compose logs -f api --tail=50
# O: pm2 logs --lines 50
```

---

## ✅ VERIFICACIÓN

```bash
# Verificar que la tabla existe
docker-compose exec postgres psql -U parroquia_user -d parroquia_db -c "\d persona_celebracion"

# Verificar estructura
docker-compose exec postgres psql -U parroquia_user -d parroquia_db -c "
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'persona_celebracion' 
ORDER BY ordinal_position;"
```

---

## 🔄 CÓDIGO YA CORREGIDO

El archivo `src/controllers/encuestaController.js` ya tiene el fix aplicado:

```javascript
// ✅ CORRECTO (línea 745)
const savepointName = `sp_celebracion_v1_${personaId}_${Date.now()}`;
try {
  await sequelize.query(`SAVEPOINT ${savepointName};`, { transaction });
  // ...
```

Ya NO es esto ❌:
```javascript
// ❌ INCORRECTO
try {
  const savepointName = `sp_celebracion_v1_${personaId}_${Date.now()}`;
  // ...
```

---

## 📦 COMMIT LOCAL (después de que funcione en producción)

```powershell
cd C:\Users\ASUS\Desktop\Parroquia

git add src/models/catalog/PersonaCelebracion.js
git add migrations/20251108000001-create-persona-celebracion.js
git add scripts/ejecutar-migracion-persona-celebracion.js
git add src/models/index.js
git add src/controllers/encuestaController.js
git add src/config/swagger.js

git commit -m "feat: agregar modelo PersonaCelebracion y fix savepointName

- Crear modelo PersonaCelebracion con Sequelize
- Agregar migración 20251108000001-create-persona-celebracion
- Registrar modelo en index.js
- Fix: mover savepointName fuera del try-catch (línea 745)
- Actualizar Swagger con JSON v2.0 funcional
- Script automatizado para ejecutar migración con verificaciones

Resuelve:
- Error: relation 'persona_celebracion' does not exist
- Error: savepointName is not defined
"

git push origin develop
```

---

## 🎉 RESULTADO FINAL ESPERADO

Después de aplicar todos los cambios:

```
✅ Persona creada exitosamente: Raquel (ID: 52)
  ✅ Guardando celebración v1.0 en tabla intermedia...
    ✅ Celebración guardada: Cumpleaños - 12/11
✅ Miembro de familia procesado correctamente
✅ Encuesta creada exitosamente
```

**¡Sin errores!** 🎊

---

## 💡 VENTAJAS DE USAR EL MODELO

✅ **Consistencia:** Sequelize maneja la sincronización  
✅ **Validaciones:** Automáticas en el modelo  
✅ **Asociaciones:** Fácil agregar relaciones después  
✅ **Migraciones:** Control de versiones de la base de datos  
✅ **Rollback:** Fácil revertir cambios con `down()`  
✅ **Testing:** Mejor para pruebas unitarias  

---

## 🆘 TROUBLESHOOTING

### Si la migración falla:

```bash
# Ver error detallado
node scripts/ejecutar-migracion-persona-celebracion.js 2>&1 | tee migration-log.txt

# Verificar permisos
docker-compose exec postgres psql -U parroquia_user -d parroquia_db -c "
SELECT has_table_privilege('parroquia_user', 'personas', 'SELECT');"

# Verificar conexión
docker-compose exec postgres psql -U parroquia_user -d parroquia_db -c "\dt"
```

### Si el modelo no se carga:

```bash
# Verificar sintaxis
node -c src/models/catalog/PersonaCelebracion.js
node -c migrations/20251108000001-create-persona-celebracion.js
node -c src/models/index.js
```

---

## 📞 SIGUIENTE PASO

Una vez que funcione en producción:
1. ✅ Hacer commit de todos los cambios
2. ✅ Push a develop
3. ✅ Actualizar documentación si es necesario
4. ✅ Probar encuesta completa en producción

**¡Todo listo para funcionar!** 🚀
