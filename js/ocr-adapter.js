// ocr-adapter.js
(function () {

  const TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/tesseract.min.js';

  let loadingPromise = null;

  function loadScript(url) {
    if (loadingPromise) return loadingPromise;
    loadingPromise = new Promise((resolve, reject) => {
      if (document.querySelector('script[data-tess-loader]')) {
        return resolve();
      }
      const s = document.createElement('script');
      s.src = url;
      s.setAttribute('data-tess-loader', '1');

      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load tesseract.js'));

      document.head.appendChild(s);
    });
    return loadingPromise;
  }

  const adapter = {
    load: async function () {
      await loadScript(TESSERACT_CDN);
    },
    recognizeDataUrl: async function (dataUrl, opts = {}) {
      await loadScript(TESSERACT_CDN);

      const lang = opts.lang || 'eng';

      const result = await window.Tesseract.recognize(
        dataUrl,
        lang,
      );

      return result?.data?.text || '';
    }
  };
  window.ocrAdapter = adapter;
})();
