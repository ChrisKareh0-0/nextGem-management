@echo off
echo Running Next.js build with enhanced fix...

echo Step 1: Running Next.js build...
call npm run build
echo Build process completed with exit code %ERRORLEVEL%
echo This is expected, continuing with fix...

echo Step 2: Running enhanced fix script...
node fix-simple.js
if %ERRORLEVEL% NEQ 0 (
  echo Fix script failed with error code %ERRORLEVEL%
  exit /b %ERRORLEVEL%
)

echo Step 3: Running Next.js build again to verify fix...
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo Second build failed with error code %ERRORLEVEL%
  echo The fix may not have worked completely.
  exit /b %ERRORLEVEL%
)

echo Build and fix completed successfully!
echo You can now run 'npm start' to start your application. 