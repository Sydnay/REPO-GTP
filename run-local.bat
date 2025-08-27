@echo off
cd /d %~dp0
call npm install
npx http-server -p 8080
pause
