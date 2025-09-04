# 📖 GESTIÓN DE SCRIPTS NPM - DOCUMENTACIÓN COMPLETA

## 🎯 Resumen de Optimización

### Scripts Originales vs Optimizados

- **Scripts originales**: 56 comandos
- **Scripts optimizados**: 18 comandos
- **Reducción**: 68% (38 scripts eliminados)
- **Eficiencia**: Solo scripts esenciales para producción y desarrollo

### 🏗️ Estructura Optimizada

#### 🚀 Scripts de Ejecución (2)

```bash
npm start           # Producción
npm run dev         # Desarrollo
```

#### 🗄️ Scripts de Base de Datos (4)

```bash
npm run db:sync           # Sincronización básica
npm run db:sync:alter     # Sincronización con alteraciones
npm run db:sync:force     # Sincronización forzada
npm run db:check          # Verificar conexión
```

#### 🌱 Scripts de Seeders (2)

```bash
npm run db:seed:config    # Datos de configuración
npm run db:seed:complete  # Carga completa de datos
```

#### ⚡ Scripts de PM2 (5)

```bash
npm run pm2:start         # Iniciar aplicación
npm run pm2:stop          # Detener aplicación
npm run pm2:restart       # Reiniciar aplicación
npm run pm2:logs          # Ver logs
npm run pm2:status        # Estado del proceso
```

#### 🐳 Scripts de Docker (3)

```bash
npm run docker:dev        # Desarrollo con Docker
npm run docker:db         # Solo base de datos
npm run docker:down       # Detener contenedores
```

#### 🛠️ Scripts de Utilidades (2)

```bash
npm run docs:generate     # Generar documentación
npm run admin:create      # Crear usuario administrador
```

## 🐧 Secuencias para Linux

### 📋 Escenarios Automatizados

1. **Setup Inicial**: Instalación completa en servidor nuevo
2. **Desarrollo**: Ejecución en modo desarrollo
3. **Producción PM2**: Despliegue con PM2
4. **Producción Docker**: Despliegue con Docker
5. **Mantenimiento DB**: Actualización de base de datos
6. **Actualización Código**: Deploy de nuevas versiones
7. **Logs Monitoreo**: Supervisión del sistema
8. **Backup Restauración**: Respaldo y recuperación

### 🎮 Uso del Gestor Linux

```bash
cd linux-scripts
chmod +x *.sh
./gestor.sh
```

## 🛠️ Scripts de Corrección de Errores

### Reset Completo de Base de Datos

**Problema**: Inconsistencias en estructura de tablas, errores de sincronización

**Archivo**: `reset-database.js`

**Uso**:
```bash
node reset-database.js
```

**⚠️ ADVERTENCIA**: Elimina TODAS las tablas y datos

**Funcionalidad**:
- Lista todas las tablas existentes
- Elimina restricciones de foreign keys
- Elimina todas las tablas en orden seguro
- Verifica eliminación completa
- Proporciona pasos siguientes

**Flujo recomendado después del reset**:
```bash
# 1. Reset completo
node reset-database.js

# 2. Sincronizar estructura
npm run db:sync

# 3. Cargar datos básicos
npm run db:seed:config

# 4. Crear usuario admin
npm run admin:create
```

### Corrección de Estructura de Municipios

**Problema**: Error `column "codigo_dane" does not exist` durante `npm run db:sync`

**Archivo**: `fix-municipios-structure.js`

**Uso**:
```bash
node fix-municipios-structure.js
```

**Funcionalidad**:
- Verifica estructura actual de tabla `municipios`
- Agrega columna `codigo_dane` si no existe
- Configura como NOT NULL con datos temporales
- Crea índice único `municipios_codigo_dane_unique`
- Muestra estructura final y conteo de registros

**Cuándo usar**: 
- Error de sincronización de base de datos
- Migración desde versión sin `codigo_dane`
- Setup inicial en servidor nuevo

## 📁 Archivos Generados

### Configuración

- `package-optimized.json` - Package.json optimizado
- `package.json.backup` - Respaldo del original

### Scripts Linux

- `linux-scripts/gestor.sh` - Gestor principal interactivo
- `linux-scripts/setup_inicial.sh` - Instalación inicial
- `linux-scripts/desarrollo.sh` - Modo desarrollo
- `linux-scripts/produccion_pm2.sh` - Producción PM2
- `linux-scripts/produccion_docker.sh` - Producción Docker
- `linux-scripts/mantenimiento_db.sh` - Mantenimiento DB
- `linux-scripts/actualizacion_codigo.sh` - Deploy updates
- `linux-scripts/logs_monitoreo.sh` - Monitoreo
- `linux-scripts/backup_restauracion.sh` - Backup

## 🚀 Implementación Recomendada

### Paso 1: Aplicar Configuración Optimizada

```bash
# Respaldar configuración actual
cp package.json package.json.original

# Aplicar configuración optimizada
cp package-optimized.json package.json
```

### Paso 2: Preparar Scripts Linux

```bash
# Copiar scripts al servidor Linux
scp -r linux-scripts/ usuario@servidor:/ruta/proyecto/

# Dar permisos de ejecución
chmod +x linux-scripts/*.sh
```

### Paso 3: Setup Inicial en Linux

```bash
./linux-scripts/setup_inicial.sh
```

## 🔄 Flujo de Trabajo Recomendado

### Desarrollo Local

```bash
npm run dev
```

### Deploy a Producción

```bash
# En servidor Linux
./linux-scripts/actualizacion_codigo.sh
```

### Monitoreo Continuo

```bash
npm run pm2:status
npm run pm2:logs
```

## ⚠️ Consideraciones Importantes

1. **Respaldo**: Siempre mantener backup del package.json original
2. **Permisos**: Dar permisos de ejecución a scripts .sh en Linux
3. **Variables**: Verificar variables de entorno antes del deploy
4. **Base de Datos**: Probar conexión antes de ejecutar seeders
5. **PM2**: Verificar que PM2 esté instalado globalmente

## 📞 Comandos de Emergencia

### Restaurar Scripts Originales

```bash
cp package.json.backup package.json
npm install
```

### Reinicio Completo PM2

```bash
npm run pm2:stop
npm run pm2:start
```

### Verificación de Estado

```bash
npm run db:check
npm run pm2:status
```

---

*Documentación generada automáticamente por el notebook de gestión de scripts NPM*
