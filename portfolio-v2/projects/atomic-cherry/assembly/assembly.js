/* Reusable, dependency-free assembly player. Works from file:// and HTTP. */
(() => {
  'use strict';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const clone = value => JSON.parse(JSON.stringify(value));
  const decodeImage = async el => {
    // Responsive source selection can invalidate an in-flight decode on resize.
    for (let attempt=0; attempt<3; attempt++) {
      try { await el.decode(); return; }
      catch (error) {
        if (el.complete && el.naturalWidth>0) return;
        if (attempt===2) throw error;
      }
    }
  };
  class AtomicCherryAssembly extends EventTarget {
    constructor(host, {config = window.ATOMIC_CHERRY_CONFIG, assets = window.ATOMIC_ASSETS, autoplay = true} = {}) {
      super();
      this.host = host;
      this.config = clone(config);
      this.assets = assets;
      this.time = 0; this.playing = false; this.rate = 1; this.loop = false; this.frame = 0; this.destroyed = false;
      this.nodes = new Map();
      this.motion = matchMedia('(prefers-reduced-motion: reduce)');
      this.handleVisibility = () => { if (document.hidden) this.pause(); };
      this.handleMotion = e => { if (e.matches) { this.pause(); this.seek(this.config.duration); } };
      document.addEventListener('visibilitychange', this.handleVisibility);
      this.motion.addEventListener('change', this.handleMotion);
      host.classList.add('atomic-assembly');
      Object.assign(host.style, {position:'relative',overflow:'hidden',isolation:'isolate',width:'100%',contain:'layout paint'});
      host.style.aspectRatio = `${config.width} / ${config.height}`;
      host.setAttribute('role', 'img');
      host.setAttribute('aria-label', 'Animacja składania automatu Atomic Cherry');
      host.setAttribute('aria-busy', 'true');
      const pending = [];
      for (const layer of this.config.layers) {
        const asset = assets.find(a => a.id === layer.asset);
        if (!asset) throw new Error(`Brak zasobu: ${layer.asset}`);
        const el = document.createElement('img');
        el.alt = ''; el.draggable = false; el.decoding = 'async';
        el.width = asset.width; el.height = asset.height;
        el.style.position = 'absolute'; el.style.pointerEvents = 'none';
        el.style.maxWidth = 'none'; el.style.opacity = '0';
        el.style.transformOrigin = '50% 50%';
        if (layer.clip) el.style.clipPath = layer.clip;
        this.nodes.set(layer.id, el);
        this.layout(layer);
        // Stage widths 960/1920/2816 become each image's real intrinsic widths.
        el.sizes = `(max-width: 700px) ${Math.ceil(layer.width/config.width*100)}vw, ${Math.ceil(layer.width/config.width*1320)}px`;
        el.srcset = asset.variants.map(v => `${v.src} ${v.width}w`).join(', ');
        el.src = (asset.variants[1] || asset.variants[0]).src;
        host.append(el);
        pending.push(decodeImage(el));
      }
      this.ready = Promise.all(pending).then(() => {
        if (this.destroyed) return this;
        host.setAttribute('aria-busy', 'false');
        if (this.motion.matches) this.seek(this.config.duration);
        else if (autoplay) this.play();
        else this.render();
        this.dispatchEvent(new Event('ready'));
        return this;
      }).catch(error => {
        host.setAttribute('aria-busy', 'false');
        this.dispatchEvent(new CustomEvent('loaderror', {detail: error}));
        throw error;
      });
    }
    layout(layer) {
      const el = this.nodes.get(layer.id), c = this.config;
      Object.assign(el.style, {left:`${layer.x/c.width*100}%`, top:`${layer.y/c.height*100}%`, width:`${layer.width/c.width*100}%`, height:`${layer.height/c.height*100}%`, zIndex:String(layer.z)});
    }
    render() {
      for (const layer of this.config.layers) {
        const el = this.nodes.get(layer.id);
        const p = clamp((this.time-layer.at)/layer.duration, 0, 1);
        const eased = 1-Math.pow(1-p, 4), f = layer.from || {};
        const dx = (f.x || 0)*(1-eased)/layer.width*100;
        const dy = (f.y || 0)*(1-eased)/layer.height*100;
        const scale = 1+((f.scale ?? 1)-1)*(1-eased);
        el.style.opacity = String(clamp(p*3,0,1));
        el.style.transform = p === 1 ? 'none' : `translate(${dx}%,${dy}%) scale(${scale})`;
      }
      this.dispatchEvent(new CustomEvent('timeupdate', {detail:{time:this.time, duration:this.config.duration, playing:this.playing}}));
    }
    play() {
      if (this.destroyed || this.playing || document.hidden) return;
      if (this.time >= this.config.duration) this.time = 0;
      this.playing = true;
      let previous = performance.now();
      const tick = now => {
        if (!this.playing) return;
        // The first rAF timestamp may precede performance.now() at play().
        this.time = clamp(this.time+Math.max(0,now-previous)*this.rate,0,this.config.duration);
        previous = now;
        if (this.time >= this.config.duration) {
          if (this.loop) this.time = 0;
          else this.playing = false;
        }
        this.render();
        if (this.playing) this.frame = requestAnimationFrame(tick);
        else { this.frame = 0; this.dispatchEvent(new Event('ended')); }
      };
      this.render();
      this.frame = requestAnimationFrame(tick);
    }
    pause() { this.playing = false; cancelAnimationFrame(this.frame); this.frame = 0; this.render(); }
    seek(ms) { this.time = clamp(Number(ms)||0,0,this.config.duration); this.render(); }
    replay() { this.pause(); this.seek(0); this.play(); }
    setRate(value) { this.rate = clamp(Number(value)||1,.25,3); }
    updateLayer(id, patch) {
      const layer = this.config.layers.find(l => l.id === id);
      if (!layer) return;
      for (const key of ['x','y','width','height','z']) {
        if (Number.isFinite(patch[key]) && (!['width','height'].includes(key) || patch[key]>0)) layer[key] = patch[key];
      }
      this.layout(layer); this.render();
    }
    destroy() {
      this.pause();
      this.destroyed = true;
      document.removeEventListener('visibilitychange', this.handleVisibility);
      this.motion.removeEventListener('change', this.handleMotion);
      this.host.replaceChildren(); this.nodes.clear();
    }
  }
  window.AtomicCherryAssembly = AtomicCherryAssembly;
})();
