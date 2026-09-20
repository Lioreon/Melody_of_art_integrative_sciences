@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 set "PATH=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%PATH%"
where pnpm >nul 2>nul
if errorlevel 1 set "PATH=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback;%PATH%"
where pnpm >nul 2>nul
if errorlevel 1 (
  echo Instala Node.js 24 y pnpm 11.19.0. Consulta README.md.
  pause
  exit /b 1
)
if not exist node_modules (
  call pnpm install --frozen-lockfile
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
echo Abre la direccion local que aparece a continuacion. Mantiene esta ventana abierta.
call pnpm dev
pause
