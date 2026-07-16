const crypto = require("crypto");

const MAX_MESSAGES = 500;

/** @type {{ id: string, username: string, text: string, createdAt: string }[]} */
const messages = [];

function createMessage(username, text) {
  const message = {
    id: crypto.randomUUID(),
    username: String(username || "Guest").trim().slice(0, 32) || "Guest",
    text: String(text || "").trim().slice(0, 2000),
    createdAt: new Date().toISOString(),
  };
  if (!message.text) return null;
  messages.push(message);
  while (messages.length > MAX_MESSAGES) messages.shift();
  return message;
}

function listMessages(limit = 100) {
  const n = Math.min(Math.max(Number(limit) || 100, 1), MAX_MESSAGES);
  return messages.slice(-n);
}

module.exports = { createMessage, listMessages };
