import { createServer } from "node:http";
import { fileURLToPath } from "url";
import { hostname } from "node:os";
import { readdir, access } from "node:fs/promises";
import { join } from "node:path";

import { server as wisp, logging } from "@mercuryworkshop/wisp-js/server";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { scramjetPath } from "@mercuryworkshop/scramjet/path";

const publicPath = fileURLToPath(new URL("../public/", import.meta.url));
const controllerPath = fileURLToPath(
  new URL(".", import.meta.resolve("@mercuryworkshop/scramjet-controller"))
);
const libcurlPath = fileURLToPath(
  new URL(".", import.meta.resolve("@mercuryworkshop/libcurl-transport"))
);
const gamesPath = join(publicPath, "games");

function humanize(name) {
  return name
    .replace(/\.html$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function listGames() {
  let entries;
  try {
    entries = await readdir(gamesPath, { withFileTypes: true });
  } catch {
    return [];
  }

  const games = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const indexPath = join(gamesPath, entry.name, "index.html");
      if (await fileExists(indexPath)) {
        games.push({
          title: humanize(entry.name),
          path: `games/${entry.name}/index.html`,
        });
      }
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
      games.push({
        title: humanize(entry.name),
        path: `games/${entry.name}`,
      });
    }
  }

  games.sort((a, b) => a.title.localeCompare(b.title));
  return games;
}

logging.set_level(logging.NONE);

Object.assign(wisp.options, {
  allow_udp_streams: false,
  hostname_blacklist: [/example\.com/],
  dns_servers: ["1.1.1.3", "1.0.0.3"],
});

const fastify = Fastify({
  serverFactory: (handler) => {
    return createServer()
      .on("request", (req, res) => {
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        handler(req, res);
      })
      .on("upgrade", (req, socket, head) => {
        if (req.url.endsWith("/wisp/")) wisp.routeRequest(req, socket, head);
        else socket.end();
      });
  },
});

fastify.register(fastifyStatic, {
  root: publicPath,
  decorateReply: true,
});

fastify.register(fastifyStatic, {
  root: scramjetPath,
  prefix: "/scramjet/",
  decorateReply: false,
});

fastify.register(fastifyStatic, {
  root: controllerPath,
  prefix: "/controller/",
  decorateReply: false,
});

fastify.register(fastifyStatic, {
  root: libcurlPath,
  prefix: "/libcurl/",
  decorateReply: false,
});

fastify.get("/api/games", async () => {
  return listGames();
});

fastify.setNotFoundHandler((res, reply) => {
  return reply.code(404).type("text/html").sendFile("404.html");
});

fastify.server.on("listening", () => {
  const address = fastify.server.address();
  console.log("Listening on:");
  console.log(`\thttp://localhost:${address.port}`);
  console.log(`\thttp://${hostname()}:${address.port}`);
  console.log(
    `\thttp://${
      address.family === "IPv6" ? `[${address.address}]` : address.address
    }:${address.port}`
  );
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
  console.log("SIGTERM signal received: closing HTTP server");
  fastify.close();
  process.exit(0);
}

let port = parseInt(process.env.PORT || "");
if (isNaN(port)) port = 8080;

fastify.listen({
  port: port,
  host: "0.0.0.0",
});
