@echo off
rem ===================================================================
rem  Yi Hua Huang - Portfolio : one-click local server
rem  Double-click this file. It starts a server in THIS folder and
rem  opens http://localhost:5500/ in your browser.
rem  Keep this window open while you browse. Close it to stop.
rem ===================================================================
cd /d "%~dp0"
set PORT=5500

where node >nul 2>nul
if %errorlevel%==0 (
  echo Starting Node server on http://localhost:%PORT%/
  start "" /min cmd /c "timeout /t 2 >nul && start "" http://localhost:%PORT%/"
  node serve.js
  goto end
)

where py >nul 2>nul
if %errorlevel%==0 (
  echo Node.js not found - using Python instead.
  echo Starting server on http://localhost:%PORT%/
  start "" /min cmd /c "timeout /t 2 >nul && start "" http://localhost:%PORT%/"
  py -m http.server %PORT%
  goto end
)

where python >nul 2>nul
if %errorlevel%==0 (
  echo Node.js not found - using Python instead.
  echo Starting server on http://localhost:%PORT%/
  start "" /min cmd /c "timeout /t 2 >nul && start "" http://localhost:%PORT%/"
  python -m http.server %PORT%
  goto end
)

echo.
echo   Neither Node.js nor Python is installed on this PC.
echo   No problem - just double-click  index.html  instead.
echo   The page works fine without any server.
echo.
pause

:end
