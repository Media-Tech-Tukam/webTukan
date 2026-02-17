// Sistema de animación de sprites
export class SpriteAnimator {
    constructor(imagePath, frameWidth, frameHeight) {
        this.frameWidth = frameWidth;   // 75px
        this.frameHeight = frameHeight; // 75px
        this.image = new Image();
        this.image.src = imagePath;
        this.loaded = false;
        
        this.image.onload = () => {
            this.loaded = true;
            console.log('✅ Sprite sheet cargado:', imagePath);
        };
        
        this.image.onerror = () => {
            console.error('❌ Error cargando sprite sheet:', imagePath);
        };
        
        // Configuración de animaciones
        // Cada animación: { row: fila, frames: cantidad, speed: ms por frame, loop: repetir }
        this.animations = {
            idle: {
                row: 0,
                frames: 6,
                speed: 150,
                loop: true
            },
            run: {
                row: 1,
                frames: 6,
                speed: 80,
                loop: true
            },
            jump: {
                row: 2,
                frames: 6,
                speed: 60,
                loop: false
            },
            climb: {
                row: 3,
                frames: 6,
                speed: 100,
                loop: true
            },
            fall: {
                row: 4,
                frames: 6,
                speed: 100,
                loop: true
            },
            land: {
                row: 5,
                frames: 6,
                speed: 50,
                loop: false
            }
        };
        
        this.currentAnim = 'idle';
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.animationComplete = false;
    }
    
    setAnimation(name) {
        if (!this.animations[name]) {
            console.warn('Animación no encontrada:', name);
            return;
        }
        
        if (this.currentAnim !== name) {
            this.currentAnim = name;
            this.currentFrame = 0;
            this.frameTimer = 0;
            this.animationComplete = false;
        }
    }
    
    update(deltaTime) {
        if (!this.loaded) return;
        
        const anim = this.animations[this.currentAnim];
        this.frameTimer += deltaTime;
        
        if (this.frameTimer >= anim.speed) {
            this.frameTimer = 0;
            this.currentFrame++;
            
            if (this.currentFrame >= anim.frames) {
                if (anim.loop) {
                    this.currentFrame = 0; // Loop
                } else {
                    this.currentFrame = anim.frames - 1; // Quedarse en último frame
                    this.animationComplete = true;
                }
            }
        }
    }
    
    draw(ctx, x, y, facingRight = true) {
        if (!this.loaded) {
            // Dibujar placeholder mientras carga
            this.drawPlaceholder(ctx, x, y);
            return;
        }
        
        const anim = this.animations[this.currentAnim];
        
        // Calcular posición en el sprite sheet
        const srcX = this.currentFrame * this.frameWidth;
        const srcY = anim.row * this.frameHeight;
        
        ctx.save();
        
        // Flip horizontal si mira a la izquierda
        if (!facingRight) {
            ctx.translate(x + this.frameWidth, y);
            ctx.scale(-1, 1);
            ctx.drawImage(
                this.image,
                srcX, srcY,
                this.frameWidth, this.frameHeight,
                0, 0,
                this.frameWidth, this.frameHeight
            );
        } else {
            ctx.drawImage(
                this.image,
                srcX, srcY,
                this.frameWidth, this.frameHeight,
                x, y,
                this.frameWidth, this.frameHeight
            );
        }
        
        ctx.restore();
    }
    
    drawPlaceholder(ctx, x, y) {
        // Dibujar un cuadrado simple mientras carga el sprite
        ctx.fillStyle = '#00d9ff';
        ctx.fillRect(x, y, this.frameWidth, this.frameHeight);
        
        // Ojos
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 20, y + 25, 10, 10);
        ctx.fillRect(x + 45, y + 25, 10, 10);
        
        // Pupilas
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 23, y + 28, 4, 4);
        ctx.fillRect(x + 48, y + 28, 4, 4);
    }
    
    isAnimationComplete() {
        return this.animationComplete;
    }
    
    getCurrentAnimation() {
        return this.currentAnim;
    }
}
