// HTML Editor - Herramienta para diseñar contenido web
import { levelConfig } from './level-data.js';

// Dimensiones fijas del juego
const GAME_WIDTH = 1100;
let GAME_HEIGHT = 600;
const WORLD_HEIGHT = 3000;

class HTMLEditor {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.active = false;
        this.gridSize = 25;
        this.mode = 'text-block';
        
        // Elementos HTML editables
        this.htmlElements = [];
        
        // Cargar elementos existentes del DOM
        this.loadExistingElements();
        
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
    
    loadExistingElements() {
        // Cargar elementos HTML que ya existen en el DOM
        const htmlLayer = document.getElementById('html-layer');
        if (!htmlLayer) return;
        
        // Cargar bloques de texto
        const textBlocks = htmlLayer.querySelectorAll('.text-block');
        textBlocks.forEach((block, index) => {
            if (block.id && block.id.startsWith('text-block-')) return; // Ya cargado
            
            const style = block.style;
            const element = {
                id: block.id || `text-block-${Date.now()}-${index}`,
                type: 'text-block',
                x: parseInt(style.left) || 0,
                y: parseInt(style.top) || 0,
                width: parseInt(style.width) || 350,
                height: parseInt(style.height) || 200,
                domElement: block,
                title: block.querySelector('h2')?.textContent || 'TITULO',
                content: block.querySelector('p')?.textContent || 'Contenido...'
            };
            if (!block.id) block.id = element.id;
            this.htmlElements.push(element);
        });
        
        // Cargar logos
        const logos = htmlLayer.querySelectorAll('.logo-tukan');
        logos.forEach((logo, index) => {
            if (logo.id && logo.id.startsWith('logo-')) return; // Ya cargado
            
            const style = logo.style;
            const element = {
                id: logo.id || `logo-${Date.now()}-${index}`,
                type: 'logo',
                x: parseInt(style.left) || 0,
                y: parseInt(style.top) || 0,
                width: parseInt(style.width) || 200,
                height: parseInt(style.height) || 200,
                domElement: logo,
                icon: logo.querySelector('div > div:first-child')?.textContent || '🎮',
                text: logo.querySelector('div > div:nth-child(2)')?.textContent || 'TEXTO',
                subtitle: logo.querySelector('div > div:nth-child(3)')?.textContent || 'Subtítulo'
            };
            if (!logo.id) logo.id = element.id;
            this.htmlElements.push(element);
        });
        
        // Cargar imágenes directas (no dentro de otros elementos)
        const images = htmlLayer.querySelectorAll('img');
        images.forEach((img, index) => {
            // Verificar que la imagen no esté dentro de un text-block u otro contenedor
            if (img.closest('.text-block') || img.closest('.logo-tukan')) return;
            if (img.id && img.id.startsWith('image-')) return; // Ya cargado
            
            const style = img.style;
            const element = {
                id: img.id || `image-${Date.now()}-${index}`,
                type: 'image',
                x: parseInt(style.left) || 0,
                y: parseInt(style.top) || 0,
                width: parseInt(style.width) || img.width || 400,
                height: parseInt(style.height) || img.height || 300,
                domElement: img,
                url: img.src,
                alt: img.alt || 'Imagen'
            };
            if (!img.id) img.id = element.id;
            this.htmlElements.push(element);
        });
        
        // Cargar botones/enlaces
        const buttons = htmlLayer.querySelectorAll('a');
        buttons.forEach((btn, index) => {
            if (btn.closest('.text-block')) return; // Ignorar links dentro de text-blocks
            
            // Buscar el div contenedor del botón
            const container = btn.parentElement;
            if (!container || container.id === 'html-layer') return;
            if (container.id && container.id.startsWith('button-')) return; // Ya cargado
            
            const style = container.style;
            const element = {
                id: container.id || `button-${Date.now()}-${index}`,
                type: 'button',
                x: parseInt(style.left) || 0,
                y: parseInt(style.top) || 0,
                width: parseInt(style.width) || 200,
                height: parseInt(style.height) || 50,
                domElement: container,
                text: btn.textContent || 'BOTÓN',
                url: btn.href || '#',
                bgColor: btn.style.background || '#FFD700'
            };
            if (!container.id) container.id = element.id;
            this.htmlElements.push(element);
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
    }
    
    setupUI() {
        const editorUI = document.createElement('div');
        editorUI.id = 'html-editor-ui';
        editorUI.innerHTML = `
            <div class="editor-panel">
                <h3>🌐 HTML Editor</h3>
                
                <div class="editor-section">
                    <label>Modo:</label>
                    <select id="html-editor-mode">
                        <option value="text-block">📝 Bloque de Texto</option>
                        <option value="image">🖼️ Imagen</option>
                        <option value="logo">🎯 Logo/Icono</option>
                        <option value="button">🔘 Botón</option>
                        <option value="custom">⚙️ HTML Personalizado</option>
                    </select>
                </div>
                
                <div class="editor-section">
                    <button id="html-add-item" class="editor-btn">➕ Agregar</button>
                    <button id="html-delete-item" class="editor-btn">🗑️ Eliminar</button>
                </div>
                
                <div class="editor-section" id="html-selected-props" style="display: none;">
                    <h4 style="color: #FFD700; margin: 0 0 10px 0;">📍 Propiedades</h4>
                    <label>X:</label>
                    <input type="number" id="html-edit-x" step="25">
                    <label>Y:</label>
                    <input type="number" id="html-edit-y" step="25">
                    <label>Ancho:</label>
                    <input type="number" id="html-edit-width" step="25">
                    <label>Alto:</label>
                    <input type="number" id="html-edit-height" step="25">
                    <button id="html-apply-props" class="editor-btn-primary">✓ Aplicar Cambios</button>
                </div>
                
                <div class="editor-section" id="text-block-props" style="display: block;">
                    <h4 style="color: #aaa; margin: 0 0 10px 0;">Nuevos Bloques de Texto:</h4>
                    <label>Ancho:</label>
                    <input type="number" id="text-block-width" value="350" step="25">
                    <label>Alto:</label>
                    <input type="number" id="text-block-height" value="200" step="25">
                    <label>Título:</label>
                    <input type="text" id="text-block-title" value="UN BUEN TITULO" placeholder="Título...">
                    <label>Contenido:</label>
                    <textarea id="text-block-content" rows="3" placeholder="Escribe el contenido aquí...">In eget sapien vitae massa rhoncus lacinia. Nullam at leo nec metus aliquam semper.</textarea>
                </div>
                
                <div class="editor-section" id="image-props" style="display: none;">
                    <h4 style="color: #aaa; margin: 0 0 10px 0;">Nuevas Imágenes:</h4>
                    <label>Ancho:</label>
                    <input type="number" id="image-width" value="400" step="25">
                    <label>Alto:</label>
                    <input type="number" id="image-height" value="300" step="25">
                    <label>URL de la imagen:</label>
                    <input type="text" id="image-url" value="https://via.placeholder.com/400x300" placeholder="URL de la imagen">
                    <label>Texto alternativo:</label>
                    <input type="text" id="image-alt" value="Imagen descriptiva" placeholder="Alt text">
                </div>
                
                <div class="editor-section" id="logo-props" style="display: none;">
                    <h4 style="color: #aaa; margin: 0 0 10px 0;">Nuevo Logo/Icono:</h4>
                    <label>Ancho:</label>
                    <input type="number" id="logo-width" value="200" step="25">
                    <label>Alto:</label>
                    <input type="number" id="logo-height" value="200" step="25">
                    <label>Emoji/Icono:</label>
                    <input type="text" id="logo-icon" value="🎮" placeholder="🎮">
                    <label>Texto:</label>
                    <input type="text" id="logo-text" value="TUKAN" placeholder="Texto del logo">
                    <label>Subtítulo:</label>
                    <input type="text" id="logo-subtitle" value="MEDIA TECH" placeholder="Subtítulo">
                </div>
                
                <div class="editor-section" id="button-props" style="display: none;">
                    <h4 style="color: #aaa; margin: 0 0 10px 0;">Nuevo Botón:</h4>
                    <label>Ancho:</label>
                    <input type="number" id="button-width" value="200" step="25">
                    <label>Alto:</label>
                    <input type="number" id="button-height" value="50" step="25">
                    <label>Texto del botón:</label>
                    <input type="text" id="button-text" value="NEXT LEVEL →" placeholder="Texto...">
                    <label>URL destino:</label>
                    <input type="text" id="button-url" value="./nivel-2.html" placeholder="URL o #">
                    <label>Color de fondo:</label>
                    <input type="color" id="button-bg-color" value="#FFD700">
                </div>
                
                <div class="editor-section" id="custom-props" style="display: none;">
                    <h4 style="color: #aaa; margin: 0 0 10px 0;">HTML Personalizado:</h4>
                    <label>Ancho:</label>
                    <input type="number" id="custom-width" value="400" step="25">
                    <label>Alto:</label>
                    <input type="number" id="custom-height" value="300" step="25">
                    <label>HTML:</label>
                    <textarea id="custom-html" rows="4" placeholder="<div>Tu HTML aquí...</div>"></textarea>
                </div>
                
                <div class="editor-section">
                    <label>
                        <input type="checkbox" id="html-snap-to-grid" checked>
                        Ajustar a cuadrícula (${this.gridSize}px)
                    </label>
                </div>
                
                <div class="editor-section">
                    <button id="html-export" class="editor-btn-primary">📦 Exportar HTML</button>
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
        document.getElementById('html-editor-mode').addEventListener('change', (e) => {
            this.mode = e.target.value;
            this.updateModeUI();
        });
        
        document.getElementById('html-add-item').addEventListener('click', () => this.addItem());
        document.getElementById('html-delete-item').addEventListener('click', () => this.deleteItem());
        document.getElementById('html-export').addEventListener('click', () => this.exportHTML());
        document.getElementById('html-apply-props').addEventListener('click', () => this.applyProperties());
    }
    
    updateModeUI() {
        document.getElementById('text-block-props').style.display = 
            this.mode === 'text-block' ? 'block' : 'none';
        document.getElementById('image-props').style.display = 
            this.mode === 'image' ? 'block' : 'none';
        document.getElementById('logo-props').style.display = 
            this.mode === 'logo' ? 'block' : 'none';
        document.getElementById('button-props').style.display = 
            this.mode === 'button' ? 'block' : 'none';
        document.getElementById('custom-props').style.display = 
            this.mode === 'custom' ? 'block' : 'none';
    }
    
    setupMouseEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top + this.camera.y;
        
        if (document.getElementById('html-snap-to-grid').checked) {
            x = Math.round(x / this.gridSize) * this.gridSize;
            y = Math.round(y / this.gridSize) * this.gridSize;
        }
        
        return { x, y };
    }
    
    onMouseDown(e) {
        if (!this.active) return;
        
        const pos = this.getMousePos(e);
        this.dragStart = pos;
        
        // Buscar elemento HTML en la posición del click
        const clicked = this.htmlElements.find(el => 
            pos.x >= el.x && pos.x <= el.x + el.width &&
            pos.y >= el.y && pos.y <= el.y + el.height
        );
        
        if (clicked) {
            this.selectedItem = clicked;
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
        
        if (this.resizing) {
            // Redimensionar
            this.selectedItem.width = Math.max(50, this.selectedItem.width + dx);
            this.selectedItem.height = Math.max(50, this.selectedItem.height + dy);
        } else {
            // Mover
            this.selectedItem.x += dx;
            this.selectedItem.y += dy;
        }
        
        this.dragStart = pos;
        this.updateDOMElement(this.selectedItem);
        this.updatePropertiesPanel();
        this.draw();
    }
    
    onMouseUp(e) {
        this.dragging = false;
        this.resizing = false;
    }
    
    addItem() {
        const centerX = GAME_WIDTH / 2;
        const centerY = this.camera.y + GAME_HEIGHT / 2;
        
        let element = null;
        
        if (this.mode === 'text-block') {
            const width = parseInt(document.getElementById('text-block-width').value);
            const height = parseInt(document.getElementById('text-block-height').value);
            const title = document.getElementById('text-block-title').value;
            const content = document.getElementById('text-block-content').value;
            
            element = {
                id: `text-block-${Date.now()}`,
                type: 'text-block',
                x: centerX - width/2,
                y: centerY - height/2,
                width: width,
                height: height,
                title: title,
                content: content
            };
            
        } else if (this.mode === 'image') {
            const width = parseInt(document.getElementById('image-width').value);
            const height = parseInt(document.getElementById('image-height').value);
            const url = document.getElementById('image-url').value;
            const alt = document.getElementById('image-alt').value;
            
            element = {
                id: `image-${Date.now()}`,
                type: 'image',
                x: centerX - width/2,
                y: centerY - height/2,
                width: width,
                height: height,
                url: url,
                alt: alt
            };
            
        } else if (this.mode === 'logo') {
            const width = parseInt(document.getElementById('logo-width').value);
            const height = parseInt(document.getElementById('logo-height').value);
            const icon = document.getElementById('logo-icon').value;
            const text = document.getElementById('logo-text').value;
            const subtitle = document.getElementById('logo-subtitle').value;
            
            element = {
                id: `logo-${Date.now()}`,
                type: 'logo',
                x: centerX - width/2,
                y: centerY - height/2,
                width: width,
                height: height,
                icon: icon,
                text: text,
                subtitle: subtitle
            };
            
        } else if (this.mode === 'button') {
            const width = parseInt(document.getElementById('button-width').value);
            const height = parseInt(document.getElementById('button-height').value);
            const text = document.getElementById('button-text').value;
            const url = document.getElementById('button-url').value;
            const bgColor = document.getElementById('button-bg-color').value;
            
            element = {
                id: `button-${Date.now()}`,
                type: 'button',
                x: centerX - width/2,
                y: centerY - height/2,
                width: width,
                height: height,
                text: text,
                url: url,
                bgColor: bgColor
            };
            
        } else if (this.mode === 'custom') {
            const width = parseInt(document.getElementById('custom-width').value);
            const height = parseInt(document.getElementById('custom-height').value);
            const html = document.getElementById('custom-html').value;
            
            element = {
                id: `custom-${Date.now()}`,
                type: 'custom',
                x: centerX - width/2,
                y: centerY - height/2,
                width: width,
                height: height,
                html: html
            };
        }
        
        if (element) {
            this.htmlElements.push(element);
            this.createDOMElement(element);
            this.draw();
        }
    }
    
    createDOMElement(element) {
        const htmlLayer = document.getElementById('html-layer');
        if (!htmlLayer) return;
        
        let domElement = document.createElement('div');
        domElement.id = element.id;
        domElement.style.position = 'absolute';
        domElement.style.left = element.x + 'px';
        domElement.style.top = element.y + 'px';
        domElement.style.width = element.width + 'px';
        domElement.style.height = element.height + 'px';
        
        if (element.type === 'text-block') {
            domElement.className = 'text-block';
            domElement.innerHTML = `
                <h2>${element.title}</h2>
                <p>${element.content}</p>
            `;
        } else if (element.type === 'image') {
            domElement.innerHTML = `<img src="${element.url}" alt="${element.alt}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else if (element.type === 'logo') {
            domElement.className = 'logo-tukan';
            domElement.innerHTML = `
                <div style="font-size: ${element.height * 0.3}px; font-weight: bold; text-align: center;">
                    <div style="color: #FFD700;">${element.icon}</div>
                    <div style="font-family: Impact, sans-serif; color: #000;">${element.text}</div>
                    <div style="font-size: ${element.height * 0.1}px; color: #666;">${element.subtitle}</div>
                </div>
            `;
        } else if (element.type === 'button') {
            domElement.innerHTML = `
                <a href="${element.url}" style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    background: ${element.bgColor};
                    color: #000;
                    text-decoration: none;
                    font-weight: bold;
                    font-family: Impact, sans-serif;
                    font-size: ${element.height * 0.4}px;
                    border: 3px solid #000;
                    box-shadow: 5px 5px 0px rgba(0,0,0,0.2);
                ">${element.text}</a>
            `;
        } else if (element.type === 'custom') {
            domElement.innerHTML = element.html;
        }
        
        htmlLayer.appendChild(domElement);
        element.domElement = domElement;
    }
    
    updateDOMElement(element) {
        if (!element.domElement) return;
        
        element.domElement.style.left = element.x + 'px';
        element.domElement.style.top = element.y + 'px';
        element.domElement.style.width = element.width + 'px';
        element.domElement.style.height = element.height + 'px';
    }
    
    deleteItem() {
        if (!this.selectedItem) {
            alert('Selecciona un elemento primero');
            return;
        }
        
        // Eliminar del DOM
        if (this.selectedItem.domElement) {
            this.selectedItem.domElement.remove();
        }
        
        // Eliminar del array
        const index = this.htmlElements.indexOf(this.selectedItem);
        if (index > -1) this.htmlElements.splice(index, 1);
        
        this.selectedItem = null;
        this.hidePropertiesPanel();
        this.draw();
    }
    
    updatePropertiesPanel() {
        if (!this.selectedItem) return;
        
        const panel = document.getElementById('html-selected-props');
        panel.style.display = 'block';
        
        document.getElementById('html-edit-x').value = Math.round(this.selectedItem.x);
        document.getElementById('html-edit-y').value = Math.round(this.selectedItem.y);
        document.getElementById('html-edit-width').value = Math.round(this.selectedItem.width);
        document.getElementById('html-edit-height').value = Math.round(this.selectedItem.height);
    }
    
    hidePropertiesPanel() {
        document.getElementById('html-selected-props').style.display = 'none';
    }
    
    applyProperties() {
        if (!this.selectedItem) return;
        
        this.selectedItem.x = parseFloat(document.getElementById('html-edit-x').value);
        this.selectedItem.y = parseFloat(document.getElementById('html-edit-y').value);
        this.selectedItem.width = parseFloat(document.getElementById('html-edit-width').value);
        this.selectedItem.height = parseFloat(document.getElementById('html-edit-height').value);
        
        this.updateDOMElement(this.selectedItem);
        this.draw();
    }
    
    draw() {
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
        this.ctx.strokeStyle = 'rgba(0, 217, 255, 0.3)';
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
        
        // Dibujar elementos HTML (contornos)
        this.htmlElements.forEach(element => {
            const isSelected = this.selectedItem === element;
            
            // Contorno del elemento
            this.ctx.strokeStyle = isSelected ? '#FFD700' : '#00d9ff';
            this.ctx.lineWidth = isSelected ? 4 : 2;
            this.ctx.setLineDash(isSelected ? [] : [10, 5]);
            this.ctx.strokeRect(element.x, element.y, element.width, element.height);
            this.ctx.setLineDash([]);
            
            // Etiqueta de tipo
            this.ctx.fillStyle = isSelected ? '#FFD700' : '#00d9ff';
            this.ctx.font = '14px Arial';
            this.ctx.fillText(element.type, element.x + 5, element.y - 5);
            
            // Dimensiones
            if (isSelected) {
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '12px Arial';
                this.ctx.fillText(
                    `${element.width}x${element.height}`,
                    element.x + 5,
                    element.y + element.height - 5
                );
            }
        });
        
        this.ctx.restore();
        
        // Indicador de altura
        this.ctx.fillStyle = 'rgba(0, 217, 255, 0.7)';
        this.ctx.font = '14px Arial';
        const heightText = `Altura: ${Math.round(WORLD_HEIGHT - this.camera.y)}px / ${WORLD_HEIGHT}px`;
        this.ctx.fillText(heightText, 10, 20);
        
        if (this.active) {
            requestAnimationFrame(() => this.draw());
        }
    }
    
    exportHTML() {
        const html = [];
        
        this.htmlElements.forEach(el => {
            if (el.type === 'text-block') {
                html.push(`
<div class="text-block" style="position: absolute; top: ${el.y}px; left: ${el.x}px; width: ${el.width}px; height: ${el.height}px;">
    <h2>${el.title}</h2>
    <p>${el.content}</p>
</div>`);
            } else if (el.type === 'image') {
                html.push(`
<img src="${el.url}" alt="${el.alt}" style="position: absolute; top: ${el.y}px; left: ${el.x}px; width: ${el.width}px; height: ${el.height}px;">`);
            } else if (el.type === 'logo') {
                html.push(`
<div class="logo-tukan" style="position: absolute; top: ${el.y}px; left: ${el.x}px; width: ${el.width}px; height: ${el.height}px;">
    <div style="font-size: ${el.height * 0.3}px; font-weight: bold; text-align: center;">
        <div style="color: #FFD700;">${el.icon}</div>
        <div style="font-family: Impact, sans-serif; color: #000;">${el.text}</div>
        <div style="font-size: ${el.height * 0.1}px; color: #666;">${el.subtitle}</div>
    </div>
</div>`);
            } else if (el.type === 'button') {
                html.push(`
<div style="position: absolute; top: ${el.y}px; left: ${el.x}px; width: ${el.width}px; height: ${el.height}px;">
    <a href="${el.url}" style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: ${el.bgColor}; color: #000; text-decoration: none; font-weight: bold; font-family: Impact, sans-serif; font-size: ${el.height * 0.4}px; border: 3px solid #000; box-shadow: 5px 5px 0px rgba(0,0,0,0.2);">${el.text}</a>
</div>`);
            } else if (el.type === 'custom') {
                html.push(`
<div style="position: absolute; top: ${el.y}px; left: ${el.x}px; width: ${el.width}px; height: ${el.height}px;">
    ${el.html}
</div>`);
            }
        });
        
        const output = html.join('\n');
        
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
            <h2 style="color: #00d9ff; margin-top: 0;">📦 Código HTML Generado</h2>
            <p style="color: #aaa;">Copia este código y pégalo dentro del <code>&lt;div id="html-layer"&gt;</code></p>
            <textarea readonly style="
                width: 100%;
                height: 400px;
                background: #2d2d2d;
                color: #0f0;
                border: 1px solid #444;
                padding: 15px;
                font-family: monospace;
                font-size: 12px;
            ">${output}</textarea>
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
        
        console.log('HTML exportado:', output);
    }
    
    toggle() {
        this.active = !this.active;
        const ui = document.getElementById('html-editor-ui');
        const instructions = document.querySelector('.instructions');
        const hud = document.querySelector('.hud');
        const htmlLayer = document.getElementById('html-layer');
        
        if (this.active) {
            ui.style.display = 'block';
            if (instructions) instructions.style.display = 'none';
            if (hud) hud.style.display = 'none';
            this.draw();
        } else {
            ui.style.display = 'none';
            if (instructions) instructions.style.display = 'block';
            if (hud) hud.style.display = 'flex';
            
            // Restaurar la sincronización del HTML con el juego
            // La cámara del juego se encargará de actualizar la posición
            if (htmlLayer && window.game) {
                // El juego retomará el control del scroll
            }
        }
    }
}

// Crear instancia global del editor HTML
window.htmlEditor = new HTMLEditor();

// Activar con tecla W
window.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'W') {
        window.htmlEditor.toggle();
    }
});
