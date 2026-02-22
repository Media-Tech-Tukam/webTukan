// Contenido de los modales
export const modalContent = {
    inicio: {
        title: 'Bienvenido a Tukan',
        html: `
            <p>Somos <strong>diseñadores de experiencias gamificadas</strong> para empresas que quieren destacar en eventos y ferias.</p>
            
            <p style="margin-top: 15px;">Transformamos mensajes corporativos en <strong>juegos interactivos</strong> que enganchan, entretienen y comunican de forma memorable.</p>
            
            <h3>¿Por qué gamificar tu evento?</h3>
            <ul>
                <li>Mayor engagement con tu audiencia</li>
                <li>Mensajes memorables y divertidos</li>
                <li>Datos y métricas de participación</li>
                <li>Experiencia única que diferencia tu marca</li>
            </ul>
        `
    },
    
    servicios: {
        title: 'Nuestros Servicios',
        html: `
            <h3>🎮 Diseño de Juegos para Eventos</h3>
            <p>Creamos juegos personalizados que transmiten el mensaje de tu empresa de forma divertida y efectiva.</p>
            
            <h3>🎨 Diseño y Concept Art</h3>
            <p>Desarrollo visual completo: desde los primeros bocetos hasta el arte final que da vida a tu proyecto.</p>
            
            <h3>🗿 Modelado 3D y Escultura Digital</h3>
            <p>Personajes, props, escenarios y assets 3D optimizados para videojuegos y experiencias interactivas.</p>
            
            <h3>📱 Desarrollo de Experiencias Interactivas</h3>
            <p>Aplicaciones web y móviles con mecánicas de juego para ferias, stands y activaciones de marca.</p>
            
            <h3>🎯 Consultoría en Gamificación</h3>
            <p>Te ayudamos a definir la mejor estrategia de gamificación para tus objetivos de negocio.</p>
        `
    },
    
    portafolio: {
        title: 'Portafolio de Juegos',
        html: `
            <p>Explora algunos de nuestros proyectos más exitosos:</p>
            
            <div class="game-grid">
                <div class="game-card">
                    <h4>🏭 Factory Challenge</h4>
                    <p>Juego de gestión para evento industrial. +500 jugadores en 3 días.</p>
                </div>
                <div class="game-card">
                    <h4>🌱 Eco Quest</h4>
                    <p>Aventura educativa sobre sostenibilidad para feria ambiental.</p>
                </div>
                <div class="game-card">
                    <h4>💡 Innovation Race</h4>
                    <p>Competencia por equipos para congreso tech de startup.</p>
                </div>
                <div class="game-card">
                    <h4>🏆 Brand Champions</h4>
                    <p>Trivia gamificada con realidad aumentada para lanzamiento de producto.</p>
                </div>
                <div class="game-card">
                    <h4>🎪 Carnival Spin</h4>
                    <p>Ruleta interactiva con premios para stand en exposición.</p>
                </div>
                <div class="game-card">
                    <h4>🚀 Space Mission</h4>
                    <p>Simulador espacial educativo para museo de ciencias.</p>
                </div>
            </div>
        `
    },
    
    nosotros: {
        title: 'Sobre Tukan',
        html: `
            <p style="font-size: 18px; line-height: 1.6;">Somos un equipo multidisciplinario de <strong>diseñadores, artistas 3D y desarrolladores</strong> apasionados por crear experiencias que combinan arte, tecnología y diversión.</p>
            
            <h3>Nuestra Filosofía</h3>
            <p>Creemos que el juego es la forma más natural y efectiva de aprender, conectar y comunicar. Por eso convertimos conceptos complejos en experiencias simples y memorables.</p>
            
            <h3>¿Qué nos hace diferentes?</h3>
            <ul>
                <li><strong>Enfoque estratégico:</strong> Cada juego está diseñado para cumplir objetivos específicos</li>
                <li><strong>Calidad artística:</strong> Nuestro equipo de artistas crea mundos visuales únicos</li>
                <li><strong>Expertise técnico:</strong> Desarrollamos en múltiples plataformas y tecnologías</li>
                <li><strong>Adaptabilidad:</strong> Desde mini-games hasta experiencias complejas</li>
            </ul>
            
            <h3>Nuestro Proceso</h3>
            <ul>
                <li>📋 Consulta y definición de objetivos</li>
                <li>🎨 Concept art y diseño de mecánicas</li>
                <li>⚙️ Desarrollo y testing</li>
                <li>🚀 Implementación en tu evento</li>
                <li>📊 Análisis de resultados y métricas</li>
            </ul>
        `
    },
    
    contacto: {
        title: 'Contáctanos',
        html: `
            <p style="font-size: 16px; margin-bottom: 20px;">¿Tienes un evento próximo? ¿Una idea que quieres gamificar? ¡Hablemos!</p>
            
            <form class="contact-form" onsubmit="return handleSubmit(event)">
                <input type="text" placeholder="Tu nombre" required>
                <input type="email" placeholder="Email" required>
                <input type="text" placeholder="Empresa">
                <textarea rows="4" placeholder="Cuéntanos sobre tu proyecto o evento..." required></textarea>
                <button type="submit" class="btn-primary">Enviar Mensaje</button>
            </form>
            
            <div style="margin-top: 25px; padding-top: 25px; border-top: 1px solid #444;">
                <h3>Otras formas de contacto</h3>
                <p>📱 WhatsApp: +57 XXX XXX XXXX</p>
                <p>📧 Email: hola@tukan.games</p>
                <p>🌐 Web: www.tukan.games</p>
                <p>📍 Ubicación: Tu ciudad, País</p>
            </div>
        `
    }
};
