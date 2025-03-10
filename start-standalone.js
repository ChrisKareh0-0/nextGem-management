// Script to start the application in standalone mode
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting application in standalone mode...');

// Check if the standalone server file exists
const standaloneServerPath = path.join(process.cwd(), '.next', 'standalone', 'server.js');
if (!fs.existsSync(standaloneServerPath)) {
  console.error(`Error: Standalone server file not found at ${standaloneServerPath}`);
  console.error('Please run "yarn build" first to generate the standalone server.');
  process.exit(1);
}

// Copy the public directory to the standalone directory if it doesn't exist
const publicDir = path.join(process.cwd(), 'public');
const standalonePublicDir = path.join(process.cwd(), '.next', 'standalone', 'public');

if (fs.existsSync(publicDir) && !fs.existsSync(standalonePublicDir)) {
  console.log('Copying public directory to standalone directory...');
  fs.mkdirSync(standalonePublicDir, { recursive: true });
  
  // Copy all files from public to standalone/public
  const files = fs.readdirSync(publicDir);
  for (const file of files) {
    const srcPath = path.join(publicDir, file);
    const destPath = path.join(standalonePublicDir, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      // Use recursive copy for directories
      fs.cpSync(srcPath, destPath, { recursive: true });
    } else {
      // Simple copy for files
      fs.copyFileSync(srcPath, destPath);
    }
  }
  
  console.log('Public directory copied successfully.');
}

// Start the standalone server
console.log('Starting standalone server...');
try {
  // Change to the standalone directory
  process.chdir(path.join(process.cwd(), '.next', 'standalone'));
  
  // Start the server
  execSync('node server.js', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: process.env.PORT || '3000'
    }
  });
} catch (error) {
  console.error('Error starting standalone server:', error.message);
  process.exit(1);
} 