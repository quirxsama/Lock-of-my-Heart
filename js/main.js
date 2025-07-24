document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const introScreen = document.getElementById('intro-screen');
    const mainScreen = document.getElementById('main-screen');
    const universeScreen = document.getElementById('universe-screen');
    const messageScreen = document.getElementById('message-screen');
    const finalScreen = document.getElementById('final-screen');

    const keyIcon = document.getElementById('key-icon');
    const lockedHeart = document.getElementById('locked-heart');
    const okButton = document.getElementById('ok-button');

    const universeContainer = document.getElementById('universe-container');
    const spaceElements = document.getElementById('space-elements');
    const heartUniverse = document.getElementById('heart-universe');
    const messageText = document.getElementById('message-text');
    const finalMessage = document.querySelector('.final-message');

    // --- State Variables ---
    let isDragging = false;
    let isUnlocked = false;
    let offsetX, offsetY;

    // --- Core Functions ---

    /**
     * Transitions between screens with fade effects.
     * @param {HTMLElement} fromScreen - The screen to hide.
     * @param {HTMLElement} toScreen - The screen to show.
     */
    const transitionScreen = (fromScreen, toScreen) => {
        fromScreen.classList.remove('active');
        toScreen.classList.add('active');
    };

    /**
     * Initializes the drag-and-drop functionality for the key.
     */
    const startDrag = (e) => {
        if (isUnlocked) return;
        isDragging = true;
        
        keyIcon.style.position = 'fixed';
        keyIcon.style.cursor = 'grabbing';
        keyIcon.style.zIndex = '1001';

        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        
        const rect = keyIcon.getBoundingClientRect();
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;

        document.addEventListener('mousemove', dragKey);
        document.addEventListener('touchmove', dragKey, { passive: false });
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    };

    /**
     * Handles the movement of the key during dragging.
     */
    const dragKey = (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

        keyIcon.style.left = `${clientX - offsetX}px`;
        keyIcon.style.top = `${clientY - offsetY}px`;

        checkCollision();
    };

    /**
     * Ends the dragging process and cleans up event listeners.
     */
    const stopDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        keyIcon.style.cursor = 'grab';

        if (!isUnlocked) {
            keyIcon.style.position = 'relative';
            keyIcon.style.left = 'auto';
            keyIcon.style.top = 'auto';
        }
        
        document.removeEventListener('mousemove', dragKey);
        document.removeEventListener('touchmove', dragKey);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
    };

    /**
     * Checks if the key is colliding with the heart.
     */
    const checkCollision = () => {
        const keyRect = keyIcon.getBoundingClientRect();
        const heartRect = lockedHeart.getBoundingClientRect();

        if (keyRect.left < heartRect.right &&
            keyRect.right > heartRect.left &&
            keyRect.top < heartRect.bottom &&
            keyRect.bottom > heartRect.top) {
            unlockHeart();
        }
    };

    /**
     * Handles the unlocking animation and screen transition.
     */
    const unlockHeart = () => {
        if (isUnlocked) return;
        isUnlocked = true;
        isDragging = false;

        lockedHeart.classList.add('unlocked');
        keyIcon.style.opacity = '0';

        setTimeout(() => {
            transitionScreen(introScreen, mainScreen);
        }, 1200);
    };
    
    /**
     * Initializes the universe exploration screen.
     */
    const initUniverse = () => {
        let scale = 1;
        let panX = 0, panY = 0;
        let isPanning = false, lastPanX, lastPanY;
        let lastTouchDistance = 0;
        let heartRevealed = false;
        
        spaceElements.innerHTML = '';
        for (let i = 0; i < 200; i++) {
            const star = document.createElement('div');
            star.className = 'space-element star';
            const size = Math.random() * 3 + 1;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${Math.random() * 150 - 25}%`; // Spread stars wider
            star.style.top = `${Math.random() * 150 - 25}%`;
            spaceElements.appendChild(star);
        }

        const updateTransform = () => {
            spaceElements.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
        };

        const startPan = (e) => {
            isPanning = true;
            universeContainer.style.cursor = 'grabbing';
            lastPanX = e.touches ? e.touches[0].clientX : e.clientX;
            lastPanY = e.touches ? e.touches[0].clientY : e.clientY;
        };

        const movePan = (e) => {
            if (!isPanning) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            panX += clientX - lastPanX;
            panY += clientY - lastPanY;
            lastPanX = clientX;
            lastPanY = clientY;
            updateTransform();
        };

        const stopPan = () => {
            isPanning = false;
            universeContainer.style.cursor = 'grab';
        };

        const handleZoom = (e) => {
            e.preventDefault();
            scale += e.deltaY * -0.001; // For mouse wheel
            scale = Math.min(Math.max(0.1, scale), 2);
            updateTransform();
            if (scale < 0.25 && !heartRevealed) revealHeart();
        };

        const handleTouchZoom = (e) => {
            if (e.touches.length !== 2) return;
            const currentDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const scaleChange = currentDistance / lastTouchDistance;
            scale *= scaleChange;
            scale = Math.min(Math.max(0.1, scale), 2);
            updateTransform();
            lastTouchDistance = currentDistance;
            if (scale < 0.25 && !heartRevealed) revealHeart();
        };

        const touchStart = (e) => {
            if (e.touches.length === 1) startPan(e);
            else if (e.touches.length === 2) {
                isPanning = false;
                lastTouchDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
            }
        };

        const revealHeart = () => {
            heartRevealed = true;
            heartUniverse.classList.add('visible');

            // Start the final sequence
            setTimeout(() => {
                transitionScreen(universeScreen, messageScreen);
                
                // After message is shown, trigger explosion and final screen
                setTimeout(() => {
                    const explosion = document.createElement('div');
                    explosion.className = 'explosion';
                    messageScreen.appendChild(explosion);

                    setTimeout(() => {
                        finalMessage.textContent = 'Seni seviyorum Rüya';
                        transitionScreen(messageScreen, finalScreen);
                        explosion.remove(); // Clean up the explosion element
                    }, 1000); // Wait for explosion animation

                }, 2500); // Time for user to read the message

            }, 2000); // Time for user to see the heart universe
        };
        
        // --- Universe Event Listeners ---
        universeContainer.addEventListener('mousedown', startPan);
        universeContainer.addEventListener('mousemove', movePan);
        universeContainer.addEventListener('mouseup', stopPan);
        universeContainer.addEventListener('mouseleave', stopPan);
        universeContainer.addEventListener('wheel', handleZoom, { passive: false });
        universeContainer.addEventListener('touchstart', touchStart, { passive: false });
        universeContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length === 1 && isPanning) movePan(e);
            else if (e.touches.length === 2) handleTouchZoom(e);
        }, { passive: false });
        universeContainer.addEventListener('touchend', stopPan);
    };

    // --- Initial Event Listeners ---
    keyIcon.addEventListener('mousedown', startDrag);
    keyIcon.addEventListener('touchstart', startDrag, { passive: false });

    okButton.addEventListener('click', () => {
        transitionScreen(mainScreen, universeScreen);
        initUniverse();
    });
});
