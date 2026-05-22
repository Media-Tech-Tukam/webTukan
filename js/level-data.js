// Configuración del nivel - Generado por Tile Editor
// Dimensiones del juego: 1100x600 (viewport)
// Altura total del mundo: 3000px
const GAME_WIDTH = 1100;
const GAME_HEIGHT = 600;
const WORLD_HEIGHT = 3000;

export const levelConfig = {
    platforms: [
        {
                x: 0,
                y: 3000,
                width: 1100,
                height: 1,
                color: "#d6d6d6"
        },
        {
                x: 150,
                y: 2875,
                width: 180,
                height: 25,
                color: "#d6d6d6",
                tile: "assets/tiles/platform-default.png"
        },
        {
                x: 600,
                y: 2350,
                width: 200,
                height: 25,
                color: "#d6d6d6"
        },
        {
                x: 885,
                y: 2445,
                width: 180,
                height: 25,
                color: "#d1d1d1"
        },
        {
                x: 700,
                y: 2000,
                width: 200,
                height: 25,
                color: "#d6d6d6"
        },
        {
                x: 280,
                y: 1820,
                width: 220,
                height: 25,
                color: "#f0f0f0"
        },
        {
                x: 650,
                y: 1600,
                width: 180,
                height: 25,
                color: "#e0e0e0"
        },
        {
                x: 150,
                y: 1350,
                width: 200,
                height: 25,
                color: "#d9d9d9"
        },
        {
                x: 550,
                y: 1150,
                width: 220,
                height: 25,
                color: "#d6d6d6"
        },
        {
                x: 250,
                y: 950,
                width: 180,
                height: 25,
                color: "#d6d6d6"
        },
        {
                x: 600,
                y: 700,
                width: 200,
                height: 25,
                color: "#dedede"
        },
        {
                x: 180,
                y: 500,
                width: 220,
                height: 25,
                color: "#d4d4d4"
        },
        {
                x: 500,
                y: 300,
                width: 300,
                height: 25,
                color: "#ffffff"
        },
        {
                x: 430,
                y: 832.9999605944971,
                width: 200,
                height: 25,
                color: "#0f3460"
        },
        {
                x: 310,
                y: 1072.9999999999995,
                width: 200,
                height: 25,
                color: "#0f3460"
        },
        {
                x: 350,
                y: 1252.9999999999995,
                width: 200,
                height: 25,
                color: "#0f3460"
        },
        {
                x: 70,
                y: 1812.999999999999,
                width: 200,
                height: 25,
                color: "#0f3460"
        },
        {
                x: 570,
                y: 1793.000000000001,
                width: 200,
                height: 25,
                color: "#0f3460"
        },
        {
                x: 289,
                y: 2265.999999999999,
                width: 200,
                height: 25,
                color: "#0f3460"
        },
        {
                x: 410,
                y: 382.0000000000001,
                width: 200,
                height: 25,
                color: "#0f3460"
        },
        {
                x: 450,
                y: 602.0000000000001,
                width: 200,
                height: 25,
                color: "#0f3460"
        },
        {
                x: 300,
                y: 2600,
                width: 200,
                height: 25,
                color: "#0f3460",
                tile: "assets/tiles/platform-default.png"
        }
],
    
    vines: [
        {
                x: 725,
                y: 2100,
                width: 10,
                height: 250,
                color: "#7FFF00"
        },
        {
                x: 150,
                y: 1440,
                width: 20,
                height: 300,
                color: "#7FFF00"
        },
        {
                x: 375,
                y: 2625,
                width: 10,
                height: 200,
                color: "#00ff88"
        }
],
    
    movingPlatforms: [
        {
                x: 604,
                y: 2520,
                width: 120,
                height: 20,
                color: "#bfbfbf",
                moveType: "horizontal",
                speed: 2,
                startX: 470,
                endX: 720,
                direction: -1,
                startY: null,
                endY: null
        },
        {
                x: 800,
                y: 2039,
                width: 100,
                height: 20,
                color: "#ffaa00",
                moveType: "vertical",
                speed: 1.5,
                startY: 1800,
                endY: 2200,
                direction: 1
        }
],
    
    decorations: [
        {
                x: 1000,
                y: 2825,
                width: 80,
                height: 80,
                color: "#ff00ff",
                opacity: 0.3,
                shape: "circle",
                layer: -5,
                image: "assets/decorations/arbol.svg"
        },
        {
                x: 50,
                y: 2950,
                width: 75,
                height: 50,
                color: "#00d9ff",
                opacity: 1,
                shape: "triangle",
                layer: 5,
                image: "assets/decorations/arbusto.svg"
        },
        {
                x: 625,
                y: 2300,
                width: 25,
                height: 50,
                color: "#FFD700",
                opacity: 1,
                shape: "rect",
                layer: 2,
                image: "assets/decorations/flor.svg"
        },
        {
                x: 75,
                y: 2700,
                width: 200,
                height: 300,
                color: "#ff6b6b",
                opacity: 1,
                shape: "rect",
                layer: -5,
                image: "assets/decorations/arbol.svg"
        },
        {
                x: 225,
                y: 2800,
                width: 150,
                height: 200,
                color: "#ff6b6b",
                opacity: 0.5,
                shape: "rect",
                layer: -8,
                image: "assets/decorations/arbol.svg"
        }
],
    
    exitPortals: [
        {
                x: 650,
                y: 250,
                width: 60,
                height: 80,
                color: "#FFD700",
                icon: "🚪",
                glowColor: "#FFD700",
                targetUrl: "./gracias.html",
                requireAllSections: false,
                message: "¡Gracias por explorar!",
                nextLevelName: "Página de Agradecimiento",
                active: true
        }
],
    
    triggers: [
        {
                id: 1,
                action: "nextSlide",
                targetId: "slider-5",
                icon: "▶",
                color: "#00d9ff",
                x: 500,
                y: 2875,
                width: 50,
                height: 50,
                image: "assets/decorations/boton.svg"
        }
],

    zones: [
        {
                id: "zona-1",
                yStart: 2000,
                yEnd: 3000,
                color: "#ffffff",
                textColor: "#1a1a1a",
                name: "Zona Baja"
        },
        {
                id: "zona-2",
                yStart: 1000,
                yEnd: 2000,
                color: "#ff8c00",
                textColor: "#ffffff",
                name: "Zona Media"
        },
        {
                id: "zona-3",
                yStart: 0,
                yEnd: 1000,
                color: "#0a0a0a",
                textColor: "#ffffff",
                name: "Zona Alta"
        }
],

    sections: [
        {
                id: "inicio",
                x: 200,
                y: 2725,
                width: 50,
                height: 50,
                color: "#FFD700",
                icon: "🏠"
        },
        {
                id: "servicios",
                x: 600,
                y: 2225,
                width: 50,
                height: 50,
                color: "#00d9ff",
                icon: "⚙️"
        },
        {
                id: "portafolio",
                x: 400,
                y: 1640,
                width: 40,
                height: 40,
                color: "#ff00ff",
                icon: "🎯"
        },
        {
                id: "nosotros",
                x: 730,
                y: 1030,
                width: 40,
                height: 40,
                color: "#00ff88",
                icon: "👥"
        },
        {
                id: "contacto",
                x: 210,
                y: 380,
                width: 40,
                height: 40,
                color: "#ff6b6b",
                icon: "📧"
        }
]
};