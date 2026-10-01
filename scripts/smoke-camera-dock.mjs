// Browser integration smoke. Run with the dev server on port 3000.
// agent-browser is invoked through npx; no project dependency is added.
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

const browser = (...args) => execFileSync(process.env.MM_BROWSER_BIN || 'npx', process.env.MM_BROWSER_BIN ? args : ['--yes', 'agent-browser', ...args], { encoding: 'utf8' }).trim();
const evaluate = code => {
  const result = JSON.parse(browser('eval', code));
  return typeof result === 'string' ? JSON.parse(result) : result;
};
const settle = code => evaluate(`(async () => { ${code}; await new Promise(r => setTimeout(r, 180)); return true; })()`);
const check = (name, code) => { assert.equal(evaluate(code), true, name); console.log(`PASS ${name}`); };
const mode = expected => check(`mode ${expected}`, `document.querySelector('[data-camera-dock]').dataset.cameraDock === '${expected}'`);
const click = label => settle(`document.querySelector('[aria-label="${label}"]').click()`);

browser('open', process.env.MM_SMOKE_URL || 'http://127.0.0.1:3000');
browser('set', 'media', 'reduced-motion', 'reduce');
browser('set', 'viewport', '390', '844');
settle(`window.scrollTo(0,0); document.activeElement?.blur(); window.__canvas = document.querySelector('.mm-camera-dock canvas')`);
mode('expanded');
check('44px dock targets', `Array.from(document.querySelectorAll('.mm-camera-dock-toolbar button')).every(b => b.getBoundingClientRect().width >= 44 && b.getBoundingClientRect().height >= 44)`);

// A synthetic local MediaStream exercises the real camera lifecycle without hardware.
settle(`
  const source = document.createElement('canvas'); source.width=640; source.height=480;
  const ctx=source.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,640,480);
  window.__sourceTimer=setInterval(()=>ctx.fillRect(0,0,640,480),33);
  window.__requests=0; window.__stops=0;
  navigator.mediaDevices.getUserMedia = async () => {
    window.__requests++;
    const stream=source.captureStream(30);
    for(const track of stream.getTracks()) {
      const stop=track.stop.bind(track);
      track.stop=()=>{window.__stops++; stop()};
    }
    window.__stream=stream; return stream;
  };
  const detector=document.querySelector('select[aria-label="Modo de detección"]');
  detector.closest('details').open=true;
  detector.value='colored_balls'; detector.dispatchEvent(new Event('change',{bubbles:true}));
`);
settle(`Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Activar cámara').click()`);
settle(`window.__video=document.querySelector('.mm-camera-dock video'); document.activeElement?.blur()`);
check('camera initialized once', `window.__requests===1 && window.__video?.srcObject===window.__stream && window.__stream.getTracks().every(t=>t.readyState==='live')`);
check('video is playing', `window.__video.readyState>=2 && !window.__video.paused`);
settle(`window.__draws=0; const ctx=window.__canvas.getContext('2d'); const clear=ctx.clearRect.bind(ctx); ctx.clearRect=(...args)=>{window.__draws++;clear(...args)}`);

for (const [width,height] of [[320,568],[390,844],[640,960],[767,800],[667,375]]) {
  browser('set','viewport',String(width),String(height));
  settle(`window.scrollTo(0,0); document.activeElement?.blur()`);
  click('Ampliar cámara');
  settle(`document.activeElement?.blur(); window.scrollTo(0,document.querySelector('.mm-camera-anchor').getBoundingClientRect().bottom+scrollY+20)`);
  mode('floating');
  check(`${width}x${height}: no horizontal overflow`, `document.documentElement.scrollWidth<=innerWidth`);
  check(`${width}x${height}: fixed dock inside viewport`, `(()=>{const r=document.querySelector('[data-camera-dock]').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight})()`);
  check('floating hides secondary controls', `getComputedStyle(document.querySelector('.mm-camera-settings')).display==='none'`);
  click('Minimizar cámara sin detener seguimiento');
  settle(`window.__drawsBefore=window.__draws`);
  mode('minimized');
  check('tracking still updates minimized canvas', `window.__draws>window.__drawsBefore`);
  check('minimized subtree hidden and restore focused', `document.querySelector('#mm-camera-dock-content').hidden && document.activeElement?.getAttribute('aria-label')==='Restaurar cámara'`);
  check('camera/video/canvas/stream persist', `document.querySelector('.mm-camera-dock video')===window.__video && document.querySelector('.mm-camera-dock canvas')===window.__canvas && window.__video.srcObject===window.__stream && window.__requests===1 && window.__stops===0`);
  click('Restaurar cámara');
  mode('expanded');
  check('restore scrolls to original panel', `document.querySelector('.mm-camera-anchor').getBoundingClientRect().top>=0`);
}

for (const [width,height] of [[768,1024],[1024,768],[1440,900]]) {
  browser('set','viewport',String(width),String(height));
  settle(`window.scrollTo(0,900); document.activeElement?.blur()`);
  mode('expanded');
  check(`${width}x${height}: no horizontal overflow`, `document.documentElement.scrollWidth<=innerWidth`);
  check('desktop toolbar hidden', `getComputedStyle(document.querySelector('.mm-camera-dock-toolbar')).display==='none'`);
}

browser('set','viewport','390','844');
settle(`document.activeElement?.blur(); window.scrollTo(0,0)`);
click('Ampliar cámara');
settle(`document.activeElement?.blur(); window.scrollTo(0,document.querySelector('.mm-camera-anchor').getBoundingClientRect().bottom+scrollY+20)`);
mode('floating');
settle(`
 const button=document.createElement('button');button.textContent='Smoke focus target';button.id='smoke-focus';
 Object.assign(button.style,{position:'fixed',right:'20px',bottom:'80px',width:'100px',height:'44px'});
 document.body.append(button);button.focus();
`);
mode('minimized');
check('outside focused control stays focused', `document.activeElement?.id==='smoke-focus'`);
settle(`document.querySelector('#smoke-focus').remove()`);
click('Restaurar cámara');
settle(`Array.from(document.querySelectorAll('.mm-module-nav button')).find(b=>b.textContent.includes('Pentagrama')).click()`);
check('module change preserves camera lifecycle', `document.querySelector('.mm-camera-dock video')===window.__video && document.querySelector('.mm-camera-dock canvas')===window.__canvas && window.__requests===1 && window.__stops===0`);
settle(`Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Detener cámara').click()`);
check('explicit stop releases stream', `window.__stops===1 && window.__stream.getTracks().every(t=>t.readyState==='ended')`);
check('simulation retains canvas', `document.querySelector('.mm-camera-dock canvas')===window.__canvas && !document.querySelector('.mm-camera-dock video')`);
for (const module of ['Instrumento','Ritmo','Pentagrama','Compás']) {
  settle(`Array.from(document.querySelectorAll('.mm-module-nav button')).find(b=>b.textContent.includes('${module}')).click(); document.activeElement?.blur(); window.scrollTo(0,0)`);
  click('Ampliar cámara');
  settle(`document.activeElement?.blur(); window.scrollTo(0,document.querySelector('.mm-camera-anchor').getBoundingClientRect().bottom+scrollY+20)`);
  mode('floating');
  check(`${module}: simulated canvas retained, no overflow`, `document.querySelector('.mm-camera-dock canvas')===window.__canvas && document.documentElement.scrollWidth<=innerWidth`);
}
check('reduced motion preference exercised', `matchMedia('(prefers-reduced-motion: reduce)').matches`);
settle(`clearInterval(window.__sourceTimer)`);

browser('screenshot','/workspace/scratch/mm-ux1b-smoke.png');
console.log('MM-UX1B responsive/lifecycle smoke PASS (synthetic stream; no hardware claim).');
