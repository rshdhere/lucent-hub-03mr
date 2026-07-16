const http = require("http");
const { createMessage, listMessages } = require("./store");
const { addClient, broadcast } = require("./sse");
const { chatPage } = require("./html");

const port = Number(process.env.PORT || 3000);

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => {
      chunks.push(chunk);
      if (Buffer.concat(chunks).length > 64 * 1024) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  const path = url.pathname;

  if (path === "/health") {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (path === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(chatPage());
    return;
  }

  if (path === "/api/messages" && req.method === "GET") {
    const limit = url.searchParams.get("limit");
    sendJson(res, 200, { messages: listMessages(limit) });
    return;
  }

  if (path === "/api/messages" && req.method === "POST") {
    try {
      const raw = await readBody(req);
      const body = raw ? JSON.parse(raw) : {};
      const message = createMessage(body.username, body.text);
      if (!message) {
        sendJson(res, 400, { error: "Message text is required" });
        return;
      }
      broadcast("message", message);
      sendJson(res, 201, { message });
    } catch (err) {
      const status = err.message === "Payload too large" ? 413 : 400;
      sendJson(res, status, { error: err.message || "Invalid request" });
    }
    return;
  }

  if (path === "/api/events" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write(": connected\n\n");
    addClient(res);
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(port, "0.0.0.0", () => {
  console.log("Lucent Hub chat listening on :" + port);
});
