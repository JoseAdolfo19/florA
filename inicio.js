const stars = document.querySelector('.home-stars');
for (let index = 0; index < 18; index += 1) {
    const star = document.createElement('span');
    star.style.position = 'absolute';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.width = `${Math.random() * 3 + 1}px`;
    star.style.height = star.style.width;
    star.style.borderRadius = '50%';
    star.style.background = '#fff3ad';
    star.style.boxShadow = '0 0 10px #ffd34f';
    star.style.opacity = `${Math.random() * .6 + .25}`;
    star.style.animation = `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`;
    stars.appendChild(star);
}
const style = document.createElement('style');
style.textContent = '@keyframes twinkle { 50% { opacity: .12; transform: scale(.5); } }';
document.head.appendChild(style);
