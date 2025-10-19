# Plan de Configuración del Jenkinsfile - Parroquia API

## Análisis Ejecutivo

### Estado Actual

**Jenkins Local:**

- Jenkins corriendo en máquina Ubuntu local
- Rutas ya configuradas
- Jenkinsfile en raíz del proyecto

**Servidor de Producción:**

- IP: 206.62.139.100
- Usuario: l4bsb
- Ruta: /home/l4bsb/Parroquia
- Puerto API: 3000

---

## PROBLEMAS CRÍTICOS IDENTIFICADOS

### Problema 1: Servicio API Deshabilitado

**Estado actual en docker-compose.yml:**
`yaml

# api:

# build:

# context: .

`

**Impacto:**

- El API NO se desplegará con docker-compose up
- Solo PostgreSQL se levantará
- Health checks fallarán

**Solución:** Descomentar el bloque completo del servicio api

---

### Problema 2: Rama Incorrecta

__En Jenkinsfile:__
DEPLOY_BRANCH = 'feature'

**Contexto:**

- Tu rama actual es develop
- Está configurado para desplegar desde feature
- Posible desincronización de código

__Solución:__ Cambiar a DEPLOY_BRANCH = 'develop'

---

## Plan de Implementación

### Fase 1: Variables a Modificar Manualmente en Jenkinsfile

environment {
SERVER_IP = '206.62.139.100'
SERVER_USER = 'l4bsb'
PROJECT_PATH = '/home/l4bsb/Parroquia'
DEPLOY_BRANCH = 'develop'              #  CAMBIAR AQUÍ
SSH_CREDENTIAL_ID = 'servidor-produccion-ssh'
APP_PORT = '3000'
}

### Fase 2: Habilitar Servicio API en Docker Compose

DESCOMENTAR el bloque completo de: # api:

### Fase 3: Archivo .env.production en Servidor

Ubicación: /home/l4bsb/Parroquia/.env.production

Variables requeridas:
DB_NAME=parroquia_db
DB_USER=parroquia_user
DB_PASSWORD=ParroquiaSecure2025
JWT_SECRET=tu_secreto_aqui
NODE_ENV=production
PORT=3000

---

## Flujo Completo de Despliegue

1. Trigger en Jenkins
2. Checkout código desde Git (rama: develop)
3. Conectar SSH a 206.62.139.100
4. git checkout develop
5. git pull origin develop
6. Copiar .env.production  .env
7. docker-compose down
8. docker-compose up --build -d
9. Health Check en /api/health
10. Despliegue completado

---

## Validación - Responde Estas Preguntas

1. ¿La rama a desplegar es develop?

   - Sí / No

2. ¿El usuario SSH es l4bsb?

   - Sí / No / Es otro:

3. ¿Quieres que habilite el servicio API?

   - Sí / No

4. ¿Estás de acuerdo con este plan?

   - Sí, procede
   - No, necesito cambios

---

**¿Estás de acuerdo? ¿Cuáles son tus respuestas?**
