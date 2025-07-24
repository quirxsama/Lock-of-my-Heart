// Ana Oyun Sınıfı
class RomanticGame {
    constructor() {
        this.currentScreen = 'intro-screen';
        this.isKeyDragging = false;
        this.keyElement = null;
        this.heartElement = null;
        this.gameState = {
            keyUnlocked: false,
            mainScreenReady: false,
            universeExploring: false,
            finalReached: false
        };
        
        this.init();
    }
    
    init() {
        this.setupElements();
        this.setupEventListeners();
        this.createStars();
        this.startMeteorShower();
    }
    
    setupElements() {
        this.keyElement = document.getElementById('key-icon');
        this.heartElement = document.getElementById('locked-heart');
        this.okButton = document.getElementById('ok-button');
        
        // Ekran elementleri
        this.screens = {
            intro: document.getElementById('intro-screen'),
            main: document.getElementById('main-screen'),
            universe: document.getElementById('universe-screen'),
            message: document.getElementById('message-screen'),
            final: document.getElementById('final-screen')
        };
    }
    
    setupEventListeners() {
        // Anahtar drag & drop
        this.setupKeyDragDrop();
        
        // Tamam butonu
        this.okButton.addEventListener('click', () => {
            this.transitionToUniverse();
        });
        
        // Touch events için
        this.setupTouchEvents();
    }
    
    setupKeyDragDrop() {
        let startX, startY, currentX, currentY;
        let initialTransform = '';
        
        // Mouse events
        this.keyElement.addEventListener('mousedown', (e) => {
            this.startDragging(e.clientX, e.clientY);
        });
        
        // Touch events
        this.keyElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.startDragging(touch.clientX, touch.clientY);
        });
        
        // Mouse move
        document.addEventListener('mousemove', (e) => {
            if (this.isKeyDragging) {
                this.updateKeyPosition(e.clientX, e.clientY);
            }
        });
        
        // Touch move
        document.addEventListener('touchmove', (e) => {
            if (this.isKeyDragging) {
                e.preventDefault();
                const touch = e.touches[0];
                this.updateKeyPosition(touch.clientX, touch.clientY);
            }
        });
        
        // Mouse up
        document.addEventListener('mouseup', () => {
            if (this.isKeyDragging) {
                this.stopDragging();
            }
        });
        
        // Touch end
        document.addEventListener('touchend', () => {
            if (this.isKeyDragging) {
                this.stopDragging();
            }
        });
    }
    
    startDragging(x, y) {
        this.isKeyDragging = true;
        this.keyElement.style.zIndex = '1000';
        this.keyElement.style.position = 'fixed';
        
        const rect = this.keyElement.getBoundingClientRect();
        this.dragOffset = {
            x: x - rect.left - rect.width / 2,
            y: y - rect.top - rect.height / 2
        };
        
        this.updateKeyPosition(x, y);
    }
    
    updateKeyPosition(x, y) {
        if (!this.isKeyDragging) return;
        
        const newX = x - this.dragOffset.x;
        const newY = y - this.dragOffset.y;
        
        this.keyElement.style.left = newX + 'px';
        this.keyElement.style.top = newY + 'px';
        this.keyElement.style.transform = 'translate(-50%, -50%)';
        
        // Kalp ile çarpışma kontrolü
        this.checkKeyHeartCollision(x, y);
    }
    
    checkKeyHeartCollision(keyX, keyY) {
        const heartRect = this.heartElement.getBoundingClientRect();
        const heartCenterX = heartRect.left + heartRect.width / 2;
        const heartCenterY = heartRect.top + heartRect.height / 2;
        
        const distance = Math.sqrt(
            Math.pow(keyX - heartCenterX, 2) + 
            Math.pow(keyY - heartCenterY, 2)
        );
        
        // Eğer anahtar kalbe yeterince yakınsa
        if (distance < 80 && !this.gameState.keyUnlocked) {
            this.unlockHeart();
        }
    }
    
    stopDragging() {
        this.isKeyDragging = false;
        
        if (!this.gameState.keyUnlocked) {
            // Anahtar kilidi açmadıysa eski yerine dön
            this.resetKeyPosition();
        }
    }
    
    resetKeyPosition() {
        this.keyElement.style.position = 'static';
        this.keyElement.style.left = 'auto';
        this.keyElement.style.top = 'auto';
        this.keyElement.style.transform = 'none';
        this.keyElement.style.zIndex = 'auto';
    }
    
    unlockHeart() {
        if (this.gameState.keyUnlocked) return;
        
        this.gameState.keyUnlocked = true;
        
        // Kilit açma animasyonu
        const heartShape = this.heartElement.querySelector('.heart-shape');
        const lockIcon = this.heartElement.querySelector('.lock-icon');
        const chains = this.heartElement.querySelectorAll('.chain');
        
        heartShape.classList.add('unlocking');
        lockIcon.classList.add('unlocking');
        
        // Zincir düşme animasyonu
        setTimeout(() => {
            chains.forEach((chain, index) => {
                setTimeout(() => {
                    chain.classList.add('falling');
                }, index * 200);
            });
        }, 500);
        
        // Anahtar kaybolsun
        setTimeout(() => {
            this.keyElement.style.opacity = '0';
            this.keyElement.style.transform = 'translate(-50%, -50%) scale(0)';
        }, 800);
        
        // Ana ekrana geçiş
        setTimeout(() => {
            this.transitionToMainScreen();
        }, 2000);
    }
    
    transitionToMainScreen() {
        this.screens.intro.classList.remove('active');
        this.screens.intro.classList.add('fade-out');
        
        setTimeout(() => {
            this.screens.main.classList.add('active');
            this.screens.main.classList.add('fade-in');
            this.currentScreen = 'main-screen';
            this.gameState.mainScreenReady = true;
        }, 500);
    }
    
    transitionToUniverse() {
        this.screens.main.classList.remove('active');
        this.screens.main.classList.add('fade-out');
        
        setTimeout(() => {
            this.screens.universe.classList.add('active');
            this.screens.universe.classList.add('fade-in');
            this.currentScreen = 'universe-screen';
            this.gameState.universeExploring = true;
            this.setupUniverseExploration();
        }, 500);
    }
    
    setupUniverseExploration() {
        const universeContainer = document.getElementById('universe-container');
        const spaceElements = document.getElementById('space-elements');
        
        // Rastgele uzay elementleri oluştur
        this.createSpaceElements();
        
        // Pan ve zoom işlevselliği
        this.setupPanAndZoom(universeContainer);
    }
    
    createSpaceElements() {
        const spaceElements = document.getElementById('space-elements');
        const elementCount = 50;
        
        for (let i = 0; i < elementCount; i++) {
            const element = document.createElement('div');
            element.className = 'space-element';
            
            // Rastgele tip seç
            const types = ['star', 'planet', 'nebula'];
            const type = types[Math.floor(Math.random() * types.length)];
            element.classList.add(type);
            
            // Rastgele pozisyon
            element.style.left = Math.random() * 200 + '%';
            element.style.top = Math.random() * 200 + '%';
            
            // Rastgele boyut
            const size = Math.random() * 20 + 5;
            element.style.width = size + 'px';
            element.style.height = size + 'px';
            
            // Rastgele animasyon gecikmesi
            element.style.animationDelay = Math.random() * 4 + 's';
            
            spaceElements.appendChild(element);
        }
    }
    
    setupPanAndZoom(container) {
        let scale = 1;
        let panX = 0;
        let panY = 0;
        let isPanning = false;
        let lastTouchDistance = 0;
        
        // Mouse pan
        container.addEventListener('mousedown', (e) => {
            isPanning = true;
            this.lastPanX = e.clientX;
            this.lastPanY = e.clientY;
        });
        
        container.addEventListener('mousemove', (e) => {
            if (isPanning) {
                panX += e.clientX - this.lastPanX;
                panY += e.clientY - this.lastPanY;
                this.updateTransform(container, scale, panX, panY);
                this.lastPanX = e.clientX;
                this.lastPanY = e.clientY;
            }
        });
        
        container.addEventListener('mouseup', () => {
            isPanning = false;
        });
        
        // Touch pan ve zoom
        container.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                isPanning = true;
                this.lastPanX = e.touches[0].clientX;
                this.lastPanY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                isPanning = false;
                lastTouchDistance = this.getTouchDistance(e.touches);
            }
        });
        
        container.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
            if (e.touches.length === 1 && isPanning) {
                panX += e.touches[0].clientX - this.lastPanX;
                panY += e.touches[0].clientY - this.lastPanY;
                this.updateTransform(container, scale, panX, panY);
                this.lastPanX = e.touches[0].clientX;
                this.lastPanY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                const currentDistance = this.getTouchDistance(e.touches);
                const scaleChange = currentDistance / lastTouchDistance;
                scale *= scaleChange;
                scale = Math.max(0.1, Math.min(scale, 3));
                
                this.updateTransform(container, scale, panX, panY);
                lastTouchDistance = currentDistance;
                
                // Zoom out yeterince yapıldıysa kalp evrenini göster
                if (scale < 0.3 && !this.gameState.heartUniverseShown) {
                    this.showHeartUniverse();
                }
            }
        });
        
        container.addEventListener('touchend', () => {
            isPanning = false;
        });
    }
    
    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    updateTransform(element, scale, x, y) {
        element.style.transform = `scale(${scale}) translate(${x}px, ${y}px)`;
    }
    
    showHeartUniverse() {
        this.gameState.heartUniverseShown = true;
        const heartUniverse = document.getElementById('heart-universe');
        heartUniverse.classList.add('visible');
        
        // Meteor yağmuru başlat
        setTimeout(() => {
            this.startIntenseMeteorShower();
        }, 1000);
        
        // Mesaj ekranına geçiş
        setTimeout(() => {
            this.transitionToMessage();
        }, 3000);
    }
    
    transitionToMessage() {
        this.screens.universe.classList.remove('active');
        this.screens.universe.classList.add('fade-out');
        
        setTimeout(() => {
            this.screens.message.classList.add('active');
            this.screens.message.classList.add('fade-in');
            this.currentScreen = 'message-screen';
            
            // Patlama efekti sonrası final ekranına geçiş
            setTimeout(() => {
                this.createExplosion();
                setTimeout(() => {
                    this.transitionToFinal();
                }, 1500);
            }, 3000);
        }, 500);
    }
    
    createExplosion() {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        this.screens.message.appendChild(explosion);
    }
    
    transitionToFinal() {
        this.screens.message.classList.remove('active');
        this.screens.message.classList.add('fade-out');
        
        setTimeout(() => {
            this.screens.final.classList.add('active');
            this.screens.final.classList.add('fade-in');
            this.currentScreen = 'final-screen';
            this.gameState.finalReached = true;
            this.createFinalStars();
        }, 500);
    }
    
    createStars() {
        const starsContainer = document.getElementById('stars-container');
        const starCount = 100;
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // Rastgele boyut
            const sizes = ['small', 'medium', 'large'];
            const size = sizes[Math.floor(Math.random() * sizes.length)];
            star.classList.add(size);
            
            // Rastgele pozisyon
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            
            // Rastgele animasyon gecikmesi
            star.style.animationDelay = Math.random() * 3 + 's';
            
            starsContainer.appendChild(star);
        }
    }
    
    startMeteorShower() {
        const meteorsContainer = document.getElementById('meteors-container');
        
        setInterval(() => {
            if (this.currentScreen === 'main-screen' || this.currentScreen === 'universe-screen') {
                this.createMeteor(meteorsContainer);
            }
        }, 2000);
    }
    
    startIntenseMeteorShower() {
        const meteorsContainer = document.getElementById('meteors-container');
        
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.createMeteor(meteorsContainer);
            }, i * 200);
        }
    }
    
    createMeteor(container) {
        const meteor = document.createElement('div');
        meteor.className = 'meteor falling';
        
        // Rastgele başlangıç pozisyonu
        meteor.style.left = Math.random() * 100 + '%';
        meteor.style.top = '-10px';
        
        container.appendChild(meteor);
        
        // Meteor animasyonu bitince kaldır
        setTimeout(() => {
            if (meteor.parentNode) {
                meteor.parentNode.removeChild(meteor);
            }
        }, 3000);
    }
    
    createFinalStars() {
        const finalStars = document.querySelector('.final-stars');
        const starCount = 50;
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'final-star';
            
            // Rastgele pozisyon
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            
            // Rastgele boyut
            const size = Math.random() * 4 + 2;
            star.style.width = size + 'px';
            star.style.height = size + 'px';
            
            // Rastgele animasyon gecikmesi
            star.style.animationDelay = Math.random() * 3 + 's';
            
            finalStars.appendChild(star);
        }
    }
    
    setupTouchEvents() {
        // iOS Safari için özel ayarlar
        document.addEventListener('touchstart', function(e) {
            // Varsayılan davranışları engelle
        }, { passive: false });
        
        document.addEventListener('touchmove', function(e) {
            // Sayfa kaydırmasını engelle
            if (e.target.closest('.universe-container')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
}

// Oyunu başlat
document.addEventListener('DOMContentLoaded', () => {
    new RomanticGame();
});

