@echo off
title vostochnyi dvor Server
color 0A
echo ============================================
echo   vostochnyi dvor Restaurant Server
echo ============================================
echo.
echo Starting server on port 3000...
echo.

cd /d "%~dp0"
npm start

pause
