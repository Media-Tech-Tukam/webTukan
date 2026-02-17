// Motor del juego
import { levelConfig } from './level-data.js';
import { modalContent } from './content.js';
import { ProgressManager } from './progress-manager.js';
import { SpriteAnimator } from './sprite-animator.js';

// ID único de este nivel (cambiar en cada HTML)
const LEVEL_ID = 'nivel-1';

// Inicializar gestor de progreso
const progressManager = new ProgressManager(LEVEL_ID);

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Dimensiones fijas del juego
const GAME_WIDTH = 1100;
let GAME_HEIGHT = 600; // Ahora es variable según la pantalla
const WORLD_HEIGHT = 3000; // Altura total del mundo del juego

// Sistema de cámara
const camera = {
    x: 0,
    y: 0,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    
    follow(target) {
        // La cámara sigue al jugador verticalmente
        // Mantiene al jugador en el tercio inferior de la pantalla
        this.y = target.y - GAME_HEIGHT * 0.66;
        
        // Límites de la cámara
        if (this.y < 0) this.y = 0;
        if (this.y > WORLD_HEIGHT - GAME_HEIGHT) {
            this.y = WORLD_HEIGHT - GAME_HEIGHT;
        }
        
        // La cámara no se mueve horizontalmente (juego de ancho fijo)
        this.x = 0;
        
        // Sincronizar capa HTML
        this.syncHTMLLayer();
    },
    
    syncHTMLLayer() {
        // NUEVO: Solo sincronizar si el editor NO está activo
        if (window.gameLoopPaused) return;
        
        const htmlLayer = document.getElementById('html-layer');
        if (htmlLayer) {
            // Mover la capa HTML junto con la cámara
            htmlLayer.style.transform = `translateY(-${this.y}px)`;
        }
    }
};

function resizeCanvas() {
    canvas.width = GAME_WIDTH;
    
    // Calcular altura disponible (restar espacio del HUD y instrucciones)
    const hudHeight = 60; // Aproximado
    const instructionsHeight = 60; // Aproximado
    const margin = 40; // Margen superior e inferior
    
    GAME_HEIGHT = Math.min(
        window.innerHeight - hudHeight - instructionsHeight - margin,
        800 // Altura máxima para que no sea demasiado grande
    );
    
    // Altura mínima para que sea jugable
    GAME_HEIGHT = Math.max(GAME_HEIGHT, 400);
    
    canvas.height = GAME_HEIGHT;
    camera.height = GAME_HEIGHT;
    
    // Actualizar el contenedor
    const container = document.getElementById('game-container');
    if (container) {
        container.style.height = GAME_HEIGHT + 'px';
    }
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const game = {
    gravity: 0.6,
    friction: 0.8,
    keys: {},
    visitedSections: new Set(),
    modalOpen: false,
    lastInteraction: null,
    totalSections: 0,
    
    updateProgress() {
        const visited = this.visitedSections.size;
        const total = this.totalSections;
        const progressText = document.getElementById('progress-counter');
        if (progressText) {
            progressText.textContent = `${visited}/${total}`;
            
            // Animación cuando completas todo
            if (visited === total && total > 0) {
                progressText.style.color = '#FFD700';
                progressText.style.textShadow = '0 0 20px #FFD700';
                
                // Efecto de celebración
                setTimeout(() => {
                    alert('🎉 ¡Felicidades! Has explorado todo el contenido de Tukan');
                }, 300);
            }
        }
    }
};

const player = {
    x: 100,
    y: WORLD_HEIGHT - 125, // Ajustado para el tamaño de 75x75
    width: 75,
    height: 75,
    speedX: 0,
    speedY: 0,
    jumping: false,
    moveSpeed: 6,
    jumpPower: 13,
    climbing: false,
    climbSpeed: 4,
    facingRight: true // Para el flip horizontal
};

// Inicializar sistema de sprites
// Ruta al sprite sheet (cambiar cuando tengas tu sprite)
const spriteAnimator = new SpriteAnimator('assets/player-sprite.png', 75, 75);

// Variables para tracking de tiempo
let lastTime = 0;

// Cargar plataformas y secciones desde level-data.js
const platforms = levelConfig.platforms;
const vines = levelConfig.vines || [];
const movingPlatforms = levelConfig.movingPlatforms || [];
const decorations = levelConfig.decorations || [];
const exitPortals = levelConfig.exitPortals || [];
const sections = levelConfig.sections.map(section => ({
    ...section,
    title: modalContent[section.id]?.title || `📄 ${section.id}`,
    content: modalContent[section.id]?.html || `
        <p style="color: #aaa;">Este contenido aún no ha sido configurado.</p>
        <p style="margin-top: 15px;">ID de la sección: <code style="color: #00d9ff;">${section.id}</code></p>
        <p style="margin-top: 10px; font-size: 14px;">💡 Agrega contenido para esta sección en <code>js/content.js</code></p>
    `
}));

// Inicializar el contador de secciones totales
game.totalSections = sections.length;

// Función de inicialización
function initGame() {
    // Cargar secciones ya visitadas desde localStorage
    const visitedSections = progressManager.getVisitedSections();
    visitedSections.forEach(sectionId => {
        game.visitedSections.add(sectionId);
        
        // Marcar checkpoint visual
        const checkpoint = document.getElementById('check-' + sectionId);
        if (checkpoint) {
            checkpoint.classList.add('visited');
        }
    });
    
    // Actualizar contador
    game.updateProgress();
    
    // Activar portales si corresponde
    updatePortalsState();
}

// Actualizar estado de portales (siempre activos)
function updatePortalsState() {
    exitPortals.forEach(portal => {
        // Los portales siempre están activos
        portal.active = true;
    });
}

// Inicializar juego
initGame();

// Control de teclado
window.addEventListener('keydown', (e) => {
    game.keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    game.keys[e.key] = false;
});

// Actualizar plataformas móviles
function updateMovingPlatforms() {
    movingPlatforms.forEach(platform => {
        if (platform.moveType === 'horizontal') {
            platform.x += platform.speed * platform.direction;
            
            // Rebotar en los límites
            if (platform.x >= platform.endX || platform.x <= platform.startX) {
                platform.direction *= -1;
            }
        } else if (platform.moveType === 'vertical') {
            platform.y += platform.speed * platform.direction;
            
            // Rebotar en los límites
            if (platform.y >= platform.endY || platform.y <= platform.startY) {
                platform.direction *= -1;
            }
        }
    });
}

// Actualizar jugador
function updatePlayer() {
    // Verificar si está tocando una liana
    let onVine = false;
    vines.forEach(vine => {
        if (checkCollision(player, vine)) {
            onVine = true;
        }
    });
    
    if (onVine) {
        // Modo trepar
        player.climbing = true;
        player.speedY = 0; // Detener caída
        player.jumping = false;
        
        // Controles de trepado
        if (game.keys['ArrowUp']) {
            player.speedY = -player.climbSpeed;
        } else if (game.keys['ArrowDown']) {
            player.speedY = player.climbSpeed;
        } else {
            player.speedY = 0; // Quedarse quieto en la liana
        }
        
        // Movimiento lateral más lento en liana
        if (game.keys['ArrowLeft']) {
            player.speedX = -player.moveSpeed * 0.5;
            player.facingRight = false;
        } else if (game.keys['ArrowRight']) {
            player.speedX = player.moveSpeed * 0.5;
            player.facingRight = true;
        } else {
            player.speedX = 0;
        }
        
        // Saltar desde la liana
        if (game.keys[' ']) { // Espacio para saltar
            player.speedY = -player.jumpPower;
            player.climbing = false;
            player.jumping = true;
        }
    } else {
        // Modo normal (no en liana)
        player.climbing = false;
        
        if (game.keys['ArrowLeft']) {
            player.speedX = -player.moveSpeed;
            player.facingRight = false;
        } else if (game.keys['ArrowRight']) {
            player.speedX = player.moveSpeed;
            player.facingRight = true;
        } else {
            player.speedX *= game.friction;
        }

        if (game.keys['ArrowUp'] && !player.jumping) {
            player.speedY = -player.jumpPower;
            player.jumping = true;
        }

        // Aplicar gravedad solo si no está trepando
        player.speedY += game.gravity;
    }
    
    player.x += player.speedX;
    player.y += player.speedY;

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > GAME_WIDTH) player.x = GAME_WIDTH - player.width;

    // Colisión con plataformas estáticas
    platforms.forEach(platform => {
        if (checkCollision(player, platform)) {
            if (player.speedY > 0 && player.y + player.height - player.speedY <= platform.y) {
                player.y = platform.y - player.height;
                player.speedY = 0;
                player.jumping = false;
            }
        }
    });
    
    // Colisión con plataformas móviles
    let onMovingPlatform = false;
    movingPlatforms.forEach(platform => {
        if (checkCollision(player, platform)) {
            // Colisión desde arriba (pararse sobre la plataforma)
            if (player.speedY > 0 && player.y + player.height - player.speedY <= platform.y + 5) {
                player.y = platform.y - player.height;
                player.speedY = 0;
                player.jumping = false;
                onMovingPlatform = true;
                
                // Mover al jugador con la plataforma
                if (platform.moveType === 'horizontal') {
                    player.x += platform.speed * platform.direction;
                } else if (platform.moveType === 'vertical') {
                    player.y += platform.speed * platform.direction;
                }
            }
            // Colisión lateral (empujar al jugador)
            else if (platform.moveType === 'horizontal') {
                if (player.x < platform.x) {
                    player.x = platform.x - player.width;
                } else {
                    player.x = platform.x + platform.width;
                }
            }
            // Colisión vertical desde abajo
            else if (platform.moveType === 'vertical' && player.speedY < 0) {
                player.y = platform.y + platform.height;
                player.speedY = 0;
            }
        }
    });

    // Detectar proximidad y colisión con secciones
    sections.forEach(section => {
        const distance = Math.sqrt(
            Math.pow(player.x + player.width/2 - (section.x + section.width/2), 2) +
            Math.pow(player.y + player.height/2 - (section.y + section.height/2), 2)
        );

        if (distance < 80 && !game.modalOpen) {
            showTooltip(section);
        }

        if (checkCollision(player, section) && !game.modalOpen && game.lastInteraction !== section.id) {
            showModal(section);
            markAsVisited(section.id);
            game.lastInteraction = section.id;
        } else if (!checkCollision(player, section) && game.lastInteraction === section.id) {
            game.lastInteraction = null;
        }
    });
    
    // Detectar colisión con portales de salida
    exitPortals.forEach(portal => {
        const distance = Math.sqrt(
            Math.pow(player.x + player.width/2 - (portal.x + portal.width/2), 2) +
            Math.pow(player.y + player.height/2 - (portal.y + portal.height/2), 2)
        );

        if (distance < 100 && !game.modalOpen) {
            showPortalTooltip(portal);
        }

        if (checkCollision(player, portal) && !game.modalOpen && game.lastInteraction !== 'portal') {
            handlePortalCollision(portal);
            game.lastInteraction = 'portal';
        } else if (!checkCollision(player, portal) && game.lastInteraction === 'portal') {
            game.lastInteraction = null;
        }
    });

    // Si el jugador cae fuera del mundo, reiniciar en el fondo
    if (player.y > WORLD_HEIGHT) {
        recordDeath(); // Registrar muerte
        player.x = 100;
        player.y = WORLD_HEIGHT - 125;
        player.speedY = 0;
    }
    
    // Determinar animación según estado del jugador
    if (player.climbing) {
        spriteAnimator.setAnimation('climb');
    } else if (player.speedY < -2) {
        spriteAnimator.setAnimation('jump');
    } else if (player.speedY > 2 && player.jumping) {
        spriteAnimator.setAnimation('fall');
    } else if (!player.jumping && spriteAnimator.getCurrentAnimation() === 'fall') {
        spriteAnimator.setAnimation('land');
    } else if (spriteAnimator.getCurrentAnimation() === 'land' && spriteAnimator.isAnimationComplete()) {
        spriteAnimator.setAnimation('idle');
    } else if (Math.abs(player.speedX) > 0.5 && !player.jumping) {
        spriteAnimator.setAnimation('run');
    } else if (!player.jumping && spriteAnimator.getCurrentAnimation() !== 'land') {
        spriteAnimator.setAnimation('idle');
    }
    
    // Actualizar cámara para seguir al jugador
    camera.follow(player);
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function draw() {
    // Limpiar canvas (transparente, no rellenar fondo)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Guardar el estado del contexto
    ctx.save();
    
    // Aplicar transformación de la cámara
    ctx.translate(-camera.x, -camera.y);

    // Ordenar decoraciones por layer
    const sortedDecorations = [...decorations].sort((a, b) => 
        (a.layer || 0) - (b.layer || 0)
    );

    // 1. Dibujar decoraciones de fondo (layer < 0)
    sortedDecorations.forEach(decoration => {
        if ((decoration.layer || 0) < 0) {
            drawDecoration(decoration);
        }
    });

    // 2. Dibujar lianas (layer 0 - gameplay)
    vines.forEach(vine => {
        // Rellenar liana (verde limón)
        ctx.fillStyle = vine.color;
        ctx.fillRect(vine.x, vine.y, vine.width, vine.height);
        
        // Patrón de segmentos para simular nudos
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        for (let y = vine.y; y < vine.y + vine.height; y += 20) {
            ctx.beginPath();
            ctx.moveTo(vine.x, y);
            ctx.lineTo(vine.x + vine.width, y);
            ctx.stroke();
        }
        
        // Borde negro grueso (estilo maqueta)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(vine.x, vine.y, vine.width, vine.height);
    });

    // 3. Dibujar plataformas (layer 0 - gameplay)
    platforms.forEach(platform => {
        // Rellenar plataforma
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Borde negro grueso (estilo maqueta)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    });
    
    // 3.5. Dibujar plataformas móviles (layer 0 - gameplay)
    movingPlatforms.forEach(platform => {
        // Rellenar plataforma
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Borde negro grueso (estilo maqueta)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        
        // Indicador de movimiento (flechas)
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        if (platform.moveType === 'horizontal') {
            ctx.fillText('←→', platform.x + platform.width/2 - 12, platform.y + platform.height/2 + 6);
        } else if (platform.moveType === 'vertical') {
            ctx.fillText('↕', platform.x + platform.width/2 - 5, platform.y + platform.height/2 + 6);
        }
    });

    // Dibujar secciones con animación
    const time = Date.now() / 1000;
    sections.forEach(section => {
        // Glow effect
        const pulse = Math.sin(time * 2) * 0.3 + 0.7;
        ctx.shadowBlur = 20 * pulse;
        ctx.shadowColor = section.color;
        
        ctx.fillStyle = section.color;
        ctx.fillRect(section.x, section.y, section.width, section.height);
        
        // Icon
        ctx.shadowBlur = 0;
        ctx.font = '24px Arial';
        ctx.fillText(section.icon, section.x + 8, section.y + 30);
        
        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(section.x, section.y, section.width, section.height);
    });
    
    // Dibujar portales de salida
    exitPortals.forEach(portal => {
        const pulse = Math.sin(time * 3) * 0.4 + 0.6;
        
        // Portal siempre activo - dorado brillante
        ctx.shadowBlur = 30 * pulse;
        ctx.shadowColor = portal.glowColor;
        ctx.fillStyle = portal.color;
        
        // Partículas flotantes
        for (let i = 0; i < 3; i++) {
            const particleY = portal.y - 20 - (time * 30 + i * 20) % 60;
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(portal.x + 10 + i * 20, particleY, 3, 3);
        }
        ctx.globalAlpha = 1;
        
        // Cuerpo del portal
        ctx.fillRect(portal.x, portal.y, portal.width, portal.height);
        
        // Icono
        ctx.shadowBlur = 0;
        ctx.font = '40px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(portal.icon, portal.x + 10, portal.y + 50);
        
        // Indicador de progreso (solo informativo)
        if (game.visitedSections.size < game.totalSections) {
            ctx.font = '14px Arial';
            ctx.fillStyle = '#FFD700';
            const progressText = `${game.visitedSections.size}/${game.totalSections}`;
            ctx.fillText(progressText, portal.x + portal.width/2 - 15, portal.y + portal.height + 20);
        } else {
            // Si completó todo, mostrar checkmark
            ctx.font = '20px Arial';
            ctx.fillStyle = '#00ff88';
            ctx.fillText('✓', portal.x + portal.width/2 - 8, portal.y + portal.height + 20);
        }
        
        // Borde
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(portal.x, portal.y, portal.width, portal.height);
        
        ctx.shadowBlur = 0;
    });

    // 5. Dibujar jugador animado (layer 0 - gameplay)
    spriteAnimator.draw(ctx, player.x, player.y, player.facingRight);
    
    // 6. Dibujar decoraciones delanteras (layer > 0)
    sortedDecorations.forEach(decoration => {
        if ((decoration.layer || 0) > 0) {
            drawDecoration(decoration);
        }
    });
    
    // Restaurar el estado del contexto
    ctx.restore();
}

function showTooltip(section) {
    const tooltip = document.getElementById('tooltip');
    tooltip.textContent = section.title.replace(/[^\w\s]/gi, '').trim();
    tooltip.style.display = 'block';
    
    // Ajustar posición del tooltip según la cámara
    const screenY = section.y - camera.y;
    const screenX = section.x - camera.x;
    
    tooltip.style.left = screenX + section.width + 20 + 'px';
    tooltip.style.top = screenY + 'px';
}

function showPortalTooltip(portal) {
    const tooltip = document.getElementById('tooltip');
    
    // Siempre mostrar mensaje de bienvenida
    const progress = `${game.visitedSections.size}/${game.totalSections}`;
    
    if (game.visitedSections.size === game.totalSections) {
        tooltip.textContent = `✅ ${portal.message} (${progress})`;
        tooltip.style.background = 'rgba(255, 215, 0, 0.9)';
        tooltip.style.color = '#1a1a1a';
        tooltip.style.borderColor = '#FFD700';
    } else {
        tooltip.textContent = `🚪 ${portal.message} - Explorado: ${progress}`;
        tooltip.style.background = 'rgba(0, 217, 255, 0.9)';
        tooltip.style.color = '#fff';
        tooltip.style.borderColor = '#00d9ff';
    }
    
    tooltip.style.display = 'block';
    
    // Ajustar posición del tooltip según la cámara
    const screenY = portal.y - camera.y;
    const screenX = portal.x - camera.x;
    
    tooltip.style.left = screenX + portal.width + 20 + 'px';
    tooltip.style.top = screenY + 'px';
}

function handlePortalCollision(portal) {
    // Siempre permitir entrar al portal
    completeLevel(portal);
}

function completeLevel(portal) {
    game.modalOpen = true;
    
    // Marcar nivel como completado
    const isNewCompletion = progressManager.completeLevel();
    
    // Verificar logros globales
    if (progressManager.areAllLevelsCompleted()) {
        progressManager.unlockAchievement('master_explorer');
    }
    
    // Mostrar modal de completado
    showCompletionModal(portal);
}

function showCompletionModal(portal) {
    const stats = progressManager.getLevelStats();
    const globalStats = progressManager.getGlobalStats();
    
    const timeFormatted = progressManager.formatTime(stats.timeSpent);
    
    document.getElementById('modalTitle').innerHTML = '🎉 ' + portal.message + ' 🎉';
    document.getElementById('modalContent').innerHTML = `
        <div style="text-align: center;">
            <h3 style="color: #FFD700; font-size: 24px; margin: 20px 0;">¡Excelente trabajo!</h3>
            
            <div style="background: rgba(0, 217, 255, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h4 style="color: #00d9ff; margin-bottom: 15px;">📊 Estadísticas de este nivel:</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: left;">
                    <div>
                        <strong style="color: #aaa;">⏱️ Tiempo:</strong><br>
                        <span style="color: #fff; font-size: 18px;">${timeFormatted}</span>
                    </div>
                    <div>
                        <strong style="color: #aaa;">📍 Secciones:</strong><br>
                        <span style="color: #fff; font-size: 18px;">${stats.visitedSections}/${game.totalSections} ✅</span>
                    </div>
                    <div>
                        <strong style="color: #aaa;">💀 Caídas:</strong><br>
                        <span style="color: #fff; font-size: 18px;">${stats.deaths}</span>
                    </div>
                    <div>
                        <strong style="color: #aaa;">🏆 Logros:</strong><br>
                        <span style="color: #fff; font-size: 18px;">${globalStats.achievements}</span>
                    </div>
                </div>
            </div>
            
            <div style="background: rgba(255, 215, 0, 0.1); padding: 15px; border-radius: 10px; margin: 20px 0;">
                <p style="font-size: 16px; margin: 10px 0;">
                    <strong style="color: #FFD700;">Siguiente:</strong> ${portal.nextLevelName}
                </p>
            </div>
            
            <p style="color: #aaa; font-size: 14px; margin-top: 20px;">
                Redirigiendo en <span id="countdown">3</span> segundos...
            </p>
            
            <button onclick="skipToNextLevel('${portal.targetUrl}')" class="btn-primary" style="margin-top: 15px;">
                Continuar Ahora →
            </button>
        </div>
    `;
    
    document.getElementById('modal').classList.add('active');
    document.getElementById('overlay').classList.add('active');
    document.getElementById('tooltip').style.display = 'none';
    
    // Countdown
    let countdown = 3;
    const countdownInterval = setInterval(() => {
        countdown--;
        const countdownEl = document.getElementById('countdown');
        if (countdownEl) {
            countdownEl.textContent = countdown;
        }
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            window.location.href = portal.targetUrl;
        }
    }, 1000);
}

// Función global para saltar el countdown
window.skipToNextLevel = function(url) {
    window.location.href = url;
};

function showModal(section) {
    document.getElementById('modalTitle').textContent = section.title;
    document.getElementById('modalContent').innerHTML = section.content;
    document.getElementById('modal').classList.add('active');
    document.getElementById('overlay').classList.add('active');
    document.getElementById('tooltip').style.display = 'none';
    game.modalOpen = true;
}

window.closeModal = function() {
    document.getElementById('modal').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    game.modalOpen = false;
};

function markAsVisited(sectionId) {
    if (!game.visitedSections.has(sectionId)) {
        game.visitedSections.add(sectionId);
        
        // Guardar en localStorage
        const isNew = progressManager.visitSection(sectionId);
        
        // Marcar checkpoint si existe
        const checkpoint = document.getElementById('check-' + sectionId);
        if (checkpoint) {
            checkpoint.classList.add('visited');
        }
        
        game.updateProgress();
        
        // Verificar logros
        checkAchievements();
        
        // Actualizar estado de portales
        updatePortalsState();
    }
}

// Sistema de logros
function checkAchievements() {
    // Primera sección visitada
    if (game.visitedSections.size === 1) {
        if (progressManager.unlockAchievement('first_section')) {
            showAchievement('🎯 Primera Exploración', 'Visitaste tu primera sección');
        }
    }
    
    // Completar todas las secciones
    if (game.visitedSections.size === game.totalSections) {
        if (progressManager.unlockAchievement('all_sections_' + LEVEL_ID)) {
            showAchievement('⭐ Explorador Completo', 'Visitaste todas las secciones');
        }
        
        // Sin muertes
        const stats = progressManager.getLevelStats();
        if (stats.deaths === 0) {
            if (progressManager.unlockAchievement('no_deaths_' + LEVEL_ID)) {
                showAchievement('💎 Perfecto', 'Completaste sin caer');
            }
        }
    }
}

// Mostrar notificación de logro
function showAchievement(title, description) {
    const achievement = document.createElement('div');
    achievement.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        color: #1a1a1a;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(255, 215, 0, 0.5);
        z-index: 10000;
        font-family: Arial, sans-serif;
        min-width: 250px;
        animation: slideIn 0.5s ease-out;
    `;
    
    achievement.innerHTML = `
        <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">${title}</div>
        <div style="font-size: 14px; opacity: 0.9;">${description}</div>
    `;
    
    document.body.appendChild(achievement);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        achievement.style.animation = 'slideOut 0.5s ease-in';
        setTimeout(() => achievement.remove(), 500);
    }, 4000);
}

// Registrar muerte (cuando cae fuera del mundo)
function recordDeath() {
    progressManager.recordDeath();
}

window.handleSubmit = function(event) {
    event.preventDefault();
    alert('¡Gracias! Tu mensaje ha sido enviado. Te contactaremos pronto.');
    window.closeModal();
    return false;
};

// Ocultar tooltip cuando no hay proximidad
setInterval(() => {
    let isNearSection = false;
    sections.forEach(section => {
        const distance = Math.sqrt(
            Math.pow(player.x + player.width/2 - (section.x + section.width/2), 2) +
            Math.pow(player.y + player.height/2 - (section.y + section.height/2), 2)
        );
        if (distance < 80) isNearSection = true;
    });
    if (!isNearSection) {
        document.getElementById('tooltip').style.display = 'none';
    }
}, 100);

function gameLoop(timestamp = 0) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    // NUEVO: Solo actualizar si el editor NO está activo
    if (!window.gameLoopPaused) {
        updateMovingPlatforms();
        updatePlayer();
        
        // Actualizar animación del sprite
        spriteAnimator.update(deltaTime);
        
        draw();
    }
    
    requestAnimationFrame(gameLoop);
}

function drawDecoration(decoration) {
    ctx.globalAlpha = decoration.opacity || 0.5;
    ctx.fillStyle = decoration.color;
    
    if (decoration.shape === 'circle') {
        const radius = Math.min(decoration.width, decoration.height) / 2;
        const centerX = decoration.x + decoration.width / 2;
        const centerY = decoration.y + decoration.height / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
    } else if (decoration.shape === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(decoration.x + decoration.width / 2, decoration.y);
        ctx.lineTo(decoration.x + decoration.width, decoration.y + decoration.height);
        ctx.lineTo(decoration.x, decoration.y + decoration.height);
        ctx.closePath();
        ctx.fill();
    } else {
        ctx.fillRect(decoration.x, decoration.y, decoration.width, decoration.height);
    }
    
    ctx.globalAlpha = 1;
}

gameLoop();
