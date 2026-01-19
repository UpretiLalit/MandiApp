@echo off
cd /d "%~dp0"
set PATH=C:\Program Files\nodejs;%PATH%
set NODE_OPTIONS=--max-old-space-size=4096
echo Starting Angular Dev Server...
echo Please wait, this may take 2-3 minutes...
echo.
node node_modules\@angular\cli\bin\ng serve --port 8100
pause
