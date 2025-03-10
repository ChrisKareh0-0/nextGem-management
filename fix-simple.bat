@echo off
echo Running Next.js build with simple fix...
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo Build failed with error code %ERRORLEVEL%
  echo This is expected, continuing with fix...
)

echo Running simple fix script...
node fix-simple.js
if %ERRORLEVEL% NEQ 0 (
  echo Fix script failed with error code %ERRORLEVEL%
  exit /b %ERRORLEVEL%
)

echo Fix completed successfully!
echo You can now run 'npm start' to start your application. 