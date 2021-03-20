const siteCashName = 'pwa-app-4';
const dynamicCache = 'pwa-d-4';

const assetsUrls = ['index.html','/scripts/app.js','/styles/style.css','/offline.html'];

self.addEventListener('install', async evt => {
    const cache = await caches.open(siteCashName);
    await cache.addAll(assetsUrls);
});

self.addEventListener('activate', async evt => {
 const cachesNames = await caches.keys();
 await Promise.all(
     cachesNames
         .filter((el) => el !== siteCashName)
         .filter(el => el !== dynamicCache)
         .map(name => caches.delete(name))
 )
})
// cache first
// network first

self.addEventListener('fetch',  evt => {
    const {request} = evt;

    const url = new URL(request.url);
    if (url.origin === location.origin) {
        evt.respondWith(cacheFirst(request))
    } else {
        evt.respondWith(networkFirst(request))
    }
});

const cacheFirst = async (req) => {
    const cashed = await caches.match(req);
    return cashed ?? await fetch(req);
}

const networkFirst = async (req) => {
    const cache = await caches.open(dynamicCache);
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=11');
        await cache.put(req, response.clone());
        return response;
    } catch (e) {
        const cached = await cache.match(req);
        return cached ?? await caches.match('/offline.html');
    }
}