module.exports = {
  apps: [
    {
      name: 'CSV portal API',
      script: '/Users/pc/Desktop/API/CTS-API/server.js',
      cwd: '/Users/pc/Desktop/API/CTS-API', // Ensure the correct working directory
      watch: true,
    },
    {
      name: 'Upload Files API',
      script: '/Users/pc/Desktop/API/import-files-API/app.js',
      cwd: '/Users/pc/Desktop/API/import-files-API',
      watch: true,
    },
  ],
};
