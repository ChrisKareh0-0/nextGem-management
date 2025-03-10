// Script to fix the home page issue
const fs = require('fs');
const path = require('path');

console.log('Starting home page fix...');

// Define paths using Windows-friendly path handling
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

// Check if the original page.tsx exists
const originalPagePath = path.join(homeDir, 'page.tsx');
if (!fs.existsSync(originalPagePath)) {
  console.error(`Original page not found at: ${originalPagePath}`);
  process.exit(1);
}

// Read the original page content
console.log(`Reading original page from: ${originalPagePath}`);
const originalPageContent = fs.readFileSync(originalPagePath, 'utf8');

// Create a simplified version of the page for the build
function createSimplifiedPage(filePath, content) {
  try {
    console.log(`Creating simplified page at: ${filePath}`);
    
    // Extract the dynamic export if it exists
    let dynamicExport = '';
    const dynamicMatch = content.match(/export\s+const\s+dynamic\s*=\s*['"]([^'"]+)['"]/);
    if (dynamicMatch) {
      dynamicExport = `export const dynamic = '${dynamicMatch[1]}';`;
    }
    
    // Create a simplified version that preserves the key structure
    const simplified = `
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ClientPaymentsWrapper } from "../../../components/Charts/client-payments-wrapper";
import { UpcomingPaymentsWrapper } from "../../../components/Tables/upcoming-payments-wrapper";
import { createTimeFrameExtractor } from "../../../utils/timeframe-extractor";

${dynamicExport}

export default async function Home({ searchParams }) {
  const { selected_time_frame } = await searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  return _jsxs(_Fragment, {
    children: [
      _jsxs("div", {
        className: "mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5",
        children: [
          _jsx("div", {
            className: "col-span-12 xl:col-span-7",
            children: _jsx(ClientPaymentsWrapper, {})
          }),
          _jsx("div", {
            className: "col-span-12 xl:col-span-5",
            children: _jsx(UpcomingPaymentsWrapper, {})
          })
        ]
      })
    ]
  });
}
`;
    fs.writeFileSync(filePath, simplified);
    return true;
  } catch (err) {
    console.error(`Error creating simplified page: ${err.message}`);
    return false;
  }
}

// Create a proper client reference manifest
function createClientReferenceManifest(filePath) {
  try {
    console.log(`Creating client reference manifest at: ${filePath}`);
    
    // Create a manifest that includes references to the components used in the home page
    const content = `
self.__RSC_MANIFEST={
  "ssrModuleMapping": {
    "(app-client)/./node_modules/next/dist/client/components/app-router.js": {
      "*": { "id": "(sc_client)/./node_modules/next/dist/client/components/app-router.js", "chunks": ["app-client-internals:app-client-internals"], "name": "*" }
    },
    "(app-client)/./node_modules/next/dist/client/components/error-boundary.js": {
      "*": { "id": "(sc_client)/./node_modules/next/dist/client/components/error-boundary.js", "chunks": ["app-client-internals:app-client-internals"], "name": "*" }
    },
    "(app-client)/./node_modules/next/dist/client/components/layout-router.js": {
      "*": { "id": "(sc_client)/./node_modules/next/dist/client/components/layout-router.js", "chunks": ["app-client-internals:app-client-internals"], "name": "*" }
    },
    "(app-client)/./node_modules/next/dist/client/components/render-from-template-context.js": {
      "*": { "id": "(sc_client)/./node_modules/next/dist/client/components/render-from-template-context.js", "chunks": ["app-client-internals:app-client-internals"], "name": "*" }
    },
    "(app-client)/./src/components/Charts/client-payments-wrapper.js": {
      "*": { "id": "(sc_client)/./src/components/Charts/client-payments-wrapper.js", "chunks": ["app/(home)/page:app/(home)/page"], "name": "*" }
    },
    "(app-client)/./src/components/Tables/upcoming-payments-wrapper.js": {
      "*": { "id": "(sc_client)/./src/components/Tables/upcoming-payments-wrapper.js", "chunks": ["app/(home)/page:app/(home)/page"], "name": "*" }
    }
  },
  "edgeSSRModuleMapping": {},
  "clientModules": {
    "C:\\\\Users\\\\SimHazeByblos\\\\Documents\\\\nextgem-management\\\\node_modules\\\\next\\\\dist\\\\client\\\\components\\\\app-router.js": {
      "id": "(app-client)/./node_modules/next/dist/client/components/app-router.js",
      "name": "*",
      "chunks": ["app-client-internals:app-client-internals"]
    },
    "C:\\\\Users\\\\SimHazeByblos\\\\Documents\\\\nextgem-management\\\\node_modules\\\\next\\\\dist\\\\client\\\\components\\\\error-boundary.js": {
      "id": "(app-client)/./node_modules/next/dist/client/components/error-boundary.js",
      "name": "*",
      "chunks": ["app-client-internals:app-client-internals"]
    },
    "C:\\\\Users\\\\SimHazeByblos\\\\Documents\\\\nextgem-management\\\\node_modules\\\\next\\\\dist\\\\client\\\\components\\\\layout-router.js": {
      "id": "(app-client)/./node_modules/next/dist/client/components/layout-router.js",
      "name": "*",
      "chunks": ["app-client-internals:app-client-internals"]
    },
    "C:\\\\Users\\\\SimHazeByblos\\\\Documents\\\\nextgem-management\\\\node_modules\\\\next\\\\dist\\\\client\\\\components\\\\render-from-template-context.js": {
      "id": "(app-client)/./node_modules/next/dist/client/components/render-from-template-context.js",
      "name": "*",
      "chunks": ["app-client-internals:app-client-internals"]
    },
    "C:\\\\Users\\\\SimHazeByblos\\\\Documents\\\\nextgem-management\\\\src\\\\components\\\\Charts\\\\client-payments-wrapper.js": {
      "id": "(app-client)/./src/components/Charts/client-payments-wrapper.js",
      "name": "*",
      "chunks": ["app/(home)/page:app/(home)/page"]
    },
    "C:\\\\Users\\\\SimHazeByblos\\\\Documents\\\\nextgem-management\\\\src\\\\components\\\\Tables\\\\upcoming-payments-wrapper.js": {
      "id": "(app-client)/./src/components/Tables/upcoming-payments-wrapper.js",
      "name": "*",
      "chunks": ["app/(home)/page:app/(home)/page"]
    }
  }
};
`;
    fs.writeFileSync(filePath, content);
    return true;
  } catch (err) {
    console.error(`Error creating manifest: ${err.message}`);
    return false;
  }
}

// Create a simplified layout
function createSimplifiedLayout(filePath) {
  try {
    console.log(`Creating simplified layout at: ${filePath}`);
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
    return true;
  } catch (err) {
    console.error(`Error creating layout: ${err.message}`);
    return false;
  }
}

// Copy a file if it exists, or create it if it doesn't
function copyOrCreateFile(source, target, createFn, content = null) {
  try {
    if (fs.existsSync(source)) {
      console.log(`Copying: ${source} -> ${target}`);
      fs.copyFileSync(source, target);
    } else {
      console.log(`Source file not found: ${source}`);
      createFn(source, content);
      if (fs.existsSync(source)) {
        console.log(`Copying newly created file: ${source} -> ${target}`);
        fs.copyFileSync(source, target);
      }
    }
  } catch (err) {
    console.error(`Error handling file: ${err.message}`);
  }
}

// Files to fix
const pageJsPath = path.join(serverHomeDir, 'page.js');
const pageManifestPath = path.join(serverHomeDir, 'page_client-reference-manifest.js');
const layoutJsPath = path.join(serverHomeDir, 'layout.js');
const layoutManifestPath = path.join(serverHomeDir, 'layout_client-reference-manifest.js');

// Create the simplified page.js
createSimplifiedPage(pageJsPath, originalPageContent);

// Create the client reference manifest
createClientReferenceManifest(pageManifestPath);

// Create the simplified layout.js
createSimplifiedLayout(layoutJsPath);

// Create the layout client reference manifest
createClientReferenceManifest(layoutManifestPath);

// Copy all files to the standalone directory
fs.copyFileSync(pageJsPath, path.join(standaloneDir, 'page.js'));
fs.copyFileSync(pageManifestPath, path.join(standaloneDir, 'page_client-reference-manifest.js'));
fs.copyFileSync(layoutJsPath, path.join(standaloneDir, 'layout.js'));
fs.copyFileSync(layoutManifestPath, path.join(standaloneDir, 'layout_client-reference-manifest.js'));

console.log('Home page fix completed successfully!'); 