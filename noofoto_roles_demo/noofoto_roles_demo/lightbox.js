/* Lightweight lightbox for gallery thumbnails
   - Finds .gallery-card .photo-thumb elements
   - Supports background-image, <img>, or data-large attributes
*/
(function(){
  function qs(sel, el){ return (el||document).querySelector(sel); }
  function qsa(sel, el){ return Array.from((el||document).querySelectorAll(sel)); }

  let thumbs = qsa('.gallery-card .photo-thumb');
  if(!thumbs.length) return; // nothing to do

  const items = thumbs.map(t => {
    let src = t.dataset.large || '';
    const img = qs('img', t);
    if(!src && img) src = img.src;
    if(!src){
      const bg = getComputedStyle(t).backgroundImage || '';
      const m = bg.match(/url\((?:"|')?(.*?)(?:"|')?\)/);
      if(m) src = m[1];
    }
    return { el: t, src };
  }).filter(i => i.src);
  if(!items.length) return;

  // build DOM
  const overlay = document.createElement('div'); overlay.id = 'noofoto-lightbox';
  overlay.innerHTML = `
    <div class="noofoto-lb-inner">
      <button class="noofoto-lb-btn" data-lb-close>✕</button>
      <button class="noofoto-lb-control noofoto-lb-prev" data-lb-prev>‹</button>
      <img src="" alt="" data-lb-img />
      <button class="noofoto-lb-control noofoto-lb-next" data-lb-next>›</button>
      <div class="noofoto-lb-meta" data-lb-meta></div>
    </div>`;
  document.body.appendChild(overlay);

  const imgEl = qs('[data-lb-img]', overlay);
  const metaEl = qs('[data-lb-meta]', overlay);
  let idx = 0;

  function openAt(i){
    idx = (i + items.length) % items.length;
    overlay.classList.add('open');
    const item = items[idx];
    imgEl.src = item.src;
    metaEl.textContent = (item.src.split('/').pop() || '') + ` `;
    // download link
    metaEl.innerHTML = metaEl.textContent + `<a class="noofoto-lb-download" href="${item.src}" download>↓ Tải</a>`;
    setTimeout(()=> imgEl.focus && imgEl.focus(), 50);
  }
  function close(){ overlay.classList.remove('open'); }
  function next(){ openAt(idx+1); }
  function prev(){ openAt(idx-1); }

  // attach listeners
  items.forEach((it,i)=>{
    it.el.style.cursor = 'zoom-in';
    it.el.addEventListener('click', e => { e.preventDefault(); openAt(i); });
  });

  overlay.addEventListener('click', e=>{
    if(e.target === overlay) close();
  });
  qs('[data-lb-close]', overlay).addEventListener('click', close);
  qs('[data-lb-next]', overlay).addEventListener('click', next);
  qs('[data-lb-prev]', overlay).addEventListener('click', prev);

  document.addEventListener('keydown', e=>{
    if(!overlay.classList.contains('open')) return;
    if(e.key === 'Escape') close();
    if(e.key === 'ArrowRight') next();
    if(e.key === 'ArrowLeft') prev();
  });

})();
