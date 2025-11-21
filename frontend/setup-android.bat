@echo off
echo ============================================
echo  Установка Capacitor для Android APK
echo ============================================
echo.

echo [1/5] Установка зависимостей...
call npm install
if errorlevel 1 (
    echo Ошибка при установке зависимостей!
    pause
    exit /b 1
)

echo.
echo [2/5] Сборка приложения...
call npm run build
if errorlevel 1 (
    echo Ошибка при сборке приложения!
    pause
    exit /b 1
)

echo.
echo [3/5] Добавление Android платформы...
call npx cap add android
if errorlevel 1 (
    echo Android платформа уже добавлена или произошла ошибка
)

echo.
echo [4/5] Синхронизация файлов...
call npx cap sync
if errorlevel 1 (
    echo Ошибка при синхронизации!
    pause
    exit /b 1
)

echo.
echo [5/5] Готово!
echo.
echo ============================================
echo  Установка завершена успешно!
echo ============================================
echo.
echo Теперь вы можете:
echo 1. Открыть проект в Android Studio: npx cap open android
echo 2. Или собрать APK командой: cd android ^&^& gradlew assembleDebug
echo.
pause
