@echo off
title Halal Hall Server
color 0A
echo ============================================
echo   Halal Hall Restaurant Server
echo ============================================
echo.
echo Starting server on port 3001...
echo.

cd /d "%~dp0"
npm start

pause
