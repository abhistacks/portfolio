const {spawn} = require('node:child_process');
const {mkdtemp,rm} = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const delay = ms => new Promise(r=>setTimeout(r,ms));
(async()=>{
 const profile=await mkdtemp(path.join(os.tmpdir(),'portfolio-scroll-'));
 const browser=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new','--disable-extensions','--remote-debugging-port=9337','--remote-allow-origins=*',`--user-data-dir=${profile}`,'--no-first-run','--window-size=1640,1000','about:blank'], {windowsHide:true,stdio:'ignore'});
 let ws;
 try {
  let pages;
  for(let i=0;i<50;i++){try{pages=await (await fetch('http://127.0.0.1:9337/json')).json();break;}catch{await delay(100);}}
  if(!pages)throw Error('Browser did not start');
  ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
  let id=0;const pending=new Map();
  ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}});
  const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  await send('Page.enable');await send('Runtime.enable');await send('Emulation.setCPUThrottlingRate',{rate:4});
  await send('Page.navigate',{url:pathToFileURL(path.resolve('index.html')).href});await delay(2200);
  const stack = await evaluate(`JSON.stringify({cards:document.querySelectorAll('.tech-card').length,columns:getComputedStyle(document.querySelector('.tech-grid')).gridTemplateColumns,iconsLoaded:[...document.querySelectorAll('.tech-card img')].every(i=>i.complete&&i.naturalWidth>0)})`);
  console.log('stack',stack);
  const bounds=await evaluate(`(()=>{const r=document.querySelector('#stack').getBoundingClientRect();return {x:r.x,y:r.y+scrollY,width:r.width,height:r.height,scale:1}})()`);
  const screenshot=await send('Page.captureScreenshot',{format:'png',clip:bounds,captureBeyondViewport:true});
  require('node:fs').writeFileSync('stack-preview.png',Buffer.from(screenshot.data,'base64'));
  console.log('services',await evaluate(`JSON.stringify({cards:document.querySelectorAll('.offering-card').length,columns:getComputedStyle(document.querySelector('.offerings-grid')).gridTemplateColumns})`));
  const serviceBounds=await evaluate(`(()=>{const r=document.querySelector('#services').getBoundingClientRect();return {x:r.x,y:r.y+scrollY,width:r.width,height:r.height,scale:1}})()`);
  const servicesScreenshot=await send('Page.captureScreenshot',{format:'png',clip:serviceBounds,captureBeyondViewport:true});
  require('node:fs').writeFileSync('services-preview.png',Buffer.from(servicesScreenshot.data,'base64'));
  console.log('footer',await evaluate(`JSON.stringify({arrowColor:getComputedStyle(document.querySelector('.footer-arrow')).color,arrowWidth:document.querySelector('.footer-arrow svg').getBoundingClientRect().width,contactLinks:document.querySelectorAll('.contact-row').length})`));
  const footerBounds=await evaluate(`(()=>{const r=document.querySelector('#contact').getBoundingClientRect();return {x:r.x,y:r.y+scrollY,width:r.width,height:r.height,scale:1}})()`);
  const footerScreenshot=await send('Page.captureScreenshot',{format:'png',clip:footerBounds,captureBeyondViewport:true});
  require('node:fs').writeFileSync('footer-preview.png',Buffer.from(footerScreenshot.data,'base64'));
  const content=await evaluate(`({projectCards:document.querySelectorAll('.case-card').length,descriptions:document.querySelectorAll('.case-details').length,responsibilities:document.querySelectorAll('.experience-points li').length,stats:document.querySelector('.hero-stats').textContent})`);
  if(content.projectCards!==7||content.descriptions!==7||content.responsibilities!==3||content.stats.includes('100%'))throw Error('Portfolio content check failed');
  console.log('content',content);
  const workBounds=await evaluate(`(()=>{const r=document.querySelector('#work').getBoundingClientRect();return {x:r.x,y:r.y+scrollY,width:r.width,height:r.height,scale:1}})()`);
  const workScreenshot=await send('Page.captureScreenshot',{format:'png',clip:workBounds,captureBeyondViewport:true});
  require('node:fs').writeFileSync('work-preview.png',Buffer.from(workScreenshot.data,'base64'));
  const careerBounds=await evaluate(`(()=>{const r=document.querySelector('#experience').getBoundingClientRect();return {x:r.x,y:r.y+scrollY,width:r.width,height:r.height,scale:1}})()`);
  const careerScreenshot=await send('Page.captureScreenshot',{format:'png',clip:careerBounds,captureBeyondViewport:true});
  require('node:fs').writeFileSync('experience-preview.png',Buffer.from(careerScreenshot.data,'base64'));
  console.log('headerWorkLinks',await evaluate(`document.querySelectorAll('nav a[href="#work"]').length`));
  console.log('layout', await evaluate(`JSON.stringify({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,images:[...document.images].map(i=>({loaded:i.complete&&i.naturalWidth>0,width:i.getBoundingClientRect().width}))})`));
  await evaluate(`window.samples=[];window.longTasks=[];new PerformanceObserver(l=>longTasks.push(...l.getEntries().map(e=>e.duration))).observe({type:'longtask',buffered:false});window.sampling=true;let last=performance.now();function sample(t){samples.push({dt:t-last,y:scrollY,h:document.documentElement.scrollHeight});last=t;if(sampling)requestAnimationFrame(sample)}requestAnimationFrame(sample)`);
  for(let i=0;i<35;i++){await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:1000,y:650,deltaX:0,deltaY:120});await delay(50);}
  await delay(700);
  console.log('scroll',await evaluate(`sampling=false;JSON.stringify({y:scrollY,frames:samples.length,framesOver33ms:samples.filter(s=>s.dt>33).length,maxFrameMs:Math.max(...samples.map(s=>s.dt)),heightChanges:new Set(samples.map(s=>s.h)).size,workFrames:samples.filter(s=>s.y>300&&s.y<1700).length,workFramesOver33ms:samples.filter(s=>s.y>300&&s.y<1700&&s.dt>33).length,longTasks})`));
  for (const width of [390, 820]) {
   await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
   await evaluate('window.scrollTo({top:0,behavior:"instant"})');await delay(250);
   if(width===390) {
    const typing=await evaluate(`new Promise(resolve=>{const snapshots=[];let count=0;const timer=setInterval(()=>{snapshots.push({text:document.querySelector('.typewriter-live').textContent,height:document.querySelector('.typewriter-text').getBoundingClientRect().height,pageHeight:document.documentElement.scrollHeight});if(++count===30){clearInterval(timer);resolve({textChanges:new Set(snapshots.map(s=>s.text)).size,heightChanges:new Set(snapshots.map(s=>s.height)).size,pageHeightChanges:new Set(snapshots.map(s=>s.pageHeight)).size})}},120)})`);
    if(typing.textChanges<2||typing.heightChanges!==1||typing.pageHeightChanges!==1)throw Error('Typewriter missing or shifting layout: '+JSON.stringify(typing));
    console.log('typewriter',typing);
   }
   const badgeGap=await evaluate(`document.querySelector('.availability').getBoundingClientRect().top-document.querySelector('.site-header').getBoundingClientRect().bottom`);
   if(badgeGap<12) throw Error('Availability badge overlaps header');
   console.log('availabilitySpacing',{width,gap:badgeGap});
   console.log('responsive',await evaluate('JSON.stringify({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,footerColumns:getComputedStyle(document.querySelector(".footer-main")).gridTemplateColumns,serviceColumns:getComputedStyle(document.querySelector(".offerings-grid")).gridTemplateColumns,stackColumns:getComputedStyle(document.querySelector(".tech-grid")).gridTemplateColumns})'));
   await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:200,y:500,deltaX:0,deltaY:500});await delay(350);
   console.log('responsiveScroll',await evaluate('JSON.stringify({y:scrollY,backToTop:document.querySelector(".back-to-top").classList.contains("is-visible")})'));
   const hiddenDown=await evaluate(`document.querySelector('.site-header').classList.contains('header-hidden')`);
   if (hiddenDown !== (width <= 760)) throw Error('Incorrect header state after downward scroll');
   await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:200,y:500,deltaX:0,deltaY:-160});await delay(350);
   const hiddenUp=await evaluate(`document.querySelector('.site-header').classList.contains('header-hidden')`);
   if(hiddenUp) throw Error('Header did not return after upward scroll');
   await evaluate('window.scrollTo({top:0,behavior:"instant"})');await delay(100);
   if(await evaluate(`document.querySelector('.site-header').classList.contains('header-hidden')`)) throw Error('Header hidden at page top');
   console.log('headerBehavior', {width,hiddenDown,hiddenUp,visibleAtTop:true});

  }
  await send('Browser.close');
 } finally {ws?.close();browser.kill();await delay(300);await rm(profile,{recursive:true,force:true}).catch(()=>{});}
})().catch(e=>{console.error(e);process.exitCode=1;});
