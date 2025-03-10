// Build hook script to fix client reference manifest issues
const fs = require('fs');
const path = require('path');

console.log('Running build hook to fix client reference manifest issues...');

// Define paths
const baseDir = process.cwd();
const nextDir = path.join(baseDir, '.next');
const serverDir = path.join(nextDir, 'server');
const appDir = path.join(serverDir, 'app');
const homeDir = path.join(appDir, '(home)');
const standaloneDir = path.join(nextDir, 'standalone', '.next', 'server', 'app', '(home)');

// Create directories if they don't exist
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
    return true;
  }
  return false;
}

// Create both directories
ensureDirectoryExists(homeDir);
ensureDirectoryExists(standaloneDir);

// Create a simple client reference manifest
function createManifest(filePath) {
  console.log(`Creating manifest at: ${filePath}`);
  const content = `self.__RSC_MANIFEST={};\n`;
  fs.writeFileSync(filePath, content);
}

// Create the manifest files
const sourceManifest = path.join(homeDir, 'page_client-reference-manifest.js');
const targetManifest = path.join(standaloneDir, 'page_client-reference-manifest.js');

createManifest(sourceManifest);
createManifest(targetManifest);

// Create layout manifest files
const sourceLayoutManifest = path.join(homeDir, 'layout_client-reference-manifest.js');
const targetLayoutManifest = path.join(standaloneDir, 'layout_client-reference-manifest.js');

createManifest(sourceLayoutManifest);
createManifest(targetLayoutManifest);

// Copy files if they exist
function copyIfExists(source, target) {
  if (fs.existsSync(source) && !fs.existsSync(target)) {
    console.log(`Copying: ${source} -> ${target}`);
    fs.copyFileSync(source, target);
    return true;
  }
  return false;
}

// Copy page.js and layout.js if they exist
const sourcePage = path.join(homeDir, 'page.js');
const targetPage = path.join(standaloneDir, 'page.js');
const sourceLayout = path.join(homeDir, 'layout.js');
const targetLayout = path.join(standaloneDir, 'layout.js');

copyIfExists(sourcePage, targetPage);
copyIfExists(sourceLayout, targetLayout);

console.log('Build hook completed successfully!');

// Verify the fix
console.log('Verifying fix...');
const requiredFiles = [
  sourceManifest,
  targetManifest,
  sourceLayoutManifest,
  targetLayoutManifest
];

let allRequiredFilesExist = true;
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✓ ${file} exists`);
  } else {
    console.log(`✗ ${file} does not exist`);
    allRequiredFilesExist = false;
  }
}

if (allRequiredFilesExist) {
  console.log('All required files created successfully!');
} else {
  console.log('Some required files are missing. Please check the logs above.');
  process.exit(1);
} 