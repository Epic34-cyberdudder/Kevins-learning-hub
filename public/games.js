"use strict";

const grid = document.getElementById("games-grid");

async function loadGames() {
  const res = await fetch("/api/games");
  const games = await res.json();

  if (games.length === 0) {
    grid.textContent = "No games found in public/games/.";
    return;
  }

  for (const game of games) {
    const card = document.createElement("a");
    card.className = "game-card";
    card.href = game.path;
    card.textContent = game.title;
    grid.appendChild(card);
  }
}

loadGames();
