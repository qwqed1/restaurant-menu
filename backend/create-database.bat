@echo off
echo Creating database restaurant_menu...
"C:\Program Files\PostgreSQL\18\bin\createdb.exe" -U postgres -p 5433 restaurant_menu
echo Database created!
pause
