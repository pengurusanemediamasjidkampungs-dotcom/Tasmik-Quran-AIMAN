const CACHE_NAME = 'tasmik-pwa-v2050-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon_512.png' // Pastikan ikon lokal ini disimpan untuk kegunaan offline
];

// 1. INSTALL: Simpan semua aset penting ke dalam storan telefon
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Membina Cache PWA Tasmik 2050');
      // Menggunakan return untuk memastikan install selesai hanya selepas cache siap
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. ACTIVATE: Bersihkan cache versi lama jika ada perubahan versi
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('SW: Memadam Cache Lama:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // Pastikan SW mengambil alih kawalan halaman dengan segera
  self.clients.claim();
  console.log('SW: Sistem Aktif & Cache Versi Terkini Sedia');
});

// 3. FETCH: Strategi "Cache First, Fallback to Network"
// Aplikasi akan sentiasa laju kerana ia tidak menunggu internet untuk paparan UI
self.addEventListener('fetch', (event) => {
  // Abaikan request ke Google Sheets (POST) supaya tidak mengganggu proses hantar data
  if (event.request.method === 'POST') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Jika fail ada dalam cache, hantar fail tersebut. Jika tiada, minta dari internet.
      return cachedResponse || fetch(event.request).then((networkResponse) => {
        // Simpan fail baru ke dalam cache secara automatik (Optional)
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        console.log('SW: Peranti Offline & fail tiada dalam cache.');
      });
    })
  );
});
