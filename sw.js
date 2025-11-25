const CACHE_NAME = 'camocr-v3';
const ASSETS = [
  'index.html',
  'css/style.css',
  'js/app.js',
  'js/ocr-adapter.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'manifest.json'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>{
    return Promise.all(keys.filter(k=>k !== CACHE_NAME).map(k=>caches.delete(k)));
  }).then(()=>self.clients.claim()));
});

self.addEventListener('fetch', e=>{
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  const isJS = url.pathname.endsWith('.js');
  if (isJS){
    e.respondWith(fetch(e.request).then(res=>{
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put(e.request, copy));
      return res;
    }).catch(()=>caches.match(e.request)));
    return;
  }

  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
    return caches.open(CACHE_NAME).then(cache=>{cache.put(e.request, res.clone()); return res;});
  })).catch(()=>caches.match('/index.html')));
});

