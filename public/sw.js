const CACHE_NAME = "scito-jus-app-shell-v1"
const APP_ASSETS = [
  "manifest.webmanifest",
  "app-icon-192.png",
  "app-icon-512.png",
  "app-icon-512-maskable.png",
  "scito-jus-logo-gold.png",
  "scito-jus-landing-logo-gold.png",
]

const appUrl = (path = "./") => new URL(path, self.registration.scope).href

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME)
    const homeUrl = appUrl()
    const page = await fetch(homeUrl, { cache: "reload" })
    if (!page.ok) throw new Error("SCITO JUS app shell could not be loaded")
    await cache.put(homeUrl, page.clone())

    const html = await page.text()
    const assets = new Set(APP_ASSETS.map(appUrl))
    for (const match of html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css)(?:\?[^"']*)?)["']/g)) {
      const asset = new URL(match[1], homeUrl)
      if (asset.origin === self.location.origin && asset.href.startsWith(self.registration.scope)) {
        assets.add(asset.href)
      }
    }

    await Promise.all([...assets].map(async (asset) => {
      try {
        const response = await fetch(asset, { cache: "reload" })
        if (response.ok) await cache.put(asset, response)
      } catch {
        // Optional images or build assets can be cached on their first successful request.
      }
    }))
    await self.skipWaiting()
  })())
})

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames
      .filter((name) => name.startsWith("scito-jus-") && name !== CACHE_NAME)
      .map((name) => caches.delete(name)))
    await self.clients.claim()
  })())
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  const requestUrl = new URL(request.url)
  if (request.method !== "GET" || requestUrl.origin !== self.location.origin || !requestUrl.href.startsWith(self.registration.scope)) {
    return
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME)
    const homeUrl = appUrl()

    try {
      const response = await fetch(request)
      if (response.ok && response.type === "basic") {
        const cacheKey = request.mode === "navigate" ? homeUrl : request
        await cache.put(cacheKey, response.clone())
      }
      return response
    } catch {
      const cached = await cache.match(request.mode === "navigate" ? homeUrl : request)
      return cached || new Response("SCITO JUS is offline. Reconnect to the internet and try again.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    }
  })())
})
