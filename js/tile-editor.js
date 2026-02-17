// Tile Editor - Herramienta para diseñar niveles
import { levelConfig } from './level-data.js';

// Dimensiones fijas del juego
const GAME_WIDTH = 1100;
let GAME_HEIGHT = 600; // Ahora es variable
const WORLD_HEIGHT = 3000;

class TileEditor {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.active = false;
        this.gridSize = 20;
        this.mode = 'platform';
        this.platforms = [...levelConfig.platforms];
        this.movingPlatforms = levelConfig.movingPlatforms ? [...levelConfig.movingPlatforms] : [];
        this.vines = levelConfig.vines ? [...levelConfig.vines] : [];
        this.decorations = levelConfig.decorations ? [...levelConfig.decorations] : [];
        this.exitPortals = levelConfig.exitPortals ? [...levelConfig.exitPortals] : [];
        this.sections = [...levelConfig.sections];
        this.selectedItem = null;
        this.dragging = false;
        this.resizing = false;
        this.dragStart = { x: 0, y: 0 };
        
        // Cámara del editor para navegar el mundo grande
        this.camera = {
            y: WORLD_HEIGHT - GAME_HEIGHT,
            targetY: WORLD_HEIGHT - GAME_HEIGHT
        };
        
        this.setupUI();
        this.setupMouseEvents();
        this.setupCameraControls();
        
        // Actualizar GAME_HEIGHT cuando cambia el tamaño de ventana
        window.addEventListener('resize', () => {
            GAME_HEIGHT = this.canvas.height;
            this.camera.targetY = Math.min(this.camera.targetY, WORLD_HEIGHT - GAME_HEIGHT);
        });
    }
    
    setupCameraControls() {
        // Controles de cámara con rueda del mouse
        this.canvas.addEventListener('wheel', (e) => {
            if (!this.active) return;
            e.preventDefault();
            
            const scrollSpeed = 30;
            this.camera.targetY += e.deltaY > 0 ? scrollSpeed : -scrollSpeed;
            
            // Límites de la cámara
            if (this.camera.targetY < 0) this.camera.targetY = 0;
            if (this.camera.targetY > WORLD_HEIGHT - GAME_HEIGHT) {
                this.camera.targetY = WORLD_HEIGHT - GAME_HEIGHT;
            }
        });
        
        // Sincronizar HTML layer cuando se hace scroll en el workspace
        const workspace = document.querySelector('.workspace');
        if (!workspace) {
            // Si no existe workspace, estamos en el juego normal, no en un editor separado
            // Usar scroll del window
            window.addEventListener('scroll', () => {
                if (!this.active) return;
                this.syncHTMLLayerToScroll();
            });
        }
    }
    
    syncHTMLLayerToScroll() {
        // Esta función se llama cuando hay scroll del navegador (no wheel del canvas)
        // No se usa en el diseño actual pero la dejamos por si acaso
    }
    
    setupUI() {
        const editorUI = document.createElement('div');
        editorUI.id = 'editor-ui';
        editorUI.innerHTML = `
            <div class="editor-panel">
                <h3>🎨 Tile Editor</h3>
                
                <div class="editor-section">
                    <label>Modo:</label>
                    <select id="editor-mode">
                        <option value="platform">Plataforma</option>
                        <option value="moving-platform">Plataforma Móvil</option>
                        <option value="vine">Liana</option>
                        <option value="decoration">Decoración</option>
                        <option value="section">Botón Interactivo</option>
                        <option value="exit-portal">Portal de Salida</option>
                    </select>
                </div>
                
                <div class="editor-section">
                    <button id="add-item" class="editor-btn">➕ Agregar</button>
                    <button id="delete-item" class="editor-btn">🗑️ Eliminar</button>
                </div>
                
                <div class="editor-section" id="selected-props" style="display: none;">
                    <h4 style="color: #FFD700; margin: 0 0 10px 0;">📝 Propiedades</h4>
                    <label>X:</label>
                    <input type="number" id="edit-x" step="20">
                    <label>Y:</label>
                    <input type="number" id="edit-y" step="20">
                    <label>Ancho:</label>
                    <input type="number" id="edit-width" step="20">
                    <label>Alto:</label>
                    <input type="number" id="edit-height" step="5">
                    <label>Color:</label>
                    <input type="color" id="edit-color">
                    <button id="apply-props" class="editor-btn-primary">✓ Aplicar Cambios</button>
                </div>
                
                <div class="editor-section" id="platform-props" style="display: block;">
                    <h4 style="color: #aaa; margin: 0 0 10px 0;">Nuevas Plataformas:</h4>
                    <label>Ancho:</label>
                    <input type="number" id="platform-width" value="200" step="20">
                    <label>Alto:</label>
                    <input type="number" id="platform-height" value="25" step="5">
                    <label>Color:</label>
                    <input type="color" id="platform-color" value="#0f3460">
                </div>
                
                <div class="editor-section" id="moving-platform-props" style="display: none;">
                    <h4 style="color: #aaa; margin: 0 0 10px 0;">Nuevas Plataformas Móviles:</h4>
                    <label>Ancho:</label>
                    <input type="number" id="moving-platform-width" value="120" step="20">
                    <label>Alto:</label>
                    <input type="number" id="moving-platform-height" value="20" step="5">
                    <label>Color:</label>
                    <input type="color" id="moving-platform-color" value="#ff6b6b">
                    <label>Tipo de movimiento:</label>
                    <select id="moving-platform-type">
                        <option value="horizontal">Horizontal ←→</option>
                        <option value="vertical">Vertical ↕</option>
                    </select>
                    <label>Velocidad:</label>
                    <input type="number" id="moving-platform-speed" value="2" step="0.5" min="0.5" max="10">
                    <label>Distancia:</label>
                    <input type="number" id="moving-platform-distance" value="200" step="20">
                    <small style="display: block; margin-top: 5px; color: #888;">
                        La plataforma se moverá esta distancia en ambas direcciones
                    </small>
                </div>
                
                <div class="editor-section" id="vine-props" style="display: none;">
                    <h4 style="color: #aaa; margin: 0 0 10px 0;">Nuevas Lianas:</h4>
                    <label>Ancho:</label>
                    <input type="number" id="vine-width" value="20" step="5">
                    <label>Alto:</label>
                    <input type="number" id="vine-height" value="200" step="20">
                    <label>Color:</label>
                    <input type="color" id="vine-color" value="#00ff88">
                </div>
                
                <div class="editor-section" id="decoration-props" style="display: none;">
                    <h4 style="color: #aaa; margin: 0 0 10px 0;">Nuevas Decoraciones:</h4>
                    <label>Ancho:</label>
                    <input type="number" id="decoration-width" value="100" step="20">
                    <label>Alto:</label>
                    <input type="number" id="decoration-height" value="100" step="20">
                    <label>Color:</label>
                    <input type="color" id="decoration-color" value="#ff6b6b">
                    <label>Opacidad:</label>
                    <input type="range" id="decoration-opacity" min="0.1" max="1" step="0.1" value="0.5">
                    <span id="opacity-value" style="color: #aaa;">0.5</span>
                    <label>Forma:</label>
                    <select id="decoration-shape">
                        <option value="rect">Rectángulo</option>
                        <option value="circle">Círculo</option>
                        <option value="triangle">Triángulo</option>
                    </select>
                    <label>Layer (profundidad):</label>
                    <input type="number" id="decoration-layer" value="0" min="-10" max="10" step="1">
                    <small style="display: block; margin-top: 5px; color: #888;">
                        -10 (fondo) → 0 (gameplay) → +10 (frente)
                    </small>
                </div>
                
                <div class="editor-section" id="section-props" style="display: none;">
                    <h4 style="color: #aaa; margin: 0 0 10px 0;">Nuevos Botones:</h4>
                    <label>Tipo:</label>
                    <select id="section-type">
                        <option value="inicio">🏠 Inicio</option>
                        <option value="servicios">⚙️ Servicios</option>
                        <option value="portafolio">🎯 Portafolio</option>
                        <option value="nosotros">👥 Nosotros</option>
                        <option value="contacto">📧 Contacto</option>
                    </select>
                </div>
                
                <div class="editor-section" id="exit-portal-props" style="display: none;">
                    <h4 style="color: #aaa; margin: 0 0 10px 0;">Nuevos Portales:</h4>
                    <label>Ancho:</label>
                    <input type="number" id="portal-width" value="60" step="10">
                    <label>Alto:</label>
                    <input type="number" id="portal-height" value="80" step="10">
                    <label>Color:</label>
                    <input type="color" id="portal-color" value="#FFD700">
                    <label>Icono:</label>
                    <select id="portal-icon">
                        <option value="🚪">🚪 Puerta</option>
                        <option value="🌟">🌟 Estrella</option>
                        <option value="🏁">🏁 Bandera</option>
                        <option value="🎯">🎯 Diana</option>
                        <option value="🔮">🔮 Portal</option>
                        <option value="🏆">🏆 Trofeo</option>
                    </select>
                    <label>URL destino:</label>
                    <input type="text" id="portal-url" value="./gracias.html" placeholder="./nivel-2.html">
                    <label>Mensaje:</label>
                    <input type="text" id="portal-message" value="¡Nivel Completado!" placeholder="¡Nivel Completado!">
                    <label>Nombre siguiente nivel:</label>
                    <input type="text" id="portal-next-name" value="Siguiente nivel" placeholder="Nivel 2">
                    <label>
                        <input type="checkbox" id="portal-require-all">
                        Requiere completar todas las secciones
                    </label>
                    <small style="display: block; margin-top: 5px; color: #888;">
                        Dejar desmarcado permite acceso libre (recomendado)
                    </small>
                </div>
                
                <div class="editor-section">
                    <label>
                        <input type="checkbox" id="snap-to-grid" checked>
                        Ajustar a cuadrícula (${this.gridSize}px)
                    </label>
                </div>
                
                <div class="editor-section">
                    <button id="export-level" class="editor-btn-primary">📦 Exportar Nivel</button>
                </div>
                
                <div class="editor-section">
                    <small>
                        <strong>Controles:</strong><br>
                        Click: Seleccionar<br>
                        Arrastrar: Mover<br>
                        Shift+Arrastrar: Redimensionar<br>
                        <strong>Rueda del mouse: Navegar arriba/abajo</strong>
                    </small>
                </div>
            </div>
        `;
        document.body.appendChild(editorUI);
        
        // Event listeners
        document.getElementById('editor-mode').addEventListener('change', (e) => {
            this.mode = e.target.value;
            document.getElementById('platform-props').style.display = 
                this.mode === 'platform' ? 'block' : 'none';
            document.getElementById('moving-platform-props').style.display = 
                this.mode === 'moving-platform' ? 'block' : 'none';
            document.getElementById('vine-props').style.display = 
                this.mode === 'vine' ? 'block' : 'none';
            document.getElementById('decoration-props').style.display = 
                this.mode === 'decoration' ? 'block' : 'none';
            document.getElementById('section-props').style.display = 
                this.mode === 'section' ? 'block' : 'none';
            document.getElementById('exit-portal-props').style.display = 
                this.mode === 'exit-portal' ? 'block' : 'none';
        });
        
        // Actualizar el valor de opacidad mientras se mueve el slider
        document.getElementById('decoration-opacity').addEventListener('input', (e) => {
            document.getElementById('opacity-value').textContent = e.target.value;
        });
        
        document.getElementById('add-item').addEventListener('click', () => this.addItem());
        document.getElementById('delete-item').addEventListener('click', () => this.deleteItem());
        document.getElementById('export-level').addEventListener('click', () => this.exportLevel());
        document.getElementById('apply-props').addEventListener('click', () => this.applyProperties());
    }
    
    setupMouseEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top + this.camera.y; // Ajustar por la posición de la cámara
        
        if (document.getElementById('snap-to-grid').checked) {
            x = Math.round(x / this.gridSize) * this.gridSize;
            y = Math.round(y / this.gridSize) * this.gridSize;
        }
        
        return { x, y };
    }
    
    onMouseDown(e) {
        if (!this.active) return;
        
        const pos = this.getMousePos(e);
        this.dragStart = pos;
        
        // Buscar item en la posición del click
        const clickedPortal = this.exitPortals.find(p => 
            pos.x >= p.x && pos.x <= p.x + p.width &&
            pos.y >= p.y && pos.y <= p.y + p.height
        );
        
        const clickedSection = this.sections.find(s => 
            pos.x >= s.x && pos.x <= s.x + s.width &&
            pos.y >= s.y && pos.y <= s.y + s.height
        );
        
        const clickedVine = this.vines.find(v => 
            pos.x >= v.x && pos.x <= v.x + v.width &&
            pos.y >= v.y && pos.y <= v.y + v.height
        );
        
        const clickedMovingPlatform = this.movingPlatforms.find(mp => 
            pos.x >= mp.x && pos.x <= mp.x + mp.width &&
            pos.y >= mp.y && pos.y <= mp.y + mp.height
        );
        
        const clickedDecoration = this.decorations.find(d => 
            pos.x >= d.x && pos.x <= d.x + d.width &&
            pos.y >= d.y && pos.y <= d.y + d.height
        );
        
        const clickedPlatform = this.platforms.find(p => 
            pos.x >= p.x && pos.x <= p.x + p.width &&
            pos.y >= p.y && pos.y <= p.y + p.height
        );
        
        if (clickedPortal) {
            this.selectedItem = { type: 'exit-portal', item: clickedPortal };
            this.dragging = true;
            this.resizing = e.shiftKey;
            this.updatePropertiesPanel();
        } else if (clickedSection) {
            this.selectedItem = { type: 'section', item: clickedSection };
            this.dragging = true;
            this.resizing = false;
            this.updatePropertiesPanel();
        } else if (clickedVine) {
            this.selectedItem = { type: 'vine', item: clickedVine };
            this.dragging = true;
            this.resizing = e.shiftKey;
            this.updatePropertiesPanel();
        } else if (clickedMovingPlatform) {
            this.selectedItem = { type: 'moving-platform', item: clickedMovingPlatform };
            this.dragging = true;
            this.resizing = e.shiftKey;
            this.updatePropertiesPanel();
        } else if (clickedDecoration) {
            this.selectedItem = { type: 'decoration', item: clickedDecoration };
            this.dragging = true;
            this.resizing = e.shiftKey;
            this.updatePropertiesPanel();
        } else if (clickedPlatform) {
            this.selectedItem = { type: 'platform', item: clickedPlatform };
            this.dragging = true;
            this.resizing = e.shiftKey;
            this.updatePropertiesPanel();
        } else {
            this.selectedItem = null;
            this.hidePropertiesPanel();
        }
    }
    
    onMouseMove(e) {
        if (!this.active || !this.dragging || !this.selectedItem) return;
        
        const pos = this.getMousePos(e);
        const dx = pos.x - this.dragStart.x;
        const dy = pos.y - this.dragStart.y;
        
        if (this.resizing && (this.selectedItem.type === 'platform' || this.selectedItem.type === 'moving-platform' || this.selectedItem.type === 'decoration' || this.selectedItem.type === 'vine' || this.selectedItem.type === 'exit-portal')) {
            // Redimensionar
            this.selectedItem.item.width = Math.max(20, this.selectedItem.item.width + dx);
            this.selectedItem.item.height = Math.max(10, this.selectedItem.item.height + dy);
        } else {
            // Mover
            this.selectedItem.item.x += dx;
            this.selectedItem.item.y += dy;
            
            // Si es plataforma móvil, actualizar también los límites
            if (this.selectedItem.type === 'moving-platform') {
                this.selectedItem.item.startX += dx;
                this.selectedItem.item.endX += dx;
                this.selectedItem.item.startY += dy;
                this.selectedItem.item.endY += dy;
            }
        }
        
        this.dragStart = pos;
        this.updatePropertiesPanel(); // Actualizar valores en tiempo real
        this.draw();
    }
    
    onMouseUp(e) {
        this.dragging = false;
        this.resizing = false;
    }
    
    addItem() {
        const centerX = GAME_WIDTH / 2;
        const centerY = this.camera.y + GAME_HEIGHT / 2; // Centro de lo que se ve en pantalla
        
        if (this.mode === 'platform') {
            const width = parseInt(document.getElementById('platform-width').value);
            const height = parseInt(document.getElementById('platform-height').value);
            const color = document.getElementById('platform-color').value;
            
            this.platforms.push({
                x: centerX - width/2,
                y: centerY - height/2,
                width: width,
                height: height,
                color: color
            });
        } else if (this.mode === 'moving-platform') {
            const width = parseInt(document.getElementById('moving-platform-width').value);
            const height = parseInt(document.getElementById('moving-platform-height').value);
            const color = document.getElementById('moving-platform-color').value;
            const moveType = document.getElementById('moving-platform-type').value;
            const speed = parseFloat(document.getElementById('moving-platform-speed').value);
            const distance = parseInt(document.getElementById('moving-platform-distance').value);
            
            const x = centerX - width/2;
            const y = centerY - height/2;
            
            this.movingPlatforms.push({
                x: x,
                y: y,
                width: width,
                height: height,
                color: color,
                moveType: moveType,
                speed: speed,
                startX: moveType === 'horizontal' ? x - distance/2 : x,
                endX: moveType === 'horizontal' ? x + distance/2 : x,
                startY: moveType === 'vertical' ? y - distance/2 : y,
                endY: moveType === 'vertical' ? y + distance/2 : y,
                direction: 1
            });
        } else if (this.mode === 'vine') {
            const width = parseInt(document.getElementById('vine-width').value);
            const height = parseInt(document.getElementById('vine-height').value);
            const color = document.getElementById('vine-color').value;
            
            this.vines.push({
                x: centerX - width/2,
                y: centerY - height/2,
                width: width,
                height: height,
                color: color
            });
        } else if (this.mode === 'decoration') {
            const width = parseInt(document.getElementById('decoration-width').value);
            const height = parseInt(document.getElementById('decoration-height').value);
            const color = document.getElementById('decoration-color').value;
            const opacity = parseFloat(document.getElementById('decoration-opacity').value);
            const shape = document.getElementById('decoration-shape').value;
            const layer = parseInt(document.getElementById('decoration-layer').value);
            
            this.decorations.push({
                x: centerX - width/2,
                y: centerY - height/2,
                width: width,
                height: height,
                color: color,
                opacity: opacity,
                shape: shape,
                layer: layer
            });
        } else if (this.mode === 'section') {
            const type = document.getElementById('section-type').value;
            const icons = {
                inicio: '🏠',
                servicios: '⚙️',
                portafolio: '🎯',
                nosotros: '👥',
                contacto: '📧'
            };
            const colors = {
                inicio: '#FFD700',
                servicios: '#00d9ff',
                portafolio: '#ff00ff',
                nosotros: '#00ff88',
                contacto: '#ff6b6b'
            };
            
            this.sections.push({
                id: type,
                x: centerX - 20,
                y: centerY - 20,
                width: 40,
                height: 40,
                color: colors[type],
                icon: icons[type]
            });
        } else if (this.mode === 'exit-portal') {
            const width = parseInt(document.getElementById('portal-width').value);
            const height = parseInt(document.getElementById('portal-height').value);
            const color = document.getElementById('portal-color').value;
            const icon = document.getElementById('portal-icon').value;
            const targetUrl = document.getElementById('portal-url').value;
            const message = document.getElementById('portal-message').value;
            const nextLevelName = document.getElementById('portal-next-name').value;
            const requireAllSections = document.getElementById('portal-require-all').checked;
            
            this.exitPortals.push({
                x: centerX - width/2,
                y: centerY - height/2,
                width: width,
                height: height,
                color: color,
                icon: icon,
                glowColor: color,
                targetUrl: targetUrl,
                requireAllSections: requireAllSections,
                message: message,
                nextLevelName: nextLevelName,
                active: !requireAllSections
            });
        }
        
        this.draw();
    }
    
    deleteItem() {
        if (!this.selectedItem) {
            alert('Selecciona un elemento primero');
            return;
        }
        
        if (this.selectedItem.type === 'platform') {
            const index = this.platforms.indexOf(this.selectedItem.item);
            if (index > -1) this.platforms.splice(index, 1);
        } else if (this.selectedItem.type === 'moving-platform') {
            const index = this.movingPlatforms.indexOf(this.selectedItem.item);
            if (index > -1) this.movingPlatforms.splice(index, 1);
        } else if (this.selectedItem.type === 'vine') {
            const index = this.vines.indexOf(this.selectedItem.item);
            if (index > -1) this.vines.splice(index, 1);
        } else if (this.selectedItem.type === 'decoration') {
            const index = this.decorations.indexOf(this.selectedItem.item);
            if (index > -1) this.decorations.splice(index, 1);
        } else if (this.selectedItem.type === 'exit-portal') {
            const index = this.exitPortals.indexOf(this.selectedItem.item);
            if (index > -1) this.exitPortals.splice(index, 1);
        } else {
            const index = this.sections.indexOf(this.selectedItem.item);
            if (index > -1) this.sections.splice(index, 1);
        }
        
        this.selectedItem = null;
        this.hidePropertiesPanel();
        this.draw();
    }
    
    updatePropertiesPanel() {
        if (!this.selectedItem) return;
        
        const panel = document.getElementById('selected-props');
        panel.style.display = 'block';
        
        const item = this.selectedItem.item;
        document.getElementById('edit-x').value = Math.round(item.x);
        document.getElementById('edit-y').value = Math.round(item.y);
        document.getElementById('edit-width').value = Math.round(item.width);
        document.getElementById('edit-height').value = Math.round(item.height);
        
        if (item.color) {
            document.getElementById('edit-color').value = item.color;
            document.getElementById('edit-color').parentElement.style.display = 'block';
        } else {
            document.getElementById('edit-color').parentElement.style.display = 'none';
        }
    }
    
    hidePropertiesPanel() {
        document.getElementById('selected-props').style.display = 'none';
    }
    
    applyProperties() {
        if (!this.selectedItem) return;
        
        const item = this.selectedItem.item;
        item.x = parseFloat(document.getElementById('edit-x').value);
        item.y = parseFloat(document.getElementById('edit-y').value);
        item.width = parseFloat(document.getElementById('edit-width').value);
        item.height = parseFloat(document.getElementById('edit-height').value);
        
        if (item.color) {
            item.color = document.getElementById('edit-color').value;
        }
        
        this.draw();
    }
    
    draw() {
        // Actualizar GAME_HEIGHT por si cambió
        GAME_HEIGHT = this.canvas.height;
        
        // Suavizar movimiento de cámara
        this.camera.y += (this.camera.targetY - this.camera.y) * 0.1;
        
        // Sincronizar HTML layer con la cámara del editor
        const htmlLayer = document.getElementById('html-layer');
        if (htmlLayer) {
            htmlLayer.style.transform = `translateY(-${this.camera.y}px)`;
        }
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Guardar estado y aplicar transformación de cámara
        this.ctx.save();
        this.ctx.translate(0, -this.camera.y);
        
        // Dibujar cuadrícula
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < GAME_WIDTH; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.camera.y);
            this.ctx.lineTo(x, this.camera.y + GAME_HEIGHT);
            this.ctx.stroke();
        }
        for (let y = Math.floor(this.camera.y / this.gridSize) * this.gridSize; 
             y < this.camera.y + GAME_HEIGHT; 
             y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(GAME_WIDTH, y);
            this.ctx.stroke();
        }
        
        // Ordenar decoraciones por layer
        const sortedDecorations = [...this.decorations].sort((a, b) => 
            (a.layer || 0) - (b.layer || 0)
        );
        
        // Dibujar decoraciones de fondo (layer < 0)
        sortedDecorations.forEach(decoration => {
            if ((decoration.layer || 0) < 0) {
                this.drawDecoration(decoration);
            }
        });
        
        // Dibujar plataformas
        this.platforms.forEach(platform => {
            const isSelected = this.selectedItem?.item === platform;
            
            this.ctx.fillStyle = platform.color;
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            this.ctx.strokeStyle = isSelected ? '#FFD700' : '#00d9ff';
            this.ctx.lineWidth = isSelected ? 3 : 2;
            this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
            
            // Mostrar dimensiones
            if (isSelected) {
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '12px Arial';
                this.ctx.fillText(
                    `${platform.width}x${platform.height}`,
                    platform.x + 5,
                    platform.y - 5
                );
            }
        });
        
        // Dibujar plataformas móviles
        this.movingPlatforms.forEach(platform => {
            const isSelected = this.selectedItem?.item === platform;
            
            // Dibujar recorrido (línea punteada)
            this.ctx.strokeStyle = 'rgba(255, 107, 107, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            
            if (platform.moveType === 'horizontal') {
                this.ctx.beginPath();
                this.ctx.moveTo(platform.startX, platform.y + platform.height/2);
                this.ctx.lineTo(platform.endX + platform.width, platform.y + platform.height/2);
                this.ctx.stroke();
            } else if (platform.moveType === 'vertical') {
                this.ctx.beginPath();
                this.ctx.moveTo(platform.x + platform.width/2, platform.startY);
                this.ctx.lineTo(platform.x + platform.width/2, platform.endY + platform.height);
                this.ctx.stroke();
            }
            
            this.ctx.setLineDash([]);
            
            // Dibujar plataforma
            this.ctx.fillStyle = platform.color;
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Borde
            this.ctx.strokeStyle = isSelected ? '#FFD700' : '#fff';
            this.ctx.lineWidth = isSelected ? 3 : 2;
            this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
            
            // Indicador de movimiento
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '14px Arial';
            if (platform.moveType === 'horizontal') {
                this.ctx.fillText('←→', platform.x + platform.width/2 - 10, platform.y + platform.height/2 + 5);
            } else if (platform.moveType === 'vertical') {
                this.ctx.fillText('↕', platform.x + platform.width/2 - 5, platform.y + platform.height/2 + 5);
            }
            
            // Mostrar dimensiones y velocidad
            if (isSelected) {
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '12px Arial';
                this.ctx.fillText(
                    `${platform.width}x${platform.height} v:${platform.speed}`,
                    platform.x + 5,
                    platform.y - 5
                );
            }
        });
        
        // Dibujar lianas
        this.vines.forEach(vine => {
            const isSelected = this.selectedItem?.item === vine;
            
            // Dibujar cuerda/liana con textura
            this.ctx.fillStyle = vine.color;
            this.ctx.fillRect(vine.x, vine.y, vine.width, vine.height);
            
            // Patrón de segmentos para simular nudos
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.lineWidth = 1;
            for (let y = vine.y; y < vine.y + vine.height; y += 20) {
                this.ctx.beginPath();
                this.ctx.moveTo(vine.x, y);
                this.ctx.lineTo(vine.x + vine.width, y);
                this.ctx.stroke();
            }
            
            // Borde
            this.ctx.strokeStyle = isSelected ? '#FFD700' : '#00ff88';
            this.ctx.lineWidth = isSelected ? 3 : 2;
            this.ctx.strokeRect(vine.x, vine.y, vine.width, vine.height);
            
            // Indicador de dirección (flecha arriba)
            if (isSelected) {
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '12px Arial';
                this.ctx.fillText(
                    `${vine.width}x${vine.height}`,
                    vine.x + vine.width + 5,
                    vine.y + 15
                );
                
                // Flecha arriba
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.moveTo(vine.x + vine.width/2, vine.y - 10);
                this.ctx.lineTo(vine.x + vine.width/2 - 5, vine.y - 5);
                this.ctx.lineTo(vine.x + vine.width/2 + 5, vine.y - 5);
                this.ctx.closePath();
                this.ctx.fill();
            }
        });
        
        // Dibujar secciones
        this.sections.forEach(section => {
            const isSelected = this.selectedItem?.item === section;
            
            this.ctx.fillStyle = section.color;
            this.ctx.fillRect(section.x, section.y, section.width, section.height);
            
            this.ctx.font = '24px Arial';
            this.ctx.fillText(section.icon, section.x + 8, section.y + 30);
            
            this.ctx.strokeStyle = isSelected ? '#FFD700' : '#fff';
            this.ctx.lineWidth = isSelected ? 3 : 2;
            this.ctx.strokeRect(section.x, section.y, section.width, section.height);
        });
        
        // Dibujar portales de salida
        this.exitPortals.forEach(portal => {
            const isSelected = this.selectedItem?.item === portal;
            
            // Cuerpo del portal
            this.ctx.fillStyle = portal.color;
            this.ctx.fillRect(portal.x, portal.y, portal.width, portal.height);
            
            // Icono
            this.ctx.font = '36px Arial';
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText(portal.icon, portal.x + 12, portal.y + 48);
            
            // Borde
            this.ctx.strokeStyle = isSelected ? '#FFD700' : '#FFD700';
            this.ctx.lineWidth = isSelected ? 4 : 2;
            this.ctx.setLineDash(isSelected ? [] : [10, 5]);
            this.ctx.strokeRect(portal.x, portal.y, portal.width, portal.height);
            this.ctx.setLineDash([]);
            
            // Indicador de tipo
            if (isSelected) {
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '12px Arial';
                const reqText = portal.requireAllSections ? 'Req: Todo' : 'Siempre activo';
                this.ctx.fillText(reqText, portal.x + 5, portal.y - 5);
            }
        });
        
        // Dibujar decoraciones delanteras (layer > 0)
        sortedDecorations.forEach(decoration => {
            if ((decoration.layer || 0) > 0) {
                this.drawDecoration(decoration);
            }
        });
        
        this.ctx.restore();
        
        // Dibujar indicador de altura (sin transformación)
        this.ctx.fillStyle = 'rgba(0, 217, 255, 0.7)';
        this.ctx.font = '14px Arial';
        const heightText = `Altura: ${Math.round(WORLD_HEIGHT - this.camera.y)}px / ${WORLD_HEIGHT}px | Viewport: ${GAME_HEIGHT}px`;
        this.ctx.fillText(heightText, 10, 20);
        
        // Continuar dibujando si estamos en modo editor
        if (this.active) {
            requestAnimationFrame(() => this.draw());
        }
    }
    
    drawDecoration(decoration) {
        const isSelected = this.selectedItem?.item === decoration;
        
        // Aplicar opacidad
        this.ctx.globalAlpha = decoration.opacity || 0.5;
        this.ctx.fillStyle = decoration.color;
        
        if (decoration.shape === 'circle') {
            // Círculo
            const radius = Math.min(decoration.width, decoration.height) / 2;
            const centerX = decoration.x + decoration.width / 2;
            const centerY = decoration.y + decoration.height / 2;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (decoration.shape === 'triangle') {
            // Triángulo
            this.ctx.beginPath();
            this.ctx.moveTo(decoration.x + decoration.width / 2, decoration.y);
            this.ctx.lineTo(decoration.x + decoration.width, decoration.y + decoration.height);
            this.ctx.lineTo(decoration.x, decoration.y + decoration.height);
            this.ctx.closePath();
            this.ctx.fill();
        } else {
            // Rectángulo
            this.ctx.fillRect(decoration.x, decoration.y, decoration.width, decoration.height);
        }
        
        // Borde - color según layer
        this.ctx.globalAlpha = 1;
        const layer = decoration.layer || 0;
        let borderColor = '#ff6b6b'; // Default
        if (layer > 5) borderColor = '#ff00ff'; // Muy delante: magenta
        else if (layer > 0) borderColor = '#ffaa00'; // Delante: naranja
        else if (layer < -5) borderColor = '#0088ff'; // Muy atrás: azul oscuro
        else if (layer < 0) borderColor = '#00ccff'; // Atrás: azul claro
        
        this.ctx.strokeStyle = isSelected ? '#FFD700' : borderColor;
        this.ctx.lineWidth = isSelected ? 3 : 1;
        this.ctx.setLineDash(isSelected ? [] : [5, 5]);
        
        if (decoration.shape === 'circle') {
            const radius = Math.min(decoration.width, decoration.height) / 2;
            const centerX = decoration.x + decoration.width / 2;
            const centerY = decoration.y + decoration.height / 2;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        } else if (decoration.shape === 'triangle') {
            this.ctx.beginPath();
            this.ctx.moveTo(decoration.x + decoration.width / 2, decoration.y);
            this.ctx.lineTo(decoration.x + decoration.width, decoration.y + decoration.height);
            this.ctx.lineTo(decoration.x, decoration.y + decoration.height);
            this.ctx.closePath();
            this.ctx.stroke();
        } else {
            this.ctx.strokeRect(decoration.x, decoration.y, decoration.width, decoration.height);
        }
        
        this.ctx.setLineDash([]);
        
        // Mostrar dimensiones y layer
        if (isSelected) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(
                `${decoration.width}x${decoration.height} L:${layer}`,
                decoration.x + 5,
                decoration.y - 5
            );
        }
    }
    
    exportLevel() {
        const code = `// Configuración del nivel - Generado por Tile Editor
// Dimensiones del juego: 1100x600 (viewport)
// Altura total del mundo: 3000px
const GAME_WIDTH = 1100;
const GAME_HEIGHT = 600;
const WORLD_HEIGHT = 3000;

export const levelConfig = {
    platforms: ${JSON.stringify(this.platforms, null, 8).replace(/"([^"]+)":/g, '$1:')},
    
    vines: ${JSON.stringify(this.vines, null, 8).replace(/"([^"]+)":/g, '$1:')},
    
    movingPlatforms: ${JSON.stringify(this.movingPlatforms, null, 8).replace(/"([^"]+)":/g, '$1:')},
    
    decorations: ${JSON.stringify(this.decorations, null, 8).replace(/"([^"]+)":/g, '$1:')},
    
    exitPortals: ${JSON.stringify(this.exitPortals, null, 8).replace(/"([^"]+)":/g, '$1:')},
    
    sections: ${JSON.stringify(this.sections, null, 8).replace(/"([^"]+)":/g, '$1:')}
};`;
        
        // Crear modal con el código
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1e1e1e;
            padding: 30px;
            border-radius: 10px;
            z-index: 10000;
            max-width: 80%;
            max-height: 80%;
            overflow: auto;
            border: 2px solid #00d9ff;
        `;
        modal.innerHTML = `
            <h2 style="color: #00d9ff; margin-top: 0;">📦 Código del Nivel</h2>
            <p style="color: #aaa;">Copia este código y pégalo en <code>js/level-data.js</code></p>
            <textarea readonly style="
                width: 100%;
                height: 400px;
                background: #2d2d2d;
                color: #0f0;
                border: 1px solid #444;
                padding: 15px;
                font-family: monospace;
                font-size: 12px;
            ">${code}</textarea>
            <button onclick="this.parentElement.remove()" style="
                margin-top: 15px;
                padding: 10px 20px;
                background: #00d9ff;
                border: none;
                border-radius: 5px;
                color: white;
                cursor: pointer;
                font-weight: bold;
            ">Cerrar</button>
        `;
        
        document.body.appendChild(modal);
        
        // Seleccionar el texto automáticamente
        modal.querySelector('textarea').select();
    }
    
    toggle() {
        this.active = !this.active;
        const ui = document.getElementById('editor-ui');
        const instructions = document.querySelector('.instructions');
        const hud = document.querySelector('.hud');
        const htmlLayer = document.getElementById('html-layer');
        
        if (this.active) {
            ui.style.display = 'block';
            if (instructions) instructions.style.display = 'none';
            if (hud) hud.style.display = 'none';
            
            // NUEVO: Asegurar que el HTML layer sea visible en modo editor
            if (htmlLayer) {
                htmlLayer.style.visibility = 'visible';
                htmlLayer.style.opacity = '1';
            }
            
            // CRÍTICO: Detener el loop del juego para evitar conflictos
            window.gameLoopPaused = true;
            
            this.draw();
        } else {
            ui.style.display = 'none';
            if (instructions) instructions.style.display = 'block';
            if (hud) hud.style.display = 'flex';
            
            // El HTML layer se mantiene visible (el juego lo controla)
            if (htmlLayer) {
                htmlLayer.style.visibility = 'visible';
                htmlLayer.style.opacity = '1';
            }
            
            // CRÍTICO: Reactivar el loop del juego
            window.gameLoopPaused = false;
        }
    }
}

// Crear instancia global del editor
window.tileEditor = new TileEditor();

// Activar con tecla E
window.addEventListener('keydown', (e) => {
    if (e.key === 'e' || e.key === 'E') {
        window.tileEditor.toggle();
    }
});
