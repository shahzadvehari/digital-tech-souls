module.exports = {
  apps: [
    {
      name: 'dts-backend',
      script: 'npm',
      args: 'run start:prod --workspace=backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'dts-frontend',
      script: 'npm',
      args: 'start --workspace=frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
