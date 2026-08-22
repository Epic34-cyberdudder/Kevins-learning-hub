"use strict";

import LibcurlClient from "/libcurl/index.mjs";

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

let controllerInstance = null;
let frame = null;
let ready = false;

async function waitForControl(timeoutMs = 10000) {
  if (navigator.serviceWorker.controller) return;

  await new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      navigator.serviceWorker.removeEventListener("controllerchange", onChange);
      resolve();
    };
    const onChange = () => finish();

    navigator.serviceWorker.addEventListener("controllerchange", onChange);
    navigator.serviceWorker.ready.then(() => {
      if (navigator.serviceWorker.controller) finish();
    });
    setTimeout(finish, timeoutMs);
  });
}

async function ensureReady() {
  if (ready) return;

  await registerSW();
  await waitForControl();
  const registration = await navigator.serviceWorker.ready;

  const wispUrl =
    (location.protocol === "https:" ? "wss" : "ws") +
    "://" +
    location.host +
    "/wisp/";

  const transport = new LibcurlClient({ wisp: wispUrl });
  await transport.init();

  const { Controller } = globalThis.$scramjetController;
  controllerInstance = new Controller({
    serviceworker: navigator.serviceWorker.controller ?? registration.active,
    transport,
  });
  await controllerInstance.wait();

  ready = true;
}

function ensureFrame() {
  if (frame) return frame;

  frame = controllerInstance.createFrame();
  frame.element.id = "sj-frame";
  document.body.appendChild(frame.element);

  return frame;
}

function showBrowser() {
  landing.classList.add("hidden");
  browserBar.classList.remove("hidden");
  frame.element.classList.remove("hidden");
}

function showLanding() {
  landing.classList.remove("hidden");
  browserBar.classList.add("hidden");
  if (frame) frame.element.classList.add("hidden");
}

async function go(url) {
  error.textContent = "";
  errorCode.textContent = "";

  try {
    await ensureReady();
  } catch (err) {
    error.textContent = "Failed to set up the proxy.";
    errorCode.textContent = err.toString();
    throw err;
  }

  ensureFrame();
  showBrowser();
  frame.go(url);
  frameUrlInput.value = url;
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
  frameUrlInput.value = url;
});

backBtn.addEventListener("click", () => frame && frame.back());
forwardBtn.addEventListener("click", () => frame && frame.forward());
reloadBtn.addEventListener("click", () => frame && frame.reload());
homeBtn.addEventListener("click", () => showLanding());
