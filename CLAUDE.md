# WEBTUKAN

Sitio web gamificado de la empresa **TUKAN** (diseñadores de juegos para eventos corporativos y gamificación). Es un juego de plataformas 2D en canvas donde el jugador navega un mundo vertical para desbloquear el contenido de la empresa.

## Arquitectura

Motor de juego custom en vanilla JS + Canvas 2D. Sin frameworks ni build step — corre directo en el browser (XAMPP).

```
webtukan/
├── index.html              # Pantalla principal del juego
├── gracias.html            # Pantalla de completado con estadísticas del jugador
├── html-editor.html        # Herramienta standalone para editar contenido HTML
├── styles.css              # Estilos globales (tema cyber/neón: cyan #00d9ff, gold #FFD700)
├── assets/
│   ├── img/                # Imágenes locales del contenido (foto1.jpg, foto2.jpg…)
│   ├── tiles/              # Tiles de 25×25px para rellenar plataformas (platform-default.png…)
│   └── player-sprite.png   # Sprite sheet del personaje (frames de 75x75px)
└── js/
    ├── game.js             # Motor principal: físicas, cámara, colisiones, modales, triggers
    ├── level-data.js       # Configuración del nivel (plataformas, lianas, portales, secciones, triggers)
    ├── content.js          # HTML de cada sección (inicio, servicios, portafolio, nosotros, contacto)
    ├── progress-manager.js # Persistencia en localStorage: progreso, logros, estadísticas
    ├── sprite-animator.js  # Sistema de animación: 6 estados (idle, run, jump, climb, fall, land)
    ├── tile-editor.js      # Editor de niveles en el juego (activar con tecla E)
    └── tile-loader.js      # Cache de imágenes y generación de patterns para tiles de plataformas
```

## Flujo del juego

1. Jugador aparece en la base del mundo (3000px de alto, 1100px de ancho)
2. Navega plataformas, lianas y plataformas móviles hacia arriba
3. Al tocar una **sección interactiva** se abre un modal con contenido de la empresa
4. Al tocar un **trigger** se ejecuta una acción sobre el `#html-layer` (ej. avanzar un slider)
5. Las 5 secciones son: `inicio`, `servicios`, `portafolio`, `nosotros`, `contacto`
6. Al llegar al portal de salida (golden door) → redirige a `gracias.html`

## Controles del jugador

- `←` `→` — moverse
- `↑` / `Space` — saltar
- `↑` en liana — trepar
- `E` — abrir/cerrar el tile editor

## Nivel actual (`level-data.js`)

| Elemento | Cantidad |
|---|---|
| Plataformas estáticas | 23 |
| Plataformas móviles | 2 (1 horizontal, 1 vertical) |
| Lianas | 3 |
| Secciones interactivas | 5 |
| Triggers | 1 (nextSlide sobre slider-5) |
| Portal de salida | 1 |
| Decoraciones | 3 |

Dimensiones del mundo: `3000px` alto × `1100px` ancho. Viewport: `1100×600`.

## Sistema de Triggers (juego → HTML)

Los triggers son objetos físicos en el canvas que al ser tocados por el jugador ejecutan una acción sobre un elemento del `#html-layer`. El puente funciona porque canvas y HTML comparten el mismo DOM.

**Acciones implementadas en `game.js` → `executeTriggerAction()`:**

| `action` | Efecto |
|---|---|
| `nextSlide` | Llama `window.nextSlide(targetId)` → avanza el slider |
| `openModal` | `document.getElementById(targetId).style.display = 'block'` |
| `toggleClass` | Toggle de clase CSS sobre el elemento target |
| `playVideo` | `.play()` sobre un `<video>` del DOM |

**Definición en `level-data.js`:**
```js
{
    id: 1,
    action: "nextSlide",
    targetId: "slider-5",
    icon: "▶",
    color: "#00d9ff",
    x: 500, y: 2875,
    width: 50, height: 50
}
```

**Comportamiento físico:** el trigger tiene colisión AABB completa — el jugador choca contra él como con una plataforma (corta salto al pegar por abajo, rebota por los lados). La acción se dispara al primer frame de contacto y se resetea al salir.

**Nota técnica:** cada iteración del `triggers.forEach` declara `const hb = player.hitbox` propio para tener la posición fresca del jugador tras resolver otras colisiones del mismo frame.

## Sistema de Sliders en el HTML layer

Los sliders de imágenes viven en el `#html-layer` como HTML real (indexable por crawlers).

**HTML del slider:**
```html
<div class="img-slider" id="slider-5" data-interval="6000"
     style="position:absolute; top:2450px; left:650px; width:300px; height:425px;">
    <img src="assets/img/foto1.jpg" class="slide active" alt="slide">
    <img src="assets/img/foto2.jpg" class="slide" alt="slide">
    <div class="slider-dots"><span class="dot active"></span><span class="dot"></span></div>
</div>
```

- `data-interval`: ms entre avances automáticos (0 = solo manual vía trigger)
- Transición: `opacity` con `transition: opacity 1.2s ease` (las slides se superponen con `position:absolute`)
- `window.nextSlide(id)` es la función global que avanza el slide (llamable desde el módulo ES6 del juego)
- El runtime de sliders se inicializa en `index.html` vía `DOMContentLoaded`

**Imágenes:** usar siempre archivos locales en `assets/img/`. Las URLs externas (WordPress, CDN) suelen bloquear hotlinking desde localhost.

## Tile Editor (`tile-editor.js`)

Activar con tecla `E` en el juego.

- **Grid:** 25×25px. Líneas menores `rgba(51,51,51,0.5)`, líneas mayores (cada 125px) `rgba(0,217,255,0.45)`
- **Snap:** todos los objetos se crean y mueven en múltiplos exactos de 25
- **Tile fill:** las plataformas pueden tener una imagen tile en `assets/tiles/`. Se rellena con `ctx.createPattern(img, 'repeat')` vía `tile-loader.js`
- **Tipos de objeto:** plataforma, liana, plataforma móvil, sección, portal de salida, decoración, **trigger**
- **Exportar:** botón genera el JS completo para pegar en `level-data.js`

## HTML Editor (`html-editor.html`)

Herramienta standalone (abrir directo en el browser, no requiere el juego).

- Grid visual alineado al mismo sistema de 25px del tile editor
- Drag-and-drop de elementos: texto, imagen, HTML custom, **slider de imágenes**
- **Importar HTML existente:** botón "📂 Cargar HTML existente" → textarea → parsea con DOMParser y reconstruye los elementos editables
- **Exportar:** genera el bloque HTML para pegar en `index.html` dentro de `#html-layer`

## Cómo editar niveles

Abrir el juego y presionar `E`. El tile editor permite agregar/mover/borrar plataformas, secciones, triggers y portales, y exporta la configuración como JS para pegar en `level-data.js`.

## Cómo editar contenido HTML

Abrir `html-editor.html` en el browser. Para editar contenido ya existente usar el botón "📂 Cargar HTML existente". Exporta el HTML para pegar en `#html-layer` del `index.html`.

## Contenido a completar

- `content.js` → sección `contacto`: reemplazar `XXX XXX XXXX` con WhatsApp/email real
- `content.js` → sección `portafolio`: completar con proyectos reales de TUKAN
- `assets/img/`: agregar fotos reales de TUKAN para los sliders

## Estrategia SEO

El contenido real vive en `#html-layer` (HTML estático), no en el canvas. Los crawlers pueden indexarlo. El canvas es solo la capa de juego encima. Los modales de `content.js` son enriquecimiento secundario del juego, no el contenido principal.

---

## Persistencia

`progress-manager.js` guarda en `localStorage`:
- Secciones visitadas por nivel
- Tiempo jugado, muertes, niveles completados
- Logros: `first_section`, `all_sections`, `no_deaths`, etc.

Para resetear el progreso: botón en `gracias.html` o `progressManager.resetAll()` desde consola.
