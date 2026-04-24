// Update the directory of the server and upload files API
module.exports = {
  apps: [
    {
      name: "CSV portal API",
      script: "/Users/pc/Desktop/API/CTS-API/server.js",
      cwd: "/Users/pc/Desktop/API/CTS-API", // Ensure the correct working directory for the server
      watch: true,
    },
    {
      name: "Upload Files API",
      script: "/Users/pc/Desktop/API/import-files-API/app.js",
      cwd: "/Users/pc/Desktop/API/import-files-API", // Ensure the correct working directory for the upload file
      watch: true,
    },
  ],
};
