#!/bin/bash

# Production Deployment Script for Parroquia API
# This script handles the complete deployment process for the production server

set -e

# Configuration
PROJECT_NAME="parroquia-api"
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="./backups"
LOG_FILE="./deployment.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    echo -e "${RED}ERROR: $1${NC}" >&2
    log "ERROR: $1"
    exit 1
}

# Success message
success() {
    echo -e "${GREEN}SUCCESS: $1${NC}"
    log "SUCCESS: $1"
}

# Warning message
warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
    log "WARNING: $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        error_exit "Docker is not running. Please start Docker first."
    fi
    log "Docker is running"
}

# Check and free ports required by the application
check_and_free_ports() {
    local required_ports=("80" "443" "8080" "8443" "3000" "5432")
    local ports_to_free=()
    
    log "Checking for port conflicts..."
    
    for port in "${required_ports[@]}"; do
        # Check if port is in use
        if netstat -tulpn 2>/dev/null | grep -q ":$port " || ss -tulpn 2>/dev/null | grep -q ":$port "; then
            log "Port $port is currently in use"
            
            # Check if it's used by docker-proxy (our containers)
            if netstat -tulpn 2>/dev/null | grep ":$port " | grep -q "docker-proxy" || 
               ss -tulpn 2>/dev/null | grep ":$port " | grep -q "docker-proxy"; then
                log "Port $port is used by Docker containers - will be freed during container stop"
                ports_to_free+=("$port")
            else
                # Check what process is using the port
                local process_info=$(netstat -tulpn 2>/dev/null | grep ":$port " | head -n1 || ss -tulpn 2>/dev/null | grep ":$port " | head -n1)
                warning "Port $port is used by non-Docker process: $process_info"
                
                # Ask user if they want to continue
                read -p "Do you want to try to free port $port? (y/N): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    try_free_port "$port"
                else
                    warning "Continuing without freeing port $port - deployment may fail"
                fi
            fi
        else
            log "Port $port is available"
        fi
    done
    
    if [ ${#ports_to_free[@]} -gt 0 ]; then
        log "Ports that will be freed during container restart: ${ports_to_free[*]}"
    fi
}

# Try to free a specific port
try_free_port() {
    local port=$1
    log "Attempting to free port $port..."
    
    # Get process ID using the port
    local pid=$(netstat -tulpn 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1 | head -n1)
    
    if [ -z "$pid" ]; then
        # Try with ss if netstat didn't work
        pid=$(ss -tulpn 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d',' -f2 | cut -d'=' -f2 | head -n1)
    fi
    
    if [ -n "$pid" ] && [ "$pid" != "-" ]; then
        log "Found process $pid using port $port"
        
        # Check if it's nginx
        if ps -p "$pid" -o comm= 2>/dev/null | grep -q nginx; then
            log "Stopping nginx service on port $port"
            systemctl stop nginx 2>/dev/null || service nginx stop 2>/dev/null || warning "Could not stop nginx service"
        else
            # For other processes, ask for confirmation
            local process_name=$(ps -p "$pid" -o comm= 2>/dev/null || echo "unknown")
            warning "Process $process_name (PID: $pid) is using port $port"
            read -p "Kill this process? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                kill -TERM "$pid" 2>/dev/null || warning "Could not terminate process $pid"
                sleep 2
                # Check if process is still running
                if ps -p "$pid" >/dev/null 2>&1; then
                    warning "Process $pid still running, trying SIGKILL"
                    kill -KILL "$pid" 2>/dev/null || warning "Could not kill process $pid"
                fi
            fi
        fi
    else
        warning "Could not determine which process is using port $port"
    fi
    
    # Verify port is now free
    sleep 1
    if netstat -tulpn 2>/dev/null | grep -q ":$port " || ss -tulpn 2>/dev/null | grep -q ":$port "; then
        warning "Port $port is still in use after cleanup attempt"
    else
        success "Port $port is now available"
    fi
}

# Stop all Docker containers and clean up
stop_and_cleanup_containers() {
    log "Stopping and cleaning up existing containers..."
    
    # Stop current project containers
    if [ -f "$COMPOSE_FILE" ]; then
        docker-compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || warning "No existing containers to stop"
    fi
    
    # Stop any containers that might be using our ports
    local containers_using_ports=$(docker ps --format "table {{.ID}}\t{{.Ports}}" | grep -E "(80|443|8080|8443|3000|5432)" | awk '{print $1}' | tail -n +2)
    
    if [ -n "$containers_using_ports" ]; then
        log "Found containers using required ports, stopping them..."
        echo "$containers_using_ports" | while read container_id; do
            if [ -n "$container_id" ]; then
                log "Stopping container: $container_id"
                docker stop "$container_id" 2>/dev/null || warning "Could not stop container $container_id"
            fi
        done
    fi
    
    # Clean up orphaned containers
    docker container prune -f 2>/dev/null || warning "Could not prune containers"
    
    # Clean up unused networks
    docker network prune -f 2>/dev/null || warning "Could not prune networks"
    
    success "Container cleanup completed"
}

# Check if docker-compose is available
check_compose() {
    if ! command -v docker-compose >/dev/null 2>&1; then
        error_exit "docker-compose is not installed or not in PATH"
    fi
    log "docker-compose is available"
}

# Create backup directory
create_backup_dir() {
    mkdir -p "$BACKUP_DIR"
    log "Backup directory created/verified"
}

# Backup database
backup_database() {
    log "Starting database backup..."
    
    # Check if postgres container is running
    if docker-compose -f "$COMPOSE_FILE" ps postgres | grep -q "Up"; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
        
        docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U parroquia_user parroquia_db > "$BACKUP_FILE" || {
            warning "Database backup failed, but continuing with deployment"
            return 0
        }
        
        success "Database backed up to $BACKUP_FILE"
    else
        warning "Postgres container not running, skipping backup"
    fi
}

# Build and deploy
deploy() {
    log "Starting deployment process..."
    
    # Check and free ports before deployment
    check_and_free_ports
    
    # Stop and cleanup existing containers
    stop_and_cleanup_containers
    
    # Pull latest changes (if using git)
    if [ -d ".git" ]; then
        log "Pulling latest changes from git..."
        git pull origin main || warning "Git pull failed, continuing with local changes"
    fi
    
    # Additional cleanup to ensure ports are free
    log "Final port cleanup before deployment..."
    sleep 2
    
    # Verify ports are free before starting
    verify_ports_free
    
    # Build and start services
    log "Building and starting services..."
    docker-compose -f "$COMPOSE_FILE" up --build -d || error_exit "Failed to start services"
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Check if API is responding
    check_api_health
    
    success "Deployment completed successfully!"
}

# Verify required ports are free before deployment
verify_ports_free() {
    local required_ports=("80" "443" "8080" "8443")
    local blocked_ports=()
    
    for port in "${required_ports[@]}"; do
        if netstat -tulpn 2>/dev/null | grep -q ":$port " || ss -tulpn 2>/dev/null | grep -q ":$port "; then
            blocked_ports+=("$port")
        fi
    done
    
    if [ ${#blocked_ports[@]} -gt 0 ]; then
        warning "The following ports are still in use: ${blocked_ports[*]}"
        log "Waiting 5 seconds for ports to be released..."
        sleep 5
        
        # Check again
        local still_blocked=()
        for port in "${blocked_ports[@]}"; do
            if netstat -tulpn 2>/dev/null | grep -q ":$port " || ss -tulpn 2>/dev/null | grep -q ":$port "; then
                still_blocked+=("$port")
            fi
        done
        
        if [ ${#still_blocked[@]} -gt 0 ]; then
            error_exit "Ports still in use after cleanup: ${still_blocked[*]}. Please check manually and try again."
        fi
    fi
    
    success "All required ports are available"
}

# Check API health
check_api_health() {
    log "Checking API health..."
    
    for i in {1..30}; do
        if curl -f http://localhost/api/health >/dev/null 2>&1; then
            success "API is healthy and responding"
            return 0
        fi
        log "Attempt $i: API not ready yet, waiting..."
        sleep 10
    done
    
    error_exit "API health check failed after 5 minutes"
}

# Show logs
show_logs() {
    log "Showing recent logs..."
    docker-compose -f "$COMPOSE_FILE" logs --tail=50
}

# Show status
show_status() {
    log "Current container status:"
    docker-compose -f "$COMPOSE_FILE" ps
}

# Rollback function
rollback() {
    log "Starting rollback process..."
    
    # Stop current containers
    docker-compose -f "$COMPOSE_FILE" down
    
    # You would implement your rollback logic here
    # For example, deploying a previous version
    warning "Rollback functionality needs to be implemented based on your specific needs"
}

# Main deployment function
main() {
    log "Starting production deployment for $PROJECT_NAME"
    
    # Pre-deployment checks
    check_docker
    check_compose
    create_backup_dir
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env.production" ]; then
        warning ".env.production file not found. Please create it with your production environment variables."
        warning "Using default values for now, but you should update them before going live."
    fi
    
    # Backup existing data
    backup_database
    
    # Deploy
    deploy
    
    # Post-deployment verification
    show_status
    
    log "Deployment process completed!"
    echo ""
    echo "=== Deployment Summary ==="
    echo "Project: $PROJECT_NAME"
    echo "Time: $(date)"
    echo "Status: SUCCESS"
    echo ""
    echo "Next steps:"
    echo "1. Update your environment variables in .env.production"
    echo "2. Configure your domain and SSL certificates"
    echo "3. Set up monitoring and logging"
    echo "4. Configure regular backups"
    echo ""
    echo "Useful commands:"
    echo "- View logs: docker-compose -f $COMPOSE_FILE logs -f"
    echo "- Check status: docker-compose -f $COMPOSE_FILE ps"
    echo "- Stop services: docker-compose -f $COMPOSE_FILE down"
    echo "- Restart: docker-compose -f $COMPOSE_FILE restart"
}

# Command line argument handling
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "backup")
        check_docker
        check_compose
        create_backup_dir
        backup_database
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "rollback")
        rollback
        ;;
    "health")
        check_api_health
        ;;
    *)
        echo "Usage: $0 {deploy|backup|logs|status|rollback|health}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full deployment (default)"
        echo "  backup   - Backup database only"
        echo "  logs     - Show container logs"
        echo "  status   - Show container status"
        echo "  rollback - Rollback deployment"
        echo "  health   - Check API health"
        exit 1
        ;;
esac
