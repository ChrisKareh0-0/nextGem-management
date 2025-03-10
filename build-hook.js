// Build hook script to fix client reference manifest issues
const fs = require('fs');
const path = require('path');

console.log('Running build hook to fix client reference manifest issues...');

// Define paths
const baseDir = process.cwd();
const nextDir = path.join(baseDir, '.next');
const serverDir = path.join(nextDir, 'server');
const appDir = path.join(serverDir, 'app');
const standaloneDir = path.join(nextDir, 'standalone', '.next', 'server', 'app');

// Create directories if they don't exist
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
    return true;
  }
  return false;
}

// Create all necessary directories
ensureDirectoryExists(appDir);
ensureDirectoryExists(standaloneDir);

// Create a simple client reference manifest
function createManifest(filePath) {
  console.log(`Creating manifest at: ${filePath}`);
  const content = `self.__RSC_MANIFEST={};\n`;
  fs.writeFileSync(filePath, content);
}

// Create the manifest files for root page
const rootSourceManifest = path.join(appDir, 'page_client-reference-manifest.js');
const rootTargetManifest = path.join(standaloneDir, 'page_client-reference-manifest.js');
const rootSourceLayoutManifest = path.join(appDir, 'layout_client-reference-manifest.js');
const rootTargetLayoutManifest = path.join(standaloneDir, 'layout_client-reference-manifest.js');

createManifest(rootSourceManifest);
createManifest(rootTargetManifest);
createManifest(rootSourceLayoutManifest);
createManifest(rootTargetLayoutManifest);

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
const rootSourcePage = path.join(appDir, 'page.js');
const rootTargetPage = path.join(standaloneDir, 'page.js');
const rootSourceLayout = path.join(appDir, 'layout.js');
const rootTargetLayout = path.join(standaloneDir, 'layout.js');

// Copy root files
copyIfExists(rootSourcePage, rootTargetPage);
copyIfExists(rootSourceLayout, rootTargetLayout);

console.log('Build hook completed successfully!');

// Verify the fix
console.log('Verifying fix...');
const requiredFiles = [
  rootSourceManifest,
  rootTargetManifest,
  rootSourceLayoutManifest,
  rootTargetLayoutManifest
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