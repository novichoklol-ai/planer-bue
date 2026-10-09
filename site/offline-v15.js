(() => {
  let ready = false, failed = false;
  const status = document.getElementById('offline-status');
  function showStatus() {
    status.dataset.ready = String(ready);
    status.textContent = ready
      ? (navigator.onLine ? 'Готов к работе без интернета' : 'Без интернета · записи сохраняются на устройстве')
      : failed ? 'Офлайн-режим пока не готов. Подключитесь к интернету и откройте планер снова.'
      : 'Подготовка к работе без интернета…';
  }
  function askWorker(worker) {
    return new Promise((resolve, reject) => {
      const channel = new MessageChannel();
      const timer = setTimeout(() => {channel.port1.close();reject(Error('Worker timeout'));}, 7000);
      channel.port1.onmessage = event => {
        clearTimeout(timer);channel.port1.close();const entryReady=!(/^\/(aperolka|bue)(\/|$)/.test(location.pathname))||event.data.entries?.includes(location.pathname);resolve(event.data.ready === true && entryReady === true && event.data.version === 'myday-shell-2026-10-09-devices-v15');
      };
      worker.postMessage({type: 'OFFLINE_STATUS'}, [channel.port2]);
    });
  }
  async function refresh() {
    try {
      const worker = navigator.serviceWorker.controller;
      if (worker) {ready = await askWorker(worker);failed = !ready && !navigator.onLine;}
    } catch (error) {failed = true;}
    showStatus();
  }
  window.addEventListener('online', () => {showStatus();refresh();});
  window.addEventListener('offline', showStatus);
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    failed = true;showStatus();return;
  }
  navigator.serviceWorker.addEventListener('controllerchange', refresh);
  // A cold offline launch can have a cached controller even if a registration update fails.
  refresh();
  navigator.serviceWorker.register('/sw.js', {scope: '/', updateViaCache: 'none'})
    .then(async registration => {
      await refresh();
      function observe(worker) {
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'redundant' && !ready) {failed = true;showStatus();}
          if (worker.state === 'activated') refresh();
        });
      }
      observe(registration.installing);
      registration.addEventListener('updatefound', () => observe(registration.installing));
      await navigator.serviceWorker.ready;
      await refresh();
    }).catch(async () => {await refresh();if (!ready) failed = true;showStatus();});
  showStatus();
})();
