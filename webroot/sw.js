/**
 * Service Worker 脚本
 * 
 * 功能：
 * - 缓存静态资源
 * - 离线支持
 * - 后台同步
 */

const CACHE_NAME = 'meta-overlayfsUltra-v1.0.0';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/locales/zh-CN.json',
  '/locales/en-US.json'
];

/**
 * 安装事件
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker 安装中...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('缓存已打开');
      return cache.addAll(URLS_TO_CACHE).then(() => {
        console.log('静态资源已缓存');
      }).catch((error) => {
        console.error('缓存静态资源失败:', error);
        // 继续安装，即使某些资源失败
        return Promise.resolve();
      });
    })
  );
  
  self.skipWaiting();
});

/**
 * 激活事件
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker 激活中...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

/**
 * 获取事件（缓存优先策略）
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只处理 GET 请求
  if (request.method !== 'GET') {
    return;
  }

  // 跳过 chrome 扩展请求
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // 对于 API 请求，使用网络优先策略
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // 对于其他请求，使用缓存优先策略
  event.respondWith(cacheFirstStrategy(request));
});

/**
 * 缓存优先策略
 */
function cacheFirstStrategy(request) {
  return caches.match(request).then((response) => {
    // 缓存命中
    if (response) {
      return response;
    }

    // 网络请求
    return fetch(request).then((response) => {
      // 缓存新响应
      if (response && response.status === 200 && response.type === 'basic') {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
      }
      return response;
    }).catch(() => {
      // 网络错误，返回离线页面
      return new Response('离线模式：无法访问此资源', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'text/plain'
        })
      });
    });
  });
}

/**
 * 网络优先策略
 */
function networkFirstStrategy(request) {
  return fetch(request).then((response) => {
    // 缓存成功的响应
    if (response && response.status === 200) {
      const responseClone = response.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, responseClone);
      });
    }
    return response;
  }).catch(() => {
    // 网络失败，尝试缓存
    return caches.match(request).then((response) => {
      if (response) {
        return response;
      }
      
      // 缓存也没有，返回离线响应
      return new Response('离线模式：无法访问此资源', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'text/plain'
        })
      });
    });
  });
}

/**
 * 消息处理
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
