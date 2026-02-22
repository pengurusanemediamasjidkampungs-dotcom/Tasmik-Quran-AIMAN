/**
 * TASMIK QURAN 2026 - SERVICE WORKER (ULTRA PRO V8.2)
 * ---------------------------------------
 * Khusus: REPO USTAZ AIMAN
 * Update: Menyelaraskan cache untuk fail peserta tunggal
 */

// Tukar v1 kepada v9.0-Final untuk paksa telefon buang cache lama
const CACHE_NAME = 'tasmik-aiman-v9.0-final'; 

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './peserta_kumpulan_aiman.hjson',
    './silibus.hjson',
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/hjson/3.2.2/hjson.min.js'
];

// 1. INSTALL: Simpan aset ke dalam cache
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 SW: Caching App Shell (Aiman Edition)...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. ACTIVATE: Bersihkan cache lama yang sudah tidak relevan
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('🧹 SW: Menghapus Cache Lama...', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// 3. FETCH: Strategi Pintar (Network-First untuk Data, Cache-First untuk UI)
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Strategi Network-First untuk fail data (.hjson)
    // Supaya jika Ustaz tambah pelajar baru, ia terus dikemaskini jika ada internet.
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

    // Strategi Cache-First untuk aset statik (UI/JS/Fonts)
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    if (event.request.method === 'GET') {
                        cache.put(event.request, fetchResponse.clone());
                    }
                    return fetchResponse;
                });
            });
        }).catch(() => {
            // Jika offline dan aset tiada dalam cache, hantar ke index.html
            if (event.request.mode === 'navigate') {
                return caches.match('./index.html');
            }
        })
    );
});
