module.exports = {
  apps: [
    {
      name: 'parroquia-api',
      script: 'src/app.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      // PM2 monitoring and restart configuration
      max_memory_restart: '1G',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      // Auto restart configuration
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'temp'],
      // Advanced PM2 features
      min_uptime: '10s',
      max_restarts: 10,
      // Health monitoring
      health_check_grace_period: 3000,
      // Process management
      kill_timeout: 5000,
      listen_timeout: 8000,
      // Logging
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
