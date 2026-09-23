const CONFIG = {
    stars: 95,
    flowers: 42,
    fireflies: 55,
    breeze: 0.00055,
    flowerSway: 0.0009,
    messages: [
        "Gracias por ser esa persona que siempre trae un poquito de sol a mis días. 🌻",
        "Que nunca te falten motivos para sonreír, descansar y volver a empezar con ilusión.",
        "Nuestra amistad es como este campo: sencilla, alegre y llena de momentos bonitos.",
        "Te mando un abrazo amarillo para recordarte que cuentas conmigo. ✨",
        "Ojalá hoy encuentres algo pequeño que te haga feliz, como encontrar un girasol entre la luz."
    ],
    audio: {
        enabled: true,
        volume: 0.025,
        baseFrequency: 196
    }
};

const canvas = document.querySelector("#sunsetCanvas");
const context = canvas.getContext("2d");
const world = document.querySelector("#sunsetWorld");
const messagePanel = document.querySelector("#flowerMessage");
const messageText = document.querySelector("#messageText");
const messageClose = document.querySelector("#messageClose");
const messageNext = document.querySelector("#messageNext");
const musicButton = document.querySelector("#musicButton");
const lowPower = window.innerWidth < 700 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
const flowers = [];
const fireflies = [];
const clouds = [];
const pointer = { x: 0, targetX: 0, active: false };
let width = 0;
let height = 0;
let pixelRatio = 1;
let hoveredFlower = null;
let currentMessage = -1;
let audioContext = null;
let audioGain = null;

function randomBetween(min, max) { return min + Math.random() * (max - min); }
function choose(list) { return list[Math.floor(Math.random() * list.length)]; }

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 2);
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    pointer.x = width / 2;
    pointer.targetX = width / 2;
}

function createSceneObjects() {
    for (let index = 0; index < (lowPower ? CONFIG.flowers * .7 : CONFIG.flowers); index += 1) {
        const depth = Math.random();
        flowers.push({
            x: randomBetween(-.06, 1.06),
            baseY: .63 + depth * .35,
            size: (7 + depth * 21) * (width < 700 ? .82 : 1),
            depth,
            sway: randomBetween(.55, 1.2),
            phase: randomBetween(0, Math.PI * 2),
            tilt: randomBetween(-.18, .18),
            bloom: randomBetween(.8, 1.15)
        });
    }
    for (let index = 0; index < CONFIG.fireflies; index += 1) {
        fireflies.push({ x: Math.random(), y: randomBetween(.35, .82), size: randomBetween(.5, 1.8), phase: randomBetween(0, Math.PI * 2), speed: randomBetween(.0006, .0016) });
    }
    clouds.push({ x: .08, y: .2, scale: 1.1 }, { x: .72, y: .14, scale: .75 }, { x: .46, y: .3, scale: .5 });
}

function drawSky(time) {
    const sky = context.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#e8876c");
    sky.addColorStop(.36, "#f3ad70");
    sky.addColorStop(.64, "#f7cc86");
    sky.addColorStop(1, "#b98157");
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);

    const sunX = width * .7 + pointer.x * .02;
    const sunY = height * .38;
    const sunGlow = context.createRadialGradient(sunX, sunY, 2, sunX, sunY, Math.min(width, height) * .3);
    sunGlow.addColorStop(0, "rgba(255, 251, 190, .98)");
    sunGlow.addColorStop(.06, "rgba(255, 225, 106, .85)");
    sunGlow.addColorStop(.27, "rgba(255, 190, 65, .22)");
    sunGlow.addColorStop(1, "rgba(255, 175, 65, 0)");
    context.fillStyle = sunGlow;
    context.beginPath();
    context.arc(sunX, sunY, Math.min(width, height) * .3, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#fff1a6";
    context.beginPath();
    context.arc(sunX, sunY, Math.min(width, height) * .065, 0, Math.PI * 2);
    context.fill();

    for (const cloud of clouds) {
        const x = cloud.x * width + Math.sin(time * .00008 + cloud.x * 4) * 10;
        const y = cloud.y * height;
        context.fillStyle = "rgba(255, 230, 186, .12)";
        context.beginPath();
        context.ellipse(x, y, 115 * cloud.scale, 22 * cloud.scale, -.08, 0, Math.PI * 2);
        context.ellipse(x + 60 * cloud.scale, y + 7, 85 * cloud.scale, 15 * cloud.scale, 0, 0, Math.PI * 2);
        context.fill();
    }
}

function drawHills() {
    context.fillStyle = "#4d5140";
    context.beginPath();
    context.moveTo(0, height * .63);
    context.quadraticCurveTo(width * .2, height * .53, width * .43, height * .64);
    context.quadraticCurveTo(width * .7, height * .5, width, height * .61);
    context.lineTo(width, height);
    context.lineTo(0, height);
    context.fill();
    context.fillStyle = "#30402f";
    context.beginPath();
    context.moveTo(0, height * .7);
    context.quadraticCurveTo(width * .28, height * .58, width * .55, height * .7);
    context.quadraticCurveTo(width * .82, height * .59, width, height * .68);
    context.lineTo(width, height);
    context.lineTo(0, height);
    context.fill();
}

function drawField(time) {
    context.fillStyle = "#1b3025";
    context.fillRect(0, height * .68, width, height * .32);
    context.strokeStyle = "rgba(96, 125, 66, .28)";
    context.lineWidth = 1;
    for (let row = 0; row < 13; row += 1) {
        const y = height * (.7 + row * .026);
        context.beginPath();
        context.moveTo(0, y);
        context.quadraticCurveTo(width * .5, y - 20, width, y + 5);
        context.stroke();
    }
    for (const firefly of fireflies) {
        const alpha = .18 + (Math.sin(time * firefly.speed + firefly.phase) + 1) * .25;
        context.globalAlpha = alpha;
        context.fillStyle = "#ffe993";
        context.beginPath();
        context.arc(firefly.x * width + pointer.x * .012, firefly.y * height, firefly.size, 0, Math.PI * 2);
        context.fill();
    }
    context.globalAlpha = 1;
}

function drawFlower(flower, time) {
    const x = flower.x * width + pointer.x * flower.depth * .018;
    const y = flower.baseY * height;
    const size = flower.size;
    const wind = Math.sin(time * CONFIG.flowerSway * flower.sway + flower.phase) * (.08 + flower.depth * .12);
    const distance = hoveredFlower ? Math.hypot(x - hoveredFlower.x, y - hoveredFlower.y) : Infinity;
    const isHover = distance < size * 2.2;
    if (isHover) hoveredFlower = { ...flower, x, y, size };

    context.save();
    context.translate(x, y);
    context.rotate(flower.tilt + wind);
    context.globalAlpha = .55 + flower.depth * .45;
    context.strokeStyle = flower.depth > .52 ? "#476b3c" : "#304d32";
    context.lineWidth = Math.max(1, size * .12);
    context.beginPath();
    context.moveTo(0, size * .1);
    context.lineTo(-size * .1, size * 2.9);
    context.stroke();
    context.fillStyle = flower.depth > .5 ? "#648b46" : "#405f39";
    context.beginPath();
    context.ellipse(-size * .5, size * 2, size * .5, size * .16, -.4, 0, Math.PI * 2);
    context.ellipse(size * .35, size * 2.35, size * .5, size * .16, .4, 0, Math.PI * 2);
    context.fill();

    context.translate(0, -size * .35);
    context.shadowColor = "#ffcf3d";
    context.shadowBlur = (isHover ? 16 : 6) * flower.bloom;
    for (let petal = 0; petal < 10; petal += 1) {
        context.save();
        context.rotate((Math.PI * 2 / 10) * petal);
        context.fillStyle = petal % 2 ? "#f5aa18" : "#ffd33f";
        context.beginPath();
        context.ellipse(0, -size * .7, size * .23, size * .7, 0, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }
    context.shadowBlur = 0;
    context.fillStyle = "#62401b";
    context.beginPath();
    context.arc(0, 0, size * .31, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#e8ac31";
    context.beginPath();
    context.arc(-size * .09, -size * .1, size * .08, 0, Math.PI * 2);
    context.fill();
    context.restore();
    flower.screenX = x;
    flower.screenY = y - size * .35;
    flower.hitRadius = Math.max(14, size * 1.8);
}

function drawFlowers(time) {
    hoveredFlower = null;
    const ordered = [...flowers].sort((a, b) => a.depth - b.depth);
    for (const flower of ordered) drawFlower(flower, time);
}

function showMessage(flower) {
    currentMessage = (currentMessage + 1) % CONFIG.messages.length;
    messageText.textContent = CONFIG.messages[currentMessage];
    messagePanel.classList.add("is-open");
    messagePanel.setAttribute("aria-hidden", "false");
    createSparkleBurst(flower.screenX, flower.screenY);
}

function createSparkleBurst(x, y) {
    for (let index = 0; index < 12; index += 1) {
        const sparkle = document.createElement("span");
        sparkle.className = "sparkle";
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;
        sparkle.style.setProperty("--angle", `${index * 30}deg`);
        document.querySelector(".sunset-world").appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 850);
    }
}

function closeMessage() {
    messagePanel.classList.remove("is-open");
    messagePanel.setAttribute("aria-hidden", "true");
}

function pointerPosition(event) {
    pointer.active = true;
    pointer.targetX = event.clientX;
}

function handleTap(event) {
    const tapped = flowers.find((flower) => Math.hypot(flower.screenX - event.clientX, flower.screenY - event.clientY) < flower.hitRadius);
    if (tapped) showMessage(tapped);
}

function startAudio() {
    if (!CONFIG.audio.enabled || audioContext) return;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    audioGain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = CONFIG.audio.baseFrequency;
    audioGain.gain.value = CONFIG.audio.volume;
    oscillator.connect(audioGain).connect(audioContext.destination);
    oscillator.start();
    musicButton.classList.add("is-on");
    musicButton.textContent = "◉";
}

function toggleAudio() {
    if (!audioContext) { startAudio(); return; }
    const muted = audioGain.gain.value > 0;
    audioGain.gain.setTargetAtTime(muted ? 0 : CONFIG.audio.volume, audioContext.currentTime, .08);
    musicButton.classList.toggle("is-on", !muted);
    musicButton.textContent = muted ? "◌" : "◉";
}

function render(time) {
    drawSky(time);
    drawHills();
    drawField(time);
    drawFlowers(time);
    requestAnimationFrame(render);
}

canvas.addEventListener("pointermove", pointerPosition, { passive: true });
canvas.addEventListener("pointerleave", () => { pointer.active = false; }, { passive: true });
canvas.addEventListener("pointerup", handleTap, { passive: true });
messageClose.addEventListener("click", closeMessage);
messageNext.addEventListener("click", () => { if (flowers.length) showMessage(choose(flowers)); });
musicButton.addEventListener("click", toggleAudio);
window.addEventListener("resize", resize, { passive: true });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMessage(); });

resize();
createSceneObjects();
requestAnimationFrame(render);
