#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";

const DEFAULT_BASE_URL = process.env.QA_BASE_URL || "http://localhost:3000";
const SESSION_DIR = path.join(process.cwd(), ".qa");
const SESSION_FILE = path.join(SESSION_DIR, "session.json");
const DEFAULT_PASSWORD = "QaPass123!";

function randomSuffix() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseArgs(argv) {
  const args = [...argv];
  let command = "full";
  if (args[0] && !args[0].startsWith("--")) {
    command = args.shift();
  }

  const options = {};
  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const value = args[i + 1] && !args[i + 1].startsWith("--") ? args[++i] : true;
    options[key] = value;
  }

  return { command, options };
}

async function ensureSessionDir() {
  await fs.mkdir(SESSION_DIR, { recursive: true });
}

async function loadSession() {
  try {
    const raw = await fs.readFile(SESSION_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveSession(session) {
  await ensureSessionDir();
  await fs.writeFile(SESSION_FILE, JSON.stringify(session, null, 2), "utf8");
}

async function requestJson(baseUrl, endpoint, init = {}) {
  const response = await fetch(`${baseUrl}${endpoint}`, init);
  const text = await response.text();

  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    const detail =
      typeof payload === "string"
        ? payload
        : payload?.message || payload?.error || `HTTP ${response.status}`;
    throw new Error(`${init.method || "GET"} ${endpoint} failed: ${detail}`);
  }

  return payload;
}

function printStep(message) {
  process.stdout.write(`[QA] ${message}\n`);
}

async function registerTwoUsers(baseUrl, session, options) {
  const suffix = randomSuffix();
  const domain = String(options.domain || "qa.local");
  const password = String(options.password || DEFAULT_PASSWORD);

  const owner = {
    fullName: "QA Owner",
    username: `qa_owner_${suffix}`.slice(0, 30),
    email: `qa.owner.${suffix}@${domain}`,
    country: "台灣",
    password,
    confirmPassword: password,
    acceptedTerms: true,
  };

  const responder = {
    fullName: "QA Responder",
    username: `qa_reply_${suffix}`.slice(0, 30),
    email: `qa.reply.${suffix}@${domain}`,
    country: "台灣",
    password,
    confirmPassword: password,
    acceptedTerms: true,
  };

  printStep(`Register owner: ${owner.email}`);
  const ownerResult = await requestJson(baseUrl, "/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(owner),
  });

  printStep(`Register responder: ${responder.email}`);
  const responderResult = await requestJson(baseUrl, "/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(responder),
  });

  session.users = {
    owner: {
      ...owner,
      id: ownerResult?.user?.id,
    },
    responder: {
      ...responder,
      id: responderResult?.user?.id,
    },
  };

  await saveSession(session);
  return session;
}

async function loginUsers(baseUrl, session) {
  if (!session?.users?.owner?.email || !session?.users?.responder?.email) {
    throw new Error("No users in session. Run `register` first.");
  }

  const login = async ({ email, password }) =>
    requestJson(baseUrl, "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

  printStep(`Login owner: ${session.users.owner.email}`);
  const ownerLogin = await login(session.users.owner);
  printStep(`Login responder: ${session.users.responder.email}`);
  const responderLogin = await login(session.users.responder);

  session.logins = {
    owner: ownerLogin?.user || null,
    responder: responderLogin?.user || null,
  };

  if (session.logins.owner?.id) session.users.owner.id = session.logins.owner.id;
  if (session.logins.responder?.id) session.users.responder.id = session.logins.responder.id;

  await saveSession(session);
  return session;
}

async function createPrayerCard(baseUrl, session, options) {
  const ownerId = session?.users?.owner?.id;
  if (!ownerId) {
    throw new Error("Owner id missing. Run `register` + `login` first.");
  }

  const categories = await requestJson(baseUrl, "/api/home-categories");
  if (!Array.isArray(categories) || categories.length === 0) {
    throw new Error("No active home categories. Please create one category first.");
  }

  const categoryId = Number(options.categoryId || categories[0].id);
  const suffix = randomSuffix();
  const title = options.title || `[QA] 自動化禱告內容 ${suffix}`;

  const payload = {
    title,
    slug: `qa-${suffix}`,
    image: "/img/categories/personal.jpg",
    alt: "QA auto-generated image",
    description: `<p>${title}</p><p>這是 QA 自動化建立的禱告內容。</p>`,
    tags: ["QA", "automation"],
    meta: ["QA 自動建立", "請勿手動修改"],
    detailsHref: `/prayfor?qa=${suffix}`,
    voiceHref: "",
    categoryId,
    ownerId,
  };

  printStep(`Create prayer card with owner ${ownerId}`);
  const card = await requestJson(baseUrl, "/api/home-cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  session.card = {
    id: card?.id,
    title: card?.title,
    slug: card?.slug,
    ownerId,
    categoryId,
  };

  await saveSession(session);
  return session;
}

function buildMockWavBuffer(durationSec = 2, sampleRate = 16000) {
  const numSamples = Math.floor(durationSec * sampleRate);
  const bytesPerSample = 2;
  const dataSize = numSamples * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * bytesPerSample, 28);
  buffer.writeUInt16LE(bytesPerSample, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  const freq = 440;
  for (let i = 0; i < numSamples; i += 1) {
    const sample = Math.sin((2 * Math.PI * freq * i) / sampleRate);
    const int16 = Math.max(-1, Math.min(1, sample)) * 32767;
    buffer.writeInt16LE(int16, 44 + i * 2);
  }

  return buffer;
}

async function generateOpenAiSpeechBuffer(text, options) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";
  const voice = process.env.OPENAI_TTS_VOICE || "alloy";

  const response = await fetch(`${baseUrl}/audio/speech`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      voice,
      input: text,
      format: options.format || "mp3",
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI TTS failed: ${detail}`);
  }

  const audioArrayBuffer = await response.arrayBuffer();
  return Buffer.from(audioArrayBuffer);
}

async function generateVoiceAudio(text, options) {
  const provider = String(options["voice-provider"] || "openai").toLowerCase();

  if (provider === "openai") {
    return {
      buffer: await generateOpenAiSpeechBuffer(text, { format: "mp3" }),
      mimeType: "audio/mpeg",
      extension: "mp3",
      provider,
    };
  }

  if (provider === "mock") {
    return {
      buffer: buildMockWavBuffer(2),
      mimeType: "audio/wav",
      extension: "wav",
      provider,
    };
  }

  throw new Error(`Unsupported voice provider: ${provider}`);
}

async function commentWithVoice(baseUrl, session, options) {
  const cardId = Number(options.cardId || session?.card?.id);
  const responderId = options.responderId || session?.users?.responder?.id;

  if (!Number.isInteger(cardId)) {
    throw new Error("Card id missing. Run `create-prayer` first or pass --cardId.");
  }
  if (!responderId) {
    throw new Error("Responder id missing. Run `register` + `login` first.");
  }

  const speechText =
    options["tts-text"] ||
    "主啊，求你看顧這個需要，賜下平安與盼望。這是 QA 自動化測試語音。";
  const message =
    options.message ||
    "QA 自動化留言：這是另一個帳號對你禱告事項的回應。";

  printStep("Generate voice audio");
  const audio = await generateVoiceAudio(speechText, options);

  const form = new FormData();
  form.append("requestId", String(cardId));
  form.append("message", message);
  form.append("isAnonymous", "false");
  form.append("responderId", String(responderId));
  form.append(
    "audio",
    new Blob([audio.buffer], { type: audio.mimeType }),
    `qa-voice-${Date.now()}.${audio.extension}`
  );

  printStep(`Submit response with voice to card ${cardId}`);
  const response = await fetch(`${baseUrl}/api/responses`, {
    method: "POST",
    body: form,
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    const detail =
      typeof payload === "string" ? payload : payload?.message || payload?.error || `HTTP ${response.status}`;
    throw new Error(`POST /api/responses failed: ${detail}`);
  }

  session.response = {
    id: payload?.id,
    cardId,
    responderId,
    voiceProvider: audio.provider,
    voiceUrl: payload?.voiceUrl,
    message: payload?.message,
  };

  await saveSession(session);
  return session;
}

async function run() {
  const { command, options } = parseArgs(process.argv.slice(2));
  const baseUrl = String(options["base-url"] || DEFAULT_BASE_URL).replace(/\/+$/, "");
  let session = await loadSession();

  printStep(`Command: ${command}`);
  printStep(`Base URL: ${baseUrl}`);

  switch (command) {
    case "register":
      session = await registerTwoUsers(baseUrl, session, options);
      break;
    case "login":
      session = await loginUsers(baseUrl, session, options);
      break;
    case "create-prayer":
      session = await createPrayerCard(baseUrl, session, options);
      break;
    case "comment-ai-voice":
      session = await commentWithVoice(baseUrl, session, options);
      break;
    case "status":
      break;
    case "full":
      session = await registerTwoUsers(baseUrl, session, options);
      session = await loginUsers(baseUrl, session, options);
      session = await createPrayerCard(baseUrl, session, options);
      session = await commentWithVoice(baseUrl, session, options);
      break;
    default:
      throw new Error(
        `Unknown command: ${command}. Use one of register | login | create-prayer | comment-ai-voice | status | full`
      );
  }

  await saveSession(session);
  printStep(`Session file: ${SESSION_FILE}`);
  process.stdout.write(`${JSON.stringify(session, null, 2)}\n`);
}

run().catch((error) => {
  process.stderr.write(`[QA] ERROR: ${error.message}\n`);
  process.exit(1);
});
