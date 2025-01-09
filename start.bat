@echo off
SETLOCAL EnableDelayedExpansion

REM Check if in git repo
if not exist ".git\" (
    echo Error: Not a git repository
    exit /b 1
)

REM Check if package.json exists
if not exist "package.json" (
    echo Error: package.json not found
    exit /b 1
)

echo [1/6] Getting current branch...
for /f "tokens=* USEBACKQ" %%g in (`git rev-parse --abbrev-ref HEAD`) do (SET current_branch=%%g)
if !ERRORLEVEL! NEQ 0 (
    echo Error: Failed to get current branch
    exit /b 1
)

echo [2/6] Checking Git status...
git fetch origin
if !ERRORLEVEL! NEQ 0 (
    echo Error: Failed to fetch from remote
    exit /b 1
)

git rev-list HEAD..origin/%current_branch% --count > temp.txt
set /p changes=<temp.txt
del temp.txt

if %changes% GTR 0 (
    echo [3/6] Changes detected, pulling updates...
    git pull origin %current_branch%
    if !ERRORLEVEL! NEQ 0 (
        echo Error: Pull failed
        exit /b 1
    )
    SET needs_build=true
) else (
    echo [3/6] No changes to pull
    SET needs_build=false
)

echo [4/6] Checking dependencies...
if not exist "node_modules\" (
    echo [5/6] Installing dependencies...
    call npm install
    if !ERRORLEVEL! NEQ 0 (
        echo Error: npm install failed
        exit /b 1
    )
    SET needs_build=true
)

if "%needs_build%"=="true" (
    echo [5/6] Building project...
    call npm run build
    if !ERRORLEVEL! NEQ 0 (
        echo Error: Build failed
        exit /b 1
    )
) else (
    echo [5/6] No need to build
)

echo [6/6] Starting Next.js server...
call npm run start