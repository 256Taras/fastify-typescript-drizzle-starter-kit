---
description: Start the dev server in the background so Claude can monitor stdout/stderr in real time and catch runtime errors as they happen.
allowed-tools: Bash(pnpm:*), BashOutput, KillBash
---

# /bg-dev — Background dev server with live monitoring

## Steps

1. Start the server in background (returns immediately with a shell ID):
   ```
   pnpm dev
   ```
   Use `run_in_background: true` so the process stays alive and Claude gets a shell ID.

2. Wait 3 seconds for boot:
   ```
   sleep 3
   ```

3. Check the BashOutput of the background shell to see if it booted cleanly. Look for:
   - `Server listening` or similar Fastify startup message
   - Any errors

4. Tell me the shell ID. From now on, when I make code changes:
   - The dev server will hot-reload automatically (node --watch)
   - You can check `BashOutput <shell-id>` to see new errors
   - If there's a runtime error, you see it in real time and can fix it

5. To stop later: `KillBash <shell-id>`.

## Why this is powerful

Without this pattern: write code -> tell user "try it" -> user runs it -> user reports error -> fix -> repeat. Each cycle is 30+ seconds.

With this pattern: write code -> hot reload happens -> you see the error -> fix it -> repeat. Each cycle is 2 seconds.
