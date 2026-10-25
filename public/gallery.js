/* Project showcase: slider + fullscreen viewer for photos, mp4 videos and YouTube. */
(() => {
  const track = document.getElementById('showcase');
  const box = document.getElementById('lightbox');
  if (!track || !box) return;

  const shots = [...track.querySelectorAll('.shot')];
  const arrows = document.querySelectorAll('.showcase__arrow');
  const media = box.querySelector('.lightbox__media');
  const cap = box.querySelector('.lightbox__cap');
  let current = -1;

  /* ---------- placeholders for files that aren't uploaded yet ---------- */
  shots.forEach(shot => {
    const img = shot.querySelector('img');
    const markEmpty = () => {
      // a missing poster is fine for YouTube; for photos/videos it means nothing is uploaded yet
      if (shot.dataset.type !== 'youtube') shot.classList.add('is-empty');
    };
    if (!img) return;
    if (img.complete && img.naturalWidth === 0) markEmpty();
    img.addEventListener('error', markEmpty);
    img.addEventListener('load', () => shot.classList.remove('is-empty'));
  });
  const available = () => shots.filter(s => !s.classList.contains('is-empty'));

  /* ---------- slider ---------- */
  const step = () => shots[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 20);
  const updateArrows = () => {
    arrows[0].disabled = track.scrollLeft < 4;
    arrows[1].disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  };
  arrows.forEach(a => a.addEventListener('click', () => track.scrollBy({ left: step() * +a.dataset.dir })));
  track.addEventListener('scroll', updateArrows, { passive: true });
  addEventListener('resize', updateArrows);
  updateArrows();

  // drag to scroll with the mouse
  let drag = null;
  track.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    drag = { x: e.clientX, left: track.scrollLeft, moved: false };
  });
  addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 5) { drag.moved = true; track.style.scrollSnapType = 'none'; track.style.scrollBehavior = 'auto'; }
    track.scrollLeft = drag.left - dx;
  });
  addEventListener('pointerup', () => {
    if (!drag) return;
    track.style.scrollSnapType = ''; track.style.scrollBehavior = '';
    setTimeout(() => { drag = null; }, 0);
  });

  /* ---------- lightbox ---------- */
  const render = shot => {
    const { type, src, poster } = shot.dataset;
    // caption: explicit, or the (already translated) text on the card
    const caption = shot.dataset.caption || shot.querySelector('.shot__cap')?.textContent || '';
    media.innerHTML = '';
    let el;
    if (type === 'video') {
      el = document.createElement('video');
      Object.assign(el, { src, controls: true, autoplay: true, playsInline: true });
      if (poster) el.poster = poster;
    } else if (type === 'youtube') {
      el = document.createElement('iframe');
      el.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(src)}?autoplay=1&rel=0&playsinline=1`;
      el.classList.toggle('is-vertical', 'vertical' in shot.dataset);
      el.allow = 'autoplay; encrypted-media; picture-in-picture';
      el.allowFullscreen = true;
      el.title = caption || 'Video';
    } else {
      el = document.createElement('img');
      el.src = src;
      el.alt = caption || '';
    }
    media.appendChild(el);
    cap.textContent = caption || '';
  };

  const open = shot => {
    const list = available();
    current = list.indexOf(shot);
    if (current < 0) return;
    render(shot);
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    box.querySelector('.lightbox__close').focus();
  };
  const close = () => {
    box.hidden = true;
    media.innerHTML = ''; // stops video playback
    document.body.style.overflow = '';
    available()[current]?.focus();
  };
  const go = dir => {
    const list = available();
    if (!list.length) return;
    current = (current + dir + list.length) % list.length;
    render(list[current]);
  };

  /* ---------- hover preview: the Short starts playing silently inside the card ---------- */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    shots.filter(s => s.dataset.type === 'youtube').forEach(shot => {
      let timer;
      shot.addEventListener('pointerenter', () => {
        timer = setTimeout(() => {
          const id = encodeURIComponent(shot.dataset.src);
          const f = document.createElement('iframe');
          f.className = 'shot__preview';
          f.allow = 'autoplay; encrypted-media';
          f.tabIndex = -1;
          f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1&rel=0&iv_load_policy=3&disablekb=1`;
          // YouTube shows its play/pause overlay for the first moment — fade in after it's gone
          f.addEventListener('load', () => setTimeout(() => f.classList.add('is-on'), 1400));
          shot.querySelector('img').after(f);
          shot.classList.add('is-previewing');
        }, 300);
      });
      shot.addEventListener('pointerleave', () => {
        clearTimeout(timer);
        shot.querySelector('.shot__preview')?.remove();
        shot.classList.remove('is-previewing');
      });
    });
  }

  shots.forEach(shot => shot.addEventListener('click', () => {
    if (drag?.moved || shot.classList.contains('is-empty')) return;
    open(shot);
  }));
  box.querySelector('.lightbox__close').addEventListener('click', close);
  box.querySelector('.lightbox__arrow--prev').addEventListener('click', () => go(-1));
  box.querySelector('.lightbox__arrow--next').addEventListener('click', () => go(1));
  box.addEventListener('click', e => { if (e.target === box) close(); });
  addEventListener('keydown', e => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  });

  // swipe on touch screens
  let touchX = null;
  box.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    touchX = null;
  });
})();
