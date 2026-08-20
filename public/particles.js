"use strict";

(function () {
  const container = document.getElementById("particles");
  const COUNT = 45;

  for (let i = 0; i < COUNT; i++) {
    const dot = document.createElement("div");
    dot.className = "particle";

    const size = 4 + Math.random() * 26;
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.left = `${Math.random() * 100}vw`;
    dot.style.top = `${Math.random() * 100}vh`;
    dot.style.opacity = String(0.25 + Math.random() * 0.6);

    const duration = 10 + Math.random() * 18;
    const delay = -Math.random() * duration;
    dot.style.animationDuration = `${duration}s`;
    dot.style.animationDelay = `${delay}s`;

    container.appendChild(dot);
  }
})();
