// 자동으로 만든 파일 — scripts/build-web-app.mjs. 직접 고치지 말 것.
const VERSION = "0mu9zgu3z-cf133dbb48";
const CACHE = 'lingo-' + VERSION;
const BASE = "/lingo-app";
const PRECACHE = ["/lingo-app/","/lingo-app/404.html","/lingo-app/_expo/static/css/global-87fd0564cfa78f37afcb8d7603e15d75.css","/lingo-app/_expo/static/js/web/entry-64e57754db58dc35f6d7a48a676ab06c.js","/lingo-app/_expo/static/js/web/node-32d2cd9c4831185a52e2a20344c5ed9b.js","/lingo-app/_expo/static/js/web/node-stub-a3a005f6e068b39dd3a4bbabd32e2c62.js","/lingo-app/_sitemap.html","/lingo-app/apple-touch-icon.png","/lingo-app/assets/node_modules/expo-router/assets/arrow_down.017bc6ba3fc25503e5eb5e53826d48a8.png","/lingo-app/assets/node_modules/expo-router/assets/error.d1ea1496f9057eb392d5bbf3732a61b7.png","/lingo-app/assets/node_modules/expo-router/assets/file.19eeb73b9593a38f8e9f418337fc7d10.png","/lingo-app/assets/node_modules/expo-router/assets/forward.d8b800c443b8972542883e0b9de2bdc6.png","/lingo-app/assets/node_modules/expo-router/assets/pkg.ab19f4cbc543357183a20571f68380a3.png","/lingo-app/assets/node_modules/expo-router/assets/react-navigation/elements/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png","/lingo-app/assets/node_modules/expo-router/assets/react-navigation/elements/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png","/lingo-app/assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png","/lingo-app/assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png","/lingo-app/assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png","/lingo-app/assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png","/lingo-app/assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png","/lingo-app/assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png","/lingo-app/assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png","/lingo-app/assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png","/lingo-app/assets/node_modules/expo-router/assets/react-navigation/elements/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png","/lingo-app/assets/node_modules/expo-router/assets/sitemap.412dd9275b6b48ad28f5e3d81bb1f626.png","/lingo-app/assets/node_modules/expo-router/assets/unmatched.20e71bdf79e3a97bf55fd9e164041578.png","/lingo-app/decks.html","/lingo-app/favicon.ico","/lingo-app/icons/icon-192.png","/lingo-app/icons/icon-512.png","/lingo-app/index.html","/lingo-app/manifest.json","/lingo-app/quiz.html","/lingo-app/settings.html"];

// 리다이렉트를 거친 응답은 Safari가 화면 이동에 쓰기를 거부한다. 깨끗한 응답으로 다시 싼다.
async function clean(response) {
  if (!response.redirected) return response;
  return new Response(await response.blob(), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // 하나라도 못 받으면 설치를 실패시킨다 — 반쪽짜리 오프라인 캐시가 남는 것보다 낫다.
      await Promise.all(
        PRECACHE.map(async (url) => {
          const response = await fetch(new Request(url, { cache: 'reload' }));
          if (!response.ok) throw new Error(url + ' ' + response.status);
          await cache.put(url, await clean(response));
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 바로 앞 버전 한 벌은 남긴다. 새 버전은 열려 있는 화면을 기다리지 않고 바로 자리를 잡는데
      // (skipWaiting), 그 화면은 아직 옛 코드라 나중에 옛 파일(늦게 불러오는 조각)을 찾을 수 있다.
      const names = (await caches.keys()).filter((name) => name.startsWith('lingo-')).sort();
      const keep = new Set([CACHE, ...names.filter((name) => name !== CACHE).slice(-1)]);
      await Promise.all(names.filter((name) => !keep.has(name)).map((name) => caches.delete(name)));
      await self.clients.claim();
    })(),
  );
});

/** 주소에 맞는 저장된 화면을 찾는다. /lingo/quiz → quiz.html, 모르는 주소 → index.html */
async function cachedPage(url) {
  const cache = await caches.open(CACHE);
  const path = url.pathname.replace(/\/$/, '');
  const candidates = [url.pathname, path + '.html', path + '/index.html', BASE + '/', BASE + '/index.html'];
  for (const candidate of candidates) {
    const hit = await cache.match(candidate, { ignoreSearch: true });
    if (hit) return hit;
  }
  return null;
}

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // 앱 바깥(Gemini·Anthropic API 등)은 건드리지 않는다.
  if (url.origin !== self.location.origin) return;
  if (url.pathname !== BASE && !url.pathname.startsWith(BASE + '/')) return;

  if (request.mode === 'navigate') {
    // 화면은 온라인이면 새것을, 안 되면(오프라인·느린 망) 저장해 둔 것을.
    event.respondWith(
      (async () => {
        try {
          const response = await Promise.race([fetch(request), timeout(4000)]);
          if (response.ok) return response;
        } catch (error) {
          // 아래에서 저장된 것으로 대신한다.
        }
        return (await cachedPage(url)) ?? fetch(request);
      })(),
    );
    return;
  }

  // 그 밖의 파일(JS·글꼴·그림)은 이름에 해시가 붙어 바뀌지 않는다. 저장된 것이 있으면 그것을 쓴다.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      // 지금 버전에 없으면 남겨 둔 앞 버전에서도 찾는다 (이름에 해시가 있어 섞일 일이 없다).
      const hit =
        (await cache.match(request, { ignoreSearch: true })) ??
        (await caches.match(request, { ignoreSearch: true }));
      if (hit) return hit;
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') cache.put(request, response.clone());
      return response;
    })(),
  );
});
