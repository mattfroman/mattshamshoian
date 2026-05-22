# AI Council MVP

A simple full-stack MVP where one user prompt is sent to OpenAI, Google Gemini, and Anthropic Claude in parallel. Claude then synthesizes the returned model responses into a final answer that calls out agreement, disagreement, uncertainty, and failed or timed-out providers.

## Implementation steps

1. **Frontend prompt flow**
   - Collect a single prompt.
   - Show loading and a "Still working…" message after about 25 seconds.
   - Display status, latency, errors/timeouts, and content for each provider.
   - Display Claude's synthesized final response, or "Synthesis unavailable" with raw responses if synthesis fails.

2. **Server-side API**
   - Expose `POST /api/council` for council runs.
   - Keep all provider keys in server environment variables.
   - Rate-limit requests in memory for basic cost protection.
   - Validate prompt size before calling providers.

3. **Provider wrappers**
   - Wrap OpenAI, Gemini, and Claude behind a common `complete(prompt, timeoutMs)` interface.
   - Normalize every provider result into:

   ```json
   {
     "provider": "string",
     "model": "string",
     "status": "success | error | timeout",
     "content": "string | null",
     "latency_ms": 0,
     "error": "string | null"
   }
   ```

4. **Concurrent execution and synthesis**
   - Call all three providers concurrently.
   - Use provider timeouts and an overall request timeout.
   - Send successful/raw provider results to Claude for synthesis when at least two provider responses succeed.
   - If Claude synthesis fails, return raw model responses and mark synthesis unavailable.

5. **Persistence**
   - Save recent runs to a local JSON file containing prompt, normalized responses, synthesis, timestamps, model names, and errors/timeouts.


## Easiest option: double-click start

If you do not code, use one of the included starter files from the project folder:

- **Mac:** double-click `start-ai-council.command`.
- **Windows:** double-click `start-ai-council.bat`.

The starter file checks that Node.js is installed, creates `.env` from `.env.example` if needed, reminds you to paste in your provider API keys, installs dependencies, builds the app, starts the server, and opens `http://localhost:8787` in your browser.

You still need three API keys for the app to answer real prompts:

- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `ANTHROPIC_API_KEY`

If the starter file opens `.env`, paste your keys into that file, save it, then double-click the starter file again.

## Getting started

```bash
cp .env.example .env
# Fill in OPENAI_API_KEY, GEMINI_API_KEY, and ANTHROPIC_API_KEY.
npm install
npm run build
npm start
```

The production server serves the built frontend from `dist/` and the API from the same Node process on `PORT` (default `8787`).

For local frontend development, run the API and Vite dev server in separate terminals:

```bash
npm run dev:server
npm run dev
```

Vite proxies `/api` to `http://localhost:8787`.

## Environment variables

See `.env.example` for provider keys, model overrides, timeout settings, rate-limit settings, and persistence location.
