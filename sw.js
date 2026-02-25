const CACHE_NAME = 'tasmik-pwa-v2050-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js', // Pastikan nama fail selaras (tadi kita guna script.js)
  './manifest.json',
  'https://cdn-icons-png.flaticon.com/512/2904/2904845.png' // Simpan ikon juga untuk offline
];

// 1. INSTALL: Simpan semua aset penting
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Membina Cache PWA');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. ACTIVATE: Buang cache lama untuk elak konflik
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  console.log('SW: Sistem Aktif & Cache Dikemaskini');
});

// 3. FETCH: Strategi "Cache First, then Network"
// Ini memastikan aplikasi laju gila kerana ia ambil dari telefon dulu
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => {
        // Jika offline dan fail tiada dalam cache
        console.log('SW: Fail tidak ditemui dalam cache offline.');
      });
    })
  );
});
