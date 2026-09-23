# Galaxia de Flores Amarillas

Experiencia romántica e interactiva hecha con HTML5, CSS3, JavaScript ES6+ y Canvas 2D. No utiliza backend, PHP, base de datos ni librerías externas de JavaScript, por lo que funciona directamente al abrir `index.html` y es compatible con GitHub Pages.

## Estructura

```text
/
├── index.html
├── inicio.html
├── galaxia.html
├── style.css
├── script.js
└── assets/
	├── flowers/
	├── audio/
	└── images/
```

`index.html` abre el menú inicial. Desde ahí se puede elegir `atardecer.html` o `galaxia.html`. Las carpetas de `assets` quedan disponibles para agregar flores, audio o imágenes propios. Las escenas dibujan sus flores y partículas en Canvas, y generan el ambiente sonoro con Web Audio API.

## Ejecutar localmente

Abre `index.html` directamente en el navegador. Para probarlo con un servidor local desde esta carpeta, usa:

```bash
python -m http.server 8000
```

Después visita `http://localhost:8000`.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube `index.html`, `style.css`, `script.js` y la carpeta `assets`.
3. En el repositorio abre `Settings > Pages`.
4. Selecciona `Deploy from a branch`, elige `main` y la carpeta `/root`.
5. Guarda y espera la URL que GitHub Pages mostrará.

## Personalización rápida

Todas las variables principales están agrupadas al principio de `script.js`, dentro de `CONFIG`:

- Texto inicial y frases: `CONFIG.text` y los textos de `index.html`.
- Colores: `CONFIG.colors` y las variables CSS de `style.css`.
- Cantidad de flores: `CONFIG.flowers`.
- Cantidad de estrellas: `CONFIG.stars`.
- Cantidad de pétalos: `CONFIG.petals`.
- Velocidad de la galaxia: `CONFIG.rotationSpeed`.
- Velocidad de partículas: `CONFIG.particleSpeed`.
- Intensidad de brillo: `CONFIG.glowIntensity`.
- Audio: `CONFIG.audio.enabled`, `volume`, `baseFrequency` y `pulseFrequency`.
- Duración de la introducción: `CONFIG.introDuration`.

El texto de la tarjeta final está en `index.html`, dentro de `.gift-modal`. Las animaciones visuales y sus duraciones están en `style.css`; la lógica de entrada, Canvas, interacción y modal está en `script.js`.
