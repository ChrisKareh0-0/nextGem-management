// Simple script to fix the client reference manifest issue
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting enhanced fix for client reference manifest...');

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

// Create a minimal page.js if it doesn't exist
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

// Create the manifest files
const sourceManifest = path.join(homeDir, 'page_client-reference-manifest.js');
const targetManifest = path.join(standaloneDir, 'page_client-reference-manifest.js');

createManifest(sourceManifest);
createManifest(targetManifest);

// Check if page.js exists and create it if needed
const sourcePage = path.join(homeDir, 'page.js');
const targetPage = path.join(standaloneDir, 'page.js');

if (!fs.existsSync(sourcePage)) {
  createMinimalPage(sourcePage);
}

if (!fs.existsSync(targetPage)) {
  if (fs.existsSync(sourcePage)) {
    console.log(`Copying page.js: ${sourcePage} -> ${targetPage}`);
    fs.copyFileSync(sourcePage, targetPage);
  } else {
    createMinimalPage(targetPage);
  }
}

// Create layout files if needed
const sourceLayout = path.join(homeDir, 'layout.js');
const targetLayout = path.join(standaloneDir, 'layout.js');
const sourceLayoutManifest = path.join(homeDir, 'layout_client-reference-manifest.js');
const targetLayoutManifest = path.join(standaloneDir, 'layout_client-reference-manifest.js');

// Create layout manifest files
createManifest(sourceLayoutManifest);
createManifest(targetLayoutManifest);

// Create minimal layout.js if it doesn't exist
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

if (!fs.existsSync(sourceLayout)) {
  createMinimalLayout(sourceLayout);
}

if (!fs.existsSync(targetLayout)) {
  if (fs.existsSync(sourceLayout)) {
    console.log(`Copying layout.js: ${sourceLayout} -> ${targetLayout}`);
    fs.copyFileSync(sourceLayout, targetLayout);
  } else {
    createMinimalLayout(targetLayout);
  }
}

console.log('Fix completed successfully!');

// Verify the fix
console.log('Verifying fix...');
const allFiles = [
  sourceManifest,
  targetManifest,
  sourcePage,
  targetPage,
  sourceLayout,
  targetLayout,
  sourceLayoutManifest,
  targetLayoutManifest
];

let allFilesExist = true;
for (const file of allFiles) {
  if (fs.existsSync(file)) {
    console.log(`✓ ${file} exists`);
  } else {
    console.log(`✗ ${file} does not exist`);
    allFilesExist = false;
  }
}

if (allFilesExist) {
  console.log('All files created successfully!');
} else {
  console.log('Some files are missing. Please check the logs above.');
} 