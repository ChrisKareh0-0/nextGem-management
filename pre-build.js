// Pre-build script to prepare the necessary files before the build starts
const fs = require('fs');
const path = require('path');

console.log('Running pre-build script to prepare the environment...');

// Define paths
const baseDir = process.cwd();
const srcDir = path.join(baseDir, 'src');
const appDir = path.join(srcDir, 'app');
const homeDir = path.join(appDir, '(home)');
const nextDir = path.join(baseDir, '.next');
const serverDir = path.join(nextDir, 'server');
const serverAppDir = path.join(serverDir, 'app');
const serverHomeDir = path.join(serverAppDir, '(home)');
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

// Create all necessary directories
ensureDirectoryExists(serverHomeDir);
ensureDirectoryExists(standaloneDir);

// Create a simple client reference manifest
function createManifest(filePath) {
  console.log(`Creating manifest at: ${filePath}`);
  const content = `self.__RSC_MANIFEST={};\n`;
  fs.writeFileSync(filePath, content);
}

// Create the manifest files
const sourceManifest = path.join(serverHomeDir, 'page_client-reference-manifest.js');
const targetManifest = path.join(standaloneDir, 'page_client-reference-manifest.js');
const sourceLayoutManifest = path.join(serverHomeDir, 'layout_client-reference-manifest.js');
const targetLayoutManifest = path.join(standaloneDir, 'layout_client-reference-manifest.js');

createManifest(sourceManifest);
createManifest(targetManifest);
createManifest(sourceLayoutManifest);
createManifest(targetLayoutManifest);

// Create a minimal page.js if needed
function createMinimalPage(filePath) {
  console.log(`Creating minimal page.js at: ${filePath}`);
  const content = `
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";

export const dynamic = 'force-dynamic';

export default function HomePage({ searchParams }) {
  return _jsxs(_Fragment, {
    children: [
      _jsxs("div", {
        className: "mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5",
        children: [
          _jsx("div", {
            className: "col-span-12 xl:col-span-7",
            children: _jsx("div", { children: "Client Payments" })
          }),
          _jsx("div", {
            className: "col-span-12 xl:col-span-5",
            children: _jsx("div", { children: "Upcoming Payments" })
          })
        ]
      })
    ]
  });
}
`;
  fs.writeFileSync(filePath, content);
}

// Create a minimal layout.js if needed
function createMinimalLayout(filePath) {
  console.log(`Creating minimal layout.js at: ${filePath}`);
  const content = `
import { jsx as _jsx } from "react/jsx-runtime";

export default function HomeLayout({ children }) {
  return _jsx("div", { 
    className: "mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10",
    children: children 
  });
}
`;
  fs.writeFileSync(filePath, content);
}

// Create minimal files if they don't exist
const sourcePage = path.join(serverHomeDir, 'page.js');
const targetPage = path.join(standaloneDir, 'page.js');
const sourceLayout = path.join(serverHomeDir, 'layout.js');
const targetLayout = path.join(standaloneDir, 'layout.js');

if (!fs.existsSync(sourcePage)) {
  createMinimalPage(sourcePage);
}

if (!fs.existsSync(targetPage)) {
  createMinimalPage(targetPage);
}

if (!fs.existsSync(sourceLayout)) {
  createMinimalLayout(sourceLayout);
}

if (!fs.existsSync(targetLayout)) {
  createMinimalLayout(targetLayout);
}

// Create a .next-prebuild-complete file to indicate that the pre-build script has run
const prebuildCompleteFile = path.join(nextDir, '.prebuild-complete');
fs.writeFileSync(prebuildCompleteFile, new Date().toISOString());

console.log('Pre-build script completed successfully!');
console.log('The environment is now ready for the build process.'); 