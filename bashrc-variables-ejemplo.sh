# VARIABLES DE ENTORNO PARA PARROQUIA PROJECT
# Agregar estas líneas al final de tu ~/.bashrc

# ==============================================
# DATABASE CONFIGURATION
# ==============================================
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=parroquia_db
export DB_USER=parroquia_user
export DB_PASSWORD=securepassword123

# For legacy compatibility (fallback)
export POSTGRES_DB=parroquia_db
export POSTGRES_USER=parroquia_user
export POSTGRES_PASSWORD=securepassword123

# ==============================================
# JWT AUTHENTICATION
# ==============================================
export JWT_SECRET=your_super_secure_jwt_secret_here_32_chars_min
export JWT_REFRESH_SECRET=your_super_secure_refresh_secret_here_32_chars_min

# ==============================================
# APPLICATION CONFIGURATION
# ==============================================
export NODE_ENV=production
export PORT=3000
export API_URL=http://localhost:3000
export FRONTEND_URL=http://localhost:3000

# ==============================================
# EMAIL CONFIGURATION (SMTP)
# ==============================================
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USER=your_email@gmail.com
export SMTP_PASS=your_app_password_here

# ==============================================
# REMOTE DATABASE (PRODUCTION)
# ==============================================
export REMOTE_DB_HOST=206.62.139.100
export REMOTE_DB_PORT=5432
export REMOTE_DB_NAME=parroquia_db
export REMOTE_DB_USER=parroquia_user
export REMOTE_DB_PASSWORD=securepassword123

# ==============================================
# DEVELOPMENT/DEBUGGING
# ==============================================
export VERBOSE_LOGGING=false
export DEBUG_SEQUELIZE=false

# ==============================================
# DESPUÉS DE AGREGAR ESTAS VARIABLES:
# ==============================================
# 1. Ejecutar: source ~/.bashrc
# 2. Verificar: echo $DB_PASSWORD
# 3. Reiniciar servicios si es necesario
