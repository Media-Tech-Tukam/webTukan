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
│   └── player-sprite.png   # Sprite sheet del personaje (frames de 75x75px)
└── js/
    ├── game.js             # Motor principal: físicas, cámara, colisiones, modales
    ├── level-data.js       # Configuración del nivel (plataformas, lianas, portales, secciones)
    ├── content.js          # HTML de cada sección (inicio, servicios, portafolio, nosotros, contacto)
    ├── progress-manager.js # Persistencia en localStorage: progreso, logros, estadísticas
    ├── sprite-animator.js  # Sistema de animación: 6 estados (idle, run, jump, climb, fall, land)
    └── tile-editor.js      # Editor de niveles en el juego (activar con tecla E)
```

## Flujo del juego

1. Jugador aparece en la base del mundo (3000px de alto, 1100px de ancho)
2. Navega plataformas, lianas y plataformas móviles hacia arriba
3. Al tocar una **sección interactiva** se abre un modal con contenido de la empresa
4. Las 5 secciones son: `inicio`, `servicios`, `portafolio`, `nosotros`, `contacto`
5. Al llegar al portal de salida (golden door) → redirige a `gracias.html`

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
| Portal de salida | 1 |
| Decoraciones | 3 |

Dimensiones del mundo: `3000px` alto × `1100px` ancho. Viewport: `1100×600`.

## Contenido a completar

- `content.js` → sección `contacto`: reemplazar `XXX XXX XXXX` con WhatsApp/email real
- `content.js` → sección `portafolio`: completar con proyectos reales de TUKAN

## Cómo editar niveles

Abrir el juego y presionar `E`. El tile editor permite agregar/mover/borrar plataformas, secciones y portales, y exporta la configuración como JS para pegar en `level-data.js`.

## Cómo editar contenido HTML

Abrir `html-editor.html` en el browser. Tiene drag-and-drop para texto, imágenes y HTML custom. Exporta el HTML para pegar en las secciones de `content.js`.

## Persistencia

`progress-manager.js` guarda en `localStorage`:
- Secciones visitadas por nivel
- Tiempo jugado, muertes, niveles completados
- Logros: `first_section`, `all_sections`, `no_deaths`, etc.

Para resetear el progreso: botón en `gracias.html` o `progressManager.resetAll()` desde consola.
