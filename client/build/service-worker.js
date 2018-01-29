"use strict";function setOfCachedUrls(e){return e.keys().then(function(e){return e.map(function(e){return e.url})}).then(function(e){return new Set(e)})}var precacheConfig=[["/index.html","735f48e99b2083644216dec745f5222a"],["/static/css/main.bffd7f45.css","fdb5edac8117a3e3db1da822286ffcc4"],["/static/js/main.9a125ea2.js","53ee4e093ebabbc19d0ceea72b845683"],["/static/media/bB.1f3b8d1a.svg","1f3b8d1a5879539b447e445f640b2c47"],["/static/media/bK.66e1bcad.svg","66e1bcad247d72c9e9737b71ce9e87cf"],["/static/media/bN.3377efa1.svg","3377efa12c40355e286e8d61d7ed3322"],["/static/media/bP.1c52d8c4.svg","1c52d8c48822d6d34d8930244159e6f3"],["/static/media/bQ.7b3e33e4.svg","7b3e33e471081b583cef68ff12e4a0b7"],["/static/media/bR.96872a66.svg","96872a66f1b7e639aa91bd133e17bb35"],["/static/media/wB.09004fd2.svg","09004fd25a45b4c67f0bbc41a09062af"],["/static/media/wK.250510ff.svg","250510fffdafda4ad4ab5f5504f2af55"],["/static/media/wN.4c6d6254.svg","4c6d6254347b1f477089bffc4128c6da"],["/static/media/wP.d69014fb.svg","d69014fbb3f6e3da7b29d058477c1e9a"],["/static/media/wQ.4320a2dd.svg","4320a2dd26e5bc4ee9f550f3aecd737c"],["/static/media/wR.095b1a06.svg","095b1a06667a527afbd834e74f00edc9"]],cacheName="sw-precache-v3-sw-precache-webpack-plugin-"+(self.registration?self.registration.scope:""),ignoreUrlParametersMatching=[/^utm_/],addDirectoryIndex=function(e,t){var a=new URL(e);return"/"===a.pathname.slice(-1)&&(a.pathname+=t),a.toString()},cleanResponse=function(e){if(!e.redirected)return Promise.resolve(e);return("body"in e?Promise.resolve(e.body):e.blob()).then(function(t){return new Response(t,{headers:e.headers,status:e.status,statusText:e.statusText})})},createCacheKey=function(e,t,a,n){var r=new URL(e);return n&&r.pathname.match(n)||(r.search+=(r.search?"&":"")+encodeURIComponent(t)+"="+encodeURIComponent(a)),r.toString()},isPathWhitelisted=function(e,t){if(0===e.length)return!0;var a=new URL(t).pathname;return e.some(function(e){return a.match(e)})},stripIgnoredUrlParameters=function(e,t){var a=new URL(e);return a.hash="",a.search=a.search.slice(1).split("&").map(function(e){return e.split("=")}).filter(function(e){return t.every(function(t){return!t.test(e[0])})}).map(function(e){return e.join("=")}).join("&"),a.toString()},hashParamName="_sw-precache",urlsToCacheKeys=new Map(precacheConfig.map(function(e){var t=e[0],a=e[1],n=new URL(t,self.location),r=createCacheKey(n,hashParamName,a,/\.\w{8}\./);return[n.toString(),r]}));self.addEventListener("install",function(e){e.waitUntil(caches.open(cacheName).then(function(e){return setOfCachedUrls(e).then(function(t){return Promise.all(Array.from(urlsToCacheKeys.values()).map(function(a){if(!t.has(a)){var n=new Request(a,{credentials:"same-origin"});return fetch(n).then(function(t){if(!t.ok)throw new Error("Request for "+a+" returned a response with status "+t.status);return cleanResponse(t).then(function(t){return e.put(a,t)})})}}))})}).then(function(){return self.skipWaiting()}))}),self.addEventListener("activate",function(e){var t=new Set(urlsToCacheKeys.values());e.waitUntil(caches.open(cacheName).then(function(e){return e.keys().then(function(a){return Promise.all(a.map(function(a){if(!t.has(a.url))return e.delete(a)}))})}).then(function(){return self.clients.claim()}))}),self.addEventListener("fetch",function(e){if("GET"===e.request.method){var t,a=stripIgnoredUrlParameters(e.request.url,ignoreUrlParametersMatching),n="index.html";(t=urlsToCacheKeys.has(a))||(a=addDirectoryIndex(a,n),t=urlsToCacheKeys.has(a));var r="/index.html";!t&&"navigate"===e.request.mode&&isPathWhitelisted(["^(?!\\/__).*"],e.request.url)&&(a=new URL(r,self.location).toString(),t=urlsToCacheKeys.has(a)),t&&e.respondWith(caches.open(cacheName).then(function(e){return e.match(urlsToCacheKeys.get(a)).then(function(e){if(e)return e;throw Error("The cached response that was expected is missing.")})}).catch(function(t){return console.warn('Couldn\'t serve response for "%s" from cache: %O',e.request.url,t),fetch(e.request)}))}});