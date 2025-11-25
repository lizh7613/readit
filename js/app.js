//Nav
const pages = document.querySelectorAll('.page');
const navBtns = document.querySelectorAll('.nav-btn');
navBtns.forEach(b=>b.addEventListener('click',()=>{
  navBtns.forEach(x=>x.classList.remove('active'));
  pages.forEach(p=>p.classList.remove('active'));
  b.classList.add('active');
  document.getElementById(b.dataset.target).classList.add('active');
}));

//Camera
const video = document.getElementById('video');
const captureBtn = document.getElementById('capture-btn');
const canvas = document.getElementById('capture-canvas');
let currentStream = null;
let useFacingMode = localStorage.getItem('facing') || 'environment';

//Vibrate
function vibrate(){ if (navigator.vibrate) navigator.vibrate(40); }
document.addEventListener('click', (e)=>{ if (e.target && e.target.closest && e.target.closest('button')) vibrate(); });
async function startCamera(){
  if (currentStream){currentStream.getTracks().forEach(t=>t.stop());}
  try{
    const constraints={video:{facingMode: useFacingMode}, audio:false};
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = currentStream;
  }catch(e){console.error('camera error',e)}
}

//Capture & OCR
captureBtn.addEventListener('click',async ()=>{
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video,0,0,canvas.width,canvas.height);
  const data = canvas.toDataURL('image/jpeg',0.9);
  localStorage.setItem('capturedImage', data);
  document.getElementById('ocr-status').textContent = 'Image captured.';
  document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active'));
  document.querySelector('[data-target="page-ocr"]').classList.add('active');
  pages.forEach(p=>p.classList.remove('active'));
  document.getElementById('page-ocr').classList.add('active');
  await runAutoOcr();
});

const ocrResult = document.getElementById('ocr-result');
const ocrStatus = document.getElementById('ocr-status');

async function runAutoOcr(){
  const img = localStorage.getItem('capturedImage');
  if (!img){ocrStatus.textContent='No image captured.';return}
  const spinner = document.getElementById('ocr-spinner');
  spinner.hidden = false; spinner.setAttribute('aria-hidden','false');
  ocrStatus.textContent='';
  ocrResult.textContent='';
  try{
    const adapter = window.ocrAdapter;
    if (!adapter){ ocrStatus.textContent='OCR adapter not available.'; return; }
      const lang = localStorage.getItem('ocrLang') || 'eng';
    const text = await adapter.recognizeDataUrl(img, {lang});
    ocrStatus.textContent='';
    ocrResult.textContent = text;
  }catch(e){
    console.error(e);
    ocrStatus.textContent='OCR failed: '+(e.message||e);
  } finally {
    spinner.hidden = true; spinner.setAttribute('aria-hidden','true');
  }
}

//Formatting settings
const ocrFontSelect = document.getElementById('ocr-font');
const ocrColorInput = document.getElementById('ocr-color');
const ocrSizeInput = document.getElementById('ocr-size');
const ocrBgInput = document.getElementById('ocr-bgcolor');

function applyOcrStyle(){
  const font = localStorage.getItem('ocrFont') || ocrFontSelect.value;
  const color = localStorage.getItem('ocrColor') || ocrColorInput.value;
  const size = localStorage.getItem('ocrSize') || ocrSizeInput.value;
  const background = localStorage.getItem('ocrBgcolor') || ocrBgInput.value;

  const pre = document.getElementById('ocr-result');
    pre.style.fontFamily = font;
    pre.style.color = color;
    pre.style.fontSize = (size)+'px';
    pre.style.backgroundColor = background;
}

function loadSettings(){
  ocrFontSelect.value = localStorage.getItem('ocrFont') || ocrFontSelect.value;
  ocrColorInput.value = localStorage.getItem('ocrColor') || ocrColorInput.value;
  ocrSizeInput.value = localStorage.getItem('ocrSize') || ocrSizeInput.value;
  ocrBgInput.value = localStorage.getItem('ocrBgcolor') || ocrBgInput.value;
  applyOcrStyle();
}

loadSettings();
startCamera();

ocrFontSelect.addEventListener('change', ()=>{ localStorage.setItem('ocrFont', ocrFontSelect.value); applyOcrStyle(); });
ocrColorInput.addEventListener('change', ()=>{ localStorage.setItem('ocrColor', ocrColorInput.value); applyOcrStyle(); });
ocrSizeInput.addEventListener('change', ()=>{ localStorage.setItem('ocrSize', ocrSizeInput.value); applyOcrStyle(); });
ocrBgInput.addEventListener('change', ()=>{ localStorage.setItem('ocrBgcolor', ocrBgInput.value); applyOcrStyle(); });