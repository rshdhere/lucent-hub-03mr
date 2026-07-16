function chatPage() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Lucent Hub — Chat</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0f1117;
      --surface: #171a22;
      --surface-2: #1e2230;
      --border: #2a3142;
      --text: #e8ecf4;
      --muted: #8b95a8;
      --accent: #6c8cff;
      --accent-hover: #5a7af0;
      --mine: #1a2744;
      --other: #1a1f2b;
      --success: #3dd68c;
      font-family: "Segoe UI", ui-sans-serif, system-ui, sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      display: flex;
      flex-direction: column;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.85rem 1.25rem;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
    }
    header h1 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    header h1 span { color: var(--accent); }
    .status {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.8rem;
      color: var(--muted);
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #555;
    }
    .dot.live { background: var(--success); box-shadow: 0 0 8px var(--success); }
    main {
      flex: 1;
      display: grid;
      grid-template-rows: 1fr auto;
      max-width: 52rem;
      width: 100%;
      margin: 0 auto;
      min-height: 0;
    }
    #messages {
      overflow-y: auto;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .empty {
      margin: auto;
      text-align: center;
      color: var(--muted);
      font-size: 0.95rem;
      line-height: 1.5;
    }
    .msg {
      max-width: 85%;
      padding: 0.6rem 0.85rem;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: var(--other);
      animation: fadeIn 0.2s ease;
    }
    .msg.mine {
      align-self: flex-end;
      background: var(--mine);
      border-color: #2a3f6a;
    }
    .msg .meta {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
      font-size: 0.75rem;
    }
    .msg .name { font-weight: 600; color: var(--accent); }
    .msg.mine .name { color: #9eb4ff; }
    .msg .time { color: var(--muted); }
    .msg .text {
      margin: 0;
      line-height: 1.45;
      word-break: break-word;
      white-space: pre-wrap;
    }
    footer {
      padding: 0.85rem 1.25rem 1.1rem;
      border-top: 1px solid var(--border);
      background: var(--surface);
    }
    .composer {
      display: grid;
      grid-template-columns: minmax(0, 7rem) 1fr auto;
      gap: 0.55rem;
      align-items: end;
    }
    label { display: block; font-size: 0.72rem; color: var(--muted); margin-bottom: 0.25rem; }
    input, textarea, button {
      font: inherit;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--surface-2);
      color: var(--text);
    }
    input, textarea {
      width: 100%;
      padding: 0.55rem 0.65rem;
    }
    input:focus, textarea:focus {
      outline: 2px solid rgba(108, 140, 255, 0.35);
      border-color: var(--accent);
    }
    textarea {
      resize: none;
      min-height: 2.5rem;
      max-height: 8rem;
      line-height: 1.4;
    }
    button {
      padding: 0.55rem 1rem;
      background: var(--accent);
      border-color: transparent;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      height: 2.5rem;
    }
    button:hover { background: var(--accent-hover); }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 540px) {
      .composer { grid-template-columns: 1fr; }
      button { width: 100%; }
    }
  </style>
</head>
<body>
  <header>
    <h1>Lucent <span>Hub</span></h1>
    <div class="status">
      <span class="dot" id="statusDot"></span>
      <span id="statusText">Connecting…</span>
    </div>
  </header>
  <main>
    <div id="messages" aria-live="polite">
      <p class="empty" id="emptyState">No messages yet. Say hello!</p>
    </div>
    <footer>
      <form class="composer" id="form">
        <div>
          <label for="username">Name</label>
          <input id="username" maxlength="32" autocomplete="nickname" placeholder="You" required />
        </div>
        <div>
          <label for="text">Message</label>
          <textarea id="text" rows="1" maxlength="2000" placeholder="Type a message…" required></textarea>
        </div>
        <button type="submit" id="sendBtn">Send</button>
      </form>
    </footer>
  </main>
  <script>
    const messagesEl = document.getElementById("messages");
    const emptyState = document.getElementById("emptyState");
    const form = document.getElementById("form");
    const usernameInput = document.getElementById("username");
    const textInput = document.getElementById("text");
    const sendBtn = document.getElementById("sendBtn");
    const statusDot = document.getElementById("statusDot");
    const statusText = document.getElementById("statusText");

    const seen = new Set();
    let myUsername = localStorage.getItem("chatUsername") || "";

    if (myUsername) usernameInput.value = myUsername;

    function formatTime(iso) {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    function escapeHtml(str) {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function appendMessage(msg) {
      if (seen.has(msg.id)) return;
      seen.add(msg.id);
      if (emptyState) emptyState.remove();

      const mine = msg.username === usernameInput.value.trim();
      const el = document.createElement("article");
      el.className = "msg" + (mine ? " mine" : "");
      el.innerHTML =
        '<div class="meta"><span class="name">' + escapeHtml(msg.username) +
        '</span><time class="time">' + formatTime(msg.createdAt) + '</time></div>' +
        '<p class="text">' + escapeHtml(msg.text) + '</p>';
      messagesEl.appendChild(el);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    async function loadHistory() {
      const res = await fetch("/api/messages");
      const data = await res.json();
      for (const msg of data.messages) appendMessage(msg);
    }

    function setStatus(live, label) {
      statusDot.classList.toggle("live", live);
      statusText.textContent = label;
    }

    function connectSSE() {
      const es = new EventSource("/api/events");
      es.addEventListener("message", (e) => {
        try { appendMessage(JSON.parse(e.data)); } catch {}
      });
      es.onopen = () => setStatus(true, "Live");
      es.onerror = () => {
        setStatus(false, "Reconnecting…");
        es.close();
        setTimeout(connectSSE, 2000);
      };
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = usernameInput.value.trim();
      const text = textInput.value.trim();
      if (!username || !text) return;

      localStorage.setItem("chatUsername", username);
      myUsername = username;
      sendBtn.disabled = true;

      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, text }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert(err.error || "Failed to send message");
          return;
        }
        textInput.value = "";
        textInput.focus();
      } catch {
        alert("Network error — could not send message");
      } finally {
        sendBtn.disabled = false;
      }
    });

    textInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        form.requestSubmit();
      }
    });

    loadHistory().then(connectSSE);
  </script>
</body>
</html>`;
}

module.exports = { chatPage };
