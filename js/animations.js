// Animasyon Yöneticisi
class AnimationManager {
    constructor() {
        this.activeAnimations = new Set();
        this.animationQueue = [];
        this.isPerformanceMode = false;
        
        this.init();
    }
    
    init() {
        this.detectPerformanceCapability();
        this.setupAnimationFrame();
    }
    
    detectPerformanceCapability() {
        // Cihaz performansını tespit et
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        this.isPerformanceMode = !gl || 
                                navigator.hardwareConcurrency < 4 || 
                                navigator.deviceMemory < 4;
        
        if (this.isPerformanceMode) {
            document.body.classList.add('performance-mode');
        }
    }
    
    setupAnimationFrame() {
        const animate = () => {
            this.processAnimationQueue();
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }
    
    processAnimationQueue() {
        if (this.animationQueue.length > 0) {
            const animation = this.animationQueue.shift();
            this.executeAnimation(animation);
        }
    }
    
    executeAnimation(animation) {
        if (typeof animation === 'function') {
            animation();
        }
    }
    
    // Yıldız animasyonları
    createAdvancedStars(container, count = 100) {
        for (let i = 0; i < count; i++) {
            const star = this.createStar();
            this.positionStar(star);
            this.animateStar(star);
            container.appendChild(star);
        }
    }
    
    createStar() {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Rastgele boyut ve parlaklık
        const size = Math.random() * 3 + 1;
        const brightness = Math.random() * 0.8 + 0.2;
        
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.opacity = brightness;
        
        // Rastgele renk tonu
        const hue = Math.random() * 60 + 200; // Mavi-beyaz tonları
        star.style.background = `hsl(${hue}, 100%, 90%)`;
        star.style.boxShadow = `0 0 ${size * 2}px hsl(${hue}, 100%, 90%)`;
        
        return star;
    }
    
    positionStar(star) {
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
    }
    
    animateStar(star) {
        const duration = Math.random() * 3000 + 2000;
        const delay = Math.random() * 2000;
        
        star.style.animationDuration = duration + 'ms';
        star.style.animationDelay = delay + 'ms';
        
        // Rastgele animasyon tipi
        const animations = ['twinkle', 'pulse', 'glow'];
        const animation = animations[Math.floor(Math.random() * animations.length)];
        star.style.animationName = animation;
    }
    
    // Meteor yağmuru
    createMeteorShower(container, intensity = 'normal') {
        const meteorCount = intensity === 'intense' ? 15 : 5;
        const interval = intensity === 'intense' ? 200 : 1000;
        
        for (let i = 0; i < meteorCount; i++) {
            setTimeout(() => {
                this.createMeteor(container);
            }, i * interval);
        }
    }
    
    createMeteor(container) {
        const meteor = document.createElement('div');
        meteor.className = 'meteor';
        
        // Rastgele başlangıç pozisyonu
        const startX = Math.random() * window.innerWidth;
        const startY = -50;
        
        meteor.style.left = startX + 'px';
        meteor.style.top = startY + 'px';
        
        // Rastgele hız ve açı
        const angle = Math.random() * 30 + 15; // 15-45 derece
        const speed = Math.random() * 2 + 1; // 1-3 hız çarpanı
        
        meteor.style.setProperty('--angle', angle + 'deg');
        meteor.style.setProperty('--speed', speed);
        
        // Meteor kuyruğu
        this.createMeteorTail(meteor);
        
        container.appendChild(meteor);
        
        // Animasyon
        this.animateMeteor(meteor);
        
        // Temizlik
        setTimeout(() => {
            if (meteor.parentNode) {
                meteor.parentNode.removeChild(meteor);
            }
        }, 4000);
    }
    
    createMeteorTail(meteor) {
        const tail = document.createElement('div');
        tail.className = 'meteor-tail';
        
        const length = Math.random() * 100 + 50;
        tail.style.width = length + 'px';
        tail.style.height = '2px';
        tail.style.background = 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)';
        tail.style.position = 'absolute';
        tail.style.top = '50%';
        tail.style.left = '-' + length + 'px';
        tail.style.transformOrigin = 'right center';
        
        meteor.appendChild(tail);
    }
    
    animateMeteor(meteor) {
        const duration = Math.random() * 2000 + 2000;
        const endX = Math.random() * window.innerWidth;
        const endY = window.innerHeight + 50;
        
        meteor.animate([
            {
                transform: 'translate(0, 0) rotate(0deg)',
                opacity: 0
            },
            {
                transform: 'translate(0, 0) rotate(0deg)',
                opacity: 1,
                offset: 0.1
            },
            {
                transform: `translate(${endX - parseInt(meteor.style.left)}px, ${endY}px) rotate(45deg)`,
                opacity: 1,
                offset: 0.9
            },
            {
                transform: `translate(${endX - parseInt(meteor.style.left)}px, ${endY}px) rotate(45deg)`,
                opacity: 0
            }
        ], {
            duration: duration,
            easing: 'ease-in'
        });
    }
    
    // Kalp şekli evren animasyonu
    createHeartUniverse(container) {
        const heartUniverse = document.createElement('div');
        heartUniverse.className = 'heart-universe-advanced';
        heartUniverse.id = 'heart-universe-advanced';
        
        // Kalp şekli parçacıkları
        this.createHeartParticles(heartUniverse);
        
        // Kalp çevresi yıldızları
        this.createHeartStars(heartUniverse);
        
        container.appendChild(heartUniverse);
        
        return heartUniverse;
    }
    
    createHeartParticles(heartContainer) {
        const particleCount = this.isPerformanceMode ? 20 : 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'heart-particle';
            
            // Kalp şekli üzerinde pozisyon hesapla
            const t = (i / particleCount) * Math.PI * 2;
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            
            particle.style.left = (50 + x * 3) + '%';
            particle.style.top = (50 + y * 3) + '%';
            
            // Parçacık özellikleri
            const size = Math.random() * 4 + 2;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.background = '#ff6b6b';
            particle.style.borderRadius = '50%';
            particle.style.position = 'absolute';
            particle.style.boxShadow = '0 0 10px #ff6b6b';
            
            // Animasyon
            particle.style.animation = `heartPulse ${Math.random() * 2 + 1}s ease-in-out infinite alternate`;
            particle.style.animationDelay = Math.random() * 2 + 's';
            
            heartContainer.appendChild(particle);
        }
    }
    
    createHeartStars(heartContainer) {
        const starCount = this.isPerformanceMode ? 10 : 30;
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'heart-star';
            
            // Kalp çevresinde rastgele pozisyon
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 100 + 150;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            star.style.left = (50 + x/5) + '%';
            star.style.top = (50 + y/5) + '%';
            
            // Yıldız özellikleri
            const size = Math.random() * 3 + 1;
            star.style.width = size + 'px';
            star.style.height = size + 'px';
            star.style.background = '#fff';
            star.style.borderRadius = '50%';
            star.style.position = 'absolute';
            star.style.boxShadow = '0 0 5px #fff';
            
            // Animasyon
            star.style.animation = `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite alternate`;
            star.style.animationDelay = Math.random() * 3 + 's';
            
            heartContainer.appendChild(star);
        }
    }
    
    // Patlama efekti
    createExplosionEffect(container, x = '50%', y = '50%') {
        const explosion = document.createElement('div');
        explosion.className = 'explosion-effect';
        
        explosion.style.position = 'absolute';
        explosion.style.left = x;
        explosion.style.top = y;
        explosion.style.transform = 'translate(-50%, -50%)';
        explosion.style.pointerEvents = 'none';
        
        // Patlama parçacıkları
        this.createExplosionParticles(explosion);
        
        container.appendChild(explosion);
        
        // Patlama animasyonu
        this.animateExplosion(explosion);
        
        // Temizlik
        setTimeout(() => {
            if (explosion.parentNode) {
                explosion.parentNode.removeChild(explosion);
            }
        }, 3000);
    }
    
    createExplosionParticles(explosion) {
        const particleCount = this.isPerformanceMode ? 15 : 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'explosion-particle';
            
            // Rastgele yön ve hız
            const angle = (i / particleCount) * Math.PI * 2;
            const velocity = Math.random() * 200 + 100;
            const size = Math.random() * 8 + 4;
            
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.background = `hsl(${Math.random() * 60 + 15}, 100%, 70%)`;
            particle.style.borderRadius = '50%';
            particle.style.position = 'absolute';
            particle.style.left = '50%';
            particle.style.top = '50%';
            particle.style.transform = 'translate(-50%, -50%)';
            
            // Parçacık animasyonu
            const endX = Math.cos(angle) * velocity;
            const endY = Math.sin(angle) * velocity;
            
            particle.animate([
                {
                    transform: 'translate(-50%, -50%) scale(0)',
                    opacity: 1
                },
                {
                    transform: 'translate(-50%, -50%) scale(1)',
                    opacity: 1,
                    offset: 0.1
                },
                {
                    transform: `translate(calc(-50% + ${endX}px), calc(-50% + ${endY}px)) scale(0.5)`,
                    opacity: 0
                }
            ], {
                duration: 2000,
                easing: 'ease-out'
            });
            
            explosion.appendChild(particle);
        }
    }
    
    animateExplosion(explosion) {
        // Ana patlama dalgası
        const wave = document.createElement('div');
        wave.className = 'explosion-wave';
        wave.style.position = 'absolute';
        wave.style.left = '50%';
        wave.style.top = '50%';
        wave.style.transform = 'translate(-50%, -50%)';
        wave.style.width = '0';
        wave.style.height = '0';
        wave.style.border = '2px solid rgba(255, 255, 255, 0.8)';
        wave.style.borderRadius = '50%';
        
        explosion.appendChild(wave);
        
        wave.animate([
            {
                width: '0',
                height: '0',
                opacity: 1
            },
            {
                width: '400px',
                height: '400px',
                opacity: 0
            }
        ], {
            duration: 1500,
            easing: 'ease-out'
        });
    }
    
    // Performans optimizasyonu
    optimizeForDevice() {
        if (this.isPerformanceMode) {
            // Düşük performanslı cihazlar için optimizasyon
            const style = document.createElement('style');
            style.textContent = `
                .performance-mode .star { animation-duration: 1s !important; }
                .performance-mode .meteor { animation-duration: 1s !important; }
                .performance-mode .heart-particle { animation: none !important; }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Animasyon duraklat/devam ettir
    pauseAllAnimations() {
        document.body.style.animationPlayState = 'paused';
        document.querySelectorAll('*').forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    }
    
    resumeAllAnimations() {
        document.body.style.animationPlayState = 'running';
        document.querySelectorAll('*').forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
}

// CSS animasyonları ekle
const animationCSS = `
    @keyframes heartPulse {
        0% { transform: scale(1); opacity: 0.8; }
        100% { transform: scale(1.2); opacity: 1; }
    }
    
    @keyframes glow {
        0% { box-shadow: 0 0 5px currentColor; }
        100% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
    }
    
    @keyframes pulse {
        0% { opacity: 0.6; transform: scale(1); }
        100% { opacity: 1; transform: scale(1.1); }
    }
    
    .heart-universe-advanced {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        width: 400px;
        height: 400px;
        opacity: 0;
        transition: all 2s ease-out;
    }
    
    .heart-universe-advanced.visible {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
    }
    
    .explosion-effect {
        z-index: 1000;
    }
    
    @media (max-width: 768px) {
        .heart-universe-advanced {
            width: 300px;
            height: 300px;
        }
    }
`;

// CSS'i sayfaya ekle
const animationStyle = document.createElement('style');
animationStyle.textContent = animationCSS;
document.head.appendChild(animationStyle);

// Global animasyon yöneticisi
window.animationManager = new AnimationManager();

