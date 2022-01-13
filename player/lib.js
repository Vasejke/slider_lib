/**
 * Initialization player for Stories at the choosing params
 * 
 * @param {{
 * target: string,
 * slide: Array<{url: string, alt?: string}>,
 * delayPerSlides?: number
 * }} params - options of intialization:
 * 
 * 1.target - place of initialization player, CSS selector
 * 2. slides - list of player slides
 * 3. dealyPerSlide - how long is one slide shown
 * @return {Element || null} 
 */

function initPlayer(params) {
  const 
      target = document.querySelector(params.target);

  if (target === null || params.slides === undefined) {
    return null;
  }

let 
  timelineTimer;

let 
  timelineChunks = '';
  playerChunks = '';

let 
  isFirst = true;

for(const slide of params.slides){
  timelineChunks += generateTimeline(isFirst);
  playerChunks += generatePlayer(slide,isFirst);
  isFirst = false;
}

target.innerHTML = generatePlayerLayout();
target.querySelector('.player__chunk_prev').addEventListener('click', switchPrev);
target.querySelector('.player__chunk_next').addEventListener('click', switchNext);

runSwitching(params.delayPerSlide || 1, 1);

return target.querySelector('.player');


function moveClass (className,method,pred) {
  const 
      active = target.querySelector('.' + className),
      next = active[method];

  if(pred && !pred(active)){
    return null;
  }
  if(next){
    active.classList.remove(className);
    next.classList.add(className);

    return active;
  }
  return null;
}
function switchPrev() {
  moveClass("player__chunk__active", "previousElementSibling");
  
  moveClass("timeline__chunk__active", "previousElementSibling", (el) => {
      const
        inner = el.querySelector(".timeline__chunk__inner"),
        w = parseFloat(inner.style.width) || 0;
       
       el.querySelector(".timeline__chunk__inner").style.width = '';
       return w <= 20;
    });
}

function generateTimeline(isFirst) {
  return `
<div class="timeline__chunk ${isFirst ? 'timeline__chunk__active' : ''}">
        <div class="timeline__chunk__inner"></div>
</div>`;
}

function generatePlayer(slide, isFirst) {
  return `
<div class="player__chunk ${isFirst ? 'player__chunk__active': ''}">
            <img src="${slide.url}" alt="${slide.alt || ''}">
            ${generateOverlay(slide)}
</div>`;
}
function generateOverlay(slide) {
  if(slide.overlays === undefined) {
    return '';
  }

  let res = '';

  for (const el of slide.overlays){
    const styles = (el.styles !==undefined ? Object.entries(el.styles) : [])
      .map((el) => el.join(':'))
      .join(';');

    res += `<div class="player__chunk__overlay" style=""></div>`
  } 
  return res;
  
  function renderOverlay(overlay){
    if(overlay.type =='img'){
      return `<img src="${overlay.value}" alt=""`;
    }
    
    return '';
  }
}


function generatePlayerLayout(){
  return `
  <div class="player">
    <div class="timeline">${timelineChunks}</div>
      <div class="player__content__wrapper">
        <div class="player__chunk__switcher player__chunk_prev"></div>
        <div class="player__chunk__switcher player__chunk_next"></div>
        <div class="player__content">${playerChunks}</div>
      </div>
  </div>
  `
}

function switchNext(){
  moveClass("player__chunk__active", "nextElementSibling");

  const 
    el = moveClass("timeline__chunk__active", "nextElementSibling");

  if(el) {
    el.querySelector(".timeline__chunk__inner").style.width = '';
    }
 }
  
function runSwitching(time, step) {
  clearInterval(timelineTimer);

  timelineTimer = setInterval(() => {
    const
      active = target.querySelector('.timeline__chunk__active').querySelector(".timeline__chunk__inner");
    const
      w = parseFloat(active.style.width) || 0;
  
    if (w === 100) {
      switchNext();
      return;
    }  
  
    active.style.width = String(w + step) + '%';
    }, time * 1000 * step/100);
  }
}