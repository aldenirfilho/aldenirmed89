@echo off
setlocal
set "ANTIGRAVITY_URL=https://aldenirfilho.github.io/antigravity-consultas/"
start "" "%ANTIGRAVITY_URL%"
if errorlevel 1 (
  echo Nao foi possivel abrir o navegador padrao.
  echo Acesse manualmente: %ANTIGRAVITY_URL%
  pause
  endlocal
  exit /b 1
)
endlocal
exit /b 0
