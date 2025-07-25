document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const introScreen = document.getElementById('intro-screen');
    const mainScreen = document.getElementById('main-screen');
    const universeScreen = document.getElementById('universe-screen');
    const messageScreen = document.getElementById('message-screen');
    const finalScreen = document.getElementById('final-screen');

    const keyIcon = document.getElementById('key-icon');
    const lockedHeart = document.getElementById('locked-heart');
    const instructionText = document.querySelector('.instruction');
    const okButton = document.getElementById('ok-button');
    const backgroundMusic = document.getElementById('background-music');
    const soundButton = document.getElementById('sound-button');

    // --- Müzik Kontrolleri ---
    let isMuted = false;
    const defaultVolume = 0.01; // Başlangıç ses seviyesi %1
    const maxVolume = 0.1; // Maksimum ses seviyesi %10
    let currentVolume = defaultVolume;
    const volumeSlider = document.getElementById('volume-slider');

    const startBackgroundMusic = () => {
        if (backgroundMusic) {
            backgroundMusic.volume = 0;
            backgroundMusic.play()
                .then(() => {
                    // Fade in efekti
                    let vol = 0;
                    const interval = setInterval(() => {
                        vol += 0.001; // Daha yavaş fade in
                        if (vol >= defaultVolume) {
                            clearInterval(interval);
                            backgroundMusic.volume = defaultVolume;
                            currentVolume = defaultVolume;
                            volumeSlider.value = defaultVolume * 100;
                        } else {
                            backgroundMusic.volume = vol;
                        }
                    }, 100);
                })
                .catch(error => console.log("Müzik başlatılamadı:", error));
        }
    };

    // Ses kontrol butonu
    if (soundButton && volumeSlider) {
        soundButton.addEventListener('click', () => {
            if (isMuted) {
                // Sesi aç
                backgroundMusic.volume = currentVolume;
                soundButton.classList.remove('muted');
                soundButton.querySelector('i').className = 'fas fa-volume-low';
                volumeSlider.value = currentVolume * 100;
            } else {
                // Sesi kapat
                currentVolume = backgroundMusic.volume;
                backgroundMusic.volume = 0;
                soundButton.classList.add('muted');
                volumeSlider.value = 0;
            }
            isMuted = !isMuted;
        });

        // Ses seviyesi kontrolü
        volumeSlider.addEventListener('input', (e) => {
            const value = e.target.value / 100;
            currentVolume = value;
            
            if (!isMuted) {
                backgroundMusic.volume = value;
                
                // Ses seviyesine göre icon değiştir
                const icon = soundButton.querySelector('i');
                if (value === 0) {
                    icon.className = 'fas fa-volume-off';
                } else if (value < 0.5) {
                    icon.className = 'fas fa-volume-low';
                } else {
                    icon.className = 'fas fa-volume-high';
                }
            }
        });
    }

    const universeContainer = document.getElementById('universe-container');
    const spaceElements = document.getElementById('space-elements');
    const messageTextEl = document.getElementById('message-text');
    const finalMessage = document.querySelector('.final-message');

    // --- State ---
    let isKeySelected = false;
    let isUnlocked = false;

    // --- Screen Transition ---
    const transitionScreen = (from, to) => {
        from.classList.remove('active');
        to.classList.add('active');
    };

    // --- Intro Logic ---
    const selectKey = () => {
        if (isUnlocked) return;
        isKeySelected = true;
        keyIcon.classList.add('selected');
        instructionText.textContent = 'Kalbe dokunarak kilidi aç';
    };

    const unlockHeart = () => {
        if (isUnlocked || !isKeySelected) return;
        isUnlocked = true;

        // Animate key movement to heart
        const heartRect = lockedHeart.getBoundingClientRect();
        const keyRect = keyIcon.getBoundingClientRect();
        
        const moveX = heartRect.left + heartRect.width/2 - (keyRect.left + keyRect.width/2);
        const moveY = heartRect.top + heartRect.height/2 - (keyRect.top + keyRect.height/2);
        
        keyIcon.style.transform = `translate(${moveX}px, ${moveY}px) rotate(90deg) scale(0.5)`;
        keyIcon.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
            lockedHeart.classList.add('unlocked');
            keyIcon.style.opacity = '0';
            instructionText.style.opacity = '0';
            
            // Create sparkle effect
            const sparkleCount = 12;
            for(let i = 0; i < sparkleCount; i++) {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                sparkle.style.setProperty('--rotation', `${(360/sparkleCount) * i}deg`);
                lockedHeart.appendChild(sparkle);
            }
            
            setTimeout(() => {
                transitionScreen(introScreen, mainScreen);
            }, 1500);
        }, 800);
    };
    
    // --- Universe Logic ---
    const initUniverse = () => {
        let scale = 1;
        let isPanning = false, startX, startY, lastX, lastY;
        let collectedPieces = 0;
        let heartRevealed = false;
        // Pan değişkenlerini başta tanımla
        let panX = window.innerWidth / 2;
        let panY = window.innerHeight / 2;
        let targetPanX = panX;
        let targetPanY = panY;
        let targetScale = scale;
        
        // Create canvases for different layers
        const backgroundCanvas = document.createElement('canvas');
        backgroundCanvas.className = 'background-canvas';
        const starCanvas = document.createElement('canvas');
        starCanvas.className = 'star-canvas';
        const particleCanvas = document.createElement('canvas');
        particleCanvas.className = 'particle-canvas';
        
        // Add canvases to universe container in correct order
        universeContainer.appendChild(backgroundCanvas);
        universeContainer.appendChild(starCanvas);
        universeContainer.appendChild(particleCanvas);
        
        // Get contexts
        const bgCtx = backgroundCanvas.getContext('2d');
        const starCtx = starCanvas.getContext('2d');
        const particleCtx = particleCanvas.getContext('2d');
        
        // Enable alpha for all contexts
        bgCtx.globalCompositeOperation = 'screen';
        starCtx.globalCompositeOperation = 'screen';
        particleCtx.globalCompositeOperation = 'screen';
        


        // Star system - önce tanımla
        const stars = [];
        const createStars = () => {
            stars.length = 0; // Clear existing stars
            const starCount = 1000;
            const centerX = starCanvas.width / 2;
            const centerY = starCanvas.height / 2;
            
            for(let i = 0; i < starCount; i++) {
                // Spiral dağılım için polar koordinatlar
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * Math.min(starCanvas.width, starCanvas.height) * 0.8;
                
                stars.push({
                    x: centerX + Math.cos(angle) * distance,
                    y: centerY + Math.sin(angle) * distance,
                    size: Math.random() * 2 + 0.5,
                    brightness: Math.random() * 0.5 + 0.5,
                    blinkSpeed: 0.001 + Math.random() * 0.003,
                    blinkOffset: Math.random() * Math.PI * 2,
                    color: `hsla(${220 + Math.random() * 40}, 100%, ${70 + Math.random() * 30}%, `
                });
            }
        };
        
        // Set canvas sizes and create initial background
        const resizeCanvas = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            // Resize all canvases
            backgroundCanvas.width = width;
            backgroundCanvas.height = height;
            starCanvas.width = width;
            starCanvas.height = height;
            particleCanvas.width = width;
            particleCanvas.height = height;
            
            // Create background gradient
            const gradient = bgCtx.createRadialGradient(
                width/2, height/2, 0,
                width/2, height/2, Math.max(width, height)
            );
            gradient.addColorStop(0, 'rgba(30, 0, 60, 1)');
            gradient.addColorStop(0.5, 'rgba(15, 0, 30, 1)');
            gradient.addColorStop(1, 'rgba(0, 0, 10, 1)');
            
            bgCtx.fillStyle = gradient;
            bgCtx.fillRect(0, 0, width, height);
            
            // Recreate stars after resize
            createStars();
        };
        
        // Initialize
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Yıldızları çiz
        const renderStars = () => {
            starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
            
            stars.forEach(star => {
                // Yanıp sönme efekti
                const time = Date.now() * star.blinkSpeed + star.blinkOffset;
                const brightness = star.brightness * (0.7 + Math.sin(time) * 0.3);
                
                // Transformasyonları uygula
                const screenX = (star.x - panX) * scale + panX;
                const screenY = (star.y - panY) * scale + panY;
                const screenSize = star.size * scale;
                
                // Yıldızı çiz
                starCtx.beginPath();
                starCtx.fillStyle = star.color + brightness + ')';
                starCtx.arc(screenX, screenY, screenSize, 0, Math.PI * 2);
                starCtx.fill();
                
                // Parlamayı çiz
                const gradient = starCtx.createRadialGradient(
                    screenX, screenY, 0,
                    screenX, screenY, screenSize * 4
                );
                gradient.addColorStop(0, 'rgba(255, 255, 255, ' + brightness * 0.2 + ')');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                starCtx.fillStyle = gradient;
                starCtx.beginPath();
                starCtx.arc(screenX, screenY, screenSize * 4, 0, Math.PI * 2);
                starCtx.fill();
            });
        };
        
        // Particle system
        const particles = [];
        const particleCount = 1000;
        
        class Particle {
            constructor() {
                this.reset();
            }
            
            reset() {
                const r = Math.random() * Math.min(particleCanvas.width, particleCanvas.height) * 0.5;
                const angle = Math.random() * Math.PI * 2;
                this.x = particleCanvas.width/2 + Math.cos(angle) * r;
                this.y = particleCanvas.height/2 + Math.sin(angle) * r;
                this.size = Math.random() * 2;
                this.baseSize = this.size;
                this.angle = angle;
                this.radius = r;
                this.speed = (0.1 + Math.random() * 0.5) * 0.002;
                this.brightness = Math.random();
                this.alpha = Math.random() * 0.5 + 0.5;
                this.baseAlpha = this.alpha;
                
                // Random color between blue and purple
                const hue = 220 + Math.random() * 60;
                const saturation = 70 + Math.random() * 30;
                const lightness = 50 + Math.random() * 20;
                this.hue = hue;
                this.color = `hsla(${hue}, ${saturation}%, ${lightness}%, ${this.alpha})`;
            }
            
            update() {
                this.angle += this.speed;
                const centerX = particleCanvas.width/2;
                const centerY = particleCanvas.height/2;
                
                // Spiral hareket
                this.radius += Math.sin(this.angle * 0.1) * 0.2;
                this.x = centerX + Math.cos(this.angle) * this.radius;
                this.y = centerY + Math.sin(this.angle) * this.radius;
                
                // Boyut ve parlaklık değişimi
                this.size = this.baseSize * (1 + Math.sin(Date.now() * 0.001 + this.angle) * 0.3);
                this.alpha = this.baseAlpha * (0.7 + Math.sin(Date.now() * 0.002 + this.angle) * 0.3);
                
                // Renk değişimi
                this.hue = 220 + Math.sin(Date.now() * 0.001 + this.angle) * 30;
                
                // Sınırları kontrol et
                if (this.radius > Math.min(particleCanvas.width, particleCanvas.height) * 0.4) {
                    this.radius *= 0.95;
                }
            }
            
            draw() {
                const screenX = (this.x - panX) * scale + panX;
                const screenY = (this.y - panY) * scale + panY;
                const screenSize = this.size * scale;
                
                // Parçacığı çiz
                particleCtx.fillStyle = this.color;
                particleCtx.beginPath();
                particleCtx.arc(screenX, screenY, screenSize, 0, Math.PI * 2);
                particleCtx.fill();
                
                // Parlama efekti
                const gradient = particleCtx.createRadialGradient(
                    screenX, screenY, 0,
                    screenX, screenY, screenSize * 4
                );
                gradient.addColorStop(0, `hsla(${this.hue}, 100%, 70%, ${this.alpha * 0.3})`);
                gradient.addColorStop(1, `hsla(${this.hue}, 100%, 70%, 0)`);
                
                particleCtx.fillStyle = gradient;
                particleCtx.beginPath();
                particleCtx.arc(screenX, screenY, screenSize * 4, 0, Math.PI * 2);
                particleCtx.fill();
            }
        }

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Animation function
        function animate() {
            // Clear particle canvas
            particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
            
            // Render stars
            renderStars();
            
            // Update and draw particles
            if (particles) {
                particles.forEach(particle => {
                    particle.update();
                    particle.draw();
                });
            }

            // After some time, show the message
            if (scale <= 0.5) {
                heartRevealed = true;
                setTimeout(() => {
                    transitionScreen(universeScreen, messageScreen);
                    messageTextEl.textContent = "Sana olan aşkım evrene sığar mı?";
                    messageTextEl.style.opacity = '0';
                    messageTextEl.style.transform = 'scale(0.5)';
                    
                    setTimeout(() => {
                        messageTextEl.style.transition = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
                        messageTextEl.style.opacity = '1';
                        messageTextEl.style.transform = 'scale(1)';
                    }, 500);
                }, 500);
            }
            
            requestAnimationFrame(animate);
        }
        
        animate();

        const updateTransform = () => {
            // Yumuşak geçiş için lerp (linear interpolation) kullan
            panX += (targetPanX - panX) * 0.1;
            panY += (targetPanY - panY) * 0.1;
            scale += (targetScale - scale) * 0.1;

            // Universe container'ı transform et
            spaceElements.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
            

            
            requestAnimationFrame(updateTransform);
        };

        updateTransform();

        const startPan = (e) => {
            if (e.touches && e.touches.length > 1) return; // Çoklu dokunma durumunda pan'i engelle
            
            isPanning = true;
            universeContainer.style.cursor = 'grabbing';
            startX = e.touches ? e.touches[0].clientX : e.clientX;
            startY = e.touches ? e.touches[0].clientY : e.clientY;
            lastX = panX;
            lastY = panY;
            
            e.preventDefault(); // Varsayılan davranışı engelle
        };

        const movePan = (e) => {
            if (!isPanning) return;
            
            const currentX = e.touches ? e.touches[0].clientX : e.clientX;
            const currentY = e.touches ? e.touches[0].clientY : e.clientY;
            
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            
            // Sürükleme yönünü tersine çevir
            targetPanX = lastX - deltaX;
            targetPanY = lastY - deltaY;
            
            e.preventDefault(); // Varsayılan davranışı engelle
        };

        const stopPan = () => { 
            isPanning = false; 
            universeContainer.style.cursor = 'grab'; 
        };

        const handleZoom = (e) => {
            e.preventDefault();
            const delta = e.deltaY;
            const oldScale = targetScale;
            
            // Zoom hızını ayarla
            const zoomFactor = delta > 0 ? 0.95 : 1.05;
            targetScale = oldScale * zoomFactor;
            targetScale = Math.min(Math.max(0.3, targetScale), 3);
            
            // Mouse pozisyonuna göre zoom
            const rect = universeContainer.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Zoom noktasını hesapla
            const zoomPoint = {
                x: (mouseX - panX) / oldScale,
                y: (mouseY - panY) / oldScale
            };

            targetPanX = mouseX - zoomPoint.x * targetScale;
            targetPanY = mouseY - zoomPoint.y * targetScale;
            
            // Belirli bir zoom seviyesinde mesajı göster
            if (targetScale <= 0.5 && !heartRevealed) {
                heartRevealed = true;
                // Kalp parçalarını temizle
                heartPieces.forEach(piece => {
                    if (piece.element) {
                        piece.element.remove();
                    }
                });
                
                counter.style.opacity = '0';
                setTimeout(() => {
                    counter.remove();
                    transitionScreen(universeScreen, messageScreen);
                    messageTextEl.textContent = "Sana olan aşkım evrene sığar mı?";
                    messageTextEl.style.opacity = '0';
                    messageTextEl.style.transform = 'scale(0.5)';
                    
                    setTimeout(() => {
                        messageTextEl.style.transition = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
                        messageTextEl.style.opacity = '1';
                        messageTextEl.style.transform = 'scale(1)';
                    }, 500);
                }, 500);
            }
        };

        let lastTouchDistance = 0;
        let touchStartScale = 1;
        
        const touchStart = (e) => {
            if (e.touches.length === 1) {
                startPan(e);
            } else if (e.touches.length === 2) {
                isPanning = false;
                touchStartScale = scale;
                lastTouchDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
            }
        };

        const touchMove = (e) => {
            e.preventDefault();
            if (e.touches.length === 1 && isPanning) {
                movePan(e);
            } else if (e.touches.length === 2) {
                const currentDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                
                const pinchScale = currentDistance / lastTouchDistance;
                const newScale = touchStartScale * pinchScale;
                targetScale = Math.min(Math.max(0.3, newScale), 3);
                
                // İki parmak ortası
                const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                
                const rect = universeContainer.getBoundingClientRect();
                const zoomPoint = {
                    x: ((centerX - rect.left) - panX) / scale,
                    y: ((centerY - rect.top) - panY) / scale
                };
                
                targetPanX = (centerX - rect.left) - zoomPoint.x * targetScale;
                targetPanY = (centerY - rect.top) - zoomPoint.y * targetScale;
                
                if (targetScale <= 0.4 && !heartRevealed) {
                    revealHeart();
                }
            }
        };

        const revealHeart = () => {
            if (heartRevealed) return;
            heartRevealed = true;
            
            // Create heart universe elements
            const heartUniverse = document.createElement('div');
            heartUniverse.className = 'heart-universe';
            spaceElements.appendChild(heartUniverse);

            const centerHeart = document.createElement('div');
            centerHeart.className = 'center-heart';
            heartUniverse.appendChild(centerHeart);

            const finalHeart = document.createElement('div');
            finalHeart.className = 'final-heart';
            heartUniverse.appendChild(finalHeart);

            // Create heart-shaped star formation
            const heartStars = [];
            
            // Parametrik kalp denklemi
            const getHeartPosition = (t) => {
                const scale = 60;
                const x = 16 * Math.pow(Math.sin(t), 3);
                const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
                return {
                    x: x * scale + window.innerWidth/2,
                    y: y * scale + window.innerHeight/2
                };
            };

            // Yıldızları oluştur
            for (let i = 0; i < 200; i++) {
                const star = document.createElement('div');
                const size = Math.random();
                star.className = `star${size > 0.9 ? ' large' : size > 0.7 ? ' medium' : ''}`;
                
                // Başlangıçta rastgele pozisyon
                const angle = Math.random() * 2 * Math.PI;
                const distance = Math.random() * 200;
                const initialX = window.innerWidth/2 + Math.cos(angle) * distance;
                const initialY = window.innerHeight/2 + Math.sin(angle) * distance;
                
                // Hedef pozisyon (kalp üzerinde)
                const t = (i / 200) * 2 * Math.PI;
                const heartPos = getHeartPosition(t);
                
                star.style.position = 'absolute';
                star.style.left = `${initialX}px`;
                star.style.top = `${initialY}px`;
                star.style.opacity = '0';
                
                heartStars.push({
                    element: star,
                    currentX: initialX,
                    currentY: initialY,
                    targetX: heartPos.x,
                    targetY: heartPos.y
                });
                
                spaceElements.appendChild(star);
            }

            // Yıldızları görünür yap
            heartStars.forEach((star, index) => {
                setTimeout(() => {
                    star.element.style.opacity = '1';
                }, index * 10);
            });

            // Kalp şekline doğru animasyon
            let animationStartTime = null;
            const animateDuration = 3000;

            function animateStars(timestamp) {
                if (!animationStartTime) animationStartTime = timestamp;
                const progress = Math.min((timestamp - animationStartTime) / animateDuration, 1);

                if (progress < 1) {
                    heartStars.forEach(star => {
                        const ease = t => t<.5 ? 2*t*t : -1+(4-2*t)*t;
                        const easeProgress = ease(progress);

                        star.currentX += (star.targetX - star.currentX) * 0.05;
                        star.currentY += (star.targetY - star.currentY) * 0.05;

                        star.element.style.left = `${star.currentX}px`;
                        star.element.style.top = `${star.currentY}px`;
                    });
                    requestAnimationFrame(animateStars);
                } else {
                    // Kalp animasyonu tamamlandığında
                    setTimeout(() => {
                        centerHeart.classList.add('appear');
                        
                        setTimeout(() => {
                            centerHeart.classList.add('expand');
                            
                            setTimeout(() => {
                                finalHeart.classList.add('show');
                                
                                setTimeout(() => {
                                    transitionScreen(universeScreen, messageScreen);
                                    messageTextEl.style.opacity = '0';
                                    messageTextEl.style.transform = 'scale(0.5)';
                                    
                                    setTimeout(() => {
                                        messageTextEl.style.transition = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
                                        messageTextEl.style.opacity = '1';
                                        messageTextEl.style.transform = 'scale(1)';
                                    }, 500);
                                }, 1000);
                            }, 1500);
                        }, 1000);
                    }, 1000);
                }
            }

            requestAnimationFrame(animateStars);
        };

        // Add universe event listeners
        const addEventListeners = () => {
            universeContainer.addEventListener('mousedown', startPan, { passive: false });
            universeContainer.addEventListener('mousemove', movePan, { passive: false });
            universeContainer.addEventListener('mouseup', stopPan, { passive: false });
            universeContainer.addEventListener('mouseleave', stopPan, { passive: false });
            universeContainer.addEventListener('wheel', handleZoom, { passive: false });
            universeContainer.addEventListener('touchstart', touchStart, { passive: false });
            universeContainer.addEventListener('touchmove', touchMove, { passive: false });
            universeContainer.addEventListener('touchend', stopPan, { passive: false });
            universeContainer.addEventListener('touchcancel', stopPan, { passive: false });
            
            // Prevent default browser gestures
            document.addEventListener('gesturestart', (e) => e.preventDefault());
            document.addEventListener('gesturechange', (e) => e.preventDefault());
            document.addEventListener('gestureend', (e) => e.preventDefault());
        };

        addEventListeners();
    };

    // --- Initial Event Listeners ---
    keyIcon.addEventListener('click', selectKey);
    lockedHeart.addEventListener('click', unlockHeart);
    okButton.addEventListener('click', () => {
        transitionScreen(mainScreen, universeScreen);
        initUniverse();
        startBackgroundMusic(); // Müziği başlat
    });

    // Message screen click handler
    messageScreen.addEventListener('click', () => {
        if (messageTextEl && finalMessage) {
            setTimeout(() => {
                finalMessage.textContent = 'Seni seviyorum Rüya ❤️';
                finalMessage.style.opacity = '0';
                transitionScreen(messageScreen, finalScreen);
                
                // Geçiş tamamlandıktan sonra final mesajını göster
                setTimeout(() => {
                    finalMessage.style.transition = 'opacity 2s ease-in-out';
                    finalMessage.style.opacity = '1';
                }, 800);
            }, 500);
        }
    });
});