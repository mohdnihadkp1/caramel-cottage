/* ========================================
   CARAMEL COTTAGE — Interactive Script
   Three.js + GSAP + Vanilla Tilt
   ======================================== */

// ---- PRELOADER ----
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader').classList.add('hidden');
    initAnimations();
  }, 1800);
});

// ---- SMOOTH SCROLL (Lenis-like native) ----
document.documentElement.style.scrollBehavior = 'smooth';

// ---- NAVBAR SCROLL EFFECT ----
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll > 80) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  lastScroll = currentScroll;
});

// ---- MOBILE MENU ----
const navToggle = document.querySelector('.nav-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  mobileMenu.classList.toggle('active');
  document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  });
});

// ---- THREE.JS HERO SCENE ----
function initHeroScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Sugar crystal particles
  const particleCount = 600;
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const velocities = [];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    sizes[i] = Math.random() * 2 + 0.5;
    velocities.push({
      x: (Math.random() - 0.5) * 0.02,
      y: (Math.random() - 0.5) * 0.02,
      z: (Math.random() - 0.5) * 0.01
    });
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Custom shader for glowing caramel particles
  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(0xc8860a) },
      uColor2: { value: new THREE.Color(0xf5ede0) },
    },
    vertexShader: `
      attribute float size;
      varying float vSize;
      varying vec3 vPosition;
      void main() {
        vSize = size;
        vPosition = position;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (200.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      varying float vSize;
      varying vec3 vPosition;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        float mixFactor = (vPosition.y + 30.0) / 60.0;
        vec3 color = mix(uColor1, uColor2, mixFactor);
        gl_FragColor = vec4(color, alpha * 0.6);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // Floating golden ring (cake tier representation)
  const ringGeometry = new THREE.TorusGeometry(4, 0.15, 16, 100);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xc8860a,
    transparent: true,
    opacity: 0.3
  });
  const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
  ring1.position.set(0, 2, 0);
  scene.add(ring1);

  const ring2Geometry = new THREE.TorusGeometry(6, 0.1, 16, 100);
  const ring2 = new THREE.Mesh(ring2Geometry, ringMaterial.clone());
  ring2.material.opacity = 0.2;
  ring2.position.set(0, -2, 0);
  scene.add(ring2);

  const ring3Geometry = new THREE.TorusGeometry(3, 0.12, 16, 80);
  const ring3 = new THREE.Mesh(ring3Geometry, ringMaterial.clone());
  ring3.material.opacity = 0.25;
  ring3.position.set(0, 6, 0);
  scene.add(ring3);

  // Mouse interaction
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Animation loop
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.005;

    // Update particle positions
    const posArray = particleGeometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3] += velocities[i].x;
      posArray[i * 3 + 1] += velocities[i].y;
      posArray[i * 3 + 2] += velocities[i].z;

      // Gentle floating
      posArray[i * 3 + 1] += Math.sin(time + i * 0.1) * 0.005;

      // Boundary wrap
      if (posArray[i * 3] > 30) posArray[i * 3] = -30;
      if (posArray[i * 3] < -30) posArray[i * 3] = 30;
      if (posArray[i * 3 + 1] > 30) posArray[i * 3 + 1] = -30;
      if (posArray[i * 3 + 1] < -30) posArray[i * 3 + 1] = 30;
    }
    particleGeometry.attributes.position.needsUpdate = true;

    particleMaterial.uniforms.uTime.value = time;

    // Rotate rings
    ring1.rotation.x = time * 0.5;
    ring1.rotation.y = time * 0.3;
    ring2.rotation.x = -time * 0.4;
    ring2.rotation.z = time * 0.2;
    ring3.rotation.y = time * 0.6;
    ring3.rotation.z = -time * 0.3;

    // Camera follows mouse
    camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 3 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ---- GSAP SCROLL ANIMATIONS ----
function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // Hero entrance
  const heroTl = gsap.timeline();
  heroTl
    .from('.hero-tagline', { opacity: 0, y: 30, duration: 1, ease: 'power3.out' })
    .from('.hero-heading', { opacity: 0, y: 50, duration: 1.2, ease: 'power3.out' }, '-=0.5')
    .from('.hero-btns', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' }, '-=0.5')
    .from('.hero-scroll-indicator', { opacity: 0, duration: 1, ease: 'power2.out' }, '-=0.3');

  // Reveal animations for all sections
  gsap.utils.toArray('.reveal-up').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        delay: parseFloat(el.dataset.delay) || 0
      }
    );
  });

  gsap.utils.toArray('.reveal-left').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, x: -40 },
      {
        opacity: 1, x: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  gsap.utils.toArray('.reveal-right').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, x: 40 },
      {
        opacity: 1, x: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // Parallax backgrounds
  gsap.utils.toArray('.parallax-bg').forEach(bg => {
    gsap.to(bg, {
      y: -80,
      ease: 'none',
      scrollTrigger: {
        trigger: bg.parentElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    });
  });

  // Section headers
  gsap.utils.toArray('.section-header').forEach(header => {
    gsap.fromTo(header,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // Initialize Three.js scene
  initHeroScene();

  // Initialize Vanilla Tilt
  initTilt();
}

// ---- VANILLA TILT ----
function initTilt() {
  if (typeof VanillaTilt === 'undefined') return;

  VanillaTilt.init(document.querySelectorAll('.tilt-card'), {
    max: 8,
    speed: 400,
    glare: true,
    'max-glare': 0.15,
    perspective: 1000,
    gyroscope: true
  });
}

// ---- MAGNETIC BUTTONS ----
document.querySelectorAll('.magnetic-btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0, 0)';
    btn.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  });

  btn.addEventListener('mouseenter', () => {
    btn.style.transition = 'none';
  });
});

// ---- TESTIMONIAL CAROUSEL ----
const track = document.querySelector('.testimonial-track');
const cards = document.querySelectorAll('.testimonial-card');
const prevBtn = document.querySelector('.carousel-prev');
const nextBtn = document.querySelector('.carousel-next');
const dotsContainer = document.querySelector('.carousel-dots');
let currentSlide = 0;

function getVisibleCards() {
  if (window.innerWidth <= 768) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

function getTotalSlides() {
  return Math.max(1, cards.length - getVisibleCards() + 1);
}

// Create dots
function createDots() {
  dotsContainer.innerHTML = '';
  const total = getTotalSlides();
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i === currentSlide) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }
}

function goToSlide(index) {
  const total = getTotalSlides();
  currentSlide = Math.max(0, Math.min(index, total - 1));
  const cardWidth = cards[0].offsetWidth + 32; // card width + gap
  track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
  updateDots();
}

function updateDots() {
  dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });
}

if (prevBtn && nextBtn) {
  prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
}

createDots();
window.addEventListener('resize', () => {
  createDots();
  goToSlide(Math.min(currentSlide, getTotalSlides() - 1));
});

// ---- ORDER FORM ----
const orderForm = document.getElementById('order-form');
if (orderForm) {
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = orderForm.querySelector('.btn-submit');
    const originalText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.style.pointerEvents = 'none';

    // Simulate form submission
    setTimeout(() => {
      btn.textContent = 'Order Request Sent!';
      btn.style.background = '#2d8a4e';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.pointerEvents = '';
        orderForm.reset();
      }, 2500);
    }, 1500);
  });
}

// ---- SMOOTH ANCHOR SCROLLING ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ---- LAZY LOAD IMAGES ----
if ('IntersectionObserver' in window) {
  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        imgObserver.unobserve(img);
      }
    });
  }, { rootMargin: '100px' });

  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    imgObserver.observe(img);
  });
}

// ---- FLOATING CAKE IMAGES ----
document.querySelectorAll('.menu-card .card-image img').forEach(img => {
  img.classList.add('floating');
});

// Stagger the float animation
document.querySelectorAll('.menu-card').forEach((card, i) => {
  const img = card.querySelector('.card-image img');
  if (img) {
    img.style.animationDelay = `${i * 0.5}s`;
  }
});
