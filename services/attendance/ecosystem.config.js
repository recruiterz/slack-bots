module.exports = {
  apps: [
    {
      name: '@recruiterz/attendance',
      script: './build/app.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
