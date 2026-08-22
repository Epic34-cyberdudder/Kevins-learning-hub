importScripts("/controller/controller.sw.js");

const { shouldRoute, route } = $scramjetController;

self.addEventListener("fetch", (event) => {
  if (shouldRoute(event)) {
    event.respondWith(route(event));
  }
});
