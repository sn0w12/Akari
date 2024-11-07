@echo off
setlocal

REM Change to the project directory
cd /d c:\Users\lucas\Documents\GitHub\manga-reader

REM Pull the latest changes from the Git repository
echo Pulling latest changes from Git...
git pull

REM Install dependencies
echo Installing dependencies...
npm install

REM Build the project
echo Building the project...
npm run build

echo Update complete.

endlocal