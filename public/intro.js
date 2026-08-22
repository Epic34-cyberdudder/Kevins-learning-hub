"use strict";

(function () {
  const overlay = document.getElementById("intro-overlay");
  const text = document.getElementById("intro-text");
  const x = document.getElementById("intro-x");
  if (!overlay || !text || !x) return;

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function playIntro() {
    text.classList.add("visible");
    await wait(1400);

    x.classList.add("show");
    text.classList.add("strike");
    await wait(700);

    text.classList.remove("visible");
    x.classList.remove("show");
    await wait(450);

    text.textContent = "Kevin's Hub";
    text.classList.remove("strike");
    void text.offsetWidth;
    text.classList.add("visible");
    await wait(1300);

    overlay.classList.add("fade-out");
    await wait(650);
    overlay.remove();
  }

  playIntro();
})();
