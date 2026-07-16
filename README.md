# Lucent Hub

A real-time chat app built with Node.js — no external dependencies. Uses Server-Sent Events (SSE) for live message delivery.

## Features

- Live chat with instant message delivery via SSE
- Persistent username (stored in browser localStorage)
- Message history on load
- Dark, responsive UI

## Getting started

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The server listens on port 3000 by default; set `PORT` to override.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Chat UI |
| GET | `/health` | Health check — returns `{ "ok": true }` |
| GET | `/api/messages` | List recent messages (`?limit=100`) |
| POST | `/api/messages` | Send a message — body: `{ "username": "...", "text": "..." }` |
| GET | `/api/events` | SSE stream for new messages |

## Development

```bash
npm run dev
```

Runs the server with `--watch` for automatic restarts on file changes.
