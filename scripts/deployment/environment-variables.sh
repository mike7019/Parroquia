#!/bin/bash

# Variables de entorno para Parroquia API - Producción
# Agrega estas líneas a tu archivo ~/.bashrc

# Configuración de la aplicación
export NODE_ENV=production
export PORT=3000
export VERBOSE_LOGGING=true

# Configuración de base de datos
export DB_HOST=postgres
export DB_PORT=5432
export DB_NAME=parroquia_db
export DB_USER=parroquia_user
export DB_PASS=UnPasswordMuySeguro123!

# Configuración de seguridad - CAMBIAR EN PRODUCCIÓN
export BCRYPT_ROUNDS=12
export JWT_SECRET=jwt_secret_super_seguro_para_produccion_123456789
export JWT_REFRESH_SECRET=refresh_secret_super_seguro_para_produccion_987654321
export JWT_EXPIRES_IN=15m
export JWT_REFRESH_EXPIRES_IN=7d

# Configuración del frontend
export FRONTEND_URL=http://206.62.139.11:3000

# Configuración de email (SMTP)
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USER=tu_email@gmail.com
export SMTP_PASS=tu_app_password_de_gmail
export EMAIL_FROM=noreply@parroquia.com
export SMTP_FROM_EMAIL=noreply@parroquia.com
export SEND_REAL_EMAILS=true

# ================================
# INSTRUCCIONES DE USO:
# ================================
# 
# 1. Copia estas líneas a tu archivo ~/.bashrc:
#    nano ~/.bashrc
# 
# 2. Pega las líneas export al final del archivo
# 
# 3. IMPORTANTE: Cambia los siguientes valores por valores únicos y seguros:
#    - DB_PASS: Usar una contraseña segura
#    - JWT_SECRET: Generar un secret único
#    - JWT_REFRESH_SECRET: Generar otro secret único
#    - SMTP_USER y SMTP_PASS: Configurar con tus credenciales reales
#    - FRONTEND_URL: Ajustar a tu dominio/IP real
# 
# 4. Recarga las variables de entorno:
#    source ~/.bashrc
# 
# 5. Verifica que las variables están cargadas:
#    echo $NODE_ENV
#    echo $DB_PASS
# 
# 6. Ejecuta el script de pre-deploy para verificar:
#    ./scripts/deployment/pre-deploy.sh
