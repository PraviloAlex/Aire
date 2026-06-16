@echo off
setlocal EnableExtensions

cd /d "%~dp0"
title Aire - run latest

set "PORT=4173"
set "HOST=127.0.0.1"
set "URL=http://%HOST%:%PORT%"
set "CHECK_ONLY=0"
set "UPDATE_DEPS=0"

if /I "%~1"=="--check" set "CHECK_ONLY=1"
if /I "%~2"=="--check" set "CHECK_ONLY=1"
if /I "%~1"=="--update" set "UPDATE_DEPS=1"
if /I "%~2"=="--update" set "UPDATE_DEPS=1"

echo.
echo ========================================
echo   Aire - update, build, run
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or is not in PATH.
  echo Install Node.js LTS, then run this file again.
  pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm is not available.
  echo Reinstall Node.js LTS, then run this file again.
  pause
  exit /b 1
)

if not exist package.json (
  echo [ERROR] package.json was not found.
  echo This file must be run from the Aire project folder.
  pause
  exit /b 1
)

echo [1/5] Checking dependencies...
if not exist node_modules (
  echo node_modules was not found. Installing from package-lock...
  call npm.cmd ci --force --prefer-offline --no-audit --no-fund
  if errorlevel 1 (
    echo.
    echo [ERROR] Dependency install failed.
    pause
    exit /b 1
  )
) else (
  if "%UPDATE_DEPS%"=="1" (
    echo Updating dependencies from package.json...
    call npm.cmd install --force --prefer-offline --no-audit --no-fund
    if errorlevel 1 (
      echo.
      echo [ERROR] Dependency update failed.
      pause
      exit /b 1
    )
  ) else (
    echo Dependencies are already installed. Use --update to refresh them.
  )
)

echo.
echo [2/5] Optional dependency maintenance...
if "%UPDATE_DEPS%"=="1" (
  call npm.cmd audit fix
  if errorlevel 1 (
    echo.
    echo [WARN] Safe audit fix could not fix everything automatically.
    echo The app will continue only if the regular audit passes later.
  )
) else (
  echo Skipped. Use --update to run npm install and safe audit fix.
)

echo.
echo [3/5] Running checks...
call npm.cmd run typecheck
if errorlevel 1 (
  echo.
  echo [ERROR] Type check failed.
  pause
  exit /b 1
)

call npm.cmd run lint
if errorlevel 1 (
  echo.
  echo [ERROR] Lint failed.
  pause
  exit /b 1
)

call npm.cmd test
if errorlevel 1 (
  echo.
  echo [ERROR] Tests failed.
  pause
  exit /b 1
)

call npm.cmd audit --audit-level=moderate
if errorlevel 1 (
  echo.
  echo [WARN] npm audit did not complete cleanly.
  echo This can happen when the registry or npm cache log folder is unavailable.
  echo Continuing with local launch because typecheck, lint, and tests passed.
)

echo.
echo [4/5] Building latest web version...
call npm.cmd run build
if errorlevel 1 (
  echo.
  echo [ERROR] Build failed.
  pause
  exit /b 1
)

if "%CHECK_ONLY%"=="1" (
  echo.
  echo [OK] Check mode complete. Latest build is ready in dist.
  endlocal
  exit /b 0
)

echo.
echo [5/5] Starting Aire...
echo Opening %URL%
start "" "%URL%"
echo.
echo Aire is starting at %URL%
echo Keep this window open while using the app.
echo Press Ctrl+C to stop.
echo.

set "PORT=%PORT%"
set "HOST=%HOST%"
call npm.cmd run preview

endlocal
