// Custom build script for deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting custom build process for deployment...');

// Run the pre-build script
console.log('Step 1: Running pre-build script...');
try {
  require('./pre-build.js');
} catch (error) {
  console.error('Error running pre-build script:', error.message);
  console.log('Continuing with build process...');
}

// Run the build
console.log('Step 2: Running Next.js build...');
try {
  execSync('next build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.warn('Build encountered errors:', error.message);
  console.log('Attempting to fix issues and rebuild...');
  
  // Run the build hook
  try {
    require('./build-hook.js');
    
    // Try building again
    console.log('Attempting to build again...');
    execSync('next build', { stdio: 'inherit' });
    console.log('Second build completed successfully!');
  } catch (secondError) {
    console.error('Second build failed:', secondError.message);
    process.exit(1);
  }
}

// Run the post-build hook
console.log('Step 3: Running post-build hook...');
try {
  require('./build-hook.js');
  console.log('Post-build hook completed successfully!');
} catch (error) {
  console.error('Error running post-build hook:', error.message);
}

console.log('Build process completed successfully!');
console.log('The application is ready for deployment.'); 