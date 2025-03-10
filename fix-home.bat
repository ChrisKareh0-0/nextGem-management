@echo off
echo Running Next.js build with home page fix...
call npm run build:home
if %ERRORLEVEL% NEQ 0 (
  echo Build failed with error code %ERRORLEVEL%
  echo Attempting to run home page fix script directly...
  node fix-home-page.js
  if %ERRORLEVEL% NEQ 0 (
    echo Fix script failed with error code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
  )
)
echo Build completed successfully! 