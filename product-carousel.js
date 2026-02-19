/* ═══════════════════════════════════════════════════════════════
   NEXABOT — product-carousel.js
   Product card mini-robots (Three.js) + GSAP scroll animations
   + technology background canvas + GSAP smooth scroll
═══════════════════════════════════════════════════════════════ */

'use strict';
/* ── Utility: debounce ───────────────────────────────────────── */
function debounce(fn, delay) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}
/* ── Wait for Three.js to be ready ──────────────────────────── */
if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded yet; product-carousel.js deferred.');
}

/* ── Colour helpers ─────────────────────────────────────────── */
const COLORS = {
    sentinel: { accent: 0x00f5ff, body: 0x071526 },
    nexarm: { accent: 0xff6b35, body: 0x1a0c06 },
    aether: { accent: 0x7b2fff, body: 0x0f0820 },
    swarm: { accent: 0x00ff9d, body: 0x051510 },
    medbot: { accent: 0xffffff, body: 0x0d1225 },
    drone: { accent: 0xff6b35, body: 0x17100a },
};

/* ══════════════════════════════════════════════════════════════
   1.  PRODUCT MINI-ROBOT CANVASES
══════════════════════════════════════════════════════════════ */
function makeProductScene(canvas, colorKey) {
    const cfg = COLORS[colorKey] || COLORS.sentinel;
    const W = canvas.offsetWidth || 300;
    const H = canvas.offsetHeight || 180;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, .01, 50);
    camera.position.set(0, 1, 3.2);
    camera.lookAt(0, .9, 0);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, .1));
    const key = new THREE.PointLight(cfg.accent, 2.5, 8);
    key.position.set(1.5, 3, 2);
    scene.add(key);
    const fill = new THREE.PointLight(0xffffff, .4, 6);
    fill.position.set(-2, 1, 1);
    scene.add(fill);

    // Grid floor
    const grid = new THREE.GridHelper(4, 12, cfg.accent, 0x04090f);
    grid.material.transparent = true; grid.material.opacity = .3;
    scene.add(grid);

    window.addEventListener('resize', debounce(() => {
        const w = canvas.offsetWidth, h = canvas.offsetHeight;
        if (w && h) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    }, 120));

    return { renderer, scene, camera, accentColor: cfg.accent };
}

/* ── Mini robot variants ──────────────────────────────────────── */
function buildMiniHumanoid(scene, accent, body) {
    const g = new THREE.Group();
    const sc = .55;

    const bM = new THREE.MeshStandardMaterial({ color: body, metalness: .85, roughness: .2 });
    const aM = new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: .9, metalness: 1, roughness: .05 });
    const gM = new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 1.4, transparent: true, opacity: .75 });

    const add = (geo, mat, x, y, z) => {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(x, y, z);
        g.add(m);
        return m;
    };

    // Body
    add(new THREE.BoxGeometry(.6 * sc, .7 * sc, .36 * sc), bM.clone(), 0, 1.05 * sc, 0);
    const chest = add(new THREE.CylinderGeometry(.09 * sc, .09 * sc, .05 * sc, 32), gM, 0, 1.08 * sc, .19 * sc);
    chest.rotation.x = Math.PI / 2;

    // Shoulders
    [-1, 1].forEach(s => add(new THREE.SphereGeometry(.19 * sc, 12, 10), bM.clone(), s * .47 * sc, 1.4 * sc, 0));

    // Arms
    for (let s of [-1, 1]) {
        const arm = new THREE.Group();
        const addTo = (geo, mat, x, y, z) => {
            const m = new THREE.Mesh(geo, mat);
            m.position.set(x, y, z);
            arm.add(m);
            return m;
        };
        addTo(new THREE.CylinderGeometry(.09 * sc, .08 * sc, .38 * sc, 10), bM.clone(), 0, -.19 * sc, 0);
        addTo(new THREE.SphereGeometry(.1 * sc, 10, 8), aM.clone(), 0, -.4 * sc, 0);
        addTo(new THREE.CylinderGeometry(.08 * sc, .06 * sc, .36 * sc, 10), bM.clone(), 0, -.6 * sc, 0);
        const hand = new THREE.Mesh(new THREE.BoxGeometry(.14 * sc, .14 * sc, .09 * sc), bM.clone());
        hand.position.set(0, -.82 * sc, 0); arm.add(hand);
        arm.position.set(s * .47 * sc, 1.42 * sc, 0);
        arm.rotation.z = s * .18;
        arm.name = s === -1 ? 'armL' : 'armR';
        g.add(arm);
    }

    // Waist / hips
    add(new THREE.CylinderGeometry(.24 * sc, .28 * sc, .12 * sc, 24), bM.clone(), 0, .62 * sc, 0);

    // Legs
    for (let s of [-1, 1]) {
        const legG = new THREE.Group();
        legG.add(new THREE.Mesh(new THREE.CylinderGeometry(.11 * sc, .09 * sc, .38 * sc, 10), bM.clone()));
        legG.children[0].position.y = -.19 * sc;
        const knee = new THREE.Mesh(new THREE.SphereGeometry(.1 * sc, 10, 8), aM);
        knee.position.y = -.4 * sc; legG.add(knee);
        const shin = new THREE.Mesh(new THREE.CylinderGeometry(.09 * sc, .07 * sc, .38 * sc, 10), bM.clone());
        shin.position.y = -.6 * sc; legG.add(shin);
        const foot = new THREE.Mesh(new THREE.BoxGeometry(.18 * sc, .08 * sc, .24 * sc), bM.clone());
        foot.position.set(0, -.82 * sc, .04 * sc); legG.add(foot);
        legG.position.set(s * .2 * sc, .56 * sc, 0);
        legG.name = s === -1 ? 'legL' : 'legR';
        g.add(legG);
    }

    // Neck + Head
    add(new THREE.CylinderGeometry(.1 * sc, .13 * sc, .15 * sc, 16), bM.clone(), 0, 1.5 * sc, 0);
    const head = new THREE.Mesh(new THREE.BoxGeometry(.44 * sc, .38 * sc, .38 * sc), bM.clone());
    head.position.set(0, 1.77 * sc, 0); head.name = 'head'; g.add(head);

    // Eyes
    for (let s of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.BoxGeometry(.1 * sc, .06 * sc, .06 * sc), gM.clone());
        eye.position.set(s * .12 * sc, 1.8 * sc, .2 * sc);
        eye.name = s === -1 ? 'eyeL' : 'eyeR';
        g.add(eye);
    }

    return g;
}

function buildMiniArm(scene, accent) {
    const g = new THREE.Group();
    const sc = .55;
    const bM = new THREE.MeshStandardMaterial({ color: 0x1a0c06, metalness: .85, roughness: .2 });
    const aM = new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: .9 });

    // Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(.28 * sc, .34 * sc, .2 * sc, 24), bM);
    base.position.y = .1 * sc; g.add(base);

    // Segments
    const positions = [[0, .38 * sc, 0, .65 * sc], [0, .76 * sc, 0, .5 * sc], [0, 1.1 * sc, 0, .4 * sc]];
    positions.forEach(([x, y, z, h]) => {
        const seg = new THREE.Mesh(new THREE.CylinderGeometry(.1 * sc, .12 * sc, h, 12), bM.clone());
        seg.position.set(x, y, z); g.add(seg);
        const joint = new THREE.Mesh(new THREE.SphereGeometry(.12 * sc, 12, 10), aM);
        joint.position.set(x, y + h / 2, z); g.add(joint);
    });

    // Gripper
    const gripper = new THREE.Group();
    for (let s of [-1, 1]) {
        const finger = new THREE.Mesh(new THREE.BoxGeometry(.06 * sc, .2 * sc, .06 * sc), aM.clone());
        finger.position.set(s * .07 * sc, .1 * sc, 0); gripper.add(finger);
    }
    gripper.position.set(0, 1.56 * sc, 0);
    g.add(gripper);
    g.rotateY(Math.PI * .15);
    return g;
}

function buildMiniDrone(scene, accent) {
    const g = new THREE.Group();
    const sc = .55;
    const bM = new THREE.MeshStandardMaterial({ color: 0x17100a, metalness: .75, roughness: .3 });
    const aM = new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 1 });

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(.5 * sc, .2 * sc, .5 * sc), bM);
    body.position.y = 1.2 * sc; g.add(body);

    // Arms (4 directions)
    for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2;
        const arm = new THREE.Mesh(new THREE.BoxGeometry(.6 * sc, .04 * sc, .07 * sc), bM.clone());
        arm.position.set(Math.cos(ang) * .35 * sc, 1.2 * sc, Math.sin(ang) * .35 * sc);
        arm.rotation.y = ang; g.add(arm);
        // Propeller
        const prop = new THREE.Mesh(new THREE.TorusGeometry(.2 * sc, .025 * sc, 6, 20), aM.clone());
        prop.rotation.x = Math.PI / 2;
        prop.position.set(Math.cos(ang) * .6 * sc, 1.25 * sc, Math.sin(ang) * .6 * sc);
        prop.name = `prop${i}`;
        g.add(prop);
    }

    // Camera pod
    const cam = new THREE.Mesh(new THREE.SphereGeometry(.09 * sc, 12, 10), aM.clone());
    cam.position.set(0, 1.06 * sc, 0); g.add(cam);

    // Landing legs
    for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(.025 * sc, .025 * sc, .4 * sc, 8), bM.clone());
        leg.position.set(Math.cos(ang) * .28 * sc, .98 * sc, Math.sin(ang) * .28 * sc);
        leg.rotation.z = Math.cos(ang) * .4; leg.rotation.x = Math.sin(ang) * .4;
        g.add(leg);
    }

    return g;
}

/* ── Spawn a mini robot on each product canvas ──────────────── */
document.querySelectorAll('.product-mini-canvas').forEach(canvas => {
    const model = canvas.dataset.model;
    const { renderer, scene, camera, accentColor } = makeProductScene(canvas, model);
    const cfg = COLORS[model] || COLORS.sentinel;

    let robot;
    if (model === 'nexarm') {
        robot = buildMiniArm(scene, cfg.accent);
    } else if (model === 'drone') {
        robot = buildMiniDrone(scene, cfg.accent);
    } else {
        robot = buildMiniHumanoid(scene, cfg.accent, cfg.body);
    }
    scene.add(robot);

    // Floating platform ring
    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(.6, .01, 8, 60),
        new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: .5 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = .01;
    scene.add(ring);

    let t = Math.random() * 100;
    let hovered = false;
    const card = canvas.closest('.product-card');
    if (card) {
        card.addEventListener('mouseenter', () => { hovered = true; });
        card.addEventListener('mouseleave', () => { hovered = false; });
    }

    (function animate() {
        requestAnimationFrame(animate);
        t += hovered ? .025 : .012;

        robot.rotation.y = t * (hovered ? .9 : .4);
        robot.position.y = .04 + Math.sin(t * (hovered ? 1.8 : .7)) * .06;

        if (model === 'drone') {
            // Spin props
            for (let i = 0; i < 4; i++) {
                const prop = scene.getObjectByName(`prop${i}`);
                if (prop) prop.rotation.z += hovered ? .3 : .12;
            }
        } else {
            const armL = robot.getObjectByName('armL');
            const armR = robot.getObjectByName('armR');
            const speed = hovered ? 1.5 : .6;
            if (armL) armL.rotation.x = Math.sin(t * speed) * .3;
            if (armR) armR.rotation.x = -Math.sin(t * speed) * .3;
            if (armR) armR.rotation.z = .18 + (hovered ? Math.sin(t * 2) * .2 : 0);
        }

        // Eye glow pulse
        const eyeL = robot.getObjectByName('eyeL');
        const eyeR = robot.getObjectByName('eyeR');
        if (eyeL && eyeR) {
            const intensity = hovered
                ? 1.8 + Math.sin(t * 4) * .8
                : 0.8 + Math.sin(t * 1.5) * .3;
            eyeL.material.emissiveIntensity = eyeR.material.emissiveIntensity = intensity;
        }

        // Head bob
        const head = robot.getObjectByName('head');
        if (head) head.rotation.y = Math.sin(t * .7) * (hovered ? .4 : .15);

        ring.rotation.z += hovered ? .02 : .006;
        ring.material.opacity = .4 + Math.sin(t * 2) * .2;

        renderer.render(scene, camera);
    })();
});

/* ══════════════════════════════════════════════════════════════
   2.  GSAP SCROLL ANIMATIONS (register ScrollTrigger)
══════════════════════════════════════════════════════════════ */
if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
    gsap.registerPlugin(ScrollTrigger);

    /* ── Staggered product cards ─────────────────────────────── */
    gsap.fromTo('.product-card', {
        opacity: 0, y: 60, scale: .94
    }, {
        opacity: 1, y: 0, scale: 1,
        duration: .8,
        stagger: .12,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.product-grid',
            start: 'top 80%',
            toggleActions: 'play none none reset',
        }
    });

    /* ── About section text lines ────────────────────────────── */
    gsap.fromTo('.about-desc', {
        opacity: 0, x: -30
    }, {
        opacity: 1, x: 0,
        duration: .8,
        stagger: .18,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.about', start: 'top 75%' }
    });

    /* ── Pills scatter in ────────────────────────────────────── */
    gsap.fromTo('.pill', {
        opacity: 0, scale: .7, y: 10
    }, {
        opacity: 1, scale: 1, y: 0,
        duration: .5,
        stagger: .08,
        ease: 'back.out(1.5)',
        scrollTrigger: { trigger: '.about-pills', start: 'top 88%' }
    });

    /* ── Testimonial section header ──────────────────────────── */
    gsap.fromTo('.testimonials .section-header', {
        opacity: 0, y: 30
    }, {
        opacity: 1, y: 0,
        duration: .7,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.testimonials', start: 'top 75%' }
    });

    /* ── Contact form fields ─────────────────────────────────── */
    gsap.fromTo('.form-group', {
        opacity: 0, y: 20
    }, {
        opacity: 1, y: 0,
        duration: .5,
        stagger: .09,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.contact-form', start: 'top 85%' }
    });

    /* ── Tech HUD items ──────────────────────────────────────── */
    gsap.fromTo('.hud-item', {
        opacity: 0
    }, {
        opacity: 1, duration: .5, stagger: .2,
        scrollTrigger: { trigger: '.tech-robot-stage', start: 'top 75%' }
    });

    /* ── Footer fade ─────────────────────────────────────────── */
    gsap.fromTo('.footer', {
        opacity: .3
    }, {
        opacity: 1, duration: 1,
        scrollTrigger: { trigger: '.footer', start: 'top 90%' }
    });

    /* ── Smooth parallax on hero badge / title ───────────────── */
    gsap.to('.hero-content', {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
        }
    });

    /* ── Scroll progress neon bar at top ─────────────────────── */
    const progressBar = document.createElement('div');
    Object.assign(progressBar.style, {
        position: 'fixed', top: '0', left: '0', height: '2px',
        width: '100%',
        background: 'linear-gradient(90deg, #00f5ff, #7b2fff, #00ff9d)',
        transformOrigin: 'left center',
        transform: 'scaleX(0)',
        zIndex: '2000',
        boxShadow: '0 0 10px #00f5ff',
        pointerEvents: 'none',
    });
    document.body.appendChild(progressBar);

    ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
            progressBar.style.transform = `scaleX(${self.progress})`;
        }
    });
}

/* ══════════════════════════════════════════════════════════════
   3.  TECHNOLOGY BACKGROUND CANVAS (holographic grid)
══════════════════════════════════════════════════════════════ */
(function initTechBg() {
    const canvas = document.getElementById('techBgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', debounce(resize, 120));

    let t = 0;
    function draw() {
        ctx.clearRect(0, 0, W, H);
        t += .008;

        // Animated grid lines
        const spacing = 50;
        ctx.strokeStyle = `rgba(0,245,255,0.06)`;
        ctx.lineWidth = 1;

        for (let x = 0; x < W; x += spacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0); ctx.lineTo(x, H);
            ctx.stroke();
        }
        for (let y = 0; y < H; y += spacing) {
            ctx.beginPath();
            ctx.moveTo(0, y); ctx.lineTo(W, y);
            ctx.stroke();
        }

        // Moving scanlines
        const scanY = (t * 80) % (H + 60) - 30;
        const grad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
        grad.addColorStop(0, 'rgba(0,245,255,0)');
        grad.addColorStop(.5, 'rgba(0,245,255,0.12)');
        grad.addColorStop(1, 'rgba(0,245,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, scanY - 20, W, 40);

        // Corner brackets
        const bSize = 24;
        ctx.strokeStyle = 'rgba(0,245,255,0.25)';
        ctx.lineWidth = 2;
        const corners = [[0, 0], [W, 0], [0, H], [W, H]];
        corners.forEach(([cx, cy]) => {
            const sx = cx === 0 ? 1 : -1;
            const sy = cy === 0 ? 1 : -1;
            ctx.beginPath();
            ctx.moveTo(cx + sx * bSize, cy);
            ctx.lineTo(cx, cy);
            ctx.lineTo(cx, cy + sy * bSize);
            ctx.stroke();
        });

        requestAnimationFrame(draw);
    }
    draw();
})();

/* ══════════════════════════════════════════════════════════════
   4.  SMOOTH SCROLL FOR NAV LINKS
══════════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

/* ══════════════════════════════════════════════════════════════
   5.  PRODUCT CARD TILT EFFECT (subtle 3D perspective on hover)
══════════════════════════════════════════════════════════════ */
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - .5;
        const y = (e.clientY - rect.top) / rect.height - .5;
        card.style.transform = `translateY(-8px) perspective(600px) rotateY(${x * 7}deg) rotateX(${-y * 5}deg)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

/* ══════════════════════════════════════════════════════════════
   6.  NEON BUTTON RIPPLE
══════════════════════════════════════════════════════════════ */
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        Object.assign(ripple.style, {
            position: 'absolute',
            left: `${e.clientX - rect.left - size / 2}px`,
            top: `${e.clientY - rect.top - size / 2}px`,
            width: size + 'px', height: size + 'px',
            background: 'rgba(0,245,255,.18)',
            borderRadius: '50%',
            transform: 'scale(0)',
            animation: 'ripple .6s linear',
            pointerEvents: 'none',
        });
        this.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    });
});

// Inject ripple keyframes
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
@keyframes ripple {
  to { transform: scale(1); opacity: 0; }
}
`;
document.head.appendChild(rippleStyle);

/* ══════════════════════════════════════════════════════════════
   7.  TYPEWRITER EFFECT ON HERO SUBTEXT
══════════════════════════════════════════════════════════════ */
(function typewriter() {
    const el = document.querySelector('.hero-sub');
    if (!el) return;
    const phrases = [
        'Smart robots. <em>Smarter</em> solutions.',
        'Autonomous systems for a better world.',
        'Where AI meets mechanical mastery.',
        'The future is <em>already here</em>.',
    ];
    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let pauseTimer = 0;

    // Only run typewriter after initial animation delay
    setTimeout(() => {
        const tick = setInterval(() => {
            if (pauseTimer > 0) { pauseTimer--; return; }

            const raw = phrases[phraseIdx].replace(/<em>|<\/em>/g, '');
            const full = phrases[phraseIdx];

            if (!deleting) {
                charIdx++;
                // Count visible chars only (strip tags for display)
                let visible = 0, output = '', i = 0;
                while (i < full.length && visible < charIdx) {
                    if (full[i] === '<') {
                        let end = full.indexOf('>', i);
                        output += full.slice(i, end + 1);
                        i = end + 1;
                    } else {
                        output += full[i];
                        visible++;
                        i++;
                    }
                }
                el.innerHTML = output + '<span style="border-right:2px solid #00f5ff;animation:blink .7s step-end infinite"></span>';

                if (charIdx >= raw.length) {
                    deleting = true;
                    pauseTimer = 90;
                }
            } else {
                charIdx = Math.max(0, charIdx - 2);
                let visible = 0, output = '', i = 0;
                while (i < full.length && visible < charIdx) {
                    if (full[i] === '<') {
                        let end = full.indexOf('>', i);
                        output += full.slice(i, end + 1);
                        i = end + 1;
                    } else {
                        output += full[i];
                        visible++;
                        i++;
                    }
                }
                el.innerHTML = output + '<span style="border-right:2px solid #00f5ff;animation:blink .7s step-end infinite"></span>';

                if (charIdx === 0) {
                    deleting = false;
                    phraseIdx = (phraseIdx + 1) % phrases.length;
                    pauseTimer = 15;
                }
            }
        }, deleting ? 28 : 48);

        // Inject blink style
        const s = document.createElement('style');
        s.textContent = '@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }';
        document.head.appendChild(s);
    }, 2800);
})();

/* ══════════════════════════════════════════════════════════════
   8.  ACTIVE NAV LINK (highlight as user scrolls)
══════════════════════════════════════════════════════════════ */
(function activeNav() {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-links a[href^="#"]');

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                links.forEach(l => l.style.color = '');
                const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
                if (active) { active.style.color = '#00f5ff'; }
            }
        });
    }, { threshold: .35 });

    sections.forEach(s => obs.observe(s));
})();

// Mark purely-decorative canvases as invisible to assistive technologies
document.querySelectorAll('.avatar-canvas, .product-mini-canvas').forEach(c => c.setAttribute('aria-hidden', 'true'));

console.log('%c🤖 NEXABOT SYSTEMS ONLINE', 'color:#00f5ff;font-family:monospace;font-size:14px;font-weight:bold;text-shadow:0 0 8px #00f5ff');
console.log('%c  Three.js + GSAP + WebGL — All systems nominal.', 'color:#6b8fa8;font-family:monospace;font-size:11px');
