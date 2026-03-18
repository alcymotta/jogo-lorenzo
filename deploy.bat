@echo off
REM ============================================
REM Script para enviar o jogo ao GitHub Pages
REM ============================================

echo.
echo ==================================
echo  Ilha de Capibara - GitHub Deploy
echo ==================================
echo.

REM Verificar status
git status
echo.

REM Perguntar se deseja continuar
set /p resposta="Deseja fazer upload para GitHub? (s/n): "
if /i not "%resposta%"=="s" (
    echo Cancelado.
    exit /b 0
)

REM Perguntar mensagem de commit
set /p mensagem="Digite a mensagem de commit (ou deixe em branco): "
if "%mensagem%"=="" (
    set mensagem=Update game files
)

echo.
echo Adicionando arquivo...
git add .

echo Fazendo commit...
git commit -m "%mensagem%"

echo.
echo 📤 Enviando para GitHub...
git push origin main

echo.
echo ✅ Deploy concluído!
echo.
echo Acesse seu jogo em:
echo https://USERNAME.github.io/lorenzo
echo.
echo (Substitua USERNAME pelo seu usuário do GitHub)
