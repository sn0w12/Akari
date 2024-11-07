@echo off
setlocal

REM Change to the project directory
cd /d c:\Users\lucas\Documents\GitHub\manga-reader

REM Check if node_modules directory exists
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

REM Check if the build directory exists
if not exist .next (
    echo Building the project...
    npm run build
)

REM Start the project
echo Starting the project...
npm run start

endlocal