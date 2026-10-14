const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Hero is intentionally sequenced. The page exists immediately; its content is introduced in layers.
if (prefersReducedMotion) {
  document.body.classList.add('hero-ready', 'ticker-ready');
} else {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => document.body.classList.add('hero-ready'));
  });

  // The marquee waits until the hero has substantially settled.
  window.setTimeout(() => document.body.classList.add('ticker-ready'), 2550);
}

// Reveal sections only when they are meaningfully inside the viewport.
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      requestAnimationFrame(() => entry.target.classList.add('visible'));
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.22,
  rootMargin: '0px 0px -14% 0px'
});

const revealElements = [...document.querySelectorAll('.reveal')];
if (prefersReducedMotion) {
  revealElements.forEach(el => el.classList.add('visible'));
} else {
  window.addEventListener('load', () => {
    window.setTimeout(() => revealElements.forEach(el => revealObserver.observe(el)), 450);
  }, { once: true });
}

const menuBtn=document.querySelector('.menu-btn');
const mobileNav=document.querySelector('.mobile-nav');
const siteHeader=document.querySelector('.site-header');
const syncHeaderState=()=>siteHeader?.classList.toggle('is-scrolled',window.scrollY>8);
syncHeaderState();
window.addEventListener('scroll',syncHeaderState,{passive:true});
menuBtn?.addEventListener('click',()=>{
  const open=mobileNav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded',String(open));
});
mobileNav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  mobileNav.classList.remove('open');
  menuBtn?.setAttribute('aria-expanded','false');
}));

const card=document.getElementById('controlCard');
if(card && !prefersReducedMotion){
  let rafId = null;
  card.parentElement.addEventListener('mousemove',e=>{
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`rotateY(${x*3.7}deg) rotateX(${-y*3.7}deg) translateY(-2px)`;
      card.style.boxShadow=`${-x*14}px ${22+y*8}px 78px rgba(0,0,0,.42)`;
    });
  });
  card.parentElement.addEventListener('mouseleave',()=>{card.style.transform='';card.style.boxShadow='';});
}

const target=document.querySelector('.cursor-target');
if(target && !prefersReducedMotion){
  let t=0;
  const animate=()=>{
    t+=.009;
    const dx=Math.sin(t)*4,dy=Math.cos(t*.7)*3;
    target.setAttribute('transform',`translate(${231+dx},${86+dy})`);
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}
