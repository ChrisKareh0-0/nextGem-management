// Pre-build script to prepare the necessary files before the build starts
const fs = require('fs');
const path = require('path');

console.log('Running pre-build script to prepare the environment...');

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

// Create a minimal root page.js if needed
function createMinimalRootPage(filePath) {
  console.log(`Creating minimal root page.js at: ${filePath}`);
  const content = `
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ClientPaymentsWrapper } from "./components/Charts/client-payments-wrapper";
import { UpcomingPaymentsWrapper } from "./components/Tables/upcoming-payments-wrapper";
import { createTimeFrameExtractor } from "./utils/timeframe-extractor";

export const dynamic = 'force-dynamic';

export default function StatisticsPage({ searchParams }) {
  const { selected_time_frame } = searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);
  
  return _jsxs(_Fragment, {
    children: [
      _jsx("h1", {
        className: "mb-6 text-2xl font-semibold text-black dark:text-white",
        children: "Statistics"
      }),
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

// Create minimal files if they don't exist
const rootSourcePage = path.join(appDir, 'page.js');
const rootTargetPage = path.join(standaloneDir, 'page.js');

// Create root page
if (!fs.existsSync(rootSourcePage)) {
  createMinimalRootPage(rootSourcePage);
}

if (!fs.existsSync(rootTargetPage)) {
  if (fs.existsSync(rootSourcePage)) {
    console.log(`Copying page.js: ${rootSourcePage} -> ${rootTargetPage}`);
    fs.copyFileSync(rootSourcePage, rootTargetPage);
  } else {
    createMinimalRootPage(rootTargetPage);
  }
}

// Create a .next-prebuild-complete file to indicate that the pre-build script has run
const prebuildCompleteFile = path.join(nextDir, '.prebuild-complete');
fs.writeFileSync(prebuildCompleteFile, new Date().toISOString());

console.log('Pre-build script completed successfully!');
console.log('The environment is now ready for the build process.'); 