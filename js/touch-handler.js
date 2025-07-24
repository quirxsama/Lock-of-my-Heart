// Touch Event Handler - Mobil ve Apple Cihaz Optimizasyonu
class TouchHandler {
    constructor() {
        this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        this.isAndroid = /Android/.test(navigator.userAgent);
        
        this.init();
    }
    
    init() {
        this.setupIOSOptimizations();
        this.setupTouchPreventions();
        this.setupGestureHandling();
        this.setupViewportFix();
    }
    
    setupIOSOptimizations() {
        if (this.isIOS) {
            // iOS Safari için özel ayarlar
            document.body.style.webkitTouchCallout = 'none';
            document.body.style.webkitUserSelect = 'none';
            document.body.style.webkitTapHighlightColor = 'transparent';
            
            // iOS Safari'de zoom'u engelle
            document.addEventListener('gesturestart', (e) => {
                e.preventDefault();
            });
            
            document.addEventListener('gesturechange', (e) => {
                e.preventDefault();
            });
            
            document.addEventListener('gestureend', (e) => {
                e.preventDefault();
            });
            
            // Double tap zoom'u engelle
            let lastTouchEnd = 0;
            document.addEventListener('touchend', (e) => {
                const now = (new Date()).getTime();
                if (now - lastTouchEnd <= 300) {
                    e.preventDefault();
                }
                lastTouchEnd = now;
            }, false);
        }
    }
    
    setupTouchPreventions() {
        // Sayfa kaydırmasını belirli elementlerde engelle
        const preventScrollElements = [
            '.universe-container',
            '.key-icon',
            '.locked-heart'
        ];
        
        preventScrollElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.addEventListener('touchmove', (e) => {
                    e.preventDefault();
                }, { passive: false });
            });
        });
        
        // Genel sayfa kaydırmasını engelle
        document.body.addEventListener('touchmove', (e) => {
            if (e.target.closest('.screen')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    setupGestureHandling() {
        // Pinch zoom için özel handler
        this.setupPinchZoom();
        
        // Swipe gesture detection
        this.setupSwipeDetection();
    }
    
    setupPinchZoom() {
        let initialDistance = 0;
        let currentScale = 1;
        
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = this.getDistance(e.touches[0], e.touches[1]);
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && e.target.closest('.universe-container')) {
                e.preventDefault();
                
                const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                const scale = currentDistance / initialDistance;
                
                // Custom pinch zoom event dispatch
                const pinchEvent = new CustomEvent('pinchzoom', {
                    detail: {
                        scale: scale,
                        center: this.getCenter(e.touches[0], e.touches[1])
                    }
                });
                
                e.target.dispatchEvent(pinchEvent);
            }
        }, { passive: false });
    }
    
    setupSwipeDetection() {
        let startX, startY, startTime;
        
        document.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            startTime = Date.now();
        });
        
        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const touch = e.changedTouches[0];
            const endX = touch.clientX;
            const endY = touch.clientY;
            const endTime = Date.now();
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;
            
            // Swipe detection logic
            if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
                if (deltaTime < 300) {
                    const direction = this.getSwipeDirection(deltaX, deltaY);
                    
                    const swipeEvent = new CustomEvent('swipe', {
                        detail: {
                            direction: direction,
                            deltaX: deltaX,
                            deltaY: deltaY,
                            duration: deltaTime
                        }
                    });
                    
                    e.target.dispatchEvent(swipeEvent);
                }
            }
            
            startX = null;
            startY = null;
        });
    }
    
    setupViewportFix() {
        // iOS Safari viewport height fix
        if (this.isIOS) {
            const setViewportHeight = () => {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            };
            
            setViewportHeight();
            window.addEventListener('resize', setViewportHeight);
            window.addEventListener('orientationchange', () => {
                setTimeout(setViewportHeight, 100);
            });
        }
    }
    
    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    getCenter(touch1, touch2) {
        return {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
        };
    }
    
    getSwipeDirection(deltaX, deltaY) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            return deltaX > 0 ? 'right' : 'left';
        } else {
            return deltaY > 0 ? 'down' : 'up';
        }
    }
    
    // Haptic feedback for iOS
    triggerHapticFeedback(type = 'light') {
        if (this.isIOS && window.navigator.vibrate) {
            switch (type) {
                case 'light':
                    window.navigator.vibrate(10);
                    break;
                case 'medium':
                    window.navigator.vibrate(20);
                    break;
                case 'heavy':
                    window.navigator.vibrate(30);
                    break;
            }
        }
    }
    
    // Performance optimization for animations
    optimizeAnimations() {
        // Reduce animations on low-end devices
        const isLowEnd = navigator.hardwareConcurrency < 4 || 
                         navigator.deviceMemory < 4;
        
        if (isLowEnd) {
            document.body.classList.add('low-performance');
        }
        
        // Pause animations when page is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                document.body.classList.add('paused-animations');
            } else {
                document.body.classList.remove('paused-animations');
            }
        });
    }
    
    // Battery optimization
    setupBatteryOptimization() {
        if ('getBattery' in navigator) {
            navigator.getBattery().then((battery) => {
                const updateBatteryStatus = () => {
                    if (battery.level < 0.2 && !battery.charging) {
                        // Low battery mode - reduce animations
                        document.body.classList.add('battery-saver');
                    } else {
                        document.body.classList.remove('battery-saver');
                    }
                };
                
                battery.addEventListener('levelchange', updateBatteryStatus);
                battery.addEventListener('chargingchange', updateBatteryStatus);
                updateBatteryStatus();
            });
        }
    }
}

// Enhanced CSS for touch optimizations
const touchOptimizationCSS = `
    /* iOS Safari specific fixes */
    html {
        height: 100%;
        height: calc(var(--vh, 1vh) * 100);
    }
    
    /* Low performance mode */
    .low-performance * {
        animation-duration: 0.1s !important;
        transition-duration: 0.1s !important;
    }
    
    /* Paused animations */
    .paused-animations * {
        animation-play-state: paused !important;
    }
    
    /* Battery saver mode */
    .battery-saver .star,
    .battery-saver .meteor,
    .battery-saver .space-element {
        animation: none !important;
    }
    
    /* Touch-friendly button sizes */
    .ok-button {
        min-height: 44px;
        min-width: 44px;
    }
    
    /* Prevent text selection on touch */
    .screen * {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    
    /* Smooth scrolling for iOS */
    .universe-container {
        -webkit-overflow-scrolling: touch;
    }
    
    /* Remove tap highlights */
    * {
        -webkit-tap-highlight-color: transparent;
        -webkit-focus-ring-color: transparent;
        outline: none;
    }
    
    /* Improve touch responsiveness */
    .key-icon,
    .ok-button,
    .universe-container {
        touch-action: manipulation;
    }
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = touchOptimizationCSS;
document.head.appendChild(style);

// Initialize touch handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const touchHandler = new TouchHandler();
    touchHandler.optimizeAnimations();
    touchHandler.setupBatteryOptimization();
    
    // Make touch handler globally available
    window.touchHandler = touchHandler;
});

