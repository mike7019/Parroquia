# Primeros Pasos para Ejecutar el Proyecto

## 1. Configurar Base de Datos

### Crear la base de datos MySQL:

```sql
CREATE DATABASE parroquia_db;

```

### Configurar el archivo .env:

Edita el archivo `.env` con tus credenciales de base de datos:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=parroquia_db
DB_USER=tu_usuario
DB_PASS=tu_contraseña
JWT_SECRET=cambia_este_secreto_por_algo_seguro

```

## 2. Ejecutar el Proyecto

### Modo desarrollo:

```bash
npm run dev

```

### Modo producción:

```bash
npm start

```

## 3. Probar la API

### Crear un usuario administrador:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@parroquia.com",
    "password": "Admin123",
    "firstName": "Administrador",
    "lastName": "Sistema",
    "role": "admin"
  }'

```

### Verificar estado de la API:

```bash
curl http://localhost:3000/api/health

```

## 4. Estructura de Respuestas

### Respuesta exitosa:

```json
{
  "status": "success",
  "message": "Operación completada",
  "data": {
    "user": {...},
    "token": "..."
  }
}

```

### Respuesta de error:

```json
{
  "status": "error",
  "message": "Descripción del error",
  "errors": [...]
}

```

## 5. Tokens JWT

- Los tokens se incluyen en el header: `Authorization: Bearer TOKEN`
- Duración por defecto: 24 horas
- Se pueden refrescar usando `/api/auth/refresh-token`

## 6. Próximos Pasos

1. Personalizar los modelos según las necesidades de la parroquia
2. Agregar más endpoints según los requerimientos
3. Implementar tests
4. Configurar Docker para despliegue
5. Agregar documentación con Swagger

## 7. Pruebas Automatizadas

### Ejecutar todas las pruebas:

```bash
npm test
```

### Ejecutar pruebas en modo watch (desarrollo):

```bash
npm run test:watch

# Para generar reporte de cobertura
npm run test:coverage
```

## 📋 Resumen del Proyecto Creado

### ✅ Dependencias Incluidas:

- **Express** - Framework web
- **dotenv** - Variables de entorno
- **bcrypt** - Cifrado de contraseñas
- **jsonwebtoken** - Autenticación JWT
- **Sequelize** - ORM con MySQL
- **express-validator** - Validación de datos
- **cors, helmet, morgan** - Middlewares de seguridad

### 📁 Estructura de Carpetas:

```ini
src/
├── controllers/    # Controladores (auth, users)
├── models/         # Modelos Sequelize
├── routes/         # Rutas de la API
├── middlewares/    # Middlewares personalizados
├── services/       # Lógica de negocio
└── validators/     # Validadores

config/             # Configuración de BD

```

### 🚀 Características Implementadas:

- Sistema de autenticación completo con JWT
- Control de acceso por roles (admin, moderator, user)
- Validaciones robustas
- Manejo centralizado de errores
- Middlewares de seguridad

## 7. Pruebas Automatizadas (Testing)

El proyecto incluye un conjunto completo de pruebas automatizadas para todos los endpoints de autenticación.

### Configuración de Pruebas

Las pruebas utilizan:
- **Jest**: Framework de testing
- **Supertest**: Para testing de APIs HTTP
- **Base de datos separada**: Configurada en `.env.test`
- **Mocking**: Para servicios de email

### Estructura de Pruebas

```
tests/
├── setup.js                          # Configuración global de Jest
├── helpers/
│   └── testHelpers.js                # Utilidades para testing
└── auth/
    ├── register.test.js              # Tests de registro (12 casos)
    ├── login.test.js                 # Tests de login (12 casos)  
    ├── emailVerification.test.js     # Tests de verificación email (11 casos)
    ├── tokenManagement.test.js       # Tests de tokens JWT (9 casos)
    ├── passwordRecovery.test.js      # Tests recuperación contraseña (18 casos)
    ├── protectedEndpoints.test.js    # Tests endpoints protegidos (17 casos)
    └── securityTests.test.js         # Tests de seguridad (20+ casos)
```

### Comandos de Testing

```bash
# Instalar dependencias de testing
npm install

# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar con reporte de cobertura
npm run test:coverage

# Ejecutar solo pruebas de autenticación
npm run test:auth

# Ejecutar pruebas específicas
npm run test:auth:register        # Solo registro
npm run test:auth:login          # Solo login
npm run test:auth:email          # Solo verificación email
npm run test:auth:tokens         # Solo manejo de tokens
npm run test:auth:password       # Solo recuperación de contraseña
npm run test:auth:protected      # Solo endpoints protegidos
npm run test:auth:security       # Solo pruebas de seguridad
```

### Características de las Pruebas

#### 🔒 **Seguridad**
- Protección contra inyección SQL
- Prevención de ataques XSS
- Validación de tokens JWT
- Protección contra timing attacks
- Manejo de tokens malformados

#### 📊 **Cobertura Completa**
- **99+ casos de prueba** cubriendo todos los endpoints
- Casos exitosos y de error
- Validación de entrada y salida
- Casos edge y manejo de errores
- Estados de cuenta (verificado/no verificado)

#### 🛠️ **Utilidades de Testing**
- Limpieza automática de base de datos
- Creación de usuarios de prueba
- Generación de datos aleatorios
- Headers de autenticación automáticos
- Validadores de respuesta estandarizados

#### 🌐 **Casos de Prueba por Endpoint**

**Registro (`/api/auth/register`)**
- Registro exitoso
- Email duplicado
- Validación de campos
- Formatos de email inválidos
- Contraseñas débiles
- Caracteres especiales en nombres

**Login (`/api/auth/login`)**
- Login exitoso
- Credenciales incorrectas
- Usuario no verificado
- Múltiples intentos concurrentes
- Campos faltantes
- Normalización de email

**Verificación Email (`/api/auth/verify-email`)**
- Verificación exitosa
- Token inválido/expirado
- Usuario ya verificado
- Reenvío de verificación
- Casos de token malformado

**Manejo de Tokens (`/api/auth/refresh-token`)**
- Renovación exitosa
- Refresh token inválido/expirado
- Token revocado
- Usuario eliminado
- Tokens malformados

**Recuperación Contraseña (`/api/auth/forgot-password`, `/api/auth/reset-password`)**
- Proceso completo de recuperación
- Email no existente
- Tokens inválidos/expirados
- Validación de nueva contraseña
- Múltiples intentos de reset

**Endpoints Protegidos (`/api/auth/profile`, `/api/auth/change-password`, `/api/auth/logout`)**
- Acceso con token válido
- Tokens inválidos/expirados
- Cambio de contraseña
- Logout y revocación de tokens
- Autorización requerida

**Pruebas de Seguridad**
- Resistencia a inyección SQL
- Prevención XSS
- Validación de longitud de entrada
- Timing attacks
- Manipulación de tokens
- Concurrencia y race conditions

### Ambiente de Testing

```env
# .env.test
NODE_ENV=test
DB_NAME=parroquia_test
DB_USER=postgres
DB_PASS=your_password
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=test_jwt_secret_key_super_secure
JWT_REFRESH_SECRET=test_refresh_secret_key_super_secure
EMAIL_HOST=smtp.test.com
EMAIL_PORT=587
EMAIL_USER=test@test.com
EMAIL_PASS=test_password
```

### Reportes de Cobertura

Las pruebas generan reportes detallados de cobertura incluyendo:
- Líneas cubiertas por las pruebas
- Ramas de código ejecutadas
- Funciones probadas
- Archivos no cubiertos

Ejecuta `npm run test:coverage` para ver el reporte completo.

#### Estructura de Coverage

```
Coverage Summary:
 - Statements   : 95%+ (xxx/xxx)
 - Branches     : 90%+ (xxx/xxx)  
 - Functions    : 95%+ (xxx/xxx)
 - Lines        : 95%+ (xxx/xxx)
```

### Ejecución de Pruebas

1. **Preparar ambiente de testing:**
   - Crear base de datos de prueba: `parroquia_test`
   - Configurar variables de entorno en `.env.test`
   - Instalar dependencias: `npm install`

2. **Ejecutar pruebas:**
   ```bash
   # Todas las pruebas
   npm test
   
   # Con cobertura
   npm run test:coverage
   
   # Pruebas específicas
   npm run test:auth:register
   ```

3. **Interpretar resultados:**
   - ✅ **PASS**: Prueba exitosa
   - ❌ **FAIL**: Prueba fallida con detalles del error
   - ⚠️  **WARN**: Advertencias sobre cobertura o rendimiento

Las pruebas están diseñadas para ejecutarse de forma independiente y pueden correrse en cualquier orden. Cada suite de pruebas limpia y prepara su propio ambiente de testing.

---

## 8. Próximos Pasos

- Implementar rate limiting avanzado
- Agregar logging estructurado
- Implementar métricas y monitoreo
- Agregar pruebas de integración E2E
- Configurar CI/CD pipeline