@echo off
setlocal
title Desinstalar Antigravity Consultas

set "UNINSTALLER=%~dp0app\Desinstalar.ps1"
if not exist "%UNINSTALLER%" (
  echo ERRO: o desinstalador app\Desinstalar.ps1 nao foi encontrado.
  echo Extraia todo o ZIP antes de tentar novamente.
  echo.
  pause
  exit /b 2
)

echo Antigravity Consultas - remocao do perfil do usuario
echo Apenas os arquivos e atalhos conhecidos do aplicativo serao removidos.
echo.

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%UNINSTALLER%"
set "RESULT=%ERRORLEVEL%"

echo.
if "%RESULT%"=="0" (
  echo Desinstalacao concluida.
) else (
  echo A desinstalacao terminou com erro. Codigo: %RESULT%
)
echo.
pause
endlocal & exit /b %RESULT%
