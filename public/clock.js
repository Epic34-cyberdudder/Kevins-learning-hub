"use strict";

(function () {
  const dateEl = document.getElementById("sj-date");
  const clockEl = document.getElementById("sj-clock");
  const greetingEl = document.getElementById("sj-greeting");

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  function greetingFor(hour) {
    if (hour < 5) return "Good night";
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  function tick() {
    const now = new Date();

    dateEl.textContent = dateFormatter.format(now).toUpperCase();

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;

    clockEl.textContent = `${hours}:${minutes}:${seconds} ${period}`;
    greetingEl.textContent = greetingFor(now.getHours());
  }

  tick();
  setInterval(tick, 1000);
})();
