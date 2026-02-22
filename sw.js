/**
 * TASMIK QURAN 2026 - SERVICE WORKER (ULTRA PRO V10)
 * ---------------------------------------
 * Status: FINAL FIX FOR USTAZ AIMAN
 */

// Tukar v10.1 untuk paksa pembersihan cache secara total
const CACHE_NAME = 'tasmik-aiman-v10.1'; 

const ASSETS_TO_CACHE = [
    'index.html',
    'style.css',
    'script.js',
    'peserta_kumpulan_aiman.hjson',
    'silibus.hjson',
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/hjson/3.2.2/hjson.min.js'
];

// 1. INSTALL: Simpan aset (Tanpa ./ untuk kestabilan GitHub)
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 SW: Membina Cache Baru...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. ACTIVATE: Buang semua cache lama
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('🧹 SW: Membuang Cache Lama...', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// 3. FETCH: Strategi Pintar
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Bypass untuk permintaan POST (Hantar Data ke GAS) - JANGAN CACHE POST!
    if (event.request.method === 'POST') return;

    // Strategi Network-First untuk fail data .hjson
    if (url.pathname.endsWith('.hjson')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clonedResponse = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clonedResponse);
                    });
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Strategi Cache-First untuk UI
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchResponse) => {
                // Hanya cache request GET yang berjaya
                if (event.request.method === 'GET' && fetchResponse.status === 200) {
                    const responseClone = fetchResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return fetchResponse;
            });
        }).catch(() => {
            if (event.request.mode === 'navigate') {
                return caches.match('index.html');
            }
        })
    );
});
