const CACHE_NAME = 'to-do-pwa-cache-v1'; 
const FILES_TO_CACHE = [
    '/https://github.com/AlicjaDev/Planner/',
    '/https://github.com/AlicjaDev/Planner/index.html', 
    '/https://github.com/AlicjaDev/Planner/style.css', 
    'https://github.com/AlicjaDev/Planner/app.js',
    'https://github.com/AlicjaDev/Planner/index.js',
    ];

    self.addEventListener('install', (event) => { 
        event.waitUntil(
    caches.open(CACHE_NAME)
    .then((cache) => cache.addAll(FILES_TO_CACHE))
     );
    });

    
    self.addEventListener('fetch', (event) => { event.respondWith(
    caches.match(event.request)
    .then((response) => response || fetch(event.request))
    

    );
    });
    

// const sw = new URL('service-worker.js', import.meta.url)
// if ('serviceWorker' in navigator) {
//  const s = navigator.serviceWorker;
//  s.register(sw.href, {
//  scope: 'https://alicjadev.github.io/Planner/'
//  })
//  .then(_ => console.log('Service Worker Registered for scope:', sw.href,
// 'with', import.meta.url))
//  .catch(err => console.error('Service Worker Error:', err));
// }
