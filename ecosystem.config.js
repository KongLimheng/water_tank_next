module.exports = {
  apps: [
    {
      name: 'water_tank-app',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/water_tank-app',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
