@echo off
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -c "ALTER USER postgres WITH PASSWORD 'postgres';"
pause
