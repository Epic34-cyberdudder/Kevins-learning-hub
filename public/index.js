"use strict";

const form = document.getElementById("sj-form");
const address = document.getElementById("sj-address");
const searchEngine = document.getElementById("sj-search-engine");
const error = document.getElementById("sj-error");
const errorCode = document.getElementById("sj-error-code");
const showAppsBtn = document.getElementById("sj-show-apps");
const appsPanel = document.getElementById("sj-apps-panel");

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

async function go(url) {
  error.textContent = "";
  errorCode.textContent = "";

  try {
    await registerSW();
    await navigator.serviceWorker.ready;
  } catch (err) {
    error.textContent = "Failed to register service worker.";
    errorCode.textContent = err.toString();
    throw err;
  }

  const wispUrl =
    (location.protocol === "https:" ? "wss" : "ws") +
    "://" +
    location.host +
    "/wisp/";

  if ((await connection.getTransport()) !== "/libcurl/index.mjs") {
    await connection.setTransport("/libcurl/index.mjs", [
      { websocket: wispUrl },
    ]);
  }

  const existingFrame = document.getElementById("sj-frame");
  if (existingFrame) existingFrame.remove();

  const frame = scramjet.createFrame();
  frame.frame.id = "sj-frame";
  document.body.appendChild(frame.frame);
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
