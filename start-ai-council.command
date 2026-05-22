#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

APP_URL="http://localhost:${PORT:-8787}"
ENV_FILE=".env"
ENV_EXAMPLE=".env.example"

missing_command() {
  echo "Missing required command: $1"
  echo "Please install Node.js 18 or newer from https://nodejs.org/ and try again."
  read -r -p "Press Enter to close this window..."
  exit 1
}

command -v node >/dev/null 2>&1 || missing_command node
command -v npm >/dev/null 2>&1 || missing_command npm

NODE_MAJOR="$(node -p "Number(process.versions.node.split('.')[0])")"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "Node.js 18 or newer is required. You currently have: $(node -v)"
  echo "Please install the latest LTS version from https://nodejs.org/ and try again."
  read -r -p "Press Enter to close this window..."
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  echo "I created a .env file for your API keys."
  echo "Please paste your OpenAI, Gemini, and Anthropic keys into .env, save it, then double-click this file again."
  open -a TextEdit "$ENV_FILE" || open "$ENV_FILE" || true
  read -r -p "Press Enter after saving .env, or close this window and double-click again..."
fi

if grep -qE '^(OPENAI_API_KEY=sk-\.\.\.|GEMINI_API_KEY=\.\.\.|ANTHROPIC_API_KEY=sk-ant-\.\.\.)' "$ENV_FILE"; then
  echo "Your .env file still has placeholder API keys."
  echo "Replace the placeholder values with real API keys, save .env, then double-click this file again."
  open -a TextEdit "$ENV_FILE" || open "$ENV_FILE" || true
  read -r -p "Press Enter to close this window..."
  exit 1
fi

echo "Installing dependencies if needed..."
npm install

echo "Building the app..."
npm run build

echo "Starting AI Council..."
echo "Your browser should open automatically. If it does not, visit: $APP_URL"
(sleep 2 && open "$APP_URL") &
npm start
