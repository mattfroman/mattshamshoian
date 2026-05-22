@echo off
setlocal
cd /d "%~dp0"

if "%PORT%"=="" set PORT=8787
set APP_URL=http://localhost:%PORT%

where node >nul 2>nul
if errorlevel 1 (
  echo Missing Node.js. Please install Node.js 18 or newer from https://nodejs.org/ and try again.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo Missing npm. Please install Node.js 18 or newer from https://nodejs.org/ and try again.
  pause
  exit /b 1
)

for /f %%v in ('node -p "Number(process.versions.node.split('.')[0])"') do set NODE_MAJOR=%%v
if %NODE_MAJOR% LSS 18 (
  echo Node.js 18 or newer is required. You currently have:
  node -v
  echo Please install the latest LTS version from https://nodejs.org/ and try again.
  pause
  exit /b 1
)

if not exist .env (
  copy .env.example .env >nul
  echo I created a .env file for your API keys.
  echo Please paste your OpenAI, Gemini, and Anthropic keys into .env, save it, then double-click this file again.
  start notepad .env
  pause
  exit /b 1
)

findstr /R /C:"^OPENAI_API_KEY=sk-\.\.\." /C:"^GEMINI_API_KEY=\.\.\." /C:"^ANTHROPIC_API_KEY=sk-ant-\.\.\." .env >nul
if not errorlevel 1 (
  echo Your .env file still has placeholder API keys.
  echo Replace the placeholder values with real API keys, save .env, then double-click this file again.
  start notepad .env
  pause
  exit /b 1
)

echo Installing dependencies if needed...
call npm install
if errorlevel 1 (
  pause
  exit /b 1
)

echo Building the app...
call npm run build
if errorlevel 1 (
  pause
  exit /b 1
)

echo Starting AI Council...
echo Your browser should open automatically. If it does not, visit: %APP_URL%
start "" "%APP_URL%"
call npm start
pause
