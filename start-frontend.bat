@echo off
echo Starting Mandi Frontend...
cd /d "d:\MandiApp\Frontend"
set PATH=%PATH%;C:\Program Files\nodejs;%APPDATA%\npm
call npx @ionic/cli serve
pause
