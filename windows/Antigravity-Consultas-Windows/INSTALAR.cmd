@echo off
setlocal
title Instalar Antigravity Consultas

set "INSTALLER=%~dp0app\Instalar.ps1"
if not exist "%INSTALLER%" (
  echo ERRO: o instalador app\Instalar.ps1 nao foi encontrado.
  echo Extraia todo o ZIP antes de tentar novamente.
  echo.
  pause
  exit /b 2
)

echo Antigravity Consultas - instalacao no perfil do usuario
echo Nenhuma permissao de administrador sera solicitada.
echo.

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%INSTALLER%"
set "RESULT=%ERRORLEVEL%"

echo.
if "%RESULT%"=="0" (
  echo Instalacao concluida.
) else (
  echo A instalacao terminou com erro. Codigo: %RESULT%
)
echo.
pause
endlocal & exit /b %RESULT%
