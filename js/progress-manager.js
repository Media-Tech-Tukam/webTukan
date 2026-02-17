// Sistema global de progreso para Tukan
export class ProgressManager {
    constructor(levelId) {
        this.levelId = levelId; // ej: 'nivel-1', 'tutorial', 'nivel-final'
        this.storageKey = 'tukan_game_progress';
        this.loadProgress();
    }
    
    // Cargar progreso completo
    loadProgress() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            this.data = JSON.parse(saved);
        } else {
            this.data = this.createEmpty();
        }
        
        // Asegurar que existe el nivel actual
        if (!this.data[this.levelId]) {
            this.data[this.levelId] = {
                visitedSections: [],
                completed: false,
                timeSpent: 0,
                deaths: 0,
                startTime: Date.now()
            };
        } else {
            // Actualizar startTime para esta sesión
            this.data[this.levelId].startTime = Date.now();
        }
    }
    
    // Crear estructura vacía
    createEmpty() {
        return {
            totalSectionsVisited: 0,
            totalLevelsCompleted: 0,
            totalTimeSpent: 0,
            totalDeaths: 0,
            achievements: [],
            lastLevel: this.levelId,
            lastPlayed: new Date().toISOString()
        };
    }
    
    // Guardar progreso
    save() {
        this.data.lastLevel = this.levelId;
        this.data.lastPlayed = new Date().toISOString();
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }
    
    // Marcar sección visitada
    visitSection(sectionId) {
        const level = this.data[this.levelId];
        if (!level.visitedSections.includes(sectionId)) {
            level.visitedSections.push(sectionId);
            this.data.totalSectionsVisited++;
            this.save();
            return true; // Nueva sección
        }
        return false; // Ya visitada
    }
    
    // Obtener secciones visitadas del nivel actual
    getVisitedSections() {
        return this.data[this.levelId].visitedSections;
    }
    
    // Verificar si una sección ya fue visitada
    isSectionVisited(sectionId) {
        return this.data[this.levelId].visitedSections.includes(sectionId);
    }
    
    // Completar nivel
    completeLevel() {
        const level = this.data[this.levelId];
        if (!level.completed) {
            level.completed = true;
            this.data.totalLevelsCompleted++;
            
            // Calcular tiempo de esta sesión
            const sessionTime = Math.floor((Date.now() - level.startTime) / 1000);
            level.timeSpent += sessionTime;
            this.data.totalTimeSpent += sessionTime;
            
            this.save();
            return true; // Recién completado
        }
        return false; // Ya estaba completado
    }
    
    // Verificar si el nivel está completado
    isLevelCompleted() {
        return this.data[this.levelId].completed;
    }
    
    // Verificar si nivel específico está completo
    isOtherLevelCompleted(levelId) {
        return this.data[levelId] && this.data[levelId].completed;
    }
    
    // Verificar si TODOS los niveles están completos
    areAllLevelsCompleted() {
        const levelIds = Object.keys(this.data).filter(k => 
            k !== 'totalSectionsVisited' && 
            k !== 'totalLevelsCompleted' &&
            k !== 'totalTimeSpent' &&
            k !== 'totalDeaths' &&
            k !== 'achievements' &&
            k !== 'lastLevel' &&
            k !== 'lastPlayed'
        );
        
        return levelIds.length > 0 && levelIds.every(levelId => this.data[levelId].completed);
    }
    
    // Registrar muerte
    recordDeath() {
        this.data[this.levelId].deaths++;
        this.data.totalDeaths++;
        this.save();
    }
    
    // Desbloquear logro
    unlockAchievement(achievementId) {
        if (!this.data.achievements.includes(achievementId)) {
            this.data.achievements.push(achievementId);
            this.save();
            return true; // Nuevo logro
        }
        return false; // Ya desbloqueado
    }
    
    // Verificar si tiene un logro
    hasAchievement(achievementId) {
        return this.data.achievements.includes(achievementId);
    }
    
    // Reset de nivel específico
    resetLevel(levelId = this.levelId) {
        if (this.data[levelId]) {
            this.data[levelId] = {
                visitedSections: [],
                completed: false,
                timeSpent: 0,
                deaths: 0,
                startTime: Date.now()
            };
            this.save();
        }
    }
    
    // Reset total (borrar todo)
    resetAll() {
        if (confirm('¿Estás seguro? Se borrará TODO el progreso guardado.')) {
            localStorage.removeItem(this.storageKey);
            this.data = this.createEmpty();
            window.location.reload();
        }
    }
    
    // Obtener estadísticas globales
    getGlobalStats() {
        return {
            totalSections: this.data.totalSectionsVisited,
            totalLevels: this.data.totalLevelsCompleted,
            totalTime: this.data.totalTimeSpent,
            totalDeaths: this.data.totalDeaths,
            achievements: this.data.achievements.length
        };
    }
    
    // Obtener estadísticas del nivel actual
    getLevelStats() {
        return {
            visitedSections: this.data[this.levelId].visitedSections.length,
            completed: this.data[this.levelId].completed,
            timeSpent: this.data[this.levelId].timeSpent,
            deaths: this.data[this.levelId].deaths
        };
    }
    
    // Formatear tiempo en minutos:segundos
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}
