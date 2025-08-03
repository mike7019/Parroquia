#!/bin/bash

# Parroquia Production Deployment Script
# This script deploys the application using Docker with PM2 and Nginx
# Version: 2.0
# Updated: August 2, 2025

set -e

# Script configuration
COMPOSE_FILE="docker-compose.prod.yml"
LOG_FILE="deployment-$(date +%Y%m%d).log"
BACKUP_DIR="backups"
ENV_FILE=".env"

# Command line arguments
COMMAND=${1:-help}
OPTIONS=${2:-}
FORCE=${FORCE:-false}
VERBOSE=${VERBOSE:-false}

# Global variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="/tmp/parroquia-deploy.pid"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    if [[ "$VERBOSE" == "true" ]]; then
        echo -e "${GRAY}[$timestamp] [$level] $message${NC}"
    fi
}

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
    log "INFO" "$1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    log "SUCCESS" "$1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    log "WARNING" "$1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    log "ERROR" "$1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    local errors=()
    local warnings=()
    
    # Check OS compatibility
    if [[ -f /etc/os-release ]]; then
        local os_info=$(grep -E '^ID=|^VERSION=' /etc/os-release 2>/dev/null || echo "")
        if echo "$os_info" | grep -q "debian"; then
            print_status "Detected Debian system - optimizing for compatibility"
        fi
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        errors+=("Docker is not installed or not in PATH")
        errors+=("  Install with: sudo apt update && sudo apt install docker.io")
    else
        print_status "Docker found: $(docker --version)"
        
        # Check if user can run docker without sudo
        if ! docker ps &> /dev/null; then
            warnings+=("Cannot run docker without sudo. Consider adding user to docker group:")
            warnings+=("  sudo usermod -aG docker \$USER && newgrp docker")
        fi
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        errors+=("Docker Compose is not installed or not in PATH")
        errors+=("  Install with: sudo apt update && sudo apt install docker-compose")
    else
        print_status "Docker Compose found: $(docker-compose --version)"
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        errors+=("Docker daemon is not running")
        errors+=("  Start with: sudo systemctl start docker")
        errors+=("  Enable on boot: sudo systemctl enable docker")
    else
        print_status "Docker daemon is running"
    fi
    
    # Check required files
    local required_files=("$COMPOSE_FILE" "Dockerfile.pm2" "nginx.docker.conf" "ecosystem.config.js")
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            errors+=("Required file missing: $file")
        fi
    done
    
    # Check for helpful tools
    local helpful_tools=("curl" "jq" "openssl")
    for tool in "${helpful_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            warnings+=("Recommended tool '$tool' not found. Install with: sudo apt install $tool")
        fi
    done
    
    # Check disk space (minimum 2GB) - Debian compatible
    local available_space=$(df --output=avail . | tail -n1 2>/dev/null || df . | awk 'NR==2 {print $4}')
    local available_gb=$((available_space / 1024 / 1024))
    if [[ $available_gb -lt 2 ]]; then
        errors+=("Insufficient disk space. Available: ${available_gb}GB, Required: 2GB")
    fi
    
    # Show warnings if any
    if [[ ${#warnings[@]} -gt 0 ]]; then
        print_warning "Recommendations for better compatibility:"
        for warning in "${warnings[@]}"; do
            print_warning "  - $warning"
        done
        echo ""
    fi
    
    if [[ ${#errors[@]} -gt 0 ]]; then
        print_error "Prerequisites check failed:"
        for error in "${errors[@]}"; do
            print_error "  - $error"
        done
        return 1
    fi
    
    print_success "All prerequisites met"
    return 0
}

# Function to check if Docker is running
check_docker() {
    print_status "Checking Docker status..."
    
    if docker info &> /dev/null; then
        local container_count=$(docker ps -q | wc -l)
        print_success "Docker is running. Active containers: $container_count"
        return 0
    else
        print_error "Docker daemon is not running or accessible"
        return 1
    fi
}

# Function to validate environment configuration
check_environment() {
    print_status "Validating environment configuration..."
    
    if [[ ! -f "$ENV_FILE" ]]; then
        print_warning "Environment file not found. Creating from template..."
        create_env_file
        print_warning "Please update the .env file with your actual configuration before deploying!"
        return 1
    fi
    
    # Read and validate critical environment variables
    local warnings=()
    local required_vars=("JWT_SECRET" "JWT_REFRESH_SECRET" "DB_PASS")
    
    for var in "${required_vars[@]}"; do
        if grep -q "${var}=.*default.*\|${var}=your_.*" "$ENV_FILE"; then
            warnings+=("Please update $var with a secure value")
        fi
    done
    
    if [[ ${#warnings[@]} -gt 0 ]]; then
        print_warning "Environment configuration warnings:"
        for warning in "${warnings[@]}"; do
            print_warning "  - $warning"
        done
        
        if [[ "$FORCE" != "true" ]]; then
            read -p "Continue anyway? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                return 1
            fi
        fi
    fi
    
    print_success "Environment configuration validated"
    return 0
}

# Function to create environment file if it doesn't exist
create_env_file() {
    if [[ ! -f "$ENV_FILE" ]]; then
        print_status "Creating environment file..."
        
        # Generate secure secrets - Debian compatible
        local jwt_secret
        local refresh_secret
        
        # Try multiple methods for secure random generation
        if command -v openssl &> /dev/null; then
            jwt_secret=$(openssl rand -base64 48 2>/dev/null)
            refresh_secret=$(openssl rand -base64 48 2>/dev/null)
        elif [[ -c /dev/urandom ]]; then
            jwt_secret=$(head -c 48 /dev/urandom | base64 | tr -d '\n' 2>/dev/null)
            refresh_secret=$(head -c 48 /dev/urandom | base64 | tr -d '\n' 2>/dev/null)
        else
            # Fallback for minimal systems
            jwt_secret="$(date +%s)_jwt_secret_$(hostname)_$(shuf -i 1000-9999 -n 1 2>/dev/null || echo $RANDOM)"
            refresh_secret="$(date +%s)_refresh_secret_$(hostname)_$(shuf -i 1000-9999 -n 1 2>/dev/null || echo $RANDOM)"
        fi
        
        cat > "$ENV_FILE" << EOF
# Production Environment Variables
# Generated on $(date '+%Y-%m-%d %H:%M:%S')
NODE_ENV=production
PORT=3000

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=parroquia_db
DB_USER=parroquia_user
DB_PASS=ParroquiaSecure2025

# JWT Configuration (Auto-generated secure secrets)
JWT_SECRET=$jwt_secret
JWT_REFRESH_SECRET=$refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12

# Frontend Configuration
FRONTEND_URL=http://206.62.139.100

# Email Configuration (Optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
SMTP_FROM_EMAIL=
SEND_REAL_EMAILS=false

# Logging
VERBOSE_LOGGING=true

# Generated on: $(date '+%Y-%m-%d %H:%M:%S')
EOF
        
        print_success "Created .env file with auto-generated secure secrets"
        print_warning "Please review and update email configuration if needed"
    else
        print_status "Environment file already exists"
    fi
}

# Function to build and deploy
deploy() {
    print_status "Starting production deployment..."
    
    # Pre-deployment cleanup
    print_status "Performing pre-deployment cleanup..."
    if [[ -d "temp" ]]; then
        rm -rf temp/* 2>/dev/null || true
    fi
    
    # Stop existing containers gracefully
    print_status "Stopping existing containers..."
    docker-compose -f "$COMPOSE_FILE" down --timeout 30 2>/dev/null || true
    
    # Clean up unused Docker resources
    print_status "Cleaning up Docker resources..."
    docker system prune -f --volumes 2>/dev/null || true
    
    # Pull latest images
    print_status "Pulling latest base images..."
    docker-compose -f "$COMPOSE_FILE" pull --ignore-pull-failures 2>/dev/null || true
    
    # Build and start containers
    print_status "Building and starting containers..."
    if ! docker-compose -f "$COMPOSE_FILE" up -d --build --remove-orphans; then
        print_error "Deployment failed during container startup"
        return 1
    fi
    
    # Wait for services to be healthy
    print_status "Waiting for services to be ready..."
    local max_wait=120  # 2 minutes
    local waited=0
    local interval=10
    
    while [[ $waited -lt $max_wait ]]; do
        sleep $interval
        waited=$((waited + interval))
        
        # Check if all services are healthy - Debian compatible
        local unhealthy_count=0
        if command -v jq &> /dev/null; then
            unhealthy_count=$(docker-compose -f "$COMPOSE_FILE" ps --format json 2>/dev/null | \
                jq -r '.[] | select(.Health != "healthy" and .Health != "") | .Service' 2>/dev/null | wc -l || echo "0")
        else
            # Fallback without jq - check running containers
            local running_containers=$(docker-compose -f "$COMPOSE_FILE" ps -q --filter status=running | wc -l)
            local total_containers=$(docker-compose -f "$COMPOSE_FILE" ps -q | wc -l)
            if [[ $running_containers -lt $total_containers ]]; then
                unhealthy_count=1
            fi
        fi
        
        if [[ $unhealthy_count -eq 0 ]]; then
            break
        fi
        
        print_status "Waiting for services... ($waited/$max_wait seconds)"
    done
    
    # Final health check - Debian compatible
    print_status "Performing final health checks..."
    local failed_services=()
    
    # Check container status without jq dependency
    while read -r container; do
        if [[ -n "$container" ]]; then
            local status=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null || echo "unknown")
            local name=$(docker inspect --format='{{.Name}}' "$container" 2>/dev/null | sed 's|^/||' || echo "unknown")
            
            if [[ "$status" != "running" ]]; then
                failed_services+=("$name (Status: $status)")
            fi
        fi
    done < <(docker-compose -f "$COMPOSE_FILE" ps -q 2>/dev/null || echo "")
    
    if [[ ${#failed_services[@]} -gt 0 ]]; then
        print_error "Some services failed to start properly:"
        for service in "${failed_services[@]}"; do
            print_error "  - $service"
        done
        show_status
        return 1
    fi
    
    # Test API connectivity - with timeout for Debian
    print_status "Testing API connectivity..."
    if timeout 10 curl -f -s "http://206.62.139.100/api/health" > /dev/null 2>&1 || \
       curl -f -s -m 10 "http://206.62.139.100/api/health" > /dev/null 2>&1; then
        print_success "API health check passed"
    else
        print_warning "API health check failed (this is normal if the service is still starting)"
    fi
    
    # Show final status
    show_status
    
    print_success "Deployment completed successfully!"
    print_status "Application is available at: http://206.62.139.100"
    print_status "API documentation: http://206.62.139.100/api-docs"
    print_status "Health check: http://206.62.139.100/api/health"
    
    return 0
}

# Function to show logs
show_logs() {
    local service=${1:-}
    
    if [[ -n "$service" ]]; then
        print_status "Showing logs for service: $service"
        docker-compose -f "$COMPOSE_FILE" logs -f --tail=100 "$service"
    else
        print_status "Showing application logs..."
        docker-compose -f "$COMPOSE_FILE" logs -f --tail=100
    fi
}

# Function to show comprehensive status
show_status() {
    print_status "=== Container Status ==="
    docker-compose -f "$COMPOSE_FILE" ps
    
    print_status "\n=== Resource Usage ==="
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    
    print_status "\n=== Network Status ==="
    local networks=$(docker network ls --filter name=parroquia --format "{{.Name}}")
    for network in $networks; do
        print_status "Network: $network"
        docker network inspect "$network" --format "{{range .Containers}}{{.Name}}: {{.IPv4Address}}{{end}}" 2>/dev/null || true
    done
    
    print_status "\n=== Volume Status ==="
    docker volume ls --filter name=parroquia --format "table {{.Driver}}\t{{.Name}}"
    
    print_status "\n=== Service Health ==="
    # API Health check with timeout compatibility
    if timeout 5 curl -f -s "http://206.62.139.100/api/health" > /dev/null 2>&1 || \
       curl -f -s -m 5 "http://206.62.139.100/api/health" > /dev/null 2>&1; then
        print_success "API Health: OK"
    else
        print_warning "API Health: FAILED"
    fi
    
    # Nginx Health check with timeout compatibility
    if timeout 5 curl -f -s "http://206.62.139.100/nginx-health" > /dev/null 2>&1 || \
       curl -f -s -m 5 "http://206.62.139.100/nginx-health" > /dev/null 2>&1; then
        print_success "Nginx Health: OK"
    else
        print_warning "Nginx Health: FAILED"
    fi
}

# Function to stop services
stop_services() {
    print_status "Stopping all services..."
    if docker-compose -f "$COMPOSE_FILE" down --timeout 30; then
        print_success "Services stopped successfully"
    else
        print_error "Failed to stop some services"
    fi
}

# Function to restart services
restart_services() {
    local service=${1:-}
    
    if [[ -n "$service" ]]; then
        print_status "Restarting service: $service"
        docker-compose -f "$COMPOSE_FILE" restart "$service"
    else
        print_status "Restarting all services..."
        docker-compose -f "$COMPOSE_FILE" restart
    fi
    
    if [[ $? -eq 0 ]]; then
        print_success "Services restarted successfully"
        sleep 10
        show_status
    else
        print_error "Failed to restart services"
    fi
}

# Function to scale services
scale_services() {
    local service_scale=${1:-}
    
    if [[ -z "$service_scale" ]]; then
        print_error "Please specify service and scale (e.g., 'api=3')"
        return 1
    fi
    
    print_status "Scaling services: $service_scale"
    if docker-compose -f "$COMPOSE_FILE" up -d --scale "$service_scale" --no-recreate; then
        print_success "Scaling completed"
        show_status
    else
        print_error "Scaling failed"
    fi
}

# Function to clean up Docker resources
cleanup() {
    print_status "Performing Docker cleanup..."
    
    if [[ "$FORCE" == "true" ]]; then
        print_warning "Force cleanup - removing all unused resources"
        docker system prune -af --volumes
    else
        print_status "Standard cleanup - removing unused images and containers"
        docker system prune -f
    fi
    
    print_status "Cleanup completed"
    docker system df
}

# Function to update application
update_application() {
    print_status "Updating application..."
    
    # Git pull if in git repository
    if [[ -d ".git" ]]; then
        print_status "Pulling latest code..."
        git pull origin develop || print_warning "Git pull failed or not needed"
    fi
    
    # Rebuild and deploy
    deploy
}

# Function to monitor services
monitor_services() {
    print_status "Starting service monitoring..."
    print_status "Press Ctrl+C to stop monitoring"
    
    trap 'print_status "Monitoring stopped"; exit 0' INT
    
    while true; do
        clear
        echo -e "${CYAN}=== Parroquia Production Monitor ===${NC}"
        echo -e "${GRAY}Updated: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
        echo ""
        
        show_status
        
        sleep 30
    done
}

# Function to backup database
backup_database() {
    print_status "Creating database backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/parroquia_backup_$timestamp.sql"
    local metadata_file="$BACKUP_DIR/parroquia_backup_$timestamp.json"
    
    # Create database backup
    print_status "Exporting database..."
    if ! docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U parroquia_user -d parroquia_db --clean --if-exists > "$backup_file"; then
        print_error "Database backup failed"
        return 1
    fi
    
    # Create metadata file - Debian compatible
    local backup_size=$(du -m "$backup_file" 2>/dev/null | cut -f1 || echo "0")
    local services="unknown"
    
    # Try to get services list with fallback
    if command -v jq &> /dev/null; then
        services=$(docker-compose -f "$COMPOSE_FILE" ps --format json 2>/dev/null | \
            jq -r '.[].Service' 2>/dev/null | tr '\n' ',' || echo "unknown")
    else
        # Fallback: get service names from compose file
        services=$(docker-compose -f "$COMPOSE_FILE" config --services 2>/dev/null | tr '\n' ',' || echo "api,postgres,nginx")
    fi
    
    cat > "$metadata_file" << EOF
{
    "timestamp": "$(date '+%Y-%m-%d %H:%M:%S')",
    "database": "parroquia_db",
    "user": "parroquia_user",
    "size_mb": $backup_size,
    "services": "$services"
}
EOF
    
    # Compress backup
    print_status "Compressing backup..."
    local zip_file="$BACKUP_DIR/parroquia_backup_$timestamp.tar.gz"
    if tar -czf "$zip_file" -C "$BACKUP_DIR" "$(basename "$backup_file")" "$(basename "$metadata_file")"; then
        # Clean up uncompressed files
        rm -f "$backup_file" "$metadata_file"
        
        print_success "Database backup created: $zip_file"
        print_status "Backup size: ${backup_size}MB"
        
        # Keep only last 10 backups - Debian compatible
        local backup_count=$(find "$BACKUP_DIR" -name "parroquia_backup_*.tar.gz" -type f 2>/dev/null | wc -l)
        if [[ $backup_count -gt 10 ]]; then
            # Use ls with sort for broader compatibility
            if command -v stat &> /dev/null && stat --version 2>/dev/null | grep -q GNU; then
                # GNU stat (most Linux distributions including Debian)
                find "$BACKUP_DIR" -name "parroquia_backup_*.tar.gz" -type f -printf '%T@ %p\n' 2>/dev/null | \
                    sort -n | head -n $((backup_count - 10)) | cut -d' ' -f2- | xargs rm -f
            else
                # Fallback for systems without GNU find
                ls -t "$BACKUP_DIR"/parroquia_backup_*.tar.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
            fi
            print_status "Cleaned up old backups"
        fi
    else
        print_error "Backup compression failed"
        rm -f "$backup_file" "$metadata_file"
        return 1
    fi
}

# Function to setup SSL (placeholder for future implementation)
setup_ssl() {
    print_warning "SSL setup is not yet implemented"
    print_status "For now, please configure SSL manually using:"
    print_status "1. Obtain SSL certificates from Let's Encrypt or your provider"
    print_status "2. Mount certificates in nginx container"
    print_status "3. Update nginx.docker.conf with SSL configuration"
}

# Function to show help
show_help() {
    echo -e "${CYAN}Parroquia Production Deployment Script${NC}"
    echo -e "${GRAY}Version 2.0 - Updated August 2, 2025${NC}"
    echo ""
    echo -e "${BLUE}Usage:${NC} $0 [command] [options]"
    echo ""
    echo -e "${BLUE}Commands:${NC}"
    echo -e "  ${GREEN}deploy${NC}      - Full deployment with health checks"
    echo -e "  ${GREEN}logs${NC}        - Show application logs (use 'logs api' for specific service)"
    echo -e "  ${GREEN}status${NC}      - Show comprehensive system status"
    echo -e "  ${GREEN}stop${NC}        - Stop all services gracefully"
    echo -e "  ${GREEN}restart${NC}     - Restart services (use 'restart api' for specific service)"
    echo -e "  ${GREEN}backup${NC}      - Create compressed database backup"
    echo -e "  ${GREEN}clean${NC}       - Clean up Docker resources"
    echo -e "  ${GREEN}update${NC}      - Update code and redeploy"
    echo -e "  ${GREEN}scale${NC}       - Scale services (e.g., 'scale api=3')"
    echo -e "  ${GREEN}monitor${NC}     - Real-time system monitoring"
    echo -e "  ${GREEN}ssl${NC}         - SSL setup instructions"
    echo -e "  ${GREEN}help${NC}        - Show this help message"
    echo ""
    echo -e "${BLUE}Environment Variables:${NC}"
    echo -e "  ${GREEN}FORCE=true${NC}   - Skip confirmation prompts"
    echo -e "  ${GREEN}VERBOSE=true${NC} - Enable verbose logging"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo -e "  ${GRAY}VERBOSE=true $0 deploy${NC}"
    echo -e "  ${GRAY}$0 logs api${NC}"
    echo -e "  ${GRAY}$0 scale api=3${NC}"
    echo -e "  ${GRAY}FORCE=true $0 clean${NC}"
    echo ""
}

# Main script logic
echo -e "${CYAN}=== Parroquia Production Deployment Script ===${NC}"
echo -e "${GRAY}Started: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo ""

# Initialize logging
log "INFO" "Script started with command: $COMMAND"

case "$COMMAND" in
    "deploy")
        if check_prerequisites && check_environment; then
            if deploy; then
                log "SUCCESS" "Deployment completed successfully"
            else
                log "ERROR" "Deployment failed"
                exit 1
            fi
        else
            print_error "Prerequisites or environment validation failed"
            exit 1
        fi
        ;;
    "logs")
        show_logs "$OPTIONS"
        ;;
    "status")
        if check_docker; then
            show_status
        fi
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        if check_docker; then
            restart_services "$OPTIONS"
        fi
        ;;
    "backup")
        if check_docker; then
            backup_database
        fi
        ;;
    "clean")
        cleanup
        ;;
    "update")
        if check_prerequisites && check_environment; then
            update_application
        fi
        ;;
    "scale")
        if check_docker && [[ -n "$OPTIONS" ]]; then
            scale_services "$OPTIONS"
        else
            print_error "Please specify scaling options (e.g., 'api=3')"
        fi
        ;;
    "monitor")
        if check_docker; then
            monitor_services
        fi
        ;;
    "ssl")
        setup_ssl
        ;;
    "help"|*)
        show_help
        ;;
esac

log "INFO" "Script completed with command: $COMMAND"
