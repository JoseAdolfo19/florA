const CONFIG = {
    stars: 520,
    galaxyParticles: 760,
    flowers: 86,
    petals: 135,
    galaxyRadius: 510,
    galaxyArms: 4,
    rotationSpeed: 0.00028,
    particleSpeed: 1,
    glowIntensity: 1.16,
    galaxyDepth: 0.9,
    introDuration: 4200,
    colors: {
        space: "#02030A",
        night: "#070B1A",
        gold: "#FFD83D",
        yellow: "#FFC107",
        brightGold: "#FFB300",
        warmWhite: "#FFF8DC",
        blueNebula: "#17254f",
        violetNebula: "#33234c"
    },
    text: {
        small: "Para ti, con cariño 🌻",
        middle: "Un universo de amistad",
        large: "que siempre tenga flores, risas<br>y un lugar bonito para compartir."
    },
    audio: {
        enabled: true,
        volume: 0.035,
        baseFrequency: 174,
        pulseFrequency: 261.63
    }
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isSmallDevice = window.innerWidth < 700;
const isLowPower = isSmallDevice || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
const PERFORMANCE = {
    stars: isLowPower ? Math.round(CONFIG.stars * 0.55) : CONFIG.stars,
    galaxyParticles: isLowPower ? Math.round(CONFIG.galaxyParticles * 0.52) : CONFIG.galaxyParticles,
    flowers: isLowPower ? Math.round(CONFIG.flowers * 0.58) : CONFIG.flowers,
    petals: isLowPower ? Math.round(CONFIG.petals * 0.48) : CONFIG.petals,
    blur: isLowPower ? 0.72 : 1
};

const canvas = document.querySelector("#universe");
const context = canvas.getContext("2d", { alpha: false });
const experience = document.querySelector("#experience");
const introScreen = document.querySelector("#introScreen");
const startButton = document.querySelector("#startButton");
const sceneCopy = document.querySelector("#sceneCopy");
const giftButton = document.querySelector("#giftButton");
const soundButton = document.querySelector("#soundButton");
const modalBackdrop = document.querySelector("#modalBackdrop");
const closeModal = document.querySelector("#closeModal");
const returnButton = document.querySelector("#returnButton");
const sceneSmall = document.querySelector("#sceneSmall");
const sceneMiddle = document.querySelector("#sceneMiddle");
const sceneLarge = document.querySelector("#sceneLarge");

sceneSmall.innerHTML = CONFIG.text.small;
sceneMiddle.textContent = CONFIG.text.middle;
sceneLarge.innerHTML = CONFIG.text.large;

let width = 0;
let height = 0;
let pixelRatio = 1;
let started = false;
let sceneReady = false;
let animationStart = 0;
let lastFrame = 0;
let galaxyRotation = 0;
let audioContext = null;
let audioNodes = null;
let flowerHitAreas = [];
const stars = [];
const galaxyParticles = [];
const flowers = [];
const petals = [];
const bursts = [];
const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, active: false };

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

function choose(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, isLowPower ? 1.25 : 2);
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function initializeStars() {
    for (let index = 0; index < PERFORMANCE.stars; index += 1) {
        stars.push({
            x: Math.random(),
            y: Math.random(),
            radius: randomBetween(.25, 1.45),
            alpha: randomBetween(.2, .9),
            twinkle: randomBetween(.5, 2.2),
            phase: randomBetween(0, Math.PI * 2),
            color: Math.random() > .78 ? CONFIG.colors.gold : CONFIG.colors.warmWhite
        });
    }
}

function initializeGalaxy() {
    for (let index = 0; index < PERFORMANCE.galaxyParticles; index += 1) {
        const arm = index % CONFIG.galaxyArms;
        const radius = Math.pow(Math.random(), .68) * CONFIG.galaxyRadius;
        const armAngle = (Math.PI * 2 / CONFIG.galaxyArms) * arm;
        const spiralAngle = armAngle + radius * .014 + randomBetween(-.18, .18);
        galaxyParticles.push({
            radius,
            angle: spiralAngle,
            depth: randomBetween(-1, 1),
            size: randomBetween(.5, 2.7) * (radius < 80 ? 1.15 : 1),
            alpha: randomBetween(.16, .76),
            color: choose([CONFIG.colors.gold, CONFIG.colors.yellow, CONFIG.colors.brightGold, CONFIG.colors.warmWhite]),
            drift: randomBetween(.0003, .0012),
            phase: randomBetween(0, Math.PI * 2)
        });
    }
}

function initializeFlowers() {
    for (let index = 0; index < PERFORMANCE.flowers; index += 1) {
        const radius = randomBetween(48, CONFIG.galaxyRadius * .98);
        flowers.push({
            radius,
            angle: (Math.PI * 2 * index / PERFORMANCE.flowers) + randomBetween(-.3, .3),
            depth: randomBetween(-.92, .92),
            size: randomBetween(3.5, 10.5) * (isSmallDevice ? .82 : 1),
            orbit: randomBetween(.00015, .00065),
            rotation: randomBetween(0, Math.PI * 2),
            rotationSpeed: randomBetween(-.012, .012),
            brightness: randomBetween(.55, 1.15),
            phase: randomBetween(0, Math.PI * 2),
            petalCount: Math.random() > .7 ? 7 : 6
        });
    }
}

function initializePetals() {
    for (let index = 0; index < PERFORMANCE.petals; index += 1) {
        petals.push({
            x: Math.random(),
            y: Math.random() * 1.2 - .1,
            size: randomBetween(2.5, 7),
            speed: randomBetween(.00006, .00018),
            sway: randomBetween(.0004, .0012),
            phase: randomBetween(0, Math.PI * 2),
            rotation: randomBetween(0, Math.PI * 2),
            spin: randomBetween(-.012, .012),
            alpha: randomBetween(.3, .75)
        });
    }
}

function initialize() {
    resizeCanvas();
    initializeStars();
    initializeGalaxy();
    initializeFlowers();
    initializePetals();
    pointer.x = width / 2;
    pointer.y = height / 2;
    pointer.targetX = width / 2;
    pointer.targetY = height / 2;
    window.addEventListener("resize", resizeCanvas, { passive: true });
    canvas.addEventListener("pointermove", handlePointerMove, { passive: true });
    canvas.addEventListener("pointerdown", handlePointerDown, { passive: true });
    canvas.addEventListener("pointerleave", () => { pointer.active = false; }, { passive: true });
    canvas.addEventListener("pointerenter", () => { pointer.active = true; }, { passive: true });
}

function handlePointerMove(event) {
    pointer.active = true;
    pointer.targetX = event.clientX;
    pointer.targetY = event.clientY;
}

function handlePointerDown(event) {
    pointer.active = true;
    pointer.targetX = event.clientX;
    pointer.targetY = event.clientY;
    if (!started) return;
    const hit = flowerHitAreas.find((flower) => Math.hypot(flower.x - event.clientX, flower.y - event.clientY) < flower.hitRadius);
    if (hit) createBurst(hit.x, hit.y, Math.max(8, hit.size * 2));
}

function projectPoint(radius, angle, depth, time) {
    const centerX = width / 2 + pointer.x * .035;
    const centerY = height / 2 + pointer.y * .025;
    const scale = Math.min(width, height) / 980;
    const depthWave = 1 + depth * .12;
    const x = Math.cos(angle + galaxyRotation) * radius * scale * depthWave;
    const y = Math.sin(angle + galaxyRotation) * radius * scale * depthWave * .56;
    const perspective = 1 + depth * .22;
    return {
        x: centerX + x + pointer.x * depth * .035,
        y: centerY + y + Math.sin(time * .0006 + radius) * .7,
        scale: perspective,
        depth
    };
}

function drawBackground(time) {
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, CONFIG.colors.space);
    gradient.addColorStop(.55, CONFIG.colors.night);
    gradient.addColorStop(1, "#101126");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    const centerX = width / 2 + pointer.x * .025;
    const centerY = height / 2 + pointer.y * .02;
    const nebula = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.min(width, height) * .62);
    nebula.addColorStop(0, `rgba(255, 193, 7, ${.14 * CONFIG.glowIntensity})`);
    nebula.addColorStop(.16, `rgba(255, 179, 0, ${.08 * CONFIG.glowIntensity})`);
    nebula.addColorStop(.4, `rgba(51, 35, 76, ${.22 * PERFORMANCE.blur})`);
    nebula.addColorStop(.72, `rgba(23, 37, 79, ${.13 * PERFORMANCE.blur})`);
    nebula.addColorStop(1, "rgba(2, 3, 10, 0)");
    context.fillStyle = nebula;
    context.fillRect(0, 0, width, height);

    const cloud = context.createRadialGradient(width * .18, height * .26, 0, width * .18, height * .26, width * .3);
    cloud.addColorStop(0, "rgba(44, 35, 73, .2)");
    cloud.addColorStop(1, "rgba(44, 35, 73, 0)");
    context.fillStyle = cloud;
    context.fillRect(0, 0, width, height);

    for (const star of stars) {
        const pulse = star.alpha + Math.sin(time * .001 * star.twinkle + star.phase) * .16;
        const x = star.x * width + pointer.x * .012 * (1 - star.y);
        const y = star.y * height + pointer.y * .012 * (1 - star.x);
        context.globalAlpha = Math.max(.06, pulse);
        context.fillStyle = star.color;
        context.beginPath();
        context.arc(x, y, star.radius, 0, Math.PI * 2);
        context.fill();
    }
    context.globalAlpha = 1;
}

function drawDust(time) {
    context.save();
    context.translate(width / 2 + pointer.x * .025, height / 2 + pointer.y * .02);
    context.rotate(galaxyRotation * .25);
    context.globalCompositeOperation = "screen";
    for (let index = 0; index < 4; index += 1) {
        context.beginPath();
        context.ellipse(0, 0, CONFIG.galaxyRadius * (index * .22 + .48) * Math.min(width, height) / 980, CONFIG.galaxyRadius * (index * .075 + .12) * Math.min(width, height) / 980, index * .5, 0, Math.PI * 2);
        context.strokeStyle = `rgba(255, 193, 7, ${.025 + index * .008})`;
        context.lineWidth = 20 + index * 10;
        context.filter = `blur(${(12 + index * 5) * PERFORMANCE.blur}px)`;
        context.stroke();
    }
    context.filter = "none";
    context.restore();
}

function drawGalaxyParticles(time) {
    const sortedParticles = [...galaxyParticles].sort((a, b) => a.depth - b.depth);
    for (const particle of sortedParticles) {
        const angle = particle.angle + particle.radius * .00008 + time * particle.drift * CONFIG.particleSpeed;
        const point = projectPoint(particle.radius, angle, particle.depth, time);
        const alpha = particle.alpha * (.72 + Math.sin(time * .001 + particle.phase) * .25) * (1 - Math.abs(particle.depth) * .25);
        context.globalAlpha = Math.max(.04, alpha);
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(point.x, point.y, particle.size * point.scale, 0, Math.PI * 2);
        context.fill();
    }
    context.globalAlpha = 1;
}

function drawCore(time) {
    const centerX = width / 2 + pointer.x * .035;
    const centerY = height / 2 + pointer.y * .025;
    const pulse = 1 + Math.sin(time * .0022) * .06;
    const radius = Math.min(width, height) * .085 * pulse;
    const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 5.7);
    glow.addColorStop(0, `rgba(255, 248, 220, ${.72 * CONFIG.glowIntensity})`);
    glow.addColorStop(.1, `rgba(255, 216, 61, ${.42 * CONFIG.glowIntensity})`);
    glow.addColorStop(.32, `rgba(255, 179, 0, ${.13 * CONFIG.glowIntensity})`);
    glow.addColorStop(1, "rgba(255, 179, 0, 0)");
    context.fillStyle = glow;
    context.beginPath();
    context.arc(centerX, centerY, radius * 5.7, 0, Math.PI * 2);
    context.fill();

    context.save();
    context.translate(centerX, centerY);
    context.rotate(time * .0001);
    context.strokeStyle = "rgba(255, 216, 61, .24)";
    context.lineWidth = 1;
    for (let index = 0; index < 10; index += 1) {
        context.rotate(Math.PI / 5);
        context.beginPath();
        context.moveTo(radius * 1.4, 0);
        context.lineTo(radius * 3.1, 0);
        context.stroke();
    }
    context.restore();

    const coreGradient = context.createRadialGradient(centerX - radius * .3, centerY - radius * .35, 0, centerX, centerY, radius);
    coreGradient.addColorStop(0, CONFIG.colors.warmWhite);
    coreGradient.addColorStop(.24, "#ffe99a");
    coreGradient.addColorStop(.62, CONFIG.colors.brightGold);
    coreGradient.addColorStop(1, "rgba(255, 193, 7, .12)");
    context.fillStyle = coreGradient;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.fill();
}

function drawFlower(flower, time) {
    const angle = flower.angle + galaxyRotation * (1 + flower.depth * .4) + time * flower.orbit;
    const point = projectPoint(flower.radius, angle, flower.depth, time);
    const size = flower.size * point.scale;
    if (point.x < -size * 4 || point.x > width + size * 4 || point.y < -size * 4 || point.y > height + size * 4) return;
    const distanceToPointer = Math.hypot(point.x - pointer.x, point.y - pointer.y);
    const hoverBoost = pointer.active && distanceToPointer < size * 3 ? 1.7 : 1;
    const brightness = flower.brightness * hoverBoost;
    const petals = flower.petalCount;

    context.save();
    context.translate(point.x, point.y);
    context.rotate(flower.rotation + time * flower.rotationSpeed);
    context.globalAlpha = Math.min(1, .36 + brightness * .48);
    context.shadowColor = CONFIG.colors.gold;
    context.shadowBlur = size * 2.8 * brightness;
    for (let index = 0; index < petals; index += 1) {
        context.save();
        context.rotate((Math.PI * 2 / petals) * index);
        context.fillStyle = index % 2 ? CONFIG.colors.yellow : CONFIG.colors.gold;
        context.beginPath();
        context.ellipse(0, -size * .72, size * .28, size * .72, 0, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }
    context.shadowBlur = 0;
    context.fillStyle = "#7d4c16";
    context.beginPath();
    context.arc(0, 0, size * .3, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = CONFIG.colors.warmWhite;
    context.beginPath();
    context.arc(-size * .09, -size * .1, size * .09, 0, Math.PI * 2);
    context.fill();
    context.restore();
    flowerHitAreas.push({ x: point.x, y: point.y, size, hitRadius: Math.max(12, size * 1.7) });
}

function drawFlowers(time) {
    flowerHitAreas = [];
    const sortedFlowers = [...flowers].sort((a, b) => a.depth - b.depth);
    for (const flower of sortedFlowers) drawFlower(flower, time);
}

function drawPetals(time) {
    for (const petal of petals) {
        petal.y += petal.speed * (prefersReducedMotion ? .2 : 1);
        petal.rotation += petal.spin;
        if (petal.y > 1.1) { petal.y = -.08; petal.x = Math.random(); }
        const x = petal.x * width + Math.sin(time * petal.sway + petal.phase) * 20 + pointer.x * .018;
        const y = petal.y * height + pointer.y * .012;
        context.save();
        context.translate(x, y);
        context.rotate(petal.rotation);
        context.globalAlpha = petal.alpha;
        context.fillStyle = Math.random() > .35 ? CONFIG.colors.gold : CONFIG.colors.yellow;
        context.beginPath();
        context.ellipse(0, 0, petal.size * .45, petal.size, .4, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }
    context.globalAlpha = 1;
}

function createBurst(x, y, amount = 18) {
    for (let index = 0; index < amount; index += 1) {
        bursts.push({
            x,
            y,
            vx: randomBetween(-2.6, 2.6),
            vy: randomBetween(-2.6, 2.6),
            life: 1,
            size: randomBetween(1.2, 3.5)
        });
    }
}

function drawBursts() {
    for (let index = bursts.length - 1; index >= 0; index -= 1) {
        const burst = bursts[index];
        burst.x += burst.vx;
        burst.y += burst.vy;
        burst.vx *= .97;
        burst.vy *= .97;
        burst.life -= .022;
        if (burst.life <= 0) { bursts.splice(index, 1); continue; }
        context.globalAlpha = burst.life;
        context.fillStyle = choose([CONFIG.colors.gold, CONFIG.colors.warmWhite, CONFIG.colors.brightGold]);
        context.beginPath();
        context.arc(burst.x, burst.y, burst.size * burst.life, 0, Math.PI * 2);
        context.fill();
    }
    context.globalAlpha = 1;
}

function drawOpeningFlower(time) {
    if (started) return;
    const centerX = width / 2;
    const centerY = height / 2 - 56;
    const pulse = 1 + Math.sin(time * .002) * .05;
    context.save();
    context.translate(centerX, centerY);
    context.scale(pulse, pulse);
    context.shadowColor = CONFIG.colors.gold;
    context.shadowBlur = 20;
    for (let index = 0; index < 8; index += 1) {
        context.save();
        context.rotate((Math.PI * 2 / 8) * index);
        context.fillStyle = index % 2 ? CONFIG.colors.yellow : CONFIG.colors.gold;
        context.beginPath();
        context.ellipse(0, -28, 13, 28, 0, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }
    context.shadowBlur = 0;
    context.fillStyle = "#8b5519";
    context.beginPath();
    context.arc(0, 0, 13, 0, Math.PI * 2);
    context.fill();
    context.restore();
}

function render(time) {
    const delta = Math.min(40, time - lastFrame || 16);
    lastFrame = time;
    pointer.x += (pointer.targetX - pointer.x) * .045;
    pointer.y += (pointer.targetY - pointer.y) * .045;
    if (started) galaxyRotation += CONFIG.rotationSpeed * delta * (prefersReducedMotion ? .2 : 1);
    drawBackground(time);
    drawDust(time);
    drawGalaxyParticles(time);
    drawFlowers(time);
    drawCore(time);
    drawPetals(time);
    drawBursts();
    drawOpeningFlower(time);
    requestAnimationFrame(render);
}

function animateEntrance() {
    const now = performance.now();
    const elapsed = now - animationStart;
    if (elapsed > 500) experience.classList.add("is-started");
    if (elapsed > CONFIG.introDuration) {
        sceneReady = true;
        experience.classList.add("is-ready");
    }
    requestAnimationFrame(animateEntrance);
}

function startExperience() {
    if (started) return;
    started = true;
    animationStart = performance.now();
    introScreen.classList.add("is-hidden");
    experience.classList.add("is-started");
    sceneCopy.classList.add("is-visible");
    createBurst(width / 2, height / 2, isLowPower ? 40 : 75);
    playAmbientSound();
}

function openModal() {
    modalBackdrop.classList.add("is-open");
    modalBackdrop.setAttribute("aria-hidden", "false");
    closeModal.focus();
}

function closeGiftModal() {
    modalBackdrop.classList.remove("is-open");
    modalBackdrop.setAttribute("aria-hidden", "true");
    experience.classList.add("is-ready");
}

function playAmbientSound() {
    if (!CONFIG.audio.enabled || audioContext) return;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const master = audioContext.createGain();
    master.gain.value = CONFIG.audio.volume;
    master.connect(audioContext.destination);
    const drone = audioContext.createOscillator();
    const pulse = audioContext.createOscillator();
    const droneGain = audioContext.createGain();
    const pulseGain = audioContext.createGain();
    drone.type = "sine";
    pulse.type = "triangle";
    drone.frequency.value = CONFIG.audio.baseFrequency;
    pulse.frequency.value = CONFIG.audio.pulseFrequency;
    droneGain.gain.value = .16;
    pulseGain.gain.value = .035;
    drone.connect(droneGain).connect(master);
    pulse.connect(pulseGain).connect(master);
    drone.start();
    pulse.start();
    audioNodes = { master, droneGain, pulseGain };
    soundButton.classList.add("is-on");
    soundButton.textContent = "◉";
}

function toggleSound() {
    if (!started) return;
    if (!audioContext) { playAmbientSound(); return; }
    const isMuted = audioNodes.master.gain.value > 0;
    audioNodes.master.gain.setTargetAtTime(isMuted ? 0 : CONFIG.audio.volume, audioContext.currentTime, .08);
    soundButton.classList.toggle("is-on", !isMuted);
    soundButton.textContent = isMuted ? "◌" : "◉";
}

startButton.addEventListener("click", startExperience);
startButton.addEventListener("touchend", (event) => { event.preventDefault(); startExperience(); }, { passive: false });
giftButton.addEventListener("click", openModal);
closeModal.addEventListener("click", closeGiftModal);
returnButton.addEventListener("click", closeGiftModal);
soundButton.addEventListener("click", toggleSound);
modalBackdrop.addEventListener("click", (event) => { if (event.target === modalBackdrop) closeGiftModal(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && modalBackdrop.classList.contains("is-open")) closeGiftModal(); });

initialize();
requestAnimationFrame(render);
requestAnimationFrame(animateEntrance);
