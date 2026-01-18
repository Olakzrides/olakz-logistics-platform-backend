module.exports = {
  apps: [
    {
      name: 'auth-service',
      script: './services/auth-service/dist/server.js',
      cwd: '/home/quayyum/olakz-logistics-platform-backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4001
      },
      error_file: './logs/auth-service-error.log',
      out_file: './logs/auth-service-out.log',
      log_file: './logs/auth-service-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G'
    },
    {
      name: 'core-logistics',
      script: './services/core-logistics/dist/server.js',
      cwd: '/home/quayyum/olakz-logistics-platform-backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4002
      },
      error_file: './logs/core-logistics-error.log',
      out_file: './logs/core-logistics-out.log',
      log_file: './logs/core-logistics-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G'
    },
    {
      name: 'payment-service',
      script: './services/payment-service/dist/server.js',
      cwd: '/home/quayyum/olakz-logistics-platform-backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4003
      },
      error_file: './logs/payment-service-error.log',
      out_file: './logs/payment-service-out.log',
      log_file: './logs/payment-service-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G'
    }
  ]
};