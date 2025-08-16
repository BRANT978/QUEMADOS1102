// Inicialización de AOS (Animate On Scroll)
AOS.init({
    duration: 1000,
    easing: 'ease-in-out',
    once: true,
    mirror: false
});

// Navegación suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navegación móvil
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Cambiar estilo de navegación al hacer scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Contador regresivo para el próximo partido
function updateCountdown() {
    const now = new Date().getTime();
    const matchDate = new Date('2024-11-15T15:00:00').getTime();
    const distance = matchDate - now;

    if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    } else {
        document.getElementById('countdown').innerHTML = '<p>¡El partido está en curso!</p>';
    }
}

// Actualizar contador cada segundo
setInterval(updateCountdown, 1000);
updateCountdown();

// Navegación del calendario
let currentWeek = 1;
const totalWeeks = 2;

function updateCalendar() {
    const weekTitle = document.getElementById('currentWeek');
    if (weekTitle) {
        weekTitle.textContent = `Semana ${currentWeek}`;
    }
}

document.getElementById('prevWeek')?.addEventListener('click', () => {
    if (currentWeek > 1) {
        currentWeek--;
        updateCalendar();
    }
});

document.getElementById('nextWeek')?.addEventListener('click', () => {
    if (currentWeek < totalWeeks) {
        currentWeek++;
        updateCalendar();
    }
});

// Efectos de hover para las tarjetas de equipos
document.querySelectorAll('.team-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Animación de números para estadísticas
function animateNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.textContent);
        let current = 0;
        const increment = target / 50;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current);
        }, 30);
    });
}

// Observador de intersección para animar números cuando sean visibles
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateNumbers();
            observer.unobserve(entry.target);
        }
    });
});

const statsSection = document.querySelector('.stats-grid');
if (statsSection) {
    observer.observe(statsSection);
}

// Efectos de partículas flotantes
function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: rgba(255, 107, 53, 0.6);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1;
        left: ${Math.random() * window.innerWidth}px;
        top: ${window.innerHeight + 10}px;
        animation: float-up 8s linear infinite;
    `;
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
        particle.remove();
    }, 8000);
}

// Crear partículas cada 2 segundos
setInterval(createParticle, 2000);

// Agregar estilos CSS para las partículas
const style = document.createElement('style');
style.textContent = `
    @keyframes float-up {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
    
    .particle {
        animation: float-up 8s linear infinite;
    }
`;
document.head.appendChild(style);

// Efecto de typing para el título principal
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Aplicar efecto de typing al título cuando la página cargue
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 80);
    }
});

// Efectos de parallax suave
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-elements');
    
    parallaxElements.forEach(element => {
        const speed = 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Modal para información detallada de equipos
function createTeamModal() {
    const modal = document.createElement('div');
    modal.className = 'team-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="
            background: white;
            padding: 2rem;
            border-radius: 20px;
            max-width: 500px;
            width: 90%;
            position: relative;
        ">
            <button class="modal-close" style="
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #666;
            ">&times;</button>
            <div class="modal-body"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cerrar modal
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    return modal;
}

const teamModal = createTeamModal();

// Agregar click a las tarjetas de equipos para mostrar modal
document.querySelectorAll('.team-card').forEach(card => {
    card.addEventListener('click', () => {
        const teamName = card.querySelector('h3').textContent;
        const teamDesc = card.querySelector('p').textContent;
        
        teamModal.querySelector('.modal-body').innerHTML = `
            <h2>${teamName}</h2>
            <p>${teamDesc}</p>
            <div style="margin-top: 1rem;">
                <h3>Jugadores:</h3>
                <ul>
                    <li>Capitán: [Nombre del Capitán]</li>
                    <li>Jugador 1: [Nombre]</li>
                    <li>Jugador 2: [Nombre]</li>
                    <li>Jugador 3: [Nombre]</li>
                    <li>Jugador 4: [Nombre]</li>
                    <li>Jugador 5: [Nombre]</li>
                </ul>
            </div>
        `;
        
        teamModal.style.display = 'flex';
    });
});

// Efecto de carga de página
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Notificaciones toast
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#ff6b35'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Ejemplo de uso de toast (puedes activarlo con eventos específicos)
// showToast('¡Bienvenido al torneo de deporte quemados!', 'success');

// Efectos de sonido (opcional)
function playSound(type) {
    // Aquí podrías agregar efectos de sonido
    console.log(`Playing ${type} sound`);
}

// Agregar efectos de sonido a botones
document.querySelectorAll('button, .cta-button').forEach(button => {
    button.addEventListener('click', () => {
        playSound('click');
    });
});

// Función para actualizar estadísticas en tiempo real
function updateStats() {
    // Simular actualización de estadísticas
    const stats = {
        matchesPlayed: Math.floor(Math.random() * 30) + 20,
        goalsScored: Math.floor(Math.random() * 200) + 100,
        players: 48,
        teams: 8
    };
    
    // Actualizar números en la página
    const statElements = document.querySelectorAll('.stat-number');
    if (statElements.length >= 4) {
        statElements[0].textContent = stats.matchesPlayed;
        statElements[1].textContent = stats.goalsScored;
        statElements[2].textContent = stats.players;
        statElements[3].textContent = stats.teams;
    }
}

// Actualizar estadísticas cada 30 segundos
setInterval(updateStats, 30000);

// Efecto de scroll suave para el botón "Ver Equipos"
document.querySelector('.cta-button')?.addEventListener('click', (e) => {
    e.preventDefault();
    const teamsSection = document.querySelector('#equipos');
    if (teamsSection) {
        teamsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
});

// Función para cambiar tema (claro/oscuro)
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

// Cargar tema guardado
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
}

// Agregar botón de cambio de tema (opcional)
const themeButton = document.createElement('button');
themeButton.innerHTML = '<i class="fas fa-moon"></i>';
themeButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #ff6b35;
    color: white;
    border: none;
    cursor: pointer;
    z-index: 1000;
    box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
    transition: all 0.3s ease;
`;

themeButton.addEventListener('click', toggleTheme);
document.body.appendChild(themeButton);

// Estilos para tema oscuro
const darkThemeStyles = `
    .dark-theme {
        background: #1a1a1a;
        color: #ffffff;
    }
    
    .dark-theme .navbar {
        background: rgba(26, 26, 26, 0.95);
    }
    
    .dark-theme .team-card,
    .dark-theme .match-card,
    .dark-theme .control-card {
        background: #2d2d2d;
        color: #ffffff;
    }
    
    .dark-theme .section-title {
        color: #ffffff;
    }
`;

const darkStyle = document.createElement('style');
darkStyle.textContent = darkThemeStyles;
document.head.appendChild(darkStyle);

console.log('🎯 Torneo Deporte Quemados 1102 - Página cargada exitosamente!'); 