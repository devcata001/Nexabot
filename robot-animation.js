/* ═══════════════════════════════════════════════════════════════
   NEXABOT — robot-animation.js
   Three.js 3D robots: Hero, Technology section, Contact section
   + Custom cursor, scroll reveal, particle bg, counter animation
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ── Colour palette ────────────────────────────────────────── */
const NEON_BLUE = 0x00f5ff;
const NEON_PURPLE = 0x7b2fff;
const NEON_ORANGE = 0xff6b35;
const NEON_GREEN = 0x00ff9d;
const DARK_BG = 0x020408;

/* ── Utility: debounce ───────────────────────────────────────── */
function debounce(fn, delay) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

/* ══════════════════════════════════════════════════════════════
   1.  CURSOR
══════════════════════════════════════════════════════════════ */
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');
let mouseX = 0, mouseY = 0;
let trailX = 0, trailY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
});

// Smooth trailing cursor via rAF lerp — no setTimeout jitter
(function animateTrail() {
    trailX += (mouseX - trailX) * 0.15;
    trailY += (mouseY - trailY) * 0.15;
    cursorTrail.style.left = trailX + 'px';
    cursorTrail.style.top = trailY + 'px';
    requestAnimationFrame(animateTrail);
})();

document.querySelectorAll('a, button, .product-card, input, textarea, select').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
});

/* ══════════════════════════════════════════════════════════════
   2.  NAVBAR SCROLL
══════════════════════════════════════════════════════════════ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* ══════════════════════════════════════════════════════════════
   3.  HAMBURGER MENU
══════════════════════════════════════════════════════════════ */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));

/* ══════════════════════════════════════════════════════════════
   4.  SCROLL REVEAL (IntersectionObserver)
══════════════════════════════════════════════════════════════ */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            revealObserver.unobserve(e.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => revealObserver.observe(el));

/* ══════════════════════════════════════════════════════════════
   5.  TECH FEATURES SCROLL REVEAL
══════════════════════════════════════════════════════════════ */
const featureObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            const idx = parseInt(e.target.dataset.index) || 0;
            const fill = e.target.querySelector('.feature-fill');
            setTimeout(() => {
                e.target.classList.add('visible');
                if (fill) fill.style.width = fill.dataset.width + '%';
            }, idx * 160);
            featureObserver.unobserve(e.target);
        }
    });
}, { threshold: 0.2 });
document.querySelectorAll('.reveal-feature').forEach(el => featureObserver.observe(el));

/* ══════════════════════════════════════════════════════════════
   6.  COUNTER ANIMATION
══════════════════════════════════════════════════════════════ */
function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const duration = 2000;
    const start = performance.now();
    const update = (now) => {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.floor(easeOut(p) * target);
        if (p < 1) requestAnimationFrame(update);
        else el.textContent = target;
    };
    requestAnimationFrame(update);
}
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) { animateCounter(e.target); counterObserver.unobserve(e.target); }
    });
}, { threshold: .5 });
document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

/* ══════════════════════════════════════════════════════════════
   7.  PARTICLE CANVAS BACKGROUND
══════════════════════════════════════════════════════════════ */
(function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', debounce(resize, 120));

    function mkParticle() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.4 + .3,
            spd: Math.random() * .4 + .1,
            ang: Math.random() * Math.PI * 2,
            opac: Math.random() * .5 + .2,
            wobble: Math.random() * .02 - .01,
        };
    }
    for (let i = 0; i < 160; i++) particles.push(mkParticle());

    function draw() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => {
            p.ang += p.wobble;
            p.x += Math.cos(p.ang) * p.spd;
            p.y -= p.spd;
            if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,245,255,${p.opac})`;
            ctx.fill();
        });
        requestAnimationFrame(draw);
    }
    draw();
})();

/* ══════════════════════════════════════════════════════════════
   8.  THREE.JS HELPERS
══════════════════════════════════════════════════════════════ */

function makeScene(canvas, opts = {}) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.offsetWidth || canvas.clientWidth, canvas.offsetHeight || canvas.clientHeight, false);
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    const W = canvas.offsetWidth || 800;
    const H = canvas.offsetHeight || 600;
    const fov = opts.fov || 50;
    const camera = new THREE.PerspectiveCamera(fov, W / H, .01, 100);
    camera.position.set(opts.cx || 0, opts.cy || 1.6, opts.cz || 4.5);
    camera.lookAt(opts.lx || 0, opts.ly || 1, opts.lz || 0);

    // Lights
    const amb = new THREE.AmbientLight(0xffffff, .15);
    scene.add(amb);

    const keyLight = new THREE.PointLight(NEON_BLUE, 2, 12);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(NEON_PURPLE, 1.2, 10);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(NEON_GREEN, .8, 8);
    rimLight.position.set(0, -2, 3);
    scene.add(rimLight);

    window.addEventListener('resize', debounce(() => {
        const w = canvas.offsetWidth, h = canvas.offsetHeight;
        if (w && h) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    }, 120));

    return { renderer, scene, camera, keyLight, fillLight };
}

/* ── Procedural robot body builder ─────────────────────────── */
function buildRobot(opts = {}) {
    const group = new THREE.Group();
    const scale = opts.scale || 1;

    const bodyMat = new THREE.MeshStandardMaterial({
        color: opts.bodyColor || 0x0a1628,
        metalness: .85, roughness: .2,
        emissive: opts.bodyColor || 0x0a1628,
        emissiveIntensity: .04,
    });
    const accentMat = new THREE.MeshStandardMaterial({
        color: opts.accentColor || NEON_BLUE,
        metalness: 1, roughness: .05,
        emissive: opts.accentColor || NEON_BLUE,
        emissiveIntensity: .9,
    });
    const glassMat = new THREE.MeshStandardMaterial({
        color: opts.accentColor || NEON_BLUE,
        metalness: .1, roughness: 0,
        transparent: true, opacity: .7,
        emissive: opts.accentColor || NEON_BLUE,
        emissiveIntensity: 1.4,
    });
    const panelMat = new THREE.MeshStandardMaterial({
        color: 0x1a2a40, metalness: .7, roughness: .3,
    });

    /* Torso */
    const torso = new THREE.Mesh(new THREE.BoxGeometry(.7 * scale, .8 * scale, .4 * scale), bodyMat.clone());
    torso.position.y = 1.1 * scale;
    torso.castShadow = true;
    group.add(torso);

    /* Chest plate */
    const chest = new THREE.Mesh(new THREE.BoxGeometry(.5 * scale, .35 * scale, .42 * scale), panelMat);
    chest.position.y = 1.2 * scale;
    group.add(chest);

    /* Core glow (chest eye) */
    const core = new THREE.Mesh(new THREE.CylinderGeometry(.1 * scale, .1 * scale, .05 * scale, 32), glassMat);
    core.rotation.x = Math.PI / 2;
    core.position.set(0, 1.2 * scale, .22 * scale);
    group.add(core);

    /* Shoulder pads */
    [[-1, 1]].concat([[1, 1]]).forEach(([sx]) => {
        const shoulder = new THREE.Mesh(new THREE.SphereGeometry(.22 * scale, 16, 12), bodyMat.clone());
        shoulder.position.set(sx * .52 * scale, 1.45 * scale, 0);
        group.add(shoulder);
    });

    /* Arms */
    for (let s = -1; s <= 1; s += 2) {
        const armG = new THREE.Group();
        const upper = new THREE.Mesh(new THREE.CylinderGeometry(.1 * scale, .09 * scale, .45 * scale, 12), bodyMat.clone());
        upper.position.y = -.22 * scale;
        armG.add(upper);
        const elbow = new THREE.Mesh(new THREE.SphereGeometry(.11 * scale, 12, 10), accentMat);
        elbow.position.y = -.46 * scale;
        armG.add(elbow);
        const lower = new THREE.Mesh(new THREE.CylinderGeometry(.09 * scale, .07 * scale, .42 * scale, 12), bodyMat.clone());
        lower.position.y = -.68 * scale;
        armG.add(lower);
        const hand = new THREE.Mesh(new THREE.BoxGeometry(.15 * scale, .18 * scale, .1 * scale), panelMat);
        hand.position.y = -.94 * scale;
        armG.add(hand);
        // fingers
        for (let f = -1; f <= 1; f++) {
            const finger = new THREE.Mesh(new THREE.BoxGeometry(.04 * scale, .12 * scale, .04 * scale), accentMat);
            finger.position.set(f * .05 * scale, -1.04 * scale, 0);
            armG.add(finger);
        }
        armG.position.set(s * .5 * scale, 1.45 * scale, 0);
        armG.rotation.z = s * .2;
        armG.name = s === -1 ? 'armL' : 'armR';
        group.add(armG);
    }

    /* Waist */
    const waist = new THREE.Mesh(new THREE.CylinderGeometry(.28 * scale, .32 * scale, .14 * scale, 24), panelMat);
    waist.position.y = .68 * scale;
    group.add(waist);

    /* Hips */
    const hips = new THREE.Mesh(new THREE.BoxGeometry(.64 * scale, .18 * scale, .36 * scale), bodyMat.clone());
    hips.position.y = .55 * scale;
    group.add(hips);

    /* Legs */
    for (let s = -1; s <= 1; s += 2) {
        const legG = new THREE.Group();
        const thigh = new THREE.Mesh(new THREE.CylinderGeometry(.13 * scale, .11 * scale, .42 * scale, 12), bodyMat.clone());
        thigh.position.y = -.21 * scale;
        legG.add(thigh);
        const knee = new THREE.Mesh(new THREE.SphereGeometry(.13 * scale, 12, 10), accentMat);
        knee.position.y = -.44 * scale;
        legG.add(knee);
        const shin = new THREE.Mesh(new THREE.CylinderGeometry(.11 * scale, .09 * scale, .44 * scale, 12), bodyMat.clone());
        shin.position.y = -.68 * scale;
        legG.add(shin);
        const foot = new THREE.Mesh(new THREE.BoxGeometry(.2 * scale, .1 * scale, .3 * scale), panelMat);
        foot.position.set(0, -.94 * scale, .06 * scale);
        legG.add(foot);
        legG.position.set(s * .22 * scale, .53 * scale, 0);
        legG.name = s === -1 ? 'legL' : 'legR';
        group.add(legG);
    }

    /* Neck */
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(.12 * scale, .15 * scale, .18 * scale, 16), panelMat);
    neck.position.y = 1.56 * scale;
    group.add(neck);

    /* Head */
    const head = new THREE.Mesh(new THREE.BoxGeometry(.5 * scale, .44 * scale, .44 * scale), bodyMat.clone());
    head.position.y = 1.85 * scale;
    head.name = 'head';
    group.add(head);

    /* Antenna */
    [-.12, .12].forEach(x => {
        const ant = new THREE.Mesh(new THREE.CylinderGeometry(.015 * scale, .015 * scale, .24 * scale, 8), accentMat);
        ant.position.set(x * scale, 2.15 * scale, 0);
        group.add(ant);
        const tip = new THREE.Mesh(new THREE.SphereGeometry(.03 * scale, 8, 8), glassMat);
        tip.position.set(x * scale, 2.28 * scale, 0);
        group.add(tip);
    });

    /* Eyes */
    for (let s = -1; s <= 1; s += 2) {
        const eye = new THREE.Mesh(new THREE.BoxGeometry(.12 * scale, .07 * scale, .06 * scale), glassMat.clone());
        eye.position.set(s * .14 * scale, 1.88 * scale, .23 * scale);
        eye.name = s === -1 ? 'eyeL' : 'eyeR';
        group.add(eye);
    }

    /* Visor band */
    const visor = new THREE.Mesh(new THREE.BoxGeometry(.46 * scale, .08 * scale, .05 * scale), glassMat.clone());
    visor.material.opacity = .5;
    visor.position.set(0, 1.88 * scale, .225 * scale);
    group.add(visor);

    /* Edge highlights on torso */
    const edgeGeo = new THREE.EdgesGeometry(torso.geometry);
    const edgeMat = new THREE.LineBasicMaterial({ color: opts.accentColor || NEON_BLUE, transparent: true, opacity: .35 });
    const edges = new THREE.LineSegments(edgeGeo, edgeMat);
    edges.position.copy(torso.position);
    group.add(edges);

    return group;
}

/* ══════════════════════════════════════════════════════════════
   9.  HERO SCENE
══════════════════════════════════════════════════════════════ */
(function initHeroScene() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    const { renderer, scene, camera, keyLight } = makeScene(canvas, { cx: 2.2, cy: 1.3, cz: 5.5, lx: 2.2, ly: 1 });

    /* Responsive layout helper */
    function isMobile() { return window.innerWidth <= 768; }

    function applyLayout() {
        if (isMobile()) {
            camera.position.set(0, 1.1, 9.5);
            camera.lookAt(0, 0.8, 0);
        } else {
            camera.position.set(2.2, 1.3, 5.5);
            camera.lookAt(2.2, 1, 0);
        }
        camera.updateProjectionMatrix();
    }
    applyLayout();
    window.addEventListener('resize', debounce(applyLayout, 120));

    /* Floor reflection grid */
    const gridHelper = new THREE.GridHelper(14, 30, NEON_BLUE, 0x050e1a);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = .35;
    scene.add(gridHelper);

    /* Floor plane */
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(14, 14),
        new THREE.MeshStandardMaterial({ color: 0x010508, metalness: .8, roughness: .4, transparent: true, opacity: .7 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    /* Hero Robot */
    const robot = buildRobot({ scale: 1, accentColor: NEON_BLUE });
    robot.position.set(2.2, 0.05, 0);
    scene.add(robot);

    /* Holographic ring platform */
    const ringGeo = new THREE.TorusGeometry(1.1, .018, 16, 80);
    const ringMat = new THREE.MeshBasicMaterial({ color: NEON_BLUE, transparent: true, opacity: .6 });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = -Math.PI / 2;
    ring1.position.set(2.2, 0.02, 0);
    scene.add(ring1);

    const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(.75, .01, 16, 80),
        new THREE.MeshBasicMaterial({ color: NEON_PURPLE, transparent: true, opacity: .4 })
    );
    ring2.rotation.x = -Math.PI / 2;
    ring2.position.set(2.2, 0.02, 0);
    scene.add(ring2);

    /* Floating particles around robot */
    const partGeo = new THREE.BufferGeometry();
    const partCount = 120;
    const pPositions = new Float32Array(partCount * 3);
    const pVelocities = [];
    for (let i = 0; i < partCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const r = 1.2 + Math.random() * 1.2;
        pPositions[i * 3] = Math.cos(theta) * r;
        pPositions[i * 3 + 1] = Math.random() * 3;
        pPositions[i * 3 + 2] = Math.sin(theta) * r;
        pVelocities.push({ theta, r, spd: (Math.random() - .5) * .008, vy: (Math.random() - .5) * .004 });
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const partMat = new THREE.PointsMaterial({ color: NEON_BLUE, size: .04, transparent: true, opacity: .7 });
    const partSystem = new THREE.Points(partGeo, partMat);
    partSystem.position.x = 2.2;
    scene.add(partSystem);

    /* Mouse tracking for robot head */
    let targetHead = { x: 0, y: 0 };
    let currentHead = { x: 0, y: 0 };
    document.addEventListener('mousemove', (e) => {
        targetHead.x = (e.clientX / window.innerWidth - .5) * .6;
        targetHead.y = (e.clientY / window.innerHeight - .5) * .4;
    });

    let t = 0;
    let introScale = 0;

    /* Animate */
    function animate() {
        requestAnimationFrame(animate);
        t += 0.012;

        // Intro scale-in
        if (introScale < 1) {
            introScale = Math.min(introScale + .012, 1);
            robot.scale.setScalar(easeOut(introScale));
        }

        // Breathe / idle
        const mobile = window.innerWidth <= 768;
        robot.position.x = mobile ? 0 : 2.2;
        robot.position.y = (mobile ? -0.4 : 0.05) + Math.sin(t) * .04;
        ring1.position.x = mobile ? 0 : 2.2;
        ring1.position.z = mobile ? -1 : 0;
        ring2.position.x = mobile ? 0 : 2.2;
        ring2.position.z = mobile ? -1 : 0;
        partSystem.position.x = mobile ? 0 : 2.2;
        robot.rotation.y = Math.sin(t * .3) * .12;

        // Arm swing
        const armL = robot.getObjectByName('armL');
        const armR = robot.getObjectByName('armR');
        if (armL) armL.rotation.x = Math.sin(t * .6) * .18;
        if (armR) armR.rotation.x = -Math.sin(t * .6) * .18;

        // Leg idle
        const legL = robot.getObjectByName('legL');
        const legR = robot.getObjectByName('legR');
        if (legL) legL.rotation.x = Math.sin(t * .5) * .06;
        if (legR) legR.rotation.x = -Math.sin(t * .5) * .06;

        // Head tracks cursor
        currentHead.x += (targetHead.x - currentHead.x) * .05;
        currentHead.y += (targetHead.y - currentHead.y) * .05;
        const head = robot.getObjectByName('head');
        if (head) {
            head.rotation.y = currentHead.x;
            head.rotation.x = -currentHead.y * .6;
        }

        // Eye blink
        const eyeL = robot.getObjectByName('eyeL');
        const eyeR = robot.getObjectByName('eyeR');
        const blinkVal = Math.max(0, Math.sin(t * 2.2) > .97 ? 0.05 : 1);
        if (eyeL) eyeL.scale.y = blinkVal;
        if (eyeR) eyeR.scale.y = blinkVal;

        // Rings pulse
        ring1.rotation.z = t * .3;
        ring2.rotation.z = -t * .5;
        ring1.material.opacity = .4 + Math.sin(t * 1.5) * .2;

        // Particles orbit
        const pos = partGeo.attributes.position.array;
        for (let i = 0; i < partCount; i++) {
            const v = pVelocities[i];
            v.theta += v.spd;
            pos[i * 3] = Math.cos(v.theta) * v.r;
            pos[i * 3 + 1] += v.vy;
            pos[i * 3 + 2] = Math.sin(v.theta) * v.r;
            if (pos[i * 3 + 1] > 3.2) pos[i * 3 + 1] = 0;
            if (pos[i * 3 + 1] < 0) pos[i * 3 + 1] = 3.2;
        }
        partGeo.attributes.position.needsUpdate = true;

        // Key light pulse
        keyLight.intensity = 1.8 + Math.sin(t * 2) * .4;

        renderer.render(scene, camera);
    }
    animate();
})();

/* ══════════════════════════════════════════════════════════════
   10.  TECHNOLOGY SECTION ROBOT
══════════════════════════════════════════════════════════════ */
(function initTechRobot() {
    const canvas = document.getElementById('techRobotCanvas');
    if (!canvas) return;

    const { renderer, scene, camera } = makeScene(canvas, { cx: 0, cy: 1.4, cz: 3.8, fov: 55 });

    // Dark background plane
    scene.background = new THREE.Color(0x020610);

    const grid = new THREE.GridHelper(8, 20, 0x0a2244, 0x050e1a);
    grid.material.transparent = true; grid.material.opacity = .5;
    scene.add(grid);

    const robot = buildRobot({ scale: .95, accentColor: NEON_GREEN, bodyColor: 0x060f20 });
    robot.position.y = .02;
    scene.add(robot);

    // Holographic data rings
    for (let i = 0; i < 3; i++) {
        const r = 0.8 + i * 0.5;
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(r, .008, 8, 64),
            new THREE.MeshBasicMaterial({ color: [NEON_BLUE, NEON_PURPLE, NEON_GREEN][i], transparent: true, opacity: .45 })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.rotation.z = i * 1.2;
        ring.position.y = .6 + i * .3;
        ring.name = `dataRing${i}`;
        scene.add(ring);
    }

    // Feature highlight spheres (orbit around robot)
    const hlSpheres = [];
    for (let i = 0; i < 4; i++) {
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(.06, 16, 16),
            new THREE.MeshStandardMaterial({
                color: NEON_BLUE, emissive: NEON_BLUE, emissiveIntensity: 1.5, metalness: .9
            })
        );
        sphere.orbitAngle = (i / 4) * Math.PI * 2;
        sphere.orbitR = 1.3;
        sphere.orbitY = .9 + i * .35;
        scene.add(sphere);
        hlSpheres.push(sphere);
    }

    let t = 0;
    function animate() {
        requestAnimationFrame(animate);
        t += 0.01;

        robot.rotation.y = Math.sin(t * .4) * .5;
        robot.position.y = .02 + Math.sin(t * .8) * .035;
        const arm = robot.getObjectByName('armL');
        if (arm) arm.rotation.x = Math.sin(t) * .25;
        const arm2 = robot.getObjectByName('armR');
        if (arm2) arm2.rotation.x = -Math.sin(t) * .25;

        for (let i = 0; i < 3; i++) {
            const ring = scene.getObjectByName(`dataRing${i}`);
            if (ring) {
                ring.rotation.z += .006 * (i % 2 === 0 ? 1 : -1);
                ring.position.y = .5 + i * .35 + Math.sin(t + i) * .06;
            }
        }

        hlSpheres.forEach((s, i) => {
            s.orbitAngle += .012;
            s.position.x = Math.cos(s.orbitAngle) * s.orbitR;
            s.position.z = Math.sin(s.orbitAngle) * s.orbitR;
            s.position.y = s.orbitY + Math.sin(t * 2 + i) * .12;
            s.material.emissiveIntensity = 1.2 + Math.sin(t * 3 + i) * .6;
        });

        renderer.render(scene, camera);
    }
    animate();
})();

/* ══════════════════════════════════════════════════════════════
   11.  CONTACT ROBOT (small, reacts to typing)
══════════════════════════════════════════════════════════════ */
(function initContactRobot() {
    const canvas = document.getElementById('contactRobotCanvas');
    if (!canvas) return;

    const { renderer, scene, camera } = makeScene(canvas, { cx: 0, cy: 1.5, cz: 3.2, fov: 65, ly: 1.2 });
    scene.background = new THREE.Color(0x010407);

    const robot = buildRobot({ scale: .7, accentColor: NEON_ORANGE });
    robot.position.y = .05;
    scene.add(robot);

    const grid = new THREE.GridHelper(6, 16, 0x0a1a2a, 0x040c14);
    grid.material.transparent = true; grid.material.opacity = .4;
    scene.add(grid);

    let excited = false;
    let exciteTimer = 0;
    let t = 0;

    const robotMsg = document.getElementById('robotMsg');
    const msgs = [
        "Hello! How can I assist?",
        "I'm listening...",
        "Great question!",
        "Processing your request...",
        "Message received! 📡",
    ];

    function setExcited() {
        excited = true;
        exciteTimer = 120;
        if (robotMsg) robotMsg.textContent = msgs[Math.floor(Math.random() * (msgs.length - 1)) + 1];
    }

    // Watch all form inputs
    document.querySelectorAll('#contactForm input, #contactForm textarea, #contactForm select').forEach(el => {
        el.addEventListener('input', setExcited);
        el.addEventListener('focus', setExcited);
        el.addEventListener('change', setExcited);
    });

    document.getElementById('contactForm')?.addEventListener('submit', () => {
        excited = true; exciteTimer = 200;
        if (robotMsg) robotMsg.textContent = msgs[4];
    });

    function animate() {
        requestAnimationFrame(animate);
        t += 0.016;

        if (exciteTimer > 0) {
            exciteTimer--;
            if (exciteTimer === 0) {
                excited = false;
                if (robotMsg) robotMsg.textContent = msgs[0];
            }
        }

        const speed = excited ? 2.4 : .8;
        robot.position.y = .05 + Math.sin(t * speed) * .05;
        robot.rotation.y = Math.sin(t * (excited ? 1.6 : .4)) * (excited ? .5 : .15);

        const head = robot.getObjectByName('head');
        if (head) {
            head.rotation.y = Math.sin(t * (excited ? 2 : .5)) * .3;
            head.rotation.x = Math.sin(t * 1.2) * .1;
        }

        const armL = robot.getObjectByName('armL');
        const armR = robot.getObjectByName('armR');
        if (excited) {
            if (armL) armL.rotation.x = Math.sin(t * 3) * .5 - .3;
            if (armR) armR.rotation.x = -Math.sin(t * 3) * .5 - .3;
        } else {
            if (armL) armL.rotation.x = Math.sin(t * .6) * .12;
            if (armR) armR.rotation.x = -Math.sin(t * .6) * .12;
        }

        const eyeL = robot.getObjectByName('eyeL');
        const eyeR = robot.getObjectByName('eyeR');
        if (eyeL && eyeR) {
            const blink = Math.sin(t * 1.8) > .97 ? 0.05 : 1;
            eyeL.scale.y = eyeR.scale.y = blink;
            if (excited) {
                eyeL.material.emissiveIntensity = eyeR.material.emissiveIntensity = 1.8 + Math.sin(t * 5) * .8;
            }
        }

        renderer.render(scene, camera);
    }
    animate();
})();

/* ══════════════════════════════════════════════════════════════
   12.  AVATAR CANVASES (testimonials) — 2D canvas, no WebGL
══════════════════════════════════════════════════════════════ */
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

document.querySelectorAll('.avatar-canvas').forEach(canvas => {
    const colorHex = canvas.dataset.color || '#00f5ff';
    // Size the canvas to its rendered CSS size
    const setSize = () => {
        const r = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = (r.width || 64) * dpr;
        canvas.height = (r.height || 64) * dpr;
    };
    setSize();
    window.addEventListener('resize', debounce(setSize, 200));

    const ctx = canvas.getContext('2d');
    let t = Math.random() * 100;

    (function draw() {
        requestAnimationFrame(draw);
        t += 0.022;
        const W = canvas.width, H = canvas.height;
        const s = Math.min(W, H);
        const cx = W / 2, cy = H / 2;
        ctx.clearRect(0, 0, W, H);

        // Background disc
        ctx.fillStyle = '#07111f';
        ctx.beginPath();
        ctx.arc(cx, cy, s * .47, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing outer ring
        ctx.strokeStyle = colorHex;
        ctx.lineWidth = s * .018;
        ctx.globalAlpha = .22 + Math.sin(t * 1.4) * .1;
        ctx.shadowBlur = s * .1; ctx.shadowColor = colorHex;
        ctx.beginPath(); ctx.arc(cx, cy, s * .44, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;

        // Head (wobbling)
        const headW = s * .44, headH = s * .40;
        ctx.save();
        ctx.translate(cx, cy + s * .02);
        ctx.rotate(Math.sin(t * .45) * .14);

        // Head body
        ctx.fillStyle = '#0d2040';
        roundRect(ctx, -headW / 2, -headH / 2, headW, headH, s * .06);
        ctx.fill();

        // Visor strip (subtle)
        ctx.fillStyle = colorHex;
        ctx.globalAlpha = .1;
        roundRect(ctx, -headW * .42, -headH * .12, headW * .84, headH * .22, s * .02);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Eyes
        const eyeW = s * .11, eyeH = s * .065;
        const eyeGlow = .75 + Math.sin(t * 2.2) * .3;
        ctx.shadowBlur = s * .12; ctx.shadowColor = colorHex;
        ctx.fillStyle = colorHex;
        ctx.globalAlpha = eyeGlow;
        [-1, 1].forEach(side => {
            roundRect(ctx, side * s * .125 - eyeW / 2, -headH * .1, eyeW, eyeH, eyeH * .35);
            ctx.fill();
        });
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;

        // Mouth
        ctx.strokeStyle = colorHex;
        ctx.lineWidth = s * .025;
        ctx.globalAlpha = .6;
        ctx.shadowBlur = s * .05; ctx.shadowColor = colorHex;
        ctx.beginPath();
        ctx.moveTo(-s * .1, headH * .2);
        ctx.lineTo(s * .1, headH * .2);
        ctx.stroke();
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;

        ctx.restore();

        // Antenna
        const antBaseY = cy + s * .02 - headH / 2;
        ctx.strokeStyle = colorHex;
        ctx.lineWidth = s * .018;
        ctx.globalAlpha = .65;
        ctx.shadowBlur = s * .06; ctx.shadowColor = colorHex;
        ctx.beginPath();
        ctx.moveTo(cx, antBaseY);
        ctx.lineTo(cx, antBaseY - s * .14);
        ctx.stroke();
        ctx.fillStyle = colorHex;
        ctx.globalAlpha = .9;
        ctx.beginPath();
        ctx.arc(cx, antBaseY - s * .16, s * .028, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    })();
});

/* ══════════════════════════════════════════════════════════════
   13.  CONTACT FORM SUBMIT
══════════════════════════════════════════════════════════════ */
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');

if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        // Fake loading
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        submitBtn.style.opacity = '.7';

        setTimeout(() => {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.style.opacity = '1';
            formSuccess.style.display = 'block';
            form.reset();
            setTimeout(() => formSuccess.style.display = 'none', 6000);
        }, 2000);
    });
}

/* ══════════════════════════════════════════════════════════════
   14.  MODAL (Learn More)
══════════════════════════════════════════════════════════════ */
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
const modalClose = document.getElementById('modalClose');

const productDetails = {
    'SENTINEL-X9': { desc: 'The SENTINEL-X9 is a fully autonomous security platform operating 24/7 without human fatigue. Equipped with our proprietary ThreatIQ™ engine, it classifies, tracks and responds to over 400 threat signatures in real time. Deployable indoors or outdoors, it integrates with your existing CCTV and access-control systems in under 4 hours.', price: 'From $48,000', avail: 'In Stock — 6-8 week lead time' },
    'NEXARM-7': { desc: 'The NEXARM-7 brings aerospace-grade precision to factory floors. Its patented FlexGrip™ hands switch between pick-and-place, welding, and assembly modes in <2s. Plug-and-earn with our NexaOS SDK and start automating your first production cell the same day it arrives.', price: 'From $32,000', avail: 'In Stock — 4 week lead time' },
    'AETHER PRIME': { desc: 'Aether Prime is our boldest achievement: a fully bipedal humanoid robot with 48 degrees of freedom and an onboard GPT-NX language model capable of real-time reasoning and emotion detection. Currently deployed in five-star hotels, research hospitals and enterprise receptions worldwide.', price: 'From $185,000', avail: 'Pre-order — Q3 2026 delivery' },
    'SWARM-100': { desc: 'SWARM-100 ships as a coordinated pack of 100 micro-bots that self-organise your warehouse using our MeshNet™ protocol. No central server required. Each bot charges inductively in 15 minutes and can carry up to 8kg — together they process 10,000 SKUs per hour.', price: 'From $95,000', avail: 'In Stock — 8 week lead time' },
    'MEDBOT-S3': { desc: 'The MEDBOT-S3 received FDA 510(k) clearance in January 2026. Its TremorShield™ active cancellation eliminates surgeon hand tremor to sub-micron precision. Fully compatible with existing da Vinci instrument sets and OR data systems.', price: 'From $240,000', avail: 'Limited allocation — 12 week lead time' },
    'SKYHAWK-D1': { desc: 'Built for all-weather industrial inspection, SKYHAWK-D1 combines a 360° spinning LIDAR, thermal camera and 5G relay module in a 4.7kg airframe with a 4-hour endurance envelope. It auto-generates inspection reports with AI-detected anomaly highlights.', price: 'From $28,000', avail: 'In Stock — 3 week lead time' },
};

document.querySelectorAll('.learn-more').forEach(btn => {
    btn.addEventListener('click', () => {
        const name = btn.dataset.product;
        const info = productDetails[name];
        if (!info) return;
        modalContent.innerHTML = `
      <div class="section-label" style="display:block;margin-bottom:.8rem">${name}</div>
      <h2>${name}</h2>
      <p style="margin:1rem 0 1.6rem">${info.desc}</p>
      <div style="display:flex;gap:1.5rem;flex-wrap:wrap">
        <div><div class="section-label" style="display:block;margin-bottom:.3rem">PRICING</div><p style="color:var(--neon-green);font-family:var(--font-head);font-size:.9rem">${info.price}</p></div>
        <div><div class="section-label" style="display:block;margin-bottom:.3rem">AVAILABILITY</div><p style="color:var(--text-muted);font-family:var(--font-alt);font-size:.88rem">${info.avail}</p></div>
      </div>
      <a href="#contact" class="btn btn-primary" style="margin-top:2rem;display:inline-flex" onclick="document.getElementById('modalOverlay').classList.remove('open')">Request Quote →</a>
    `;
        modalOverlay.classList.add('open');
    });
});

modalClose.addEventListener('click', () => modalOverlay.classList.remove('open'));
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) modalOverlay.classList.remove('open'); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') modalOverlay.classList.remove('open'); });

/* ══════════════════════════════════════════════════════════════
   15.  TESTIMONIAL TRACK — duplicate for seamless loop
══════════════════════════════════════════════════════════════ */
(function duplicateTestimonials() {
    const track = document.getElementById('testimonialTrack');
    if (!track) return;
    const original = Array.from(track.children);
    original.forEach(card => track.appendChild(card.cloneNode(true)));
})();
