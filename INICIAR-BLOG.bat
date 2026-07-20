@echo off
setlocal EnableExtensions
chcp 65001 >nul
title GTChat Blog - Servidor local

cd /d "%~dp0"

echo.
echo ==================================================
echo              GTChat Blog - Inicialização
echo ==================================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERRO] O Node.js não foi encontrado neste computador.
  echo Instale o Node.js e execute este arquivo novamente.
  goto :erro
)

where npm >nul 2>&1
if errorlevel 1 (
  echo [ERRO] O npm não foi encontrado neste computador.
  echo Reinstale o Node.js e execute este arquivo novamente.
  goto :erro
)

powershell.exe -NoProfile -Command "try { $response = Invoke-WebRequest -UseBasicParsing 'http://localhost:3000' -TimeoutSec 2; if ($response.StatusCode -ge 200) { exit 0 } } catch {}; exit 1" >nul 2>&1
if not errorlevel 1 (
  echo O blog já está funcionando em http://localhost:3000
  start "" "http://localhost:3000"
  goto :fim
)

if not exist "node_modules\" (
  echo Instalando dependências. Isso pode demorar na primeira execução...
  call npm ci
  if errorlevel 1 goto :erro
  echo.
)

set "PRIMEIRA_EXECUCAO=0"
if not exist "data\blog.sqlite" set "PRIMEIRA_EXECUCAO=1"

echo Preparando os bancos de dados do blog e da lista de e-mails...
call npm run db:migrate
if errorlevel 1 goto :erro

if "%PRIMEIRA_EXECUCAO%"=="1" (
  echo Criando os dados iniciais do blog...
  call npm run db:seed
  if errorlevel 1 goto :erro
)

echo.
echo Blog pronto. O navegador será aberto automaticamente.
echo Mantenha esta janela aberta enquanto estiver usando o blog.
echo Para desligar, pressione Ctrl+C e confirme com S.
echo.

start "" powershell.exe -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3000'"
call npm run dev
goto :fim

:erro
echo.
echo Não foi possível iniciar o blog.
echo Verifique a mensagem acima e tente novamente.
pause
exit /b 1

:fim
endlocal
