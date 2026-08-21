"use strict";

const grid = document.getElementById("games-grid");

for (const game of GAMES) {
  const card = document.createElement("a");
  card.className = "game-card";
  card.href = game.path;
  card.textContent = game.title;
  grid.appendChild(card);
}
