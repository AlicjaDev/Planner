const CACHE_NAME = 'planner-pwa-cache-v1';
const FILES_TO_CACHE = [
    '/https://github.com/AlicjaDev/Planner/',
    '/https://github.com/AlicjaDev/Planner/index.html',
    '/https://github.com/AlicjaDev/Planner/style.css',
    '/https://github.com/AlicjaDev/Planner/calendar.html',
    'https://github.com/AlicjaDev/Planner/app.js',
    'https://github.com/AlicjaDev/Planner/index.js',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(FILES_TO_CACHE))
    );
});


self.addEventListener('fetch', (event) => {

    const requestUrl = new URL(event.request.url);

    if (requestUrl.hostname.includes('firestore.googleapis.com')) {
        return fetch(event.request);
    }


    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))


    );
});



if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(function (registration) {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(function (error) {
            console.error('Service Worker registration failed:', error);
        });
}


self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

