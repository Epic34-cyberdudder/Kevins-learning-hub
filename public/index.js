"use strict";

const landing = document.getElementById("landing");
const form = document.getElementById("sj-form");
const address = document.getElementById("sj-address");
const searchEngine = document.getElementById("sj-search-engine");
const error = document.getElementById("sj-error");
const errorCode = document.getElementById("sj-error-code");
const showAppsBtn = document.getElementById("sj-show-apps");
const appsPanel = document.getElementById("sj-apps-panel");

const browserBar = document.getElementById("sj-browser-bar");
const frameUrlForm = document.getElementById("sj-frame-form");
const frameUrlInput = document.getElementById("sj-frame-url");
const backBtn = document.getElementById("sj-back");
const forwardBtn = document.getElementById("sj-forward");
const reloadBtn = document.getElementById("sj-reload");
const homeBtn = document.getElementById("sj-home");

const { ScramjetController } = $scramjetLoadController();

const scramjet = new ScramjetController({
  files: {
    wasm: "/scram/scramjet.wasm.wasm",
    all: "/scram/scramjet.all.js",
    sync: "/scram/scramjet.sync.js",
  },
});

scramjet.init();

const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

let frame = null;
let ready = false;

async function ensureReady() {
  if (ready) return;

  await registerSW();
  await navigator.serviceWorker.ready;

  const wispUrl =
    (location.protocol === "https:" ? "wss" : "ws") +
    "://" +
    location.host +
    "/wisp/";

  if ((await connection.getTransport()) !== "/epoxy/index.mjs") {
    await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
  }

  ready = true;
}

function ensureFrame() {
  if (frame) return frame;

  frame = scramjet.createFrame();
  frame.frame.id = "sj-frame";
  document.body.appendChild(frame.frame);

  frame.addEventListener("urlchange", (e) => {
    frameUrlInput.value = e.url;
  });
  frame.addEventListener("navigate", (e) => {
    frameUrlInput.value = e.url;
  });

  return frame;
}

function showBrowser() {
  landing.classList.add("hidden");
  browserBar.classList.remove("hidden");
  frame.frame.classList.remove("hidden");
}

function showLanding() {
  landing.classList.remove("hidden");
  browserBar.classList.add("hidden");
  if (frame) frame.frame.classList.add("hidden");
}

async function go(url) {
  error.textContent = "";
  errorCode.textContent = "";

  try {
    await ensureReady();
  } catch (err) {
    error.textContent = "Failed to register service worker.";
    errorCode.textContent = err.toString();
    throw err;
  }

  ensureFrame();
  showBrowser();
  frame.go(url);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const url = search(address.value, searchEngine.value);
  await go(url);
});

showAppsBtn.addEventListener("click", () => {
  appsPanel.classList.toggle("hidden");
});

for (const shortcut of appsPanel.querySelectorAll(".app-shortcut")) {
  shortcut.addEventListener("click", async () => {
    address.value = shortcut.dataset.url;
    await go(shortcut.dataset.url);
  });
}

frameUrlForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!frame) return;
  const url = search(frameUrlInput.value, searchEngine.value);
  frame.go(url);
});

backBtn.addEventListener("click", () => frame && frame.back());
forwardBtn.addEventListener("click", () => frame && frame.forward());
reloadBtn.addEventListener("click", () => frame && frame.reload());
homeBtn.addEventListener("click", () => showLanding());
