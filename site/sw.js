/* Works at a domain root and at a GitHub Pages project subpath. */
const VERSION='bue-portable-voice-icon-v21';
const ROOT=new URL('./',self.location.href).pathname;
const PREFIX='bue-portable|'+ROOT+'|';
const CACHE=PREFIX+VERSION;
const FILES=["android/index.html", "aperolka-v09.webmanifest", "aperolka-v10.webmanifest", "aperolka/apple-touch-icon-120x120.png", "aperolka/apple-touch-icon-152x152.png", "aperolka/apple-touch-icon-167x167.png", "aperolka/apple-touch-icon-180x180.png", "aperolka/apple-touch-icon-precomposed.png", "aperolka/apple-touch-icon.png", "aperolka/index.html", "appearance-v20.js", "apple-touch-icon-120x120.png", "apple-touch-icon-152x152.png", "apple-touch-icon-167x167.png", "apple-touch-icon-180x180.png", "apple-touch-icon-precomposed.png", "apple-touch-icon.png", "assets/action90s-portraits-v16.png", "assets/apple-touch-icon-aperolka-v09.png", "assets/apple-touch-icon-ironman-120-v10.png", "assets/apple-touch-icon-ironman-152-v10.png", "assets/apple-touch-icon-ironman-167-v10.png", "assets/apple-touch-icon-ironman-180-v10.png", "assets/apple-touch-icon.png", "assets/bue-icon-1024-v21.png", "assets/bue-icon-120-v21.png", "assets/bue-icon-152-v21.png", "assets/bue-icon-167-v21.png", "assets/bue-icon-180-v21.png", "assets/bue-icon-192-v21.png", "assets/bue-icon-512-v21.png", "assets/bue-icon-maskable-512-v21.png", "assets/bue-icon-v21.ico", "assets/bue-mk-icon-v13.png", "assets/deadpool-wolverine.svg", "assets/gentle-portraits-v17.png", "assets/gentle.svg", "assets/guardians.svg", "assets/helmet-1024.png", "assets/helmet.svg", "assets/icon-192.png", "assets/icon-512.png", "assets/ironman-icon-192-v05.png", "assets/ironman-icon-192-v09.png", "assets/ironman-icon-192-v10.png", "assets/ironman-icon-512-v05.png", "assets/ironman-icon-512-v09.png", "assets/ironman-icon-512-v10.png", "assets/ironman-reference-v05.png", "assets/loki.svg", "assets/mk3-fighters-v12.png", "assets/movie-portraits-v17/blade.jpg", "assets/movie-portraits-v17/cable.jpg", "assets/movie-portraits-v17/captain.jpg", "assets/movie-portraits-v17/colossus.png", "assets/movie-portraits-v17/corvus.jpg", "assets/movie-portraits-v17/cosmo.jpg", "assets/movie-portraits-v17/cull.png", "assets/movie-portraits-v17/deadpool.jpg", "assets/movie-portraits-v17/domino.jpg", "assets/movie-portraits-v17/drax.jpg", "assets/movie-portraits-v17/fury.jpg", "assets/movie-portraits-v17/gambit.jpg", "assets/movie-portraits-v17/gamora.jpg", "assets/movie-portraits-v17/groot.jpg", "assets/movie-portraits-v17/heimdall.jpg", "assets/movie-portraits-v17/hela.jpg", "assets/movie-portraits-v17/hulk.jpg", "assets/movie-portraits-v17/ironman.jpg", "assets/movie-portraits-v17/loki.jpg", "assets/movie-portraits-v17/mantis.jpg", "assets/movie-portraits-v17/maw.jpg", "assets/movie-portraits-v17/minutes.jpg", "assets/movie-portraits-v17/mobius.jpg", "assets/movie-portraits-v17/nebula.jpg", "assets/movie-portraits-v17/negasonic.jpg", "assets/movie-portraits-v17/odin.jpg", "assets/movie-portraits-v17/proxima.jpg", "assets/movie-portraits-v17/rescue.jpg", "assets/movie-portraits-v17/rocket.jpg", "assets/movie-portraits-v17/ronan.jpg", "assets/movie-portraits-v17/spiderman.jpg", "assets/movie-portraits-v17/starlord.jpg", "assets/movie-portraits-v17/strange.jpg", "assets/movie-portraits-v17/sylvie.jpg", "assets/movie-portraits-v17/thanos.jpg", "assets/movie-portraits-v17/thor.jpg", "assets/movie-portraits-v17/valkyrie.jpg", "assets/movie-portraits-v17/vision-photo.jpg", "assets/movie-portraits-v17/vision.webp", "assets/movie-portraits-v17/warmachine.jpg", "assets/movie-portraits-v17/wolverine.jpg", "assets/movie-portraits-v17/x23.jpg", "assets/movie-portraits-v17/yondu.jpg", "assets/portraits-v16/deadpool-wolverine-calendar.svg", "assets/portraits-v16/deadpool-wolverine-goals.svg", "assets/portraits-v16/deadpool-wolverine-money.svg", "assets/portraits-v16/deadpool-wolverine-reading.svg", "assets/portraits-v16/deadpool-wolverine-recipes.svg", "assets/portraits-v16/deadpool-wolverine-settings.svg", "assets/portraits-v16/deadpool-wolverine-tasks.svg", "assets/portraits-v16/deadpool-wolverine-today.svg", "assets/portraits-v16/deadpool-wolverine-watch.svg", "assets/portraits-v16/gentle-calendar.svg", "assets/portraits-v16/gentle-goals.svg", "assets/portraits-v16/gentle-money.svg", "assets/portraits-v16/gentle-reading.svg", "assets/portraits-v16/gentle-recipes.svg", "assets/portraits-v16/gentle-settings.svg", "assets/portraits-v16/gentle-tasks.svg", "assets/portraits-v16/gentle-today.svg", "assets/portraits-v16/gentle-watch.svg", "assets/portraits-v16/guardians-calendar.svg", "assets/portraits-v16/guardians-goals.svg", "assets/portraits-v16/guardians-money.svg", "assets/portraits-v16/guardians-reading.svg", "assets/portraits-v16/guardians-recipes.svg", "assets/portraits-v16/guardians-settings.svg", "assets/portraits-v16/guardians-tasks.svg", "assets/portraits-v16/guardians-today.svg", "assets/portraits-v16/guardians-watch.svg", "assets/portraits-v16/ironman-calendar.svg", "assets/portraits-v16/ironman-goals.svg", "assets/portraits-v16/ironman-money.svg", "assets/portraits-v16/ironman-reading.svg", "assets/portraits-v16/ironman-recipes.svg", "assets/portraits-v16/ironman-settings.svg", "assets/portraits-v16/ironman-tasks.svg", "assets/portraits-v16/ironman-today.svg", "assets/portraits-v16/ironman-watch.svg", "assets/portraits-v16/loki-calendar.svg", "assets/portraits-v16/loki-goals.svg", "assets/portraits-v16/loki-money.svg", "assets/portraits-v16/loki-reading.svg", "assets/portraits-v16/loki-recipes.svg", "assets/portraits-v16/loki-settings.svg", "assets/portraits-v16/loki-tasks.svg", "assets/portraits-v16/loki-today.svg", "assets/portraits-v16/loki-watch.svg", "assets/portraits-v16/thanos-calendar.svg", "assets/portraits-v16/thanos-goals.svg", "assets/portraits-v16/thanos-money.svg", "assets/portraits-v16/thanos-reading.svg", "assets/portraits-v16/thanos-recipes.svg", "assets/portraits-v16/thanos-settings.svg", "assets/portraits-v16/thanos-tasks.svg", "assets/portraits-v16/thanos-today.svg", "assets/portraits-v16/thanos-watch.svg", "assets/reactor.png", "assets/thanos.svg", "bue-v15.webmanifest", "bue-v21.webmanifest", "bue/apple-touch-icon-120x120.png", "bue/apple-touch-icon-152x152.png", "bue/apple-touch-icon-167x167.png", "bue/apple-touch-icon-180x180.png", "bue/apple-touch-icon-precomposed.png", "bue/apple-touch-icon.png", "bue/index.html", "devices/index.html", "favicon.ico", "hero.css", "index.html", "iphone/index.html", "manifest.webmanifest", "mk3-v12.css", "navigation-v14.css", "ocr.css", "ocr.js", "offline-v09.js", "offline-v10.js", "offline-v12.js", "offline-v14.js", "offline-v15.js", "offline-v16.js", "offline-v17.js", "offline-v19.js", "offline-v20.js", "offline-v21.js", "offline.js", "theme-portraits-v16.css", "theme-portraits-v16.js", "theme-portraits-v17.css", "theme-portraits-v17.js", "themes.css", "voice-commands-v20.js", "voice-v20.css", "voice-v20.js", "voice-v21.js"];
const ASSETS=FILES.map(file=>ROOT+file);
const ENTRIES=['','index.html','bue','bue/','bue/index.html','aperolka','aperolka/','aperolka/index.html'].map(file=>ROOT+file);
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const responses=await Promise.all(ASSETS.map(async path=>{
  const response=await fetch(new Request(path,{cache:'reload'}));
  if(!response.ok||new URL(response.url).origin!==self.location.origin)throw Error('Missing asset '+path);
  if(['index.html','bue/index.html','aperolka/index.html'].includes(path.slice(ROOT.length))&&!(await response.clone().text()).includes('myday-ios-preview-v1'))throw Error('Unexpected planner page');
  return new Response(await response.arrayBuffer(),{status:200,headers:response.headers});
 }));
 const cache=await caches.open(CACHE);
 await Promise.all(ASSETS.map((path,index)=>cache.put(path,responses[index])));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)));
 await self.clients.claim();
})()));
self.addEventListener('message',event=>{
 if(event.data?.type!=='OFFLINE_STATUS'||!event.ports[0])return;
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE),present=await Promise.all(ASSETS.map(path=>cache.match(path)));
  event.ports[0].postMessage({ready:present.every(Boolean),version:VERSION,entries:ENTRIES});
 })());
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(ROOT))return;
 if(request.mode==='navigate'&&ENTRIES.includes(url.pathname)){
  event.respondWith((async()=>{
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),3500);
   try{
    const response=await fetch(request,{signal:controller.signal});
    if(!response.ok||new URL(response.url).origin!==url.origin||!(await response.clone().text()).includes('myday-ios-preview-v1'))throw Error('Unavailable');
    return response;
   }catch(error){
    const path=url.pathname.slice(ROOT.length),shell=path.startsWith('bue')?'bue/index.html':path.startsWith('aperolka')?'aperolka/index.html':'index.html';
    return await(await caches.open(CACHE)).match(ROOT+shell)||new Response('Сначала откройте планер с интернетом.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
   }finally{clearTimeout(timer);}
  })());
 }else if(ASSETS.includes(url.pathname)){
  event.respondWith((async()=>await(await caches.open(CACHE)).match(url.pathname)||fetch(request))());
 }
});
