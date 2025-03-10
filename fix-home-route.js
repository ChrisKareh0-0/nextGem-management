// Script to fix the home route group issue
const fs = require('fs');
const path = require('path');

console.log('Starting fix for home route group...');

// Define paths
const sourceDir = path.join(process.cwd(), '.next/server/app/(home)');
const targetDir = path.join(process.cwd(), '.next/standalone/.next/server/app/(home)');

// Create directories if they don't exist
try {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`Created directory: ${targetDir}`);
  }
} catch (err) {
  console.error(`Error creating directory: ${err.message}`);
}

// Function to create an empty client reference manifest
function createEmptyManifest(filePath) {
  try {
    fs.writeFileSync(filePath, 'self.__RSC_MANIFEST={};');
    console.log(`Created empty manifest at: ${filePath}`);
    return true;
  } catch (err) {
    console.error(`Error creating manifest: ${err.message}`);
    return false;
  }
}

// Function to copy a file if it exists
function copyFileIfExists(source, target) {
  try {
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, target);
      console.log(`Copied: ${source} -> ${target}`);
      return true;
    } else {
      console.log(`Source file not found: ${source}`);
      return false;
    }
  } catch (err) {
    console.error(`Error copying file: ${err.message}`);
    return false;
  }
}

// List of files to check and copy
const filesToFix = [
  'page.js',
  'page_client-reference-manifest.js',
  'layout.js',
  'layout_client-reference-manifest.js'
];

// Process each file
filesToFix.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);
  
  // Try to copy the file
  const copied = copyFileIfExists(sourcePath, targetPath);
  
  // If it's a manifest file and copying failed, create an empty one
  if (!copied && file.includes('client-reference-manifest')) {
    // Create in source directory
    createEmptyManifest(sourcePath);
    // Then copy to target
    copyFileIfExists(sourcePath, targetPath);
  }
});

console.log('Home route group fix completed.'); 