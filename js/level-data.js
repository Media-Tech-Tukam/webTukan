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
                y: 2880,
                width: 180,
                height: 25,
                color: "#d6d6d6"
        },
        {
                x: 570,
                y: 2660,
                width: 200,
                height: 25,
                color: "#d9d9d9"
        },
        {
                x: 100,
                y: 2500,
                width: 220,
                height: 25,
                color: "#c9c9c9"
        },
        {
                x: 600,
                y: 2350,
                width: 200,
                height: 25,
                color: "#d6d6d6"
        },
        {
                x: 560,
                y: 2420,
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
        }
],
    
    vines: [
        {
                x: 360,
                y: 2570,
                width: 5,
                height: 200,
                color: "#7fff00"
        },
        {
                x: 750,
                y: 2100,
                width: 20,
                height: 250,
                color: "#7FFF00"
        },
        {
                x: 150,
                y: 1440,
                width: 20,
                height: 300,
                color: "#7FFF00"
        }
],
    
    movingPlatforms: [
        {
                x: 658,
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
                y: 1956.5,
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
                x: 900,
                y: 2850,
                width: 80,
                height: 80,
                color: "#ff00ff",
                opacity: 0.3,
                shape: "circle",
                layer: -5
        },
        {
                x: 50,
                y: 2600,
                width: 60,
                height: 60,
                color: "#00d9ff",
                opacity: 0.2,
                shape: "triangle",
                layer: -8
        },
        {
                x: 850,
                y: 2250,
                width: 100,
                height: 40,
                color: "#FFD700",
                opacity: 0.4,
                shape: "rect",
                layer: 2
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
    
    sections: [
        {
                id: "inicio",
                x: 220,
                y: 2690,
                width: 40,
                height: 40,
                color: "#FFD700",
                icon: "🏠"
        },
        {
                id: "servicios",
                x: 790,
                y: 2250,
                width: 40,
                height: 40,
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